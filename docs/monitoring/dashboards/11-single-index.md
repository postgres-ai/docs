---
title: "11. Single index analysis"
sidebar_label: "11. Single index"
sidebar_position: 12
---

# 11. Single index deep-dive

Detailed analysis of a specific index's usage and health.

![11. Single index dashboard](/img/monitoring/dashboards/11-single-index.png)

:::note Screenshot note
This dashboard requires selecting a specific index from the dropdown. The screenshot shows the dashboard structure; actual data appears after selecting an index with collected statistics.
:::

## Purpose

When investigating a specific index from [10. Index Health](/docs/monitoring/dashboards/index-health), use this dashboard for:
- Usage pattern analysis
- Bloat assessment
- Maintenance planning
- Optimization decisions

## When to use

- Deciding whether to drop an unused index
- Investigating index performance
- Planning index rebuild
- Validating new index effectiveness

## Key panels

### Index scans over time

**What it shows:**
- Scan frequency trend
- Helps identify usage patterns (batch jobs, peak hours)

### Index size

**What it shows:**
- Current index size
- Size trend over time

### Tuples read vs fetched

**What it shows:**
- `idx_tup_read` — tuples returned by index
- `idx_tup_fetch` — tuples actually fetched from heap

**Interpretation:**
- Large gap may indicate index-only scans (good)
- Or visibility map issues requiring heap fetches

### Index bloat estimate

**What it shows:**
- Estimated wasted space
- Bloat percentage

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Node filter |
| `db_name` | Database filter |
| `index_name` | Specific index to analyze |

## Index information queries

### Basic index info

```sql
select
  indexname,
  indexdef,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as size
from pg_indexes
where indexname = 'your_index';
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
where indexrelname = 'your_index';
```

### Check if index supports constraints

```sql
-- Primary key or unique constraint
select
  conname,
  contype
from pg_constraint
where conindid = 'your_index'::regclass::oid;
```

### Index bloat analysis

```sql
-- Requires pgstattuple extension
create extension if not exists pgstattuple;

select
  avg_leaf_density,
  leaf_fragmentation
from pgstatindex('your_index');
```

## Decision framework

### Should I drop this index?

| Condition | Action |
|-----------|--------|
| Zero scans, no constraint | Safe to drop |
| Zero scans, has constraint | Keep (enforces uniqueness) |
| Low scans, used by batch job | Keep (check longer time range) |
| Redundant (subset of another) | Safe to drop |
| High bloat, frequently used | Rebuild, don't drop |

### Rebuild vs drop and recreate

| Scenario | Recommendation |
|----------|----------------|
| Minor bloat (< 30%) | Let autovacuum handle |
| Moderate bloat (30-50%) | `reindex concurrently` |
| Severe bloat (> 50%) | Drop and recreate |
| Production, no downtime | `reindex concurrently` |

## Related dashboards

- **All indexes** — [10. Index Health](/docs/monitoring/dashboards/index-health)
- **Parent table** — [09. Single Table](/docs/monitoring/dashboards/single-table)
- **Queries using this index** — [02. Query Analysis](/docs/monitoring/dashboards/query-analysis)

## Troubleshooting

### Index not in dropdown

1. Verify index exists:
   ```sql
   select * from pg_indexes where indexname = 'your_index';
   ```

2. Check it's a user index (not system catalog)

### Metrics show unexpected values

Index statistics are cumulative since last reset. Check reset time:
```sql
select stats_reset from pg_stat_database where datname = current_database();
```
