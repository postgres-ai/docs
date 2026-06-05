---
title: "06. Replication"
sidebar_label: "06. Replication"
sidebar_position: 7
---

# 06. Replication and HA

Monitor streaming replication, replication lag, and high availability status.

:::info Dashboard in development
This dashboard is currently under development. Replication metrics are collected as part of the health check system, and the full dashboard visualization is coming soon.
:::

## Purpose

Ensure replication health for:
- Disaster recovery readiness
- Read replica performance
- Failover preparedness

## When to use

- Monitoring replica lag during high load
- Investigating replication disconnections
- Validating HA setup
- Capacity planning for replicas

## Dashboard status

In 0.15.0 this dashboard ships as a single placeholder panel ("Coming soon...") and has no data
panels or template variables yet. Replication metrics are still collected by the stack (for
example `replication`, `replication_slots`, and `pg_stat_replication` in the `full` preset), so
until the visualizations land you can inspect replication health directly via SQL using the
queries below.

:::warning WAL retention
Unused replication slots prevent WAL cleanup and can fill disk.
:::

## Replication modes

### Streaming replication

Standard async or sync replication:
```sql
-- on primary
select * from pg_stat_replication;
```

### Logical replication

For selective table replication:
```sql
-- check subscriptions
select * from pg_stat_subscription;
```

## Related dashboards

- **Primary health** — [01. Node overview](/docs/monitoring/dashboards/node-overview)
- **Query load on replica** — [02. Query analysis](/docs/monitoring/dashboards/query-analysis)

## Troubleshooting

### Replica not connecting

1. Check primary allows connections:
   ```sql
   show max_wal_senders;
   select * from pg_stat_replication;
   ```

2. Verify pg_hba.conf allows replication

3. Check network connectivity

### Replication lag growing

1. Check replica resource usage (CPU, I/O)
2. Review long-running queries on replica
3. Consider `hot_standby_feedback` setting
4. Check for replication conflicts:
   ```sql
   select * from pg_stat_database_conflicts;
   ```

### Replication slot bloat

Remove unused slots:
```sql
-- List slots
select slot_name, active, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn))
from pg_replication_slots;

-- Drop unused slot (CAUTION)
select pg_drop_replication_slot('unused_slot');
```
