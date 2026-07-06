---
title: How to monitor xmin horizon to prevent XID/MultiXID wraparound and high bloat
sidebar_label: monitor xmin horizon to prevent XID/MultiXID wraparound and high bloat
description: ''
keywords:
  - postgresql
  - monitor
  - xmin
  - horizon
  - prevent
  - xid/multixid
  - wraparound
  - high
  - bloat
  - intermediate
tags:
  - intermediate
  - xmin
  - monitoring
  - bloat
  - wraparound
  - maintenance
difficulty: intermediate
estimated_time: 6 min
---


Previously, we discussed
[how to implement monitoring for the risks of XID (transaction ID) and MultiXID wraparound](/docs/postgres-howtos/performance-optimization/monitoring/how-to-monitor-transaction-id-wraparound-risks).
That type of check is critical and a must-have in any monitoring.

However, while it helps you understand the risk level, it doesn't reveal the root cause – something that you'll
definitely need for your XID wraparound postmortem, when applying the "Five Whys" method (just kidding, we're going to
improve our monitoring and have autovacuum behavior control, so none of us will ever experience an XID wraparound in
production).

This problem can be solved with the `xmin` horizon monitoring. And this very check is also helpful in understanding
the reasons of high bloat growth.

## Four reasons of growing XID/MultiXID wraparound risks

XID/MultiXID wraparound occurs when `autovacuum` doesn't freeze tuples. Considering that `autovacuum` is turned on,
there might be four reasons for this:

1. Long-running transaction on the primary.
2. Abandoned replication slot.
3. Long-running transaction on a standby node with `hot_standby_feedback = 'on'` (including cases with cascaded
   replication – the feedback can be propagated).
4. Abandoned prepared transaction.

All four reasons need to be checked, as they can contain the transaction ID value for the data that.

A good post on this topic:
[VACUUM won't remove dead rows: 4 reasons why](https://cybertec-postgresql.com/en/reasons-why-vacuum-wont-remove-dead-rows/).

Clarification (based on the analysis of mistakes various monitoring systems demonstrate):

- It is never enough to monitor only long-running transactions – all four reasons have to be covered. In fact,
  long-running transaction monitoring alone is helpful for troubleshooting a different kind of problem: risk locking
  issues.
- It is not enough to monitor only slots – certain standbys may be configured without slots. Moreover, monitoring only
  `pg_stat_replication` is not sufficient – it wouldn't cover abandoned replication slots.
  Both `pg_stat_replication` and `pg_replication_slots` should be checked.

## xmin horizon

The term "`xmin` horizon" is used in the Postgres documentation (for example, when describing
`pg_stat_activity.backend_xmin`),
although it is never explicitly defined. It's also used in the source code, and there is a
[good comment](https://github.com/postgres/postgres/blob/6bf2efb38285626a9de3004dd1c23d9a85453372/src/backend/storage/ipc/procarray.c#L1662)
on the function `ComputeXidHorizons()`, explaining the machinery.

The `xmin` of a row indicates the transaction ID that inserted the row – every table has a hidden (system) column
`xmin` (try this: `select xmin, * from your_table;`).

The "`xmin` horizon" represents the XID of the oldest snapshot of data that must be preserved.

## What about bloat?

If `xmin` horizon doesn't progress for a short period of time, blocking `autovacuum`, it is not a problem – this normally
happens often.

But if this happens for a long period of time, and `xmin` horizon is far in the past, it can cause two big problems:

- XID/MultiXID wraparound, as discussed;
- higher bloat growth: inability to delete dead tuples now leads to massive deletes of them later, when `xmin` horizon
  shifts – and this makes `autovacuum` a massive "dead tuple to bloat converter".

That's why it's important to monitor `xmin` horizon and react when it's too far behind (`xmin` horizon age is high).

## How to monitor

There are two ways to monitor `xmin` horizon:

1) Observing `autovacuum` logs.
2) Querying 4 system views to cover 4 reasons discussed above.

## Log-based monitoring

The log-based approach doesn't help understand the reasons behind a non-progressing `xmin` horizon, but it can still be
helpful as it demonstrates `autovacuum` behavior in action.

A log example and how to read it:

