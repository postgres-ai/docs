---
title: Table metrics
sidebar_label: Table metrics
sidebar_position: 4
---

# Table metrics

Table-level statistics. In this stack they come from the `table_stats` metric group, whose query
reads **`pg_stat_all_tables`** (not `pg_stat_user_tables`). Series are exported as
`pgwatch_table_stats_<column>`.

## Data sources

| Metric group | Underlying view | Description |
|--------------|-----------------|-------------|
| `table_stats` | `pg_stat_all_tables` | Table access, modification, tuple, vacuum, and size stats |
| `pg_class` | `pg_class` | Table sizes (`pgwatch_pg_class_*`) |
| `db_size` | – | Database size (`pgwatch_db_size_size_b`) |

## Core metrics

All series are `pgwatch_table_stats_<column>`. There are no `_total` suffixes and no
`pg_statio_user_tables_*` / `pg_table_size_bytes` series.

### Access metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_table_stats_seq_scan` | Counter | Sequential scans initiated |
| `pgwatch_table_stats_seq_tup_read` | Counter | Rows fetched by sequential scans |
| `pgwatch_table_stats_idx_scan` | Counter | Index scans initiated |
| `pgwatch_table_stats_idx_tup_fetch` | Counter | Rows fetched by index scans |

### Modification metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_table_stats_n_tup_ins` | Counter | Rows inserted |
| `pgwatch_table_stats_n_tup_upd` | Counter | Rows updated |
| `pgwatch_table_stats_n_tup_del` | Counter | Rows deleted |
| `pgwatch_table_stats_n_tup_hot_upd` | Counter | HOT updates (heap-only tuple) |

### Tuple metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_table_stats_n_live_tup` | Gauge | Estimated live rows |
| `pgwatch_table_stats_n_dead_tup` | Gauge | Estimated dead rows |

### Vacuum metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_table_stats_seconds_since_last_vacuum` | Gauge | Seconds since last (auto)vacuum |
| `pgwatch_table_stats_seconds_since_last_analyze` | Gauge | Seconds since last (auto)analyze |
| `pgwatch_table_stats_vacuum_count` | Counter | Manual vacuum count |
| `pgwatch_table_stats_autovacuum_count` | Counter | Autovacuum count |
| `pgwatch_table_stats_analyze_count` | Counter | Manual analyze count |
| `pgwatch_table_stats_autoanalyze_count` | Counter | Autoanalyze count |

### Size metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_table_stats_table_size_b` | Gauge | Table size in bytes (excluding indexes) |
| `pgwatch_table_stats_total_relation_size_b` | Gauge | Total size (table + indexes + toast) |
| `pgwatch_table_stats_toast_size_b` | Gauge | TOAST size in bytes |

### Freeze-age metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_table_stats_tx_freeze_age` | Counter | Transaction-id freeze age |
| `pgwatch_table_stats_mxid_freeze_age` | Counter | Multixact-id freeze age |

## Labels

The `table_stats` metric is grouped by schema and table, so it carries these labels (plus the
instance labels). Note the names are `schema` / `table_name` / `table_full_name` (not
`schemaname` / `relname`), and the cluster label is `cluster` (not `cluster_name`).

| Label | Description | Example |
|-------|-------------|---------|
| `table_name` | Table name | `users` |
| `table_full_name` | Schema-qualified table name | `public.users` |
| `schema` | Schema name | `public` |
| `datname` | Database name | `myapp` |
| `cluster` | Cluster identifier (from `custom_tags.cluster`) | `production` |
| `node_name` | Node identifier | `primary` |

## Common queries

### Sequential scan ratio

```promql
rate(pgwatch_table_stats_seq_scan[5m])
/
(
  rate(pgwatch_table_stats_seq_scan[5m])
  +
  rate(pgwatch_table_stats_idx_scan[5m])
)
```

### Tables with high dead tuple ratio

```promql
pgwatch_table_stats_n_dead_tup
/
(pgwatch_table_stats_n_live_tup + pgwatch_table_stats_n_dead_tup)
> 0.1
```

### HOT update ratio

```promql
rate(pgwatch_table_stats_n_tup_hot_upd[5m])
/
rate(pgwatch_table_stats_n_tup_upd[5m])
```

### Tables not vacuumed recently

```promql
pgwatch_table_stats_seconds_since_last_vacuum > 86400
```

### Largest tables

```promql
topk(10, pgwatch_table_stats_total_relation_size_b)
```

### Write-heavy tables

```promql
topk(10,
  rate(pgwatch_table_stats_n_tup_ins[5m])
  +
  rate(pgwatch_table_stats_n_tup_upd[5m])
  +
  rate(pgwatch_table_stats_n_tup_del[5m])
)
```

## Dashboard usage

These metrics are used in:

- [07. Autovacuum](/docs/monitoring/dashboards/autovacuum) — Vacuum and bloat
- [08. Table stats](/docs/monitoring/dashboards/table-stats) — Table overview
- [09. Single table](/docs/monitoring/dashboards/single-table) — Table deep-dive

## Interpreting metrics

### Sequential vs index scans

High sequential scan rate on large tables suggests missing indexes:

```sql
select
  schemaname,
  relname,
  seq_scan,
  idx_scan,
  pg_size_pretty(pg_relation_size(relid)) as size
from pg_stat_user_tables
where seq_scan > idx_scan
  and pg_relation_size(relid) > 10000000
order by seq_scan desc;
```

### Dead tuple accumulation

Dead tuples indicate rows deleted/updated but not yet vacuumed:

```sql
select
  relname,
  n_live_tup,
  n_dead_tup,
  round(100.0 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 1) as dead_pct,
  last_autovacuum
from pg_stat_user_tables
where n_dead_tup > 1000
order by n_dead_tup desc;
```

### HOT update efficiency

HOT updates avoid index updates — higher ratio is better:

```sql
select
  relname,
  n_tup_upd,
  n_tup_hot_upd,
  round(100.0 * n_tup_hot_upd / nullif(n_tup_upd, 0), 1) as hot_pct
from pg_stat_user_tables
where n_tup_upd > 1000
order by n_tup_upd desc;
```

## Troubleshooting

### Metrics show stale values

Table statistics are cumulative since last stats reset:

```sql
select stats_reset from pg_stat_database where datname = current_database();
```

### Size metrics not matching disk

`pg_table_size` excludes TOAST and indexes. Use `pg_total_relation_size` for complete size.

### Missing tables in metrics

Verify tables are in user schemas (not system catalogs):

```sql
select relname from pg_stat_user_tables where schemaname = 'public';
```

## Related metrics

- [Index metrics](/docs/monitoring/metrics/index-metrics) — Index-level statistics
- [pg_stat_statements](/docs/monitoring/metrics/pg-stat-statements) — Query patterns
