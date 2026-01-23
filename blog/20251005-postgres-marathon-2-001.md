---
title: "#PostgresMarathon 2-001: Lightweight and heavyweight locks"
date: 2025-10-05
authors: nik
tags: [Postgres insights, PostgresMarathon, internals, locks]
---

To warm up, let's talk about lightweight and heavyweight locks (or "regular locks" or just "locks").

I'm using these materials:
- PG docs (first of all, https://www.postgresql.org/docs/current/explicit-locking.html)
- LockManager source code – src/backend/storage/lmgr (and first of all, README https://github.com/postgres/postgres/blob/master/src/backend/storage/lmgr/README)
- Egor Rogov's "PostgreSQL Internals", Part III "Locks"

<!--truncate-->

Lightweight locks ("LWLocks"):
- internal mechanism to coordinate access to shared memory structures
- usually very short, so they are typically released really fast (although may take longer – for example, to protect I/O operations)
- can be exclusive (for writes) or shared (for read-only ops)
- interesting fact from lmgr/README: "if a process has to wait for an LWLock, it blocks on a SysV semaphore so as to not consume CPU time" – we'll return to this later
- in general, very well optimized in modern Postgres versions; LWLock contention is observed only in heavily loaded systems
- normally, we don't have a direct way to observe LWLocks (there is a setting "trace_lwlocks", which requires LOCK_DEBUG at compilation time, so it's only for hacking/debugging purposes), but we do talk of them a lot when Postgres suffers from an LWLock contention – when we see a high number of active sessions in `pg_stat_activity` with `wait_event_type = 'lwlock'`. If we take into account particular wait event (column `wait_event`), we can see cases like `'LWLock:SubtransSLRU'`, `'LWLock:BufferMapping'`, `'LWLock:LockManager'`

Heavyweight locks:
- used to coordinate concurrent access to various high-level resources including but not limited to: databases, tables, indexes, rows
- once acquired, they are held until the very end of transaction; IMPORTANT: acquired heavyweight locks can be released only when COMMIT or ROLLBACK happens, never before
- there is a deadlock detection mechanism – this is one of the jobs of Lock Manager
- users can explicitly initiate a lock acquisition attempt
- attempts to acquire locks form a queue
- there are many types of locks and sophisticated rules of conflicts between them (see https://www.postgresql.org/docs/current/explicit-locking.html)
- we can observe pending and successful lock acquisition attempts using `pg_locks` (and joining it with `pg_stat_activity` on pid)

Lock Manager is a core component of Postgres responsible for managing heavyweight locks.

Key points to remember:
1. Heavyweight locks = same as just "locks"
 - contention → fix your SQL/schema
 - held until COMMIT/ROLLBACK
2. Lightweight locks = LWLocks:
 - contention on them → lack of resources, misconfiguration, suboptimal workload patterns, or Postgres internal limitations

