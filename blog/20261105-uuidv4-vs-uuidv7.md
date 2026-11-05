---
title: "UUIDv4 vs UUIDv7: what a random primary key costs in Postgres"
date: 2026-11-05 12:00:00
slug: 20261105-uuidv4-vs-uuidv7
authors: [nik]
description: "Same table, same insert stream, three primary keys on Postgres 18. At 100M rows, UUIDv4 inserted at 0.62 to 0.69 of the rate of an ordered key on the same server, and wrote 1.5 to 1.9 times the WAL per row. Where the cost starts, and what it is made of."
image: /assets/blog/20261104-uuidv4-vs-uuidv7-og.png
hide_cover_image: true
tags: [Postgres insights, performance, UUID, WAL, Postgres.FM]
---

import { TldrTabs } from '@site/src/components/TldrTabs'
import { BlogFigure } from '@site/src/components/BlogFigure'
import { StatRow } from '@site/src/components/StatRow'

Postgres 18 ships [`uuidv7()`](https://www.postgresql.org/docs/18/functions-uuid.html), which generates UUIDv7 as defined in [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562#section-5.7). Yet many tables still have `id uuid default gen_random_uuid()`, which is UUIDv4: 122 random bits. Does a random primary key matter?

Barely, while the index fits in memory. Once it outgrows memory, a lot: in our runs at 100M rows, UUIDv4 inserted at 0.62 to 0.69 of the rate of an ordered key on the same server, and its index crowded the table out of `shared_buffers`.

WAL is a separate cost, driven less by memory than by how many index leaves each checkpoint cycle touches. At 90M to 100M rows, UUIDv4 wrote 1.5 to 1.9 times the WAL per row, while UUIDv7 kept up with `int8`.

<StatRow stats={[
  { value: '0.62–0.69×', label: 'UUIDv4 insert rate', note: 'vs an ordered key on the same server, at 100M rows' },
  { value: '1.5–1.9×', label: 'UUIDv4 WAL per row', note: 'vs an ordered key on the same server, at 90M–100M rows' },
  { value: '+33%', label: 'UUIDv4 primary key size', note: 'vs UUIDv7, at 100M rows' },
]} />

I asked [DBLab Forge](https://postgres.ai/products/dblab-forge) to measure it: three tables with the same schema and the same insert stream, differing only in the primary key (UUIDv4, UUIDv7 or `int8`), seven runs on cloud servers, and every hypothesis written down with a falsifier before the first row. This post is the short version; the [full brief](https://console.postgres.ai/shared/brief/9fffe2da-00c1-470b-a79d-a210ae2306bc) has every number with its source.

Kirk Wolak and I talk about it in [Postgres.FM episode 194, "UUIDv4 vs UUIDv7"](https://postgres.fm/episodes/uuidv4-vs-uuidv7) (transcript included). The video shows the charts as we talk.

<iframe
  width="100%"
  style={{ aspectRatio: '16 / 9', border: 0 }}
  src="https://www.youtube-nocookie.com/embed/gf8e3JkQ_8M"
  title="Postgres.FM episode 194: UUIDv4 vs UUIDv7"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerPolicy="strict-origin-when-cross-origin"
  allowFullScreen
></iframe>

<!--truncate-->

<TldrTabs
  defaultTab="Developers"
  founders={{
    title: "If your tables use random UUIDs as primary keys:",
    points: [
      "While the table is small, the key does not change the insert rate: UUIDv4 ran at 0.95 to 1.10 of UUIDv7 on the same server, on each of four servers",
      "Once the index outgrows memory, UUIDv4 inserts slow down by about a third (0.62 to 0.69 of an ordered key on the same server at 100M rows) and keep slowing as the table grows. UUIDv7 and int8 do not",
      "The switch is simple: UUIDv7 is still the uuid type, so new rows need only a new default. Existing ids stay as they are. But in an existing UUIDv4 index, the new keys leave half-empty leaves (from the source code; not measured at scale), so measure the index growth on a clone first",
      "Where storage I/O is billed, the difference becomes money: on Aurora Standard (billed per I/O), UUIDv4's extra reads alone come to about $457 to $486 a month at 1,000 inserts/s, once the index is larger than the cache (arithmetic, not a measured bill; Aurora I/O-Optimized has no per-I/O charge)",
    ],
  }}
  developers={{
    title: "Postgres 18.6, 16 clients, one single-row INSERT per transaction:",
    points: [
      "At 100M rows on 1 GiB of shared_buffers under a 3 GiB memory cap, UUIDv4 inserted at 0.62 to 0.69 of an ordered key on the same server (0.64 to 0.69 of UUIDv7 on two servers, 0.62 of int8 on a third). It starts to fall at about 26M rows",
      "Why: each UUIDv4 insert lands on a random leaf. Past the cap, that means about one buffer read and one evicted-page write per insert, done by the client backend itself",
      "UUIDv4 writes more WAL: 1.5 to 1.9 times the WAL per row of the reference key on the same server at 90M to 100M rows, because every checkpoint re-images the leaves it touches",
      "Generate uuidv7() in Postgres, not in the app: 16 clients with clocks spread over ±60 s gave a 69%-full index with 45% of leaves out of order",
      "order by id desc limit 100 on a UUIDv4 table returns the 100 largest random values, not the newest rows",
      "Switching an existing table is one statement, alter table ... alter column id set default uuidv7(), run under a short lock_timeout",
    ],
    analogy: "Every leaf of a UUIDv4 index is in the working set; an ordered key's working set is one leaf.",
    analogyLabel: "Picture it",
  }}
  dbas={{
    title: "What to check and what to change:",
    points: [
      "New tables: int8 identity, or uuidv7() if you need a UUID. int8's index is 29% smaller than UUIDv7's; a grown UUIDv4 index is 33% larger than UUIDv7's",
      "Keeping UUIDv4? Compare its random-key indexes with RAM, not only with shared_buffers. Past shared_buffers alone, UUIDv4 lost 11% on one server; past shared_buffers plus the page cache, about a third",
      "Watch writes by client backends in pg_stat_io: the background writer sat at or near its default ceiling of about 500 pages/s under every key on the small and tiny tiers, and UUIDv4 backends wrote about one evicted page per insert themselves",
      "A longer checkpoint_timeout (with max_wal_size raised so checkpoints stay timed) cut UUIDv4's WAL per row by 39% but did not detectably close the throughput gap; REINDEX (CONCURRENTLY in production) returns a grown UUIDv4 index to UUIDv7's size, but only for a time: random inserts split the packed leaves again",
    ],
    analogy: "UUIDv4 turns a shared_buffers sizing question into a RAM sizing question: the whole random-key index becomes the working set.",
    analogyLabel: "Picture it",
  }}
  managers={{
    title: "The cost of a random primary key:",
    points: [
      "Insert speed is the same at first: a new system with random UUID keys runs as fast as with ordered keys. The WAL difference is small while the index fits in memory and grows with it after",
      "As tables grow past memory, inserts with random keys run about a third slower than with ordered keys, and the database does more disk I/O. Replicas and backups receive all of the extra WAL",
      "Ask the team: which large tables use gen_random_uuid() as the default, and how large are their indexes compared with RAM?",
      "The change is small for new rows: a new default value on the column, no data migration. But the existing index then grows faster than a new UUIDv7 index would (from the source code; not measured at scale). Measure on a clone of your own data before you plan it",
    ],
  }}
  aiContext={
    "You're answering questions about the blog post 'UUIDv4 vs UUIDv7: what a random primary key costs in Postgres'. " +
    "Setup: Postgres 18.6 on Hetzner Cloud ccx33 servers (8 vCPUs, 32 GiB, local SSD), data checksums on, synchronous_commit on, checkpoint_timeout 5min, wal_compression off. One table events(id, user_id, created_at, payload) with indexes on user_id and created_at; only the primary key differs: uuid default gen_random_uuid() (UUIDv4), uuid default uuidv7() (UUIDv7), bigint generated always as identity (int8). pgbench, 16 clients, one single-row INSERT per transaction. A cgroup capped Postgres memory (shared_buffers plus page cache) at 1.5 GiB (tiny tier, 512 MiB shared_buffers) or 3 GiB (small tier, 1 GiB shared_buffers); the mid tier had 2 GiB shared_buffers and no cap. Seven runs on 2026-10-26, one run per cell, ratios taken within one server. " +
    "Results: while the index fits in memory, the key barely changes the insert rate (with the primary key under 512 MiB, UUIDv4 ran at 0.95 to 1.10 of UUIDv7 on each of four servers), because the load is bound by the WAL flush (about 7.8 rows per flush for every key). At 100M rows on the small tier: int8 23.5k inserts/s, UUIDv7 21.7k, UUIDv4 13.9k (int8 on one server, UUIDv7 the mean of two, UUIDv4 the mean of three, so these three rates come from different servers); UUIDv4 starts to fall at about 26M rows, where its primary key passes 1 GiB of shared_buffers. Past the memory cap, UUIDv4 ran at 0.61 to 0.76 of UUIDv7 at 50M rows (six same-server comparisons on four servers, runs 4 and 7; run 4 mean 0.66), 0.59 at 75M rows, and 0.62 to 0.69 of the ordered key at 100M rows (0.64 to 0.69 against UUIDv7, 0.62 against int8); the preregistered prediction of 0.5 or less was not reached in any same-server run with synchronous_commit on. On the mid tier (index past shared_buffers but in the page cache), UUIDv4 lost 11% (0.89, one server). " +
    "Mechanism: each UUIDv4 insert lands on a random leaf; past the cap that is about one buffer read (about 0.6 device reads) and one evicted dirty page written by the client backend per insert; the background writer sat at or near its default ceiling of about 500 pages/s under every key on the small and tiny tiers. In run 1, UUIDv4 client backends read 53.1M blocks and wrote 52.8M pages; UUIDv7's read 32.7k and wrote 184k. At 100M rows, shared_buffers held 767 MiB of the UUIDv4 primary key and 50 MiB of its table, against 89 and 475 MiB for UUIDv7. With synchronous_commit on, about half of UUIDv4's extra time is commit-flush wait and half is data-file I/O; with synchronous_commit off, UUIDv4 reached only 0.43 of UUIDv7. " +
    "WAL: with the primary key under 512 MiB, UUIDv4 wrote 1.05 to 1.09 times UUIDv7's WAL per row (1.5 to 2.3 times the full-page images); the extra WAL depends on the index leaves touched per checkpoint cycle, not on memory pressure; memory changes the WAL per row mainly through the insert rate. Same-server, at 90M to 100M rows, UUIDv4 wrote 1.5 to 1.9 times the reference key's WAL per row (2.1 to 2.6 without autovacuum WAL). In run 1, with each key on its own server, at 80M to 100M rows: 1,324 B per insert for UUIDv4, 744 for UUIDv7, 745 for int8 (145, 40 and 42 full-page images per 1,000 inserts). UUIDv4 pays about one full-page image per touched leaf per checkpoint; a slower stream touches fewer leaves but shares each image among fewer inserts, so it pays more per row (month model at 1,000 inserts/s: 4.1 to 5.2 KiB per row, of which about 1.1 KiB does not scale with the leaves touched: user_id leaf images, heap images and WAL records without images; against 901 B at about 14k inserts/s). checkpoint_timeout 30 min cut UUIDv4 WAL per row from 855 to 525 B on one server, with no detectable change in the UUIDv4/UUIDv7 ratio. wal_compression lz4 cut UUIDv4 WAL by 7% (one run). " +
    "Size at 100M rows: primary key 3,996 MiB for UUIDv4 (leaves 68% full), 3,012 MiB for UUIDv7, 2,146 MiB for int8 (both 90% full). int8 is 29% smaller than UUIDv7; UUIDv4 33% larger than UUIDv7. After REINDEX, UUIDv4 equals UUIDv7's size. " +
    "UUIDv7 against int8: on the same server, UUIDv7 23,458 inserts/s (run 2, tighter memory cap) against int8 23,131 (run 1) over the same 71M rows; a first result that int8 was 12% faster came from a server with a faster disk. Past the cap on four servers, UUIDv7/int8 was 0.95 to 1.28. " +
    "Reads: a point lookup by primary key cost the same on every key (12 buffers per query when warm, against about 5 pages for the index descent and heap fetch at 100M rows; the rest was not broken down; lookups under memory pressure were not tested). order by id desc limit 100 on UUIDv4 read about 100 scattered heap pages (32 ms) and returns the largest random values, not the newest rows. " +
    "UUIDv7 costs: it reveals the creation time, with about 0.25 µs resolution in Postgres 18 if the bits are decoded (uuid_extract_timestamp() returns milliseconds); it has 62 random bits in Postgres 18 against 122 in UUIDv4, so do not use it as an unguessable token; random deletes of 30% left the UUIDv7 index 1.30 times larger after refill (oldest-first deletes cost nothing after VACUUM); client clock skew of plus or minus 60 s gave UUIDv7 a UUIDv4-like index (69% leaf density, 45% of leaves out of order). Partitioning a UUIDv7 table by RANGE on id prunes id lookups (41k lookups/s at 100 partitions) while a UUIDv4 table partitioned by created_at visits every partition (2.6k). " +
    "Standbys: in-load replay lag stayed under 0.7 s for every key; after a 600 s replay pause, UUIDv4 replayed 2.4 times slower per row than UUIDv7 before the cap and 5.5 times slower past it (one standby). " +
    "Aurora: an illustration for Aurora Standard (billed per I/O), not a measured bill, at 1,000 inserts/s with one commit per insert (as in the test), once the indexes exceed the instance cache. UUIDv4's extra read I/O is about $457 to $486 per month (0.882 to 0.937 buffer reads per UUIDv4 insert against 0 to 0.002 for UUIDv7, x 2.592 billion inserts x $0.20 per million); this part does not depend on how Aurora batches writes. Write I/O costs about the same for both keys and depends on the batching: about $54 to $57 per month if the WAL packs into full 4 KiB writes (best case), up to about $518 if each single-row commit is its own write I/O (worst case). Aurora I/O-Optimized has no per-I/O charge. " +
    "Recommendations: int8 identity or uuidv7() for new tables; generate UUIDv7 on the server; to switch an existing UUIDv4 table, change the column default with lock_timeout set (the ALTER takes ACCESS EXCLUSIVE briefly); old values stay UUIDv4 and uuid_extract_timestamp() returns NULL for them. In Postgres 17, uuid_extract_timestamp() returns NULL for UUIDv7 too; version 7 support came in Postgres 18. After the switch, new UUIDv7 keys sort into the middle of the old UUIDv4 index, not at its right edge, so full leaves split 50:50 and stay about half full (from the Postgres source; not measured at scale); REINDEX CONCURRENTLY packs them again, or new rows can go to a new table. " +
    "Do not invent numbers beyond those above. Be concise and direct. Do not mention that you're an AI or that you received this context."}
  ctaText="Connect your database to PostgresAI"
  ctaLink="https://console.postgres.ai"
/>

## Background

### Prior work

This mechanism is well known. [Tomas Vondra measured it in 2018](https://www.enterprisedb.com/blog/sequential-uuid-generators) on three 7,200 rpm SATA disks in RAID. With the index past `shared_buffers` but still in RAM, random keys ran at less than 30% of the time-based generator's rate. Once the index exceeded RAM, they ran at 15 to 20%. Most of the WAL was full-page images. Our mid tier was in the same position on local SSD, and UUIDv4 lost only 11% there. His slow disks may explain much of the difference; so may our `user_id` index, which takes random inserts in every arm, including the ordered-key ones (see [The test](#the-test)). Both are guesses.

[Ants Aasma](https://www.cybertec-postgresql.com/en/unexpected-downsides-of-uuid-keys-in-postgresql/) showed the cost for index-only scans, [Jeremy Schneider](https://ardentperf.com/2024/02/03/uuid-benchmark-war/) showed a UUIDv4 index taking a large part of the buffer cache, and [credativ](https://www.credativ.de/en/blog/postgresql-en/a-deeper-look-at-old-uuidv4-vs-new-uuidv7-in-postgresql-18/) and others measured bulk loads on Postgres 18. I wanted a steady OLTP insert stream with controlled checkpoints and memory caps, every key compared on the same server, and the side costs measured as well: WAL per insert, standbys, deletes and partitioning.

The often-quoted "random ids halve write throughput" usually cites a [Shopify post](https://shopify.engineering/building-resilient-payment-systems) about a switch from UUIDv4 to ULID for idempotency keys. It does not name the database or say that the key was the primary key. I assume MySQL, because the post mentions it elsewhere. InnoDB stores the table in primary key order, and every secondary index carries the primary key. In Postgres, an insert-only table appends rows to the heap whatever the key, so the cost stays in the indexes on the random key.

Some history: in 2023, Kirk, Andrey Borodin and I built a [ULID function in a Hacking Postgres session](https://hacking.postgres.tv/sessions/YPq_hiOE-N8/), which led to the UUIDv7 patch. Andrey carried it through to [`uuidv7()` in Postgres 18](https://git.postgresql.org/gitweb/?p=postgresql.git;a=commit;h=78c5e141e9c1). The type is still `uuid`, so on Postgres 17 and older you can use the [pg_uuidv7](https://github.com/fboulnois/pg_uuidv7) extension or a SQL or PL/pgSQL function as the default. If the application generates the values, see the clock skew caveat below.

### The test

One table, three versions of the primary key:

```sql
create table events (
  id uuid default gen_random_uuid() primary key,         -- UUIDv4
  -- id uuid default uuidv7() primary key,               -- UUIDv7
  -- id bigint generated always as identity primary key, -- int8
  user_id bigint not null,
  created_at timestamptz not null default clock_timestamp(),
  payload text not null
);
create index events_user_id_idx on events (user_id);
create index events_created_at_idx on events (created_at);
```

The load is `pgbench` with 16 clients, each running one single-row INSERT per transaction, with `synchronous_commit = on`:

```sql
\set uid random_zipfian(1, 10000000, 1.1)
insert into events (user_id, payload) values (:uid, repeat(md5(random()::text), 3));
```

The `user_id` and `created_at` indexes are the same in every table. `user_id` is itself a random-insert index (Zipfian ids), so every table has one random index; only the primary key differs. This makes the gap we measured a conservative one: the UUIDv7 and `int8` arms pay for a random index too, so a table whose only index is on an ordered key should show a wider gap. Tables grew to 50M, 75M or 100M rows.

I did not want to wait for a terabyte of data. So a cgroup capped the memory of the Postgres service, `shared_buffers` and page cache together: 1.5 GiB with 512 MiB of `shared_buffers` (tiny tier) or 3 GiB with 1 GiB (small tier). A mid tier had 2 GiB of `shared_buffers` and no cap.

Two cloud servers of the same type can be quite different, so every ratio between keys in this post is taken on one server unless I say otherwise.

## Results

### In memory

While the index fits in memory, the key does not change the insert rate. With `synchronous_commit = on`, each transaction waits for its WAL flush, and the 16 clients share each flush (about 7.8 rows per flush for every key). The flush sets the rate, and the key barely matters: with the primary key under 512 MiB, UUIDv4 ran at 0.95 to 1.10 of UUIDv7 on each of four servers. Many quick benchmarks stop at this size and conclude that UUIDv4 is fine.

At this size, the WAL difference is small. UUIDv4 wrote 1.05 to 1.09 times UUIDv7's WAL per row, because a small index has few leaves.

### Past memory

<BlogFigure n={1} src="/assets/blog/20261104-uuid-f1-inserts-per-second.svg" variants alt="Inserts per second against rows inserted, 0 to 100M, run 6: on the small tier int8 ends at 23.5k, UUIDv7 at 21.7k and UUIDv4 at 13.9k, with UUIDv4 falling from about 26M rows; on the mid tier UUIDv7 ends at 20.9k and UUIDv4 at 18.3k">

**Inserts per second as the table grows from 0 to 100M rows.** Postgres 18.6, 16 clients, one single-row INSERT per transaction; thin lines are single servers, bold lines the mean. Dashed lines: the UUIDv4 primary key passes `shared_buffers`, then the random-key indexes together pass the 3 GiB cap.

</BlogFigure>

On the small tier, UUIDv4 starts to fall at about 26M rows, where its primary key passes 1 GiB of `shared_buffers`. It falls steeply until about 65M rows, where the random-key indexes together pass the 3 GiB cap, and slowly after that. At 100M rows: `int8` 23.5k inserts/s, UUIDv7 21.7k, UUIDv4 13.9k. These three numbers come from different servers, so use them only as an illustration; the same-server ratios are below.

<BlogFigure n={2} src="/assets/blog/20261104-uuid-f2-share-of-v7.svg" variants alt="UUIDv4 inserts per second as a share of the reference key on the same server, past the crossing: run 3 x1 0.59; run 4 p1 0.76, p2 0.67, p3 0.61, x1 0.61; run 6 small tier p1 0.69, p3 0.64, x1 0.62 against int8; run 7 p1 0.68, p2 0.67; run 6 mid tier p2 0.89">

**UUIDv4 insert rate as a share of the reference key on the same server, past the crossing.** 1.0 is the same speed; we predicted 0.5 or less. Crossing: the random-key indexes pass the memory cap; on the mid tier, the primary key passes `shared_buffers`. Run 6 x1 is compared with `int8`. Not shown: runs 1 and 2 (keys on different servers) and run 7 p3 (`synchronous_commit` off). One run per bar.

</BlogFigure>

Past the crossing, at 100M rows, UUIDv4 ran at 0.62 to 0.69 of the ordered key on the same server: 0.64 to 0.69 against UUIDv7 on two servers, 0.62 against `int8` on a third. The 50M-row runs on the tiny tier, whose 1.5 GiB cap the indexes cross at about 32M rows, spread wider, 0.61 to 0.76 of UUIDv7. No same-server run with `synchronous_commit = on` reached our predicted 0.5, though the ratio was still falling slowly at the end of most runs.

The slowdown has two steps.

- **The index outgrows `shared_buffers` but fits in the page cache.** To read a leaf, a UUIDv4 backend has to evict a dirty page first. The read itself comes from the page cache, which is fast. On the mid tier (one server), UUIDv4 lost 11%. The index was still growing when the run ended, so that is not a ceiling.
- **The random-key indexes outgrow the page cache too.** Now the reads go to disk, about one buffer read per insert, and UUIDv4 runs about a third slower than the ordered keys.

On air, I wondered whether to call this a performance cliff, since on the chart it looks more like a slope. Kirk offered "a performance hill", then added that if people who used to get their work done in time no longer can, it is still a cliff.

### Why UUIDv4 slows down

A B-tree keeps keys in order, so a new key goes to the leaf where it sorts. A UUIDv4 key can land on any leaf, so the whole index becomes the working set, while UUIDv7 and `int8` keys go to the rightmost leaf, which never leaves memory.

<BlogFigure n={3} src="/assets/blog/20261104-uuid-f5-shared-buffers.svg" variants alt="Resident pages in 1 GiB of shared_buffers at 100M rows: UUIDv4 767 MiB of primary key index and 50 MiB of table; UUIDv7 89 MiB of index and 475 MiB of table; int8 69 MiB of index and 485 MiB of table">

**What sits in 1 GiB of `shared_buffers` at 100M rows.** Run 1. Resident pages of the primary key index (solid) and of the table (hatched).

</BlogFigure>

At 100M rows, `shared_buffers` held 767 MiB of the UUIDv4 index and 50 MiB of its table. With UUIDv7 it was 89 MiB of index and 475 MiB of table.

Late in the load, each UUIDv4 insert cost about one buffer read and one write of an evicted page, and the client backend did both itself while the client waited. UUIDv7 backends barely read or wrote at all. Taking those writes off the client's path is the background writer's job, but on the small and tiny tiers it sat at or near its default ceiling of about 500 pages/s (`bgwriter_lru_maxpages = 100` per `bgwriter_delay = 200ms`) under every key, `int8` included.

Wait samples on one server split UUIDv4's extra time roughly in half between the commit flush and data-file I/O. Removing the flush did not close the gap; it widened it. With `synchronous_commit = off`, UUIDv4 reached only 0.43 of UUIDv7 past the cap, because UUIDv7 gained more. The commit flush hides part of the index cost.

### WAL

<BlogFigure n={4} src="/assets/blog/20261104-uuid-f3-wal-per-insert.svg" variants alt="WAL per insert at 80M to 100M rows: UUIDv4 1,324 B with 145 full-page images per 1,000 inserts, UUIDv7 744 B with 40, int8 745 B with 42; within one 300 s checkpoint cycle, UUIDv4 writes 3,871 B per insert in the first 30 s and 497 B in the last 60 s, UUIDv7 835 and 428 B, int8 1,507 and 566 B">

**WAL per insert: UUIDv4 pays full-page images after every checkpoint.** Run 1, each key on its own server; 1 GiB `shared_buffers`, 3 GiB cap, 5-minute checkpoints. Left: rows 80M to 100M, with full-page images (FPI) per 1,000 inserts. Right: the first 30 s after a checkpoint against the last 60 s of the cycle. WAL per row depends on the insert rate, so the same-server comparison in the text is the better one. We did not find why `int8` wrote more than UUIDv7 in the first 30 s; the two ran on different servers.

</BlogFigure>

With `full_page_writes = on`, the first change to a page after a checkpoint writes a full image of it to WAL; later changes until the next checkpoint write small records. UUIDv7 and `int8` keep changing the rightmost leaf, so they pay for one image and then insert many rows into it. After each checkpoint, UUIDv4 pays for an image of almost every leaf it touches. So the number of images follows the number of leaves touched in each checkpoint cycle, and memory changes the WAL per row only through the insert rate. At 90M to 100M rows, UUIDv4 wrote 1.5 to 1.9 times the reference key's WAL per row on the same server.

Two consequences:

- **A slower UUIDv4 stream pays more WAL per row.** It touches fewer leaves per checkpoint cycle, but each image is shared among fewer inserts. We modeled a month at 1,000 inserts/s, with the table held at 40M to 50M rows. The model, built from measured counters rather than measured directly, gives 4.1 to 5.2 KiB of WAL per row for UUIDv4 and 1.1 KiB for UUIDv7. For comparison, we measured 901 B per row for UUIDv4 at about 14k inserts/s, at the same 40M to 50M rows. Standbys and the WAL archive receive all of it.
- **A longer `checkpoint_timeout` reduces WAL, but it does not help the insert rate.** On one server, going from 5 to 30 minutes cut UUIDv4's WAL per row by 39%. The UUIDv4/UUIDv7 ratio did not change by a detectable amount. Raise `max_wal_size` too, so checkpoints stay timed. A longer interval also means longer crash recovery.

`wal_compression = lz4` did not help much, because a leaf full of random UUIDs does not compress well: in one run, UUIDv4's WAL went down by 7%.

Aurora has no full-page writes, but Aurora Standard bills storage I/O. Kirk reminded me on air of someone from the time we worked on ULID and UUIDv7 who found this problem through an Aurora bill. I applied our counters to Aurora Standard at 1,000 inserts/s, with one commit per row, as in the test. Once the random-key indexes exceed the instance cache, UUIDv4's extra reads cost about $457 to $486 a month. Write I/O costs about the same for both keys and depends on how Aurora batches commits. This is arithmetic on our counters, not a measured bill. Aurora I/O-Optimized has no per-I/O charge, so there the difference shows up as cache pressure and latency instead.[^aurora]

### Index size

Unlike the insert rate, index size does not depend on the server.

<BlogFigure n={5} src="/assets/blog/20261104-uuid-f4-index-size.svg" variants alt="Primary key index at 100M rows: UUIDv4 3,996 MiB, 41.8 bytes per row, leaves 68% full; UUIDv7 3,012 MiB, 31.5 bytes per row, 90% full; int8 2,146 MiB, 22.5 bytes per row, 90% full">

**Primary key index at 100M rows: size depends only on the key.** Run 1. B-tree with the default fillfactor of 90. A UUID index entry is 28 B, an `int8` entry 20 B. After `REINDEX`, the UUIDv4 index was the size of the UUIDv7 index.

</BlogFigure>

An index entry is an 8-byte tuple header plus the key, rounded up to 8 bytes, plus a 4-byte line pointer: 28 B for a UUID, 20 B for `int8`. So an `int8` index is 29% smaller than a UUIDv7 index. UUIDv4 and UUIDv7 entries are the same size, and the difference between them is leaf fill. A random insert into a full leaf splits it 50/50, and both halves stay partly empty. UUIDv4 leaves were 68% full on average, close to the classic ln 2 for random B-tree inserts, while UUIDv7 and `int8` packed theirs to the default fillfactor of 90. A grown UUIDv4 index is therefore 33% larger than a UUIDv7 one. `REINDEX` brings it back to UUIDv7's size, but new random inserts split the packed leaves again.

### UUIDv7 vs int8

Our first result here was wrong. With each key on its own server, `int8` inserted about 12% faster than UUIDv7, which looked plausible for a key half the size. But the Forge review compared the servers first: WAL fsync on the UUIDv7 server took about 11% longer, so the `int8` server most likely just had a faster disk.

The second run put UUIDv7 on the `int8` server, under a tighter memory cap. Over the same 71M rows, UUIDv7 inserted 23,458 rows/s there, and `int8` had inserted 23,131 in the first run. Then four servers ran all three keys each. Past the cap, UUIDv7/`int8` was 0.95 to 1.01 on three servers, and 1.28 on the fourth, where the disk slowed during the `int8` arm. So UUIDv7 and `int8` insert at about the same rate, and `int8` keeps its size advantage.

Compare keys on the same server, and fingerprint the server during the run.

### Reads

A warm point lookup by primary key cost the same with every key. If your reads favor recent rows, UUIDv4 spreads their index entries over the whole index, while UUIDv7 and `int8` keep them in a few leaves.

Then there is `order by id desc limit 100`, which people often use to show "recent events". On a UUIDv7 or `int8` table it works and takes about 1 ms, with the newest heap pages already in cache. On a UUIDv4 table, it read about 100 scattered heap pages and took 32 ms. It returned the 100 largest random values, which are not the newest rows. Order by `created_at` on UUIDv4 tables.

### Standbys

During the loads, a streaming standby kept up with every key. Replay lag stayed under 0.7 s. Then we paused replay for 600 s and timed the catch-up: on one standby, UUIDv4 replayed 2.4 times slower per row than UUIDv7 before the primary's memory cap and 5.5 times slower past it. The startup process replays WAL in one process, and for UUIDv4 it read many more pages per row. Even so, the standby replayed UUIDv4 faster than the primary inserted it, so it never fell behind during the load.

## In practice

### UUIDv7 costs

- **It reveals the creation time.** The first 48 bits are a millisecond timestamp, and Postgres 18 adds a sub-millisecond fraction, so anyone who decodes the bits gets the creation time with about 0.25 µs resolution.[^timestamp] `uuidv7(shift interval)` does not hide it, because one known pair of id and time reveals the shift. Kirk gave an example on air: a report that arrives at an unusual hour can hint where it came from. For many tables this does not matter; for some it does. `int8` has a similar issue, since the difference between two ids reveals the growth rate.
- **It has fewer random bits.** A Postgres 18 `uuidv7()` value has 62 random bits (64 on macOS and Windows builds), against 122 in UUIDv4 ([source](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/utils/adt/uuid.c#L621-L670)). Do not use it as a secret or an unguessable token, for example in a URL that grants access.
- **Random deletes bloat any append-ordered index.** Deleting the oldest 30% of a UUIDv7 table and refilling it did not grow the index once VACUUM had freed the empty leaves. Deleting a random 30% and refilling left the primary key 1.30 times larger. No leaf became empty, and new keys never go back to old leaves. Only a rebuild, such as `REINDEX CONCURRENTLY`, recovers that space. This applies to `int8` too.
- **Client clock skew makes a UUIDv7 index look like a UUIDv4 index.** We used 16 clients with clocks spread over ±60 s. The index ended up 69% full, with 45% of leaves out of order. Generate UUIDv7 on the server. We did not test small skews.
- **Order is per backend.** `uuidv7()` is monotonic within one backend but not across backends. For the index that is enough: with 16 backends, leaf density was 90%.

UUIDv7 also lets you partition by time and still prune on `id = $1`, because the timestamp is in the key.

<BlogFigure n={6} src="/assets/blog/20261104-uuid-f6-partitioning.svg" variants alt="Point lookups by id per second at 100 partitions: UUIDv4 partitioned by RANGE on created_at 2,614; UUIDv7 partitioned by RANGE on the timestamp of id 2,863; UUIDv7 partitioned by RANGE on id 41,136; int8 partitioned by RANGE on id 41,008">

**Point lookups by id, 100 partitions: partition by what you look up by.** 50M rows bulk-loaded, 16 clients, one id per statement.

</BlogFigure>

A UUIDv4 table is usually partitioned by `created_at`, so a lookup by id visits every partition. We got 2.6k lookups/s at 100 partitions, against 41k for UUIDv7 partitioned by RANGE on `id`. Partitioning on `uuid_extract_timestamp(id)` does not help a plain `id = $1` lookup, because the planner derives no bound on the expression from it. It does prune if the query also states `uuid_extract_timestamp(id) = uuid_extract_timestamp($1)`; we checked this in a small test, not under load.

Also, a primary key on a partitioned table must include the partition key. With RANGE on `created_at` it becomes `(id, created_at)`, and with RANGE on `uuid_extract_timestamp(id)` Postgres allows no primary key at all. Only RANGE on `id` keeps `id` unique across the table.

### Switching a table

The type stays `uuid`, so for new rows the change is one statement and no table rewrite. But it takes an ACCESS EXCLUSIVE lock for a short time. If a long transaction holds a lock on the table, the ALTER waits, and all queries behind it wait too. So set a low `lock_timeout` and retry (see [Zero-downtime Postgres schema migrations need this: lock_timeout and retries](/blog/20210923-zero-downtime-postgres-schema-migrations-lock-timeout-and-retries)):

```sql
set lock_timeout = '500ms'; -- increase if needed
alter table events alter column id set default uuidv7();
```

This works only if inserts use the default. If the application generates ids, change the application or let it omit the id.

The old values stay UUIDv4.[^uuidv4] `uuid_extract_timestamp()` returns NULL for them, so code that reads the time from the id must handle both versions (`uuid_extract_version()` tells them apart). And the index does not become a UUIDv7 index. New UUIDv7 keys go into one narrow range, so the I/O of new inserts should become local. But that range sits in the middle of the old UUIDv4 keys: a UUIDv7 key made today starts with `01a1`, and almost all UUIDv4 keys sort above it.

In this range, the new part of the index fills even worse than a random index. During inserts, Postgres applies fillfactor only when it splits the rightmost leaf ([nbtsplitloc.c](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/access/nbtree/nbtsplitloc.c#L286-L291)); `CREATE INDEX` and `REINDEX` apply it to every leaf ([nbtsort.c](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/access/nbtree/nbtsort.c#L663-L667)). The "split after new item" rule that could pack a leaf in the middle skips single-column indexes ([source](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/access/nbtree/nbtsplitloc.c#L640-L644)). So each full leaf in the new range splits 50:50 ([source](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/access/nbtree/nbtsplitloc.c#L329-L335)), the new key goes right, and the left half gets no more inserts.

From the source, I expect the new part of the index to stay about half full for as long as old UUIDv4 keys sort above the new ones. We have not measured this at scale; it is the next experiment. If index size matters, rebuild it with `REINDEX CONCURRENTLY` from time to time. A rebuild packs the leaves, but later inserts split them again. Or move new rows to a new table with only UUIDv7 keys.

### Reading the time on Postgres 17

In Postgres 17, `uuid_extract_timestamp()` returns NULL for UUIDv7, because 17 decodes only version 1 (time-based) UUIDs ([REL_17_6 source](https://github.com/postgres/postgres/blob/REL_17_6/src/backend/utils/adt/uuid.c#L438-L471)); Postgres 18 added version 7 ([REL_18_6 source](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/utils/adt/uuid.c#L779-L792)). On 17, use `uuid_v7_to_timestamptz()` from the [pg_uuidv7](https://github.com/fboulnois/pg_uuidv7) extension, or read the 48-bit millisecond prefix in SQL:

```sql
select
  to_timestamp(
    ('x' || substr(replace(id::text, '-', ''), 1, 12))::bit(48)::bigint / 1000.0
  ) as created_at
from events;
```

We checked it on Postgres 17.7 and 18.3. It does not check the version, so use it only on UUIDv7 values.

## Discussion

We wrote fourteen hypotheses before the first row, and several did not survive, including the main one (UUIDv4 at half of UUIDv7 or less). The [brief](https://console.postgres.ai/shared/brief/9fffe2da-00c1-470b-a79d-a210ae2306bc) has the full scoreboard.

### Limitations

- One schema and one insert pattern on local SSD. Your tables, read load and hardware will shift the ratios. I expect the direction to hold. The size of the gap will be different. On network storage random reads cost more, so the gap could be larger.
- One run per cell.
- Single-row transactions with `synchronous_commit = on`. The commit flush hides part of the index cost, so batched inserts and bulk loads should show a larger gap; in [credativ's](https://www.credativ.de/en/blog/postgresql-en/a-deeper-look-at-old-uuidv4-vs-new-uuidv7-in-postgresql-18/) bulk load of 50M rows on Postgres 18, UUIDv4 took 20:40 and UUIDv7 1:46.
- 16 clients. UUIDv7 and `int8` send every insert to the same rightmost leaf, and with more clients or fewer flushes per row that page could become contended.
- The memory caps make the index outgrow memory at tens of millions of rows instead of with real large data. On a large server it happens later.
- Not tested or not measured: batched inserts, rightmost-leaf contention, CPU utilization, point lookups under memory pressure, `wal_compression = zstd`, a higher background writer ceiling, how fast random inserts split a reindexed UUIDv4 index again, and the migration of an existing UUIDv4 table to UUIDv7 (see [Switching a table](#switching-a-table)).
- The Aurora numbers are arithmetic, not a measured bill.

## Recommendations

1. New tables: `int8` (`bigint generated always as identity`), or `uuidv7()` if you need a UUID. If you need a compact key and a public UUID, `int8` plus a `uuidv7()` unique column cost 35% more index bytes per row than UUIDv7 alone in our test.
2. Generate UUIDv7 on the server, or measure your clients' clock skew.
3. Keeping UUIDv4? Compare its random-key indexes with RAM, and also with `shared_buffers`. The table below shows when a primary key reaches a given size. Any index on a UUIDv4 column behaves the same way, for example a foreign key column in a child table.
4. On UUIDv4 tables past `shared_buffers`, watch `pg_stat_io` for writes by client backends in the `normal` context. If they are high while the background writer sits at its ceiling, the backends are doing the eviction writes. `maxwritten_clean` in `pg_stat_bgwriter` grows each time the background writer stops at that ceiling.

   ```sql
   select
     backend_type,
     object,
     context,
     reads,
     writes,
     evictions
   from pg_stat_io
   where
     backend_type in ('client backend', 'background writer')
     and object = 'relation'
     and context = 'normal';

   select maxwritten_clean
   from pg_stat_bgwriter;
   ```
5. Do not use `order by id desc` to read "latest" rows from a UUIDv4 table. Order by `created_at`.
6. Partition by what you look up by. With UUIDv7, RANGE on `id` serves both id lookups and time windows written as key ranges. To turn a time into a key bound, put the Unix time in milliseconds into the first 48 bits. Fill the rest with zeros. Every UUIDv7 made in that millisecond or later sorts above this bound. We checked this on Postgres 17.7 and 18.3:

   ```sql
   select
     (
       lpad(to_hex(floor(extract(epoch from timestamptz '2026-10-01 00:00:00+00') * 1000)::bigint), 12, '0')
       || '00000000000000000000'
     )::uuid as bound;
   -- 01a0f4c2-c400-0000-0000-000000000000
   ```
7. Expect bloat after random deletes on any append-ordered index, and plan `REINDEX CONCURRENTLY` for it.
8. Before you change a large production table, test on a clone. Copy the table into fresh UUIDv4 and UUIDv7 tables, replay your write load, and compare the I/O.

| Primary key size | UUIDv4 rows | UUIDv7 rows | int8 rows |
| --- | ---: | ---: | ---: |
| 512 MiB | 12.8M | 17.0M | 23.9M |
| 1 GiB | 25.7M | 34.1M | 47.7M |
| 4 GiB | 102.8M | 136.3M | 190.9M |
| 16 GiB | 411.0M | 545.4M | 763.5M |

Rows = size ÷ bytes per row at 100M rows (41.8 B for UUIDv4, 31.5 B for UUIDv7, 22.5 B for `int8`). Compare the UUIDv4 column with your `shared_buffers` and RAM. For UUIDv7 and `int8`, use the table only for size planning. Their inserts touch the rightmost leaf whatever the size.

## Ideas for Postgres

We tested none of these.

- **Per-relation eviction statistics.** `pg_stat_io` showed that UUIDv4 backends evicted pages. It did not show which relation they came from. We needed buffer residency snapshots to see the index push out the table. Per-relation counts would also show whether a UUIDv4 index is already past the point.
- **A background writer that scales with the eviction rate.** Its default ceiling was saturated under every key on the small and tiny tiers, `int8` included.
- **Cheaper torn-page protection for index leaves.** Leaf images were most of UUIDv4's full-page image bytes.
- **A built-in 64-bit time-ordered id.** Snowflake-style ids fit in `int8`, sort by time, and keep `int8`'s size advantage. Today, you have to write a function over a sequence and the clock, or install an extension.

## Method

<details>
<summary>Method and environment</summary>

#### Environment and load

- Postgres 18.6 (PGDG package `18.6-1.pgdg24.04+2`) on Ubuntu 24.04. Data checksums on: the initdb default since Postgres 18. With checksums, hint-bit changes also write full-page images after a checkpoint.
- Settings: `synchronous_commit = on` (off only on one server in run 7), `checkpoint_timeout = 5min` (15 and 30 min in run 5), all checkpoints timed, `wal_compression = off` (lz4 tested separately).
- Servers: Hetzner Cloud ccx33, 8 dedicated vCPUs (AMD EPYC-Milan), 32 GiB RAM, local SSD as a virtio disk. One primary and one streaming standby of the same type per arm; a fourth server without a standby ran the partitioning test and run 3.
- Memory tiers: tiny, `shared_buffers = 512MB` with a 1.5 GiB cgroup cap; small, `1GB` with a 3 GiB cap; mid, `2GB` with no cap. The cap covers `shared_buffers` and the page cache of the Postgres service.
- Load: `pgbench`, 16 clients, one single-row INSERT per transaction (the script above). `user_id` is Zipfian over 10M users; the payload is 96 characters.
- Sampling every 10 s: rows, WAL position, `pg_stat_io`, `pg_stat_wal`, buffer residency, wait events; `pg_waldump` over aligned row windows.
- Seven runs on 2026-10-26, 50M to 100M rows per arm. Every throughput number is a single run per cell. Ratios between keys are taken on one server; the servers differed by up to 20 to 30% on the same arm.
- Fourteen hypotheses, each with a falsifier, were written before the first row. Sixteen independent reviews, mostly by AI models, were posted on the study record with our responses.
- The study ran in DBLab Forge. The runs took one day; the whole study, with design, analysis and reviews, about three days. It used about 1.5 billion AI tokens, mostly cached context; about 10.5 million were generated.

#### Where the numbers come from

The [brief](https://console.postgres.ai/shared/brief/9fffe2da-00c1-470b-a79d-a210ae2306bc) gives the source table for every number in this post, the preregistration results, the corrections, and the prior work with their numbers. The Forge harness and analysis code are not open source.

</details>

## References

1. RFC 9562, "Universally Unique IDentifiers (UUIDs)", section 5.7, UUID version 7. https://www.rfc-editor.org/rfc/rfc9562#section-5.7
2. PostgreSQL 18 documentation, UUID functions. https://www.postgresql.org/docs/18/functions-uuid.html
3. Tomas Vondra, "Sequential UUID generators", 2018. https://www.enterprisedb.com/blog/sequential-uuid-generators
4. Ants Aasma, "Unexpected downsides of UUID keys in PostgreSQL", 2023. https://www.cybertec-postgresql.com/en/unexpected-downsides-of-uuid-keys-in-postgresql/
5. Jeremy Schneider, "UUID benchmark war", 2024. https://ardentperf.com/2024/02/03/uuid-benchmark-war/
6. credativ, "A deeper look at old UUIDv4 vs new UUIDv7 in PostgreSQL 18", 2025. https://www.credativ.de/en/blog/postgresql-en/a-deeper-look-at-old-uuidv4-vs-new-uuidv7-in-postgresql-18/
7. Shopify Engineering, "10 Tips for Building Resilient Payment Systems", 2022. https://shopify.engineering/building-resilient-payment-systems
8. Hacking Postgres session with the ULID function, 2023. https://hacking.postgres.tv/sessions/YPq_hiOE-N8/
9. PostgreSQL commit 78c5e141e9c1, `uuidv7()`. https://git.postgresql.org/gitweb/?p=postgresql.git;a=commit;h=78c5e141e9c1
10. "Zero-downtime Postgres schema migrations need this: lock_timeout and retries", 2021. https://postgres.ai/blog/20210923-zero-downtime-postgres-schema-migrations-lock-timeout-and-retries
11. Study brief, UUIDv4 vs UUIDv7. https://console.postgres.ai/shared/brief/9fffe2da-00c1-470b-a79d-a210ae2306bc

## Acknowledgments

Thanks to Kirk Wolak for the conversation on Postgres.FM, and to Andrey Borodin for carrying `uuidv7()` into Postgres 18.

[^uuidv4]: Postgres 18 also adds `uuidv4()`, another name for `gen_random_uuid()`.
[^aurora]: The illustration is arithmetic on the measured counters and on assumptions listed in the brief, at the Aurora Standard price of $0.20 per million I/O requests ([AWS pricing](https://aws.amazon.com/rds/aurora/pricing/)). Prices differ by region. A 30-day month at 1,000 inserts/s has 2,592M inserts, each its own commit. Reads: one read I/O per buffer read by client backends. UUIDv4 had 0.882 to 0.937 per insert: 0.882 to 0.937 × 2,592M × $0.20 per million = $457 to $486 a month. UUIDv7 had 0 to 0.002 per insert, $0 to $1. Writes: Aurora counts write I/Os in 4 KiB units. It batches log records under 4 KiB into one write only when the writer has several of them at the same time ([AWS Database Blog](https://aws.amazon.com/blogs/database/planning-i-o-in-amazon-aurora/); [Aurora FAQ](https://docs.aws.amazon.com/rds/latest/auroraextendedcontent/aurora-faq-billing.html)). Best case, every write carries a full 4 KiB of WAL records without full-page images: 448 B per UUIDv4 insert ÷ 4,096 B × 2,592M × $0.20 per million = $57, and $54 for UUIDv7 (428 B). Worst case, each commit is one write I/O: 2,592M × $0.20 per million = $518 for either key. The real cost is between the two, and depends on how many commits reach storage together. The inputs are from run 5, one server, 15-minute checkpoints, rows 40M to 50M. It is not a measured bill. Aurora I/O-Optimized has no per-I/O charge.
[^timestamp]: In Postgres 18, `uuidv7()` puts a 12-bit sub-millisecond fraction into the bits after the timestamp ([RFC 9562, Method 3](https://www.rfc-editor.org/rfc/rfc9562#section-6.2); [source](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/utils/adt/uuid.c#L569-L669); 10 time bits on macOS and Windows: [source](https://github.com/postgres/postgres/blob/REL_18_6/src/backend/utils/adt/uuid.c#L53-L72)).
