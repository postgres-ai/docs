---
title: What Is Joe Bot?
---

## Summary

<img src="/docs/assets/joe/joe.png" width="128" align="right" vspace="20" hspace="20" />
Joe is a Postgres query optimization assistant. Joe allows to boost the development process:

- eliminating annoying waiting time needed to provision copies of large databases for development and testing purposes,
- helping engineers understand details of SQL query performance.

Joe works on top of [Database Lab](https://postgres.ai/docs/database-lab/what_is_database_lab). Every time when an engineer starts communicating with Joe, a new full-size copy of the database is provisioned.

This process is fully automated and takes only a few seconds, even for multi-terabyte databases. Such database copies are called "thin clones" because multiple clones share the same data blocks, so provisioning is super fast, and disk space consumption is very low. The clones are fully independent, so developers can modify databases. Finally, SQL execution plans are identical to production, which makes possible to troubleshoot and optimize queries reliably without involving production databases.

## Features

- "Serverless EXPLAIN": engineers do not need to worry about the provisioning of independent database clones. The process is fully automated, so all the work looks like requests to analyze some query execution plan or modify database schema – and Joe takes care of it, ensuring that delivered results are identical to production.
- PostgreSQL versions 9.6, 10, 11, and 12 are currently supported.
- Currently, Joe is provided in the form of Slack chatbot.
- The provisioning of a new clone takes only a few seconds, regardless of the database size.
- Each database clone is fully independent, so developers do not interfere with each other and do not need to wait.
- Users do not have direct access to the data, working only with metadata (viewing schema, database sizes, query performance metrics, and execution plans),
- When the `explain` command is used for some query, Joe immediately provides the plan without execution and start executing the query. Once the execution is complete, the detailed execution plan is also provided.
- The actual timing values may differ from production because actual caches in the Database Lab are usually smaller. However, the structure of plans and the number of bytes and pages/buffers in plans are identical to production thanks to identical planner configuration.
- The plans are provided both in JSON and textual forms.
- For long-lasting queries, Joe uses @-notification to help understand when the results are ready.
- Clones are writeable, so developers can modify the data or database schema (for example, build new indexes) using the `exec` command,
- Joe provides SQL query optimization recommendations.
- Developers can reset sessions using the `reset` command, starting from scratch at any time, which allows quick iterations.
- Database Lab supports various kinds of Docker images for Postgres, which means that it is possible to use various extensions.
- Using the `exec` command one can set or reset any PostgreSQL variables such as `enable_seqscan` or `random_page_cost` (e.g., `exec set random_page_cost to 1;`), controlling planner parameters.
- Each session will be destroyed after the specified amount of minutes of inactivity (configurable on the Database Lab). The corresponding thin clone will be deleted.
- Joe can work with a Database Lab instance, which is constantly updated (being a replica of some Postgres server or consuming WALs from WAL archive). Sophisticated snapshot strategies can be used. In this case, Joe will always use the latest snapshot, reporting its timestamp (`Snapshot data state at`) to users.
- Integration with Postgres.ai Platform to allow history viewing, plan visualization, and sharing.

## Resources 

- Open-source repository: https://gitlab.com/postgres-ai/joe/.
- Bug reports, ideas, and merge requests are welcome: https://gitlab.com/postgres-ai/joe/issues/.
- To discuss Joe Bot, join our Slack:  https://database-lab-team-slack-invite.herokuapp.com/.
- Community Slack (English): https://database-lab-team-slack-invite.herokuapp.com/. After joining, the live demo of Joe is available in the `#joe-bot-demo` channel: https://database-lab-team.slack.com/archives/CTL5BB30R.
