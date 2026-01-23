---
title: "#PostgresMarathon 2-013: Why keep your index set lean"
date: 2025-11-10 23:59:59
slug: 20251110-postgres-marathon-2-013-why-keep-your-index-set-lean
authors: nik
tags: [Postgres insights, PostgresMarathon, indexes, performance, maintenance]
---

Your API is slowing down. You check your database and find 42 indexes on your `users` table. Which ones can you safely drop? How much performance are they costing you? Let's look at what actually happens in Postgres when you have too many indexes.

If you're a backend or full-stack engineer, you probably don't want to become an indexing expert — you just want your API fast and stable, without babysitting `pg_stat_user_indexes`.

Index maintenance includes multiple activities: dropping unused indexes, dropping redundant indexes, and rebuilding indexes on a regular basis to get rid of index bloat (and of course, keeping autovacuum well tuned).

There are many reasons why we need to keep our index set lean, and some of them are tricky.

<!--truncate-->

## Why drop unused and redundant indexes

I keep collecting these ideas over years. Here's the current list (more to come):

1. Extra indexes slow down writes — infamous "index write amplification"
2. Extra indexes can slow down SELECTs, sometimes radically (surprising but true)
3. Extra indexes waste disk space
4. Extra indexes pollute buffer pool and OS page cache
5. Extra indexes increase autovacuum work
6. Extra indexes generate more WAL, affecting the replication and backups

As for index bloat, reasons 3-6 apply to bloated indexes as well. Plus, if an index is extremely bloated (e.g., 90%+, or >10x the optimal size, index scan latencies suffer. Postgres B-tree implementation lacks merge operations — once a page splits, those pages never merge back together even after deletions. Over time, this leads to increasing fragmentation and bloat. Deduplication in PG13+ helps compress duplicate keys and bottom-up deletion in PG14+ reduces bloat by removing dead tuples more aggressively during insertions. However, these features don't address structural degradation from page splits. Regular monitoring and rebuilding of bloated indexes remains essential maintenance work.

Let's examine each item from the list, studying Postgres source code (here, it's Postgres 18).

## 1. Write amplification

Every `INSERT` or non-HOT `UPDATE` must modify **all** indexes.

