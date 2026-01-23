---
author: "Nikolay Samokhvalov"
date: 2022-04-05 23:16:17
publishDate: 2022-04-05 23:16:17
linktitle: "DLE 3.1: pgBackRest, timezones for CLI, DLE community"
title: "DLE 3.1: pgBackRest, timezones for CLI, DLE community"
description: "DLE 3.1 brings pgBackRest support, timezone configuration for CLI, and improved community resources."
weight: 0
image: /assets/thumbnails/dle-3.1-blog.png
tags:
  - Product announcements
  - Database Lab Engine
---

import { BlogFooter } from '@site/src/components/BlogFooter'
import { nik } from '@site/src/config/authors'

The Postgres.ai team is happy to announce the release of version 3.1 of [Database Lab Engine (DLE)](https://github.com/postgres-ai/database-lab), the most advanced open-source software ever released that empowers development, testing, and troubleshooting environments for fast-growing projects. The use of Database Lab Engine 3.1 provides a competitive advantage to companies via implementing the "Shift-left testing" approach in software development.

Database Lab Engine is an open-source technology that enables thin cloning for PostgreSQL. Thin clones are exceptionally useful when you need to scale the development process. DLE can manage dozens of independent clones of your database on a single machine, so each engineer or automation process works with their own database provisioned in seconds without extra costs.

<!--truncate-->

In this release, the development team has also focused on the Database Lab Engine community, making it easier to get help or contribute. The team greets all new contributors: [@Nikolay Devxx](https://gitlab.com/ndevxx), [@asotolongo](https://gitlab.com/asotolongo), [@Tanya301](https://github.com/Tanya301), [@denis-boost](https://github.com/denis-boost), [@pietervincken](https://github.com/pietervincken), [@ane4ka](https://github.com/ane4ka)

:::caution
Action required to migrate from a previous version. If you are running DLE 3.0 or older, to upgrade to DLE 3.1, please read the [Migration notes](https://gitlab.com/postgres-ai/database-lab/-/releases/v3.1.0#migration-notes).
:::

In DLE 3.1:
- Native support for pgBackRest as a tool to restore data from archives (physical mode, including continuously updated state), in addition to the existing support of WAL-G
- Allow configuring timezone in DLE CLI configuration to improve the experience of using DLE in CI/CD pipelines
- Improved [README.md](https://github.com/postgres-ai/database-lab-engine/blob/master/README.md), translated to four languages, added [CONTRIBUTING.md](https://github.com/postgres-ai/database-lab-engine/blob/master/CONTRIBUTING.md), [SECURITY.md](https://github.com/postgres-ai/database-lab-engine/blob/master/SECURITY.md), and [CODE_OF_CONDUCT.md](https://github.com/postgres-ai/database-lab-engine/blob/master/CODE_OF_CONDUCT.md)
- Many improvements in the engine and UI to improve work both in logical and physical modes

Community news:
- 🌠 DLE repository on GitHub now has 1,100+ stars; many thanks to everyone who supports the project in any way
- 💥 Pieter Vincken has published a blog post describing their experience of using DLE: [\"Testing with production data made easy\"](https://ordina-jworks.github.io/cloud/2022/02/14/postgres-ai.html)
- 📈 The Twitter account has reached 400 followers – please follow [@Database_Lab](https://twitter.com/Database_Lab)
- 🎉 DLE now has 15 contributors. More contributions are welcome! See [\"good first issues\"](https://gitlab.com/postgres-ai/database-lab/-/issues?sort=created_date&state=opened&label_name%5B%5D=good+first+issue)
- 🥇 Please consider various ways to contribute – read [CONTRIBUTING.md](https://github.com/postgres-ai/database-lab-engine/blob/master/CONTRIBUTING.md)

## What's new

### pgBackRest support

DLE 3.1 adds native support for pgBackRest as a data source. This means you can now use pgBackRest archives to initialize thin clones, in addition to the existing WAL-G support.

### Timezone configuration for CLI

You can now configure timezone settings in the DLE CLI configuration, which improves the experience when using DLE in CI/CD pipelines across different time zones.

### Community improvements

This release includes significant improvements to community resources:
- Enhanced README.md with translations in four languages
- Added comprehensive CONTRIBUTING.md guidelines
- New SECURITY.md for reporting security issues
- CODE_OF_CONDUCT.md to ensure a welcoming community environment

### Engine and UI improvements

Many improvements have been made to both the engine and UI to enhance the experience in both logical and physical modes of operation.

## Migration notes

If you are running DLE 3.0 or older, please read the full [Migration notes](https://gitlab.com/postgres-ai/database-lab/-/releases/v3.1.0#migration-notes) before upgrading to DLE 3.1.

## Get started

To get started with Database Lab Engine 3.1:
1. Check out the [installation guide](https://postgres.ai/docs/database-lab/getting-started)
2. Join our [community Slack](https://postgres.ai/community)
3. Follow [@Database_Lab](https://twitter.com/Database_Lab) on Twitter for updates

<BlogFooter author={nik} />