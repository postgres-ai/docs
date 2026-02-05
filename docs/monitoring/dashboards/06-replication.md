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

## Key panels

### Replication lag (Bytes)

**What it shows:**
- Bytes of WAL not yet replayed on replica
- Per-replica breakdown

**Healthy range:**
- < 1 MB for synchronous replication
- < 100 MB for async (depends on workload)

**Warning signs:**
- Growing lag = replica can't keep up
- Sudden spikes = network issues or replica overload

### Replication lag (Time)

**What it shows:**
- Estimated time behind primary
- More intuitive than bytes for SLA monitoring

**Calculation:**
Based on WAL generation rate and byte lag.

### Replication slot status

**What it shows:**
- Active slots and their consumers
- Slot lag (retained WAL)

**Warning signs:**
- Inactive slots with growing lag = WAL retention risk
- Slots without active connections

:::warning WAL retention
Unused replication slots prevent WAL cleanup and can fill disk.
:::

### Sent vs replayed

**What it shows:**
- WAL sent to replica
- WAL replayed (applied) on replica
- Gap indicates apply lag

### Replica connections

**What it shows:**
- Connected replicas
- Connection state (streaming, catchup)

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Primary or replica |

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
