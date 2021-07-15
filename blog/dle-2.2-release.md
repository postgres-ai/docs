---
slug: dle-2-2-release
author: "Nikolay Samokhvalov"
authorimg: /assets/images/nik.jpg
date: 2021-02-22 06:45:00
publishDate: 2021-02-22 06:45:00
linktitle: "Database Lab Engine 2.2 and Joe Bot 0.9"
title: "Database Lab Engine 2.2 and Joe Bot 0.9"
description: "Database Lab Engine 2.2.0 and SQL Optimization Chatbot “Joe” 0.9.0 released: multiple pools for automated “logical” initialization, production timing estimation (experimental), and improved security."
weight: 0
image: /assets/thumbnails/dle-2.2-blog.png
tags:
  - Database Lab Engine
  - PostgreSQL staging
  - database migration testing
  - SQL performance chatbot
  - Joe bot
  - SQL performance assistant
  - database migrations CI
  - thin PostgreSQL clones
---

<p align="center">
    <img src="/assets/thumbnails/dle-2.2-blog.png" alt="DLE 2.2 and Joe 0.9"/>
</p>

## About Database Lab Engine
The Database Lab Engine (DLE) is an open-source experimentation platform for PostgreSQL databases. The DLE instantly creates full-size thin clones of your production database which you can use to:

1. Test database migrations
1. Optimize SQL queries
1. Deploy full-size staging applications

The Database Lab Engine can generate thin clones for any size database, eliminating the hours (or days!) required to create “thick” database copies using conventional methods.  Thin clones are independent, fully writable, and will behave identically to production: they will have the same data and will generate the same query plans.

Learn more about the Database Lab Engine and sign up for an account at [https://postgres.ai/](https://postgres.ai/). 

## Database Lab Engine 2.2.0
Database Lab Engine (DLE) 2.2.0 further improves support for both types of PostgreSQL data directory initialization and synchronization: “physical” and “logical”. Particularly, for the “logical” type (which is useful for managed cloud PostgreSQL such as Amazon RDS users), it is now possible to setup multiple disks or disk arrays and automate data retrieval on a schedule.  This gracefully cleans up the oldest versions of data, without downtime or interruptions in the lifecycle of clones.

Other improvements include:

- Auto completion for the client CLI (“dblab”)
- Clone container configuration — Docker parameters now can be defined in DLE config (such as `--shm--size` that is needed to avoid errors in newer versions of Postgres when parallel workers are used to process queries)
- Allow requesting a clone with non-superuser access — This appears as a new option in the API and CLI called “restricted”

Database Lab Engine links:

- [Database Lab Engine 2.2.0 release notes](https://gitlab.com/postgres-ai/database-lab/-/releases)
- [Resources](https://postgres.ai/resources/) – interactive tutorial and case studies
- [Blog](https://postgres.ai/blog/)
- [Tutorial for RDS users](https://postgres.ai/docs/tutorials/database-lab-tutorial-amazon-rds)
- [Tutorial for any PostgreSQL database](https://postgres.ai/docs/tutorials/database-lab-tutorial)
- [Database Lab Engine configuration reference](https://postgres.ai/docs/reference-guides/database-lab-engine-configuration-reference)

## Joe Bot 0.9.0 - A Virtual DBA for SQL Optimization

“Joe Bot”, a virtual DBA for SQL optimization, is a revolutionary new way to troubleshoot and optimize PostgreSQL query performance. Instead of running EXPLAIN or EXPLAIN (ANALYZE, BUFFERS) directly in production, users send queries for troubleshooting to Joe Bot. Joe Bot uses the Database Lab Engine (DLE) to:

- Generate a fresh thin clone
- Execute the query on the clone
- Return the resulting execution plan to the user

The returned plan is identical to production in terms of structure and data volumes – this is achieved thanks to two factors:

- thin clones have the same data and statistics as production (at a specified point in time), and
- the PostgreSQL planner configuration on clones matches the production configuration.

Joe Bot users not only get reliable and risk-free information on how a query will be executed on production but also they can easily apply any changes to their own thin clones and see how query behavior is affected. For example, it is possible to add a new index and see if it actually helps to speed up the query.

One key aspect of Joe Bot, is the fact that users do not see the data directly, they only work with metadata. Therefore, teams without access to production data can be granted permissions to use this tool [1]

The main change in Joe Bot 0.9.0 is improved security: in past versions, DB superuser was used. Now a non-superuser is used for all requests. This makes it impossible to use plpythonu, COPY TO PROGRAM, FDW, or dblink to perform a massive copy of data outside infrastructructure which is not well protected by a strict firewall. All users are strongly recommended to upgrade as soon as possible.

Another major new feature is the production duration estimator, currently in an “experimental” state. This feature is intended to help users understand how long a specific operation - for example, an index creation operation - will actually take on the production database, which is likely to have a different physical infrastructure (for example a different filesystem, more RAM, and/or more CPU cores) than the thin clone running on the DLE. Read more: [“Query duration difference between Database Lab and production environments”](https://postgres.ai/docs/database-lab/timing-estimator).

SQL Optimization Chatbot “Joe Bot” links:
- [SQL Optimization Chatbot ("Joe Bot") 0.9.0 release notes](https://gitlab.com/postgres-ai/joe/-/releases/0.9.0)
- [Documentation](https://postgres.ai/docs/joe-bot)
- [Tutorial: Start using Joe Bot for PostgreSQL query optimization](https://postgres.ai/docs/tutorials/joe-setup)

---
(1) Although only metadata is returned from Joe Bot, it is possible to probe data for specific values using `EXPLAIN ANALYZE`.  Please consult security experts in your organization before providing Joe Bot to people without production-level access.

---

Both Joe Bot and Database Lab Engine are distributed based on OSI-approved license (AGPLv3).

---

Your feedback is highly appreciated!
- Twitter: [@Database_Lab](https://twitter.com/Database_Lab)
- [Community Slack with Joe Bot live demo](https://slack.postgres.ai) (English), and [Telegram group](https://t.me/databaselabru) (Russian)
- [Database Lab Engine repository](https://gitlab.com/postgres-ai/database-lab), with the [issue tracker](https://gitlab.com/postgres-ai/database-lab/-/issues)
- [SQL Optimization Chatbot repository](https://gitlab.com/postgres-ai/joe), with the [issue tracker](https://gitlab.com/postgres-ai/joe/-/issues)
