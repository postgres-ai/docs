---
title: "#PostgresMarathon 2-009: Prepared statements and partitioned table lock explosion, part 1"
date: 2025-10-28 12:00:00
authors: nik
tags: [Postgres insights, PostgresMarathon, internals, locks, prepared statements, partitioning]
---

In [#PostgresMarathon 2-008](https://postgres.ai/blog/20251014-postgres-marathon-2-008), we discovered that prepared statements can dramatically reduce `LWLock:LockManager` contention by switching from planner locks (which lock everything) to executor locks (which lock only what's actually used). Starting with execution 7, we saw locks drop from 6 (table + 5 indexes) to just 1 (table only).

There we tested only a simple, unpartitioned table. What happens if the table is partitioned?

<!--truncate-->

The following was tested on Postgres 18.0 with default settings:
- `enable_partition_pruning = on`
- `plan_cache_mode = auto`

Postgres behavior in this field might change in the future — there are WIP patches optimizing performance.

Let's create a simple partitioned table with multiple partitions:

```sql
create table events (
  event_id bigint,
  event_time timestamptz,
  event_data text
) partition by range (event_time);

-- Create 12 monthly partitions
do $$
declare
  i int;
  start_date date;
  end_date date;
begin
  for i in 0..11 loop
    start_date := '2024-01-01'::date + make_interval(months => i);
    end_date := start_date + interval '1 month';
    
    execute format(
      'create table events_%s partition of events for values from (%L) to (%L)',
      to_char(start_date, 'YYYY_MM'),
      start_date,
      end_date
    );
  end loop;
end $$;
```

Result:
```
test=# \d+ events
                                              Partitioned table "public.events"
   Column   |           Type           | Collation | Nullable | Default | Storage  | Compression | Stats target | Description
------------+--------------------------+-----------+----------+---------+----------+-------------+--------------+-------------
 event_id   | bigint                   |           |          |         | plain    |             |              |
 event_time | timestamp with time zone |           |          |         | plain    |             |              |
 event_data | text                     |           |          |         | extended |             |              |
Partition key: RANGE (event_time)
Partitions: events_2024_01 FOR VALUES FROM ('2024-01-01 00:00:00+00') TO ('2024-02-01 00:00:00+00'),
            events_2024_02 FOR VALUES FROM ('2024-02-01 00:00:00+00') TO ('2024-03-01 00:00:00+00'),
            events_2024_03 FOR VALUES FROM ('2024-03-01 00:00:00+00') TO ('2024-04-01 00:00:00+00'),
            events_2024_04 FOR VALUES FROM ('2024-04-01 00:00:00+00') TO ('2024-05-01 00:00:00+00'),
            events_2024_05 FOR VALUES FROM ('2024-05-01 00:00:00+00') TO ('2024-06-01 00:00:00+00'),
            events_2024_06 FOR VALUES FROM ('2024-06-01 00:00:00+00') TO ('2024-07-01 00:00:00+00'),
            events_2024_07 FOR VALUES FROM ('2024-07-01 00:00:00+00') TO ('2024-08-01 00:00:00+00'),
            events_2024_08 FOR VALUES FROM ('2024-08-01 00:00:00+00') TO ('2024-09-01 00:00:00+00'),
            events_2024_09 FOR VALUES FROM ('2024-09-01 00:00:00+00') TO ('2024-10-01 00:00:00+00'),
            events_2024_10 FOR VALUES FROM ('2024-10-01 00:00:00+00') TO ('2024-11-01 00:00:00+00'),
            events_2024_11 FOR VALUES FROM ('2024-11-01 00:00:00+00') TO ('2024-12-01 00:00:00+00'),
            events_2024_12 FOR VALUES FROM ('2024-12-01 00:00:00+00') TO ('2025-01-01 00:00:00+00')
```

Now let's add a few indexes to each partition and collect stats + build visibility maps (without any data, but it's OK for our purposes):

```sql
create index on events (event_id);
create index on events (event_time);
create index on events (event_data);

vacuum analyze events;
```

With 12 partitions and 3 indexes each, we have:
- 1 parent table and its 3 indexes
- 12 partition tables
- 36 partition indexes (12 partitions × 3 indexes)

Total: **52 relations** that could potentially be locked.

Before we begin, let's verify our environment:

```sql
show plan_cache_mode;
```

