---
title: "The hidden costs of CREATE TEMP TABLE: catalog bloat and LWLock:SInvalWrite"
date: 2026-11-18 12:00:00
slug: 20261118-hidden-costs-of-create-temp-table
authors: [nik]
description: "Postgres 18: a CTE ran 23x the TPS of a temp table per transaction. With 5000 idle sessions, temp-table DDL got 127 and 249 of a 500 TPS target in two runs."
image: /assets/blog/20261118-temp-tables-sessions-card2.png
hide_cover_image: true
tags: [Postgres insights, performance, temporary tables, wait events, Postgres.FM]
---

import { BlogFigure } from '@site/src/components/BlogFigure'
import QueueFigure from '@site/src/components/QueueFigure'
import SessionsHero from '@site/src/components/SessionsHero'

<div className="pgai-longread">

<div className="pgai-hero">

<SessionsHero
  stem="/assets/blog/20261118-temp-tables-sessions"
  alt="An abstract drawing: thin lines, each one a database session, and orange marks that move along them."
/>

<p className="pgai-hero-deck">For years I warned against creating temporary tables in hot code because of catalog bloat. This time I measured it. The bloat was real, and it was only one of the costs.</p>

</div>

<p className="pgai-lede">What does <code>CREATE TEMP TABLE</code> cost if your code runs it in every transaction? On Postgres 18, two things:</p>

1. **Catalog rows and files, every time.** A temp table per transaction ran at 3783 TPS, one that each session keeps at 17866, and a CTE doing the same work at 86997 (16 vCPU, no idle sessions). Creating and dropping the table explains the 4.7x step from 17866 to 3783.
2. **The shared invalidation queue, when there are many sessions.** With 5000 idle sessions and a 500 TPS target, temp-table DDL got 127 TPS in one run and 249 in another.

