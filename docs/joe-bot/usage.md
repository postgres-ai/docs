---
title: Chatbot Commands
---

### `help`
Show help message.

### `explain`
Analyze your query (`SELECT`, `INSERT`, `DELETE`, `UPDATE`, or `WITH`) and generate recommendations.

First, `EXPLAIN` is applied, immediately providing the plan without execution, to understand the plan structure and the planner costs and estimated row numbers for each node in the plan. Right after that, `EXPLAIN (ANALYZE, BUFFERS)` for the same query will be used to get the execution plan with all the details: the actual time of execution for each node in the plan, the actual number of rows, numbers of shared buffers hit and read, and so on. Please read the chapter ["Using `EXPLAIN`"](https://www.postgresql.org/docs/current/using-explain.html) in the official PostgreSQL documentation.

The final result is provided in both JSON and textual forms. The data is never provided, only meta-data (the detailed plans, timing).

### `exec`
Execute any query (for example, `CREATE INDEX`).

The data output is never provided, users see only the time spent on the execution or errors, if any.

### `reset`
Revert the database to the initial state. Usually takes less than a minute.

All database changes applied during the session are discarded and cannot be restored.

### psql meta-commands
The following `psql` meta-commands are supported:

- `\d`, `\d+` – relations (tables, views, materialized views, indexes),
- `\dt`, `\dt+` – tables,
- `\di`, `\di+` – indexes,
- `\dv`, `\dv+` – views,
- `\dm`, `\dm+` – materialized views,
-`\l`, `\l+`.

See [the official PostgreSQL documentation](https://www.postgresql.org/docs/current/app-psql.html#APP-PSQL-META-COMMANDS) for details.


---

### Extensions

### `hypo`
Create hypothetical indexes using the [HypoPG extension](https://hypopg.readthedocs.io/en/latest/). This allows verifying index ideas without actually building large indexes.

> :warning: Note that an extended Postgres image for Database Lab is required. For a quick start, you can use [prepared images](https://hub.docker.com/repository/docker/postgresai/extended-postgres) created by Postgres.ai, or prepare your own.

The following subcommands are supported:
- `hypo [CREATE_INDEX_QUERY]` – create a hypothetical index. For example, `hypo create index hypo_index_test on table1 using btree (id)`.
- `hypo desc` – describe all hypothetical indexes.
- `hypo desc [OID]` – describe the specified hypothetical index. For example, `hypo desc 18284`.
- `hypo drop [OID]` – drop the specified hypothetical index. For example, `hypo drop 18284`.
- `hypo reset` – drop all hypothetical indexes.
