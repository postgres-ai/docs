---
title: "Data source: RDS/Aurora refresh"
sidebar_label: "RDS/Aurora refresh"
---

:::note
This component was added in DBLab Engine 4.1.
:::

The RDS/Aurora refresh tool provides an alternative approach to refreshing DBLab data from Amazon RDS and Aurora databases. Instead of running `pg_dump` directly against production, it dumps from a **temporary RDS clone**, leaving production untouched.

## Why use this approach?

Running `pg_dump` directly against a production database can be problematic:
- **Holds xmin horizon for hours** leading to bloat accumulation
- **Creates load on production** for the duration of the dump
- **Requires direct network access** to the production database

The RDS/Aurora refresh tool avoids all of these issues:

```
Production --> RDS Snapshot --> RDS Clone --> pg_dump --> DBLab
  (automated)                  (temporary)
```

## Quick start

### 1. Configure

Create a configuration file:

```yaml
source:
  type: rds                    # or "aurora-cluster"
  identifier: my-prod-db
  dbName: postgres
  username: postgres
  password: ${DB_PASSWORD}

clone:
  instanceClass: db.t3.medium
  securityGroups: [sg-xxx]     # must allow DBLab inbound

dblab:
  apiEndpoint: https://dblab:2345
  token: ${DBLAB_TOKEN}

aws:
  region: us-east-1
```

### 2. Test

```bash
docker run --rm \
  -v $PWD/config.yaml:/config.yaml \
  -e DB_PASSWORD -e DBLAB_TOKEN -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY \
  postgresai/rds-refresh -config /config.yaml -dry-run
```

### 3. Run

```bash
docker run --rm \
  -v $PWD/config.yaml:/config.yaml \
  -e DB_PASSWORD -e DBLAB_TOKEN -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY \
  postgresai/rds-refresh -config /config.yaml
```

## Configuration reference

| Field | Required | Description |
|-------|----------|-------------|
| `source.type` | Yes | `rds` or `aurora-cluster` |
| `source.identifier` | Yes | RDS instance or Aurora cluster identifier |
| `source.dbName` | Yes | Database name |
| `source.username` | Yes | Database user |
| `source.password` | Yes | Password (supports `${ENV_VAR}` syntax) |
| `source.snapshotIdentifier` | No | Specific snapshot ID to use; if empty, uses latest automated snapshot |
| `clone.instanceClass` | Yes | RDS clone instance type (e.g., `db.t3.medium`) |
| `clone.securityGroups` | No | Security groups allowing DBLab access |
| `clone.subnetGroup` | No | DB subnet group |
| `clone.parameterGroup` | No | RDS parameter group name |
| `clone.optionGroup` | No | RDS option group name (RDS instances only) |
| `clone.clusterParameterGroup` | No | Cluster parameter group (Aurora only) |
| `clone.publiclyAccessible` | No | Make clone publicly accessible (default: `false`) |
| `clone.enableIAMAuth` | No | Enable IAM database authentication (default: `false`) |
| `clone.storageType` | No | Storage type: `gp2`, `gp3`, `io1`, `io2` |
| `clone.deletionProtection` | No | Enable deletion protection on clone (default: `false`) |
| `clone.port` | No | Custom port for the clone (default: RDS default) |
| `clone.tags` | No | Additional tags (key-value map) for the RDS clone |
| `clone.maxAge` | No | Max age before clone is considered stale (default: `48h`) |
| `dblab.apiEndpoint` | Yes | DBLab API URL |
| `dblab.token` | Yes | DBLab verification token |
| `dblab.insecure` | No | Skip TLS certificate verification (default: `false`) |
| `dblab.pollInterval` | No | Status polling interval (default: `30s`) |
| `dblab.timeout` | No | Max refresh wait (default: `4h`) |
| `aws.region` | Yes | AWS region |

## IAM policy

The AWS user or role running the tool needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBSnapshots",
        "rds:DescribeDBClusterSnapshots",
        "rds:DescribeDBInstances",
        "rds:DescribeDBClusters"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "rds:RestoreDBInstanceFromDBSnapshot",
        "rds:RestoreDBClusterFromSnapshot",
        "rds:CreateDBInstance",
        "rds:DeleteDBInstance",
        "rds:DeleteDBCluster",
        "rds:AddTagsToResource",
        "rds:ModifyDBInstance",
        "rds:ModifyDBCluster"
      ],
      "Resource": [
        "arn:aws:rds:*:ACCOUNT:db:dblab-refresh-*",
        "arn:aws:rds:*:ACCOUNT:cluster:dblab-refresh-*",
        "arn:aws:rds:*:ACCOUNT:snapshot:*",
        "arn:aws:rds:*:ACCOUNT:cluster-snapshot:*",
        "arn:aws:rds:*:ACCOUNT:subgrp:*",
        "arn:aws:rds:*:ACCOUNT:pg:*"
      ]
    }
  ]
}
```

Replace `ACCOUNT` with your AWS account ID.

## DBLab setup

DBLab must run in **logical mode**. The tool updates config via API (no SSH required).

```yaml
retrieval:
  refresh:
    timetable: ""  # disable built-in scheduler — rds-refresh handles timing
  jobs: [logicalDump, logicalRestore, logicalSnapshot]
  spec:
    logicalDump:
      options:
        source:
          connection:
            host: placeholder  # updated by rds-refresh
            port: 5432
```

## Scheduling

### Cron (weekly, Sunday 2 AM)

```bash
0 2 * * 0 docker run --rm -v /etc/dblab/config.yaml:/config.yaml \
  --env-file /etc/dblab/env postgresai/rds-refresh -config /config.yaml
```

### Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: dblab-refresh
spec:
  schedule: "0 2 * * 0"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: dblab-refresh  # IRSA
          containers:
          - name: refresh
            image: postgresai/rds-refresh
            args: ["-config", "/config/config.yaml"]
            envFrom:
            - secretRef:
                name: dblab-refresh-secrets
            volumeMounts:
            - name: config
              mountPath: /config
          volumes:
          - name: config
            configMap:
              name: dblab-refresh-config
          restartPolicy: Never
```

## How it works

1. **Startup cleanup**: check for orphaned clones from previous runs
2. Check DBLab health
3. Find latest RDS snapshot
4. Create RDS clone from RDS snapshot (`dblab-refresh-YYYYMMDD-HHMMSS`)
5. Wait for RDS clone to become available (~15 min)
6. Update DBLab config via API to point to the temporary clone
7. Trigger refresh, wait for completion
8. Delete RDS clone (always, even on error)

## Orphan protection

The tool has multiple layers of protection against orphaned RDS clones:

1. **Defer cleanup**: clone is deleted when process exits normally
2. **Signal handlers**: catches SIGINT, SIGTERM, SIGHUP (SSH disconnect)
3. **State file**: tracks active clone in `./meta/rds-refresh.state`
4. **Tag scan**: finds clones by `ManagedBy=dblab-rds-refresh` tag

### Manual cleanup

```bash
# Dry run — see what would be deleted
rds-refresh cleanup -config config.yaml -dry-run

# Delete stale clones older than 24 hours
rds-refresh cleanup -config config.yaml -max-age 24h
```

## Networking

The RDS clone must be reachable from DBLab on port 5432. Use the same VPC or VPC peering.

## Cost

RDS clone cost is only incurred while running (~2-5 hours):
- `db.t3.medium`: ~$0.35
- `db.r5.large`: ~$1.20

## Related
- [Data source: AWS RDS (direct)](/docs/dblab-howtos/administration/data/rds)
- [Logical full refresh](/docs/dblab-howtos/administration/logical-full-refresh)
