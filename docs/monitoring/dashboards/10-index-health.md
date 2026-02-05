---
title: "10. Aggregated index analysis"
sidebar_label: "10. Aggregated index"
sidebar_position: 11
---

# 10. Aggregated index analysis

Overview of index health, usage, and efficiency across all indexes.

![10. Index health dashboard](/img/monitoring/dashboards/10-index-health.png)

:::note Screenshot note
Index statistics require database activity and periodic stats collection. The screenshot shows available data from a demo environment; production systems with more indexes and query activity will show richer statistics.
:::

## Purpose

Identify indexes that need attention:
- Unused indexes wasting space and slowing writes
- Duplicate/redundant indexes
- Bloated indexes needing rebuild
- Missing indexes causing sequential scans

## When to use

- Regular index health review
- Before/after adding new indexes
- Storage optimization
- Write performance tuning

## Key panels

### Unused indexes

**What it shows:**
- Indexes with zero or very low scan count
- Size of unused indexes

**Warning signs:**
- Large indexes with zero scans — candidates for removal
- Indexes unused since last stats reset

:::warning Before dropping
Verify index isn't used for:
- Unique constraints
- Foreign key references
- Periodic batch jobs (check longer time range)
:::

### Index size by table

**What it shows:**
- Total index size per table
- Index to table size ratio

**Healthy range:**
- Index size typically 20-100% of table size
- Ratio > 200% may indicate over-indexing

### Index scan rate

**What it shows:**
- Index usage frequency
- Trends in index utilization

### Redundant indexes

**What it shows:**
- Indexes that are subsets of other indexes
- Example: `(a)` is redundant if `(a, b)` exists

### Index bloat estimates

**What it shows:**
- Estimated wasted space in indexes
- Based on statistical analysis

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Node filter |
| `db_name` | Database filter |

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
order by pg_relation_size(indexrelid) desc
limit 20;
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

### Index usage statistics

```sql
select
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
from pg_stat_user_indexes
where relname = 'your_table'
order by idx_scan desc;
```

## Index maintenance

### Rebuild bloated index

```sql
-- Online rebuild (PostgreSQL 12+)
reindex index concurrently your_index;

-- Or create replacement and swap
create index concurrently your_index_new on your_table (column);
drop index your_index;
alter index your_index_new rename to your_index;
```

### Check index health

```sql
-- Requires pgstattuple extension
select * from pgstattuple('your_index');
```

## Related dashboards

- **Single index deep-dive** — [11. Single Index](/docs/monitoring/dashboards/single-index)
- **Table metrics** — [08. Table Stats](/docs/monitoring/dashboards/table-stats)
- **Query analysis** — [02. Query Analysis](/docs/monitoring/dashboards/query-analysis)

## Troubleshooting

### Index shows as unused but queries use it

1. Check stats were reset recently:
   ```sql
   select stats_reset from pg_stat_database where datname = current_database();
   ```

2. Verify time range in dashboard covers query activity period

### High index bloat

1. Check table update patterns — frequent updates cause bloat
2. Consider `reindex concurrently` for online rebuild
3. Review `maintenance_work_mem` setting for vacuum efficiency
