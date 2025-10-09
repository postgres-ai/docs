---
title: "#PostgresMarathon 2-002: Relation-level locks"
date: 2025-10-06
authors: nik
tags: [Postgres insights, PostgresMarathon, internals, locks]
---

Let's talk about relation-level locks and various confusions, surprises and what is worth to remember in practice.

The key page in Postgres docs describing relation-level locks is here: https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-TABLES

This page in the docs is called "13.3. Explicit Locking" and it might cause confusion because it talks about implicit locking (e.g., if you run a DML or DDL, locks are applied implicitly; while if you execute LOCK or SELECT .. FOR UPDATE, you explicitly request locks to be acquired). However, this might be just my own terminology bias.

This page has a useful "Table 13.2. Conflicting Lock Modes" that can help understand how a lock acquisition can be blocked by another, already acquired or pending (!) lock:

<p align="center">
  <img
    src="/assets/blog/20251005-postgres-marathon-2-002-01.png"
    alt="Table 13.2: Conflicting lock modes in Postgres"
    width="625px"
    loading="eager"
  />
</p>

A possible confusion here is the word "row" used in some lock modes – we shouldn't think that those modes are row-level. They are still relation-level. There is a special concept of row-level locks, we'll dive into that separately. This confusion is covered in the docs though:

> Remember that all of these lock modes are table-level locks, even if the name contains the word "row"; the names of the lock modes are historical.

