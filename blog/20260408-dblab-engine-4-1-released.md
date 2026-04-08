---
authors: [nik, bogdan]
date: 2026-04-08 00:00:00
publishDate: 2026-04-08 00:00:00
linktitle: "DBLab 4.1: protection leases, Teleport, Prometheus, and more"
title: "DBLab 4.1: protection leases, Teleport, Prometheus, and more"
weight: 0
image: /assets/thumbnails/dblab-4.0-blog.png
tags:
  - Product announcements
  - DBLab Engine
  - Database Lab Engine
---

import { BlogFooter } from '@site/src/components/BlogFooter'
import { nik } from '@site/src/config/authors'

A team of 40 engineers, each spinning up database clones for feature branches, CI runs, and ad hoc experiments. A few of those clones get marked as "protected" because someone is mid-investigation. Then the investigation ends, the engineer moves on, and the clone stays -- protected, idle, and quietly eating disk for weeks.

DBLab Engine 4.1 fixes this and much more. This release is about making database branching not just fast and cheap, but safe to operate at scale -- with automatic resource governance, enterprise access control, production-safe data refresh, and native observability.

<!--truncate-->

## Protection leases

Protected clones were a safety mechanism: mark a clone as protected and DBLab won't delete it, even during idle cleanup. The problem? Engineers protect clones and forget about them. In large teams, this becomes a real operational burden -- somebody has to periodically audit which protected clones are still needed.

DBLab 4.1 introduces **protection leases**: time-limited protection that expires automatically.

### A real scenario

Your CI pipeline creates a clone to test a migration, marks it protected so nobody destroys it mid-run, and sets a 2-hour lease:

```bash
dblab clone create \
  --branch main \
  --id ci-migration-test-4521 \
  --protected 120 \
  --username postgres \
  --password "$CI_DB_PASSWORD"
```

Two hours later, the CI job is done. The lease expires, protection is lifted, and DBLab's idle cleanup reclaims the clone automatically. No human intervention needed.

The `--protected` flag accepts several forms:
- `--protected true` -- use the server's default lease duration
- `--protected 120` -- protect for exactly 120 minutes
- `--protected 0` -- protect forever (capped by `protectionMaxDurationMinutes` if configured)
- `--protected false` -- remove protection from an existing clone

### What happens when a lease expires

A background checker runs every 5 minutes. When it finds an expired lease:

1. Protection is lifted (`protected: false`, `protectedTill: null`)
2. A `clone_protection_expired` webhook fires
3. The clone becomes subject to normal idle cleanup

If the clone is still actively receiving queries, idle cleanup won't touch it. Protection leases only affect the *protection status* -- they don't force-destroy anything.

Before expiration, DBLab sends a `clone_protection_expiring` warning webhook. Connect it to Slack or PagerDuty so the clone owner can extend the lease if they're still working:

```bash
# Extend protection for another 24 hours
dblab clone update ci-migration-test-4521 --protected 1440
```

### Server configuration

Three options in the `cloning` section:

```yaml
cloning:
  # Default lease when --protected is used without a duration
  protectionLeaseDurationMinutes: 1440      # 24 hours

  # Hard cap -- no clone can exceed this, regardless of what the user requests
  protectionMaxDurationMinutes: 10080       # 7 days

  # Fire a warning webhook this many minutes before expiry
  protectionExpiryWarningMinutes: 1440      # 24 hours before
```

If a user requests 30 days but `protectionMaxDurationMinutes` is 7 days, the lease is silently capped at 7 days. This gives platform teams a hard guarantee: no clone stays protected longer than one week.

### API

The protection fields are available through the REST API as well:

```json
POST /clones
{
  "id": "my-clone",
  "protected": true,
  "protectionDurationMinutes": 120,
  "db": { "username": "postgres", "password": "secret" },
  "branch": "main"
}
```

The response includes a `protectedTill` timestamp and `metadata` with the server's lease configuration, so clients always know when protection will expire.

## Database rename

When you clone a production database, the clone keeps the production name -- `myapp_production`, `analytics_prod`, etc. This creates a class of bugs where application code accidentally connects to the wrong database because the name matches production config.

DBLab 4.1 adds `databaseRename`: rename databases during snapshot creation so every clone gets sanitized names from the start.

