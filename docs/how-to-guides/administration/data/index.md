---
title: Database Lab data sources
sidebar_label: Overview
slug: /how-to-guides/administration/data
---

## Guides
### Logical
- [Dump](/docs/how-to-guides/administration/data/dump)
- [RDS](/docs/how-to-guides/administration/data/rds)
- [Full refresh](/docs/how-to-guides/administration/logical-full-refresh)

### Physical
- [WAL-G](/docs/how-to-guides/administration/data/wal-g)
- [pgBackRest](/docs/how-to-guides/administration/data/pgbackrest)
- [pg_basebackup](/docs/how-to-guides/administration/data/pg_basebackup)
- [Custom](/docs/how-to-guides/administration/data/custom)

## Overview
To start using cloning, you need to transfer the data to the DBLab Engine machine first. Data retrieval can be also considered as "thick" cloning. Once it's done, users can use "thin" cloning to get independent full-size clones of the database in seconds, for testing and development. Normally, retrieval (thick cloning) is a slow operation (1 TiB/h is a good speed). Optionally, the process of keeping the Database Lab data directory in sync with the source (being continuously updated) can be configured.

:::info
Read how you can protect personal data: [Data masking](/docs/database-lab/masking).
:::

## Data retrieval types
### Logical
Use [dump/restore](https://www.postgresql.org/docs/current/app-pgdump.html) processes, obtaining a logical copy of the initial database (as a set of SQL commands), and then loading it to the target Database Lab data directory. This is the only option for managed cloud PostgreSQL services such as Amazon RDS.

Physically, the copy of the database created using this method differs from the original one (data blocks are stored differently). However, row counts are the same, as well as internal database statistics, allowing to do various kinds of development and testing, including running EXPLAIN command to optimize SQL queries.

### Physical
Physically copy the data directory from the source (or from the archive if a physical backup tool such as WAL-G, pgBackRest or Barman is used).

This approach allows to have a copy of the original database which is physically identical, including the existing bloat, data blocks location. Not supported for managed cloud Postgres services such as Amazon RDS.

[↵ Back to Guides](/docs/how-to-guides/)
