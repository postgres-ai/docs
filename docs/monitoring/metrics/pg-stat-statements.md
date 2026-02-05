---
title: pg_stat_statements metrics
sidebar_label: pg_stat_statements
sidebar_position: 2
---

# pg_stat_statements metrics

Query-level performance metrics from the `pg_stat_statements` extension.

## Prerequisites

The `pg_stat_statements` extension must be installed and configured:

```sql
-- Check if installed
select * from pg_extension where extname = 'pg_stat_statements';

-- Install if missing
create extension if not exists pg_stat_statements;
```

Required `postgresql.conf` settings:

```ini
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = 'all'
pg_stat_statements.max = 10000
```

## Core metrics

### Execution metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_statements_calls_total` | Counter | Total number of query executions |
| `pg_stat_statements_total_exec_time_seconds` | Counter | Total execution time |
| `pg_stat_statements_mean_exec_time_seconds` | Gauge | Average execution time per call |
| `pg_stat_statements_rows_total` | Counter | Total rows returned or affected |

### Planning metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_statements_total_plan_time_seconds` | Counter | Total planning time |
| `pg_stat_statements_mean_plan_time_seconds` | Gauge | Average planning time per call |

### Buffer metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_statements_shared_blks_hit_total` | Counter | Shared buffer hits |
| `pg_stat_statements_shared_blks_read_total` | Counter | Shared blocks read from disk |
| `pg_stat_statements_shared_blks_written_total` | Counter | Shared blocks written |
| `pg_stat_statements_shared_blks_dirtied_total` | Counter | Shared blocks dirtied |

### I/O timing metrics

Available when `track_io_timing = on`:

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_statements_blk_read_time_seconds` | Counter | Time spent reading blocks |
| `pg_stat_statements_blk_write_time_seconds` | Counter | Time spent writing blocks |

### WAL metrics

PostgreSQL 13+:

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_statements_wal_records_total` | Counter | WAL records generated |
| `pg_stat_statements_wal_bytes_total` | Counter | WAL bytes generated |

## Labels

All pg_stat_statements metrics include these labels:

| Label | Description | Example |
|-------|-------------|---------|
| `queryid` | Unique query identifier | `-4021163671685...` |
| `datname` | Database name | `myapp` |
| `usename` | User name | `app_user` |
| `cluster_name` | Cluster identifier | `production` |
| `node_name` | Node identifier | `primary` |

## Common queries

### Top queries by total time

```promql
topk(10,
  sum by (queryid, datname) (
    rate(pg_stat_statements_total_exec_time_seconds[5m])
  )
)
```

### Query call rate

```promql
sum by (queryid) (
  rate(pg_stat_statements_calls_total[5m])
)
```

### Average query latency

```promql
pg_stat_statements_mean_exec_time_seconds
```

### Buffer hit ratio per query

```promql
sum by (queryid) (rate(pg_stat_statements_shared_blks_hit_total[5m]))
/
(
  sum by (queryid) (rate(pg_stat_statements_shared_blks_hit_total[5m]))
  +
  sum by (queryid) (rate(pg_stat_statements_shared_blks_read_total[5m]))
)
```

### Queries with high planning time ratio

```promql
pg_stat_statements_mean_plan_time_seconds
/
(pg_stat_statements_mean_plan_time_seconds + pg_stat_statements_mean_exec_time_seconds)
> 0.1
```

## Dashboard usage

These metrics are used in:

- [02. Query analysis](/docs/monitoring/dashboards/query-analysis) — Top-N queries
- [03. Single query](/docs/monitoring/dashboards/single-query) — Query deep-dive

## Troubleshooting

### Metrics show zero or missing

1. Verify extension is loaded:
   ```sql
   select * from pg_stat_statements limit 1;
   ```

2. Check `pg_stat_statements.track` setting:
   ```sql
   show pg_stat_statements.track;
   ```

3. Ensure monitoring user has access:
   ```sql
   grant pg_read_all_stats to postgres_ai_mon;
   ```

### queryid changes after PostgreSQL upgrade

The `queryid` hash algorithm may change between major PostgreSQL versions. This is expected behavior — historical data with old queryids will appear as different queries.

### High memory usage from pg_stat_statements

Reduce `pg_stat_statements.max` if memory is constrained:

```sql
-- Check current usage
select count(*) from pg_stat_statements;

-- Reduce max entries (requires restart)
-- postgresql.conf: pg_stat_statements.max = 5000
```

## Related metrics

- [Wait events](/docs/monitoring/metrics/wait-events) — What queries are waiting on
- [Table metrics](/docs/monitoring/metrics/table-metrics) — Table access patterns
