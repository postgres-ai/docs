---
title: Table metrics
sidebar_label: Table metrics
sidebar_position: 4
---

# Table metrics

Table-level statistics from `pg_stat_user_tables` and related views.

## Data sources

| View | Description |
|------|-------------|
| `pg_stat_user_tables` | Table access statistics |
| `pg_statio_user_tables` | Table I/O statistics |
| `pg_class` | Table sizes and properties |

## Core metrics

### Access metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_user_tables_seq_scan_total` | Counter | Sequential scans initiated |
| `pg_stat_user_tables_seq_tup_read_total` | Counter | Rows fetched by sequential scans |
| `pg_stat_user_tables_idx_scan_total` | Counter | Index scans initiated |
| `pg_stat_user_tables_idx_tup_fetch_total` | Counter | Rows fetched by index scans |

### Modification metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_user_tables_n_tup_ins_total` | Counter | Rows inserted |
| `pg_stat_user_tables_n_tup_upd_total` | Counter | Rows updated |
| `pg_stat_user_tables_n_tup_del_total` | Counter | Rows deleted |
| `pg_stat_user_tables_n_tup_hot_upd_total` | Counter | HOT updates (heap-only tuple) |

### Tuple metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_user_tables_n_live_tup` | Gauge | Estimated live rows |
| `pg_stat_user_tables_n_dead_tup` | Gauge | Estimated dead rows |
| `pg_stat_user_tables_n_mod_since_analyze` | Gauge | Rows modified since last analyze |

### Vacuum metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_user_tables_last_vacuum` | Gauge | Timestamp of last manual vacuum |
| `pg_stat_user_tables_last_autovacuum` | Gauge | Timestamp of last autovacuum |
| `pg_stat_user_tables_last_analyze` | Gauge | Timestamp of last manual analyze |
| `pg_stat_user_tables_last_autoanalyze` | Gauge | Timestamp of last autoanalyze |
| `pg_stat_user_tables_vacuum_count_total` | Counter | Manual vacuum count |
| `pg_stat_user_tables_autovacuum_count_total` | Counter | Autovacuum count |

### Size metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_table_size_bytes` | Gauge | Table size (excluding indexes) |
| `pg_total_relation_size_bytes` | Gauge | Total size (table + indexes + toast) |
| `pg_indexes_size_bytes` | Gauge | Total index size for table |

### I/O metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_statio_user_tables_heap_blks_read_total` | Counter | Heap blocks read from disk |
| `pg_statio_user_tables_heap_blks_hit_total` | Counter | Heap blocks hit in buffer cache |
| `pg_statio_user_tables_idx_blks_read_total` | Counter | Index blocks read from disk |
| `pg_statio_user_tables_idx_blks_hit_total` | Counter | Index blocks hit in buffer cache |

## Labels

| Label | Description | Example |
|-------|-------------|---------|
| `relname` | Table name | `users` |
| `schemaname` | Schema name | `public` |
| `datname` | Database name | `myapp` |
| `cluster_name` | Cluster identifier | `production` |
| `node_name` | Node identifier | `primary` |

## Common queries

### Sequential scan ratio

```promql
rate(pg_stat_user_tables_seq_scan_total[5m])
/
(
  rate(pg_stat_user_tables_seq_scan_total[5m])
  +
  rate(pg_stat_user_tables_idx_scan_total[5m])
)
```

### Tables with high dead tuple ratio

```promql
pg_stat_user_tables_n_dead_tup
/
(pg_stat_user_tables_n_live_tup + pg_stat_user_tables_n_dead_tup)
> 0.1
```

### HOT update ratio

```promql
rate(pg_stat_user_tables_n_tup_hot_upd_total[5m])
/
rate(pg_stat_user_tables_n_tup_upd_total[5m])
```

### Tables not vacuumed recently

```promql
time() - pg_stat_user_tables_last_autovacuum > 86400
```

### Buffer hit ratio per table

```promql
rate(pg_statio_user_tables_heap_blks_hit_total[5m])
/
(
  rate(pg_statio_user_tables_heap_blks_hit_total[5m])
  +
  rate(pg_statio_user_tables_heap_blks_read_total[5m])
)
```

### Largest tables

```promql
topk(10, pg_total_relation_size_bytes)
```

### Write-heavy tables

```promql
topk(10,
  rate(pg_stat_user_tables_n_tup_ins_total[5m])
  +
  rate(pg_stat_user_tables_n_tup_upd_total[5m])
  +
  rate(pg_stat_user_tables_n_tup_del_total[5m])
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