```
2023-11-10 01:04:03.828 PST [56538] LOG:  automatic vacuum of table "nik.public.t": index scans: 0
  pages: 0 removed, 4480 remain, 4480 scanned (100.00% of total)
  tuples: 0 removed, 1000000 remain, 666667 are dead but not yet removable
  removable cutoff: 784, which was 112449 XIDs old when operation ended
  frozen: 0 pages from table (0.00% of total) had 0 tuples frozen
  index scan not needed: 0 pages from table (0.00% of total) had 0 dead item identifiers removed
  avg read rate: 9.685 MB/s, avg write rate: 0.000 MB/s
  buffer usage: 7281 hits, 1698 misses, 0 dirtied
  WAL usage: 0 records, 0 full page images, 0 bytes
  system usage: CPU: user: 0.11 s, system: 0.02 s, elapsed: 1.36 s
```

Here, the indicators of a problem are:

- `666667 are dead but not yet removable` – a lot of tuples are dead but `autovacuum` cannot remove them because these
  tuples are "younger" than the current `xmin` horizon (their `xmin` values are in the future compared to the `xmin`
  horizon)
- `removable cutoff: 784, which was 112449 XIDs old when operation ended` – this tells us that the XID horizon is 784
  and its age is 112449 – so, the `xmin` horizon (the data version that is still considered needed) is more than 112k
  transactions behind in the past, at the moment when `autovacuum` finished this processing attempt.

This indicates that the `xmin` horizon is far behind the current moment, and something is holding it in the distant
past. To understand what it is, we need to check several system views.

## Monitoring using system views

An example query:

<!-- sql-snippet-test: xmin-horizon begin -->
```sql
with bits as (
  select
    txid_snapshot_xmin(txid_current_snapshot()) as snapshot_xmin,
    -- Primary client backend snapshots can hold back cleanup of user table tuples.
    (
      select backend_xmin
      from pg_stat_activity
      where backend_xmin is not null
      order by age(backend_xmin) desc
      limit 1
    ) as data_xmin_pg_stat_activity,
    -- Replication slot xmin can hold back cleanup of user table tuples.
    (
      select xmin
      from pg_replication_slots
      where xmin is not null
      order by age(xmin) desc
      limit 1
    ) as data_xmin_pg_replication_slots,
    -- Logical replication slot catalog_xmin can hold back cleanup of system catalog tuples.
    (
      select catalog_xmin
      from pg_replication_slots
      where catalog_xmin is not null
      order by age(catalog_xmin) desc
      limit 1
    ) as catalog_xmin_pg_replication_slots,
    -- Standby feedback can propagate standby snapshots to the primary.
    (
      select backend_xmin
      from pg_stat_replication
      where backend_xmin is not null
      order by age(backend_xmin) desc
      limit 1
    ) as data_xmin_pg_stat_replication,
    -- Prepared transactions keep their transaction ID until COMMIT/ROLLBACK PREPARED.
    (
      select transaction
      from pg_prepared_xacts
      order by age(transaction) desc
      limit 1
    ) as data_xmin_pg_prepared_xacts
)
select
  *,
  age(data_xmin_pg_stat_activity) as data_xmin_pg_stat_activity_age,
  age(data_xmin_pg_replication_slots) as data_xmin_pg_replication_slots_age,
  age(catalog_xmin_pg_replication_slots) as catalog_xmin_pg_replication_slots_age,
  age(data_xmin_pg_stat_replication) as data_xmin_pg_stat_replication_age,
  age(data_xmin_pg_prepared_xacts) as data_xmin_pg_prepared_xacts_age,
  greatest(
    age(data_xmin_pg_stat_activity),
    age(data_xmin_pg_replication_slots),
    age(data_xmin_pg_stat_replication),
    age(data_xmin_pg_prepared_xacts)
  ) as data_horizon_age,
  greatest(
    age(data_xmin_pg_stat_activity),
    age(data_xmin_pg_replication_slots),
    age(data_xmin_pg_stat_replication),
    age(data_xmin_pg_prepared_xacts),
    age(catalog_xmin_pg_replication_slots)
  ) as catalog_horizon_age
from bits;
```
<!-- sql-snippet-test: xmin-horizon end -->

Note that the `min(...)` function cannot be applied to XID values directly, because of their nature (32-bit
and `rotation`) – casting XID to `int` doesn't exist for good reason. But the `age(XID)` function is helpful here. So
instead of considering raw `xmin` values alone, we need to deal with horizon ages.

The query separates `data_horizon_age` from `catalog_horizon_age`. `pg_replication_slots.xmin` can hold back cleanup of
user table tuples, while `pg_replication_slots.catalog_xmin` can hold back cleanup of system catalog tuples for logical
replication. Keeping these as separate metrics avoids conflating different failure modes and remediation steps. The raw
`snapshot_xmin` column is included as a cross-version anchor for checking what a fresh transaction can currently see.
