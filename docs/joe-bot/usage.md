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