```yaml
retrieval:
  spec:
    physicalSnapshot:
      options:
        databaseRename:
          myapp_production: myapp
          analytics_prod: analytics
```

Under the hood, DBLab spins up a temporary container after restoring data and runs:

```sql
ALTER DATABASE "myapp_production" RENAME TO "myapp";
ALTER DATABASE "analytics_prod" RENAME TO "analytics";
```

This happens once, at snapshot time. Every clone created from that snapshot already has the correct names -- no post-processing needed.

### Validation

DBLab validates rename rules before executing anything:

- Names must be valid PostgreSQL identifiers (start with a letter or underscore, contain only letters, digits, underscores, hyphens)
- You can't rename the connection database (typically `postgres`)
- No self-renames (`mydb` -> `mydb`)
- No duplicate targets (`db1` -> `target`, `db2` -> `target`)
- No chained renames (`a` -> `b`, `b` -> `c`) that would create ambiguity

Misconfigurations fail at snapshot time with clear error messages, not silently at clone creation.

### When to use this

- **Application config**: Use the same database name (`myapp`) in dev, staging, and CI -- no environment-specific overrides
- **Safety**: Eliminate accidental cross-environment connections when names differ
- **Compliance**: Remove production identifiers from non-production data

## ARM64 and Colima: DBLab on your Mac

