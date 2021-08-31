---
slug: dblab-0-3
author: "Nikolay Samokhvalov"
date: 2020-03-04 08:02:00
linktitle: "Database Lab Engine 0.3: cloning with LVM"
title: Database Lab Engine 0.3, supports both ZFS and LVM
description: "Database Lab Engine 0.3: now LVM can be used instead of ZFS for thin cloning"
weight: 0
image: /assets/thumbnails/dle-generic-blog.png
tags:
  - Postgres.ai
  - Database Lab
  - PostgreSQL
  - release
---

import { AuthorBanner } from '../src/components/AuthorBanner'
import { DbLabBanner } from '../src/components/DbLabBanner'

## Database Lab 0.3: users can choose which "thin clone manager" to use, ZFS or LVM

*Update: see **[the discussion on Hacker News](https://news.ycombinator.com/item?id=22258806)**!*

Version 0.3 of Database Lab Engine (with a minor update to 0.3.1) adds support of LVM as an alternative to ZFS to enable thin cloning of large databases. This was one of the most requested features after the initial launch of the public Database Lab version a month ago.

Database Lab Engine is an open source technology that helps you clone non-production databases in seconds.

LVM can be chosen as a "thin-clone manager" instead of ZFS for those who do not want to use ZFS and prefer staying on more popular file systems (ext4, xfs) in non-production environments. It is worth noting that ZFS remains the default and recommended option. Postgres.ai team is very satisfied with the experience of using it running Database Labs for multi-terabyte, heavily loaded databases.

Compared to ZFS, the LVM module has a certain restriction: it is not possible to support multiple snapshots and allow choosing the snapshot when requesting a new clone. With LVM, the new clones always are based on the latest state of the database.

We invite everyone to test both modules, join our Community Slack, and provide your feedback! See the links below.

Links:

- [What is Database Lab](https://postgres.ai/docs/database-lab#overview)
- [Database Lab tutorial](https://postgres.ai/docs/tutorials/database-lab-tutorial) (describes both ZFS and LVM options)
- Please support the project giving a GitLab star: https://gitlab.com/postgres-ai/database-lab
- [Join our Community Slack](https://slack.postgres.ai/) to discuss Database Lab and share your feedback with us
- [Source code and issue tracker](https://gitlab.com/postgres-ai/database-lab)
- [Changelog and release notes](https://gitlab.com/postgres-ai/database-lab/-/blob/master/CHANGELOG.md)

<!--truncate-->

<AuthorBanner
  avatarUrl="/assets/author/nik.jpg"
  name="Nikolay Samokhvalov"
  role="CEO & Founder of"
  twitterUrl="https://twitter.com/samokhvalov"
  gitlabUrl="https://gitlab.com/NikolayS"
  githubUrl="https://github.com/NikolayS"
  linkedinUrl="https://www.linkedin.com/in/samokhvalov"
  note="Working on tools to balance Dev with Ops in DevOps"
/>

<DbLabBanner />
