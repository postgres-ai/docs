---
slug: dle-2-0-release
author: 'Anatoly Stansler'
date: 2020-11-11 11:20:20
publishDate: 2020-11-10 11:20:20
linktitle: 'Database Lab Engine 2.0'
title: 'Database Lab Engine 2.0'
description: 'Database Lab Engine 2.0 released: automated physical and logical initialization, Amazon RDS PostgreSQL support, basic data transformation and masking'
weight: 0
image: /assets/thumbnails/dle-2.0-blog.png
tags:
  - Product announcements
  - Postgres.ai
  - Database Lab Engine
  - PostgreSQL
  - testing environment for Amazon RDS PostgreSQL
  - thin PostgreSQL clones
---

import { BlogFooter } from '@site/src/components/BlogFooter'
import { anatoly } from '@site/src/config/authors'

## Database Lab Engine 2.0 for PostgreSQL released

The Postgres.ai team is proud to announce version 2.0 of Database Lab Engine (DLE) for PostgreSQL, a modern database tool for building powerful development and testing environments based on [thin cloning](https://postgres.ai/docs/questions-and-answers#what-is-thin-cloning-thin-vs-thick-clones). Using Database Lab API or CLI (and if you are using Database Lab SaaS, GUI), on a single machine with, say, a 1 TiB disk, you can easily create and destroy dozens of database copies of size 1 TiB each. All these copies are independently modifiable and created/destroyed in just a few seconds. This can become a game-changer in your development and testing workflow, improving time-to-market, and reducing costs of your non-production infrastructure.

This release continues our strategy to automate all routine tasks such as initialization of the PostgreSQL data directory, data transformation, and snapshot management. In DLE 2.0, all these tasks can be flexibly configured in a single configuration file. As a result, building dev&test environments for projects with many databases (such as those that adopted microservice architecture) becomes much easier.

The previous versions of the Database Lab introduced the core technology: thin clone provisioning, based on either [ZFS](https://en.wikipedia.org/wiki/ZFS) (default) or [LVM](<https://en.wikipedia.org/wiki/Logical_Volume_Manager_(Linux)>). It was already possible to provision full-sized multi-terabyte database clones in just a few seconds and use them for a broad spectrum of tasks such as database schema changes verification, SQL query analysis, or general application testing.

Version 2.0 speeds up and empowers the initialization of DLE itself. Instead of using custom scripts for initial and continuous data retrieval, it is now possible to configure everything in a declarative manner to get the data and be up and running.

<!--truncate-->

## Updates in DLE 2.0

- Automated data retrieval: specify the source and the method of initializing the data directory and how it is to be updated
- Both physical (pg_basebackup, WAL-G, more) and logical methods (dump/restore, Amazon RDS, Heroku Postgres, more) are supported (see the guide [Database Lab Engine data sources](https://postgres.ai/docs/how-to-guides/administration/data))
- Any managed cloud PostgreSQL offering is now supported, with additional features for Amazon RDS (see [DLE tutorial for Amazon RDS](https://postgres.ai/docs/tutorials/database-lab-tutorial-amazon-rds) and the guide [Data source: AWS RDS](https://postgres.ai/docs/how-to-guides/administration/data/rds))
- For continuously updated physically initialized data directory (which effectively makes your DLE a specialized replica), snapshot management is fully automated: snapshots are created and destroyed based on the schedule defined in the configuration file (see the reference [Job physicalSnapshot](https://postgres.ai/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalsnapshot))
- Basic data transformation and masking supported: specify any custom script that will be applied each time a new snapshot is prepared (option `preprocessingScript` in both `logicalSnapshot` and `physicalSnapshot` jobs, see the [Configuration reference](https://postgres.ai/docs/reference-guides/database-lab-engine-configuration-reference))
- License changed to [AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html)
- The documentation is significantly extended: 3 tutorials, 26 user guides, 6 references, and counting: [http://postgres.ai/docs](http://postgres.ai/docs)

## What's next

Check out:

- [Database Lab Engine 2.0 release notes](https://gitlab.com/postgres-ai/database-lab/-/releases/2.0.0)
- [Tutorial for RDS users](https://postgres.ai/docs/tutorials/database-lab-tutorial-amazon-rds)
- [Database Lab tutorial for any PostgreSQL database](https://postgres.ai/docs/tutorials/database-lab-tutorial)
- [Database Lab Engine configuration reference](https://postgres.ai/docs/reference-guides/database-lab-engine-configuration-reference)

Please send us any feedback you have – it is hard to overestimate its meaning for such a young project:

- Follow us on Twitter: [@Database_Lab](https://twitter.com/Database_Lab)
- [Community Slack (English)](https://slack.postgres.ai/), and [Telegram group (Russian)](https://t.me/databaselabru)
- Database Lab Engine repository, with the issue tracker: https://gitlab.com/postgres-ai/database-lab

_[Database Lab Engine](https://gitlab.com/postgres-ai/database-lab) allows cloning PostgreSQL databases of any size in just a few seconds. This can save a lot of money for development and testing infrastructure, and at the same time, drastically improve development quality and time-to-market. Database Lab Engine is open-source software distributed under OSI-approved [AGPLv3 license](https://opensource.org/licenses/AGPL-3.0)._

_Database Lab Engine is equipped with API and CLI. Additionally, we at Postgres.ai continue developing the Enterprise version that offers GUI, authentication flexibility, and user management for Database Lab Engine API and CLI, more. The Enterprise version is in the "private beta" mode; we encourage you to [sign up and request a demo](https://postgres.ai/console/)._

<BlogFooter author={anatoly} />
