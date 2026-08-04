---
title: How to get a query execution plan (EXPLAIN)
sidebar_label: Get a query execution plan
description: Get a Postgres EXPLAIN plan with actual execution using Joe bot, including buffer counts, row counts, and timing, on an independent thin clone.
---

Joe bot speeds up SQL query troubleshooting and optimization. To get an EXPLAIN plan, use the [`explain`](/docs/reference-guides/joe-bot-commands-reference#explain) command with the query you want to optimize. Once you send the command, Joe requests a new thin clone and works with it to produce the EXPLAIN plan:

1. First, a plan without execution is requested and presented immediately (SQL command `EXPLAIN`). Normally, it takes less than a second to generate such a plan, since it does not involve real execution. Together with the few seconds DBLab Engine needs to create a new clone (if this is your first command in the session), it gives you an immediate understanding of the plan's structure and estimates (estimated row counts and estimated cost of each node in the plan).
1. Right after this, Joe starts working on the full plan, with execution. Depending on the query and execution complexity, it may take from a few milliseconds to minutes, hours, or even more. Once the plan with execution is provided, you can see the actual buffer counts, row counts, and timing.

Note that timing is always volatile and depends on various factors, such as the state of the caches (the buffer pool and OS file cache) and the current load on the server. Moreover, because DBLab Engine is normally configured with a relatively small buffer pool, expect to get "buffer reads" more often than "buffer hits". However, this does not make SQL optimization problematic: you can still use the row counts and buffer counts in each node of the plan and analyze the structure of the execution plan. These factors are essential in SQL optimization, while good timing remains its final goal.

:::tip
The main purpose of any database index is to reduce the amount of data involved in processing (fewer row fetches, fewer buffers read and hit). Follow this optimization rule when dealing with execution plans: "buffers and rows in the process, timing in the end".
:::

Let's analyze how it works step by step.

1. Execute [`explain`](/docs/reference-guides/joe-bot-commands-reference#explain) command with your SQL query, for example:
    ```sql
    explain select *
    from pgbench_accounts
    where bid = 1;
    ```
2. If this was the first command, Joe creates a session and automatically requests a new thin clone to be provisioned. Such a clone is a full-size copy of the source database, provisioning takes only a few seconds, and this clone is fully independent (you can analyze it or change it however you want, it will not disturb the work of others, nor will it affect the performance of the source database).
3. First, the **Plan without execution** appears; it can be useful as a preview of the **Plan with execution** for long-running queries.
4. When the query is successfully executed (✅ **OK** status) you will see much more information about it, including **Plan with execution**, **Recommendations**, **Summary** (of performance metrics), raw database responses in the attachments. You can read more about plans in the [official Postgres documentation](https://www.postgresql.org/docs/current/using-explain.html).
5. When the query execution is finished, the session is still present. You can [change the database schema or create an index](/docs/dblab-howtos/joe-bot/create-index) and run the [`explain`](/docs/reference-guides/joe-bot-commands-reference#explain) again.

#### Related official PostgreSQL documentation
- [PostgreSQL documentation: EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)
- [PostgreSQL documentation: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)

#### Related Database Lab guides
- [How to create an index using Joe bot](/docs/dblab-howtos/joe-bot/create-index)
- [How to reset the state of a Joe session / clone](/docs/dblab-howtos/joe-bot/reset-session)
- [How to get a list of active queries in a Joe session and stop long-running queries](/docs/dblab-howtos/joe-bot/query-activity-and-termination)
