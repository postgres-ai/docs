---
title: Multi-cluster monitoring
sidebar_label: Multi-cluster
sidebar_position: 2
---

# Multi-cluster monitoring

Centralized monitoring for multiple PostgreSQL clusters from a single Grafana instance.

## Architecture options

### Option 1: Single pgwatch, multiple targets

Best for: 5-20 clusters in the same network

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Cluster A  │     │  Cluster B  │     │  Cluster C  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │   pgwatch   │
                    └──────┬──────┘
                           │
                    ┌──────▼────────┐
                    │VictoriaMetrics│
                    └──────┬────────┘
                           │
                    ┌──────▼──────┐
                    │   Grafana   │
                    └─────────────┘
```

### Option 2: Distributed pgwatch, central storage

Best for: Clusters in different networks/regions

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Cluster A  │     │  Cluster B  │     │  Cluster C  │
│  + pgwatch  │     │  + pgwatch  │     │  + pgwatch  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │ remote_write
                    ┌──────▼────────┐
                    │VictoriaMetrics│
                    │  (central)    │
                    └──────┬────────┘
                           │
                    ┌──────▼──────┐
                    │   Grafana   │
                    └─────────────┘
```

## Configuration

### Adding multiple clusters

**docker-compose.yml approach:**

```yaml
services:
  pgwatch:
    environment:
      # Use environment variable substitution for credentials
      PW_TARGETS: |
        postgresql://${PGWATCH_USER}:${PGWATCH_PASSWORD}@cluster-a:5432/postgres?cluster_name=cluster-a
        postgresql://${PGWATCH_USER}:${PGWATCH_PASSWORD}@cluster-b:5432/postgres?cluster_name=cluster-b
        postgresql://${PGWATCH_USER}:${PGWATCH_PASSWORD}@cluster-c:5432/postgres?cluster_name=cluster-c
```

:::tip Security
Define `PGWATCH_USER` and `PGWATCH_PASSWORD` in your `.env` file or use Docker secrets for production deployments.
:::

**CLI approach:**

```bash
# Add clusters one at a time
postgresai mon add-target \
  --cluster-name "production-us" \
  postgresql://user@prod-us:5432/postgres

postgresai mon add-target \
  --cluster-name "production-eu" \
  postgresql://user@prod-eu:5432/postgres
```

### Cluster naming conventions

Use consistent, descriptive names:

| Pattern | Example | Use case |
|---------|---------|----------|
| env-region | production-us-east | Multi-region |
| app-env | orders-prod | Per-application |
| team-purpose | platform-analytics | Per-team |

```bash
# Good
--cluster-name="production-us-east-1"

# Avoid - too generic
--cluster-name="db1"
```

## Distributed collection

### Remote write configuration

Each pgwatch instance writes to central VictoriaMetrics:

```yaml
# pgwatch config at each site
remote_write:
  url: https://central-vm.example.com/api/v1/write
  basic_auth:
    username: pgwatch
    password: ${REMOTE_WRITE_PASSWORD}  # Use environment variable
  tls_config:
    insecure_skip_verify: false
```

:::warning Security
Never commit plaintext passwords. Use environment variables or a secrets manager.
:::

### Authentication

Use unique credentials per pgwatch instance:

```yaml
# Central VictoriaMetrics
basic_auth_users:
  - username: pgwatch-us-east
    password: <BCRYPT_HASH>  # Generate with: htpasswd -nbB pgwatch-us-east <password>
  - username: pgwatch-eu-west
    password: <BCRYPT_HASH>
```

### Network considerations

| Requirement | Configuration |
|-------------|---------------|
| Firewall | Allow outbound 8428 from pgwatch |
| TLS | Use HTTPS for remote write |
| Compression | Enable gzip (`remote_write.compress: true`) |
| Buffering | Configure local queue for network failures |

## Label strategy

### Required labels

Every metric should include:

| Label | Purpose | Example |
|-------|---------|---------|
| cluster_name | Primary identifier | `production-us` |
| node_name | Primary/replica distinction | `primary`, `replica-1` |
| datname | Database name | `orders` |