Back to the table above, there is a very useful transformation of it in old blog post by Marco Slot, "PostgreSQL rocks, except when it blocks: Understanding locks" (2018, https://citusdata.com/blog/2018/02/15/when-postgresql-blocks/) -- it's incomplete, but speaks common operations and can be used as quick reference:

<p align="center">
  <img
    src="/assets/blog/20251005-postgres-marathon-2-002-02.png"
    alt="Lock conflicts for common Postgres operations"
    width="625px"
    loading="eager"
  />
</p>

Next, another terminology confusion might come from reading the section, "13.3.1. Table-Level Locks". Let's not be confused, it talks not only about tables, but rather relations.

In Postgres, the word "relation" can be applied to many objects, we can see it looking at the docs for `pg_class.relkind` (https://postgresql.org/docs/current/catalog-pg-class.html):

> r = ordinary table, i = index, S = sequence, t = TOAST table, v = view, m = materialized view, c = composite type, f = foreign table, p = partitioned table, I = partitioned index

<!--truncate-->

Let's see how locking works in action. Below I'll be using 2 psql sessions: one to perform various actions, and another one to observe `pg_locks` content, looking at the first sessions's locks (using its process ID, "pid") – this is a great way to see what's happening with heavyweight locks, to look from outside, not to cause observer effect.

In the 1st psql session:

```sql
test=# create table t as select 1 as i;
SELECT 1
test=# create index on t(i);
CREATE INDEX
test=#
test=# \d t
                 Table "public.t"
 Column |  Type   | Collation | Nullable | Default
--------+---------+-----------+----------+---------
 i      | integer |           |          |
test=# select pg_backend_pid();
 pg_backend_pid
----------------
        1411087
(1 row)

test=# set idle_in_transaction_session_timeout  to 0;
SET
test=# begin; lock t;
BEGIN
LOCK TABLE
```

-- we locked our table, now let's look at the locks from the 2nd psql session (here I also translate `pg_locks.relation`, which is OID, to relation name, to confirm that we indeed locked the table "t"):

```sql
test=# select relation::regclass, locktype, relation, mode, granted, fastpath
from pg_locks
where pid = 1411087;
 relation |   locktype    | relation |        mode         | granted | fastpath
----------+---------------+----------+---------------------+---------+----------
          | virtualxid    |          | ExclusiveLock       | t       | t
          | transactionid |          | ExclusiveLock       | t       | f
 t        | relation      | 12264839 | AccessExclusiveLock | t       | f
(3 rows)
```

-- we see that the table "t" is locked.

Let's issue a ROLLBACK and try to lock an index:

```sql
test=# rollback; begin; lock t_i_idx;
WARNING:  there is no transaction in progress
ROLLBACK
BEGIN
ERROR:  "t_i_idx" is not a table or view
test=!#
```

-- no, not possible.

Although locking an index is definitely possible -- just implicitly:

```sql
test=!# rollback; begin; alter index t_i_idx rename to i_newname;
ROLLBACK
BEGIN
ALTER INDEX
test=*#
```

Checking in the 2nd psql:

```sql
test=# select relation::regclass, locktype, relation, mode, granted, fastpath
from pg_locks
where pid = 1411087;
 relation |   locktype    | relation |           mode           | granted | fastpath
----------+---------------+----------+--------------------------+---------+----------
          | virtualxid    |          | ExclusiveLock            | t       | t
          | transactionid |          | ExclusiveLock            | t       | f
 t_i_idx  | relation      | 12264842 | ShareUpdateExclusiveLock | t       | f
(3 rows)
```

-- a ShareUpdateExclusiveLock lock on relation with name "t_i_idx" is granted!

Where to read about this ShareUpdateExclusiveLock, implicitly created for our index? Of course, in "13.3.1. Table-Level Locks", part of "13.3. Explicit Locking". In fact, the "Table-Level Locks" section reveals it's not only about table, saying "Acquired by VACUUM ... and certain ALTER INDEX..." when describing ShareUpdateExclusiveLock.

Let's have even more fun - and this is something that I'd like you to remember very well, because we will be studying this behavior of Lock Manager in depth.

Let's issue a ROLLBACK, start another transaction and just read from our table.

```sql
test=*# rollback; begin; select from t;
ROLLBACK
BEGIN
--
(1 row)
```

And checking in the 2nd psql again:

```sql
test=# select relation::regclass, locktype, relation, mode, granted, fastpath
from pg_locks
where pid = 1411087;
 relation |  locktype  | relation |      mode       | granted | fastpath
----------+------------+----------+-----------------+---------+----------
 t_i_idx  | relation   | 12264842 | AccessShareLock | t       | t
 t        | relation   | 12264839 | AccessShareLock | t       | t
          | virtualxid |          | ExclusiveLock   | t       | t
(3 rows)
```

-- as we can see, we see successfully acquired AccessShareLock locks on both table and index (!).

Let's create a few more indexes and repeat. In the 1st psql:

```sql
test=*# rollback;
ROLLBACK
test=# create index on t(i);
CREATE INDEX
test=# create index on t(i);
CREATE INDEX
test=# create index on t(i);
CREATE INDEX
test=# begin; select from t;
BEGIN
--
(1 row)
```

And in the 2nd:

```sql
test=# select relation::regclass, locktype, relation, mode, granted, fastpath
from pg_locks
where pid = 1411087;
 relation |  locktype  | relation |      mode       | granted | fastpath
----------+------------+----------+-----------------+---------+----------
 t_i_idx3 | relation   | 12264866 | AccessShareLock | t       | t
 t_i_idx2 | relation   | 12264865 | AccessShareLock | t       | t
 t_i_idx1 | relation   | 12264864 | AccessShareLock | t       | t
 t_i_idx  | relation   | 12264842 | AccessShareLock | t       | t
 t        | relation   | 12264839 | AccessShareLock | t       | t
          | virtualxid |          | ExclusiveLock   | t       | t
(6 rows)
```

I remember it was a huge surprise for me. During planning phase of a query, Postgres locks all tables participating in the query and all indexes of those tables, with AccessShareLock (which is the least "intrusive" mode of heavyweight locks). The docs don't mention it:

> ACCESS SHARE (`AccessShareLock`)
> Conflicts with the ACCESS EXCLUSIVE lock mode only.
> The SELECT command acquires a lock of this mode on referenced tables. In general, any query that only reads a table and does not modify it will acquire this lock mode.

But in heavy-loaded systems, unless prepared statements are used, this can play huge role, from the small overhead each extra index puts on all operations including SELECT, to the ugly performance cliff called LWLock:LockManager, which we'll study in detail.

Summary:
- use the "Explicit Locking" docs as reference for implicit locking
- reading about tables, keep in mind other types of relations, including indexes
- at planning time for a query, Postgres locks all tables participating in the query and all their indexes, and as we remember, these locks will be released only at COMMIT or ROLLBACK

Ah, two more things:

1. Have I mentioned that the term "Lock Manager" is never introduced in the docs and source code (which includes absolutely amazing READMEs and comments, to be frank)? They use it like it's obvious, but it might be far from it. Not everyone has read Weikum & Vossen...
2. What do you think, is it worth proposing docs patches to -hackers or it's just me and my mood today?

