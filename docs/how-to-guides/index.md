---
title: DBLab how-to guides
sidebar_label: Overview
slug: /how-to-guides
---

## Administration
- [How to install DBLab Engine from Postgres AI Console](/docs/how-to-guides/administration/install-dle-from-postgres-ai)
- [How to install DBLab Engine from AWS Marketplace](/docs/how-to-guides/administration/install-dle-from-aws-marketplace)
- [How to install DBLab Engine manually (Community Edition)](/docs/how-to-guides/administration/install-dle-manually)
- [How to configure PostgreSQL used by DBLab Engine](/docs/how-to-guides/administration/postgresql-configuration)
- [How to manage DBLab Engine](/docs/how-to-guides/administration/engine-manage)
- [How to manage Joe Bot](/docs/how-to-guides/administration/joe-manage)
- [Secure DBLab Engine](/docs/how-to-guides/administration/engine-secure)
- [How to refresh data when working in the "logical" mode](/docs/how-to-guides/administration/logical-full-refresh)
- [Masking sensitive data in PostgreSQL logs when using CI Observer](/docs/how-to-guides/administration/ci-observer-postgres-log-masking)
- [Add disk space to ZFS pool without downtime](/docs/how-to-guides/administration/add-disk-space-to-zfs-pool)

## How to work with DBLab clones
- [How to create DBLab clones](/docs/how-to-guides/cloning/create-clone)
- [How to connect to DBLab clones](/docs/how-to-guides/cloning/connect-clone)
- [How to reset DBLab clone](/docs/how-to-guides/cloning/reset-clone)
- [How to destroy DBLab clone](/docs/how-to-guides/cloning/destroy-clone)
- [Protect clones from manual and automatic deletion](/docs/how-to-guides/cloning/clone-protection)
- [How to upgrade Postgres to a new major version in the DBLab clone](/docs/how-to-guides/cloning/clone-upgrade)

## How to work with DBLab branches
- [How to create a database branch](/docs/how-to-guides/branching/create-branch)
- [How to delete a database branch](/docs/how-to-guides/branching/delete-branch)

## How to work with DBLab snapshots
- [How to create a snapshot](/docs/how-to-guides/snapshots/create-snapshot)
- [How to delete a snapshot](/docs/how-to-guides/snapshots/delete-snapshot)

## How to work with Joe bot
- [How to get a query execution plan (EXPLAIN)](/docs/how-to-guides/joe-bot/get-query-plan)
- [How to create an index using Joe bot](/docs/how-to-guides/joe-bot/create-index)
- [How to reset the state of a Joe session / clone](/docs/how-to-guides/joe-bot/reset-session)
- [How to get a list of active queries in a Joe session and stop long-running queries](/docs/how-to-guides/joe-bot/query-activity-and-termination)
- [How to visualize a query plan](/docs/how-to-guides/joe-bot/visualize-query-plan)
- [How to work with SQL optimization history](/docs/how-to-guides/joe-bot/sql-optimization-history)
- [How to get row counts for arbitrary SELECTs](/docs/how-to-guides/joe-bot/count-rows)
- [How to get sizes of PostgreSQL databases, tables, and indexes with psql commands](/docs/how-to-guides/joe-bot/get-database-table-index-size)

## DBLab CLI
- [How to install and initialize DBLab CLI](/docs/how-to-guides/cli/cli-install-init)

## Obtaining data for DBLab
### Logical retrieval
- [Amazon RDS](/docs/how-to-guides/administration/data/rds)
- [Any database (dump/restore)](/docs/how-to-guides/administration/data/dump)
- [Full refresh](/docs/how-to-guides/administration/logical-full-refresh)

### Physical retrieval
- [pg_basebackup](/docs/how-to-guides/administration/data/pg_basebackup)
- [WAL-G](/docs/how-to-guides/administration/data/wal-g)
- [pgBackRest](/docs/how-to-guides/administration/data/pgBackRest)
- [Custom](/docs/how-to-guides/administration/data/custom)

## DBLab (Postgres AI) Platform
- [Start using Postgres AI Platform](/docs/how-to-guides/platform/start-using-platform)
- [Create and use DBLab Platform access tokens](/docs/how-to-guides/platform/tokens)
- [DBLab Platform onboarding checklist](/docs/how-to-guides/platform/onboarding)
