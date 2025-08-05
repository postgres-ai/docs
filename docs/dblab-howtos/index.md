---
title: DBLab how-to guides
sidebar_label: Overview
slug: /dblab-howtos
---

## Administration
- [How to install DBLab Engine from PostgresAI Console](/docs/dblab-howtos/administration/install-dle-from-postgres-ai)
- [How to install DBLab Engine from AWS Marketplace](/docs/dblab-howtos/administration/install-dle-from-aws-marketplace)
- [How to install DBLab Engine manually (Community Edition)](/docs/dblab-howtos/administration/install-dle-manually)
- [How to configure PostgreSQL used by DBLab Engine](/docs/dblab-howtos/administration/postgresql-configuration)
- [How to manage DBLab Engine](/docs/dblab-howtos/administration/engine-manage)
- [How to manage Joe Bot](/docs/dblab-howtos/administration/joe-manage)
- [Secure DBLab Engine](/docs/dblab-howtos/administration/engine-secure)
- [How to refresh data when working in the "logical" mode](/docs/dblab-howtos/administration/logical-full-refresh)
- [Masking sensitive data in PostgreSQL logs when using CI Observer](/docs/dblab-howtos/administration/ci-observer-postgres-log-masking)
- [Add disk space to ZFS pool without downtime](/docs/dblab-howtos/administration/add-disk-space-to-zfs-pool)

## How to work with DBLab clones
- [How to create DBLab clones](/docs/dblab-howtos/cloning/create-clone)
- [How to connect to DBLab clones](/docs/dblab-howtos/cloning/connect-clone)
- [How to reset DBLab clone](/docs/dblab-howtos/cloning/reset-clone)
- [How to destroy DBLab clone](/docs/dblab-howtos/cloning/destroy-clone)
- [Protect clones from manual and automatic deletion](/docs/dblab-howtos/cloning/clone-protection)
- [How to upgrade Postgres to a new major version in the DBLab clone](/docs/dblab-howtos/cloning/clone-upgrade)

## How to work with DBLab branches
- [How to create a database branch](/docs/dblab-howtos/branching/create-branch)
- [How to delete a database branch](/docs/dblab-howtos/branching/delete-branch)

## How to work with DBLab snapshots
- [How to create a snapshot](/docs/dblab-howtos/snapshots/create-snapshot)
- [How to delete a snapshot](/docs/dblab-howtos/snapshots/delete-snapshot)

## How to work with Joe bot
- [How to get a query execution plan (EXPLAIN)](/docs/dblab-howtos/joe-bot/get-query-plan)
- [How to create an index using Joe bot](/docs/dblab-howtos/joe-bot/create-index)
- [How to reset the state of a Joe session / clone](/docs/dblab-howtos/joe-bot/reset-session)
- [How to get a list of active queries in a Joe session and stop long-running queries](/docs/dblab-howtos/joe-bot/query-activity-and-termination)
- [How to visualize a query plan](/docs/dblab-howtos/joe-bot/visualize-query-plan)
- [How to work with SQL optimization history](/docs/dblab-howtos/joe-bot/sql-optimization-history)
- [How to get row counts for arbitrary SELECTs](/docs/dblab-howtos/joe-bot/count-rows)
- [How to get sizes of PostgreSQL databases, tables, and indexes with psql commands](/docs/dblab-howtos/joe-bot/get-database-table-index-size)

## DBLab CLI
- [How to install and initialize DBLab CLI](/docs/dblab-howtos/cli/cli-install-init)

## Obtaining data for DBLab
### Logical retrieval
- [Amazon RDS](/docs/dblab-howtos/administration/data/rds)
- [Any database (dump/restore)](/docs/dblab-howtos/administration/data/dump)
- [Full refresh](/docs/dblab-howtos/administration/logical-full-refresh)

### Physical retrieval
- [pg_basebackup](/docs/dblab-howtos/administration/data/pg_basebackup)
- [WAL-G](/docs/dblab-howtos/administration/data/wal-g)
- [pgBackRest](/docs/dblab-howtos/administration/data/pgBackRest)
- [Custom](/docs/dblab-howtos/administration/data/custom)

## DBLab (PostgresAI) Platform
- [Start using PostgresAI Platform](/docs/dblab-howtos/platform/start-using-platform)
- [Create and use DBLab Platform access tokens](/docs/dblab-howtos/platform/tokens)
- [DBLab Platform onboarding checklist](/docs/dblab-howtos/platform/onboarding)