Should return `auto` (the default). This is critical because we want to observe the natural transition from custom plans (executions 1-5) to generic plans (execution 6+).

Note: We're intentionally testing with empty tables. Since we're studying **lock behavior**, not query execution performance, the presence or absence of data doesn't affect what gets locked. This keeps the test focused and reproducible.

Let's prepare a simple query that targets a single month:

```sql
prepare get_events (timestamptz) as
select event_id, event_data
from events
where event_time = $1;
```

Note: This query (`event_time = $1` for a specific instant) isn't realistic — real systems use ranges. But it's perfect for studying lock behavior because:
- It triggers partition pruning reliably
- Empty tables mean the planner chooses SeqScan, avoiding index-lock complexity
- We can focus purely on the lock manager behavior without query execution noise

Now, similar to what we did in 2-008, let's execute this prepared statement multiple times and check locks:

```sql
-- Run this snippet 10 times
begin;
explain (verbose) execute get_events('2024-06-15');

select
  count(*) as lock_count,
  array_agg(
    distinct relation::regclass
    order by relation::regclass
  ) filter (where relation is not null) as relations_locked
from pg_locks
where
  pid = pg_backend_pid()
  and relation::regclass::text ~ 'events';

select
  generic_plans,
  custom_plans
from pg_prepared_statements
where name = 'get_events';

rollback;
```

Here's what happens (your results may vary based on your PostgreSQL version and configuration):

**Executions 1-5 (custom plans):**
```
                                     QUERY PLAN
------------------------------------------------------------------------------------
 Seq Scan on public.events_2024_06 events  (cost=0.00..0.00 rows=1 width=40)
   Output: events.event_id, events.event_data
   Filter: (events.event_time = '2024-06-15 00:00:00+00'::timestamp with time zone)
 Query Identifier: 7956826248783165125

 lock_count |                                                                                relations_locked
------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
          8 | {events,events_2024_06,events_event_id_idx,events_2024_06_event_id_idx,events_event_time_idx,events_2024_06_event_time_idx,events_event_data_idx,events_2024_06_event_data_idx}
(1 row)

 generic_plans | custom_plans
---------------+--------------
             0 |            1
```

Planning-time partition pruning successfully identifies that we only need partition `events_2024_06`. And we still lock the parent table and all its indexes, plus the specific partition and its indexes. **8 relation-level locks total** (parent table + 3 parent indexes + partition + 3 partition indexes).

**Execution 6 (building generic plan):**
```
 lock_count | relations_locked
------------+------------------
         52 | {events,events_event_id_idx,events_event_time_idx,events_event_data_idx,
               events_2024_01,events_2024_01_event_id_idx,events_2024_01_event_time_idx,events_2024_01_event_data_idx,
               events_2024_02,...[all 52 relations]...}
```

**BOOM**

All 52 relations locked. We went from 8 relation-level locks to 52 relation-level locks. Imagine what happens if we have 1000 partitions...

**Execution 7+ (using cached generic plan with runtime pruning):**

Now something interesting happens — the locks drop dramatically:

```
                                     QUERY PLAN
-------------------------------------------------------------------------------------
 Append  (cost=0.00..0.06 rows=12 width=40)
   Subplans Removed: 11
   ->  Seq Scan on public.events_2024_06 events_1  (cost=0.00..0.00 rows=1 width=40)
         Output: events_1.event_id, events_1.event_data
         Filter: (events_1.event_time = $1)
 Query Identifier: 7956826248783165125

 lock_count |                                                                                       relations_locked
------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
         13 | {events,events_2024_01,events_2024_02,events_2024_03,events_2024_04,events_2024_05,events_2024_06,events_2024_07,events_2024_08,events_2024_09,events_2024_10,events_2024_11,events_2024_12}

 generic_plans | custom_plans
---------------+--------------
             2 |            5
```

**13 relation-level locks** — better than 52, but still problematic. Runtime partition pruning is working ("Subplans Removed: 11"), and we're locking **ALL 12 partitions** even though we only scan one.

Why 13 relation-level locks instead of just 2 (parent + the one partition we need)?

The executor acquires locks on all partitions in `InitPlan()` before runtime pruning occurs in `ExecInitAppend()`. This is a known limitation — the lock acquisition happens too early in the execution pipeline.

Enough for today, we'll continue tomorrow.
