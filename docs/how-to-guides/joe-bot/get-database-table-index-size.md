---
title: How to get sizes of PostgreSQL databases, tables, and indexes with psql commands
sidebar_label: Get sizes of PostgreSQL database objects
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Joe supports a number of [psql](https://www.postgresql.org/docs/current/app-psql.html) meta-commands (slash or backslash commands, e.g. `\d`). Such commands could be used to get the size of database objects (tables, indexes, etc.).

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
