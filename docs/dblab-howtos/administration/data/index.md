---
title: DBLab data sources
sidebar_label: Overview
slug: /dblab-howtos/administration/data
description: Overview of DBLab Engine data retrieval methods, comparing logical (dump/restore) and physical data sources for thin cloning of Postgres databases.
---

## Guides
### Logical
- [Dump](/docs/dblab-howtos/administration/data/dump)
- [RDS](/docs/dblab-howtos/administration/data/rds)
- [RDS/Aurora refresh](/docs/dblab-howtos/administration/data/rds-refresh) — refreshes from a temporary RDS clone instead of production
- [Full refresh](/docs/dblab-howtos/administration/logical-full-refresh)

### Shared
- [Rename databases during snapshot creation](/docs/dblab-howtos/administration/data/database-rename)

### Physical
- [WAL-G](/docs/dblab-howtos/administration/data/wal-g)
- [pgBackRest](/docs/dblab-howtos/administration/data/pgbackrest)
- [pg_basebackup](/docs/dblab-howtos/administration/data/pg_basebackup)
- [rsync](/docs/dblab-howtos/administration/data/rsync)
- [Custom](/docs/dblab-howtos/administration/data/custom)

## Overview
To start using cloning, you first need to transfer the data to the DBLab Engine machine. Data retrieval can also be considered "thick" cloning. Once it is done, users can use "thin" cloning to get independent, full-size clones of the database in seconds, for testing and development. Retrieval (thick cloning) is normally a slow operation (1 TiB/h is a good speed). Optionally, you can configure the DBLab Engine data directory to stay in sync with the source as it is continuously updated.

:::info
Read how you can protect personal data: [Data masking](/docs/database-lab/masking).
:::

## Data retrieval types
### Logical
Use [dump/restore](https://www.postgresql.org/docs/current/app-pgdump.html) processes to obtain a logical copy of the initial database (as a set of SQL commands), then load it into the target DBLab Engine data directory. This is the only option for managed cloud Postgres services such as Amazon RDS.

Physically, the copy of the database created with this method differs from the original (data blocks are stored differently). However, the row counts are the same, as are the internal database statistics, so you can perform various kinds of development and testing, including running the EXPLAIN command to optimize SQL queries.

### Physical
Physically copy the data directory from the source (or from the archive if a physical backup tool such as WAL-G, pgBackRest or Barman is used).

This approach gives you a copy of the original database that is physically identical, including the existing bloat and data block layout. It is not available for managed cloud Postgres services such as Amazon RDS.

[↵ Back to Guides](/docs/dblab-howtos/)
