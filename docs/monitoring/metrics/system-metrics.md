---
title: Database- and cluster-level metrics
sidebar_label: Database- and cluster-level
sidebar_position: 6
---

# Database- and cluster-level metrics

PostgreSQL system-level metrics from various `pg_stat_*` views.

## Data sources

| View | Description |
|------|-------------|
| `pg_stat_database` | Database-level aggregates |
| `pg_stat_bgwriter` | Background writer statistics |
| `pg_stat_archiver` | WAL archiver status |
| `pg_stat_replication` | Replication status |
| `pg_settings` | Configuration parameters |

## Database metrics

### Transaction metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_database_xact_commit_total` | Counter | Transactions committed |
| `pg_stat_database_xact_rollback_total` | Counter | Transactions rolled back |
| `pg_stat_database_deadlocks_total` | Counter | Deadlocks detected |
| `pg_stat_database_conflicts_total` | Counter | Recovery conflicts (replicas) |

### Connection metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_database_numbackends` | Gauge | Active connections |
| `pg_settings_max_connections` | Gauge | Maximum allowed connections |

### Buffer metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_database_blks_read_total` | Counter | Blocks read from disk |
| `pg_stat_database_blks_hit_total` | Counter | Blocks found in buffer cache |

### Temporary file metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_database_temp_files_total` | Counter | Temporary files created |
| `pg_stat_database_temp_bytes_total` | Counter | Temporary file bytes written |

## Background writer metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_bgwriter_checkpoints_timed_total` | Counter | Scheduled checkpoints |
| `pg_stat_bgwriter_checkpoints_req_total` | Counter | Requested checkpoints |
| `pg_stat_bgwriter_checkpoint_write_time_seconds_total` | Counter | Checkpoint write time |
| `pg_stat_bgwriter_checkpoint_sync_time_seconds_total` | Counter | Checkpoint sync time |
| `pg_stat_bgwriter_buffers_checkpoint_total` | Counter | Buffers written during checkpoints |
| `pg_stat_bgwriter_buffers_clean_total` | Counter | Buffers written by background writer |
| `pg_stat_bgwriter_buffers_backend_total` | Counter | Buffers written by backends |
| `pg_stat_bgwriter_buffers_alloc_total` | Counter | Buffers allocated |

## WAL archiver metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_archiver_archived_count_total` | Counter | WAL files archived |
| `pg_stat_archiver_failed_count_total` | Counter | Failed archive attempts |
| `pg_stat_archiver_last_archived_time` | Gauge | Last successful archive timestamp |

## Replication metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_replication_sent_lsn` | Gauge | WAL sent to replica |
| `pg_stat_replication_write_lsn` | Gauge | WAL written on replica |
| `pg_stat_replication_flush_lsn` | Gauge | WAL flushed on replica |
| `pg_stat_replication_replay_lsn` | Gauge | WAL replayed on replica |
| `pg_replication_lag_bytes` | Gauge | Replication lag in bytes |
| `pg_replication_lag_seconds` | Gauge | Estimated replication lag |

## Labels

| Label | Description | Example |
|-------|-------------|---------|
| `datname` | Database name | `myapp` |
| `cluster_name` | Cluster identifier | `production` |
| `node_name` | Node identifier | `primary` |

## Common queries

### Transactions per second

```promql
sum(rate(pg_stat_database_xact_commit_total[5m]))
```

### Rollback ratio

```promql
rate(pg_stat_database_xact_rollback_total[5m])
/
(rate(pg_stat_database_xact_commit_total[5m]) + rate(pg_stat_database_xact_rollback_total[5m]))
```

### Buffer cache hit ratio

```promql
sum(rate(pg_stat_database_blks_hit_total[5m]))
/
(sum(rate(pg_stat_database_blks_hit_total[5m])) + sum(rate(pg_stat_database_blks_read_total[5m])))
```

### Connection utilization

```promql
sum(pg_stat_database_numbackends)
/
pg_settings_max_connections
```

### Checkpoint frequency

```promql
rate(pg_stat_bgwriter_checkpoints_timed_total[5m])
+
rate(pg_stat_bgwriter_checkpoints_req_total[5m])
```

### Backend buffer writes (problematic)

High values indicate checkpoint tuning needed:

```promql
rate(pg_stat_bgwriter_buffers_backend_total[5m])
/
(
  rate(pg_stat_bgwriter_buffers_checkpoint_total[5m])
  +
  rate(pg_stat_bgwriter_buffers_clean_total[5m])
  +
  rate(pg_stat_bgwriter_buffers_backend_total[5m])
)
```

### Replication lag

```promql
pg_replication_lag_seconds
```

### WAL archive status

```promql
time() - pg_stat_archiver_last_archived_time
```

## Dashboard usage

These metrics are used in:

- [01. Node overview](/docs/monitoring/dashboards/node-overview) — TPS, sessions, buffer hit ratio
- [05. Backups](/docs/monitoring/dashboards/backups) — WAL archiving
- [06. Replication](/docs/monitoring/dashboards/replication) — Replication lag

## Interpreting system metrics

### Buffer cache hit ratio

Target: > 99% for frequently accessed data

```sql
select
  datname,
  blks_hit,
  blks_read,
  round(100.0 * blks_hit / nullif(blks_hit + blks_read, 0), 2) as hit_ratio
from pg_stat_database
where datname not like 'template%';
```

Low hit ratio causes:
- `shared_buffers` too small
- Working set larger than memory
- Cold cache after restart

### Checkpoint behavior

Healthy checkpoint pattern:
- Mostly timed checkpoints (scheduled)
- Low requested checkpoints (forced by WAL volume)
- Minimal backend buffer writes

```sql
select
  checkpoints_timed,
  checkpoints_req,
  buffers_checkpoint,
  buffers_clean,
  buffers_backend
from pg_stat_bgwriter;
```

### Temporary files

High temporary file usage indicates:
- `work_mem` too low
- Complex queries with large sorts/joins
- Hash joins spilling to disk

```sql
select
  datname,
  temp_files,
  pg_size_pretty(temp_bytes) as temp_size
from pg_stat_database
where temp_files > 0;
```

## Troubleshooting

### Metrics show zero after restart

Background writer and database statistics reset on restart. This is expected.

### Replication lag metrics missing

Verify:
1. Replication is configured and active
2. Monitoring connects to primary (not replica)
3. `pg_stat_replication` is accessible:
   ```sql
   select * from pg_stat_replication;
   ```

### Connection count doesn't match application

`numbackends` includes:
- Application connections
- Monitoring connections
- Superuser reserved connections
- Replication connections

Check `pg_stat_activity` for breakdown:
```sql
select backend_type, count(*)
from pg_stat_activity
group by backend_type;
```

## Related metrics

- [pg_stat_statements](/docs/monitoring/metrics/pg-stat-statements) — Query-level detail
- [Wait events](/docs/monitoring/metrics/wait-events) — Session state analysis
