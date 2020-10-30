---
title: "Overview of database changes CI/CD verifications"
sidebar_label: "Database changes CI/CD"
slug: /database-changes-cicd
---

:::note
This page is unfinished. Reach out to the Postgres.ai team to learn more.
:::

Database changes CI/CD – a set of solutions that allows the use of full-size database clones in various CI tools (e.g., CircleCI, Jenkins, GitLab CI/CD)

With Database Lab, all database schema or data changes are automatically verified covering 100% of cases. Engineers can easily see the true behavior of any database migration before it is deployed and optimize it when needed. Management is confident that the risks of downtime and performance degradation are eliminated
- Instant provisioning of full-size independent clones of large databases
- Production is not affected nor does it need any special changes to make Database Lab work. Special technologies (such as ZFS) are used only on Database Lab servers
- Automated recycling of used clones
- Multiple parallel verification processes
- Useful artifacts highlighting potentially dangerous issues (including: risks of locking issues and contention, query analysis, DBA-level metrics such as checkpoint and autovacuum behavior analysis)

## Guides
- [Example repository](https://gitlab.com/postgres-ai/ci-example) showing how to integrate your CI/CD pipelines with Database Lab.

:::note
This page is unfinished. Reach out to the Postgres.ai team to learn more.
:::
