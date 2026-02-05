---
title: "09. Single table analysis"
sidebar_label: "09. Single table"
sidebar_position: 10
---

# 09. Single table analysis

Detailed analysis of a specific table's performance and health metrics.

![09. Single table dashboard](/img/monitoring/dashboards/09-single-table.png)

:::note Screenshot note
This dashboard requires selecting a specific table from the dropdown. The screenshot shows the dashboard structure; actual data appears after selecting a table with collected statistics.
:::

## Purpose

When you've identified a problematic table in [08. Table Stats](/docs/monitoring/dashboards/table-stats), use this dashboard for:
- Detailed access pattern analysis
- Bloat investigation
- Index usage review
- Maintenance planning

## When to use

- Investigating slow queries on a specific table
- Planning table maintenance (vacuum, reindex)
- Before/after schema changes
- Capacity planning for growing tables

## Key panels

### Table size over time

**What it shows:**
- Total table size (data + toast + indexes)
- Growth trend

**Use for:**
- Capacity forecasting
- Detecting unexpected growth
- Measuring impact of cleanup operations

### Sequential vs index scans

**What it shows:**
- Scan type distribution over time
- Helps identify query pattern changes

**Healthy pattern:**
- Predominantly index scans for OLTP tables
- Sequential scans acceptable for small tables or analytics

### Tuple statistics

**What it shows:**
- Live tuples
- Dead tuples
- Inserts, updates, deletes per second

### HOT updates

**What it shows:**
- HOT update count and ratio
- Non-HOT updates

**Improving HOT ratio:**
```sql
-- Increase fillfactor to leave room for updates
alter table your_table set (fillfactor = 80);
```

### Last vacuum/analyze

**What it shows:**
- Time since last vacuum
- Time since last analyze
- Auto vs manual operations

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Node filter |
| `db_name` | Database filter |
| `table_name` | Specific table to analyze |

## Table information queries

### Basic table info

```sql
select
  pg_size_pretty(pg_total_relation_size(oid)) as total_size,
  pg_size_pretty(pg_relation_size(oid)) as table_size,
  pg_size_pretty(pg_indexes_size(oid)) as indexes_size,
  reltuples::bigint as estimated_rows
from pg_class
where relname = 'your_table';
```

### Table access statistics

```sql
select
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  n_tup_hot_upd,
  n_live_tup,
  n_dead_tup
from pg_stat_user_tables
where relname = 'your_table';
```

### Table bloat check

```sql
select
  relname,
  n_dead_tup,
  n_live_tup,
  round(100.0 * n_dead_tup / nullif(n_live_tup, 0), 2) as dead_ratio_pct,
  last_vacuum,
  last_autovacuum
from pg_stat_user_tables
where relname = 'your_table';
```

## Related dashboards

- **All tables overview** — [08. Table Stats](/docs/monitoring/dashboards/table-stats)
- **Indexes on this table** — [10. Index Health](/docs/monitoring/dashboards/index-health)
- **Queries accessing this table** — [02. Query Analysis](/docs/monitoring/dashboards/query-analysis)

## Troubleshooting

### Table not appearing in dropdown

1. Verify the table exists in the selected database
2. Check monitoring user has access:
   ```sql
   select has_table_privilege('pgwatch', 'your_table', 'select');
   ```

### Metrics show zero

Some metrics require activity to populate:
- Run queries against the table
- Wait for next metrics collection cycle (60s default)

### Size metrics don't match pg_relation_size

Dashboard may show cached values. For real-time size:
```sql
select pg_size_pretty(pg_total_relation_size('your_table'));
```
