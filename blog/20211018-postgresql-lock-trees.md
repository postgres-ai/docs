---
author: "Nikolay Samokhvalov"
authorimg: /assets/images/nik.jpg
date: 2021-10-18 10:05:00
publishDate: 2021-10-18 10:05:00
linktitle: "Useful queries to analyze PostgreSQL lock trees (a.k.a. lock queues)"
title: "Useful queries to analyze PostgreSQL lock trees (a.k.a. lock queues)"
weight: 0
image: /assets/thumbnails/postgresql-query-for-lock-trees-analysis-2.png
tags:
  - PostgreSQL locks
  - Monitoring
  - Troubleshooting
---

import { AuthorBanner } from '../src/components/AuthorBanner'
import { DbLabBanner } from '../src/components/DbLabBanner'

<p align="center">
    <img src="/assets/thumbnails/postgresql-query-for-lock-trees-analysis-2.png" alt="Example output of the query for 'lock trees' analysis"/>
</p>

For OLTP workloads (such as web and mobile applications), it is important to understand object-level and row-level locks in PostgreSQL. There are several good materials that I can recommend reading:
- the official documentation is a must-read, as usual: ["13.3. Explicit Locking"](https://www.postgresql.org/docs/current/explicit-locking.html) (do not be confused by the title – this article discusses not only explicit locks that we can add using queries like [`LOCK TABLE ...`](https://www.postgresql.org/docs/current/sql-lock.html) or [`SELECT ... FOR UPDATE`](https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE) or functions like [`pg_advisory_lock(..)`](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS) but also the locks introduced by regular SQL commands such as `ALTER` or `UPDATE`)
- ["PostgreSQL rocks, except when it blocks: Understanding locks"](https://www.citusdata.com/blog/2018/02/15/when-postgresql-blocks/) (2018) by Marco Slot – a great extension to the docs, explaining some aspects and conveniently "translating" the table provided in the docs from "lock language" to "SQL command language"
- As usual, a thorough and deep explanation of how PostgreSQL works by Egor Rogov:
    - ["Locks in PostgreSQL: 1. Relation-level locks"](https://postgrespro.com/blog/pgsql/5968005) (2020)
    - ["Locks in PostgreSQL: 2. Row-level locks"](https://postgrespro.com/blog/pgsql/5967999) (2020)

When it comes to the lock monitoring and troubleshooting, you can start with basic queries collected at these PostgreSQL Wiki pages:
- [Lock Monitoring](https://wiki.postgresql.org/wiki/Lock_Monitoring)
- [Lock dependency information](https://wiki.postgresql.org/wiki/Lock_dependency_information)

For more convenient (hence faster, in many cases) troubleshooting, you might want to use some advanced query, presenting results in a form that allows you to quickly:
- find the "offending" queries – those that are the "roots" of each blocking tree (a.k.a. "lock queues", "wait queues", or "block chains"; in a recent post, we've discussed and demonstrated how queries requiring to acquire locks may organize multiple lock queues, see ["Zero-downtime Postgres schema migrations need this: lock_timeout and retries. Problem demonstration"](https://postgres.ai/blog/20210923-zero-downtime-postgres-schema-migrations-lock-timeout-and-retries#problem-demonstration)), and
- decide what to do to fix it – either understand the source of the query (application or human) or just grab the PID and use `pg_cancel_backend(..) / pg_terminate_backend(..)` to interrupt to release the locks and unblock other sessions.

Here are two examples of other people's work that you might find helpful
- "Active Session History in PostgreSQL: blocker and wait chain" by Bertrand Drouvot – this post describes the recursive CTE query [`pg_ash_wait_chain.sql`](https://github.com/pgsentinel/pg_ash_scripts/blob/master/pg_ash_wait_chain.sql) that is useful for those who use the [pgsentinel](https://github.com/pgsentinel/pgsentinel) extension. The query is inspired by Tanel Poder's script for Oracle.
- [`locktree.sql`](https://github.com/dataegret/pg-utils/blob/master/sql/locktree.sql) – query to display a tree of blocking sessions based on the information from  `pg_locks` and `pg_stat_activity`, by Victor Yegorov.

I've experimented with the latter for some time and eventually started to add some additional bits of information to it – first of all, based on `pg_locking_pids(..)` [introduced in PostgreSQL 9.6](https://paquier.xyz/postgresql-2/postgres-9-6-feature-highlight-pg-blocking-pids/). At some point, I rewrote the query from scratch, so consider it as the third option for the "advanced" lock issue troubleshooting.

The function `pg_locking_pids(..)`, [per documentation](https://www.postgresql.org/docs/current/functions-info.html), should not be used often:
> Frequent calls to this function could have some impact on database performance, because it needs exclusive access to the lock manager's shared state for a short time.

Still, it is very useful, so I recommend using it as an ad hoc tool, with additional protective measures:
- do not run it frequently and avoid using it in monitoring,
- use low values for `statement_timeout` to minimize the possible impact on other sessions.

It is now time to discuss the query itself. As the first step, let's enabling timing reporting and set a low value for `statement_timeout`:
```
\timing on
set statement_timeout to '100ms';
```

And now run the query:
```sql
with recursive activity as (
  select
    pg_blocking_pids(pid) blocked_by,
    *,
    age(clock_timestamp(), xact_start)::interval(0) as tx_age,
    age(clock_timestamp(), state_change)::interval(0) as state_age
  from pg_stat_activity
  where state is distinct from 'idle'
), blockers as (
  select
    array_agg(distinct c order by c) as pids
  from (
    select unnest(blocked_by)
    from activity
  ) as dt(c)
), tree as (
  select
    activity.*,
    1 as level,
    activity.pid as top_blocker_pid,
    array[activity.pid] as path,
    array[activity.pid]::int[] as all_blockers_above
  from activity, blockers
  where
    array[pid] <@ blockers.pids
    and blocked_by = '{}'::int[]
  union all
  select
    activity.*,
    tree.level + 1 as level,
    tree.top_blocker_pid,
    path || array[activity.pid] as path,
    tree.all_blockers_above || array_agg(activity.pid) over () as all_blockers_above
  from activity, tree
  where
    not array[activity.pid] <@ tree.all_blockers_above
    and activity.blocked_by <> '{}'::int[]
    and activity.blocked_by <@ tree.all_blockers_above
)
select
  pid,
  blocked_by,
  tx_age,
  state_age,
  backend_xid as xid,
  backend_xmin as xmin,
  replace(state, 'idle in transaction', 'idletx') as state,
  datname,
  usename,
  wait_event_type || ':' || wait_event as wait,
  (select count(distinct t1.pid) from tree t1 where array[tree.pid] <@ t1.path and t1.pid <> tree.pid) as blkd,
  format(
    '%s %s%s',
    lpad('[' || pid::text || ']', 7, ' '),
    repeat('.', level - 1) || case when level > 1 then ' ' end,
    left(query, 1000)
  ) as query
from tree
order by top_blocker_pid, level, pid
\watch 10
```

Note that I've used:
- a low `statement_timeout` value, as discussed, and
- `\watch 10` instead of `;` – this tells psql to run it in an infinite loop, with 10-second pauses (you can always interrupt it using `Ctrl-C`).

Here is an example output:
```
  pid  |  blocked_by   |  tx_age  | state_age | xid | xmin | state  | datname | usename |        wait        | blkd |                        query
-------+---------------+----------+-----------+-----+------+--------+---------+---------+--------------------+------+------------------------------------------------------
 46015 | {}            | 00:08:06 | 00:07:58  | 735 |      | idletx | test    | nik     | Client:ClientRead  |    4 | [46015] update table1 set id = id;
 46017 | {46015}       | 00:07:55 | 00:07:50  | 736 |  735 | active | test    | nik     | Lock:transactionid |    3 | [46017] . delete from table1 ;
 46023 | {46017,46015} | 00:07:47 | 00:07:35  | 737 |  735 | active | test    | nik     | Lock:relation      |    2 | [46023] .. alter table table1 add column data jsonb;
 46019 | {46023}       | 00:07:23 | 00:07:23  |     |  735 | active | test    | nik     | Lock:relation      |    0 | [46019] ... select * from table1 where id = 1;
 46021 | {46023}       | 00:07:31 | 00:07:31  |     |  735 | active | test    | nik     | Lock:relation      |    0 | [46021] ... select * from table1;
 46081 | {}            | 00:06:32 | 00:06:25  | 739 |      | idletx | test    | nik     | Client:ClientRead  |    1 | [46081] drop table table2;
 46084 | {46081}       | 00:06:20 | 00:06:20  |     |  735 | active | test    | nik     | Lock:relation      |    0 | [46084] . select * from table2;
(7 rows)
```
