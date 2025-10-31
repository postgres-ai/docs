---
title: "#PostgresMarathon 2-011: Prepared statements and partitioned tables — the paradox, part 3"
date: 2025-10-30 23:59:59
authors: nik
tags: [Postgres insights, PostgresMarathon, internals, locks, prepared statements, partitioning]
---

In [#PostgresMarathon 2-009](https://postgres.ai/blog/20251028-postgres-marathon-2-009) and [#PostgresMarathon 2-010](https://postgres.ai/blog/20251029-postgres-marathon-2-010), we explored why execution 6 causes a lock explosion when building a generic plan for partitioned tables — the planner must lock all 52 relations because it can't prune without parameter values.

Today we'll test what actually happens with different `plan_cache_mode` settings.

<!--truncate-->

Let's test empirically on Postgres 18 with the 12-partition table from the previous posts. This time, we'll insert 1M rows into each partition to get realistic query plans with index scans:

```sql
-- Insert 1M rows into each partition
do $$
declare
  i int;
  start_date date;
  partition_name text;
begin
  for i in 0..11 loop
    start_date := '2024-01-01'::date + make_interval(months => i);
    partition_name := 'events_' || to_char(start_date, 'YYYY_MM');

    execute format(
      'insert into %I (event_id, event_time, event_data)
       select s, %L::timestamptz + (s * interval ''1 second''), ''data_'' || s
       from generate_series(1, 1000000) s',
      partition_name, start_date
    );
  end loop;
end $$;

vacuum analyze events;
```

Now let's see what different `plan_cache_mode` settings do.

Test 1: auto mode

As we already saw, with the default `auto` mode setting, Postgres decides whether to use custom or generic plans based on cost comparison. We saw, that first 5 runs it uses custom plan, then, on the important 6th call, it builds the generic plan (and we have the "lock explosion" we already studied), and then, on 7th call and further, it uses the generic plan.

But that was on empty tables. Here things will be different, because we have data. Let's see.

As before, prepare a statement and execute it multiple times, observing the number of relation-level locks and plan type counters:

```sql
prepare test (timestamptz) as
select event_id, event_data from events where event_time = $1;

-- Run this snippet to test each execution
begin;
explain (verbose) execute test(timestamptz '2024-06-06 00:00:00+00');

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
where name = 'test';

rollback;
```

After running this 10 times:

Result:
```
generic_plans | custom_plans
--------------+-------------
            0 |           10
```

With empty tables (as in part 1), Postgres switched to generic plans after execution 6 because the cost was acceptable. With data and index scans, the generic plan cost is too high due to accessing all partitions, so Postgres continues using custom plans indefinitely. Lock behavior: 8 locks on executions 1-5 and 7+ (parent table + 1 partition + their 6 indexes), but 52 locks on execution 6 when building the generic plan for cost evaluation (even though it's ultimately rejected).

Note: Our example uses only 12 partitions. With 365 daily partitions (1 year) or 1000+ partitions, the lock explosion becomes severe: 1000 partitions with 3 indexes each = 4000+ locks during generic plan building, with most of these locks acquired with fastpath=false. As explained in [#PostgresMarathon 2-004](https://postgres.ai/blog/20251008-postgres-marathon-2-004), only the first 16 locks can use the fastpath — locks beyond that require accessing the shared lock manager, causing significant performance degradation under contention.

Test 2: force_generic_plan

When we force Postgres to use generic plans, the behavior changes dramatically:

```sql
set plan_cache_mode = 'force_generic_plan';

prepare test2 (timestamptz) as
select event_id, event_data from events where event_time = $1;
```

Execution 1 has two phases:
```
QUERY PLAN:
  Append (cost=0.00..8.50 rows=12 width=38)
    Subplans Removed: 11
    -> Index Scan using events_2024_06_event_time_idx on events_2024_06
       Index Cond: (event_time = $1)

Planning phase: 52 locks (parent + 12 partitions + 36 indexes)
Execution phase: 13 locks (parent + 12 partitions, no indexes)
generic_plans: 1, custom_plans: 0
```

During the planning phase, Postgres must lock all relations (parent table + all partitions + all their indexes) to build the generic plan — 52 locks total. Then during the execution phase, `AcquireExecutorLocks()` locks only the parent and all partitions (13 locks), not the indexes.

Execution 2 and beyond use the cached generic plan:
```
QUERY PLAN:
  Append (cost=0.00..8.50 rows=12 width=38)
    Subplans Removed: 11
    -> Index Scan using events_2024_06_event_time_idx on events_2024_06
       Index Cond: (event_time = $1)

Locks: 13 (parent + ALL 12 partitions, no indexes)
Locked tables: events, events_2024_01, events_2024_02, ..., events_2024_12
generic_plans: 2+, custom_plans: 0
```

Even though runtime pruning eliminates 11 partitions and the `EXPLAIN` shows only `events_2024_06` being scanned, `AcquireExecutorLocks()` locks all 12 partitions because they're all in the generic plan's range table. The 13 locks represent the parent table plus all 12 partitions — notably, no index locks are acquired during execution (indexes were locked during planning). This is the O(n) problem — with 1000 partitions, you'd lock 1001 relations on every execution.

Test 3: force_custom_plan

With `force_custom_plan`, behavior is consistent:

```sql
set plan_cache_mode = 'force_custom_plan';

prepare test3 (timestamptz) as
select event_id, event_data from events where event_time = $1;
```

Every execution produces:
```
QUERY PLAN:
  Index Scan using events_2024_06_event_time_idx on events_2024_06
    Index Cond: (event_time = '2024-06-06 00:00:00+00')

Locks: 8 (parent + 1 partition + their 6 indexes)
generic_plans: 0, custom_plans: 1+
```

Consistent, predictable, efficient — but requires re-planning every time.

Summary for testing with data:

| Setting | Exec 1 | Exec 2-5 | Exec 6 | Exec 7+ | Planning | Notes |
|---------|--------|----------|--------|---------|----------|-------|
| `auto` | 8 locks | 8 locks | 52 locks (eval) | 8 or 13 locks* | Every time or 6 | *8 if rejects generic (data), 13 if accepts (empty) |
| `force_generic_plan` | 52 locks | 13 locks | 13 locks | 13 locks | Once | Lock explosion on exec 1, then O(n) |
| `force_custom_plan` | 8 locks | 8 locks | 8 locks | 8 locks | Every time | Consistent, explicit |

Now here's where it gets weird. Remember why we use prepared statements with generic plans in the first place? From [#PostgresMarathon 2-008](https://postgres.ai/blog/20251014-postgres-marathon-2-008), we learned that prepared statements help reduce `LWLock:LockManager` contention by switching from planner locks to executor locks. And, of course, prepared statements, by design, are aimed to get rid of the planning time, which is supposed to improve overall latencies.

For unpartitioned tables, this works beautifully. Custom plans during executions 1-5 acquire 6 locks (planner locks on all indexes), while generic plans from execution 7 onward acquire only 1 lock (executor lock on the table). We invented this optimization to avoid lock contention.

But with partitioned tables, the solution becomes the problem. Custom plans acquire 8 locks (parent + 1 partition + indexes), which is efficient. Generic plan building in execution 1 causes a lock explosion of 52 locks. Subsequent executions with the cached generic plan acquire 13 locks (all partitions) every time. The optimization we came for actually increases lock contention.

Isn't it an irony? We use prepared statements to avoid re-planning and reduce lock contention, but with partitioned tables, we need to disable the prepared statement optimization (plan caching) to avoid lock contention.

The obvious question arises: doesn't re-planning on every execution have overhead? Yes, and this is the real trade-off. With `force_custom_plan`, you get consistent 8 locks every time and no lock explosion risk, but you pay planning overhead on every execution and lose plan caching benefits. With `force_generic_plan`, you pay planning cost once and cache the result, avoiding re-planning overhead, but execution 1 causes 52 locks (again, this is in our simple case, with just 12 partitions and 4 indexes) and execution 2+ causes 13 locks with O(n) scaling relative to partition count.

Is planning overhead worse than locking overhead? With partitioned tables, planning involves partition pruning logic. With 12 partitions, planning is fast. In some cases, planning may be expensive. The O(n) locking overhead typically dominates the planning cost, especially with many partitions.

Amit Langote has been working on this problem, with preparatory work in early 2025. The main optimization to move runtime pruning before `AcquireExecutorLocks()` is still work in progress, discussed in the [pgsql-hackers thread](https://www.postgresql.org/message-id/flat/CA+HiwqGKid5q1KnOg3ih7pJ+tpxUKmWS=KpoiBLoRfMCcHig0g@mail.gmail.com). When this lands, executor lock acquisition will only lock the partitions that survive runtime pruning, so generic plan execution 2+ would acquire only 8 locks (parent + 1 partition + indexes), making generic plans viable again for partitioned tables.

There's still a catch: the planner's cost estimation still sees generic plans as expensive, so even with the optimization, `auto` mode may keep choosing custom plans. As Amit notes in [his 2022 blog post](https://amitlan.com/2022/05/16/param-query-partition-woes.html), "Till that's also fixed, users will need to use `plan_cache_mode = force_generic_plan` to have plan caching for partitions." This recommendation applies to future Postgres versions with his locking optimization — for current versions without it, the situation is different.

Note: Throughout this post, we've been examining SQL-level prepared statements (created with `PREPARE`/`EXECUTE` commands). Most applications use protocol-level prepared statements through drivers (JDBC, psycopg2, etc.). While the underlying behavior should be similar, protocol-level prepared statements warrant dedicated analysis due to driver-specific differences in plan caching control and visibility.

For current Postgres versions (without Amit's optimization), first check what's actually happening:

```sql
select name, query, generic_plans, custom_plans
from pg_prepared_statements
where query ~ 'your_partitioned_table';
```

Then consider these options:

1. If you observe `auto` choosing custom plans (`generic_plans = 0`):
   - Consider `force_custom_plan` to avoid execution 6 lock explosion
   - Accept re-planning overhead as lesser evil than lock contention

2. If planning is very expensive and partitions are few:
   - Consider `force_generic_plan` despite O(n) locking
   - Accept one-time lock explosion and ongoing validation overhead

3. If `LWLock:LockManager` contention isn't critical:
   - Consider not using prepared statements at all
   - Let planning-time pruning minimize locks naturally

The situation will change once Amit's optimization lands in future Postgres versions, where `force_generic_plan` will become more viable (as Amit recommends) because execution 2+ will only lock pruned partitions.

Key takeaways:

- with `auto` mode, Postgres evaluates generic plan cost on execution 6 (causing brief lock explosion — locking all relations: parent table and its indexes + all partitions and their indexes), then decides whether to use generic or custom plans based on cost comparison; in our test with data and index scans, it rejected generic plans and continued with custom plans, while with empty tables and seq scans (as in part 1), it accepted generic plans
- with `force_generic_plan`, execution 1 causes lock explosion (locking all relations — parent table and its indexes + all partitions and their indexes), and execution 2+ locks all partitions (13 locks in our test, scaling O(n) with partition count) even though runtime pruning eliminates most of them
- with `force_custom_plan`, all executions consistently use 8 locks (parent + 1 partition + indexes) with planning-time pruning, but require re-planning every execution
- the decision depends on your specific workload: partition count, planning cost, execution frequency, and whether `LWLock:LockManager` contention is a concern
- Amit Langote's ongoing work will fix the O(n) executor lock acquisition problem, making `force_generic_plan` viable for partitioned tables in future Postgres versions (though lock explosion on execution 1's planning phase will still occur — locking all relations: parent + all partitions + all indexes)
- these findings apply to SQL-level prepared statements; protocol-level prepared statements likely behave similarly but it is worth studying their behavior separately
- the prepared statement + partitioned table interaction reveals a fundamental paradox in database optimization: a solution optimized for one scenario (unpartitioned tables) becomes a problem in another (partitioned tables)

Sometimes the best optimization is knowing when not to use an optimization.
