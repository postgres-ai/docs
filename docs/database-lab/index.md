---
title: Database Lab Engine
sidebar_label: Overview
hide_title: false
slug: /database-lab
---

import useBaseUrl from '@docusaurus/useBaseUrl';

<img src={useBaseUrl('assets/database-lab/dblab.png')} width="256" align="right" vspace="20" hspace="20" />

## Tutorials
- [Database Lab tutorial for Amazon RDS Postgres](/docs/tutorials/database-lab-tutorial-amazon-rds)
- [Database Lab tutorial for any PostgreSQL database](/docs/tutorials/database-lab-tutorial)

## References
- [CLI reference](/docs/database-lab/cli-reference)
- [API reference](/docs/database-lab/api-reference)
- [Configuration reference](/docs/database-lab/config-reference)

# User Guides
- [How to create Database Lab clones](/docs/guides/cloning/create-clone)
- [How to connect to Database Lab clones](/docs/guides/cloning/connect-clone)
- [How to reset Database Lab clone](/docs/guides/cloning/reset-clone)
- [How to destroy Database Lab clone](/docs/guides/cloning/destroy-clone)
- [Protect clones from manual and automatic deletion](/docs/guides/cloning/clone-protection)
- [How to install and initialize Database Lab CLI](/docs/guides/cli/cli-install-init)

## Overview
**Database Lab Engine** – an open-source technology which is a core component of the Database Lab Platform. It is used to build powerful, state-of-the-art development and testing environments, based on a simple idea: with modern thin cloning technologies, it becomes possible to iterate 100x faster in development and testing. It is extremely helpful for larger or small but very agile teams that want to achieve high development velocity and the most competitive "time to market" characteristics, and save budgets on non-production infrastructure.

**Database Lab Platform** is a paid SaaS offering developed and maintained by [Postgres.ai](https://Postgres.ai). It provides GUI, user management, permissions control, token management, more.

## Database Lab Engine
Database Lab Engine is distributed under AGPL v3 license. Repositories:
- GitLab: https://gitlab.com/postgres-ai/database-lab,
- GitHub https://github.com/postgres-ai/database-lab (mirror).

>Database Lab Engine is hosted and developed on GitLab.com. Why? GitLab Inc. is our (Postgres.ai) long-term client and early adopter (see [GitLab Development Docs](https://docs.gitlab.com/ee/development/understanding_explain_plans.html#database-lab)). GitLab has an open-source version. Last but not least: GitLab uses PostgreSQL.<br/><br/>
>However, nowadays, not many open-source projects are hosted at GitLab.com unfortunately.<br/> ⭐️ Please support the project giving a star on GitLab! It's on [the main page of the Database Lab Engine repository](https://gitlab.com/postgres-ai/database-lab), at the upper right corner:
>
>![Add a GitLab star](/assets/star.gif)

However, nowadays, not many open-source projects are hosted at GitLab.com unfortunately. Please support the project giving a GitLab star! It's on [the main page](https://gitlab.com/postgres-ai/database-lab), at the upper right corner:

Database Lab Engine provides the server with API, and client CLI, with basic single-user authentication.

As an example, cloning of 10 TiB PostgreSQL database takes less than 2 seconds when a single user is using the Database Lab Engine instance, and up to 30 seconds when 15 users are working with it at the same time. Moreover, such cloning (called "thin cloning") does not increase budgets: on a single mid-size machine with a single physical copy of the database, it is possible to run dozens of thin clones simultaneously.

Thin cloning is possible thanks to [copy-on-write](https://en.wikipedia.org/wiki/Copy-on-write) capabilities provided by either [ZFS filesystem](https://en.wikipedia.org/wiki/ZFS) or [LVM2](https://en.wikipedia.org/wiki/Logical_Volume_Manager_(Linux)) (other options such as hardware-based support of thin cloning are possible to develop thanks to modular and open architecture of Database Lab Engine).

Some problems that can be solved by using Database Lab:

- help build independent development and testing environments involving full-size database without extra time and money spending,
- provide temporary full-size database clones for SQL query optimization (see also: [Joe bot](https://postgres.ai/products/joe/), which works on top of Database Lab),
- help verify database migrations (DB schema changes) and massive data operations.

### Features

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

### More
- [Repository](https://gitlab.com/postgres-ai/database-lab)
- [Issue tracker](https://gitlab.com/postgres-ai/database-lab/issues) (for bugs reports, feature proposals)
- [Slack (English)](https://database-lab-team-slack-invite.herokuapp.com/)
- [Telegram (Russian)](https://t.me/databaselabru)

## 👋 Database Lab "Private Beta" program
Database Lab Platform (SaaS) is currently in a "private beta" mode, being tested by several hundred engineers. Want to become an early adopter? Join Database Lab by Postgres.ai "Private Beta" program today: https://postgres.ai/console/.
