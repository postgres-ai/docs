---
title: Metrics reference
sidebar_label: Overview
sidebar_position: 1
---

# Metrics reference

Reference documentation for all metrics collected by PostgresAI monitoring.

## Metric sources

PostgresAI monitoring collects metrics from multiple PostgreSQL sources:

| Source | Description | Dashboard usage |
|--------|-------------|-----------------|
| `pg_stat_statements` | Query-level performance metrics | 02, 03 |
| `pg_stat_activity` | Session and wait event data | 01, 04 |
| `pg_stat_user_tables` | Table-level statistics | 07, 08, 09 |
| `pg_stat_user_indexes` | Index usage statistics | 10, 11 |
| `pg_stat_replication` | Replication metrics | 06 |
| `pg_stat_bgwriter` | Background writer stats | 01 |
| `pg_stat_database` | Database-level aggregates | 01 |

## Metric naming convention

All metrics follow the pattern:

```
pg_{source}_{metric_name}
```

Examples:
- `pg_stat_statements_calls_total` — Total query calls
- `pg_stat_activity_count` — Active session count
- `pg_stat_user_tables_seq_scan_total` — Sequential scans

## Collection intervals

| Metric type | Default interval | Configurable |
|-------------|------------------|--------------|
| Session metrics | 10s | Yes |
| Query metrics | 60s | Yes |
| Table/index metrics | 60s | Yes |
| Replication metrics | 10s | Yes |

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
rate(pg_stat_statements_calls_total[5m])

# Transactions per second
rate(pg_stat_database_xact_commit_total[5m])
```

### Aggregations

```promql
# Total active sessions across all databases
sum(pg_stat_activity_count{state="active"})

# Average query time by database
avg by (datname) (pg_stat_statements_mean_exec_time_seconds)
```

## Related documentation

- [Dashboard overview](/docs/monitoring/dashboards) — How metrics are visualized
- [Getting started](/docs/monitoring/getting-started) — Installation and setup
