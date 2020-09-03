---
title: Database Lab Engine
sidebar_label: Overview
hide_title: false
---

<img src="/docs/assets/database-lab/dblab.png" width="256" align="right" vspace="20" hspace="20" />


## Guides

- [Start using Database Lab](/docs/tutorials/engine-setup)
- [Start using Database Lab with AWS RDS](/docs/tutorials/engine-setup-rds)


## References

- [API reference](/docs/database-lab/api-reference)
- [CLI reference](/docs/database-lab/cli-reference)
- [Configuration reference](/docs/database-lab/config-reference)


## Overview

**Database Lab** – the core component based on which powerful, state-of-the-art development and testing environments are built. It is based on a simple idea: with modern thin cloning technologies, it becomes possible to iterate 100x faster in development and testing. It is extremely helpful for larger companies that want to achieve high development velocity and the most competitive "time to market" characteristics.

Database Lab aims to speed up software development in fast-growing organizations that use large PostgreSQL databases. It is achieved by enabling extremely fast and low-budget cloning of large databases.

As an example, the cloning of 10 TiB PostgreSQL database takes less than 2 seconds. Moreover, such cloning (called "thin cloning") does not increase budgets: on a single mid-size machine with a single physical copy of the database, it is possible to run dozens of thin clones simultaneously.

For any rapidly developing business, excellent production health requires powerful non-production environments. With Database Lab, provisioning of multi-terabyte database clones doesn't imply much waiting time or extra budgets spent anymore. Such cloning takes just a couple of seconds, regardless of the database size. Developers, DBAs, and QA engineers can quickly get fully independent copies, perform testing, and idea verification obtaining reliable (close to production) results. As a result, development speed and quality significantly increase.

Database Lab allows superfast cloning of large databases to solve the following problems:

- help build independent development and testing environments involving full-size database without extra time and money spending,
- provide temporary full-size database clones for SQL query optimization (see also: [Joe bot](https://postgres.ai/products/joe/), which works on top of Database Lab),
- help verify database migrations (DB schema changes) and massive data operations.


## Features

- Works well both on premise and in clouds.
- Thin provisioning in seconds thanks to copy-on-write (CoW) provided by [ZFS](https://en.wikipedia.org/wiki/ZFS) and special methodology of preparing PostgreSQL database snapshots. There is also an option to use [LVM](https://en.wikipedia.org/wiki/Logical_Volume_Manager_(Linux)) instead of ZFS.
- Unlimited size of databases (Postgres database size [is unlimited](https://www.postgresql.org/docs/current/limits.html), ZFS volume can be up to 21^28 bytes, or [256 trillion yobibytes](https://en.wikipedia.org/wiki/ZFS)).
- Supports PostgreSQL 9.6, 10, 11, and 12.
- Thin cloning takes only a few seconds, regardless of the database size.
- REST API.
- Client CLI.
- Automated deletion of clones after specified amount of minutes of inactivity (configurable).
- Protection from deletion, to disable automated and accidental deletions.
- Continuously updated original copy of data is supported.
- Multiple snapshots to allow provisioning of various versions of the database.
- Custom PostgreSQL Docker images to work with extended PostgreSQL setups (extensions, additional tools, or even modified PostgreSQL engine).


## More

- [Repository](https://gitlab.com/postgres-ai/database-lab)
- [Issue tracker](https://gitlab.com/postgres-ai/database-lab/issues) (for bugs reports, feature proposals)
- [Slack (English)](https://database-lab-team-slack-invite.herokuapp.com/)
- [Telegram (Russian)](https://t.me/databaselabru)

