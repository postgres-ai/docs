---
title: Index metrics
sidebar_label: Index metrics
sidebar_position: 5
---

# Index metrics

Index usage and health metrics from `pg_stat_user_indexes` and related views.

## Data sources

| View | Description |
|------|-------------|
| `pg_stat_user_indexes` | Index usage statistics |
| `pg_statio_user_indexes` | Index I/O statistics |
| `pg_indexes` | Index definitions |
| `pg_class` | Index sizes |

## Core metrics

### Usage metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_user_indexes_idx_scan_total` | Counter | Index scans initiated |
| `pg_stat_user_indexes_idx_tup_read_total` | Counter | Index entries read |
| `pg_stat_user_indexes_idx_tup_fetch_total` | Counter | Table rows fetched via index |

### Size metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_index_size_bytes` | Gauge | Index size in bytes |

### I/O metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_statio_user_indexes_idx_blks_read_total` | Counter | Index blocks read from disk |
| `pg_statio_user_indexes_idx_blks_hit_total` | Counter | Index blocks hit in buffer cache |

## Labels

| Label | Description | Example |
|-------|-------------|---------|
| `indexrelname` | Index name | `users_email_idx` |
| `relname` | Parent table name | `users` |
| `schemaname` | Schema name | `public` |
| `datname` | Database name | `myapp` |
| `cluster_name` | Cluster identifier | `production` |
| `node_name` | Node identifier | `primary` |

## Common queries

### Unused indexes

```promql
pg_stat_user_indexes_idx_scan_total == 0
```

### Index scan rate

```promql
rate(pg_stat_user_indexes_idx_scan_total[5m])
```

### Index buffer hit ratio

```promql
rate(pg_statio_user_indexes_idx_blks_hit_total[5m])
/
(
  rate(pg_statio_user_indexes_idx_blks_hit_total[5m])
  +
  rate(pg_statio_user_indexes_idx_blks_read_total[5m])
)
```

### Largest indexes

```promql
topk(10, pg_index_size_bytes)
```

### Index read efficiency

Ratio of tuples fetched vs tuples read from index:

```promql
rate(pg_stat_user_indexes_idx_tup_fetch_total[5m])
/
rate(pg_stat_user_indexes_idx_tup_read_total[5m])
```

### Most active indexes

```promql
topk(10, rate(pg_stat_user_indexes_idx_scan_total[5m]))
```

## Dashboard usage

These metrics are used in:

- [10. Index health](/docs/monitoring/dashboards/index-health) — Index overview
- [11. Single index](/docs/monitoring/dashboards/single-index) — Index deep-dive

## Index analysis queries

### Find unused indexes

```sql
select
  schemaname,
  relname as table_name,
  indexrelname as index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan as scan_count
from pg_stat_user_indexes
where idx_scan = 0
  and indexrelname not like '%_pkey'
order by pg_relation_size(indexrelid) desc;
```

### Find duplicate indexes

```sql
select
  indrelid::regclass as table_name,
  array_agg(indexrelid::regclass) as duplicate_indexes
from pg_index
group by indrelid, indkey
having count(*) > 1;
```

### Index usage per table

```sql
select
  relname as table_name,
  indexrelname as index_name,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
from pg_stat_user_indexes
where relname = 'your_table'
order by idx_scan desc;
```

### Index bloat estimation

Using `pgstattuple` extension:

```sql
create extension if not exists pgstattuple;

select
  indexrelname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  round(100 - (avg_leaf_density)) as bloat_pct
from pg_stat_user_indexes
cross join lateral pgstatindex(indexrelid)
where pg_relation_size(indexrelid) > 10000000
order by bloat_pct desc
limit 20;
```

## Index types and metrics

### B-tree indexes

Standard index type — metrics cover scan frequency and tuple access:
- `idx_scan` — Number of index scans
- `idx_tup_read` — Index entries returned
- `idx_tup_fetch` — Heap rows fetched

### Partial indexes

Indexes with WHERE clause — may show lower scan counts but high efficiency:
- Check query patterns match the index predicate
- Lower `idx_tup_read` with similar `idx_tup_fetch` indicates efficient filtering

### Covering indexes (INCLUDE)

PostgreSQL 11+ — enable index-only scans:
- High `idx_tup_read` with low heap fetches indicates effective index-only scans
- Monitor visibility map freshness for optimal performance

## Interpreting metrics

### Index-only scan efficiency

When `idx_tup_read` >> `idx_tup_fetch`:
- Index is returning entries but heap visibility checks are failing
- Run VACUUM to update visibility map
- Consider covering indexes

### Low scan count on seemingly useful index

Possible causes:
1. Query planner choosing sequential scan (table too small)
2. Statistics outdated — run `ANALYZE`
3. Query pattern doesn't match index

### Index size growing faster than table

Indicates index bloat:
1. Check for heavy UPDATE/DELETE activity
2. Consider `REINDEX CONCURRENTLY`
3. Review fillfactor settings

## Troubleshooting

### Index shows zero scans but queries use it

1. Statistics may have been reset:
   ```sql
   select stats_reset from pg_stat_database where datname = current_database();
   ```

2. Check dashboard time range covers query activity period

### Metrics don't update after adding index

New indexes start with zero counters. Allow time for query activity to accumulate statistics.

### Index size doesn't match expected

Index size includes:
- All index pages (leaf and internal)
- Free space (bloat)
- Visibility information (for covering indexes)

## Related metrics

- [Table metrics](/docs/monitoring/metrics/table-metrics) — Parent table statistics
- [pg_stat_statements](/docs/monitoring/metrics/pg-stat-statements) — Query patterns using indexes
