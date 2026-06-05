---
title: Metrics reference
sidebar_label: Overview
sidebar_position: 1
---

# Metrics reference

Reference documentation for all metrics collected by PostgresAI monitoring.

## Metric sources

PostgresAI monitoring collects metrics from multiple PostgreSQL sources:

| pgwatch metric group | Underlying view(s) | Dashboard usage |
|----------------------|--------------------|-----------------|
| `pg_stat_statements` | `pg_stat_statements` | 02, 03 |
| `pg_stat_activity` / `wait_events` | `pg_stat_activity` | 01, 04 |
| `table_stats` / `pg_stat_all_tables` | `pg_stat_all_tables` | 07, 08, 09 |
| `pg_stat_all_indexes` / `pg_statio_all_indexes` | `pg_stat_all_indexes`, `pg_statio_all_indexes` | 10, 11 |
| `pg_stat_replication` / `replication` | `pg_stat_replication` | 06 |
| `bgwriter` | `pg_stat_bgwriter` | 01 |
| `db_stats` | `pg_stat_database` | 01 |

## Metric naming convention

pgwatch exports each series as:

```
pgwatch_{metric-group}_{column}
```

Examples (these are the names you query in VictoriaMetrics/Grafana):
- `pgwatch_pg_stat_statements_calls` — query calls (no `_total` suffix)
- `pgwatch_pg_stat_activity_count` — session count
- `pgwatch_pg_stat_all_tables_seq_tup_read` — tuples read by sequential scans
- `pgwatch_db_stats_xact_commit` — transactions committed

There is no `pg_{source}_{metric_name}` naming in this stack; all series carry the `pgwatch_`
prefix and use the column name (not a `_total`/`_seconds` suffix convention).

## Collection intervals

Intervals are set per metric group in `config/pgwatch-prometheus/metrics.yml` (the `full` preset).
Representative defaults:

| Metric group | Default interval |
|--------------|------------------|
| `pg_stat_activity`, `wait_events` | 15s |
| `pg_stat_statements` | 30s |
| `table_stats`, `pg_stat_all_tables`, `pg_stat_all_indexes` | 30s |
| `db_stats`, `bgwriter`, `replication` | 30s |
| `settings` | 300s |
| Bloat groups (`pg_table_bloat`, `pg_btree_bloat`) | 7200s |

## Metric categories

### [pg_stat_statements metrics](/docs/monitoring/metrics/pg-stat-statements)

Query performance metrics including:
- Execution counts and timing
- Row counts
- Buffer usage
- Planning time

### [Wait event metrics](/docs/monitoring/metrics/wait-events)

Active session history data:
- Wait event types and categories
- Session state distribution
- Lock wait analysis

### [Table metrics](/docs/monitoring/metrics/table-metrics)

Table-level statistics:
- Sequential vs index scans
- Dead tuple counts
- HOT update ratios
- Table sizes

### [Index metrics](/docs/monitoring/metrics/index-metrics)

Index usage and health:
- Scan counts
- Tuple reads
- Index sizes
- Bloat estimates

### [System metrics](/docs/monitoring/metrics/system-metrics)

PostgreSQL system-level metrics:
- Connection counts
- Transaction rates
- Checkpoint activity
- Buffer cache statistics

## Prometheus/VictoriaMetrics queries

All metrics are stored in VictoriaMetrics (Prometheus-compatible). Example queries:

### Rate calculations

```promql
# Queries per second
rate(pgwatch_pg_stat_statements_calls[5m])

# Transactions per second
rate(pgwatch_db_stats_xact_commit[5m])
```

### Aggregations

```promql
# Active sessions across all databases (the activity metric carries a `state` label)
sum(pgwatch_pg_stat_activity_count{state="active"})

# Average exec time per call by database. There is no mean_exec_time series;
# derive it from the cumulative exec_time_total (ms) and calls counters.
sum by (datname) (rate(pgwatch_pg_stat_statements_exec_time_total[5m]))
/
sum by (datname) (rate(pgwatch_pg_stat_statements_calls[5m]))
```

## Related documentation

- [Dashboard overview](/docs/monitoring/dashboards) — How metrics are visualized
- [Getting started](/docs/monitoring/getting-started) — Installation and setup
