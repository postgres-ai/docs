---
title: "Dump/restore done. Now what?"
date: 2026-10-28 12:00:00
slug: 20261028-dump-restore-now-what
authors: [nik]
description: "After pg_dump and pg_restore, by default the planner statistics and the visibility map are missing. One query: 32.6 s before VACUUM ANALYZE, 23 ms after."
image: /assets/blog/20261028-dump-restore-now-what-og-v2.png
hide_cover_image: true
tags: [Postgres insights, performance, maintenance, pg_restore, Postgres.FM]
---

import { TldrTabs } from '@site/src/components/TldrTabs'

Your `pg_dump` and `pg_restore` finished with exit code 0. Row counts match. The app connects. Now what?

Is the database ready for queries? Not yet. This post is about logical dump/restore with `pg_dump` and `pg_restore`. A physical restore, from `pg_basebackup`, WAL-G or pgBackRest, copies the data files as they are, so the statistics and the visibility map arrive with them. By default, a restore from a logical dump copies the rows but not the column statistics; on Postgres 18 and later, `pg_dump --statistics` can carry them. The visibility map is never copied: on the new server it starts empty. ANALYZE supplies missing planner statistics; `--statistics` can supply them from Postgres 18. VACUUM builds the visibility map. Postgres 19 reads can also set map bits, but that work then delays the first queries.

<!--truncate-->

Kirk Wolak and I talked about this in Postgres.FM episode 193, "Dump/restore done. Now what?". Episode page, with transcript: https://postgres.fm/episodes/dump-restore-done-now-what.

<iframe width="100%" height="180" frameborder="no" scrolling="no" seamless="" src="https://share.transistor.fm/e/8b453f2d?color=FFFFFF&background=30343C"></iframe>

<TldrTabs
  founders={{
    title: "A migration with pg_dump/pg_restore is not done when the data is in:",
    points: [
      "The database can be slow until maintenance runs. In one designed test, one query took 32.6 s right after pg_restore and 23 ms after VACUUM ANALYZE: about 1,400× faster",
      "For this cause, the fix is complete: run VACUUM ANALYZE before traffic, then check the key query plans to confirm it. Add the maintenance time to the migration window: on a large database it can be long",
      "Decide this before migration day, not after the first slow page. Ask whoever runs the migration: is this step in the runbook, and who checks the plans?",
      "If the team restores from a physical backup (pg_basebackup, WAL-G, pgBackRest) instead of a dump, this problem does not apply",
    ],
    analogy: "A warehouse move where every box arrives, but the stock records do not. Until someone takes stock, staff guess where things are, and some orders take hours instead of minutes.",
    analogyLabel: "Picture it",
  }}
  developers={{
    title: "One query, Postgres 18.6, one host, cold cache, autovacuum off:",
    points: [
      "No column statistics: the planner works from default estimates. Here it chose a Hash Join over a full Seq Scan: 32.6 s. On other databases the bad plan can be a Bitmap Index Scan with a Bitmap Heap Scan",
      "After ANALYZE: Index Only Scan, but the empty visibility map forces 24,983 heap fetches: 6.1 s",
      "After VACUUM ANALYZE: 0 heap fetches, 23 ms, about 1,400× faster than the first run",
      "pg_dump --statistics (Postgres 18) gives the same 6.1 s as ANALYZE: it carries column statistics, not the visibility map. From 19, the dump also carries extended statistics",
    ],
    analogy: "A navigation app after a reinstall: every road is on the map, but it has no traffic data, so it picks the slow route. ANALYZE restores the traffic data; VACUUM restores the 'road verified' marks that let the app trust a route without re-checking every street.",
    analogyLabel: "Picture it",
  }}
  dbas={{
    title: "Make the database ready before traffic:",
    points: [
      "Postgres 14 to 18: vacuumdb --analyze --jobs 4 (whole database after a full load; only the loaded tables after a partial load), then ANALYZE each partitioned parent. vacuumdb skips parents, and autovacuum never builds their statistics",
      "Postgres 19: vacuumdb --jobs 4, then vacuumdb --analyze-only --jobs 4. --analyze-only and --analyze-in-stages include partitioned parents; --analyze still does not",
      "pg_dump --statistics imports the source's relallvisible, but not its visibility map. In our test, with autovacuum off, the imported value covered almost every page while the new map was empty, so the planner expected almost no heap fetches until VACUUM ran. FREEZE is optional: in our fixture it cost about the same WAL and avoided a later freezing pass",
      "On 19rc1 with checksums on, the first SELECT after pg_restore took 110 to 113 s and wrote about 31 GiB of WAL, because reads can set visibility-map bits. Run VACUUM ANALYZE before the first query, for predictable performance",
    ],
    analogy: "A library after a move: every book is on its shelf, but the librarian's notes on how the collection is spread are gone, and no shelf is marked as checked. ANALYZE rewrites the notes; VACUUM marks the shelves, so index-only scans can skip the heap.",
    analogyLabel: "Picture it",
  }}
  managers={{
    title: "Risk on migration day:",
    points: [
      "After a migration with pg_dump/pg_restore, the database can be slow until maintenance runs. In our test (one designed test), one key query took 32.6 s instead of 23 ms",
      "Ask your team: does the runbook run VACUUM ANALYZE and check the key query plans before traffic switches? Add that time to the migration window; in return, performance is predictable from the first query",
      "In our sample of 28 documentation, blog and training pages, 25 do not say to run VACUUM after the dump is loaded, and 20 do not say to run ANALYZE",
      "If pg_upgrade fits your migration, it keeps the visibility map and transfers most optimizer statistics when the new cluster is Postgres 18 or later; the old cluster can be older, even 14",
    ],
    analogy: "Your car comes back from the service with a note: the first miles will be very slow. You would expect the garage to finish that work before it hands you the keys.",
    analogyLabel: "Picture it",
  }}
  aiContext={
    "You're answering questions about the blog post 'Dump/restore done. Now what?'. " +
    "Summary: " +
    "The post is about logical dump/restore (pg_dump, then pg_restore). A physical restore (pg_basebackup, WAL-G, pgBackRest) keeps the statistics and the visibility map; by default a logical restore copies the rows but not the column statistics (--statistics on Postgres 18+ can carry them); the visibility map is never copied and starts empty on the new server. ANALYZE fixes the statistics; VACUUM fills the visibility map. Neither command does the other's job. " +
    "Large test, Postgres 18.6, cold cache, data larger than RAM: one query (count and sum of events for the 100 customers in one rare country) over a 250-million-row events table with a 31 GiB heap and a covering index. Medians of 9 runs: 32.6 s right after pg_restore (Hash Join over a Seq Scan), 6.1 s after ANALYZE (Index Only Scan, 24,983 heap fetches), 23 ms after VACUUM ANALYZE (0 heap fetches), about 1,400 times faster. " +
    "Without statistics the planner estimated 2,713 customers instead of 100 and 1.9 million join rows instead of about 25,000, so a full scan looked cheaper. " +
    "The pg_dump --statistics archive (Postgres 18) gave 6.1 s, the same as ANALYZE only: it carries column statistics but not the visibility map, and it imports relallvisible equal to every page while the map is empty. In the tests the imported value stayed only with autovacuum off; with autovacuum on, CREATE INDEX usually resets it to 0. " +
    "Disclosures: autovacuum was off for the large test, to isolate the maintenance steps; with autovacuum on, this work starts during or after pg_restore, depending on thresholds and free workers. The test data was designed so that both ANALYZE and VACUUM matter. One host, local SSD. " +
    "Postgres 19rc1: on a primary, eligible reads can set visibility-map bits. The first SELECT after pg_restore took 110 to 113 s, dirtied every block of the heap, wrote 3.78 million of them itself, and generated about 31 GiB of WAL (estimated from the WAL positions in the server log; full-page images with data checksums on). After that, ANALYZE alone gave 23 ms, and a later plain VACUUM froze 1 page, leaving the freezing to a later aggressive or FREEZE vacuum. " +
    "Small test (63 MiB, warm cache, Postgres 18.6): a skewed join went from 145 ms to 67 ms after ANALYZE; an index-only read went from 6.6 ms to 1.1 ms after VACUUM. The first count(*) on a table without indexes wrote 26.9 MiB of WAL because of hint bits. " +
    "On 18.6 a plain VACUUM after pg_restore froze no pages; with checksums on and a checkpoint before maintenance, adding FREEZE cost about the same WAL and avoided the later freezing of those tuples. On 19rc1 a plain VACUUM froze every page in the fresh-load test, with checksums on and a checkpoint before VACUUM (commit 378a216187a, Melanie Plageman). " +
    "Autovacuum vacuums and analyzes each leaf partition when it reaches its thresholds (statistics, visibility map), but never builds statistics for partitioned parents at any level. On 19, vacuumdb --analyze-only and --analyze-in-stages include them, but vacuumdb --analyze does not; run a plain ANALYZE once. COPY FREEZE does not run VACUUM and does not collect statistics; pg_restore does not use it. " +
    "Recommendation for Postgres 14 to 18 (it also works on 19): before traffic, vacuumdb --analyze --jobs 4 --dbname mydb after a full load (after a partial load, only the tables that got data), then ANALYZE every partitioned parent (select them from pg_class where relkind = 'p'), because vacuumdb --analyze skips parents, and autovacuum processes the partitions but never the parent. On 19, vacuumdb --jobs 4 --dbname mydb, then vacuumdb --analyze-only --jobs 4 --dbname mydb, also covers the parents. The main reason for VACUUM is to build the visibility map; it also sets hint bits before the first queries. FREEZE is optional. Set wal_compression with PGOPTIONS for vacuumdb (superuser or a role with SET granted). pg_upgrade keeps the visibility map and, when the new cluster is 18 or later (the old one can be older, even 14), transfers most optimizer statistics (18 does not transfer extended statistics; 19rc1 pg_dump --statistics does); pg_upgrade --link leaves no old cluster to roll back to once the new one starts, --clone or copy mode keeps it. " +
    "Do not invent numbers beyond those above. Be concise and direct. Do not mention that you're an AI or that you received this context."}
  ctaText="Connect your database to PostgresAI"
  ctaLink="https://console.postgres.ai"
/>

## One query: 32.6 s after pg_restore, 23 ms after VACUUM ANALYZE

I wanted one query where both steps matter after a restore from a dump, on data larger than RAM. The query counts and sums the events of the customers in one rare country:

```sql
select count(*), sum(e.amount)
from customers c
join events e on e.customer_id = c.id
where c.country = 'LI';
```

`customers` has 1,000,000 rows, and 100 of them are in `LI`. `events` has 250 million rows: a 31 GiB heap and a covering index on `(customer_id) include (amount)`. The host has 16 GiB of RAM. I restored a `pg_dump -Fc` archive on Postgres 18.6, three times. Before each cold run, I restarted Postgres and dropped the OS page cache. The steps ran in this order, on the same database. Each time is the median of 9 runs.

