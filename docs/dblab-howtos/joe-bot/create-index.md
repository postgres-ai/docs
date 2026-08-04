---
title: How to create an index using Joe bot
sidebar_label: Create an index
description: Create indexes and change the database schema safely with Joe bot's exec command on independent Postgres clones, including HypoPG hypothetical indexes.
---

With Joe, you can not only gather query performance metrics but also change the database schema, create indexes, and more. Use the [`exec`](/docs/reference-guides/joe-bot-commands-reference#exec) command for this. All changes are made against fully independent clones and do not affect other Joe users, so feel free to experiment with the database.

:::tip
You can use any Postgres command with Joe's [`exec`](/docs/reference-guides/joe-bot-commands-reference#exec) command, but the response is not shown. The changes are still applied to your copy of the database.
:::

## Basic
1. Run the [`exec`](/docs/reference-guides/joe-bot-commands-reference#exec) command with your query, for example `exec create index on pgbench_accounts (bid)`.
2. If a session does not already exist, one is created after a moment so you can run your query and experiment with the database.
3. When the query executes successfully, you see the ✅ **OK** status and the time it took to complete. The session is still present. You can now [check new query plans](/docs/dblab-howtos/joe-bot/get-query-plan) or make other changes. You can also reset the state of the session with the `reset` command; see the [How to reset the state of a Joe session](/docs/dblab-howtos/joe-bot/reset-session) guide.


## Advanced
For large tables, where index creation may take many hours, you can experiment with [HypoPG](https://github.com/HypoPG/hypopg) hypothetical indexes. They let you check whether a specific index would improve performance for a problematic query, since you can see whether Postgres would use the index without spending resources to create it.

1. Use the [`exec`](/docs/reference-guides/joe-bot-commands-reference#exec) command with a HypoPG query, for example `SELECT * FROM hypopg_create_index('create index on pgbench_accounts (bid)')`.
2. Use the [`plan`](/docs/reference-guides/joe-bot-commands-reference#plan) command instead of the [`explain`](/docs/reference-guides/joe-bot-commands-reference#explain) command to get the plan without execution, since hypothetical indexes are only taken into account there.

:::info
Joe bot uses a restricted database user that is not allowed to create extensions. Therefore, to use hypothetical indexes, you must configure DBLab Engine to install the HypoPG extension at snapshot preparation time. To do so:
- Create a new SQL file with the query: `create extension if not exists hypopg;`
- In the `queryPreprocessing` section, specify the option `queryPath ` to create the HypoPG extension

For more details, see [DBLab Engine configuration](/docs/reference-guides/database-lab-engine-configuration-reference).
:::

## Related guides
- [How to reset the state of a Joe session](/docs/dblab-howtos/joe-bot/reset-session)
- [How to get a plan of a query using Joe bot](/docs/dblab-howtos/joe-bot/get-query-plan)
- [How to get a list of active queries in a Joe session and stop long-running queries](/docs/dblab-howtos/joe-bot/query-activity-and-termination)
