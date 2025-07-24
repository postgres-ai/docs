---
title: How to remove a foreign key
sidebar_label: remove a foreign key
description: ''
keywords:
  - postgresql
  - remove
  - foreign
  - intermediate
tags:
  - intermediate
  - constraints
  - foreign-keys
  - schema-design
  - ddl
  - removal
difficulty: intermediate
estimated_time: 5 min
---


Removing a foreign key (FK) is straightforward:

```
alter table messages
drop constraint fk_messages_users;
```

However, under heavy load, this is not a safe operation, due to the reasons discussed in
[zero-downtime Postgres schema migrations need this: lock_timeout and retries](https://postgres.ai/blog/20210923-zero-downtime-postgres-schema-migrations-lock-timeout-and-retries):

- this operation needs a brief `AccessExclusiveLock` on *both* tables
- if at least one of the locks cannot be quickly acquired, it waits, potentially blocking other sessions (including
  `SELECT`s), to both tables.

To solve this problem, we need to use a low lock_timeout and retries:

```sql
set lock_timeout to '100ms';
alter ... -- be ready to fail and try again.
```

The same technique needs to be used in the first step of the operation of new FK creation, when we define a new FK with
the `NOT VALID` option, as was discussed in [day 70, How to add a foreign key](/docs/postgres-howtos/schema-design/constraints/how-to-add-a-foreign-key).

See also: [day 71, How to understand what's blocking DDL](/docs/postgres-howtos/monitoring-troubleshooting/lock-analysis/how-to-understand-what-is-blocking-ddl).
