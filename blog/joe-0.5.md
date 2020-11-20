---
author: "Nikolay Samokhvalov"
authorimg: /assets/images/nik.jpg
date: 2020-02-26 21:42:00
linktitle: Announcing Joe bot, an SQL query optimization assistant
title: Joe bot, an SQL query optimization assistant, updated to version 0.5.0
description: Postgres.ai team is proud to present version 0.5.0 of Joe bot, an SQL query optimization assistant
weight: 0
image: /assets/images/joe-3-silhouettes.svg
tags:
  - Postgres.ai
  - Joe
  - PostgreSQL
  - release
  - SQL
  - EXPLAIN
---

## Meet Joe

*Update: this post reached the HN top, see **[the discussion of Joe bot at Hacker News](https://news.ycombinator.com/item?id=22432254)**!*

Joe is a Postgres query optimization assistant. Joe allows to boost the development process:

- eliminating annoying waiting time needed to provision copies of large databases for development and testing purposes,
- helping engineers understand details of SQL query performance.

Joe works on top of [Database Lab](https://postgres.ai/docs/database-lab#overview). Every time when an engineer starts communicating with Joe, a new full-size copy of the database is provisioned.

This process is fully automated and takes only a few seconds, even for multi-terabyte databases. Such database copies are called "thin clones" because multiple clones share the same data blocks, so provisioning is super fast, and disk space consumption is very low. The clones are fully independent, so developers can modify databases. Finally, SQL execution plans are identical to production, which makes it possible to troubleshoot and optimize queries reliably without involving production databases.

Currently, Joe is provided only in the form of Slack chatbot. Slack was chosen to improve the level of collaboration of developers and DBAs. Alternative commucation ways (including beloved psql) are planned for future versions.

More about Joe features you can find in ["What Is Joe Bot?"](https://postgres.ai/docs/joe-bot).

### Demo

![Joe demo](/assets/joe/demo.gif)

If you have Slack app installed, try the live demonstration:

- Add the Database Lab community to your Slack: https://database-lab-team-slack-invite.herokuapp.com/.
- Go to the `#joe-bot-demo` public channel.
- Start with the `help` command, `explain` any queries, apply any changes to database schema using `exec`, quickly rollback changes with `reset`.

### What's new in version 0.5.0

Version 0.5.0 adds support of Slack API signed secrets, automated notifications when long-lasting jobs are done, various improvements in EXPLAIN plan processing, more. The full list of changes can be found in [Changelog](https://gitlab.com/postgres-ai/joe/-/releases).

### Links:

- What Is Joe Bot? https://postgres.ai/docs/joe-bot
- Tutorial: https://postgres.ai/docs/tutorials/joe-setup
- Open-source repository: https://gitlab.com/postgres-ai/joe/
- Changelog: https://gitlab.com/postgres-ai/joe/-/releases
- Bug reports, ideas, and merge requests are welcome: https://gitlab.com/postgres-ai/joe/issues/
- Community Slack (English): https://database-lab-team-slack-invite.herokuapp.com/. After joining, the live demo of Joe is available in the #joe-bot-demo channel: https://database-lab-team.slack.com/archives/CTL5BB30R
