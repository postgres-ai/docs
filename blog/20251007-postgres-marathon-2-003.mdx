---
title: "#PostgresMarathon 2-003: The roots of LWLock:LockManager"
date: 2025-10-07
authors: nik
tags: [Postgres insights, PostgresMarathon, internals, locks]
image: /assets/blog/20251007-postgres-marathon-2-003.png
---

As we discussed, Lock Manager manages heavyweight locks – various kinds of them (various modes, various levels of granularity). These locks are released only at the end of the transaction.

In the most trivial case, when you run a SELECT on a table, this table is locked with AccessShareLock. And not only the table, but all its indexes, which happens during planning time (always happens unless you use prepared statements). This is to protect against concurrent DROP. All of these are released only when the transaction ends.

Information about pending and successful heavyweight lock acquisition attempts is stored in shared memory and can be displayed in the "pg_locks" view. Operations on this table are also protected by locks – but this time, lightweight locks. They are short-lived, being quickly released.

<!--truncate-->

Before Postgres 8.2 (released in 2006), there was only one hash table in shared memory, where all information about heavyweight locks was stored. With the rise of systems with many CPUs, this led to obvious contention: when multiple Postgres backends needed to acquire a lock on the same table or index, LWLockAcquire calls were made (code 8.1 was relatively simple – [the old lmgr/lock.c](https://github.com/postgres/postgres/blob/REL8_1_STABLE/src/backend/storage/lmgr/lock.c) has only 7 places with LWLockAcquire), and if conflicting (concurrent attempts to acquire exclusive LWLocks), backends started to wait.

To mitigate this, the hash table was partitioned into 16 partitions ([commit](https://github.com/postgres/postgres/commit/10b9ca3d054a75e3c361b12388c50a11c828aa24)), and this number hasn't changed since then, see `NUM_LOCK_PARTITIONS`. This helped to partially mitigate contention on LWLocks in LockManager, but of course, only partially – if multiple backends need to write information about a heavyweight lock for the same relation, they are going to deal with the LWLock for a single partition of 16 available ([code](https://github.com/postgres/postgres/blob/d83879a32b481f0e23cd8a14f7849cff3f8898b5/src/include/storage/lock.h#L519-L531)):

```c
/*
 * The lockmgr's shared hash tables are partitioned to reduce contention.
 * To determine which partition a given locktag belongs to, compute the tag's
 * hash code with LockTagHashCode(), then apply one of these macros.
 * NB: NUM_LOCK_PARTITIONS must be a power of 2!
 */
#define LockHashPartition(hashcode) \
((hashcode) % NUM_LOCK_PARTITIONS)
```

Because of this, fast, high-frequency queries (e.g. PK lookups) on multi-core systems were inefficient – the max TPS was reached without loading all the available CPUs (remember, we discussed that waiting on LWLock blocks on a SysV semaphore, so as not to consume CPU?).

In 2011, Robert Haas implemented an additional optimization called fast-path locking, specifically designed for such cases ([commit](https://github.com/postgres/postgres/commit/3cba8999b343648c4c528432ab3d51400194e93b), it was released in 9.2 (2012). Fast-path locks are stored separately, individually for each backend, and protected by per-backend LWLocks, so contention doesn't happen. Before Postgres 18, no more than 16 ([`FP_LOCK_SLOTS_PER_BACKEND`](https://github.com/postgres/postgres/blob/1c4671f7b7c378cc26d1953785a3aa249152958b/src/include/storage/proc.h#L80-L86)) locks could be stored in this way. This mechanism can be applied only for AccessShareLock, RowShareLock, and RowExclusiveLock. The locks that are processed in this way can be observed in `pg_locks` (`fastpath=true`).

This helped a lot to improve performance of SELECTs that deal with no more than 16 relations (e.g., a PK lookup on a table with no more than 15 indexes), but in recent years, especially because of partitioning, it was once again not enough, so in Postgres 18 (2025) one more optimization was implemented.

// to be continued: we'll discuss PG18 and then entertaining benchmarks