The schema and the data, from the source-fixture section of `one_query.sh` in [How to reproduce](#how-to-reproduce):

```sql
select setseed(0.314159);
create table customers (id int primary key, country text not null, name text not null);
insert into customers
select g, case when g <= 100 then 'LI' else (array['US','DE','GB','FR','BR','IN','JP','CA','AU','NL','ES','IT','PL','SE','MX','KR','TR','AR','CH','AT','BE','DK','NO','FI','IE','PT','CZ','HU','RO','GR','IL','SG','NZ','ZA','CL','CO','PE','TH','MY','ID','PH','VN','UA','EG','NG','KE','MA','SA','AE'])[1 + floor(random()*random()*49)::int] end,
       'customer ' || g from generate_series(1, 1000000) g;  -- changed for publication: $NCUST replaced with its default
create index customers_country_idx on customers (country);
create table events (id bigint not null, customer_id int not null, kind smallint not null, amount int not null, created_at timestamptz not null, payload text not null);
insert into events select g, 1 + floor(random()*1000000)::int, (random()*10)::int, (random()*1000)::int, timestamp '2024-01-01' + g * interval '1 second', rpad(md5(g::text), 64, 'x') from generate_series(1, 250000000) g;  -- changed for publication: $NCUST and $NEV replaced with their defaults
alter table events add primary key (id);
create index events_customer_amount_idx on events (customer_id) include (amount);
vacuum analyze;
```

![On Postgres 18.6, one query takes a median 32.6 s cold after a logical restore alone, 6.1 s after ANALYZE (Index Only Scan with 24,983 heap fetches), and 23 ms after VACUUM ANALYZE (0 heap fetches)](/assets/blog/20261028-dump-restore-f1-one-query.svg)

The chart shows the query time with a cold cache after each step, on a linear time axis that starts at 0 s. Each bar is the median of 9 cold runs, and each dot is one run. At this scale, the 23 ms bar is too short to see. Under each step: the plan on `events` and its heap fetches.

| Step after pg_restore | Plan on `events` | Heap fetches | Time, cold cache |
| --- | --- | ---: | ---: |
| pg_restore only | Hash Join over a Seq Scan | - | 32.6 s |
| + ANALYZE | Index Only Scan | 24,983 | 6.1 s |
| + VACUUM ANALYZE | Index Only Scan | 0 | 23 ms |

From 32.6 s to 23 ms is about 1,400×. ANALYZE gives about 5×, and VACUUM gives about 260× more.

**Why the planner picks a Seq Scan when statistics are missing.** After pg_restore, `pg_stats` is empty, so the planner uses default estimates. It expects 2,713 customers in `LI` instead of 100, and 1.9 million join rows instead of 25,000. For 1.9 million rows, a full scan of `events` with a Hash Join looks cheaper than index lookups. After ANALYZE, the estimates are correct and the plan changes to an Index Only Scan. The bad plan is not always a Seq Scan: in my experience, with default estimates the planner also often picks a Bitmap Index Scan with a Bitmap Heap Scan.

**Why ANALYZE alone is not enough.** An Index Only Scan skips the heap only for pages that the visibility map marks all-visible. After our pg_restore run, the map was empty: the source map is not transported, and nothing had set bits yet. So the scan reads the heap for each row: 24,983 heap fetches on 24,976 different pages, from a cold disk. VACUUM fills the map, and the heap fetches drop to 0. This is the main reason to run VACUUM after dump/restore. Setting hint bits is a side benefit; optional FREEZE can avoid a later heap rewrite.

**The `--statistics` option.** Postgres 18 can put optimizer statistics in the archive with `pg_dump --statistics`. With this archive, the query took 6.1 s right after pg_restore, the same as after ANALYZE. The archive carries the column statistics, but not the visibility map. On 18, the archive has the `CREATE STATISTICS` definitions but not their collected data; from 19, `pg_dump --statistics` dumps that data too. It also carries the source's `relallvisible`: here, all 4,098,361 pages, while the new map is empty. So the planner expects no heap fetches, and the scan makes 24,983. I call this a gap, not a bug: the value is correct for `pg_upgrade`, which keeps the map. In my tests, the imported value stayed only with autovacuum off; with autovacuum on, `CREATE INDEX` usually resets it to 0 during pg_restore.

![How an Index Only Scan decides per tuple whether to read the heap: after pg_restore from a --statistics archive with autovacuum off, pg_class imports relallvisible 3,449 over a visibility map with 0 of 3,480 pages all-visible, so all 10,000 tuples fetch a heap page (10,032 buffer accesses against 3,301 for the Bitmap Heap Scan); after VACUUM 3,449 of 3,480 pages are all-visible and all 10,000 tuples return from the index (0 heap fetches, 34 buffer accesses)](/assets/blog/20261028-dump-restore-f2-relallvisible.svg)

The planner reads `pg_class`; the executor checks the visibility map. Small test, `--statistics` archive, autovacuum off.

What we set on purpose:

- Autovacuum was off for the whole run, to isolate the maintenance steps. With autovacuum on, this work can start during or after pg_restore, depending on thresholds and free workers.
- I designed the test data so that both ANALYZE and VACUUM matter: a rare country, events spread over the whole heap, and a covering index.
- One host with a local SSD. On a network disk, random reads cost more. I did not test that.

## Postgres 19rc1: the first SELECT writes the table

I repeated the large test on Postgres 19rc1: same host, same archives. On a primary, Postgres 19 can set visibility-map bits during ordinary reads. In this test it set almost all of them, and this changes the result.

| Step after pg_restore | Heap fetches | Time, cold cache |
| --- | ---: | ---: |
| pg_restore only, first run (3 runs) | - | 110 to 113 s |
| pg_restore only, later runs (6 runs) | - | 29.5 s |
| + ANALYZE | 0 | 23 ms |
| + VACUUM ANALYZE | 0 | 24 ms |

The first SELECT took 110 to 113 s, against 32.6 s on 18.6. It read the 31 GiB heap and marked 4,098,360 of 4,098,361 pages all-visible. With data checksums and `full_page_writes = on` in this test, the first page change after a checkpoint writes a full-page image to WAL. So one read-only query dirtied every block of the heap, wrote 3.78 million of them itself because the table is larger than RAM, and generated about 31 GiB of WAL. The WAL volume is the distance between the WAL positions in the server log around each run, not an EXPLAIN counter. Physical standbys receive all of it, and so does the WAL archive if archiving is on.

After that, ANALYZE alone gave 23 ms, because the map was already full. The later plain VACUUM froze 1 page: it skipped almost all the pages the read had marked all-visible. A later aggressive vacuum, or `VACUUM (FREEZE)`, can still freeze them, at the cost of touching the table again. On 19, run VACUUM ANALYZE before the first query, not after it, for predictable performance.

![On Postgres 19rc1, the first run after each pg_restore takes 110 to 113 s and generates about 31 GiB of WAL setting visibility-map bits, later runs take a median 29.5 s, and after ANALYZE the query takes 23 ms with 0 heap fetches](/assets/blog/20261028-dump-restore-f1b-pg19-first-read.svg)

The time axis is linear and starts at 0 s. The first run after each of the three pg_restore runs is orange. VACUUM ANALYZE after that gave 24 ms, against 23 ms after ANALYZE.

The `--statistics` archive shows the same effect at a smaller scale. Its first read is an Index Only Scan that fetches 24,906 heap pages and sets their visibility-map bits in 5.3 to 6.7 s; the server log shows about 195 MiB of WAL around it. Later cold runs took 22 to 24 ms with 1 heap fetch.

## Small test: ANALYZE fixes a join, VACUUM fixes a range query

Before the large test, I used a small database: 63 MiB, three tables. Two queries needed two different fixes. After ANALYZE, the skewed join changed from a Nested Loop to a Hash Join. After VACUUM, the range query on a covering index changed from a Bitmap Heap Scan to an Index Only Scan.

![Root buffer accesses on Postgres 18.6 by maintenance step: the skewed join drops from 396,608 (Nested Loop) to 2,096 (Hash Join) after ANALYZE; the covering range query drops from 3,301 (Bitmap Heap Scan) to 34 (Index Only Scan) after VACUUM](/assets/blog/20261028-dump-restore-f3-two-queries.svg)

Buffer accesses are the evidence here; the fixture is fully cached, so the milliseconds in the footer are an illustration.

The small test also showed that a SELECT can write. On a table with no index, the first `count(*)` after a checkpoint dirtied 3,449 blocks and wrote 26.9 MiB of WAL, for a 27 MiB table. These are hint bits. This first-read work exists across Postgres 14–19, not just 19: reads set missing hint bits on committed rows and dirty heap pages. With data checksums or `wal_log_hints` enabled, the first hint-bit change after a checkpoint can require a full-page image. See [`MarkBufferDirtyHint`](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/storage/buffer/bufmgr.c#L5439) and [`XLogSaveBufferForHint`](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/access/transam/xloginsert.c#L1065); the experiments used `full_page_writes = on`.

On indexed tables, pg_restore's ordinary `CREATE INDEX` scans already set most hint bits on committed rows. [`heapam_index_build_range_scan`](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/access/heap/heapam_handler.c#L1171) calls `HeapTupleSatisfiesVacuum`, which sets those bits. This does not apply to rows still uncommitted under `pg_restore --single-transaction`, or to tables without indexes. It does not build the visibility map. Postgres 19 additionally lets eligible reads set visibility-map bits through on-access pruning ([commit 378a216187a](https://github.com/postgres/postgres/commit/378a216187aea1b488ce60ed07dd1ac5c14a9984)).

![WAL written and shared blocks dirtied by the first SELECT after pg_restore: on Postgres 18.6 only the index-less table after a checkpoint writes, 26.9 MiB; on 19rc1 the range query on an indexed table also writes 25.6 MiB and sets 3,267 of 3,480 visibility-map bits](/assets/blog/20261028-dump-restore-f4-first-read-writes.svg)

Figure 4 shows the first read of each table, in the order below; it is not one first SELECT for the database. The indexed range query ran first, then the join, then the counts of `accounts`, `orders`, `customers`, and the index-less `events`. The `events` count was its first heap read. On 18.6, missing hint bits caused the writes; on 19rc1, visibility-map changes caused writes too, including on the indexed table.

## Freeze now, not later

On 18.6, a plain VACUUM after pg_restore made the pages all-visible but froze none. A later anti-wraparound vacuum then rewrote the whole table. On a 1,820 MiB database, with checksums on and a checkpoint before maintenance, `VACUUM (FREEZE, ANALYZE)` wrote about the same WAL as `VACUUM ANALYZE` (1.50 GiB against 1.49 GiB), and the later aggressive vacuum then wrote 35 KiB.

On 19rc1, a plain VACUUM after pg_restore froze every page in my fresh-load tests, with data checksums on and a checkpoint between the load and the VACUUM. The cause is [commit 378a216187a](https://github.com/postgres/postgres/commit/378a216187aea1b488ce60ed07dd1ac5c14a9984) by Melanie Plageman: COPY now sets a prune hint on each page, and VACUUM freezes the page in the same WAL record when it clears the hint, if the page already needs a full-page image; hint logging alone is not enough. The Postgres 19 release notes do not mention this effect. In the large test, a plain VACUUM after the first full read left almost all freezing work for a later pass.

## Autovacuum can take minutes and never analyzes partitioned parents

Since Postgres 13, inserts trigger autovacuum ([Laurenz Albe and Darafei Praliaskouski](https://www.postgresql.org/docs/13/release-13.html)). My tables loaded from the dump crossed the insert threshold immediately. On an idle cluster, stock autovacuum processed my small tables 6 to 67 s after pg_restore. In a separate 1,820 MiB database test, with earlier test databases occupying the workers, the main table (about 1,350 MiB of heap) waited about 286 s for a worker; its vacuum took 96 s and finished about 382 s after pg_restore exited. These three timings are approximate; the experiment-code section explains why. Two smaller tables were done before pg_restore exited.

![Seconds from pg_restore exit until all three tables were vacuumed and analyzed, one point per fresh pg_restore: 6 to 67 s on Postgres 18.6 and 6 to 58 s on 19rc1](/assets/blog/20261028-dump-restore-f5-autovacuum-arrival.svg)

Stock autovacuum, idle cluster, small fixture. The spread is consistent with where pg_restore ends in the `autovacuum_naptime` cycle.

Autovacuum vacuums and analyzes each leaf partition when it reaches its thresholds: this builds their statistics and visibility maps. It never builds statistics for partitioned parents, at any level, and queries on a parent need them. In my test, autovacuum analyzed all 8 partitions within 15 s, and the parent had no statistics after 480 s. The parent's query used 403,072 buffers before a manual ANALYZE and 4,400 after.

On 14–18, `vacuumdb` skips partitioned parents too when it selects the tables itself (this is the client's version; `--table` still works). On 19, `vacuumdb --analyze-only` and `--analyze-in-stages` include them ([Laurenz Albe, Mircea Cadariu and Chao Li](https://www.postgresql.org/docs/19/release-19.html#RELEASE-19-SERVER-APPLICATIONS)), but `vacuumdb --analyze` still skips them. So after pg_restore, run a plain `ANALYZE;` once, or `ANALYZE` on each parent.

## Of 28 guides, 8 say to run ANALYZE and 3 say to run VACUUM

I read a selected sample of 28 docs pages about logical dump/restore and import, from 21 publishers, on 2026-10-20. In our sample, 8 pages tell the reader to run ANALYZE. 3 recommend VACUUM. 1 explains the visibility map. This is a selected sample, not an industry rate. The list of pages is in [How to reproduce](#how-to-reproduce).

The Postgres docs tell you to run ANALYZE after restoring from a dump ([Populating a database](https://www.postgresql.org/docs/18/populate.html), [pg_restore](https://www.postgresql.org/docs/18/app-pgrestore.html)). They do not recommend VACUUM for this. `pg_restore` itself prints no advice.

According to its documentation (0.18 development docs, read 2026-10-23; I did not test pgcopydb), [pgcopydb](https://pgcopydb.readthedocs.io/en/latest/ref/pgcopydb_clone.html) by default runs `VACUUM ANALYZE` for each copied table and loads with `COPY FREEZE` where it is eligible (not when several workers copy one table). `COPY FREEZE` does not run VACUUM. It writes the rows already frozen and, since Postgres 14, sets the all-visible and all-frozen bits in the visibility map. It works only if the table was created or truncated in the current subtransaction, with no open cursors or older snapshots in that transaction; it cannot target a partitioned parent or a foreign table, and it does not collect statistics. `pg_restore` does not use it.

## Recommendations for Postgres 19 and older

I use the same sequence for Postgres 14–19; version differences are inline below.

1. Run ANALYZE to collect planner statistics. `pg_dump --statistics` is available from Postgres 18 and can transfer column statistics. Postgres 18 does not transfer extended statistics data; 19rc1 does. Recompute missing statistics after pg_restore.
2. Run VACUUM to build the visibility map. **Building the visibility map is the main reason for VACUUM after dump/restore.** Without map bits, an Index Only Scan reads the heap for every row. In this test, VACUUM reduced 24,983 heap fetches to 0. Imported `relallvisible` is no substitute for the actual map, including with autovacuum off or `autovacuum_enabled = false`.
3. As a side benefit, VACUUM sets missing hint bits before traffic. That keeps the first queries from doing those writes. On 19, it also avoids leaving visibility-map work to the first reads.
4. Optionally add FREEZE to avoid a later heap rewrite for these tuples. In my test, with checksums on and a checkpoint before maintenance, FREEZE wrote about the same WAL as plain VACUUM. With both data checksums and `wal_log_hints` off, FREEZE can write more WAL. Size WAL storage and archiving for it separately.

After a full pg_restore into an empty database, use whole-database `vacuumdb --jobs`. For partial loads (`pg_restore -t`, `-n`, `-L`, or into an existing database), vacuum only tables that received data. On a big database, start with the tables the first queries will read.

Partitioned parents need a separate ANALYZE. Clients 14–18 omit them from automatic selection. Client 19rc1 includes them with `--analyze-only` and `--analyze-in-stages`, but omits them with `--analyze`.

For the full database:

```bash
vacuumdb --analyze --jobs 4 --dbname mydb
psql --no-psqlrc --set ON_ERROR_STOP=1 --dbname mydb <<'SQL'
select format('analyze %I.%I', n.nspname, c.relname)
from pg_class as c
join pg_namespace as n on n.oid = c.relnamespace
where c.relkind = 'p'
\gexec
SQL
```

For a partial load of `customers`, `events`, and partition `orders_p_0`:

```bash
vacuumdb --analyze --jobs 4 --dbname mydb --table public.customers --table public.events --table public.orders_p_0
psql --no-psqlrc --set ON_ERROR_STOP=1 --dbname mydb --command 'analyze public.orders_p'
```

Add `--freeze` if you choose to freeze now. Choose a `--jobs` value that the host can support. Parallel workers can increase I/O and WAL generation. Physical standbys and the WAL archive receive this WAL. On a database already serving traffic, add `--no-truncate` to avoid the ACCESS EXCLUSIVE lock of heap truncation. ANALYZE on a parent also samples its partitions. Select parents whose partitions received data and whose statistics your queries need.

`wal_compression = lz4` cut WAL from 1.60 GiB to 0.54 GiB in my test. On 15–19, check the server's `pg_config --configure` output for LZ4 support. If available, use `PGOPTIONS='-c wal_compression=lz4'` with vacuumdb. On 14, use `wal_compression=on` for pglz. Keep `full_page_writes=on`. Changing `wal_compression` requires a superuser on 14. Versions 15–19 also allow a role granted SET on that parameter.

Before cutover, run key read-only SELECTs with `EXPLAIN (ANALYZE, BUFFERS)` on the database loaded from the dump. EXPLAIN ANALYZE executes the statement, so do not use it on writes. Compare estimated and actual row counts. Check `Heap Fetches` on Index Only Scan nodes.

If an in-place upgrade is possible, consider `pg_upgrade`. My two 17.11 to 18.6 upgrades with `--link` preserved column statistics and the visibility map. The queries retained their plans. Statistics transfer needs Postgres 18 or later on the new cluster only; the old cluster can be older, even 14 ([PG18 preserves planner statistics on upgrade, even from PG14](https://postgres.ai/blog/20260324-pg18-stats-upgrade-across-versions)). Postgres 18 does not transfer extended statistics (19 does), so on 18 follow the post-upgrade ANALYZE instructions. With `--link`, the old cluster cannot start again once the new one has started. `--clone` or copy mode keeps a usable copy of the old cluster.

I checked automatic parent selection in the source for [14](https://github.com/postgres/postgres/blob/REL_14_STABLE/src/bin/scripts/vacuumdb.c), [15](https://github.com/postgres/postgres/blob/REL_15_STABLE/src/bin/scripts/vacuumdb.c), [16](https://github.com/postgres/postgres/blob/REL_16_STABLE/src/bin/scripts/vacuumdb.c), [17](https://github.com/postgres/postgres/blob/REL_17_STABLE/src/bin/scripts/vacuumdb.c), [18](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/bin/scripts/vacuumdb.c), and [19rc1](https://github.com/postgres/postgres/blob/REL_19_RC1/src/bin/scripts/vacuuming.c). Statistics transport is documented for [18](https://www.postgresql.org/docs/18/app-pgdump.html) and implemented for extended statistics in [19rc1](https://github.com/postgres/postgres/blob/REL_19_RC1/src/bin/pg_dump/pg_dump.c).

## Ideas for Postgres development

Hackers have discussed this since [2002](https://www.postgresql.org/message-id/flat/GNELIHDDFBOCMGBFGEFOOEOPCBAA.chriskl%40familyhealth.com.au). Since then, autovacuum and, in 18, statistics transport each addressed a part of it. In 2025, Jian He proposed an opt-in `--include-analyze` option and credited Andrey Borodin, Kirk Wolak and me ([thread](https://www.postgresql.org/message-id/flat/CACJufxGx_YLLxmnZVMuUApiVYqjKrydvEQqD3qxhwM6e0_8jrQ%40mail.gmail.com)). As of 2026-10-23 it is not committed, and I found no CommitFest entry for it. My suggestions:

- Let `pg_restore` print next steps, as `pg_upgrade` does, for example "run vacuumdb --analyze, then ANALYZE partitioned parents, before traffic", or offer an optional VACUUM ANALYZE step. AI agents read tool output and act on it, so a one-line cue like this is cheap and effective.
- Do not import `relallvisible` and `relallfrozen` from a logical dump: the source visibility map is not transported.
- Give `pg_restore` a `COPY FREEZE` path, as [Bruce Momjian proposed in 2013](https://www.postgresql.org/message-id/20130125152433.GY21914%40momjian.us) and [Dimitrios Apostolou proposed with a patch in 2025](https://www.postgresql.org/message-id/ff258f33-00d3-a944-9517-b3cccb662722%40gmx.net).
- Document the additional Postgres 19 effects: eligible reads can set visibility-map bits, and a plain VACUUM can freeze fresh pages when it clears COPY's prune hints on pages that already need a full-page image.

## How to reproduce

Full code, environment and raw audit table for reproducing these results are below.

<details>
<summary>Full experiment code: 15 scripts and the docs-audit table</summary>

Run these scripts only on a disposable VM. They create and drop test clusters, change server settings and restart Postgres.

#### Method and limits

- Postgres 18.6 and 19rc1. 19 is a release candidate, so the behavior can change before 19.0. The small test also ran on 17.11 and master.
- Large test: 4 vCPU, 16 GiB RAM, local SSD (virtual disk), `shared_buffers = '2GB'`, data checksums on, single-threaded `pg_restore`. Three pg_restore runs, 9 cold runs per step overall. One query on one host: this is not a general speedup.
- Small test: 63 MiB, fully cached. Plans and buffer counts are the evidence. The milliseconds are warm-cache illustrations.
- The experiments ran in DBLab Forge: the small test on 2026-10-20 UTC, the large test from 2026-10-22 23:41 to 2026-10-23 03:11 UTC.

#### Rerun prerequisites and differences

I used one Hetzner ccx23 VM per test day, with 4 dedicated vCPUs and 16 GiB RAM. Each VM ran Ubuntu 24.04 and PGDG packages for 17, 18 and 19rc1. I built master from source with `build_master.sh`.
The versions were Postgres 18.6, 19rc1, 17.11 and master: 17.11 and master ran only the small test.
I disabled autovacuum for the large test, `diag_av_off.sh`, and the prune hint check. I also disabled it during timed maintenance in the freeze, larger-fixture and `vacuumdb` tests. In the small test, per-table thresholds of 2,000,000,000 prevented autovacuum from processing those tables. The stock-autovacuum and partition tests used default settings. `diag_table_av_off.sh` kept cluster autovacuum on and disabled it on its tables.

#### Test environment

The table uses values from the run records: `env/versions.txt`, the `pg_settings` dump, and server logs. "Not recorded" means the records lack that value.

| Item | Value |
| --- | --- |
| Host | Hetzner Cloud ccx23, 4 dedicated vCPU, 16 GB RAM (`free -m`: 15,610 MiB), location fsn1; one VM per test day |
| OS, kernel | Ubuntu 24.04, kernel 6.8.0-138-generic, x86_64 |
| Disk | One local virtual disk: `sda` 152.6 GiB, `QEMU HARDDISK`, rotational 0; `/dev/sda1` 150 GiB mounted at `/`; filesystem type not recorded |
| Postgres 18 | PGDG package `18.6-1.pgdg24.04+2` (server, `pg_dump`) |
| Postgres 19rc1 | PGDG package `19~rc1-1.pgdg24.04+1` (server, `pg_restore`) |
| Postgres 17 (small test only) | PGDG package `17.11-1.pgdg24.04+2` |
| master (small test only) | commit `ddd468cacf0d5d6f124c39439505ab93d31ac65b`, built with `build_master.sh` |
| Archives for the large test | Both made once by `pg_dump` 18.6 from the 18.6 server (`-Fc --no-statistics` and `-Fc --statistics`, 8.6 GB each); the 19rc1 run restored the same two archives with `pg_restore` 19rc1, single-threaded |
| Non-default settings, large test | `shared_buffers = 2GB`, `work_mem = 64MB`, `maintenance_work_mem = 1GB`, `max_wal_size = 8GB`, `checkpoint_timeout = 30min`, `log_checkpoints = on`, `track_io_timing = on`, `jit = off`, `max_parallel_workers_per_gather = 0`, `max_parallel_maintenance_workers = 0`, `autovacuum = off` (set by `one_query.sh` through `ALTER SYSTEM`); `wal_compression`, `wal_log_hints`, `checkpoint_completion_target` at defaults; data checksums on (`pg_createcluster ... --data-checksums`) |
| Dataset | Generated by `one_query.sh` in its source-fixture section with `setseed(0.314159)`: 1,000,000 customers (100 in `LI`), 250,000,000 events, covering index `(customer_id) include (amount)`; events heap 4,098,361 pages |
| Cold cache | `pg_ctlcluster $V forge restart; sync; echo 3 > /proc/sys/vm/drop_caches; sleep 2` before every cold run; 3 restores, 3 cold and 3 warm runs per step |
| Run dates (UTC) | Small test 2026-10-20 03:26 to 04:04; large test 2026-10-22 23:41 to 2026-10-23 03:11 (18.6 first, then 19rc1) |

The install step pins the recorded PGDG packages and includes `bc`. Run only one test cluster at a time. For the large test:

1. Start 18 with `sudo pg_ctlcluster 18 forge_blog start`.
2. Run `sudo env I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes bash one_query.sh 18 5518 /var/lib/postgresql/oq18` to create both archives and measure 18.
3. Stop 18 with `sudo pg_ctlcluster 18 forge_blog stop`.
4. Start 19 with `sudo pg_ctlcluster 19 forge_blog start`.
5. Run `sudo env I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes bash one_query.sh 19 5519 /var/lib/postgresql/oq19` against the same archives.

The published script sets `max_wal_size = 8GB`, `checkpoint_timeout = 30min`, and `maintenance_work_mem = 1GB`. It returns previous settings on exit. These settings affect checkpoint frequency and the 19rc1 first-read results.

Use peer authentication. Run database-only scripts as the `postgres` OS user with `sudo -u postgres bash`. Run host scripts as root. Give `postgres` write access to each output directory. The original runs used local `trust` authentication; the published scripts use peer authentication instead. Export `I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes` for each invocation, including through sudo.

The first 18.6 invocation aborted with an unbound-variable error at the start of step 1 after pg_restore run 1. The subsequent invocation reused that database and continued. The results tables use no numbers from the aborted invocation. The published script now refuses an existing target database and always starts a fresh load.

These are the scripts used for the measurements, with publication changes marked on the affected lines. Existing `added for publication` comments identify earlier additions; each change in this revision says `changed for publication`. Database names now have a `forge_` prefix. The scripts refuse existing targets, and cleanup preserves previous configuration overrides. Setup scripts initialize new clusters only; they leave those clusters configured for the experiments. I ran both 17.11 to 18.6 `pg_upgrade --link` tests manually on the same host. This appendix has no script for them.

The original `stock_autovacuum.sh` recorded poll counts as seconds; figure 5's 6 to 67 s and 6 to 58 s retain that limitation. The partition script's 480 s timeout was also a loop-count estimate. `big_fixture_cost.sh` recorded aggregate completion as twice the poll count. The post retains its 286 s wait, 96 s vacuum and 382 s finish. The scripts alone do not establish whether 382 s came from that counter or server timestamps. The published scripts now record wall-clock elapsed time; the figures and measured numbers are unchanged.

Use `setup_server.sh` for the packaged clusters and `build_master.sh` for master. The prune-hint script creates its own clusters.

#### `setup_server.sh`: host setup: PGDG packages for 17, 18 and 19rc1, one checksummed cluster per version with the recorded settings (supporting script, no number in the post)

```bash
#!/usr/bin/env bash
# Root-side setup: PGDG apt repo, PG17 + PG18 + PG19 (rc), build deps for master. Refuses existing experiment clusters.  # changed for publication
# The first host (2026-10-19) was set up without the 17 cluster; 17.11 was added there later by hand for the pg_upgrade track.
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates gnupg lsb-release jq git build-essential \
  libreadline-dev zlib1g-dev libicu-dev pkg-config bison flex libssl-dev liblz4-dev libzstd-dev \
  python3 bc >/dev/null  # changed for publication
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main 19" > /etc/apt/sources.list.d/pgdg.list
apt-get update -qq
echo "== candidate versions"
apt-cache policy postgresql-18 postgresql-19 | grep -E 'postgresql-1|Candidate'
# Prevent package installation from creating a default cluster; keep the host's prior policy.  # changed for publication
policy=/etc/postgresql-common/createcluster.conf  # changed for publication
install -d /etc/postgresql-common  # changed for publication
policy_backup=$(mktemp); policy_existed=no  # changed for publication
if [[ -e $policy ]]; then cp -p "$policy" "$policy_backup"; policy_existed=yes; fi  # changed for publication
cleanup_policy(){ if [[ $policy_existed == yes ]]; then cp -p "$policy_backup" "$policy"; else rm -f "$policy"; fi; rm -f "$policy_backup"; }  # changed for publication
trap cleanup_policy EXIT  # changed for publication
trap 'exit 130' INT  # changed for publication
trap 'exit 143' TERM  # changed for publication
printf '\ncreate_main_cluster = false\n' >> "$policy"  # changed for publication
apt-get install -y -qq postgresql-17=17.11-1.pgdg24.04+2 postgresql-client-17=17.11-1.pgdg24.04+2 postgresql-18=18.6-1.pgdg24.04+2 postgresql-client-18=18.6-1.pgdg24.04+2 postgresql-19=19~rc1-1.pgdg24.04+1 postgresql-client-19=19~rc1-1.pgdg24.04+1 >/dev/null  # changed for publication
# Leave pre-existing clusters untouched; run one experiment cluster at a time.  # changed for publication
for V in 17 18 19; do
  PORT=55$V
  [[ ! -e /etc/postgresql/$V/forge_blog && ! -e /var/lib/postgresql/$V/forge_blog ]] || { echo "Existing cluster: $V/forge_blog" >&2; exit 1; }  # changed for publication
  pg_createcluster "$V" forge_blog --port "$PORT" --start-conf manual -- --data-checksums >/dev/null  # changed for publication
  CONF=/etc/postgresql/$V/forge_blog/postgresql.conf  # changed for publication
  cat >> $CONF <<CONF
# --- forge restore-readiness controls (recorded) ---
unix_socket_directories = '/var/run/postgresql'  # changed for publication
full_page_writes = on  # changed for publication
shared_buffers = '2GB'
work_mem = '64MB'
maintenance_work_mem = '512MB'
max_parallel_workers_per_gather = 0
max_parallel_maintenance_workers = 0
jit = off
track_io_timing = on
autovacuum = on
log_autovacuum_min_duration = 0
log_min_messages = info
log_line_prefix = '%m [%p] db=%d '
log_checkpoints = on
CONF
  # Start the selected cluster explicitly before its experiment.  # changed for publication
done
pg_lsclusters
dpkg -l 'postgresql-1[89]' | awk '/^ii/{print $2, $3}'
```

#### `build_master.sh`: builds master from source with pg_visibility and pageinspect, cluster on port 5520 (supporting script, no number in the post)

```bash
#!/usr/bin/env bash
# Optional: build PostgreSQL master (git HEAD) into /opt/pgmaster, cluster on port 5520.
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
[[ ! -e /opt/pgmaster && ! -e /var/lib/pgmaster && ! -e /root/forge_postgres ]] || { echo "Existing master build or cluster; refusing" >&2; exit 1; }  # changed for publication
git clone https://git.postgresql.org/git/postgresql.git /root/forge_postgres  # changed for publication
cd /root/forge_postgres  # changed for publication
git checkout ddd468cacf0d5d6f124c39439505ab93d31ac65b  # changed for publication
git rev-parse HEAD > /root/pgmaster.commit
./configure --prefix=/opt/pgmaster --with-icu --with-lz4 --with-zstd --with-openssl --quiet
make -s -j4 >/root/pgmaster.build.log 2>&1
make -s install >>/root/pgmaster.build.log 2>&1
make -s -C contrib/pg_visibility install >>/root/pgmaster.build.log 2>&1
make -s -C contrib/pageinspect install >>/root/pgmaster.build.log 2>&1
chown -R postgres:postgres /opt/pgmaster
install -d -o postgres -g postgres /var/lib/pgmaster
sudo -u postgres /opt/pgmaster/bin/initdb -D /var/lib/pgmaster --data-checksums --auth-local=peer --auth-host=scram-sha-256 >/dev/null  # changed for publication
cat >> /var/lib/pgmaster/postgresql.conf <<CONF
port = 5520
unix_socket_directories = '/var/run/postgresql'  # changed for publication
full_page_writes = on  # changed for publication
shared_buffers = '2GB'
work_mem = '64MB'
maintenance_work_mem = '512MB'
max_parallel_workers_per_gather = 0
max_parallel_maintenance_workers = 0
jit = off
track_io_timing = on
autovacuum = on
log_autovacuum_min_duration = 0
log_min_messages = info
log_line_prefix = '%m [%p] db=%d '
logging_collector = on
log_directory = 'log'
CONF
sudo -u postgres /opt/pgmaster/bin/pg_ctl -D /var/lib/pgmaster -l /var/lib/pgmaster/startup.log start
/opt/pgmaster/bin/postgres --version
```

<code>diag_av_off.sh</code> below reuses the two archives this script writes.

#### `harness.sh`: the small test: five pg_restore-and-maintenance arms, two queries, on 18.6, 19rc1, 17.11 and master (figure 3)

```bash
#!/usr/bin/env bash
# Restore-readiness harness. Run as the postgres OS user.
#   harness.sh <label> <bindir> <port> <outdir> [reps]
# Builds the source fixture once, dumps it twice (default, --statistics),
# then performs 5 arms x N reps fresh restores into fresh databases and
# records state + raw EXPLAIN JSON per target.
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
LABEL=$1; BIN=$2; PORT=$3; OUT=$4; REPS=${5:-3}
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
ARMS=(def-none def-analyze def-vacuum def-vacuum_analyze stats-none)
mkdir -p "$OUT"/{env,source,targets,dumps}
log(){ echo "[$(date -u +%FT%TZ)] $*" | tee -a "$OUT/harness.log"; }
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt)  # changed for publication
q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
}  # changed for publication
MAJOR=$(pg_dump --version | awk '{print int($3)}'); STATS=--statistics  # added for publication
[ "$MAJOR" -ge 18 ] || { STATS=; log "pg_dump $MAJOR has no --statistics option: the stats archive is a plain dump on this version"; }  # added for publication

# ---------- environment ----------
log "label=$LABEL bin=$BIN port=$PORT"
{ echo "server: $(postgres --version)"; echo "pg_dump: $(pg_dump --version)"; echo "pg_restore: $(pg_restore --version)"; echo "psql: $(psql --version)";
  echo "server_version_num: $(q postgres 'show server_version_num')"; echo "uname: $(uname -a)"; echo "nproc: $(nproc)"; free -m | sed -n 2p;
  echo "lsb: $(lsb_release -ds 2>/dev/null)"; } > "$OUT/env/versions.txt"
q postgres "copy (select name, setting, unit, source from pg_settings where source not in ('default','override') order by name) to stdout csv header" > "$OUT/env/pg_settings_non_default.csv"
q postgres "copy (select name, setting from pg_settings order by name) to stdout csv header" > "$OUT/env/pg_settings_all.csv"
q postgres "select pg_config_value from (select 'CONFIGURE: ' || setting from pg_config where name='CONFIGURE') s(pg_config_value)" > "$OUT/env/pg_config_configure.txt" 2>/dev/null || true
q postgres "copy (select datname, datcollate, datctype, datlocprovider, daticulocale, encoding from pg_database where datname='template1') to stdout csv header" > "$OUT/env/template1_locale.csv" 2>/dev/null || \
q postgres "copy (select datname, datcollate, datctype, datlocprovider, datlocale, encoding from pg_database where datname='template1') to stdout csv header" > "$OUT/env/template1_locale.csv"

# ---------- source fixture ----------
log "building source"

create_db "forge_src"  # changed for publication
"${PSQL[@]}" -d forge_src <<'SQL' > "$OUT/source/setup.log" 2>&1  # changed for publication
create extension pg_visibility;
\set thr 2000000000
-- Fixture A: covering-index range scan
create table accounts (id bigint not null, payload text not null)
  with (autovacuum_vacuum_threshold = :thr, autovacuum_analyze_threshold = :thr, autovacuum_vacuum_insert_threshold = :thr);
select setseed(0.314159);
insert into accounts select g, rpad(md5(g::text), 100, 'x') from generate_series(1, 200000) g order by random();
create index accounts_id_idx on accounts (id);
-- Fixture B: skewed join
create table customers (id bigint primary key, name text not null)
  with (autovacuum_vacuum_threshold = :thr, autovacuum_analyze_threshold = :thr, autovacuum_vacuum_insert_threshold = :thr);
create table orders (id bigint primary key, customer_id bigint not null, status text not null)
  with (autovacuum_vacuum_threshold = :thr, autovacuum_analyze_threshold = :thr, autovacuum_vacuum_insert_threshold = :thr);
select setseed(0.271828);
insert into customers select g, 'customer ' || g from generate_series(1, 200000) g;
-- one order per customer for a random 100,000-customer subset; 99:1 status skew
insert into orders select row_number() over (), c, case when random() < 0.99 then 'completed' else 'pending' end
  from (select g as c from generate_series(1, 200000) g order by random() limit 100000) s;
create index orders_customer_id_idx on orders (customer_id);
analyze;
vacuum;
SQL
[ $? -ne 0 ] && { log "source setup FAILED"; cat "$OUT/source/setup.log"; exit 1; }

VNUM=$(q postgres "show server_version_num"); RAF=relallfrozen; [ "$VNUM" -ge 180000 ] || RAF="null as relallfrozen"  # added for publication: relallfrozen exists only on 18 and later
STATE_SQL="
select 'pg_class' as kind, relname, relpages, reltuples, relallvisible, $RAF from pg_class where relname in ('accounts','accounts_id_idx','customers','customers_pkey','orders','orders_pkey','orders_customer_id_idx') order by relname;  -- changed for publication: $RAF
select 'vm' as kind, relname, pg_relation_size(c.oid)/current_setting('block_size')::int as heap_blocks, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname in ('accounts','customers','orders') order by relname;
select 'pg_stats_rows' as kind, tablename, count(*) from pg_stats where schemaname='public' group by tablename order by tablename;
select 'orders_status_mcv' as kind, most_common_vals::text, most_common_freqs::text from pg_stats where tablename='orders' and attname='status';
select 'reloptions' as kind, relname, reloptions::text from pg_class where relname in ('accounts','customers','orders') order by relname;
select 'maint' as kind, relname, n_tup_ins, n_live_tup, vacuum_count, autovacuum_count, analyze_count, autoanalyze_count, last_vacuum, last_autovacuum, last_analyze, last_autoanalyze from pg_stat_user_tables order by relname;
"
state(){ # db file
  "${PSQL[@]}" -d "$1" -c "$STATE_SQL" > "$2" 2>&1  # changed for publication
}
CHECK_SQL="
select 'accounts', count(*), md5(string_agg(id::text || ':' || payload, ',' order by id)) from accounts
union all select 'customers', count(*), md5(string_agg(id::text || ':' || name, ',' order by id)) from customers
union all select 'orders', count(*), md5(string_agg(id::text || ':' || customer_id || ':' || status, ',' order by id)) from orders;
"
state forge_src "$OUT/source/state.txt"  # changed for publication
q forge_src "$CHECK_SQL" > "$OUT/source/content.txt"  # changed for publication
q forge_src "select status, count(*) from orders group by 1 order by 1" > "$OUT/source/orders_status.txt"  # changed for publication
q forge_src "select pg_size_pretty(pg_database_size('forge_src'))" > "$OUT/source/db_size.txt"  # changed for publication
log "source ready: $(cat "$OUT/source/db_size.txt"); content: $(tr '\n' ' ' < "$OUT/source/content.txt")"

# ---------- dumps ----------
log "dumping"
pg_dump -Fc -d forge_src -f "$OUT/dumps/default.dump" 2> "$OUT/dumps/default.dump.err"  # changed for publication
pg_dump -Fc $STATS -d forge_src -f "$OUT/dumps/stats.dump" 2> "$OUT/dumps/stats.dump.err"  # changed for publication
pg_restore -l "$OUT/dumps/default.dump" > "$OUT/dumps/default.toc"
pg_restore -l "$OUT/dumps/stats.dump" > "$OUT/dumps/stats.toc"
ls -l "$OUT/dumps" > "$OUT/dumps/ls.txt"
log "default TOC stats entries: $(grep -c 'STATISTICS DATA' "$OUT/dumps/default.toc"); --statistics TOC stats entries: $(grep -c 'STATISTICS DATA' "$OUT/dumps/stats.toc")"

Q1="select id from accounts where id between 100001 and 110000"
Q2="select c.id, c.name, o.id from orders o join customers c on c.id = o.customer_id where o.status = 'completed'"
EXPLAIN="explain (analyze, buffers, settings, verbose, format json)"

run_explain(){ # db outfile sql [pre-sql]
  local db=$1 out=$2 sql=$3 pre=${4:-}
  "${PSQL[@]}" -d "$db" -c "set statement_timeout = '60s'; $pre $EXPLAIN $sql" > "$out" 2>&1 || echo "EXPLAIN FAILED" >> "$out"  # changed for publication
}
vm_snap(){ # db outfile
  q "$1" "select relname, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname in ('accounts','customers','orders') order by relname" > "$2" 2>&1
}

# ---------- target matrix ----------
N=${#ARMS[@]}
for rep in $(seq 1 $REPS); do
  for k in $(seq 0 $((N-1))); do
    arm=${ARMS[$(( (k + rep - 1) % N ))]}
    archive=${arm%%-*}; maint=${arm#*-}
    tid="r${rep}_${arm}"; db="forge_t_r${rep}_${arm//-/_}"; T="$OUT/targets/$tid"; mkdir -p "$T"  # changed for publication
    log "target $tid start"
    t0=$(date +%s)
    echo "$tid,$rep,$arm,$archive,$maint,$(date -u +%FT%TZ)" > "$T/meta.csv"

    create_db "$db"  # changed for publication
    dumpfile="$OUT/dumps/default.dump"; [ "$archive" = stats ] && dumpfile="$OUT/dumps/stats.dump"
    timeout 300 pg_restore -d "$db" --exit-on-error "$dumpfile" > "$T/restore.out" 2> "$T/restore.err"; rc=$?
    echo "$rc" > "$T/restore.rc"
    if [ $rc -ne 0 ]; then log "target $tid restore FAILED rc=$rc"; exit "$rc"; fi  # changed for publication
    state "$db" "$T/state_after_restore.txt"
    case $maint in
      none) : ;;
      analyze) q "$db" "analyze" > "$T/maint.log" 2>&1 ;;
      vacuum) q "$db" "vacuum" > "$T/maint.log" 2>&1 ;;
      vacuum_analyze) q "$db" "vacuum analyze" > "$T/maint.log" 2>&1 ;;
    esac
    state "$db" "$T/state_after_maint.txt"
    # natural plans: pass1=first, pass2=warmup, pass3-5=measured; VM snapshot around each pass
    for pass in 1 2 3 4 5; do
      vm_snap "$db" "$T/vm_before_q1_p$pass.txt"
      run_explain "$db" "$T/q1_natural_p$pass.json" "$Q1"
      vm_snap "$db" "$T/vm_after_q1_p$pass.txt"
      run_explain "$db" "$T/q2_natural_p$pass.json" "$Q2"
      vm_snap "$db" "$T/vm_after_q2_p$pass.txt"
    done
    # forced index-only-scan diagnostic for Q1 (separately labelled)
    for pass in 1 2 3; do
      run_explain "$db" "$T/q1_forced_ios_p$pass.json" "$Q1" "set enable_seqscan=off; set enable_bitmapscan=off;"
    done
    vm_snap "$db" "$T/vm_after_all.txt"
    q "$db" "$CHECK_SQL" > "$T/content.txt" 2>&1
    if ! diff -q "$OUT/source/content.txt" "$T/content.txt" >/dev/null; then log "target $tid CONTENT MISMATCH"; echo mismatch > "$T/content.status"; else echo ok > "$T/content.status"; fi
    state "$db" "$T/state_final.txt"
    echo $(( $(date +%s) - t0 )) > "$T/wall_seconds"
    log "target $tid done in $(cat "$T/wall_seconds")s content=$(cat "$T/content.status")"
  done
done
# server log excerpt for autovacuum contamination check
cp -r "$(q postgres "select setting from pg_settings where name='log_directory'")" "$OUT/env/" 2>/dev/null || true
q postgres "select pg_current_logfile()" > "$OUT/env/current_logfile.txt" 2>/dev/null || true
log "matrix complete"
```

#### `one_query.sh`: the large test, one query by maintenance step, cold and warm (figures 1 and 1b, the two tables, the 6.1 s `--statistics` result)

```bash
#!/usr/bin/env bash
# One query, three readiness steps, cold and warm. Run as root (restarts the cluster and drops the OS page cache).
#   one_query.sh <pgver> <port> <outdir> [restores] [cold_runs] [warm_runs] [events_rows] [customers_rows]
# Source fixture: customers (1M, skewed country; 100 customers in 'LI') and events (250M rows, ~28 GiB heap,
# uniform customer_id). Query: sum/count of events for 'LI' customers via a covering index on events.
# Dumped twice (--no-statistics, --statistics). Per restore:
#   default dump:    none -> ANALYZE -> VACUUM ANALYZE
#   statistics dump: none -> VACUUM
# Each step: <cold_runs> cold runs (restart + drop_caches) then <warm_runs> warm runs; EXPLAIN (ANALYZE, BUFFERS) JSON kept.
# autovacuum is OFF cluster-wide for the whole experiment (disclosed): otherwise the insert-triggered autovacuum
# would perform the steps before we measure them. Databases are dropped at the end of each restore.
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
V=$1; PORT=$2; OUT=$3; RESTORES=${4:-3}; COLD=${5:-3}; WARM=${6:-3}; NEV=${7:-250000000}; NCUST=${8:-1000000}
BIN=/usr/lib/postgresql/$V/bin
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
mkdir -p "$OUT"/{env,source,restores,dumps}
log(){ echo "[$(date -u +%FT%TZ)] $*" | tee -a "$OUT/harness.log"; }
PSQL=(sudo -u postgres env "PATH=$PATH" "PGPORT=$PORT" PGHOST=/var/run/postgresql psql -X -v ON_ERROR_STOP=1 -qAt)  # changed for publication
q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
declare -A created_dbs=()  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
  created_dbs[$1]=yes  # changed for publication
}  # changed for publication
drop_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ && ${created_dbs[$1]:-} == yes ]] || { echo "Refusing unowned database: $1" >&2; exit 1; }  # changed for publication
  q postgres "drop database $1" >/dev/null  # changed for publication
  unset 'created_dbs[$1]'  # changed for publication
}  # changed for publication
# Preserve effective values AND the previous auto.conf entry (or its absence).  # changed for publication
declare -A previous_value=() previous_sql=()  # changed for publication
save_settings(){  # changed for publication
  local name  # changed for publication
  for name in "$@"; do  # changed for publication
    previous_value[$name]=$(q postgres "select current_setting('$name')")  # changed for publication
    previous_sql[$name]=$(q postgres "select coalesce((select format('alter system set %I = %L', name, setting) from pg_file_settings where sourcefile = current_setting('data_directory') || '/postgresql.auto.conf' and name = '$name' order by seqno desc limit 1), format('alter system reset %I', '$name'))")  # changed for publication
  done  # changed for publication
}  # changed for publication
cleanup_settings(){  # changed for publication
  local rc=$? name attempt actual failed=0  # changed for publication
  trap - EXIT  # changed for publication
  for name in "${!previous_sql[@]}"; do  # changed for publication
    q postgres "${previous_sql[$name]}" >/dev/null || failed=1  # changed for publication
  done  # changed for publication
  q postgres "select pg_reload_conf()" >/dev/null || failed=1  # changed for publication
  for name in "${!previous_value[@]}"; do  # changed for publication
    for attempt in {1..50}; do  # changed for publication
      actual=$(q postgres "select current_setting('$name')") || failed=1  # changed for publication
      [[ $actual == "${previous_value[$name]}" ]] && break  # changed for publication
      sleep 0.1  # changed for publication
    done  # changed for publication
    [[ $actual == "${previous_value[$name]}" ]] || { echo "Setting not recovered: $name after $attempt checks" >&2; failed=1; }  # changed for publication
  done  # changed for publication
  (( failed == 0 )) || rc=1  # changed for publication
  exit "$rc"  # changed for publication
}  # changed for publication
trap cleanup_settings EXIT  # changed for publication
trap 'exit 130' INT  # changed for publication
trap 'exit 143' TERM  # changed for publication
save_settings autovacuum max_wal_size checkpoint_timeout maintenance_work_mem  # changed for publication
MAJOR=$(pg_dump --version | awk '{print int($3)}'); NOSTATS=--no-statistics; STATS=--statistics  # added for publication
[ "$MAJOR" -ge 18 ] || { NOSTATS=; STATS=; log "pg_dump $MAJOR has no statistics options: both archives are plain dumps on this version"; }  # added for publication
run_as_pg(){ sudo -u postgres env "PATH=$BIN:$PATH" "PGPORT=$PORT" PGHOST=/var/run/postgresql "$@"; }  # changed for publication
cold(){ pg_ctlcluster "$V" forge_blog restart; sync; echo 3 > /proc/sys/vm/drop_caches; sleep 2; }  # changed for publication
QUERY="select count(*), sum(e.amount) from customers c join events e on e.customer_id = c.id where c.country = 'LI'"
DUMPDIR=/var/lib/postgresql/oq_dumps; mkdir -p $DUMPDIR; chown postgres $DUMPDIR

{ echo "server: $(postgres --version)"; echo "pg_dump: $(pg_dump --version)"; echo "uname: $(uname -a)"; echo "nproc: $(nproc)"; free -m | sed -n 2p;
  echo "disk:"; lsblk -d -o NAME,SIZE,ROTA,MODEL | sed 's/^/  /'; df -h /var/lib/postgresql | tail -1; } > "$OUT/env/versions.txt"
q postgres "alter system set max_wal_size = '8GB'" >/dev/null  # changed for publication
q postgres "alter system set checkpoint_timeout = '30min'" >/dev/null  # changed for publication
q postgres "alter system set maintenance_work_mem = '1GB'" >/dev/null  # changed for publication
q postgres "alter system set autovacuum = off" >/dev/null; q postgres "select pg_reload_conf()" >/dev/null; sleep 1
q postgres "copy (select name, setting, unit, source from pg_settings where source not in ('default','override') order by name) to stdout csv header" > "$OUT/env/pg_settings_non_default.csv"

# ---------- source fixture ----------
if [ ! -s $DUMPDIR/nostats.dump ]; then
  log "building source: events=$NEV customers=$NCUST"
  create_db "forge_src"  # changed for publication
  "${PSQL[@]}" -d forge_src <<SQL > "$OUT/source/setup.log" 2>&1  # changed for publication
\timing on
create extension pg_visibility;
select setseed(0.314159);
create table customers (id int primary key, country text not null, name text not null);
insert into customers
select g, case when g <= 100 then 'LI' else (array['US','DE','GB','FR','BR','IN','JP','CA','AU','NL','ES','IT','PL','SE','MX','KR','TR','AR','CH','AT','BE','DK','NO','FI','IE','PT','CZ','HU','RO','GR','IL','SG','NZ','ZA','CL','CO','PE','TH','MY','ID','PH','VN','UA','EG','NG','KE','MA','SA','AE'])[1 + floor(random()*random()*49)::int] end,
       'customer ' || g from generate_series(1, $NCUST) g;
create index customers_country_idx on customers (country);
create table events (id bigint not null, customer_id int not null, kind smallint not null, amount int not null, created_at timestamptz not null, payload text not null);
insert into events select g, 1 + floor(random()*$NCUST)::int, (random()*10)::int, (random()*1000)::int, timestamp '2024-01-01' + g * interval '1 second', rpad(md5(g::text), 64, 'x') from generate_series(1, $NEV) g;
alter table events add primary key (id);
create index events_customer_amount_idx on events (customer_id) include (amount);
vacuum analyze;
select relname, relpages, reltuples::bigint, relallvisible, pg_size_pretty(pg_relation_size(oid)) from pg_class where relname in ('customers','events','events_pkey','events_customer_amount_idx') order by relname;
select country, count(*) from customers group by 1 order by 2 desc limit 5;
select count(*) from customers where country = 'LI';
$QUERY;
SQL
  [ $? -ne 0 ] && { log "source setup FAILED"; tail -20 "$OUT/source/setup.log"; exit 1; }
  log "dumping"
  run_as_pg pg_dump -Fc $NOSTATS -d forge_src -f "$DUMPDIR/nostats.dump" && run_as_pg pg_dump -Fc $STATS -d forge_src -f "$DUMPDIR/stats.dump" || { log "dump FAILED"; exit 1; }  # changed for publication
  ls -l $DUMPDIR > "$OUT/dumps/ls.txt"
  drop_db "forge_src"  # changed for publication
fi

explain_runs(){ # db step
  local db=$1 step=$2; local d="$OUT/restores/r$R/$step"; mkdir -p "$d"
  for i in $(seq 1 $COLD); do cold; "${PSQL[@]}" -d "$db" -c "explain (analyze, buffers, settings, format json) $QUERY" > "$d/cold_$i.json" || log "cold run failed"; done  # changed for publication
  for i in $(seq 1 $WARM); do "${PSQL[@]}" -d "$db" -c "explain (analyze, buffers, settings, format json) $QUERY" > "$d/warm_$i.json" || log "warm run failed"; done  # changed for publication
  "${PSQL[@]}" -d "$db" -c "explain (analyze, buffers) $QUERY" > "$d/plan_warm.txt"  # changed for publication
  q "$db" "copy (select relname, relpages, reltuples::bigint, relallvisible from pg_class where relname in ('customers','events','events_customer_amount_idx')) to stdout csv" > "$d/pg_class.csv"
  q "$db" "copy (select tablename, count(*) from pg_stats where schemaname='public' group by 1) to stdout csv" > "$d/pg_stats.csv"
  q "$db" "copy (select 'events', all_visible, all_frozen from pg_visibility_map_summary('events')) to stdout csv" > "$d/vm.csv"
}
timed(){ # db label sql
  local t0 t1; t0=$(date +%s.%N); q "$1" "$3" >/dev/null; t1=$(date +%s.%N)  # changed for publication
  echo "$2,$(echo "$t1 - $t0" | bc)" >> "$OUT/restores/r$R/maintenance_seconds.csv"
}
for R in $(seq 1 $RESTORES); do
  mkdir -p "$OUT/restores/r$R"
  log "restore $R: default dump"
  create_db "forge_oq_def"  # changed for publication
  t0=$(date +%s); run_as_pg pg_restore --exit-on-error -d forge_oq_def "$DUMPDIR/nostats.dump" > "$OUT/restores/r$R/restore_def.log" 2>&1; echo "restore_def,$(( $(date +%s) - t0 ))" >> "$OUT/restores/r$R/maintenance_seconds.csv"  # changed for publication
  q forge_oq_def "create extension if not exists pg_visibility" >/dev/null  # changed for publication
  explain_runs forge_oq_def def-none  # changed for publication
  timed forge_oq_def analyze "analyze"  # changed for publication
  explain_runs forge_oq_def def-analyze  # changed for publication
  timed forge_oq_def vacuum_analyze "vacuum analyze"  # changed for publication
  explain_runs forge_oq_def def-vacuum_analyze  # changed for publication
  drop_db "forge_oq_def"  # changed for publication
  log "restore $R: statistics dump"
  create_db "forge_oq_st"  # changed for publication
  t0=$(date +%s); run_as_pg pg_restore --exit-on-error -d forge_oq_st "$DUMPDIR/stats.dump" > "$OUT/restores/r$R/restore_st.log" 2>&1; echo "restore_st,$(( $(date +%s) - t0 ))" >> "$OUT/restores/r$R/maintenance_seconds.csv"  # changed for publication
  q forge_oq_st "create extension if not exists pg_visibility" >/dev/null  # changed for publication
  explain_runs forge_oq_st st-none  # changed for publication
  timed forge_oq_st vacuum "vacuum"  # changed for publication
  explain_runs forge_oq_st st-vacuum  # changed for publication
  drop_db "forge_oq_st"  # changed for publication
done
log "done"
```

#### `first_read_cost.sh`: WAL and dirtied blocks from the first reads after pg_restore, with and without a checkpoint (figure 4, the 26.9 MiB of WAL from hint bits)

```bash
#!/usr/bin/env bash
# First-read cost after restore: hint-bit dirtying, WAL from reads, VM bits
# set by reads (19+), and whether ANALYZE after a read enables IOS.
#   first_read_cost.sh <label> <bindir> <port> <outdir> [reps]
# Arms: {none, vacuum, analyze} x {ckpt, nockpt}; "ckpt" issues CHECKPOINT
# right after the restore so restored pages are older than the redo point.
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
export LABEL=$1; BIN=$2; PORT=$3; OUT=$4; REPS=${5:-3}  # changed for publication
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
mkdir -p "$OUT"/{env,targets,dumps}
log(){ echo "[$(date -u +%FT%TZ)] $*" | tee -a "$OUT/harness.log"; }
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt)  # changed for publication
q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
}  # changed for publication
{ echo "server: $(postgres --version)"; echo "server_version_num: $(q postgres 'show server_version_num')"; q postgres "select 'data_checksums=' || current_setting('data_checksums') || ' wal_log_hints=' || current_setting('wal_log_hints') || ' wal_level=' || current_setting('wal_level') || ' full_page_writes=' || current_setting('full_page_writes') || ' wal_compression=' || current_setting('wal_compression')"; } > "$OUT/env/versions.txt"
VNUM=$(q postgres 'show server_version_num'); RAF=relallfrozen; [ "$VNUM" -lt 180000 ] && RAF="0 as relallfrozen"
create_db "forge_frc_src"  # changed for publication
"${PSQL[@]}" -d forge_frc_src <<'SQL' > "$OUT/env/source_setup.log" 2>&1  # changed for publication
create extension pg_visibility;
\set thr 2000000000
create table accounts (id bigint not null, payload text not null) with (autovacuum_vacuum_threshold = :thr, autovacuum_analyze_threshold = :thr, autovacuum_vacuum_insert_threshold = :thr);
select setseed(0.314159);
insert into accounts select g, rpad(md5(g::text), 100, 'x') from generate_series(1, 200000) g order by random();
create index accounts_id_idx on accounts (id);
create table customers (id bigint primary key, name text not null) with (autovacuum_vacuum_threshold = :thr, autovacuum_analyze_threshold = :thr, autovacuum_vacuum_insert_threshold = :thr);
create table orders (id bigint primary key, customer_id bigint not null, status text not null) with (autovacuum_vacuum_threshold = :thr, autovacuum_analyze_threshold = :thr, autovacuum_vacuum_insert_threshold = :thr);
select setseed(0.271828);
insert into customers select g, 'customer ' || g from generate_series(1, 200000) g;
insert into orders select row_number() over (), c, case when random() < 0.99 then 'completed' else 'pending' end from (select g as c from generate_series(1, 200000) g order by random() limit 100000) s;
create index orders_customer_id_idx on orders (customer_id);
-- index-less table: nothing reads its heap during the restore
create table events (id bigint not null, payload text not null) with (autovacuum_vacuum_threshold = :thr, autovacuum_analyze_threshold = :thr, autovacuum_vacuum_insert_threshold = :thr);
insert into events select g, rpad(md5(g::text), 100, 'x') from generate_series(1, 200000) g;
analyze; vacuum;
SQL
pg_dump -Fc -d forge_frc_src -f "$OUT/dumps/default.dump" || { log "dump failed"; exit 1; }  # changed for publication
STATE="select 'pg_class', relname, relpages, reltuples, relallvisible, $RAF from pg_class where relname in ('accounts','customers','orders','events') order by relname;
select 'vm', relname, pg_relation_size(c.oid)/current_setting('block_size')::int, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname in ('accounts','customers','orders','events') order by relname;
select 'maint', relname, autovacuum_count, autoanalyze_count from pg_stat_user_tables order by relname;"
state(){ "${PSQL[@]}" -d "$1" -c "$STATE" > "$2" 2>&1; }  # changed for publication
EXPLAIN="explain (analyze, buffers, wal, settings, verbose, format json)"
# measured statement: EXPLAIN JSON (buffers incl. dirtied/written, WAL records/fpi/bytes) plus LSN delta
meas(){ # db tag sql
  local db=$1 tag=$2 sql=$3 T=$4
  local l0; l0=$(q "$db" "select pg_current_wal_lsn()")
  "${PSQL[@]}" -d "$db" -c "set statement_timeout='120s'; $EXPLAIN $sql" > "$T/$tag.json" 2>&1 || echo "EXPLAIN FAILED" >> "$T/$tag.json"  # changed for publication
  local l1; l1=$(q "$db" "select pg_current_wal_lsn()")
  echo "$tag $(q "$db" "select pg_wal_lsn_diff('$l1','$l0')")" >> "$T/wal_lsn_delta.txt"
  q "$db" "select relname, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname in ('accounts','customers','orders','events') order by relname" > "$T/vm_after_$tag.txt"
}
Q1="select id from accounts where id between 100001 and 110000"
Q2="select c.id, c.name, o.id from orders o join customers c on c.id = o.customer_id where o.status = 'completed'"
SEQ_ACC="select count(*) from accounts"
SEQ_ORD="select count(*) from orders"
SEQ_CUS="select count(*) from customers"
SEQ_EV="select count(*) from events"
MAINTS=(none vacuum analyze); CK=(ckpt nockpt)
for rep in $(seq 1 $REPS); do
  for mi in 0 1 2; do for ci in 0 1; do
    maint=${MAINTS[$(( (mi + rep - 1) % 3 ))]}; ck=${CK[$ci]}
    tid="r${rep}_${maint}_${ck}"; db="forge_frc_${tid}"; T="$OUT/targets/$tid"; mkdir -p "$T"  # changed for publication
    log "target $tid"
    create_db "$db"  # changed for publication
    pg_restore -d "$db" --exit-on-error "$OUT/dumps/default.dump" > "$T/restore.out" 2> "$T/restore.err"; echo $? > "$T/restore.rc"
    [ $ck = ckpt ] && q "$db" "checkpoint" >/dev/null
    state "$db" "$T/state_after_restore.txt"
    : > "$T/wal_lsn_delta.txt"
    case $maint in
      vacuum)  l0=$(q "$db" "select pg_current_wal_lsn()"); q "$db" "vacuum" >/dev/null; l1=$(q "$db" "select pg_current_wal_lsn()"); echo "maint_vacuum $(q "$db" "select pg_wal_lsn_diff('$l1','$l0')")" >> "$T/wal_lsn_delta.txt" ;;
      analyze) l0=$(q "$db" "select pg_current_wal_lsn()"); q "$db" "analyze" >/dev/null; l1=$(q "$db" "select pg_current_wal_lsn()"); echo "maint_analyze $(q "$db" "select pg_wal_lsn_diff('$l1','$l0')")" >> "$T/wal_lsn_delta.txt" ;;
    esac
    state "$db" "$T/state_after_maint.txt"
    # The indexed range query is first; the index-less events count follows the other tables.  # changed for publication
    meas "$db" q1_first "$Q1" "$T"
    meas "$db" q2_first "$Q2" "$T"
    meas "$db" seq_accounts_first "$SEQ_ACC" "$T"
    meas "$db" seq_orders_first "$SEQ_ORD" "$T"
    meas "$db" seq_customers_first "$SEQ_CUS" "$T"
    meas "$db" seq_events_first "$SEQ_EV" "$T"
    meas "$db" seq_events_second "$SEQ_EV" "$T"
    meas "$db" q1_second "$Q1" "$T"
    meas "$db" seq_accounts_second "$SEQ_ACC" "$T"
    # does ANALYZE after the reads let the planner use read-populated VM bits (19+)?
    q "$db" "analyze" >/dev/null
    state "$db" "$T/state_after_post_read_analyze.txt"
    meas "$db" q1_after_post_read_analyze "$Q1" "$T"
    state "$db" "$T/state_final.txt"
  done; done
done
log "first-read matrix complete"
```

#### `stock_autovacuum.sh`: seconds from pg_restore exit until stock autovacuum has vacuumed and analyzed all three tables (figure 5, 6 to 67 s on 18.6)

```bash
#!/usr/bin/env bash
# Stock-autovacuum arm: same fixture WITHOUT per-table thresholds, stock
# autovacuum settings. After each fresh restore: capture what a user sees
# immediately, then poll until autovacuum/autoanalyze have processed all
# three tables (or 300 s), then capture again.
#   stock_autovacuum.sh <label> <bindir> <port> <outdir> [reps]
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
export LABEL=$1; BIN=$2; PORT=$3; OUT=$4; REPS=${5:-3}  # changed for publication
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
mkdir -p "$OUT"/{env,source,targets,dumps}
log(){ echo "[$(date -u +%FT%T.%3NZ)] $*" | tee -a "$OUT/harness.log"; }
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt)  # changed for publication
q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
}  # changed for publication
MAJOR=$(pg_dump --version | awk '{print int($3)}'); STATS=--statistics  # added for publication
[ "$MAJOR" -ge 18 ] || { STATS=; log "pg_dump $MAJOR has no --statistics option: the stats archive is a plain dump on this version"; }  # added for publication
{ echo "server: $(postgres --version)"; echo "pg_dump: $(pg_dump --version)"; echo "server_version_num: $(q postgres 'show server_version_num')"; } > "$OUT/env/versions.txt"
q postgres "copy (select name, setting, unit, source from pg_settings where name like 'autovacuum%' or name in ('track_counts') order by name) to stdout csv header" > "$OUT/env/autovacuum_settings.csv"
q postgres "copy (select name, setting, unit, source from pg_settings where source not in ('default','override') order by name) to stdout csv header" > "$OUT/env/pg_settings_non_default.csv"

log "building source (no per-table thresholds)"
create_db "forge_src_stock"  # changed for publication
"${PSQL[@]}" -d forge_src_stock <<'SQL' > "$OUT/source/setup.log" 2>&1  # changed for publication
create extension pg_visibility;
create table accounts (id bigint not null, payload text not null);
select setseed(0.314159);
insert into accounts select g, rpad(md5(g::text), 100, 'x') from generate_series(1, 200000) g order by random();
create index accounts_id_idx on accounts (id);
create table customers (id bigint primary key, name text not null);
create table orders (id bigint primary key, customer_id bigint not null, status text not null);
select setseed(0.271828);
insert into customers select g, 'customer ' || g from generate_series(1, 200000) g;
insert into orders select row_number() over (), c, case when random() < 0.99 then 'completed' else 'pending' end
  from (select g as c from generate_series(1, 200000) g order by random() limit 100000) s;
create index orders_customer_id_idx on orders (customer_id);
analyze;
vacuum;
SQL
[ $? -ne 0 ] && { log "source FAILED"; cat "$OUT/source/setup.log"; exit 1; }
VNUM=$(q postgres "show server_version_num"); RAF=relallfrozen; [ "$VNUM" -ge 180000 ] || RAF="null as relallfrozen"  # changed for publication
STATE_SQL="
select 'pg_class' as kind, relname, relpages, reltuples, relallvisible, $RAF from pg_class where relname in ('accounts','customers','orders') order by relname;  -- changed for publication
select 'vm' as kind, relname, pg_relation_size(c.oid)/current_setting('block_size')::int as heap_blocks, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname in ('accounts','customers','orders') order by relname;
select 'pg_stats_rows' as kind, tablename, count(*) from pg_stats where schemaname='public' group by tablename order by tablename;
select 'reloptions' as kind, relname, coalesce(reloptions::text,'') from pg_class where relname in ('accounts','customers','orders') order by relname;
select 'maint' as kind, relname, n_tup_ins, n_live_tup, vacuum_count, autovacuum_count, analyze_count, autoanalyze_count, last_vacuum, last_autovacuum, last_analyze, last_autoanalyze from pg_stat_user_tables order by relname;
"
state(){ "${PSQL[@]}" -d "$1" -c "$STATE_SQL" > "$2" 2>&1; }  # changed for publication
state forge_src_stock "$OUT/source/state.txt"  # changed for publication
pg_dump -Fc -d forge_src_stock -f "$OUT/dumps/default.dump" || { log "dump failed"; exit 1; }  # changed for publication
pg_dump -Fc $STATS -d forge_src_stock -f "$OUT/dumps/stats.dump" || { log "dump failed"; exit 1; }  # changed for publication
pg_restore -l "$OUT/dumps/default.dump" > "$OUT/dumps/default.toc"; pg_restore -l "$OUT/dumps/stats.dump" > "$OUT/dumps/stats.toc"
Q1="select id from accounts where id between 100001 and 110000"
Q2="select c.id, c.name, o.id from orders o join customers c on c.id = o.customer_id where o.status = 'completed'"
EXPLAIN="explain (analyze, buffers, settings, verbose, format json)"
run_explain(){ "${PSQL[@]}" -d "$1" -c "set statement_timeout = '60s'; $EXPLAIN $3" > "$2" 2>&1 || echo "EXPLAIN FAILED" >> "$2"; }  # changed for publication
ARCHIVES=(default stats)
for rep in $(seq 1 $REPS); do
  for k in 0 1; do
    archive=${ARCHIVES[$(( (k + rep - 1) % 2 ))]}
    tid="r${rep}_${archive}"; db="forge_s_${tid}"; T="$OUT/targets/$tid"; mkdir -p "$T"  # changed for publication
    log "target $tid start"
    create_db "$db"  # changed for publication
    restore_start=$(date +%s.%N)
    pg_restore -d "$db" --exit-on-error "$OUT/dumps/$archive.dump" > "$T/restore.out" 2> "$T/restore.err"; echo $? > "$T/restore.rc"
    restore_end=$(date +%s.%N); echo "$restore_start $restore_end" > "$T/restore_times"
    q "$db" "select now()" > "$T/restore_done_at.txt"
    state "$db" "$T/state_after_restore.txt"
    run_explain "$db" "$T/q1_immediate.json" "$Q1"
    run_explain "$db" "$T/q2_immediate.json" "$Q2"
    # poll until every table has last_autovacuum and last_autoanalyze set, or 300 s
    : > "$T/poll.log"
    while :; do  # changed for publication
      line=$(q "$db" "select string_agg(relname || ':' || coalesce(to_char(last_autovacuum,'HH24:MI:SS.MS'),'-') || '/' || coalesce(to_char(last_autoanalyze,'HH24:MI:SS.MS'),'-') || '/av=' || autovacuum_count || '/aa=' || autoanalyze_count, ' ' order by relname) from pg_stat_user_tables")
      echo "$(date -u +%FT%T.%3NZ) $line" >> "$T/poll.log"
      done_cnt=$(q "$db" "select count(*) from pg_stat_user_tables where last_autovacuum is not null and last_autoanalyze is not null")
      [ "$done_cnt" = "3" ] && break
      (( $(date +%s) - ${restore_end%.*} < 300 )) || break  # changed for publication
      sleep 1
    done
    elapsed=$(echo "$(date +%s.%N) - $restore_end" | bc)  # changed for publication
    echo "$elapsed" > "$T/seconds_until_all_tables_vacuumed_and_analyzed"  # changed for publication
    log "target $tid autovacuum+autoanalyze on all 3 tables after ${elapsed}s; completed tables=$done_cnt"  # changed for publication
    state "$db" "$T/state_after_autovacuum.txt"
    for p in 1 2 3; do run_explain "$db" "$T/q1_after_p$p.json" "$Q1"; run_explain "$db" "$T/q2_after_p$p.json" "$Q2"; done
    state "$db" "$T/state_final.txt"
    log "target $tid done"
  done
done
log "stock matrix complete"
```

The next two scripts build the same 1,820 MiB fixture as this one.

#### `freeze_track.sh`: VACUUM with and without FREEZE on the 1,820 MiB database, then a forced aggressive vacuum (the 1.50 GiB against 1.49 GiB of freeze WAL, the 35 KiB later vacuum)

```bash
#!/usr/bin/env bash
# Freeze state after restore: VACUUM vs VACUUM (FREEZE) vs VACUUM ANALYZE vs
# VACUUM (FREEZE, ANALYZE), each on its own fresh restore of a 10M-row fixture,
# then the residual cost of a later aggressive (anti-wraparound style) vacuum.
# Timings are context on a dedicated host. Run as the postgres OS user.
#   freeze_track.sh <bindir> <port> <outdir> <logfile> [rows_accounts] [rows_customers]
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
BIN=$1; PORT=$2; OUT=$3; LOGFILE=$4; NACC=${5:-10000000}; NCUS=${6:-2000000}
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
mkdir -p "$OUT"/{env,dumps,steps}
log(){ echo "[$(date -u +%FT%T.%3NZ)] $*" | tee -a "$OUT/harness.log"; }
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt); q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
}  # changed for publication
# Preserve effective values AND the previous auto.conf entry (or its absence).  # changed for publication
declare -A previous_value=() previous_sql=()  # changed for publication
save_settings(){  # changed for publication
  local name  # changed for publication
  for name in "$@"; do  # changed for publication
    previous_value[$name]=$(q postgres "select current_setting('$name')")  # changed for publication
    previous_sql[$name]=$(q postgres "select coalesce((select format('alter system set %I = %L', name, setting) from pg_file_settings where sourcefile = current_setting('data_directory') || '/postgresql.auto.conf' and name = '$name' order by seqno desc limit 1), format('alter system reset %I', '$name'))")  # changed for publication
  done  # changed for publication
}  # changed for publication
cleanup_settings(){  # changed for publication
  local rc=$? name attempt actual failed=0  # changed for publication
  trap - EXIT  # changed for publication
  for name in "${!previous_sql[@]}"; do  # changed for publication
    q postgres "${previous_sql[$name]}" >/dev/null || failed=1  # changed for publication
  done  # changed for publication
  q postgres "select pg_reload_conf()" >/dev/null || failed=1  # changed for publication
  for name in "${!previous_value[@]}"; do  # changed for publication
    for attempt in {1..50}; do  # changed for publication
      actual=$(q postgres "select current_setting('$name')") || failed=1  # changed for publication
      [[ $actual == "${previous_value[$name]}" ]] && break  # changed for publication
      sleep 0.1  # changed for publication
    done  # changed for publication
    [[ $actual == "${previous_value[$name]}" ]] || { echo "Setting not recovered: $name after $attempt checks" >&2; failed=1; }  # changed for publication
  done  # changed for publication
  (( failed == 0 )) || rc=1  # changed for publication
  exit "$rc"  # changed for publication
}  # changed for publication
trap cleanup_settings EXIT  # changed for publication
trap 'exit 130' INT  # changed for publication
trap 'exit 143' TERM  # changed for publication
save_settings autovacuum  # changed for publication
{ echo "server: $(postgres --version)"; q postgres "select 'shared_buffers=' || current_setting('shared_buffers') || ' maintenance_work_mem=' || current_setting('maintenance_work_mem') || ' checksums=' || current_setting('data_checksums') || ' vacuum_freeze_min_age=' || current_setting('vacuum_freeze_min_age') || ' vacuum_freeze_table_age=' || current_setting('vacuum_freeze_table_age') || ' autovacuum_freeze_max_age=' || current_setting('autovacuum_freeze_max_age') || ' wal_compression=' || current_setting('wal_compression')"; q postgres "select coalesce((select 'vacuum_max_eager_freeze_failure_rate=' || setting from pg_settings where name='vacuum_max_eager_freeze_failure_rate'), 'vacuum_max_eager_freeze_failure_rate=n/a')"; nproc; free -m | sed -n 2p; } > "$OUT/env/versions.txt"
timed(){ # name db sql [session GUCs for PGOPTIONS] -> seconds, WAL bytes, rc
  local name=$1 db=$2 sql=$3 opts=${4:-} l0 l1 t0 t1
  l0=$(q "$db" "select pg_current_wal_lsn()"); t0=$(date +%s.%N)
  PGOPTIONS="$opts" "${PSQL[@]}" -d "$db" -c "$sql" > "$OUT/steps/$name.out" 2>&1; rc=$?  # changed for publication
  t1=$(date +%s.%N); l1=$(q "$db" "select pg_current_wal_lsn()")
  echo "$name,$(echo "$t1 - $t0" | bc),$(q "$db" "select pg_wal_lsn_diff('$l1','$l0')"),$rc" | tee -a "$OUT/steps.csv"
}
timedsh(){ local name=$1; shift; local l0 l1 t0 t1
  l0=$(q postgres "select pg_current_wal_lsn()"); t0=$(date +%s.%N)
  "$@" > "$OUT/steps/$name.out" 2>&1; rc=$?
  t1=$(date +%s.%N); l1=$(q postgres "select pg_current_wal_lsn()")
  echo "$name,$(echo "$t1 - $t0" | bc),$(q postgres "select pg_wal_lsn_diff('$l1','$l0')"),$rc" | tee -a "$OUT/steps.csv"
}
echo "step,seconds,wal_bytes,rc" > "$OUT/steps.csv"
VNUM=$(q postgres "show server_version_num"); RAF=relallfrozen; [ "$VNUM" -ge 180000 ] || RAF="null as relallfrozen"  # changed for publication
STATE="select 'pg_class', relname, relpages, reltuples, relallvisible, $RAF, relfrozenxid, age(relfrozenxid) as frozenxid_age, relminmxid from pg_class where relname in ('accounts','customers','orders') order by relname;  -- changed for publication
select 'vm', relname, pg_relation_size(c.oid)/current_setting('block_size')::int as heap_blocks, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname in ('accounts','customers','orders') order by relname;
select 'xmin', 'accounts', count(distinct xmin::text), min(xmin::text::bigint), max(xmin::text::bigint) from accounts;  -- changed for publication
select 'db', datname, age(datfrozenxid) from pg_database where datname = current_database();
select 'maint', relname, vacuum_count, autovacuum_count, analyze_count, autoanalyze_count from pg_stat_user_tables order by relname;
select 'size', pg_size_pretty(pg_database_size(current_database()));"
state(){ "${PSQL[@]}" -d "$1" -c "$STATE" > "$2" 2>&1; }  # changed for publication
EXPLAIN="explain (analyze, buffers, settings, verbose, format json)"
Q1="select id from accounts where id between 5000001 and 5010000"
plans(){ "${PSQL[@]}" -d "$1" -c "set statement_timeout='600s'; $EXPLAIN $Q1" > "$OUT/steps/$2_q1.json" 2>&1; }  # changed for publication

log "building big source: accounts=$NACC customers=$NCUS"
create_db "forge_fz_src"  # changed for publication
timed build_source forge_fz_src "create extension pg_visibility;  -- changed for publication
create table accounts (id bigint not null, payload text not null);
select setseed(0.314159);
insert into accounts select g, rpad(md5(g::text), 100, 'x') from generate_series(1, $NACC) g order by random();
create index accounts_id_idx on accounts (id);
create table customers (id bigint primary key, name text not null);
create table orders (id bigint primary key, customer_id bigint not null, status text not null);
select setseed(0.271828);
insert into customers select g, 'customer ' || g from generate_series(1, $NCUS) g;
insert into orders select row_number() over (), c, case when random() < 0.99 then 'completed' else 'pending' end from (select g as c from generate_series(1, $NCUS) g order by random() limit $((NCUS/2))) s;
create index orders_customer_id_idx on orders (customer_id);"
[ "$(tail -1 "$OUT/steps.csv" | cut -d, -f4)" = 0 ] || { log "source build failed"; cat "$OUT/steps/build_source.out"; exit 1; }
timed source_analyze forge_fz_src "analyze"  # changed for publication
timed source_vacuum forge_fz_src "vacuum"  # changed for publication
state forge_fz_src "$OUT/source_state.txt"  # changed for publication
timedsh dump_default pg_dump -Fc -d forge_fz_src -f "$OUT/dumps/default.dump"  # changed for publication
q postgres "alter system set autovacuum = off" >/dev/null; q postgres "select pg_reload_conf()" >/dev/null; sleep 1
mk(){ create_db "$1"; }  # changed for publication
fresh(){ # db -> restore + checkpoint, state after restore
  mk "$1"; timedsh "restore_$1" pg_restore -d "$1" -j 4 --exit-on-error "$OUT/dumps/default.dump"
  q "$1" "checkpoint" >/dev/null; state "$1" "$OUT/steps/$1_after_restore_state.txt"
}
# arms
declare -A SQL=( [vacuum]="vacuum" [vacuum_freeze]="vacuum (freeze)" [vacuum_analyze]="vacuum analyze" [vacuum_freeze_analyze]="vacuum (freeze, analyze)" [analyze]="analyze" )
for arm in vacuum vacuum_freeze vacuum_analyze vacuum_freeze_analyze analyze; do
  db="forge_fz_$arm"; fresh "$db"  # changed for publication
  timed "maint_$arm" "$db" "${SQL[$arm]}"
  state "$db" "$OUT/steps/${db}_after_maint_state.txt"; plans "$db" "after_$arm"
  # residual work: what a later aggressive vacuum still has to do on this table
  q "$db" "checkpoint" >/dev/null
  timed "aggressive_after_$arm" "$db" "vacuum (verbose) accounts" "-c vacuum_freeze_min_age=0 -c vacuum_freeze_table_age=0 -c vacuum_multixact_freeze_min_age=0 -c vacuum_multixact_freeze_table_age=0"
  state "$db" "$OUT/steps/${db}_after_aggressive_state.txt"
done
# with wal_compression, the FPI-heavy arms shrink: one extra arm each for vacuum and vacuum (freeze)
for comp in lz4 zstd; do
  for arm in vacuum vacuum_freeze; do
    db="forge_fz_${arm}_$comp"; fresh "$db"  # changed for publication
    timed "maint_${arm}_wal_compression_$comp" "$db" "${SQL[$arm]}" "-c wal_compression=$comp"
    state "$db" "$OUT/steps/${db}_after_maint_state.txt"
  done
done
# Previous settings are returned by the EXIT trap.  # changed for publication
grep -E 'checkpoint (starting|complete)' "$LOGFILE" > "$OUT/env/checkpoints.txt" 2>/dev/null || true
log "freeze track complete"
```

#### `freeze_track2.sh`: the same freeze arms, three restores each, with the later aggressive vacuum run by autovacuum itself (the later anti-wraparound rewrite on 18.6, plain VACUUM freezing every page on 19rc1)

```bash
#!/usr/bin/env bash
# Freeze track, second pass: three fresh restores per arm, and the later
# aggressive vacuum is a real autovacuum run instead of a manual VACUUM with
# freeze ages forced to zero.
#
# How the "later" is produced: the three freeze thresholds are scaled down by
# 1000 (vacuum_freeze_min_age 50,000 and vacuum_freeze_table_age 150,000 at
# cluster level for the manual step; autovacuum_freeze_min_age 50,000,
# autovacuum_freeze_table_age 150,000 and autovacuum_freeze_max_age 200,000 as
# reloptions on accounts, because the cluster-level freeze_max_age needs a
# restart; stock values are 50M, 150M, 200M),
# then after the post-restore step the harness consumes 220,000 XIDs and turns
# autovacuum back on. The first autovacuum of accounts is then an aggressive
# (anti-wraparound) one, launched and throttled by autovacuum itself, and its
# own log line reports its WAL usage. Only one experiment database exists at a
# time, so no other table competes for the workers.
#
# Arms: vacuum, vacuum_freeze, analyze (each 3 fresh restores). For the analyze
# arm the harness also records pg_waldump --stats for the ANALYZE's own WAL.
# Timings are context on a dedicated host. Run as the postgres OS user.
#   freeze_track2.sh <bindir> <port> <outdir> <logfile> [reps] [rows_accounts] [rows_customers]
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
BIN=$1; PORT=$2; OUT=$3; LOGFILE=$4; REPS=${5:-3}; NACC=${6:-10000000}; NCUS=${7:-2000000}; TAG=$(date -u +%H%M)
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
mkdir -p "$OUT"/{env,dumps,steps,autovacuum}
log(){ echo "[$(date -u +%FT%T.%3NZ)] $*" | tee -a "$OUT/harness.log"; }
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt); q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
declare -A created_dbs=()  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
  created_dbs[$1]=yes  # changed for publication
}  # changed for publication
drop_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ && ${created_dbs[$1]:-} == yes ]] || { echo "Refusing unowned database: $1" >&2; exit 1; }  # changed for publication
  q postgres "drop database $1" >/dev/null  # changed for publication
  unset 'created_dbs[$1]'  # changed for publication
}  # changed for publication
# Preserve effective values AND the previous auto.conf entry (or its absence).  # changed for publication
declare -A previous_value=() previous_sql=()  # changed for publication
save_settings(){  # changed for publication
  local name  # changed for publication
  for name in "$@"; do  # changed for publication
    previous_value[$name]=$(q postgres "select current_setting('$name')")  # changed for publication
    previous_sql[$name]=$(q postgres "select coalesce((select format('alter system set %I = %L', name, setting) from pg_file_settings where sourcefile = current_setting('data_directory') || '/postgresql.auto.conf' and name = '$name' order by seqno desc limit 1), format('alter system reset %I', '$name'))")  # changed for publication
  done  # changed for publication
}  # changed for publication
cleanup_settings(){  # changed for publication
  local rc=$? name attempt actual failed=0  # changed for publication
  trap - EXIT  # changed for publication
  for name in "${!previous_sql[@]}"; do  # changed for publication
    q postgres "${previous_sql[$name]}" >/dev/null || failed=1  # changed for publication
  done  # changed for publication
  q postgres "select pg_reload_conf()" >/dev/null || failed=1  # changed for publication
  for name in "${!previous_value[@]}"; do  # changed for publication
    for attempt in {1..50}; do  # changed for publication
      actual=$(q postgres "select current_setting('$name')") || failed=1  # changed for publication
      [[ $actual == "${previous_value[$name]}" ]] && break  # changed for publication
      sleep 0.1  # changed for publication
    done  # changed for publication
    [[ $actual == "${previous_value[$name]}" ]] || { echo "Setting not recovered: $name after $attempt checks" >&2; failed=1; }  # changed for publication
  done  # changed for publication
  (( failed == 0 )) || rc=1  # changed for publication
  exit "$rc"  # changed for publication
}  # changed for publication
trap cleanup_settings EXIT  # changed for publication
trap 'exit 130' INT  # changed for publication
trap 'exit 143' TERM  # changed for publication
save_settings autovacuum vacuum_freeze_min_age vacuum_freeze_table_age autovacuum_naptime  # changed for publication
PGDATA=$(q postgres "show data_directory")
timed(){ # name db sql [session GUCs for PGOPTIONS] -> seconds, WAL bytes, rc; also lsn0,lsn1
  local name=$1 db=$2 sql=$3 opts=${4:-} l0 l1 t0 t1
  l0=$(q "$db" "select pg_current_wal_lsn()"); t0=$(date +%s.%N)
  PGOPTIONS="$opts" "${PSQL[@]}" -d "$db" -c "$sql" > "$OUT/steps/$name.out" 2>&1; rc=$?  # changed for publication
  t1=$(date +%s.%N); l1=$(q "$db" "select pg_current_wal_lsn()")
  echo "$name,$(echo "$t1 - $t0" | bc),$(q "$db" "select pg_wal_lsn_diff('$l1','$l0')"),$rc,$l0,$l1" | tee -a "$OUT/steps.csv"
}
timedsh(){ local name=$1; shift; local l0 l1 t0 t1
  l0=$(q postgres "select pg_current_wal_lsn()"); t0=$(date +%s.%N)
  "$@" > "$OUT/steps/$name.out" 2>&1; rc=$?
  t1=$(date +%s.%N); l1=$(q postgres "select pg_current_wal_lsn()")
  echo "$name,$(echo "$t1 - $t0" | bc),$(q postgres "select pg_wal_lsn_diff('$l1','$l0')"),$rc,$l0,$l1" | tee -a "$OUT/steps.csv"
}
echo "step,seconds,wal_bytes,rc,lsn_start,lsn_end" > "$OUT/steps.csv"
VNUM=$(q postgres "show server_version_num"); RAF=relallfrozen; [ "$VNUM" -ge 180000 ] || RAF="null as relallfrozen"  # changed for publication
STATE="select 'pg_class', relname, relpages, reltuples, relallvisible, $RAF, relfrozenxid, age(relfrozenxid) as frozenxid_age from pg_class where relname in ('accounts','customers','orders') order by relname;  -- changed for publication
select 'vm', relname, pg_relation_size(c.oid)/current_setting('block_size')::int as heap_blocks, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname in ('accounts','customers','orders') order by relname;
select 'db', datname, age(datfrozenxid) from pg_database where datname = current_database();
select 'maint', relname, vacuum_count, autovacuum_count, analyze_count, autoanalyze_count, n_ins_since_vacuum from pg_stat_user_tables order by relname;
select 'xid', txid_current()::text;"
state(){ "${PSQL[@]}" -d "$1" -c "$STATE" > "$2" 2>&1; }  # changed for publication

# scaled freeze thresholds, recorded
q postgres "alter system set vacuum_freeze_min_age = 50000" >/dev/null
q postgres "alter system set vacuum_freeze_table_age = 150000" >/dev/null
q postgres "alter system set autovacuum_naptime = '10s'" >/dev/null
q postgres "alter system set autovacuum = off" >/dev/null
q postgres "select pg_reload_conf()" >/dev/null; sleep 2
{ echo "server: $(postgres --version)"; q postgres "select 'shared_buffers=' || current_setting('shared_buffers') || ' maintenance_work_mem=' || current_setting('maintenance_work_mem') || ' checksums=' || current_setting('data_checksums') || ' vacuum_freeze_min_age=' || current_setting('vacuum_freeze_min_age') || ' vacuum_freeze_table_age=' || current_setting('vacuum_freeze_table_age') || ' autovacuum_freeze_max_age=' || current_setting('autovacuum_freeze_max_age') || ' autovacuum_naptime=' || current_setting('autovacuum_naptime') || ' autovacuum_vacuum_cost_delay=' || current_setting('autovacuum_vacuum_cost_delay') || ' autovacuum_vacuum_cost_limit=' || current_setting('autovacuum_vacuum_cost_limit') || ' vacuum_cost_limit=' || current_setting('vacuum_cost_limit') || ' wal_compression=' || current_setting('wal_compression') || ' full_page_writes=' || current_setting('full_page_writes')"; q postgres "select coalesce((select 'vacuum_max_eager_freeze_failure_rate=' || setting from pg_settings where name='vacuum_max_eager_freeze_failure_rate'), 'vacuum_max_eager_freeze_failure_rate=n/a')"; nproc; free -m | sed -n 2p; } > "$OUT/env/versions.txt"

log "building big source: accounts=$NACC customers=$NCUS"
create_db "forge_fz_src"  # changed for publication
timed build_source forge_fz_src "create extension pg_visibility;  -- changed for publication
create table accounts (id bigint not null, payload text not null);
select setseed(0.314159);
insert into accounts select g, rpad(md5(g::text), 100, 'x') from generate_series(1, $NACC) g order by random();
create index accounts_id_idx on accounts (id);
create table customers (id bigint primary key, name text not null);
create table orders (id bigint primary key, customer_id bigint not null, status text not null);
select setseed(0.271828);
insert into customers select g, 'customer ' || g from generate_series(1, $NCUS) g;
insert into orders select row_number() over (), c, case when random() < 0.99 then 'completed' else 'pending' end from (select g as c from generate_series(1, $NCUS) g order by random() limit $((NCUS/2))) s;
create index orders_customer_id_idx on orders (customer_id);"
[ "$(tail -1 "$OUT/steps.csv" | cut -d, -f4)" = 0 ] || { log "source build failed"; cat "$OUT/steps/build_source.out"; exit 1; }
timed source_analyze forge_fz_src "analyze"  # changed for publication
timed source_vacuum forge_fz_src "vacuum"  # changed for publication
state forge_fz_src "$OUT/source_state.txt"  # changed for publication
timedsh dump_default pg_dump -Fc -d forge_fz_src -f "$OUT/dumps/default.dump"  # changed for publication
drop_db "forge_fz_src"   # only one experiment database at a time  # changed for publication

burn_xids(){ # consume ~N XIDs: N single-statement transactions that each acquire an XID (8 clients)
  local db=$1 n=$2
  echo "select pg_current_xact_id();" > "$OUT/env/burn.sql"
  pgbench -n -c 8 -t $((n / 8)) -f "$OUT/env/burn.sql" "$db"
}
wait_autovacuum(){ # db -> wait until the autovacuum log has a completed entry for db.public.accounts; print seconds waited
  local db=$1 t0; t0=$(date +%s)  # changed for publication
  while (( $(date +%s) - t0 < 1200 )); do  # changed for publication
    if grep -qE "automatic (aggressive )?vacuum( to prevent wraparound)? of table \"$db\.public\.accounts\"" "$LOGFILE"; then echo $(( $(date +%s) - t0 )); return 0; fi
    sleep 5
  done
  echo timeout; return 1
}
declare -A SQL=( [vacuum]="vacuum" [vacuum_freeze]="vacuum (freeze)" [analyze]="analyze" )
for rep in $(seq 1 "$REPS"); do
  for arm in vacuum vacuum_freeze analyze; do
    db="forge_fz_${arm}_r${rep}_t$TAG"  # changed for publication
    q postgres "alter system set autovacuum = off" >/dev/null; q postgres "select pg_reload_conf()" >/dev/null; sleep 1
    create_db "$db"  # changed for publication
    timedsh "restore_$db" pg_restore -d "$db" -j 4 --exit-on-error "$OUT/dumps/default.dump"
    # autovacuum_freeze_max_age needs a restart at cluster level, so the scaled autovacuum
    # thresholds go on the table (reloptions; a catalog update only)
    q "$db" "alter table accounts set (autovacuum_freeze_max_age = 200000, autovacuum_freeze_table_age = 150000, autovacuum_freeze_min_age = 50000)" >/dev/null
    q "$db" "checkpoint" >/dev/null; state "$db" "$OUT/steps/${db}_after_restore_state.txt"
    timed "maint_$db" "$db" "${SQL[$arm]}"
    state "$db" "$OUT/steps/${db}_after_maint_state.txt"
    if [ "$arm" = analyze ]; then
      IFS=, read -r _ _ _ _ l0 l1 <<< "$(tail -1 "$OUT/steps.csv")"
      pg_waldump --stats=record -s "$l0" -e "$l1" -p "$PGDATA/pg_wal" > "$OUT/steps/${db}_analyze_waldump.txt" 2>&1 || true
    fi
    # the later: age the table past the scaled thresholds, then let autovacuum find it
    q "$db" "checkpoint" >/dev/null
    t0=$(date +%s.%N); burn_xids "$db" 220000 > "$OUT/steps/${db}_burn.out" 2>&1; t1=$(date +%s.%N)
    echo "burn_$db,$(echo "$t1 - $t0" | bc),0,0,," >> "$OUT/steps.csv"
    state "$db" "$OUT/steps/${db}_before_autovacuum_state.txt"
    l0=$(q "$db" "select pg_current_wal_lsn()")
    q postgres "alter system set autovacuum = on" >/dev/null; q postgres "select pg_reload_conf()" >/dev/null
    waited=$(wait_autovacuum "$db")
    l1=$(q "$db" "select pg_current_wal_lsn()")
    echo "autovacuum_wait_$db,$waited,$(q "$db" "select pg_wal_lsn_diff('$l1','$l0')"),0,$l0,$l1" | tee -a "$OUT/steps.csv"
    # full log entries for this database (multi-line: the vacuum report through "system usage")
    # autovacuum workers log with an empty db= prefix, so match on the qualified table name
    awk -v db="$db" '$0 ~ "automatic (aggressive )?(vacuum|analyze)( to prevent wraparound)? of table \"" db "\\." {p=1} p {print} p && /system usage/ {p=0; print "--"}' "$LOGFILE" > "$OUT/autovacuum/${db}.log"
    sleep 15; state "$db" "$OUT/steps/${db}_after_autovacuum_state.txt"
    log "done $db (autovacuum after $waited s)"
    # Added after the 2026-10-20 run, which kept every arm's database: drop it so the next
    # arm's autovacuum wait is not shared with aged earlier databases.
    q postgres "alter system set autovacuum = off" >/dev/null; q postgres "select pg_reload_conf()" >/dev/null; sleep 1
    drop_db "$db"  # changed for publication
  done
done
# Previous settings are returned by the EXIT trap.  # changed for publication
# Previous settings are returned by the EXIT trap.  # changed for publication
# Previous settings are returned by the EXIT trap.  # changed for publication
# Previous settings are returned by the EXIT trap.  # changed for publication
q postgres "select pg_reload_conf()" >/dev/null
grep -E 'checkpoint (starting|complete)' "$LOGFILE" > "$OUT/env/checkpoints.txt" 2>/dev/null || true
log "freeze track 2 complete"
```

#### `big_fixture_cost.sh`: time and WAL of each maintenance option on the 1,820 MiB fixture, then stock autovacuum (the 286 s wait and 382 s finish for the main table)

```bash
#!/usr/bin/env bash
# Operational cost of readiness options on a larger fixture (timings are
# context on a dedicated host, not benchmark claims). Single cluster, run
# while the host is otherwise idle.
#   big_fixture_cost.sh <bindir> <port> <outdir> <rows_accounts> <rows_customers>
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
BIN=$1; PORT=$2; OUT=$3; NACC=${4:-10000000}; NCUS=${5:-2000000}
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
mkdir -p "$OUT"/{env,dumps,steps}
log(){ echo "[$(date -u +%FT%T.%3NZ)] $*" | tee -a "$OUT/harness.log"; }
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt); q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
}  # changed for publication
# Preserve effective values AND the previous auto.conf entry (or its absence).  # changed for publication
declare -A previous_value=() previous_sql=()  # changed for publication
save_settings(){  # changed for publication
  local name  # changed for publication
  for name in "$@"; do  # changed for publication
    previous_value[$name]=$(q postgres "select current_setting('$name')")  # changed for publication
    previous_sql[$name]=$(q postgres "select coalesce((select format('alter system set %I = %L', name, setting) from pg_file_settings where sourcefile = current_setting('data_directory') || '/postgresql.auto.conf' and name = '$name' order by seqno desc limit 1), format('alter system reset %I', '$name'))")  # changed for publication
  done  # changed for publication
}  # changed for publication
cleanup_settings(){  # changed for publication
  local rc=$? name attempt actual failed=0  # changed for publication
  trap - EXIT  # changed for publication
  for name in "${!previous_sql[@]}"; do  # changed for publication
    q postgres "${previous_sql[$name]}" >/dev/null || failed=1  # changed for publication
  done  # changed for publication
  q postgres "select pg_reload_conf()" >/dev/null || failed=1  # changed for publication
  for name in "${!previous_value[@]}"; do  # changed for publication
    for attempt in {1..50}; do  # changed for publication
      actual=$(q postgres "select current_setting('$name')") || failed=1  # changed for publication
      [[ $actual == "${previous_value[$name]}" ]] && break  # changed for publication
      sleep 0.1  # changed for publication
    done  # changed for publication
    [[ $actual == "${previous_value[$name]}" ]] || { echo "Setting not recovered: $name after $attempt checks" >&2; failed=1; }  # changed for publication
  done  # changed for publication
  (( failed == 0 )) || rc=1  # changed for publication
  exit "$rc"  # changed for publication
}  # changed for publication
trap cleanup_settings EXIT  # changed for publication
trap 'exit 130' INT  # changed for publication
trap 'exit 143' TERM  # changed for publication
save_settings autovacuum  # changed for publication
MAJOR=$(pg_dump --version | awk '{print int($3)}'); STATS=--statistics  # added for publication
[ "$MAJOR" -ge 18 ] || { STATS=; log "pg_dump $MAJOR has no --statistics option: the stats archive is a plain dump on this version"; }  # added for publication
{ echo "server: $(postgres --version)"; q postgres "select 'shared_buffers=' || current_setting('shared_buffers') || ' maintenance_work_mem=' || current_setting('maintenance_work_mem') || ' checksums=' || current_setting('data_checksums') || ' av_cost_delay=' || current_setting('autovacuum_vacuum_cost_delay') || ' av_cost_limit=' || current_setting('autovacuum_vacuum_cost_limit') || ' vacuum_cost_limit=' || current_setting('vacuum_cost_limit') || ' naptime=' || current_setting('autovacuum_naptime') || ' insert_thr=' || current_setting('autovacuum_vacuum_insert_threshold') || ' insert_sf=' || current_setting('autovacuum_vacuum_insert_scale_factor') || ' analyze_sf=' || current_setting('autovacuum_analyze_scale_factor')"; nproc; free -m | sed -n 2p; df -h /var/lib/postgresql | tail -1; } > "$OUT/env/versions.txt"
timed(){ # name db sql  -> seconds and WAL bytes
  local name=$1 db=$2 sql=$3 l0 l1 t0 t1
  l0=$(q "$db" "select pg_current_wal_lsn()"); t0=$(date +%s.%N)
  "${PSQL[@]}" -d "$db" -c "$sql" > "$OUT/steps/$name.out" 2>&1; rc=$?  # changed for publication
  t1=$(date +%s.%N); l1=$(q "$db" "select pg_current_wal_lsn()")
  echo "$name,$(echo "$t1 - $t0" | bc),$(q "$db" "select pg_wal_lsn_diff('$l1','$l0')"),$rc" | tee -a "$OUT/steps.csv"
}
timedsh(){ # name cmd...  (shell command; WAL measured on db postgres)
  local name=$1; shift; local l0 l1 t0 t1
  l0=$(q postgres "select pg_current_wal_lsn()"); t0=$(date +%s.%N)
  "$@" > "$OUT/steps/$name.out" 2>&1; rc=$?
  t1=$(date +%s.%N); l1=$(q postgres "select pg_current_wal_lsn()")
  echo "$name,$(echo "$t1 - $t0" | bc),$(q postgres "select pg_wal_lsn_diff('$l1','$l0')"),$rc" | tee -a "$OUT/steps.csv"
}
echo "step,seconds,wal_bytes,rc" > "$OUT/steps.csv"
VNUM=$(q postgres "show server_version_num"); RAF=relallfrozen; [ "$VNUM" -ge 180000 ] || RAF="null as relallfrozen"  # added for publication: relallfrozen exists only on 18 and later
STATE="select 'pg_class', relname, relpages, reltuples, relallvisible, $RAF from pg_class where relname in ('accounts','customers','orders') order by relname;  -- changed for publication: $RAF
select 'vm', relname, pg_relation_size(c.oid)/current_setting('block_size')::int, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname in ('accounts','customers','orders') order by relname;
select 'pg_stats_rows', tablename, count(*) from pg_stats where schemaname='public' group by tablename order by tablename;
select 'maint', relname, vacuum_count, autovacuum_count, analyze_count, autoanalyze_count, last_autovacuum, last_autoanalyze from pg_stat_user_tables order by relname;
select 'size', pg_size_pretty(pg_database_size(current_database()));"
state(){ "${PSQL[@]}" -d "$1" -c "$STATE" > "$2" 2>&1; }  # changed for publication
EXPLAIN="explain (analyze, buffers, settings, verbose, format json)"
Q1="select id from accounts where id between 5000001 and 5010000"
Q2="select c.id, c.name, o.id from orders o join customers c on c.id = o.customer_id where o.status = 'pending'"
plans(){ # db tag
  "${PSQL[@]}" -d "$1" -c "set statement_timeout='600s'; $EXPLAIN $Q1" > "$OUT/steps/$2_q1.json" 2>&1  # changed for publication
  "${PSQL[@]}" -d "$1" -c "set statement_timeout='600s'; $EXPLAIN $Q2" > "$OUT/steps/$2_q2.json" 2>&1  # changed for publication
}
log "building big source: accounts=$NACC customers=$NCUS"
create_db "forge_big_src"  # changed for publication
# tables WITHOUT thresholds (stock autovacuum arm uses them); source gets manual analyze+vacuum
timed build_source forge_big_src "create extension pg_visibility;  -- changed for publication
create table accounts (id bigint not null, payload text not null);
select setseed(0.314159);
insert into accounts select g, rpad(md5(g::text), 100, 'x') from generate_series(1, $NACC) g order by random();
create index accounts_id_idx on accounts (id);
create table customers (id bigint primary key, name text not null);
create table orders (id bigint primary key, customer_id bigint not null, status text not null);
select setseed(0.271828);
insert into customers select g, 'customer ' || g from generate_series(1, $NCUS) g;
insert into orders select row_number() over (), c, case when random() < 0.99 then 'completed' else 'pending' end from (select g as c from generate_series(1, $NCUS) g order by random() limit $((NCUS/2))) s;
create index orders_customer_id_idx on orders (customer_id);"
[ "$(tail -1 "$OUT/steps.csv" | cut -d, -f4)" = 0 ] || { log "source build failed"; cat "$OUT/steps/build_source.out"; exit 1; }
timed source_analyze forge_big_src "analyze"  # changed for publication
timed source_vacuum forge_big_src "vacuum"  # changed for publication
state forge_big_src "$OUT/source_state.txt"  # changed for publication
timedsh dump_default pg_dump -Fc -d forge_big_src -f "$OUT/dumps/default.dump"  # changed for publication
timedsh dump_stats pg_dump -Fc $STATS -d forge_big_src -f "$OUT/dumps/stats.dump"  # changed for publication
ls -l "$OUT/dumps" > "$OUT/dumps/ls.txt"
# --- restores with explicit maintenance (thresholds absent, so disable autovacuum on the cluster for these timed steps to keep them clean)
q postgres "alter system set autovacuum = off" >/dev/null; q postgres "select pg_reload_conf()" >/dev/null; sleep 1
mk(){ create_db "$1"; }  # changed for publication
mk forge_big_j1; timedsh restore_j1 pg_restore -d forge_big_j1 --exit-on-error "$OUT/dumps/default.dump"; state forge_big_j1 "$OUT/steps/restore_j1_state.txt"  # changed for publication
mk forge_big_j4; timedsh restore_j4 pg_restore -d forge_big_j4 -j 4 --exit-on-error "$OUT/dumps/default.dump"; state forge_big_j4 "$OUT/steps/restore_j4_state.txt"  # changed for publication
mk forge_big_stats; timedsh restore_stats_j4 pg_restore -d forge_big_stats -j 4 --exit-on-error "$OUT/dumps/stats.dump"; state forge_big_stats "$OUT/steps/restore_stats_j4_state.txt"  # changed for publication
plans forge_big_j1 after_restore_nomaint  # changed for publication
# each maintenance option on its own fresh restore (forge_big_j4 reused as template via fresh restores to keep arms independent)  # changed for publication
for opt in analyze vacuum vacuum_analyze vacuum_freeze; do
  mk forge_big_$opt; pg_restore -d forge_big_$opt -j 4 --exit-on-error "$OUT/dumps/default.dump" >/dev/null 2>&1  # changed for publication
  q forge_big_$opt "checkpoint" >/dev/null  # changed for publication
  case $opt in analyze) sql="analyze";; vacuum) sql="vacuum";; vacuum_analyze) sql="vacuum analyze";; vacuum_freeze) sql="vacuum (freeze)";; esac
  timed maint_$opt forge_big_$opt "$sql"; state forge_big_$opt "$OUT/steps/maint_${opt}_state.txt"; plans forge_big_$opt after_$opt  # changed for publication
done
# vacuumdb variants
mk forge_big_vdb; pg_restore -d forge_big_vdb -j 4 --exit-on-error "$OUT/dumps/default.dump" >/dev/null 2>&1; q forge_big_vdb checkpoint >/dev/null  # changed for publication
timedsh vacuumdb_j4_analyze vacuumdb -d forge_big_vdb -j 4 --analyze; state forge_big_vdb "$OUT/steps/vacuumdb_j4_state.txt"  # changed for publication
mk forge_big_stages; pg_restore -d forge_big_stages -j 4 --exit-on-error "$OUT/dumps/default.dump" >/dev/null 2>&1; q forge_big_stages checkpoint >/dev/null  # changed for publication
# analyze-in-stages, each stage timed separately with plans after each
for st in 1 10 100; do
  timed analyze_stage_target_$st forge_big_stages "set default_statistics_target = $st; analyze"  # changed for publication
  q forge_big_stages "select tablename, attname, array_length(most_common_vals::text::text[],1) as n_mcv, array_length(histogram_bounds::text::text[],1) as n_hist from pg_stats where schemaname='public' and tablename in ('orders','accounts') order by 1,2" > "$OUT/steps/analyze_stage_target_${st}_pgstats.txt"  # changed for publication
  plans forge_big_stages after_stage_$st  # changed for publication
done
mk forge_big_stages2; pg_restore -d forge_big_stages2 -j 4 --exit-on-error "$OUT/dumps/default.dump" >/dev/null 2>&1; q forge_big_stages2 checkpoint >/dev/null  # changed for publication
timedsh vacuumdb_analyze_in_stages vacuumdb -d forge_big_stages2 --analyze-in-stages  # changed for publication
mk forge_big_stages3; pg_restore -d forge_big_stages3 -j 4 --exit-on-error "$OUT/dumps/default.dump" >/dev/null 2>&1; q forge_big_stages3 checkpoint >/dev/null  # changed for publication
timedsh vacuumdb_j4_analyze_only vacuumdb -d forge_big_stages3 -j 4 --analyze-only  # changed for publication
# --- stock autovacuum: re-enable, restore fresh, poll until all three tables vacuumed+analyzed; log durations from server log
q postgres "alter system set autovacuum = on" >/dev/null; q postgres "select pg_reload_conf()" >/dev/null; sleep 1  # changed for publication
mk forge_big_stock; timedsh restore_for_stock_av pg_restore -d forge_big_stock -j 4 --exit-on-error "$OUT/dumps/default.dump"  # changed for publication
stock_start=$(date +%s.%N)  # changed for publication
q forge_big_stock "select now()" > "$OUT/steps/stock_restore_done_at.txt"  # changed for publication
plans forge_big_stock stock_immediate  # changed for publication
: > "$OUT/steps/stock_poll.log"
while :; do  # changed for publication
  echo "$(date -u +%FT%T.%3NZ) $(q forge_big_stock "select string_agg(relname || ':av=' || coalesce(to_char(last_autovacuum,'HH24:MI:SS'),'-') || '/aa=' || coalesce(to_char(last_autoanalyze,'HH24:MI:SS'),'-'), ' ' order by relname) from pg_stat_user_tables")" >> "$OUT/steps/stock_poll.log"  # changed for publication
  [ "$(q forge_big_stock "select count(*) from pg_stat_user_tables where last_autovacuum is not null and last_autoanalyze is not null")" = "3" ] && break  # changed for publication
  (( $(date +%s) - ${stock_start%.*} < 3600 )) || break  # changed for publication
  sleep 2
done
echo "stock_autovacuum_all_tables_done,$(echo "$(date +%s.%N) - $stock_start" | bc),," >> "$OUT/steps.csv"  # changed for publication
state forge_big_stock "$OUT/steps/stock_state.txt"; plans forge_big_stock stock_after  # changed for publication
LOGFILE=$(q postgres "select coalesce(pg_current_logfile(), '')")  # changed for publication
if [[ -n $LOGFILE && $LOGFILE != /* ]]; then LOGFILE="$(q postgres 'show data_directory')/$LOGFILE"; fi  # changed for publication
if [[ -z $LOGFILE ]]; then LOGFILE="/var/log/postgresql/postgresql-$(q postgres "show server_version_num" | cut -c1-2)-forge_blog.log"; fi  # changed for publication
grep -E 'automatic (vacuum|analyze) of table "forge_big_stock' "$LOGFILE" > "$OUT/steps/stock_autovacuum_log.txt" 2>/dev/null || true  # changed for publication
log "big fixture complete"
```

<code>vacuumdb_partition_check.sh</code> at the end restores the default archive this script writes.

#### `partition_track.sh`: partitioned parent statistics under stock autovacuum (8 partitions in 15 s, no parent statistics after 480 s, partitioned parent 403,072 buffers before ANALYZE and 4,400 after)

```bash
#!/usr/bin/env bash
# Partitioned tables after restore: do stock autovacuum/autoanalyze ever give the
# partitioned parent statistics, and what does the planner do meanwhile.
# Also: does `pg_dump --statistics` carry parent statistics. Optionally: does
# this server's pg_dump --statistics work against an older (17) source cluster.
# Run as the postgres OS user, stock autovacuum settings on the cluster.
#   partition_track.sh <bindir> <port> <outdir> <logfile> [old_port]
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
BIN=$1; PORT=$2; OUT=$3; LOGFILE=$4; OLDPORT=${5:-}
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
mkdir -p "$OUT"/{env,dumps,steps}
log(){ echo "[$(date -u +%FT%T.%3NZ)] $*" | tee -a "$OUT/harness.log"; }
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt); q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
}  # changed for publication
MAJOR=$(pg_dump --version | awk '{print int($3)}'); STATS=--statistics  # added for publication
[ "$MAJOR" -ge 18 ] || { STATS=; log "pg_dump $MAJOR has no --statistics option: the stats archive is a plain dump on this version"; }  # added for publication
{ echo "server: $(postgres --version)"; echo "pg_dump: $(pg_dump --version)"; q postgres "select 'autovacuum=' || current_setting('autovacuum') || ' naptime=' || current_setting('autovacuum_naptime') || ' analyze_thr=' || current_setting('autovacuum_analyze_threshold') || ' analyze_sf=' || current_setting('autovacuum_analyze_scale_factor') || ' insert_thr=' || current_setting('autovacuum_vacuum_insert_threshold') || ' insert_sf=' || current_setting('autovacuum_vacuum_insert_scale_factor')"; } > "$OUT/env/versions.txt"
FIXTURE="create extension if not exists pg_visibility;
create table customers (id bigint primary key, name text not null);
insert into customers select g, 'customer ' || g from generate_series(1, 200000) g;
create table orders_p (id bigint not null, customer_id bigint not null, status text not null) partition by hash (customer_id);
create table orders_p_0 partition of orders_p for values with (modulus 8, remainder 0);
create table orders_p_1 partition of orders_p for values with (modulus 8, remainder 1);
create table orders_p_2 partition of orders_p for values with (modulus 8, remainder 2);
create table orders_p_3 partition of orders_p for values with (modulus 8, remainder 3);
create table orders_p_4 partition of orders_p for values with (modulus 8, remainder 4);
create table orders_p_5 partition of orders_p for values with (modulus 8, remainder 5);
create table orders_p_6 partition of orders_p for values with (modulus 8, remainder 6);
create table orders_p_7 partition of orders_p for values with (modulus 8, remainder 7);
select setseed(0.271828);
-- 400,000 orders over 100,000 distinct customers (4 each on average), 99:1 status skew
insert into orders_p select g, 1 + (g % 100000), case when random() < 0.99 then 'completed' else 'pending' end from generate_series(1, 400000) g;
create index orders_p_customer_id_idx on orders_p (customer_id);"
STATE="select 'pg_class', relname, relkind, relpages, reltuples, relallvisible from pg_class where relname like 'orders_p%' or relname = 'customers' order by relname;
select 'pg_stats_rows', tablename, inherited, count(*) from pg_stats where schemaname='public' group by 1,2,3 order by tablename, inherited;
select 'parent_ndistinct', attname, n_distinct, inherited from pg_stats where tablename='orders_p' order by attname;
select 'maint', relname, n_tup_ins, n_mod_since_analyze, n_ins_since_vacuum, vacuum_count, autovacuum_count, analyze_count, autoanalyze_count, last_autovacuum, last_autoanalyze, last_analyze from pg_stat_user_tables where relname like 'orders_p%' or relname = 'customers' order by relname;"
state(){ "${PSQL[@]}" -d "$1" -c "$STATE" > "$2" 2>&1; }  # changed for publication
EXPLAIN="explain (analyze, buffers, settings, verbose, format json)"
# needs the parent's n_distinct(customer_id) for the GROUP BY estimate and the join that follows
QP="select c.name, s.n from (select customer_id, count(*) as n from orders_p group by customer_id) s join customers c on c.id = s.customer_id"
QJ="select c.id, c.name, o.id from orders_p o join customers c on c.id = o.customer_id where o.status = 'pending'"
plans(){ # db tag
  "${PSQL[@]}" -d "$1" -c "set statement_timeout='120s'; $EXPLAIN $QP" > "$OUT/steps/$2_qp.json" 2>&1  # changed for publication
  "${PSQL[@]}" -d "$1" -c "set statement_timeout='120s'; $EXPLAIN $QJ" > "$OUT/steps/$2_qj.json" 2>&1  # changed for publication
}
mk(){ create_db "$1"; }  # changed for publication
log "building source"
mk forge_pt_src; "${PSQL[@]}" -d forge_pt_src -c "$FIXTURE" > "$OUT/steps/source_build.out" 2>&1 || { log "source build failed"; cat "$OUT/steps/source_build.out"; exit 1; }  # changed for publication
q forge_pt_src "analyze" >/dev/null; q forge_pt_src "vacuum" >/dev/null  # changed for publication
state forge_pt_src "$OUT/source_state.txt"; plans forge_pt_src source  # changed for publication
pg_dump -Fc -d forge_pt_src -f "$OUT/dumps/default.dump" 2> "$OUT/dumps/default.err"  # changed for publication
pg_dump -Fc $STATS -d forge_pt_src -f "$OUT/dumps/stats.dump" 2> "$OUT/dumps/stats.err"  # changed for publication
pg_restore -l "$OUT/dumps/stats.dump" > "$OUT/dumps/stats.toc"
grep -n 'STATISTICS DATA\|TABLE DATA\|INDEX ' "$OUT/dumps/stats.toc" > "$OUT/dumps/stats.toc.order.txt"
# --- default archive, stock autovacuum, poll up to 8 minutes
mk forge_pt_def; pg_restore -d forge_pt_def --exit-on-error "$OUT/dumps/default.dump" > "$OUT/steps/restore_def.out" 2>&1; echo $? > "$OUT/steps/restore_def.rc"  # changed for publication
T0=$(date +%s); echo "$(date -u +%FT%T.%3NZ)" > "$OUT/steps/restore_def_done_at.txt"
state forge_pt_def "$OUT/steps/def_immediate_state.txt"; plans forge_pt_def def_immediate  # changed for publication
: > "$OUT/steps/def_poll.log"; children_done=""; parent_done=""
while :; do  # changed for publication
  now=$(date -u +%FT%T.%3NZ)
  nchild=$(q forge_pt_def "select count(*) from pg_stat_user_tables where relname like 'orders_p_%' and last_autoanalyze is not null")  # changed for publication
  par=$(q forge_pt_def "select coalesce(last_autoanalyze::text, '-') from pg_stat_user_tables where relname = 'orders_p'")  # changed for publication
  echo "$now children_autoanalyzed=$nchild parent_autoanalyze=$par" >> "$OUT/steps/def_poll.log"
  if [ -z "$children_done" ] && [ "$nchild" = 8 ]; then children_done=$(( $(date +%s) - T0 )); state forge_pt_def "$OUT/steps/def_children_done_state.txt"; plans forge_pt_def def_children_done; fi  # changed for publication
  if [ "$par" != "-" ]; then parent_done=$(( $(date +%s) - T0 )); break; fi
  (( $(date +%s) - T0 < 480 )) || break  # changed for publication
  sleep 2
done
echo "children_autoanalyzed_after_s,${children_done:-never}" | tee -a "$OUT/steps/def_timeline.csv"
echo "parent_autoanalyzed_after_s,${parent_done:-never within $(( $(date +%s) - T0 )) s}" | tee -a "$OUT/steps/def_timeline.csv"  # changed for publication
state forge_pt_def "$OUT/steps/def_final_state.txt"; plans forge_pt_def def_final  # changed for publication
q forge_pt_def "analyze orders_p" > "$OUT/steps/def_manual_analyze_parent.out" 2>&1  # changed for publication
state forge_pt_def "$OUT/steps/def_after_manual_parent_analyze_state.txt"; plans forge_pt_def def_after_manual_parent_analyze  # changed for publication
# --- --statistics archive
mk forge_pt_stats; pg_restore -d forge_pt_stats --exit-on-error "$OUT/dumps/stats.dump" > "$OUT/steps/restore_stats.out" 2>&1; echo $? > "$OUT/steps/restore_stats.rc"  # changed for publication
state forge_pt_stats "$OUT/steps/stats_immediate_state.txt"; plans forge_pt_stats stats_immediate  # changed for publication
# --- cross-version: this pg_dump with --statistics against an older cluster
if [ -n "$OLDPORT" ]; then
  log "cross-version source on port $OLDPORT"
  "${PSQL[@]}" -p "$OLDPORT" -d postgres -c "create database forge_pt_src_old" >/dev/null  # changed for publication
  "${PSQL[@]}" -p "$OLDPORT" -d forge_pt_src_old -c "$FIXTURE" > "$OUT/steps/old_source_build.out" 2>&1  # changed for publication
  "${PSQL[@]}" -p "$OLDPORT" -d forge_pt_src_old -c "analyze" >/dev/null; "${PSQL[@]}" -p "$OLDPORT" -d forge_pt_src_old -c "vacuum" >/dev/null  # changed for publication
  "${PSQL[@]}" -p "$OLDPORT" -d forge_pt_src_old -c "select version()" > "$OUT/steps/old_source_version.txt"  # changed for publication
  pg_dump -p "$OLDPORT" -Fc $STATS -d forge_pt_src_old -f "$OUT/dumps/xver_stats.dump" 2> "$OUT/dumps/xver_stats.err"; echo $? > "$OUT/dumps/xver_stats.rc"  # changed for publication
  pg_restore -l "$OUT/dumps/xver_stats.dump" | grep -c 'STATISTICS DATA' > "$OUT/dumps/xver_stats_entries.txt"
  mk forge_pt_xver; pg_restore -d forge_pt_xver --exit-on-error "$OUT/dumps/xver_stats.dump" > "$OUT/steps/restore_xver.out" 2>&1; echo $? > "$OUT/steps/restore_xver.rc"  # changed for publication
  state forge_pt_xver "$OUT/steps/xver_immediate_state.txt"; plans forge_pt_xver xver_immediate  # changed for publication
fi
grep -E 'automatic (vacuum|analyze) of table "forge_pt_def' "$LOGFILE" > "$OUT/steps/autovacuum_log.txt" 2>/dev/null || true  # changed for publication
log "partition track complete"
```

#### `copy_freeze.sh`: COPY against COPY FREEZE into a new table, plus the eligibility checks (the COPY FREEZE notes; supporting script, no number in the post)

```bash
#!/usr/bin/env bash
# COPY FREEZE micro-lab (custom bulk load, NOT a dump/restore result).
#   copy_freeze.sh <label> <bindir> <port> <outdir> [reps]
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
export LABEL=$1; BIN=$2; PORT=$3; OUT=$4; REPS=${5:-3}  # changed for publication
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
mkdir -p "$OUT"/{env,arms}
log(){ echo "[$(date -u +%FT%TZ)] $*" | tee -a "$OUT/harness.log"; }
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt)  # changed for publication
q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
}  # changed for publication
{ echo "server: $(postgres --version)"; echo "server_version_num: $(q postgres 'show server_version_num')"; q postgres "select 'wal_level=' || current_setting('wal_level') || ' max_wal_senders=' || current_setting('max_wal_senders')"; } > "$OUT/env/versions.txt"
DATA=/var/lib/postgresql/accounts_random.csv
create_db "forge_cf"  # changed for publication
q forge_cf "create extension pg_visibility" >/dev/null  # changed for publication
# identical data file for both arms: 200k rows, seeded random order
"${PSQL[@]}" -d forge_cf -c "select setseed(0.314159); copy (select g as id, rpad(md5(g::text), 100, 'x') as payload from generate_series(1,200000) g order by random()) to '$DATA' csv" >/dev/null  # changed for publication
ls -l "$DATA" > "$OUT/env/datafile.txt"; md5sum "$DATA" >> "$OUT/env/datafile.txt"
THR="with (autovacuum_vacuum_threshold = 2000000000, autovacuum_analyze_threshold = 2000000000, autovacuum_vacuum_insert_threshold = 2000000000)"
VNUM=$(q postgres "show server_version_num"); RAF=relallfrozen; [ "$VNUM" -ge 180000 ] || RAF="null as relallfrozen"  # changed for publication
STATE="select 'pg_class', relname, relpages, reltuples, relallvisible, $RAF from pg_class where relname like 't_%' order by relname;  -- changed for publication
select 'vm', relname, pg_relation_size(c.oid)/current_setting('block_size')::int, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname like 't_%' and relkind='r' order by relname;
select 'maint', relname, autovacuum_count, autoanalyze_count from pg_stat_user_tables where relname like 't_%' order by relname;"
EXPLAIN="explain (analyze, buffers, settings, verbose, format json)"
for rep in $(seq 1 $REPS); do
  for arm in copy freeze; do
    A="$OUT/arms/r${rep}_$arm"; mkdir -p "$A"; t="t_${arm}_r$rep"
    opts="with (format csv)"; [ $arm = freeze ] && opts="with (format csv, freeze)"
    log "arm r${rep}_$arm: create+load in one transaction"
    "${PSQL[@]}" -d forge_cf <<SQL > "$A/load.log" 2>&1  # changed for publication
begin;
create table $t (id bigint not null, payload text not null) $THR;
copy $t from '$DATA' $opts;
commit;
SQL
    echo $? > "$A/load.rc"
    "${PSQL[@]}" -d forge_cf -c "$(echo "$STATE" | sed "s/t_%/$t/g")" > "$A/state_after_load.txt" 2>&1  # changed for publication
    q forge_cf "create index ${t}_id_idx on $t (id)" > "$A/index.log" 2>&1  # changed for publication
    "${PSQL[@]}" -d forge_cf -c "$(echo "$STATE" | sed "s/t_%/$t/g")" > "$A/state_after_index.txt" 2>&1  # changed for publication
    q forge_cf "analyze $t" > "$A/analyze.log" 2>&1  # changed for publication
    "${PSQL[@]}" -d forge_cf -c "$(echo "$STATE" | sed "s/t_%/$t/g")" > "$A/state_after_analyze.txt" 2>&1  # changed for publication
    for p in 1 2 3; do
      "${PSQL[@]}" -d forge_cf -c "set statement_timeout='60s'; $EXPLAIN select id from $t where id between 100001 and 110000" > "$A/q1_natural_p$p.json" 2>&1  # changed for publication
    done
    for p in 1 2; do
      "${PSQL[@]}" -d forge_cf -c "set statement_timeout='60s'; set enable_seqscan=off; set enable_bitmapscan=off; $EXPLAIN select id from $t where id between 100001 and 110000" > "$A/q1_forced_ios_p$p.json" 2>&1  # changed for publication
    done
    "${PSQL[@]}" -d forge_cf -c "$(echo "$STATE" | sed "s/t_%/$t/g")" > "$A/state_final.txt" 2>&1  # changed for publication
  done
done
# negative eligibility check: table created in an earlier transaction
N="$OUT/arms/negative"; mkdir -p "$N"
q forge_cf "create table t_neg (id bigint not null, payload text not null) $THR" >/dev/null  # changed for publication
negative_rc=0  # changed for publication
"${PSQL[@]}" -d forge_cf <<SQL > "$N/copy_freeze_on_preexisting_table.log" 2>&1 || negative_rc=$?  # changed for publication
begin;
copy t_neg from '$DATA' with (format csv, freeze);
commit;
SQL
echo "$negative_rc" > "$N/rc"  # changed for publication
[[ $negative_rc -ne 0 ]] || { echo "Expected COPY FREEZE rejection" >&2; exit 1; }  # changed for publication
# positive variant: TRUNCATE in the same transaction makes it eligible
"${PSQL[@]}" -d forge_cf <<SQL > "$N/copy_freeze_after_same_txn_truncate.log" 2>&1  # changed for publication
begin;
truncate t_neg;
copy t_neg from '$DATA' with (format csv, freeze);
commit;
SQL
echo $? > "$N/rc_truncate_variant"
"${PSQL[@]}" -d forge_cf -c "$(echo "$STATE" | sed "s/t_%/t_neg/g")" > "$N/state_after_truncate_variant.txt" 2>&1  # changed for publication
log "copy freeze lab complete"
```

#### `diag_av_off.sh`: the small-test archives restored with autovacuum off (figure 2, imported relallvisible 3,449 over an empty visibility map)

```bash
#!/usr/bin/env bash
# Bounded diagnostic: same archives, cluster-level autovacuum=off through pg_restore and the diagnostic reads.  # changed for publication
# Shows whether CREATE INDEX during restore overwrites imported relation stats.
#   diag_av_off.sh <bindir> <port> <rundir>   (autovacuum is PGC_SIGHUP: reload suffices)
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
BIN=$1; PORT=$2; OUT=$3
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt)  # changed for publication
q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
}  # changed for publication
# Preserve effective values AND the previous auto.conf entry (or its absence).  # changed for publication
declare -A previous_value=() previous_sql=()  # changed for publication
save_settings(){  # changed for publication
  local name  # changed for publication
  for name in "$@"; do  # changed for publication
    previous_value[$name]=$(q postgres "select current_setting('$name')")  # changed for publication
    previous_sql[$name]=$(q postgres "select coalesce((select format('alter system set %I = %L', name, setting) from pg_file_settings where sourcefile = current_setting('data_directory') || '/postgresql.auto.conf' and name = '$name' order by seqno desc limit 1), format('alter system reset %I', '$name'))")  # changed for publication
  done  # changed for publication
}  # changed for publication
cleanup_settings(){  # changed for publication
  local rc=$? name attempt actual failed=0  # changed for publication
  trap - EXIT  # changed for publication
  for name in "${!previous_sql[@]}"; do  # changed for publication
    q postgres "${previous_sql[$name]}" >/dev/null || failed=1  # changed for publication
  done  # changed for publication
  q postgres "select pg_reload_conf()" >/dev/null || failed=1  # changed for publication
  for name in "${!previous_value[@]}"; do  # changed for publication
    for attempt in {1..50}; do  # changed for publication
      actual=$(q postgres "select current_setting('$name')") || failed=1  # changed for publication
      [[ $actual == "${previous_value[$name]}" ]] && break  # changed for publication
      sleep 0.1  # changed for publication
    done  # changed for publication
    [[ $actual == "${previous_value[$name]}" ]] || { echo "Setting not recovered: $name after $attempt checks" >&2; failed=1; }  # changed for publication
  done  # changed for publication
  (( failed == 0 )) || rc=1  # changed for publication
  exit "$rc"  # changed for publication
}  # changed for publication
trap cleanup_settings EXIT  # changed for publication
trap 'exit 130' INT  # changed for publication
trap 'exit 143' TERM  # changed for publication
save_settings autovacuum  # changed for publication
D="$OUT/diag_av_off"; mkdir -p "$D"
VNUM=$(q postgres "show server_version_num"); RAF=relallfrozen; [ "$VNUM" -ge 180000 ] || RAF="null as relallfrozen"  # changed for publication
STATE_SQL="select 'pg_class' as kind, relname, relpages, reltuples, relallvisible, $RAF from pg_class where relname in ('accounts','accounts_id_idx','customers','customers_pkey','orders','orders_pkey','orders_customer_id_idx') order by relname;  -- changed for publication
select 'vm' as kind, relname, pg_relation_size(c.oid)/current_setting('block_size')::int, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname in ('accounts','customers','orders') order by relname;
select 'pg_stats_rows' as kind, tablename, count(*) from pg_stats where schemaname='public' group by tablename order by tablename;"
q postgres "alter system set autovacuum = off" && q postgres "select pg_reload_conf()" >/dev/null && sleep 2
q postgres "show autovacuum" > "$D/autovacuum_setting_during_restore.txt"
for a in default stats; do
  db="forge_d_avoff_$a"; create_db "$db"  # changed for publication
  pg_restore -d "$db" --exit-on-error "$OUT/dumps/$a.dump" > "$D/restore_$a.out" 2> "$D/restore_$a.err"; echo $? > "$D/restore_$a.rc"
  "${PSQL[@]}" -d "$db" -c "$STATE_SQL" > "$D/state_after_restore_$a.txt" 2>&1  # changed for publication
  "${PSQL[@]}" -d "$db" -c "set statement_timeout='60s'; explain (analyze, buffers, settings, verbose, format json) select id from accounts where id between 100001 and 110000" > "$D/q1_natural_p1_$a.json" 2>&1  # changed for publication
  "${PSQL[@]}" -d "$db" -c "set statement_timeout='60s'; explain (analyze, buffers, settings, verbose, format json) select id from accounts where id between 100001 and 110000" > "$D/q1_natural_p2_$a.json" 2>&1  # changed for publication
  "${PSQL[@]}" -d "$db" -c "set statement_timeout='60s'; explain (analyze, buffers, settings, verbose, format json) select c.id, c.name, o.id from orders o join customers c on c.id = o.customer_id where o.status = 'completed'" > "$D/q2_natural_p1_$a.json" 2>&1  # changed for publication
done
# Previous settings are returned by the EXIT trap.  # changed for publication
q postgres "show autovacuum" > "$D/autovacuum_setting_before_cleanup.txt"  # changed for publication
echo "done"  # changed for publication
```

#### `diag_table_av_off.sh`: tables with `autovacuum_enabled = false`, `--statistics` archive, autovacuum on (the `autovacuum_enabled = false` warning and recommendation 2)

```bash
#!/usr/bin/env bash
# Hazard check: tables with reloptions autovacuum_enabled=false, dumped with
# --statistics, restored into a cluster with autovacuum=on.
#   diag_table_av_off.sh <bindir> <port> <outdir> [reps]
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
BIN=$1; PORT=$2; OUT=$3; REPS=${4:-3}
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
mkdir -p "$OUT"/{dumps,targets}
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt); q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
}  # changed for publication
log(){ echo "[$(date -u +%FT%TZ)] $*" | tee -a "$OUT/harness.log"; }
MAJOR=$(pg_dump --version | awk '{print int($3)}'); STATS=--statistics  # added for publication
[ "$MAJOR" -ge 18 ] || { STATS=; log "pg_dump $MAJOR has no --statistics option: the stats archive is a plain dump on this version"; }  # added for publication
[[ $(q postgres 'show autovacuum') == on ]] || { echo "This track requires cluster autovacuum=on" >&2; exit 1; }  # changed for publication
create_db "forge_tav_src"  # changed for publication
"${PSQL[@]}" -d forge_tav_src <<'SQL' > "$OUT/source_setup.log" 2>&1  # changed for publication
create extension pg_visibility;
create table accounts (id bigint not null, payload text not null) with (autovacuum_enabled = false);
select setseed(0.314159);
insert into accounts select g, rpad(md5(g::text), 100, 'x') from generate_series(1, 200000) g order by random();
create index accounts_id_idx on accounts (id);
create table customers (id bigint primary key, name text not null) with (autovacuum_enabled = false);
create table orders (id bigint primary key, customer_id bigint not null, status text not null) with (autovacuum_enabled = false);
select setseed(0.271828);
insert into customers select g, 'customer ' || g from generate_series(1, 200000) g;
insert into orders select row_number() over (), c, case when random() < 0.99 then 'completed' else 'pending' end from (select g as c from generate_series(1, 200000) g order by random() limit 100000) s;
create index orders_customer_id_idx on orders (customer_id);
analyze; vacuum;
SQL
pg_dump -Fc -d forge_tav_src -f "$OUT/dumps/default.dump"; pg_dump -Fc $STATS -d forge_tav_src -f "$OUT/dumps/stats.dump"  # changed for publication
pg_restore -l "$OUT/dumps/stats.dump" > "$OUT/dumps/stats.toc"
VNUM=$(q postgres "show server_version_num"); RAF=relallfrozen; [ "$VNUM" -ge 180000 ] || RAF="null as relallfrozen"  # changed for publication
STATE="select 'pg_class', relname, relpages, reltuples, relallvisible, $RAF from pg_class where relname in ('accounts','customers','orders') order by relname;  -- changed for publication
select 'vm', relname, pg_relation_size(c.oid)/current_setting('block_size')::int, s.all_visible, s.all_frozen from pg_class c, lateral pg_visibility_map_summary(c.oid) s where relname in ('accounts','customers','orders') order by relname;
select 'reloptions', relname, reloptions::text from pg_class where relname in ('accounts','customers','orders') order by relname;
select 'maint', relname, autovacuum_count, autoanalyze_count from pg_stat_user_tables order by relname;"
EXPLAIN="explain (analyze, buffers, settings, verbose, format json)"
q postgres "show autovacuum" > "$OUT/cluster_autovacuum_setting.txt"
for rep in $(seq 1 $REPS); do for a in default stats; do
  tid="r${rep}_$a"; db="forge_tav_$tid"; T="$OUT/targets/$tid"; mkdir -p "$T"; log "target $tid"  # changed for publication
  create_db "$db"  # changed for publication
  pg_restore -d "$db" --exit-on-error "$OUT/dumps/$a.dump" > "$T/restore.out" 2> "$T/restore.err"; echo $? > "$T/restore.rc"
  "${PSQL[@]}" -d "$db" -c "$STATE" > "$T/state_after_restore.txt" 2>&1  # changed for publication
  for p in 1 2 3; do
    "${PSQL[@]}" -d "$db" -c "set statement_timeout='60s'; $EXPLAIN select id from accounts where id between 100001 and 110000" > "$T/q1_natural_p$p.json" 2>&1  # changed for publication
    "${PSQL[@]}" -d "$db" -c "set statement_timeout='60s'; $EXPLAIN select c.id, c.name, o.id from orders o join customers c on c.id = o.customer_id where o.status = 'completed'" > "$T/q2_natural_p$p.json" 2>&1  # changed for publication
  done
  "${PSQL[@]}" -d "$db" -c "$STATE" > "$T/state_final.txt" 2>&1  # changed for publication
done; done
log "done"  # changed for publication
```

#### `prune_xid_check.sh`: prune hint check: prune_xid after COPY and whether plain VACUUM then freezes, 18 against 19, checksums off (commit 378a216187a, hint logging alone is not enough)

```bash
#!/bin/bash
# Direct check of the freeze-trace inference: does COPY leave pd_prune_xid set (19) or not (18),
# and does plain VACUUM then freeze the page, with and without data checksums.
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
declare -A created_clusters=()  # changed for publication
cleanup(){ local k; for k in "${!created_clusters[@]}"; do pg_dropcluster --stop "${k%%/*}" "${k#*/}" || true; done; }  # changed for publication
trap cleanup EXIT  # changed for publication
mk(){ # version name port checksums(yes|no)
  local V=$1 N=$2 P=$3 C=$4
  [[ $N == forge_px && ! -e /etc/postgresql/$V/$N && ! -e /var/lib/postgresql/$V/$N ]] || { echo "Refusing existing or unowned cluster: $V/$N" >&2; exit 1; }  # changed for publication
  if [ $C = yes ]; then pg_createcluster $V $N --port $P --start-conf manual -- --data-checksums >/dev/null; else pg_createcluster $V $N --port $P --start-conf manual -- --no-data-checksums >/dev/null; fi
  echo "autovacuum = off
shared_buffers = '256MB'  # changed for publication
unix_socket_directories = '/var/run/postgresql'" >> /etc/postgresql/$V/$N/postgresql.conf  # changed for publication
  created_clusters[$V/$N]=yes  # changed for publication
  pg_ctlcluster "$V" "$N" start  # changed for publication
  # no superuser password and no md5 rule: run() connects over the default peer auth with sudo -u postgres  # changed for publication
}
run(){ # version port label
  local V=$1 P=$2 L=$3; local -a PSQL=(sudo -u postgres "/usr/lib/postgresql/$V/bin/psql" -X -v ON_ERROR_STOP=1 -qAt -p "$P" -h /var/run/postgresql -U postgres)  # changed for publication
  echo "=== $L: $("${PSQL[@]}" -d postgres -c 'select version()') checksums=$("${PSQL[@]}" -d postgres -c 'show data_checksums')"  # changed for publication
  "${PSQL[@]}" -d postgres -c "create database forge_px" >/dev/null  # changed for publication
  "${PSQL[@]}" -d forge_px -c "create extension pageinspect; create extension pg_visibility; create table events (id bigint not null, payload text not null);"   # changed for publication
  "${PSQL[@]}" -d forge_px -c "copy events from program 'seq 1 200000 | awk ''{print \$1 \"\t\" \$1 \"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\"}'''"  # changed for publication
  "${PSQL[@]}" -d forge_px -c "create index on events (id)"  # changed for publication
  "${PSQL[@]}" -d forge_px -c "checkpoint"  # changed for publication
  echo "pages: $("${PSQL[@]}" -d forge_px -c "select pg_relation_size('events')/8192")"  # changed for publication
  echo "prune_xid on pages 0,1,last and count of nonzero over all pages:"
  "${PSQL[@]}" -d forge_px -c "select blkno, (page_header(get_raw_page('events', blkno))).prune_xid from (values (0),(1),((select pg_relation_size('events')/8192 - 1)::int)) v(blkno)"  # changed for publication
  "${PSQL[@]}" -d forge_px -c "select count(*) filter (where (page_header(get_raw_page('events', b))).prune_xid::text <> '0') as nonzero_prune_xid, count(*) as pages from generate_series(0, (pg_relation_size('events')/8192 - 1)::int) b"  # changed for publication
  echo "hint bits: tuples with HEAP_XMIN_COMMITTED (0x0100) on page 0: $("${PSQL[@]}" -d forge_px -c "select count(*) filter (where (t_infomask & 256) > 0) || ' of ' || count(*) from heap_page_items(get_raw_page('events', 0))")"  # changed for publication
  echo "vm before vacuum: $("${PSQL[@]}" -d forge_px -c "select all_visible || ' visible, ' || all_frozen || ' frozen' from pg_visibility_map_summary('events')")"  # changed for publication
  "${PSQL[@]}" -d forge_px -c "vacuum (verbose) events" 2>&1 | grep -E "frozen|all-visible|WAL usage|pages: " | sed 's/^/  /'  # changed for publication
  echo "vm after plain vacuum: $("${PSQL[@]}" -d forge_px -c "select all_visible || ' visible, ' || all_frozen || ' frozen' from pg_visibility_map_summary('events')")"  # changed for publication
  [[ ${created_clusters[$V/forge_px]:-} == yes ]] || { echo "Refusing unowned cluster database" >&2; exit 1; }  # changed for publication
  "${PSQL[@]}" -d postgres -c "drop database forge_px" >/dev/null  # changed for publication
}
mk 19 forge_px 5639 no; mk 18 forge_px 5638 no  # changed for publication
run 19 5639 "19 checksums off"
run 18 5638 "18 checksums off"
# cleanup() drops the clusters on exit  # changed for publication
```

#### `vacuumdb_partition_check.sh`: which vacuumdb modes give a partitioned parent statistics (`vacuumdb --analyze` skips parents; on 19 `--analyze-only` and `--analyze-in-stages` include them)

```bash
#!/usr/bin/env bash
# Does vacuumdb give a partitioned parent statistics? Three fresh restores of the
# partition fixture archive, one per vacuumdb mode. Run as the postgres OS user.
#   vacuumdb_partition_check.sh <bindir> <port> <outdir> <default.dump>
# DISPOSABLE HOST ONLY: this script drops clusters, changes server settings, and restarts Postgres.  # added for publication
[ "${I_UNDERSTAND_THIS_DESTROYS_CLUSTERS:-}" = yes ] || { echo "Run only on a throwaway VM: set I_UNDERSTAND_THIS_DESTROYS_CLUSTERS=yes" >&2; exit 1; }  # added for publication  # changed for publication
set -Eeuo pipefail  # changed for publication
IFS=$'\n\t'  # changed for publication
BIN=$1; PORT=$2; OUT=$3; DUMP=$4
export PATH="$BIN:$PATH" PGPORT=$PORT PGHOST=/var/run/postgresql PGUSER=postgres
mkdir -p "$OUT/steps"
PSQL=(psql -X -v ON_ERROR_STOP=1 -qAt); q(){ "${PSQL[@]}" -d "$1" -c "$2"; }  # changed for publication
create_db(){  # changed for publication
  [[ $1 =~ ^forge_[a-z0-9_]+$ ]] || { echo "Refusing database name: $1" >&2; exit 1; }  # changed for publication
  q postgres "create database $1" >/dev/null  # changed for publication
}  # changed for publication
# Preserve effective values AND the previous auto.conf entry (or its absence).  # changed for publication
declare -A previous_value=() previous_sql=()  # changed for publication
save_settings(){  # changed for publication
  local name  # changed for publication
  for name in "$@"; do  # changed for publication
    previous_value[$name]=$(q postgres "select current_setting('$name')")  # changed for publication
    previous_sql[$name]=$(q postgres "select coalesce((select format('alter system set %I = %L', name, setting) from pg_file_settings where sourcefile = current_setting('data_directory') || '/postgresql.auto.conf' and name = '$name' order by seqno desc limit 1), format('alter system reset %I', '$name'))")  # changed for publication
  done  # changed for publication
}  # changed for publication
cleanup_settings(){  # changed for publication
  local rc=$? name attempt actual failed=0  # changed for publication
  trap - EXIT  # changed for publication
  for name in "${!previous_sql[@]}"; do  # changed for publication
    q postgres "${previous_sql[$name]}" >/dev/null || failed=1  # changed for publication
  done  # changed for publication
  q postgres "select pg_reload_conf()" >/dev/null || failed=1  # changed for publication
  for name in "${!previous_value[@]}"; do  # changed for publication
    for attempt in {1..50}; do  # changed for publication
      actual=$(q postgres "select current_setting('$name')") || failed=1  # changed for publication
      [[ $actual == "${previous_value[$name]}" ]] && break  # changed for publication
      sleep 0.1  # changed for publication
    done  # changed for publication
    [[ $actual == "${previous_value[$name]}" ]] || { echo "Setting not recovered: $name after $attempt checks" >&2; failed=1; }  # changed for publication
  done  # changed for publication
  (( failed == 0 )) || rc=1  # changed for publication
  exit "$rc"  # changed for publication
}  # changed for publication
trap cleanup_settings EXIT  # changed for publication
trap 'exit 130' INT  # changed for publication
trap 'exit 143' TERM  # changed for publication
save_settings autovacuum  # changed for publication
{ echo "server: $(postgres --version)"; echo "vacuumdb: $(vacuumdb --version)"; } > "$OUT/versions.txt"
STATE="select 'pg_stats_rows', tablename, inherited, count(*) from pg_stats where schemaname='public' group by 1,2,3 order by tablename, inherited;
select 'maint', relname, vacuum_count, analyze_count, autovacuum_count, autoanalyze_count from pg_stat_user_tables where relname like 'orders_p%' or relname = 'customers' order by relname;"
q postgres "alter system set autovacuum = off" >/dev/null; q postgres "select pg_reload_conf()" >/dev/null; sleep 1
for mode in analyze analyze_only analyze_in_stages; do
  db="forge_vdb_$mode"  # changed for publication
  create_db "$db"  # changed for publication
  pg_restore -d "$db" --exit-on-error "$DUMP" > "$OUT/steps/restore_$mode.out" 2>&1
  "${PSQL[@]}" -d "$db" -c "$STATE" > "$OUT/steps/${mode}_before.txt" 2>&1  # changed for publication
  case $mode in
    analyze) vacuumdb -d "$db" --analyze > "$OUT/steps/vacuumdb_$mode.out" 2>&1 ;;
    analyze_only) vacuumdb -d "$db" --analyze-only > "$OUT/steps/vacuumdb_$mode.out" 2>&1 ;;
    analyze_in_stages) vacuumdb -d "$db" --analyze-in-stages > "$OUT/steps/vacuumdb_$mode.out" 2>&1 ;;
  esac
  echo "rc=$?" >> "$OUT/steps/vacuumdb_$mode.out"
  "${PSQL[@]}" -d "$db" -c "$STATE" > "$OUT/steps/${mode}_after.txt" 2>&1  # changed for publication
  echo "$mode parent_pg_stats_rows=$(grep -E '^pg_stats_rows\|orders_p\|t\|' "$OUT/steps/${mode}_after.txt" | cut -d'|' -f4) parent_analyze_count=$(grep -E '^maint\|orders_p\|' "$OUT/steps/${mode}_after.txt" | cut -d'|' -f4)" | tee -a "$OUT/summary.txt"
done
# Previous settings are returned by the EXIT trap.  # changed for publication
```

#### The 28 documentation pages in the sample: publisher, page, and whether it recommends ANALYZE, recommends VACUUM, or explains the visibility map (retrieved 2026-10-20)

| # | Publisher | Page | ANALYZE | VACUUM | Visibility map |
| ---: | --- | --- | :---: | :---: | :---: |
| 1 | PostgreSQL | [PostgreSQL 18 — SQL Dump](https://www.postgresql.org/docs/18/backup-dump.html) | yes |  |  |
| 2 | PostgreSQL | [PostgreSQL 18 — pg_restore](https://www.postgresql.org/docs/18/app-pgrestore.html) | yes |  |  |
| 3 | Neon | [Neon — PostgreSQL Restore Database](https://neon.com/postgresql/administration/restore-database) |  |  |  |
| 4 | Supabase | [Supabase — Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) |  |  |  |
| 5 | TigerData | [TigerData — Migrate with downtime](https://www.tigerdata.com/docs/migrate/migrate-with-downtime) | yes |  |  |
| 6 | AWS | [AWS RDS — Importing data from PostgreSQL on an Amazon EC2 instance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Procedural.Importing.EC2.html) |  |  |  |
| 7 | Microsoft Azure | [Azure — Migrate using dump and restore](https://learn.microsoft.com/en-us/azure/postgresql/migrate/how-to-migrate-using-dump-and-restore) |  |  |  |
| 8 | Google Cloud | [Google Cloud SQL — Import and export SQL dump files](https://docs.cloud.google.com/sql/docs/postgres/import-export/import-export-sql) |  |  |  |
| 9 | DigitalOcean | [DigitalOcean — Migrate a PostgreSQL database](https://docs.digitalocean.com/products/databases/postgresql/how-to/migrate/) | yes |  |  |
| 10 | Heroku | [Heroku — Heroku Postgres Backups](https://devcenter.heroku.com/articles/heroku-postgres-backups) |  |  |  |
| 11 | pgAdmin | [pgAdmin 4 9.18 — Restore Dialog](https://www.pgadmin.org/docs/pgadmin4/9.18/restore_dialog.html) |  |  |  |
| 12 | Crunchy Data | [Crunchy Bridge — From Heroku Postgres](https://docs.crunchybridge.com/migrate/heroku_dump_restore) |  |  |  |
| 13 | Neon | [Migrate data from Postgres with pg_dump and pg_restore - Neon Docs](https://neon.com/docs/import/migrate-from-postgres) |  |  |  |
| 14 | Supabase | [Migrate from Postgres to Supabase \| Supabase Docs](https://supabase.com/docs/guides/platform/migrating-to-supabase/postgres) | yes | yes |  |
| 15 | Aiven | [Migrate PostgreSQL® databases to Aiven using pg_dump and pg_restore \| Aiven docs](https://aiven.io/docs/products/postgresql/howto/migrate-pg-dump-restore) | yes | yes |  |
| 16 | Render | [Render Postgres Recovery and Backups – Render Docs](https://render.com/docs/postgresql-backups) |  |  |  |
| 17 | Railway | [Back Up and Restore Postgres \| Railway Guides](https://docs.railway.com/guides/postgres-backups-restores) |  |  |  |
| 18 | EDB | [EDB Docs - Importing an existing Postgres database](https://www.enterprisedb.com/docs/edb-postgres-ai/cloud-service/managing_your_cluster/migration/cold_migration/) |  |  |  |
| 19 | Crunchy Data | [Data Loading in Postgres for Newbies \| Crunchy Data Blog](https://www.crunchydata.com/blog/data-loading-in-postgres-for-newbies) |  |  |  |
| 20 | Fly.io | [fly postgres import - Fly.io](https://docs.fly.io/flyctl/cmd/fly_postgres_import) |  |  |  |
| 21 | CYBERTEC | [Upgrade to a new PostgreSQL major version](https://www.cybertec-postgresql.com/en/a-primer-on-postgresql-upgrade-methods/) |  |  |  |
| 22 | Crunchy Data | [Introduction to Postgres Backups](https://www.crunchydata.com/blog/introduction-to-postgres-backups) |  |  |  |
| 23 | EDB | [A Complete Guide to PostgreSQL Backup & Recovery](https://www.enterprisedb.com/postgresql-database-backup-recovery-what-works-wal-pitr?lang=en) |  |  |  |
| 24 | Percona | [PostgreSQL Upgrade Using pg_dump/pg_restore: A Step-by-Step Guide](https://www.percona.com/blog/postgresql-upgrade-using-pg_dump-pg_restore/) |  |  |  |
| 25 | Severalnines | [PostgreSQL Backups: What is pg_dumpall?](https://severalnines.com/blog/postgresql-backups-what-is-pg_dumpall/) |  |  |  |
| 26 | Linuxize | [PostgreSQL Backup and Restore with pg_dump and pg_restore](https://linuxize.com/post/postgresql-backup-with-pg-dump-and-pg-restore/) | yes |  |  |
| 27 | DigitalOcean | [How To Backup PostgreSQL Databases on an Ubuntu VPS](https://www.digitalocean.com/community/tutorials/how-to-backup-postgresql-databases-on-an-ubuntu-vps) |  |  |  |
| 28 | Dalibo | [Sauvegarde et restauration](https://public.dalibo.com/exports/formation/manuels/modules/i1/i1.handout.html) | yes | yes | yes |

Counts: 28 pages, 21 publishers, 8 recommend ANALYZE, 3 recommend VACUUM, 1 explains the visibility map. "Recommends" means the page tells the reader to run the command after the restore from the dump; a mention alone does not count.

</details>

[Connect your database to PostgresAI](https://console.postgres.ai) to get it in better shape quickly.
