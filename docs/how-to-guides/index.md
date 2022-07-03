---
title: Database Lab guides
sidebar_label: Overview
slug: /how-to-guides
---

## Administration
- [How to install DLE from the AWS Marketplace](/docs/how-to-guides/administration/install-dle-from-aws-marketplace)
- [How to install Database Lab with Terraform on AWS](/docs/how-to-guides/administration/install-database-lab-with-terraform)
- [How to configure PostgreSQL used by Database Lab Engine](/docs/how-to-guides/administration/postgresql-configuration)
- [How to manage Database Lab Engine](/docs/how-to-guides/administration/engine-manage)
- [How to manage Joe Bot](/docs/how-to-guides/administration/joe-manage)
- [Secure Database Lab Engine](/docs/how-to-guides/administration/engine-secure)
- [Set up machine for Database Lab Engine](/docs/how-to-guides/administration/machine-setup)
- [How to refresh data when working in the "logical" mode](/docs/how-to-guides/administration/logical-full-refresh)
- [Masking sensitive data in PostgreSQL logs when using CI Observer](/docs/how-to-guides/administration/ci-observer-postgres-log-masking)

## How to work with Database Lab clones
- [How to create Database Lab clones](/docs/how-to-guides/cloning/create-clone)
- [How to connect to Database Lab clones](/docs/how-to-guides/cloning/connect-clone)
- [How to reset Database Lab clone](/docs/how-to-guides/cloning/reset-clone)
- [How to destroy Database Lab clone](/docs/how-to-guides/cloning/destroy-clone)
- [Protect clones from manual and automatic deletion](/docs/how-to-guides/cloning/clone-protection)

## How to work with Joe bot
- [How to get a query execution plan (EXPLAIN)](/docs/how-to-guides/joe-bot/get-query-plan)
- [How to create an index using Joe bot](/docs/how-to-guides/joe-bot/create-index)
- [How to reset the state of a Joe session / clone](/docs/how-to-guides/joe-bot/reset-session)
- [How to get a list of active queries in a Joe session and stop long-running queries](/docs/how-to-guides/joe-bot/query-activity-and-termination)
- [How to visualize a query plan](/docs/how-to-guides/joe-bot/visualize-query-plan)
- [How to work with SQL optimization history](/docs/how-to-guides/joe-bot/sql-optimization-history)
- [How to get row counts for arbitrary SELECTs](/docs/how-to-guides/joe-bot/count-rows)
- [How to get sizes of PostgreSQL databases, tables, and indexes with psql commands](/docs/how-to-guides/joe-bot/get-database-table-index-size)

## Database Lab CLI
- [How to install and initialize Database Lab CLI](/docs/how-to-guides/cli/cli-install-init)

## Obtaining data for Database Lab
### Logical retrieval
- [Amazon RDS](/docs/how-to-guides/administration/data/rds)
- [Any database (dump/restore)](/docs/how-to-guides/administration/data/dump)
- [Full refresh](/docs/how-to-guides/administration/logical-full-refresh)

### Physical retrieval
- [pg_basebackup](/docs/how-to-guides/administration/data/pg_basebackup)
- [WAL-G](/docs/how-to-guides/administration/data/wal-g)
- [pgBackRest](/docs/how-to-guides/administration/data/pgBackRest)
- [Custom](/docs/how-to-guides/administration/data/custom)

## Database Lab (Postgres.ai) Platform
- [Start using Postgres.ai Platform](/docs/how-to-guides/platform/start-using-platform)
- [Create and use Database Lab Platform access tokens](/docs/how-to-guides/platform/tokens)
- [Database Lab Platform onboarding checklist](/docs/how-to-guides/platform/onboarding)