We measured it with [DBLab Forge](/products/dblab-forge), a system that runs full-scale synthetic database experiments to study Postgres behavior and anomalies. The real case behind it is from [Kirk Wolak](https://www.linkedin.com/in/kirk-wolak-7706737/), whose team moved a busy search system from Oracle and kept temp tables in its most frequent query.

Every number here comes from the [DBLab Forge study brief](https://console.postgres.ai/shared/brief/dfe99713-f5a8-483b-9aab-1606a883b75d). Kirk and I discuss it in [Postgres.FM episode 196](https://postgres.fm/episodes/the-hidden-costs-of-create-temp-table).

</div>

<!--truncate-->


<div className="pgai-longread">

<figure>

<iframe
  style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', border: 0 }}
  src="https://www.youtube-nocookie.com/embed/gAdhpYewLZ8"
  title="Postgres.FM episode 196: The hidden costs of CREATE TEMP TABLE"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerPolicy="strict-origin-when-cross-origin"
  allowFullScreen
></iframe>

<figcaption>Postgres.FM episode 196, with Kirk Wolak. Corrections to what we said on air are at the end of the <a href="https://postgres.fm/episodes/the-hidden-costs-of-create-temp-table/transcript">episode transcript</a>.</figcaption>

</figure>

<div className="pgai-box">

**In short**

- **Cost 1, always: catalog rows and files.** Each create and drop of a 2-column temp table inserts and deletes 31 catalog rows and creates and removes 3 files. A temp table that each session keeps ran 4.7x faster than one per transaction, and a CTE 23x faster.
- **Cost 2, with many sessions: the shared invalidation queue.** Every backend must read every invalidation message, idle ones too. With 5000 idle sessions, temp-table DDL got 127 of 500 TPS in one run and 249 in another.
- **What to check.** `LWLock:SInvalWrite` in active session history, connections against `max_connections`, and catalog delete rates ([checklist](#what-to-do)).
- **What to change.** Take temp tables out of hot code. Keep idle connections low with a pooler.

</div>

## What we expected, and what we found

I expected the shared invalidation queue to be the bottleneck, because a temp table is DDL, and DDL sends invalidation messages to every session through one small shared queue. Without idle sessions, this was wrong. The temp-table pattern stopped scaling at about 3000 to 4000 TPS on 16 vCPU, and waits on the queue stayed under 1% of active samples.

The 23x has two parts. Catalog and file work explains the step from 17866 to 3783 TPS, about 4.7x, between a temp table that the session keeps and one per transaction. The rest, from the CTE's 86997 to 17866, is the cost of using a temp table at all. The invalidation queue became the limit only when a steady DDL rate ran next to many connections, idle ones included.

## Cost 1: catalog rows and files, every time

Each transaction of the test puts 100 rows into a work area and reads them back. Here is the temp-table version, run by `pgbench` in every transaction:

```sql
begin;
create temp table t (id int, v text) on commit drop;
insert into t select id, v from src where id between :a and :a + 99;
select count(*), max(v) from t;
commit;
```

The other versions use a CTE, or a temp table that each session creates once and then empties with `ON COMMIT DELETE ROWS`, `TRUNCATE` or `DELETE`.

<BlogFigure n={1} src="/assets/blog/20261118-temp-tables-fig-tp2.svg" variants alt="Transactions per second at 32 clients, Postgres 18.6, 16 vCPU, 0 idle sessions, median of 4 runs: CTE with no table 86997; temp table created once per session with ON COMMIT DELETE ROWS 17866; created once, TRUNCATE in each transaction 4405; CREATE TEMP TABLE with ON COMMIT DROP in each transaction 3783; created once, DELETE in each transaction 1514.">

**A CTE did the same work 23x faster than a temp table per transaction.** Postgres 18.6, 16 vCPU, 32 clients, 0 idle sessions, median of 4 runs. Postgres 17 was within 4% for these patterns. With `temp_tablespaces` on tmpfs and a fresh catalog, the temp table per transaction reached 4100 to 4950 TPS (those runs had no CTE).

</BlogFigure>

<div className="pgai-table">

| Pattern | TPS | Invalidation messages per transaction | What it leaves behind |
|---|---:|---:|---|
| CTE, no table | 86997 | 0 | nothing in the catalogs |
| once per session, `ON COMMIT DELETE ROWS` | 17866 | 5 | no dead tuples, no catalog rows, 3 `ACCESS EXCLUSIVE` locks per commit |
| once per session, `TRUNCATE` in each transaction | 4405 | 14 | new files for the table, TOAST table and index, and 3 `pg_class` rows updated |
| `CREATE TEMP TABLE ... ON COMMIT DROP` in each transaction | 3783 | 132 | 31 catalog rows inserted and 31 deleted, 3 files created and removed |
| once per session, `DELETE` in each transaction | 1514 | 0 | dead tuples in the temp table |

</div>

Message counts: measured on Postgres 18.6 for the table `(id int, v text)`, identical on 17.11.

The CTE transaction is read-only: it gets no transaction ID and writes no WAL. A temp table that the session keeps with `ON COMMIT DELETE ROWS` writes the 100 rows into local buffers and reads them back, and at each commit it truncates the table under three `ACCESS EXCLUSIVE` locks. With `wal_level = replica`, the default, Postgres writes these locks to WAL for standbys, so the transaction gets a transaction ID, writes a commit record and, with `synchronous_commit = on`, waits for the WAL flush. The kept temp table pays all of this and the CTE does not, in the step from 86997 to 17866 TPS. Creating and dropping the table in each transaction adds the catalog rows and files, from 17866 to 3783.

### What one temp table writes to the catalogs

The rows of a temp table live in the local buffers of its session, and another session gets `cannot access temporary tables of other sessions`, also as a superuser. Its name, columns, size and activity counters are visible to all in `pg_class`, `pg_attribute` and `pg_stat_all_tables`, under schema `pg_temp_N`. After the owner runs `ANALYZE`, sample values of its data are in `pg_statistic`, which a superuser can read through `pg_stats`.

The metadata are ordinary rows in the system catalogs of the database (schema `pg_catalog`). On Postgres 18.6, `CREATE TEMP TABLE t (id int)` inserts 13 of them:

- `pg_class`: 1, the table;
- `pg_type`: 2, the row type `t` and its array type `t[]`;
- `pg_attribute`: 7, the column `id` and the six system columns that each table has (`ctid`, `xmin`, `cmin`, `xmax`, `cmax`, `tableoid`);
- `pg_depend`: 3, the links that let `DROP` find all of the above.

The table in our benchmarks, `(id int, v text)`, inserts 31 rows and updates one. One row is the new column. The other 17 exist because a `text` value can be too large for a page, so Postgres also creates a TOAST table (schema `pg_toast_temp_N`) and an index on it: 2 more rows in `pg_class`, 11 in `pg_attribute`, 1 in `pg_index`, 3 in `pg_depend`. The update stores the TOAST table's OID in the table's `pg_class` row. We counted the rows on Postgres 18.6 and 17.11 and got the same result. The code is in [`heap_create_with_catalog()`](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/catalog/heap.c#L1139) and `create_toast_table()`.

`DROP TABLE`, or `ON COMMIT DROP` at commit, deletes the catalog rows inside the transaction and removes the files after the commit.

Inside the transaction, it deletes the same 31 catalog rows. Postgres reads `pg_depend` to find everything that belongs to the table (the row type, the array type, the TOAST table and its index), takes an `ACCESS EXCLUSIVE` lock on each relation, and deletes the rows.

During the transaction, Postgres only notes which files to remove. When the commit record is written and the locks are released, the backend unlinks the three files: table, TOAST table and TOAST index. For a temp table this is an immediate `unlink()`. About 64% of the time of the temp-table backends was in the kernel, in path lookup and unlink of these files, and moving `temp_tablespaces` to tmpfs gave +27% TPS (one 60-second run each). No wait event covers the `unlink()`, or the `open()` that created the file, so in a wait-event chart this time is `CPU*` (more on this mark below).

Kirk's system ran 10 million queries a day, each with two temp tables and an index. At the minimum shape, with one `int` column per table, that is 30 catalog rows in and 30 out per query, at least 600 million catalog row changes a day.

### Dead tuples and bloat

Each deleted catalog row is a dead tuple. At 128 clients, a temp table per transaction grew `pg_attribute` by 737 to 839 MiB in about 70 seconds, with autovacuum on (medians on Postgres 18 and 17).

I use *bloat* for the excess empty space left behind after dead tuples are cleaned up, and I count the dead tuples themselves separately. The [glossary](https://www.postgresql.org/docs/current/glossary.html#GLOSSARY-BLOAT) is broader and counts "outdated row versions" as bloat too. Under MVCC, an older row version can still be visible to another transaction, and Postgres must keep it while it is needed.

Autovacuum never processes a temp table, and only the session that owns it can vacuum it. It does process the system catalogs, so it removes the dead catalog rows. Postgres reuses the freed space for new catalog rows, and the catalog files rarely shrink, because `VACUUM` can cut only empty pages at the end of a file. `VACUUM FULL` on a catalog gives the space back, and it locks the catalog while it runs.

A long-lived temp table that you empty with `DELETE` collects dead tuples of its own. Autovacuum [cannot vacuum or analyze it](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-TEMPORARY), so the owning session must run `VACUUM` itself, as Kirk's team had to with `VACUUM ANALYZE`. Two more limits:

- **A long-lived temp table holds back freezing** of the database until the session vacuums or drops it, or disconnects.
- **Temp tables work only on the primary.** Kirk's team dropped them when the client wanted read-only replicas near its users in Asia.

## Cost 2: the shared invalidation queue

Each backend keeps its own caches of catalog data: single catalog rows (the catalog cache), and one ready-made descriptor per table and index (the relation cache). When a transaction changes a catalog row, the other backends must stop using their copies. Postgres tells them through *shared invalidation*, "sinval" for short.

There is one invalidation queue per Postgres instance, for all databases. It is a ring of 4096 slots in shared memory, and a slot holds one 16-byte message. A message carries no data, only "a row whose key has this hash changed in this catalog cache" or "the descriptor of this relation changed". A backend that reads it removes the matching entries from its cache, if it has any, and reads the catalog again when it next needs them.

A backend that commits a catalog change appends its messages to the queue, at most 64 per step. For each step it takes `SInvalWriteLock` in exclusive mode, and a wait for this lock is `LWLock:SInvalWrite`.

Postgres sends these messages for temp tables too. The comment in [`inval.c`](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/utils/cache/inval.c#L88-L95) explains why:

```c
 *	Currently, inval messages are sent without regard for the possibility
 *	that the object described by the catalog tuple might be a session-local
 *	object such as a temporary table.  This is because (1) this code has
 *	no practical way to tell the difference, and (2) it is not certain that
 *	other backends don't have catalog cache or even relcache entries for
 *	such tables, anyway; there is nothing that prevents that.  It might be
 *	worth trying to avoid sending such inval traffic in the future, if those
 *	problems can be overcome cheaply.
```

### Where 132 messages come from

One transaction of the benchmark, which creates and drops the table `(id int, v text)`, sends 132 invalidation messages. We counted them on Postgres 18.6 and 17.11 with a logging patch in one session. The probes in the Forge runs counted 133.5 per transaction.

A catalog row can be cached under more than one key, and each key gets its own message. The 19 `pg_attribute` rows are cached by column name and by column number: 38 messages when they are inserted, 38 when they are deleted. The rest:

- 22 for the `pg_class` rows;
- 8 for `pg_type` and 2 for `pg_index`;
- 8 for the `pg_depend` rows, which have no cache and send a "take a new catalog snapshot" message instead, one per internal command step that changed `pg_depend` (3 in `CREATE`, 5 in `DROP`);
- 13 that tell backends to rebuild a table or index descriptor;
- 3 that tell them to close the removed files.

`CREATE` accounts for 71 and `DROP` for 61. Each additional column adds 4.

### One backend and the queue

Take one backend, with its own read position in the queue. At the start of each transaction, and each time it locks a table, it reads the messages between its position and the newest one, 32 at a time, and applies them.

An idle backend waits for its client and reads nothing, so messages pile up behind it. A slot can be used again only when all backends have read it, so one sleeping backend holds the queue's tail in place. When a backend is more than 2048 messages behind, half of the queue, a writer sends a catch-up signal to the one that is furthest behind. That backend wakes at once, reads its backlog in an empty transaction, and passes the signal on to the next one. In `pg_stat_activity` it stays `idle` while it does this. A backend that is idle in a transaction does the same, while one that is busy in a long statement reads only when it next locks a table or finishes.

If the writers need a slot that a backend has not read, they mark that backend for a reset and take the slot without waiting. The backend missed messages, so the next time it reads, it must treat all of its caches as stale: it discards all cached catalog rows, discards or rebuilds all table descriptors, and marks all cached plans invalid. Its next queries read the catalogs and plan again, until the caches are warm. That backend was *lapped*, and this is a *full cache reset*.

Fig. 2 shows the queue in five steps. Steps 1 to 4 follow one backend that does not read: what it must read, what makes it catch up, and the reset when it is lapped. Step 5 adds thousands of idle sessions and shows what they cost. In the figure, a session is one backend.

<QueueFigure n={2} src="/assets/blog/20261118-temp-tables-fig-queue8.svg" alt="Five steps on one ring of 4096 queue slots. 1, write: a session creates and drops a temp table, which puts 132 invalidation messages into the queue, 71 for CREATE and 61 for DROP. 2, read: an active session reads the new messages at its next transaction start; an idle session does not read, so the unread part of the ring grows behind it. 3, catch up: in transaction 16 the queue passes half full, 2048 of 4096 slots; the writer signals the session that is furthest behind, which wakes up, reads its backlog and takes the lock SInvalWrite to pass the signal on. 4, lapped: a session that does not read in time is lapped. A session in a long statement does not act on the signal; 31 transactions fill the queue, transaction 32 laps the session, and it must reset all its caches. 5, at scale: with 5000 idle sessions only one is signalled at a time, the writer laps most of the others, and the writers wait for the lock. Measured on Postgres 18.6 with 16 writers at a target of 500 TPS, for 0, 1000, 3000 and 5000 idle sessions: 502, 502, 274 and 127 temp-table TPS, and 249 at 5000 idle in a second run on another server; LWLock:SInvalWrite 1.3%, 54%, 86% and 91% of the writers' active time; 0.1, 49, 194 and 457 full cache resets per second.">

**Every session must read every message, and idle ones read late.** Steps 1 to 4 are a schematic with the constants of `sinvaladt.c` and the message count of our test table. Step 5 uses the TPS, lock waits and reset rates that we measured, drawn 50 times slower. The design is from Tom Lane's [2008 rewrite](https://github.com/postgres/postgres/commit/fad153ec45299bd4d4f29dec8d9e04e2f1c08148) (Postgres 8.4): two locks, a reset only for the sessions that are lapped, one catch-up signal at a time. The size of 4096 slots is older. It was set in 1999, and the rewrite kept it. [Its benchmark](https://www.postgresql.org/message-id/373.1213813174@sss.pgh.pa.us) was 40 clients that each create and drop a temp table: 485 TPS before the rewrite, 700 after. The test had no idle sessions, and all 40 clients were busy.

</QueueFigure>

Each write step flags all connected backends. While the queue is more than half full, each 256 messages written cause one cleanup that locks the whole queue and scans all connected backends, and each backend that ends a catch-up does one more. That cleanup takes `SInvalWriteLock` in exclusive mode too, so woken idle backends queue for the same lock as the sessions that need it to commit. The cost of writing grows at least with the message rate times the number of connections.

A back-of-the-envelope figure shows how fast a backend gets lapped. With 4096 slots and 132 messages per transaction, 31 such transactions fill the queue if one reader makes no progress at all. The catch-up signal goes out earlier, when that reader is 2048 messages behind, which is during the 16th transaction. At 500 TPS, 31 transactions take 62 ms. With thousands of idle backends and one signal at a time, the ones that wait for their turn get lapped.

### What idle sessions did

We ran 500 temp-table TPS from 16 clients, next to 32 busy clients doing primary-key lookups, and added up to 5000 idle sessions.

<BlogFigure n={3} src="/assets/blog/20261118-temp-tables-fig-idle6.svg" variants alt="Temp-table transactions per second achieved against idle sessions, target 500: 0 idle 502 TPS with LWLock:SInvalWrite at 1.3% of the DDL sessions' active samples; 1000 idle 502, 54%; 3000 idle 274, 86%; 5000 idle 127, 91%. Nothing was measured between the points (dashed lines). A second run on another server got 249 TPS at 5000 idle (hollow marker).">

**Idle sessions cut the temp-table rate from 502 to 127 TPS in one run, and to 249 in a second.** Postgres 18.6, 16 vCPU, 500 TPS target, one run per point. The hollow marker is a second run on another server. Full cache resets per second over all backends: 0.1, 49, 194 and 457 at 0, 1000, 3000 and 5000 idle. With a less busy CPU, the drop was smaller: 299 TPS at 5000 idle.

</BlogFigure>

The 32 lookup clients did no DDL and still lost 27 to 29% of their TPS, with 1000 to 5000 idle sessions, against the same idle count without DDL. The queue serves the whole instance. Every backend reads every message and skips one for another database only after reading it, and the cleanups and catch-up signals cover all backends too. So temp-table DDL in one database costs the sessions of every database on the instance.

In this first run, at 5000 idle sessions, the 16 DDL sessions spent 91% of their active samples waiting on `LWLock:SInvalWrite`, counting only sessions in state `active`. The second run, on another server, sampled all backends with `pg_wait_sampling`, the idle ones included:

<BlogFigure n={4} src="/assets/blog/20261118-temp-tables-fig-waits3.svg" variants alt="Share of wait samples of all backends, 500 temp-table TPS target, second server: with 0 idle sessions CPU* 95.0%, LWLock 3.1%, IO 1.8%; with 5000 idle sessions LWLock:SInvalWrite 84.7%, other LWLock 3.4%, CPU* 11.7%, IO 0.13%.">

**With 5000 idle sessions, 84.7% of the samples of all backends were `LWLock:SInvalWrite`.** Second run, on another server (DDL at 501 and 249 TPS). `pg_wait_sampling` sampled every backend, the woken idle backends included, with `Client` and `Activity` waits left out. CPU* is green, IO blue, LWLock red.

</BlogFigure>

CPU* marks active samples with no wait event. PostgresAI tools add the asterisk because such samples can be CPU work or a wait that Postgres does not instrument, like the file creation and removal above (see [gaps.wait.events](https://gaps.wait.events/#relation-files)). Most of the `LWLock:SInvalWrite` samples in this chart come from woken idle backends, which do their catch-up while `pg_stat_activity` shows them as `idle`.

With 1000 idle sessions and only 100 DDL TPS, the catch-up work of the idle backends took about 1.4 to 2 vCPU.

### What about `LWLock:LockManager`?

A higher `max_locks_per_transaction` does not remove `LWLock:LockManager` here. The setting helps when sessions hold more light locks than they have fast-path slots, and since Postgres 18 it sets the number of those slots ([how the fast path works](/blog/20251008-postgres-marathon-2-004), [benchmarks](/blog/20251009-postgres-marathon-2-005)). Creating our table takes three `ACCESS EXCLUSIVE` locks, on the table, its TOAST table and the TOAST index. A lock in this mode conflicts with all others, so it can never sit in a backend's private fast-path slots ([`lock.c`](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/storage/lmgr/lock.c#L267-L272): only modes below `SHARE UPDATE EXCLUSIVE` qualify). It always goes through the shared lock manager, on Postgres 17 and 18, with any setting. Our idle-session runs used `max_locks_per_transaction = 256`. In two runs with 1024, `LWLock:LockManager` was still 12.7% and 6.6% of the active samples of the lookup clients (13.6% and 23.3% at 256), and about 1% in the DDL sessions.

A strong lock also costs the other sessions. Before Postgres grants it, [`FastPathTransferRelationLocks()`](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/storage/lmgr/lock.c#L2829-L2850) visits every backend slot of the instance, about `max_connections` of them, and takes each slot's fast-path lock. While the strong lock is held, no session can take a fast-path lock on a relation that maps to the same one of 1024 counters, so such locks go to the shared lock table and its partition locks, `LWLock:LockManager`. This is my leading candidate for the waits of the lookup clients, which did no DDL. It is a hypothesis, and a rerun with `max_connections = 100` instead of 6000 would settle it.

## Hot standbys

In one run we created and dropped temp tables on the primary at 2000 TPS for 60 seconds. The standby, with 16 read clients and no idle sessions, ended 731 MiB of WAL behind (`sent_lsn` minus `replay_lsn`), about 24 seconds, and needed 33 more seconds to catch up. With 3000 idle sessions on it, the lag reached 1065 MiB.

A standby creates no files for temp tables. Per transaction it replays the catalog rows, three `ACCESS EXCLUSIVE` lock records, 129 invalidation messages, and one control-file fsync. The fsync is there because, since Postgres 15, the commit record lists dropped statistics entries, replay flushes WAL before it drops them, and on a standby that flush updates the minimum recovery point in the control file. The one replay process spent 60 to 64% of its CPU samples taking the replayed locks. My leading candidate is the same slot walk, with `max_connections = 6000`. One run, both nodes on one server, so this is a hypothesis; a rerun with `max_connections = 100` would settle it.

## What to do

Check three signals:

1. **`LWLock:SInvalWrite` in aggregated active session history.** Postgres 12 and older name it `SInvalWriteLock`. Even a few samples are worth a look when `max_connections` is high.
2. **Idle backends:** `SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'`, against `max_connections`. In our runs, 1000 idle sessions next to 500 DDL TPS put 54% of the DDL sessions' active samples in `LWLock:SInvalWrite`, and 1000 idle next to 100 DDL TPS cost 1.4 to 2 vCPU of catch-up work.
3. **Catalog delete rates:** `SELECT relname, n_tup_del FROM pg_stat_sys_tables WHERE relname IN ('pg_class', 'pg_attribute', 'pg_type', 'pg_depend')`, twice, a minute apart. `pg_attribute` is the strongest signal. A 2-column table with a TOAST table, like ours, deletes 19 rows from it, so its delta per second ÷ 19 ≈ such temp tables dropped per second. These counters show temp-table churn even where `pg_stat_statements` does not see the DDL.

To lower the idle count, use a connection pooler, make application pools smaller, and set `idle_session_timeout` (Postgres 14 and newer) to close sessions that stay idle too long.

If you have no history for these, [PostgresAI Monitoring](/products/monitoring) keeps it. Ask your agent to read this article and investigate these signals with it.

Then remove temp tables where you can, and where one is still needed, move its creation out of frequently executed code. A CTE covers many cases. When the logic is too complex for one query, as in Kirk's case, keep the rows in PL/pgSQL variables. `select t from t` returns each row as a value of the table's own composite type `t`, `array(...)` collects the rows into one array value, and `unnest()` turns it back into rows. This makes no catalog change, but has no planner statistics and is limited to 1 GiB per value. We showed it in psql [in the episode, at 30:10](https://www.youtube.com/watch?v=gAdhpYewLZ8&t=1810s). Kirk's search became a read-only transaction that can run on a replica. For bulk upserts, the application can pass the rows as arrays, instead of a `COPY` into a temp table:

```sql
insert into dst select * from unnest($1::int[], $2::text[]);
```

Thanks to Kirk for adding the guidance to the PostgreSQL wiki: ["Don't create temporary tables in frequently executed code"](https://wiki.postgresql.org/wiki/Don%27t_Do_This#Don.27t_create_temporary_tables_in_frequently_executed_code).

If a temp table must stay, create it once per session with `CREATE TEMP TABLE IF NOT EXISTS ... ON COMMIT DELETE ROWS`. At commit, Postgres [truncates the table and its indexes in place](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-PARMS-ON-COMMIT), which changes no catalog row and leaves no dead tuples. It ran at 17866 TPS.

Each commit still takes three `ACCESS EXCLUSIVE` locks for the truncate, writes them to WAL, and sends 5 invalidation messages. With 1000 idle sessions at 128 clients, it lost 17% of its TPS. It helps only where the session keeps its table. Each new session, and each pooler reset, creates and drops the table again, with the catalog churn and bloat of the per-transaction pattern. Long transactions delay the cleanup of those dead catalog rows.

It also needs a direct connection or a pooler in session mode. In PgBouncer transaction mode, a temp table works only if one transaction creates, uses and drops it, the costly pattern above. [RDS Proxy pins](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy-pinning.html) a session to its server connection once it creates a temp table.

## Patch ideas for Postgres hackers

If you want to work on this in Postgres itself:

- **Size the queue with the installation**, from `max_connections` or a separate setting.
- **Make the cleanup cost independent of idle backends.**
- **Expose sinval counters** in a view such as `pg_stat_sinval`, shaped like `pg_stat_io` (one row per backend type): messages sent, catch-up signals, resets and cleanups. Messages per catalog table could go next to `n_tup_del` in `pg_stat_all_tables`. Today there is no view for any of this, so we counted them with [bpftrace](https://github.com/bpftrace/bpftrace) probes on Postgres functions.
- **Add wait events for relation file creation and removal, and count these operations in `pg_stat_io`,** which already tracks temp relations but not file creates or unlinks. In `md.c`, the `open()` with `O_CREAT` [in `mdcreate()`](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/storage/smgr/md.c#L238) and the `unlink()` [in `mdunlinkfork()`](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/storage/smgr/md.c#L395) run with no wait event, so time spent there shows up as CPU*. [gaps.wait.events lists both](https://gaps.wait.events/#relation-files), with the code paths.
- **Make the standby replay temp-table churn cheaply.** One startup process replays all WAL in order, and in our run it spent most of its CPU taking the replayed `ACCESS EXCLUSIVE` locks. These locks are on the temp table, its TOAST table and the TOAST index, which no session on a standby can read. [`LockAcquireExtended()`](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/storage/lmgr/lock.c#L967) logs them with no check for temp relations, so the first question is whether they need to be replayed at all. The bigger step is to move such work off the startup process, to a helper process, which is a first piece of parallel apply on standbys. The same goes for the primary: the committing backend removes the temp table's files itself, and a background process could do it.

Global temporary tables would stop writing catalog rows for each temp table. A [patch by Dean Rasheed](https://commitfest.postgresql.org/patch/6918/) is in the November CommitFest for Postgres 20, "Needs review", last version from September. The study brief has five more ideas.

To keep an eye on the health of your Postgres databases, temp-table churn included, start using PostgresAI: sign up at [console.postgres.ai](https://console.postgres.ai) and connect your databases to [PostgresAI Monitoring](/products/monitoring). It keeps the history of wait events, sessions and catalog activity, and your agent can read it with you.

Have an idea to investigate with DBLab Forge, or a Postgres scaling problem in production we can help with? Leave a comment [under the episode on YouTube](https://www.youtube.com/watch?v=gAdhpYewLZ8), or reach me on [X](https://x.com/samokhvalov) or [LinkedIn](https://www.linkedin.com/in/samokhvalov).

<details>
<summary>DBLab Forge research appendix: method and references</summary>

**Method**

- Hetzner CCX43 servers: 16 dedicated vCPU (8 cores with SMT, AMD EPYC-Milan per `lscpu` on the throughput and cliff nodes), 64 GiB RAM, local NVMe, and one CCX63 (48 vCPU) for 8 cells. Node pairs were parity-checked, and where a pair failed, cells were compared on one node only.
- Postgres 17.11, 18.6 and 19 RC1 from PGDG packages, and 20devel for 4 single-run cells. Data checksums on, `shared_buffers = 16GB`, `synchronous_commit = on`. Postgres 17 and 18 were within 4% for the CTE, the temp table per transaction and `ON COMMIT DELETE ROWS`. Postgres 19 RC1 was within 2.4% of 18.6 on the same node.
- Six arms: a temp table per transaction, a temp table per session with `ON COMMIT DELETE ROWS`, `TRUNCATE` or `DELETE`, a shared `UNLOGGED` table (one table for all clients, skewed, not reported), and a CTE. The source table `src(id int primary key, v text)` has 100000 rows.
- Throughput runs: 60 s cells, 1 to 128 clients, 0 to 1000 idle connections, medians of 4 runs (2 servers × 2 repeats), waits sampled from `pg_stat_activity` every 100 ms. Fig. 1 uses the Postgres 18 medians.
- Hypothesis before the runs: the temp-table pattern stops scaling well below the vCPU count, with `LWLock:SInvalWrite` and `SInvalRead` on top, falsified if they stay under 5% of active samples at the ceiling. Scaling did stop well below the vCPU count, but the sinval waits were under 1% of active samples at 16 to 64 clients and about 6% at 128, so the hypothesis was falsified.
- Idle-session runs: 16 DDL clients with `pgbench -R`, 32 lookup clients with no think time, up to 5000 warm idle sessions with one query every 30 s, 100 hash-partitioned tables × 200 partitions, `temp_tablespaces` on tmpfs, `max_connections = 6000`, `max_locks_per_transaction = 256`. bpftrace uprobes counted messages (133.5 per transaction in the 500 TPS cell), cleanups, catch-up signals and resets. A third set re-ran 0 and 5000 idle on another node with [`pg_wait_sampling`](https://github.com/postgrespro/pg_wait_sampling) and eBPF profiles (Fig. 4). Most idle-session points are single runs, there is no point between 1000 and 3000 idle, and the 91% is from the first run. The idle sessions were `pgbench` clients, not sessions of an application pool, whose caches hold other entries. The kernel wait-channel and tmpfs numbers come from one 60-second run each.
- `max_locks_per_transaction`: Postgres 18.6 only, two cells at 1024 against 256, one run each. Postgres 17: no `max_locks_per_transaction` variation.
- Catalog rows were counted with `pg_stat_xact_sys_tables` on Postgres 18.6 and 17.11. Invalidation messages were counted on the same versions with a logging-only patch in `SendSharedInvalidMessages()`, one session: 132 per transaction. The kernel wait channels count three files per transaction: table, TOAST table and TOAST index.
- Standby runs: a second Postgres 18.6 cluster on the same node, streaming, 16 read clients plus 0 or 3000 idle sessions, 60 s cells started at zero lag, one run each, `max_connections = 6000`. Lag is `pg_stat_replication.sent_lsn - replay_lsn` on the primary, in MiB (2^20 bytes). The startup process profile: 60 to 64% of its on-CPU samples in `StandbyAcquireAccessExclusiveLock`, 48.6% of its samples waiting for WAL.
- Postgres 14 to 16: source reading only. Pooler modes and the array approach: not benchmarked.
- The Forge harness is not open source.

**References**

- Tom Lane, ["Rewrite sinval messaging to reduce contention"](https://www.postgresql.org/message-id/373.1213813174@sss.pgh.pa.us), 2008: the current design, tested on a temp table per transaction.
- Josef Machytka, ["Bloat of system tables due to big number of created and dropped relations"](https://www.credativ.de/en/blog/bloat-of-system-tables-due-to-big-number-of-created-and-dropped-relations), 2024.
- Jobin Augustine, ["What hurts in PostgreSQL, part one: temporary tables"](https://www.percona.com/blog/what-hurts-in-postgresql-part-one-temporary-tables), 2025.
- Postgres docs: [CREATE TABLE, temporary tables](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-TEMPORARY) and the [LWLock wait events](https://www.postgresql.org/docs/current/monitoring-stats.html#WAIT-EVENT-LWLOCK-TABLE).
- [#PostgresMarathon 2-005](/blog/20251009-postgres-marathon-2-005), on `LWLock:LockManager`.

</details>

</div>
