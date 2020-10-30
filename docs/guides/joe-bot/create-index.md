---
title: How to create an index using Joe bot
sidebar_label: Create an index
---

With Joe, it is possible not only to gather query performance metrics but also to change the database schema, create indexes, etc. It can be done with the [`exec`](/docs/joe-bot/commands-reference#exec) command. All changes are done against fully-independent clones and will not affect other Joe users, feel free to experiment with the database.

:::tip
You can use any PostgreSQL command with Joe's [`exec`](/docs/joe-bot/commands-reference#exec) command, but the response will not be shown. Still, the changes will be applied to your copy of the database.
:::

## Basic
1. Execute [`exec`](/docs/joe-bot/commands-reference#exec) command with your query, e.g. `exec create index on pgbench_accounts (bid)`.
2. After a moment session to execute your query and experiment with the database will be created, if it didn't exist before.
3. When the query is successfully executed you will see the ✅ **OK** status and the time it took to complete. The session is still present. You can [check new query plans](/docs/guides/joe-bot/get-query-plan) or make other changes now. Also, you can reset the state of the session with the `reset` command, see the [How to reset the state of a Joe session](/docs/guides/joe-bot/reset-session) guide.


## Advanced
In the case of big tables when index creation may take many hours you can experiment with [HypoPG](https://github.com/HypoPG/hypopg) hypothetical indexes. They're useful to know if specific indexes can increase performance for problematic queries since you can know if PostgreSQL will use these indexes or not without having to spend resources to create them.

1. Use the [`exec`](/docs/joe-bot/commands-reference#exec) command with special HypoPG query, e.g. `SELECT * FROM hypopg_create_index('create index on pgbench_accounts (bid)')`.
2. Use the [`plan`](/docs/joe-bot/commands-reference#plan) command instead of the [`explain`](/docs/joe-bot/commands-reference#explain) command to get the Plan without execution, as hypothetical indexes can be taken into account only there.

## Related guides
- [How to reset the state of a Joe session](/docs/guides/joe-bot/reset-session)
- [How to get a plan of a query using Joe bot](/docs/guides/joe-bot/get-query-plan)
- [How to get a list of active queries in a Joe session and stop long-running queries](/docs/guides/joe-bot/query-activity-and-termination)