### Optional labels

| Label | Purpose | Example |
|-------|---------|---------|
| region | Geographic region | `us-east-1` |
| environment | env classification | `production`, `staging` |
| team | Ownership | `platform` |

### Adding external labels

```yaml
# pgwatch config
external_labels:
  region: us-east-1
  environment: production
  team: platform
```

## Dashboard configuration

### Cluster selector variable

All dashboards include a `cluster_name` variable:

```yaml
# Variable definition
name: cluster_name
query: label_values(pg_stat_database_xact_commit_total, cluster_name)
multi: true
include_all: true
```

### Cross-cluster queries

**Compare metrics across clusters:**

```promql
# TPS comparison
sum by (cluster_name) (
  rate(pg_stat_database_xact_commit_total[5m])
)
```

**Alert on any cluster:**

```promql
# Alert if any cluster has high connection usage
max by (cluster_name) (
  pg_stat_database_numbackends / pg_settings_max_connections
) > 0.8
```

### Cluster overview dashboard

Create a dashboard showing all clusters:

```promql
# Cluster health summary
# Status: 1 = healthy, 0 = issues

(
  # Connection health
  (pg_stat_database_numbackends / pg_settings_max_connections < 0.8)
  and
  # Recent activity
  (time() - pg_stat_database_stats_reset < 3600)
)
# Note: For replication health, create a separate alert:
# pg_replication_lag_seconds > 60
```

## High availability

### Redundant pgwatch

Run multiple pgwatch instances for HA:

```yaml
services:
  pgwatch-1:
    environment:
      PW_INSTANCE_ID: pgwatch-1
      PW_HA_MODE: active-passive
      PW_HA_PEERS: pgwatch-1:8080,pgwatch-2:8080

  pgwatch-2:
    environment:
      PW_INSTANCE_ID: pgwatch-2
      PW_HA_MODE: active-passive
      PW_HA_PEERS: pgwatch-1:8080,pgwatch-2:8080
```

### VictoriaMetrics cluster

For large deployments, use VictoriaMetrics cluster mode:

```yaml
services:
  vmstorage-1:
    image: victoriametrics/vmstorage
  vmstorage-2:
    image: victoriametrics/vmstorage

  vminsert:
    image: victoriametrics/vminsert
    command:
      - -storageNode=vmstorage-1:8400,vmstorage-2:8400
      - -replicationFactor=2

  vmselect:
    image: victoriametrics/vmselect
    command:
      - -storageNode=vmstorage-1:8401,vmstorage-2:8401
```

## Scaling considerations

### Metrics volume

| Clusters | Estimated metrics/sec | VictoriaMetrics RAM |
|----------|----------------------|---------------------|
| 1-5 | 100-500 | 2 GiB |
| 5-20 | 500-2000 | 4 GiB |
| 20-50 | 2000-5000 | 8 GiB |
| 50+ | 5000+ | 16 GiB+ |

### Storage planning

```
Storage per cluster = (metrics/sec) × 4 bytes × retention_seconds  # VictoriaMetrics compressed

Example: 10 clusters, 30-day retention
= 10 × 100 × 100 × 30 × 86400
= ~260 GiB
```

## Troubleshooting

### Cluster not appearing

1. Check pgwatch logs for connection errors
2. Verify cluster_name is set in connection string
3. Check VictoriaMetrics is receiving data:
   ```bash
   curl 'http://localhost:8428/api/v1/query?query=up{cluster_name="missing-cluster"}'
   ```

### Mixed-up metrics

Symptoms: Metrics from one cluster appearing under another

Cause: Duplicate cluster_name labels

Solution: Ensure unique cluster_name per connection:
```bash
grep -r "cluster_name" /etc/pgwatch/
```

### High latency for remote clusters

1. Enable compression:
   ```yaml
   remote_write:
     compress: true
   ```

2. Increase batch size:
   ```yaml
   remote_write:
     queue_config:
       max_samples_per_send: 5000
   ```

3. Consider regional VictoriaMetrics instances with federation
