---
id: get-started
title: Getting Started
hide_title: false
sidebar_label: Getting Started
---
## What is Postgres.ai?

The Postgres.ai Platform aims to eliminate all the database-related roadblocks on the way of developers, DBAs, and QA engineers. Two major components of the Platform can be mapped to "Dev" and "Ops" in DevOps lifecycle with respect to databases:

1. (Dev) **Database Lab** – the core component based on which powerful, state-of-the-art development and testing environments are built. It is based on a simple idea: with modern thin cloning technologies, it becomes possible to iterate 100x faster in development and testing. It is extremely helpful for larger companies that want to achieve high development velocity and the most competitive "time to market" characteristics.
1. (Ops) **`postgres-checkup`** – a powerful tool automating health checks of PostgreSQL databases. Its key features are unobtrusiveness, "zero install", and complex and deep analysis of a whole PostgreSQL set of nodes (primary plus its followers). With `postgres-checkup`, an experienced DBA spends only 4 hours instead of 2 weeks to analyze a heavily-loaded PostgreSQL setup when seeing it for the first time.

Additional projects included in the Postgres.ai platform and based on Database Lab:

- Joe bot – an innovative chatbot helping developers troubleshoot and optimize SQL queries without direct access to the data,
- SQL optimization knowledge base – a history of Joe sessions, including details of `EXPLAIN` plans, recommendations, various visualization of query plans, and additional meta-data, to support "team memory" and collaboration within particular engineering teams and between various teams/departments in an organization (e.g., between DBA and Development teams),
- CI integrator – a set of solutions that allows the use of full-size database clones in various CI tools (e.g., CircleCI, Jenkins, GitLab CI/CD).

## How to start

[Enter Postgres.ai](https://postgres.ai/signin/) using one of the following supported ways to authenticate: Google, LinkedIn, GitLab, GitHub.

When you first time do it, make sure to read and comply with [Postgres.ai Terms of the Service](https://postgres.ai/tos/).

Once you are in, you can create an organization (or use an automatically generated one). Alternatively, you can ask your colleague, who is already using Postgres.ai, to invite you to an existing organization. In the latter case, you will receive an email with the link clicking on which you will join that organization.

Organizations on the Postgres.ai platform can be considered as teams or companies. All activities happen in the context of an organization.

To start using Posgres.ai, you can choose one of two options:

1. Read and follow the [Database Lab Tutorial](./database-lab/1_tutorial) that covers Database Lab server installation, database generation, snapshotting, and client CLI install and usage.
1. Install `postgres-checkup` tool to automatically check the health of one of your Postgres setups.

Both solutions can be integrated with Postgres.ai GUI, so you will have all the meta-data collected in centralized storage. Note that Postgres.ai does not connect to your databases, and only metadata is transferred to Postgres.ai storage. This metadata contains technical details about your database operations. This metadata is encrypted and stored securely and transferred using secure methods (HTTPS). If you have any concerns, please reach out Postgres.ai support using the Intercom widget, which you can find it on the right bottom corner.
