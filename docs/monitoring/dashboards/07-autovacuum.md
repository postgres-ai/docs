---
title: "07. Autovacuum and xmin horizon"
sidebar_label: "07. Autovacuum & xmin horizon"
sidebar_position: 8
keywords:
  - "PostgreSQL autovacuum dashboard"
  - "xmin horizon"
  - "transaction ID wraparound"
  - "vacuum monitoring"
  - "dead tuple monitoring"
---

# 07. Autovacuum and xmin horizon

Monitor autovacuum activity, transaction ID / MultiXID wraparound risk, and — new in 0.15 — the
**xmin horizon**: how far back the oldest snapshot reaches and which sessions, replication
slots, standbys, or prepared transactions are holding it back. (Per-table dead-tuple and bloat
detail lives on [08. Table stats](/docs/monitoring/dashboards/table-stats) and
[10. Index health](/docs/monitoring/dashboards/index-health).)

## Purpose

Track autovacuum health and the xmin horizon to prevent:

- Dead tuples that vacuum cannot clean up because a snapshot still needs them
- Table and index bloat degrading query performance
- Transaction ID wraparound emergencies
- WAL and slot retention growth driven by a stuck horizon

The xmin horizon is the single most useful signal when vacuum runs but bloat keeps growing:
PostgreSQL can only remove dead tuples that are older than the oldest snapshot still in use
anywhere in the cluster. This dashboard attributes the horizon to its blocker so you can act
on the real cause instead of just running `VACUUM` again.

## When to use

- Routine maintenance monitoring
- Investigating bloat that vacuum is not reducing
- Diagnosing "dead tuples high but autovacuum is running"
- Tracking down long-running transactions, idle-in-transaction sessions, stale replication
  slots, lagging standbys, or orphaned prepared transactions
- Tuning autovacuum settings
- Diagnosing disk space growth

## The xmin horizon

PostgreSQL keeps a row version visible as long as any transaction might still need it. The
oldest such transaction defines the **xmin horizon**. While the horizon is held back, vacuum
cannot reclaim dead tuples even on busy tables, so bloat accumulates and the wraparound clock
keeps ticking.

The horizon can be held back by five classes of "blocker", each tracked as a separate
component on this dashboard:

| Blocker class | Source | Typical cause |
|---------------|--------|---------------|
| Client backends | `pg_stat_activity` (`backend_xmin`) | Long-running query or `idle in transaction` session |
| Replication slots (data) | `pg_replication_slots.xmin` | Inactive or lagging physical/logical slot |
| Replication slots (catalog) | `pg_replication_slots.catalog_xmin` | Logical slot holding the catalog horizon |
| Standby feedback | `pg_stat_replication.backend_xmin` | Replica with `hot_standby_feedback = on` lagging |
| Prepared transactions | `pg_prepared_xacts` | Orphaned two-phase commit (`PREPARE TRANSACTION`) |

The dashboard separates the **data horizon** (blocks cleanup of ordinary table tuples) from
the **catalog horizon** (blocks cleanup of system catalogs, relevant to logical replication),
because a logical slot can hold the catalog horizon far behind the data horizon.

:::tip Companion how-to
For a step-by-step methodology, see
[How to monitor the xmin horizon](/docs/postgres-howtos/performance-optimization/monitoring/how-to-monitor-xmin-horizon)
and
[How to monitor transaction ID wraparound risks](/docs/postgres-howtos/performance-optimization/monitoring/how-to-monitor-transaction-id-wraparound-risks).
:::

## Key panels

The dashboard is organized into three sections: **Wraparound risk — top-N tables**, **xmin
horizon overview (experimental)**, and **Autovacuum mechanics**.

### Wraparound risk — top-N tables

#### Top-N tables by XID age (relfrozenxid) / by MultiXID age (relminmxid)

**What it shows:**
- The top-N tables by transaction ID (`relfrozenxid`) age and by MultiXID (`relminmxid`) age
- Reference lines for `autovacuum_freeze_max_age` / `vacuum_failsafe_age` (and the multixact
  equivalents), plus the ~2.1B wraparound limit

**Critical thresholds:**
- Warning: age approaching `autovacuum_freeze_max_age`
- Critical: age approaching `vacuum_failsafe_age` / the 2B limit

:::danger Transaction ID wraparound
If a database reaches roughly 2 billion transactions without freezing, PostgreSQL stops
accepting writes to prevent data corruption. A stuck xmin horizon makes wraparound risk worse
because it blocks the freezing that vacuum would otherwise perform.
:::

### xmin horizon overview (experimental)

:::note Experimental in 0.15
This section is labeled **(experimental)** on the shipped dashboard. The panel titles and
signals may change in a future release.
:::

#### xmin horizon age by source

**What it shows:**
- Data horizon age and catalog horizon age, in transactions (the `*_age_tx` signals)
- The per-component blocker ages (`pg_stat_activity`, `pg_replication_slots`,
  `pg_replication_slots` catalog, `pg_stat_replication`, `pg_prepared_xacts`) as separate series