Looking at [`execIndexing.c`](https://github.com/postgres/postgres/blob/fc295beb7b74d1f216a53cab61d22027121a763e/src/backend/executor/execIndexing.c#L354-L515):

```c
/*
 * for each index, form and insert the index tuple
 */
for (i = 0; i < numIndices; i++)
{
    Relation indexRelation = relationDescs[i];
    // ...
    index_insert(indexRelation, values, isnull, tupleid,
                 heapRelation, checkUnique, indexUnchanged, indexInfo);
}
```

The loop explicitly iterates through **all** indexes (`numIndices`) and calls `index_insert()` for each one.

**HOT updates can help** — but only when the new tuple fits on the same page and no indexed columns changed. From [`heapam.c`](https://github.com/postgres/postgres/blob/fc295beb7b74d1f216a53cab61d22027121a763e/src/backend/access/heap/heapam.c#L4006-L4027):

```c
if (newbuf == buffer)
{
    /*
     * Since the new tuple is going into the same page, we might be able
     * to do a HOT update. Check if any of the index columns have been
     * changed.
     */
    if (!bms_overlap(modified_attrs, hot_attrs))
        use_hot_update = true;
}
```

Otherwise, all indexes must be updated.

**HOT updates can help:** They're highly effective when tables are designed with them in mind — using appropriate `fillfactor` settings and carefully considering which columns need indexes. While they require same-page tuple placement and no indexed column changes, proper schema design can maximize HOT update applicability. See [the docs](https://www.postgresql.org/docs/current/storage-hot.html) for details.

Related articles:
- [Percona benchmarks](https://www.percona.com/blog/benchmarking-postgresql-the-hidden-cost-of-over-indexing/) measured up to 58% throughput loss with 39 indexes vs 7 indexes
- Production case study: [Adyen](https://medium.com/adyen/fighting-postgresql-write-amplification-with-hot-updates-c8090f329ad6) achieved 10% WAL reduction on their 50TB+ database through `fillfactor` tuning

## 2. Extra indexes slow down SELECTs

The planner must examine **all** indexes to find the best query plan.

We discussed it recently:
- [#PostgresMarathon 2-004: Too many indexes can hurt SELECT query performance](https://postgres.ai/blog/20251008-postgres-marathon-2-004)
- [#PostgresMarathon 2-005: More LWLock:LockManager benchmarks for Postgres 18](https://postgres.ai/blog/20251009-postgres-marathon-2-005)

Looking in the code, [`indxpath.c`](https://github.com/postgres/postgres/blob/fc295beb7b74d1f216a53cab61d22027121a763e/src/backend/optimizer/path/indxpath.c#L258-L314):

```c
/*
 * Examine each index of the table, and see if it is useful for this query.
 */
foreach(lc, rel->indexlist)
{
    IndexOptInfo *index = (IndexOptInfo *) lfirst(lc);
    
    /* Identify the restriction clauses that can match the index. */
    match_restriction_clauses_to_index(root, index, &rclauseset);
    
    /* Build index paths from the restriction clauses. */
    get_index_paths(root, rel, index, &rclauseset, bitindexpaths);
}
```

Each index path triggers expensive cost calculation in [`costsize.c`](https://github.com/postgres/postgres/blob/fc295beb7b74d1f216a53cab61d22027121a763e/src/backend/optimizer/path/costsize.c#L560-L757) — complex computation including I/O cost modeling, selectivity calculations, and page correlation analysis.

Planning overhead is O(N) for evaluating individual indexes, but can approach O(N²) when the planner considers combining multiple indexes in bitmap scans. Source code comment from [`indxpath.c` L528-531](https://github.com/postgres/postgres/blob/fc295beb7b74d1f216a53cab61d22027121a763e/src/backend/optimizer/path/indxpath.c#L528-L531):

```c
/*
 * Note: check_index_only() might do a fair amount of computation,
 * but it's not too bad compared to the planner's startup overhead,
 * especially when the expressions are complicated.
 */
```

Related: [Percona benchmarks](https://www.percona.com/blog/postgresql-indexes-can-hurt-you-negative-effects-and-the-costs-involved/) measured planning overhead with O(N) to O(N²) complexity, affecting high-frequency queries even with 99.7% cache hit ratio.

Where to start checking it manually – here is how you can quickly find your most heavily indexed tables:

```sql
select schemaname, tablename, count(*) as index_count
from pg_indexes
group by 1, 2
having count(*) > 10
order by 3 desc;
```

## 3. Disk space waste

This one is obvious — each index is stored as a separate relation file. In some cases, disk space occupied by indexes for a table significantly exceeds the space for table data itself – this can be used as a weak signal of an over-indexing (signal that optimization is required).

Related blog post: [Haki Benita](https://hakibenita.com/postgresql-unused-index-size) freed 20 GiB by dropping unused indexes, with one partial index reducing storage from 769 MiB to 5 MiB – 99% savings (however, considering partial indexes, keep in mind that [moving to partial indexes can make some HOT updates non-HOT](https://postgres.ai/blog/20211029-how-partial-and-covering-indexes-affect-update-performance-in-postgresql)).

Quick check – find indexes that have never been used with this very basic query:

```sql
select schemaname, relname, indexrelname, pg_size_pretty(pg_relation_size(indexrelid))
from pg_stat_user_indexes
where idx_scan = 0
order by pg_relation_size(indexrelid) desc;
```

There are important additional nuances in this analysis, such as:
- obviously, we need to exclude unique indexes from consideration
- stats must be old enough
- standbys need to be also analyzed

We'll discuss these aspects in detail another time.

At PostgresAI, we turned these checks into automated workflows: we continuously monitor DB health and workload patterns, proposing safe drop/reindex mitigations that require minimal effort from engineers — keeping performance high without hands-on tuning.

## 4. Cache pollution

More indexes = more index pages = more buffer pool pressure = lower cache hit ratio.

From [buffer manager README](https://github.com/postgres/postgres/blob/fc295beb7b74d1f216a53cab61d22027121a763e/src/backend/storage/buffer/README):

> PostgreSQL uses a shared buffer pool to cache disk pages. All backends share a common buffer pool... When a requested page is not in the buffer pool, the buffer manager must evict a page to make room.

Index pages compete with heap pages for limited cache space in both Postgres buffer pool and OS page cache. The tricky part: unused indexes on actively written tables still consume cache because every `INSERT` and non-HOT `UPDATE` must modify all indexes, forcing index pages into memory.

This can significantly affect cache efficiency (hit/read ratio) for both Postgres buffer pool and OS page cache.

Related: Even with 99.7% cache hit ratio, [Percona benchmarks](https://www.percona.com/blog/benchmarking-postgresql-the-hidden-cost-of-over-indexing/) showed up to 58% throughput loss due to excessive indexes competing for cache space. 

## 5. Autovacuum overhead

Vacuum processes all indexes during the bulk delete phase, and typically again during the cleanup phase (which may be skipped if the index indicates no cleanup is needed via the `amvacuumcleanup` result).

From [`vacuumlazy.c`](https://github.com/postgres/postgres/blob/fc295beb7b74d1f216a53cab61d22027121a763e/src/backend/access/heap/vacuumlazy.c#L2610-L2631):

```c
for (int idx = 0; idx < vacrel->nindexes; idx++)
{
    Relation indrel = vacrel->indrels[idx];
    IndexBulkDeleteResult *istat = vacrel->indstats[idx];
    
    vacrel->indstats[idx] = lazy_vacuum_one_index(indrel, istat,
                                                   old_live_tuples, vacrel);
}
```

Then again in [`lazy_cleanup_all_indexes()`](https://github.com/postgres/postgres/blob/fc295beb7b74d1f216a53cab61d22027121a763e/src/backend/access/heap/vacuumlazy.c#L3029-L3043) for cleanup phase.

More indexes = slower vacuum = higher table bloat (and there are chances for some positive feedback loop here).

## 6. WAL generation

Every index change operation generates WAL records.

From [`nbtinsert.c`](https://github.com/postgres/postgres/blob/fc295beb7b74d1f216a53cab61d22027121a763e/src/backend/access/nbtree/nbtinsert.c#L1389):

```c
recptr = XLogInsert(RM_BTREE_ID, xlinfo);
```

B-tree operations have [15 distinct WAL record types](https://github.com/postgres/postgres/blob/fc295beb7b74d1f216a53cab61d22027121a763e/src/include/access/nbtxlog.h#L27-L45): inserts, splits, deletes, vacuum, dedup, and more.

More indexes = more WAL = higher pressure on replication, backup and recovery processes.

In loaded systems, too much WAL generated may lead to operational difficulties and even certain critical performance cliffs. At PostgresAI, we automatically detect and often predict such cliffs from WAL and performance patterns, then surface concrete, safe actions (like dropping redundant indexes or tuning autovacuum) before they turn into incidents.

## Summary

Every extra index costs you:
- **Writes:** `INSERT`/`UPDATE` loops through all indexes
- **Reads:** Planner examines all indexes (O(N) to O(N²))
- **Memory:** Unused indexes still consume cache on writes
- **Vacuum:** Processes all indexes twice
- **WAL:** More indexes = more pressure on replication and backups

Unused, redundant indexes and index bloat aren't free — they get modified on every write.

Drop unused indexes. Drop redundant indexes. Reindex degraded (bloated) indexes. And don't forget `CONCURRENTLY` for all these operations.

Doing all of this by hand is possible — but it doesn't scale when you're shipping features every week.

Keep your index set lean.

---

**P.S.** These maintenance tasks are tedious and error-prone when done manually. [PostgresAI](https://postgres.ai) automatically detects unused and redundant indexes, identifies bloat, and safely executes `REINDEX CONCURRENTLY` operations and proposed `DROP INDEX CONCURRENTLY` for approval in PRs/MRs  — giving you the performance benefits without the operational overhead, so your APIs stay fast, replication stays healthy, and you don't have to moonlight as a full-time DBA.
