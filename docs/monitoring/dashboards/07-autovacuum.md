---
title: "07. Autovacuum"
sidebar_label: "07. Autovacuum"
sidebar_position: 8
---

# 07. Autovacuum and bloat

Monitor vacuum activity, dead tuple accumulation, and table bloat.

:::info Dashboard in development
This dashboard is currently under development. Autovacuum and bloat metrics are collected as part of the health check system, and the full dashboard visualization is coming soon.
:::

## Purpose

Track autovacuum health to prevent:
- Table bloat degrading query performance
- Transaction ID wraparound emergencies
- Excessive dead tuple accumulation

## When to use

- Routine maintenance monitoring
- Investigating slow sequential scans
- Tuning autovacuum settings
- Diagnosing disk space growth

## Key panels

### Autovacuum workers

**What it shows:**
- Active autovacuum workers
- Worker utilization vs `autovacuum_max_workers`

**Healthy state:**
- Workers active during low-traffic periods
- Not constantly at max workers

**Warning signs:**
- Always at max workers = autovacuum can't keep up
- Zero workers for extended periods = check if enabled

### Dead tuples by table

**What it shows:**
- Tables with most dead tuples
- Rate of dead tuple accumulation

**Healthy state:**
- Dead tuples cleared periodically by vacuum
- No single table dominating

**Warning signs:**
- Dead tuples growing unbounded
- Ratio of dead to live tuples > 20%

### Tables approaching wraparound

**What it shows:**
- Tables closest to transaction ID wraparound
- Age of oldest transaction (datfrozenxid)

**Critical thresholds:**
- Warning: age > 500 million
- Critical: age > 1 billion (approaching 2B limit)

:::danger Transaction ID wraparound
If a table reaches 2 billion transactions without vacuum, PostgreSQL will shut down to prevent data corruption.
:::

### Vacuum progress

**What it shows:**
- Currently running vacuum operations
- Phase and progress percentage
- Estimated completion

### Table bloat estimates

**What it shows:**
- Estimated wasted space per table
- Based on dead tuple ratio and page density

**Interpretation:**
- < 20% bloat: Normal
- 20-50% bloat: Consider manual vacuum
- > 50% bloat: May need VACUUM FULL or pg_repack

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Node filter |
| `db_name` | Database filter |

## Autovacuum tuning

### Key parameters

| Parameter | Default | Recommendation |
|-----------|---------|----------------|
| `autovacuum_vacuum_threshold` | 50 | Lower for small tables |
| `autovacuum_vacuum_scale_factor` | 0.2 | Lower for large tables |
| `autovacuum_naptime` | 1min | Default usually fine |
| `autovacuum_max_workers` | 3 | Increase for many tables |

### Per-table settings

For large, frequently updated tables:
```sql
alter table large_table set (
  autovacuum_vacuum_scale_factor = 0.01,
  autovacuum_analyze_scale_factor = 0.005
);
```

## Related dashboards

- **Table details** — [08. Table stats](/docs/monitoring/dashboards/table-stats)
- **Single table** — [09. Single table](/docs/monitoring/dashboards/single-table)
- **Index bloat** — [10. Index health](/docs/monitoring/dashboards/index-health)

## Troubleshooting

### Autovacuum not running

1. Check if enabled:
   ```sql
   show autovacuum;
   ```

2. Check table thresholds:
   ```sql
   select relname, n_dead_tup,
          current_setting('autovacuum_vacuum_threshold')::int +
          (current_setting('autovacuum_vacuum_scale_factor')::float * reltuples) as threshold
   from pg_stat_user_tables
   where n_dead_tup > 0
   order by n_dead_tup desc;
   ```

### Vacuum running but not reducing bloat

1. Check for long-running transactions:
   ```sql
   select pid, age(backend_xmin), query
   from pg_stat_activity
   where backend_xmin is not null
   order by age(backend_xmin) desc;
   ```

2. Check for unused replication slots holding back vacuum

3. Consider VACUUM FULL for severely bloated tables (requires downtime)

### High wraparound age

Emergency vacuum:
```sql
-- Check which tables need attention
select relname, age(relfrozenxid)
from pg_class
where relkind = 'r'
order by age(relfrozenxid) desc
limit 20;

-- Manual vacuum freeze
vacuum freeze table_name;
```