**Healthy state:**
- Horizon age stays low and tracks normal transaction throughput
- No single component dominates for long periods

**Warning signs:**
- Horizon age climbing steadily — something is pinning old snapshots
- Catalog horizon far older than data horizon — a logical replication slot is stuck

#### Longest non-idle transaction age, > 1 min

**What it shows:**
- The age of the longest-running non-idle transaction (over 1 minute), a common cause of a
  `pg_stat_activity` backend pinning the horizon

#### Current blocker counts

**What it shows:**
- The number of active blockers per component (`pg_stat_activity`, `pg_replication_slots`,
  `pg_replication_slots` catalog, `pg_stat_replication`, `pg_prepared_xacts`)

**Interpretation:**
- A `pg_stat_activity` blocker → find the session (use the `queryid` to inspect the query
  text) and end the long transaction or fix the idle-in-transaction leak
- A `pg_replication_slots` blocker → check whether the slot is still needed; drop or advance it
- A `pg_stat_replication` blocker → a standby with `hot_standby_feedback` is lagging
- A `pg_prepared_xacts` blocker → resolve the orphaned prepared transaction with
  `COMMIT PREPARED` / `ROLLBACK PREPARED`

:::note Monitoring-user noise filtered
The blocker signals intentionally exclude the monitoring role's own sessions, so the monitoring
stack never reports itself as the top blocker.
:::

### Autovacuum mechanics

#### Autovacuum debt — top-N overdue tables

**What it shows:**
- The top-N tables by how far past their autovacuum threshold they are (the overdue factor)
- A reference line at the threshold (factor 1) where autovacuum should trigger

**Warning signs:**
- Tables persistently above factor 1 — autovacuum is not keeping up on those tables

#### Autovacuum worker pool — active vs max

**What it shows:**
- Active autovacuum workers vs `autovacuum_max_workers`, plus worker utilization

**Healthy state:**
- Workers active during low-traffic periods
- Not constantly at max workers

**Warning signs:**
- Always at max workers = autovacuum can't keep up
- Zero workers for extended periods = check if enabled

#### Autovacuum workers blocked on lock

**What it shows:**
- Autovacuum workers that are stuck waiting on a lock, with how long they have been blocked

**Warning signs:**
- Workers blocked for extended periods — a conflicting lock is stalling vacuum progress

#### Vacuum timeline

**What it shows:**
- A timeline of vacuum activity per table (including index-vacuum cycles and vacuum mode)

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Node filter |
| `db_name` | Database filter |
| `schema_name` | Schema filter (for the top-N table panels) |
| `table_name` | Table filter (for the top-N table panels) |
| `top_n` | How many tables to show in top-N panels (5, 10, 15, 20, 25, 50, 100) |

The xmin horizon panels are instance-level (collected on the primary), so they are scoped by
`cluster_name` / `node_name` rather than per database.

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
- **Lock contention** — [13. Lock contention](/docs/monitoring/dashboards/lock-contention)

## Metrics reference

The signals behind this dashboard are documented in the
[monitoring reference](/docs/reference-guides/postgres-ai-monitoring-reference): the
`xmin_horizon` and `xmin_horizon_blockers` metric groups (xmin horizon attribution) and the
`pg_database_wraparound` / `pg_vacuum_progress` / table-statistics groups (vacuum and bloat).

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

This is the classic xmin-horizon symptom. Start with the **xmin horizon age by source** and
**Current blocker counts** panels, then confirm from SQL:

1. Check for long-running or idle-in-transaction sessions holding `backend_xmin`:
   ```sql
   select pid, state, age(backend_xmin) as xmin_age, query
   from pg_stat_activity
   where backend_xmin is not null
   order by age(backend_xmin) desc;
   ```

2. Check replication slots holding the horizon back:
   ```sql
   select slot_name, slot_type, active,
          age(xmin) as xmin_age,
          age(catalog_xmin) as catalog_xmin_age
   from pg_replication_slots
   where xmin is not null or catalog_xmin is not null
   order by greatest(coalesce(age(xmin), 0), coalesce(age(catalog_xmin), 0)) desc;
   ```

3. Check standby feedback and prepared transactions:
   ```sql
   select application_name, age(backend_xmin) as xmin_age
   from pg_stat_replication
   where backend_xmin is not null;

   select gid, prepared, owner, age(transaction) as xmin_age
   from pg_prepared_xacts
   order by age(transaction) desc;
   ```

4. Once the blocker is gone, the horizon advances and autovacuum reclaims the dead tuples on
   its next pass. For severely bloated tables, consider `VACUUM FULL` or `pg_repack` (requires
   a lock / downtime).

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

Always clear the xmin horizon blocker first — `VACUUM FREEZE` cannot freeze rows newer than
the oldest snapshot still in use.
