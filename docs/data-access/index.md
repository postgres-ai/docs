---
title: Overview of data access use case
sidebar_label: Data access
slug: /data-access
---

Better performance for analytics

- Run heavy analytical SQL, perform data export without affecting the production servers
- Bring E and T to a replica: a Database Lab Engine can be considered as a specialized replica, where data modifications are allowed on a temporary clones – this approach can simplify ETL processes
- Analysts work with thin clones, which are fully independent
- When a long-lasting query needs to be executed, an analyst can work independently, not interfering with production workload or a colleague's work
- Production servers are not in danger: autovacuum activity is not affected, long-running queries are not causing bloat

:::note
This page is unfinished. Reach out to the Postgres.ai team to learn more.
:::