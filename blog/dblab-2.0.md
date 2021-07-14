---
slug: dblab-2-0-beta
author: "Nikolay Samokhvalov"
authorimg: /assets/author/nik.jpg
date: 2020-09-18 18:12:00
linktitle: "Database Lab Engine 2.0 beta: one config to rule them all; support for Amazon RDS"
title: "Database Lab Engine 2.0 beta: one config to rule them all; support for Amazon RDS"
description: "Database Lab Engine now has a single config, supports both physical and logical initialization, and works with Amazon RDS"
weight: 0
image: /assets/thumbnails/dle-generic-blog.png
tags:
  - Postgres.ai
  - Database Lab Engine
  - PostgreSQL
  - beta
---

## Database Lab Engine 2.0 beta: one config to rule them all; support for Amazon RDS

During this Summer, we were super-busy achieving two goals that defined version 2.0 of Database Lab Engine:

1. Make all the things in Database Lab configurable in a unified manner (single configuration file): first of all, data initialization and snapshot management.
1. Support both physical and logical types of initialization. Particularly, allow working with an RDS database as a source.

Both targets happened to be quite challenging, but it is finally done, and now we are happy to see that all the pieces of Database Lab Engine work in containers, the whole workflow is described in a single YAML configuration file, and, last but not least, it works with RDS Postgres databases. Yay!

Check out [Database Lab Engine release notes](https://gitlab.com/postgres-ai/database-lab/-/releases), [Tutorial for RDS users](https://postgres.ai/docs/tutorials/database-lab-tutorial-amazon-rds), and [Database Lab Engine configuration reference](https://postgres.ai/docs/reference-guides/database-lab-engine-configuration-reference).

As usual, please send us any feedback you have; it is hard to overestimate its meaning for such a young project:

- Follow us on Twitter: [@Database_Lab](https://twitter.com/Database_Lab) (recently created!).
- [Community Slack (English)](https://slack.postgres.ai/), and [Telegram group (Russian)](https://t.me/databaselabru).
- Intercom widget (located at right bottom corner).

*[Database Lab Engine](https://gitlab.com/postgres-ai/database-lab) is open-source software distributed under OSI-approved [AGPLv3 license](https://opensource.org/licenses/AGPL-3.0). Database Lab Engine allows to clone PostgreSQL databases of any size in just a few seconds. This can save you a lot of money for development and testing infrastructure, and at the same time, drastically improve development quality and time-to-market.*

*The open-source Database Lab Engine is equipped with convenient API and CLI. Additionally, we continue developing the Enterprise version that offers GUI, authentication flexibility, and user management for Database Lab Engine API and CLI, more. The Enterprise version is in the "private beta" mode; we encourage you to [sign up and request a demo](https://postgres.ai/console/).*
