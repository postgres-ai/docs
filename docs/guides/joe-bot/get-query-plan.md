---
title: How to get a query execution plan (EXPLAIN)
sidebar_label: Get a query execution plan
---

Joe bot is built to boost the process of SQL query troubleshooting and optimization. To get an EXPLAIN plan, you need to use the [`explain`](/docs/joe-bot/commands-reference#explain) command with the query you want to optimize. Once you have sent the command, Joe requests a new thin clone and start working with it to bring the EXPLAIN plan to you:

1. First, a plan without execution is immediately requested and presented to you (SQL command `EXPLAIN`). Normally, it takes less than a second to generate such a plan since it doesn't involve real execution. With a few seconds needed for Database Lab Engine to create a new clone (if it was the first your command in this session), it gives you an immediate understanding of the structure of the plan and the estimates (estimated row counts, estimated costs of each node in the plan).
1. Right after this, Joe starts working on the full plan, with execution. Depending on the query and execution complexity, it may take from a few milliseconds to minutes, hours, or even more. Once the plan with execution is provided, you can see the actual buffer counts, row counts, and actual timing.

Note that timing is always volatile and depends on various factors such as the state of the caches (the buffer pool and OS file cache), current load of the server. Moreover, given the fact that Database Lab Engine is normally configured with a relatively low amount of buffers allocated for the buffer pool, you have to expect that you'll get "buffer reads" more often than "buffer hits". However, this does not make the SQL optimization process problematic: we still can use row counts and buffer counts in each node of the plan, as well as analyze the structure of the execution plan. These factors are essential in SQL optimization, while good timing still being the final goal of the SQL optimization process.

>The main purpose of any database index is reducing the amount of data involved in the processing (fewer rows fetches, fewer buffers read, and hit). Follow the optimization rule when dealing with execution plans: "buffers and rows in the process, timing in the end".

Let's analyze how it works step by step.

1. Execute [`explain`](/docs/joe-bot/commands-reference#explain) command with your SQL query, for example:
    ```sql
    explain select *
    from pgbench_accounts
    where bid = 1;
    ```
2. If this was the first command, Joe creates a session and automatically requests a new thin clone to be provisioned. Such clone is a full-size copy of the source database, provisioning takes only a few seconds and, this clone is fully independent (you can analyze it or change it however you want, it will not disturb the work of others, neither it will affect the performance of the source database).
3. First, the **Plan without execution** appears, it can be useful as a preview of **Plan with execution** for long-running queries.
4. When the query is successfully executed (✅ **OK** status) you will see much more information about it, including **Plan with execution**, **Recommendations**, **Summary** (of performance metrics), raw database responses in the attachments. You can read more about plans in the [official Postgres documentation](https://www.postgresql.org/docs/current/using-explain.html).
5. When the query execution is finished, the session is still present. You can [change the database schema or create an index](/docs/guides/joe-bot/create-index) and run the [`explain`](/docs/joe-bot/commands-reference#explain) again.

#### Related official PostgreSQL documentation
- [PostgreSQL documentation: EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)
- [PostgreSQL documentation: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)

#### Related Database Lab guides
- [How to create an index using Joe bot](/docs/guides/joe-bot/create-index)
- [How to reset the state of a Joe session / clone](/docs/guides/joe-bot/reset-session)
- [How to get a list of active queries in a Joe session and stop long-running queries](/docs/guides/joe-bot/query-activity-and-termination)