DBLab Engine now runs on Apple Silicon. If you have an M-series Mac, you can run full database branching locally using [Colima](https://github.com/abiosoft/colima) -- no cloud VM needed.

### Setup

```bash
# 1. Start Colima with enough resources
colima start --cpu 4 --memory 8 --disk 60

# 2. Set up ZFS inside the Colima VM
colima ssh < engine/scripts/init-zfs-colima.sh
```

The init script installs `zfsutils-linux`, creates a 5 GB virtual disk, sets up a ZFS pool (`dblab_pool`), and creates datasets. Then build the ARM64 images:

```bash
# 3. Build DBLab server for ARM64
cd engine
GOOS=linux GOARCH=arm64 make build
make build-image

# 4. Build a PostgreSQL image for ARM64
docker build -f Dockerfile.dblab-postgres-arm64 \
  --platform linux/arm64 \
  -t dblab-postgres:17-arm64 .
```

Start the server:

```bash
# 5. Run DBLab
docker run -d --name dblab-server \
  --privileged \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/lib/dblab:/var/lib/dblab:rshared \
  -v /var/lib/docker:/var/lib/docker \
  -v /var/lib/dblab/configs:/home/dblab/configs \
  -p 2345:2345 \
  dblab_server:local
```

The `:rshared` mount propagation flag is important -- it ensures ZFS clones are visible inside child containers.

### Why this matters

Most developers already have the hardware. Running DBLab locally means you can experiment with database branching on a plane, in a secure facility, or without waiting for IT to provision a cloud VM. For teams evaluating DBLab, the barrier to entry is now `colima start` and a few commands.

See the full [macOS setup guide](/docs/dblab-howtos/administration/run-database-lab-on-mac) for detailed instructions including Supabase integration.

## Teleport integration

For teams that use [Teleport](https://goteleport.com/) for infrastructure access control, DBLab 4.1 adds native integration. Every clone automatically appears as a Teleport database resource. When the clone is destroyed, the resource is removed.

### How it works

DBLab ships a sidecar process that bridges the two systems via webhooks:

```
Developer ─── tsh db connect ──► Teleport Proxy ──► DB Agent ──► DBLab Clone
                                                        ↑
DBLab Engine ── clone_create webhook ──► Sidecar ── tctl create ──► Teleport Auth
```

When a clone is created, DBLab fires a webhook. The sidecar (`dblab teleport serve`) registers the clone as a Teleport resource:

```yaml
kind: db
version: v3
metadata:
  name: "dblab-clone-production-abc123-6000"
  labels:
    dblab: "true"
    environment: "production"
    clone_id: "abc123"
spec:
  protocol: postgres
  uri: "127.0.0.1:6000"
```

When the clone is deleted, the sidecar runs `tctl rm` to clean up. If the sidecar restarts, it reconciles any missed events every 5 minutes -- comparing the list of active clones in DBLab against registered Teleport resources.

### Certificate auth out of the box

DBLab 4.1 includes a new default `pg_hba.conf` for clones:

```
local   all all trust
hostssl all all 0.0.0.0/0 cert
host    all all 0.0.0.0/0 md5
```

The `hostssl ... cert` rule enables Teleport's certificate-based authentication without requiring custom PostgreSQL configuration.

### Running the sidecar

```bash
dblab teleport serve \
  --environment-id production \
  --teleport-proxy teleport.example.com:3025 \
  --teleport-identity /etc/teleport/dblab-identity \
  --listen-addr 0.0.0.0:9876 \
  --dblab-url http://localhost:2345 \
  --dblab-token "$DBLAB_TOKEN" \
  --webhook-secret "$WEBHOOK_SECRET"
```

Configure DBLab to send webhooks to the sidecar:

```yaml
webhooks:
  hooks:
    - url: "http://host.docker.internal:9876/teleport-sync"
      secret: "your-webhook-secret"
      trigger:
        - clone_create
        - clone_delete
```

Engineers connect through Teleport as they would with any other database:

```bash
tsh db connect dblab-clone-production-abc123-6000 \
  --db-user postgres --db-name myapp
```

### Why this matters

In regulated environments -- finance, healthcare, government -- every database connection must be auditable. Teleport integration means DBLab clones inherit your existing access policies, role-based permissions, and session recording. Ephemeral database clones are no longer a gap in your security posture.

:::note
Teleport integration requires Standard Edition (SE) or Enterprise Edition (EE).
:::

## RDS/Aurora logical refresh without touching production

Running `pg_dump` against a production RDS instance is a well-known antipattern. The dump holds an `xmin` horizon for hours, preventing vacuum from reclaiming dead tuples. The result: bloat accumulation, degraded query performance, and in severe cases, transaction ID wraparound risk.

DBLab 4.1 ships `rds-refresh`, a standalone tool that gets production data into DBLab without ever connecting to the primary.

### The approach

```
Production ──► RDS automated snapshot ──► Temporary RDS clone ──► pg_dump ──► DBLab
                                                  │
                                             (auto-deleted)
```

The tool finds the latest automated RDS snapshot, creates a temporary RDS instance from it, dumps from that temporary instance, feeds the data into DBLab, and deletes the temporary instance. The production database is never touched.

```bash
docker run --rm \
  -v $PWD/config.yaml:/config.yaml \
  -e DB_PASSWORD -e DBLAB_TOKEN \
  -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY \
  postgresai/rds-refresh -config /config.yaml
```

### Configuration

```yaml
source:
  type: rds                         # or "aurora-cluster"
  identifier: production-db
  dbName: myapp
  username: postgres
  password: ${DB_PASSWORD}

clone:
  instanceClass: db.t3.medium       # small instance is fine -- it's only for pg_dump
  securityGroups:
    - sg-0123456789abcdef0
  publiclyAccessible: false
  enableIAMAuth: true

dblab:
  apiEndpoint: https://dblab.internal:2345
  token: ${DBLAB_TOKEN}
  pollInterval: 30s
  timeout: 4h
```

### Orphan protection

The biggest risk with this approach is orphaned RDS instances: if the process crashes mid-refresh, you're left paying for an idle RDS instance. `rds-refresh` has five layers of protection:

1. **Defer cleanup** -- the temporary instance is always deleted on normal exit
2. **Signal handlers** -- SIGINT, SIGTERM, SIGHUP all trigger cleanup
3. **State file** -- `./meta/rds-refresh.state` tracks the active instance for crash recovery
4. **AWS tag scanning** -- orphaned instances are tagged `ManagedBy=dblab-rds-refresh` and can be found by tag
5. **Manual cleanup** -- `rds-refresh cleanup --max-age 48h` finds and removes stale instances

You can also run in dry-run mode to validate your configuration without creating anything:

```bash
docker run --rm \
  -v $PWD/config.yaml:/config.yaml \
  -e DB_PASSWORD -e DBLAB_TOKEN \
  -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY \
  postgresai/rds-refresh -config /config.yaml -dry-run
```

### Cost

The temporary RDS instance typically runs for 2-5 hours. Using `db.t3.medium`, that's about $0.35-$1.20 per refresh -- a small price for avoiding production impact entirely.

Schedule it with cron, Kubernetes CronJob, or ECS Scheduled Task for automatic nightly refreshes.

## Prometheus metrics exporter

DBLab 4.1 exposes a `/metrics` endpoint in Prometheus format. No authentication, no custom integration, no third-party plugin -- just add it to your scrape config:

```yaml
scrape_configs:
  - job_name: 'dblab'
    static_configs:
      - targets: ['dblab.internal:2345']
    metrics_path: /metrics
```

### What you can monitor

**Disk pressure** -- the most common operational concern:
```promql
# Free disk space percentage
100 * dblab_disk_free_bytes{pool="dblab_pool"} / dblab_disk_total_bytes{pool="dblab_pool"}

# ZFS compression ratio
dblab_disk_compress_ratio{pool="dblab_pool"}
```

**Clone sprawl** -- how many clones are running and how heavy they are:
```promql
# Total active clones
dblab_clones_total

# CPU and memory across all clones
dblab_clone_total_cpu_usage_percent
dblab_clone_total_memory_usage_bytes

# How many clones are protected
dblab_clone_protected_count
```

**Data freshness** -- is your snapshot current:
```promql
# Snapshot age in hours
dblab_snapshot_max_data_lag_seconds / 3600

# WAL replay lag for physical mode
dblab_sync_wal_lag_seconds
```

### Ready-to-use alerts

```yaml
# Alert when disk drops below 20%
- alert: DBLabLowDiskSpace
  expr: (dblab_disk_free_bytes / dblab_disk_total_bytes) * 100 < 20
  for: 5m
  annotations:
    summary: "DBLab pool {{ $labels.pool }} has less than 20% free disk"

# Alert when snapshots are stale
- alert: DBLabStaleSnapshot
  expr: dblab_snapshot_max_data_lag_seconds > 86400
  for: 10m
  annotations:
    summary: "DBLab snapshot data is more than 24 hours old"

# Alert when sync instance falls behind (physical mode)
- alert: DBLabHighWALLag
  expr: dblab_sync_wal_lag_seconds > 3600
  for: 10m
  annotations:
    summary: "WAL replay lag is {{ $value | humanizeDuration }} behind"
```

### OpenTelemetry

Not using Prometheus? DBLab includes an [OpenTelemetry Collector configuration](https://github.com/postgres-ai/database-lab-engine/blob/master/engine/configs/otel-collector.example.yml) that exports to Grafana Cloud, Datadog, New Relic, AWS CloudWatch, or any OTLP-compatible backend.

## What's in each edition

| Feature | CE (open source) | SE | EE |
|---------|:-:|:-:|:-:|
| Protection leases | + | + | + |
| Database rename | + | + | + |
| ARM64 / Colima | + | + | + |
| Prometheus exporter | + | + | + |
| RDS/Aurora safe refresh | + | + | + |
| Teleport integration | | + | + |

## Get started

1. **Try the demo**: [demo.dblab.dev](https://demo.dblab.dev) (token: `demo-token`)
2. **Deploy DBLab SE**: [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec) or [Postgres.ai Console](https://console.postgres.ai)
3. **Install open source**: [How-to](https://postgres.ai/docs/dblab-howtos/administration/install-dle-manually)
4. **macOS setup**: [Run DBLab on Mac](/docs/dblab-howtos/administration/run-database-lab-on-mac)
5. **Enterprise**: Contact [team@postgres.ai](mailto:team@postgres.ai) for DBLab EE

---

DBLab 4.0 made database branching instant. DBLab 4.1 makes it something you can hand off to a platform team and trust to run itself: protection leases keep resources in check, Teleport keeps access auditable, Prometheus keeps you informed, and `rds-refresh` keeps data fresh without risking production. All of it on top of the [O(1) economics](/blog/20250721-dblab-engine-4-0-released) that make DBLab unique.

[Get Started](https://postgres.ai/docs/database-lab) | [GitHub](https://github.com/postgres-ai/database-lab-engine) | [Join our Slack](https://slack.postgres.ai)

<BlogFooter author={nik} />
