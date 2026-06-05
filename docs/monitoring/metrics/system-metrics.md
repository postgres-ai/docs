---
title: Database- and cluster-level metrics
sidebar_label: Database- and cluster-level
sidebar_position: 6
---

# Database- and cluster-level metrics

PostgreSQL system-level metrics. In this stack they are exported by the `db_stats`, `bgwriter`,
`archive_lag` / `pg_archiver`, `pg_stat_replication`, and `settings` metric groups, with the
`pgwatch_` prefix and the source column name (no `_total`/`_seconds` suffix convention).

## Data sources

| Metric group | Underlying view | Description |
|--------------|-----------------|-------------|
| `db_stats` | `pg_stat_database` | Database-level aggregates (`pgwatch_db_stats_*`) |
| `bgwriter` | `pg_stat_bgwriter` | Background writer statistics (`pgwatch_bgwriter_*`) |
| `archive_lag` / `pg_archiver` | `pg_stat_archiver` | WAL archiver status |
| `pg_stat_replication` | `pg_stat_replication` | Replication status |
| `settings` | `pg_settings` | Configuration parameters (`pgwatch_settings_*`) |

## Database metrics

### Transaction metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_db_stats_xact_commit` | Gauge | Transactions committed |
| `pgwatch_db_stats_xact_rollback` | Gauge | Transactions rolled back |
| `pgwatch_db_stats_deadlocks` | Gauge | Deadlocks detected |
| `pgwatch_db_stats_conflicts` | Gauge | Recovery conflicts (replicas) |

### Connection metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_db_stats_numbackends` | Gauge | Active connections |
| `pgwatch_settings_numeric_value{setting_name="max_connections"}` | Gauge | Maximum allowed connections (from the `settings` metric; there is no `pgwatch_settings_max_connections` series) |

### Buffer metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_db_stats_blks_read` | Gauge | Blocks read from disk |
| `pgwatch_db_stats_blks_hit` | Gauge | Blocks found in buffer cache |

### Temporary file metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_db_stats_temp_files` | Gauge | Temporary files created |
| `pgwatch_db_stats_temp_bytes` | Gauge | Temporary file bytes written |

## Background writer metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_bgwriter_checkpoints_timed` | Counter | Scheduled checkpoints |
| `pgwatch_bgwriter_checkpoints_req` | Counter | Requested checkpoints |
| `pgwatch_bgwriter_checkpoint_write_time` | Counter | Checkpoint write time (ms) |
| `pgwatch_bgwriter_checkpoint_sync_time` | Counter | Checkpoint sync time (ms) |
| `pgwatch_bgwriter_buffers_checkpoint` | Counter | Buffers written during checkpoints |
| `pgwatch_bgwriter_buffers_clean` | Counter | Buffers written by background writer |
| `pgwatch_bgwriter_buffers_backend` | Counter | Buffers written by backends |
| `pgwatch_bgwriter_buffers_alloc` | Counter | Buffers allocated |

## WAL archiver metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_archive_lag_archived_count` | Gauge | WAL files archived |
| `pgwatch_archive_lag_failed_count` | Gauge | Failed archive attempts |
| `pgwatch_archive_lag_seconds_since_archive` | Gauge | Seconds since last successful archive |
| `pgwatch_archive_lag_wal_files_behind` | Gauge | WAL files behind the latest segment |

## WAL directory size

New in 0.15, the collector reports the total size of the `pg_wal` directory using
`pg_ls_waldir()`. This is the on-disk WAL size, which complements the archiver and replication
metrics for diagnosing disk-fill risk.

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_pg_wal_size_bytes` | Gauge | Total size of regular files in `pg_wal` (excludes subdirectories like `pg_wal/archive_status`) |
| `pgwatch_pg_wal_size_status_code` | Gauge | Collection status: `0` = success, `1` = `pg_ls_waldir()` unavailable, `2` = monitoring role lacks EXECUTE privilege |

`pg_wal` growth that is **not** matched by archive or replica progress is a disk-fill warning —
typically a stuck WAL archiver, an inactive replication slot retaining WAL, or sustained high
WAL generation. Correlate `pgwatch_pg_wal_size_bytes` with the `pgwatch_archive_lag_*` and
replication-slot metrics, and see
[How to troubleshoot a growing pg_wal directory](/docs/postgres-howtos/database-administration/maintenance/how-to-troubleshoot-a-growing-pg-wal-directory).

```promql
# Alert when pg_wal exceeds, e.g., 20 GiB while archiving is failing
pgwatch_pg_wal_size_bytes > 20 * 1024 * 1024 * 1024
```

## Replication metrics

LSN positions come from the `pg_stat_replication` group; lag is reported in `replication_*_lag_ms`
/ `_lag_b` fields. There is no `pg_replication_lag_seconds` series.

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_pg_stat_replication_sent_lsn` | Gauge | WAL sent to replica |
| `pgwatch_pg_stat_replication_write_lsn` | Gauge | WAL written on replica |
| `pgwatch_pg_stat_replication_flush_lsn` | Gauge | WAL flushed on replica |
| `pgwatch_pg_stat_replication_replay_lsn` | Gauge | WAL replayed on replica |

## Labels

The cluster label is `cluster` (not `cluster_name`).

| Label | Description | Example |
|-------|-------------|---------|
| `datname` | Database name | `myapp` |
| `cluster` | Cluster identifier (from `custom_tags.cluster`) | `production` |
| `node_name` | Node identifier | `primary` |

## Common queries

### Transactions per second

```promql
sum(rate(pgwatch_db_stats_xact_commit[5m]))
```

### Rollback ratio

```promql
rate(pgwatch_db_stats_xact_rollback[5m])
/
(rate(pgwatch_db_stats_xact_commit[5m]) + rate(pgwatch_db_stats_xact_rollback[5m]))
```

### Buffer cache hit ratio

```promql
sum(rate(pgwatch_db_stats_blks_hit[5m]))
/
(sum(rate(pgwatch_db_stats_blks_hit[5m])) + sum(rate(pgwatch_db_stats_blks_read[5m])))
```

### Connection utilization

```promql
sum(pgwatch_db_stats_numbackends)
/
scalar(max(pgwatch_settings_numeric_value{setting_name="max_connections"}))
```

### Checkpoint frequency

```promql
rate(pgwatch_bgwriter_checkpoints_timed[5m])
+
rate(pgwatch_bgwriter_checkpoints_req[5m])
```

### Backend buffer writes (problematic)

High values indicate checkpoint tuning needed:

```promql
rate(pgwatch_bgwriter_buffers_backend[5m])
/
(
  rate(pgwatch_bgwriter_buffers_checkpoint[5m])
  +
  rate(pgwatch_bgwriter_buffers_clean[5m])
  +
  rate(pgwatch_bgwriter_buffers_backend[5m])
)
```

### WAL archive status

```promql
pgwatch_archive_lag_seconds_since_archive
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
