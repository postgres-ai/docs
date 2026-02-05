---
title: "08. Aggregated table analysis"
sidebar_label: "08. Aggregated table"
sidebar_position: 9
---

# 08. Aggregated table analysis

Overview of table-level metrics across all tables in the database.

![08. Table stats dashboard](/img/monitoring/dashboards/08-table-stats.png)

## Purpose

Identify tables that need attention:
- High sequential scan rates
- Bloat accumulation
- Dead tuple buildup
- HOT update efficiency

## When to use

- Routine table health review
- Finding indexing opportunities
- Capacity planning
- Identifying maintenance candidates

## Key panels

### Tables by sequential scans

**What it shows:**
- Tables with highest sequential scan counts
- Rate of seq scans over time

**Warning signs:**
- Large tables with high seq scan rate — may need indexes
- Growing seq scan trend on tables that should use indexes

### Tables by size

**What it shows:**
- Largest tables by total size (data + indexes + toast)
- Growth trend over time

**Use for:**
- Capacity planning
- Identifying candidates for partitioning
- Storage optimization

### Tables by dead tuples

**What it shows:**
- Tables with most dead tuples
- Dead tuple accumulation rate

**Healthy state:**
- Dead tuples cleared regularly by autovacuum
- No single table dominating

**Warning signs:**
- Continuously growing dead tuples — autovacuum not keeping up
- High ratio of dead to live tuples

### Tables by insert/update/delete rate

**What it shows:**
- Write activity by table
- Helps identify hot tables

### HOT update ratio

**What it shows:**
- Percentage of updates using Heap-Only Tuples
- Higher is better (avoids index updates)

**Healthy range:**
- HOT ratio > 90% for frequently updated tables

**Low HOT ratio causes:**
- Updates to indexed columns
- `fillfactor` not set appropriately
- Index bloat

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Node filter |
| `db_name` | Database filter |

## Interpreting table metrics

### Sequential vs index scans

```sql
select
  schemaname,
  relname,
  seq_scan,
  idx_scan,
  case
    when seq_scan + idx_scan = 0 then 0
    else round(100.0 * seq_scan / (seq_scan + idx_scan), 1)
  end as seq_scan_pct
from pg_stat_user_tables
where seq_scan + idx_scan > 100
order by seq_scan desc
limit 20;
```

High seq_scan_pct on large tables indicates missing indexes.

### Table bloat estimation

Bloat shown in this dashboard is estimated based on:
- Dead tuple count
- Free space map
- Statistical sampling

For accurate bloat measurement, use `pgstattuple` extension.

## Related dashboards

- **Single table deep-dive** — [09. Single table](/docs/monitoring/dashboards/single-table)
- **Index analysis** — [10. Index health](/docs/monitoring/dashboards/index-health)
- **Vacuum status** — [07. Autovacuum](/docs/monitoring/dashboards/autovacuum)

## Troubleshooting

### High sequential scan rate

1. Check if table has appropriate indexes:
   ```sql
   select indexname, indexdef
   from pg_indexes
   where tablename = 'your_table';
   ```

2. Review query patterns accessing the table

3. Consider adding indexes for common filter columns

### Table size growing unexpectedly

1. Check for bloat:
   ```sql
   select
     relname,
     n_live_tup,
     n_dead_tup,
     round(100.0 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 1) as dead_pct
   from pg_stat_user_tables
   where relname = 'your_table';
   ```

2. Review autovacuum settings for the table

3. Check for long-running transactions blocking cleanup
