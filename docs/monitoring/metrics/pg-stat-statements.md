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

## Collection scope

Since 0.17, the `pg_stat_statements` metric is collected **cluster-wide**: one query reads the
statistics of every non-template database in the cluster, whichever database pgwatch connects to.
Earlier versions reported only the connected database, so activity in other databases was invisible
unless each one was a separate target.

- Each database keeps its own top 100 queries (by total execution time, among queries with at least
  3 calls and 1 second of total execution time), labeled with `datname`. The number of series
  therefore grows with the number of databases.
- The bundled dashboards still show only the connected database. Their database selector lists
  the databases that report `pgwatch_db_size_size_b`, and the `db_size` metric covers only the
  connected one, so the query panels of dashboards 01, 02, 03, and 05 filter the other databases
  out. To see a database there, give it its own target; to see its collected series without one,
  use Grafana Explore or [`postgresai promql`](/docs/reference-guides/postgresai-cli-reference#command-promql)
  with a `datname` selector.
- Query texts are not cluster-wide. The `pgss_queryid_queries` metric, which supplies the query
  text shown in the dashboards and reports, still reads only the connected database. Keep a target
  per database whose query texts you need.
- The monitoring role needs `pg_read_all_stats` to see other roles' queries; without it,
  PostgreSQL hides their `queryid` and text. `pg_monitor` includes it, and `prepare-db` grants both.

## Core metrics

All series are exported as `pgwatch_pg_stat_statements_<column>`. Times are in **milliseconds**
(not seconds), buffer usage is reported in **bytes** (not blocks), and counters do **not** carry a
`_total` suffix unless the column name itself ends in `_total`. There are no `mean_*` series.

### Execution metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_pg_stat_statements_calls` | Gauge | Number of query executions |
| `pgwatch_pg_stat_statements_exec_time_total` | Gauge | Total execution time (ms) |
| `pgwatch_pg_stat_statements_rows` | Gauge | Rows returned or affected |

### Planning metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_pg_stat_statements_plans_total` | Gauge | Number of times the statement was planned |
| `pgwatch_pg_stat_statements_plan_time_total` | Gauge | Total planning time (ms) |

### Buffer metrics (bytes)

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_pg_stat_statements_shared_bytes_hit_total` | Gauge | Shared buffer hits (bytes) |
| `pgwatch_pg_stat_statements_shared_bytes_read_total` | Gauge | Shared bytes read from disk |
| `pgwatch_pg_stat_statements_shared_bytes_written_total` | Gauge | Shared bytes written |
| `pgwatch_pg_stat_statements_shared_bytes_dirtied_total` | Gauge | Shared bytes dirtied |

### Block I/O timing metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_pg_stat_statements_block_read_total` | Gauge | Block read time (ms) |
| `pgwatch_pg_stat_statements_block_write_total` | Gauge | Block write time (ms) |

### WAL metrics

PostgreSQL 13+:

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_pg_stat_statements_wal_records` | Gauge | WAL records generated |
| `pgwatch_pg_stat_statements_wal_fpi` | Gauge | WAL full-page images |
| `pgwatch_pg_stat_statements_wal_bytes` | Gauge | WAL bytes generated |

### Temp I/O metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_pg_stat_statements_temp_bytes_read` | Gauge | Temp bytes read |
| `pgwatch_pg_stat_statements_temp_bytes_written` | Gauge | Temp bytes written |

## Labels

The `pg_stat_statements` metric is grouped only by database and query id, so it carries these
labels (plus the instance labels):

| Label | Description | Example |
|-------|-------------|---------|
| `queryid` | Unique query identifier | `-4021163671685...` |
| `datname` | Database name | `myapp` |
| `cluster` | Cluster identifier (from `custom_tags.cluster`) | `production` |
| `node_name` | Node identifier | `primary` |

There is no `usename` label on `pg_stat_statements` metrics, and the cluster label is `cluster`
(not `cluster_name`).

## Common queries

### Top queries by total time

```promql
topk(10,
  sum by (queryid, datname) (
    rate(pgwatch_pg_stat_statements_exec_time_total[5m])
  )
)
```

### Query call rate

```promql
sum by (queryid) (
  rate(pgwatch_pg_stat_statements_calls[5m])
)
```

### Average query latency (ms per call)

There is no mean series; derive it from the cumulative `exec_time_total` (ms) and `calls`:

```promql
sum by (queryid) (rate(pgwatch_pg_stat_statements_exec_time_total[5m]))
/
sum by (queryid) (rate(pgwatch_pg_stat_statements_calls[5m]))
```

### Buffer hit ratio per query (bytes)

```promql
sum by (queryid) (rate(pgwatch_pg_stat_statements_shared_bytes_hit_total[5m]))
/
(
  sum by (queryid) (rate(pgwatch_pg_stat_statements_shared_bytes_hit_total[5m]))
  +
  sum by (queryid) (rate(pgwatch_pg_stat_statements_shared_bytes_read_total[5m]))
)
```

### Queries with high planning time ratio

```promql
rate(pgwatch_pg_stat_statements_plan_time_total[5m])
/
(rate(pgwatch_pg_stat_statements_plan_time_total[5m]) + rate(pgwatch_pg_stat_statements_exec_time_total[5m]))
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

3. Ensure the monitoring user has access. The product requires the built-in `pg_monitor` role,
   which includes `pg_read_all_stats` (since 0.17, `prepare-db` also grants `pg_read_all_stats`
   explicitly):
   ```sql
   grant pg_monitor to postgres_ai_mon;
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
