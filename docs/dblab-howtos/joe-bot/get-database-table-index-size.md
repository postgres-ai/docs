---
title: How to get sizes of PostgreSQL databases, tables, and indexes with psql commands
sidebar_label: Get sizes of PostgreSQL database objects
description: Use Joe bot and psql meta-commands to get the size of Postgres databases, tables, indexes, views, and materialized views without direct database access.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Joe supports a number of [psql](https://www.postgresql.org/docs/current/app-psql.html) meta-commands (backslash commands, such as `\d`). You can use these commands to get the size of database objects such as tables and indexes.

You can use meta-commands to get the size:
- `\dt+` – list tables;
- `\l+` - list databases;
- `\di+` – list indexes;
- `\dv+` – list views;
- `\dm+` – list materialized views;
- other supported psql meta-commands are listed [here](/docs/reference-guides/joe-bot-commands-reference#psql-meta-commands).

<Tabs
  groupId="mode"
  defaultValue="web"
  values={[
    {label: 'Web UI', value: 'web'},
    {label: 'Slack', value: 'slack'},
  ]
}>
<TabItem value="web">

![Get object size / Web UI](/assets/guides/object-size-web-1.png)

</TabItem>
<TabItem value="slack">

![Get object size / Slack](/assets/guides/object-size-slack-1.png)

</TabItem>
</Tabs>
