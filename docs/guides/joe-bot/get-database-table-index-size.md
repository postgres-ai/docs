---
title: How to get sizes of PostgreSQL databases, tables, and indexes with psql commands
---

[↵ Back to **How to work with Joe chatbot** guides](/docs/guides/joe-bot)

Joe supports a number of [psql](https://www.postgresql.org/docs/current/app-psql.html) meta-commands (slash or backslash commands, e.g. `\d`). Such commands could be used to get the size of database objects (tables, indexes, etc.).

You can use meta-commands to get the size:
- `\dt+` – list tables;
- `\l+` - list databases;
- `\di+` – list indexes;
- `\dv+` – list views;
- `\dm+` – list materialized views;
- other supported psql meta-commands are listed [here](/docs/joe-bot/commands-reference#psql-meta-commands).

<!--DOCUSAURUS_CODE_TABS-->
<!--Web UI-->
![Get object size / Web UI](/docs/assets/guides/object-size-web-1.png)
<!--Slack-->
![Get object size / Slack](/docs/assets/guides/object-size-slack-1.png)
<!--END_DOCUSAURUS_CODE_TABS-->

[↵ Back to **How to work with Joe chatbot** guides](/docs/guides/joe-bot)
