---
author: "Nikolay Samokhvalov"
authorimg: /assets/author/nik.jpg
date: 2020-01-28 14:15:00
linktitle: The first public release of Database Lab Engine
title: The first public release of Database Lab Engine
description: Postgres.ai team is proud to announce the very first public release of Database Lab Engine
weight: 0
image: /assets/thumbnails/dle-generic-blog.png
tags:
  - Postgres.ai
  - Database lab
  - PostgreSQL
  - release
---

## Postgres.ai team is proud to announce the very first public release of Database Lab Engine

*Update: see **[the discussion on Hacker News](https://news.ycombinator.com/item?id=22258806)**!*

Database Lab Engine helps you build non-production environments for projects that use multi-terabyte Postgres databases. Initially obtained using standard "thick" copying (such as pg_basebackup, restoration from an archive, or dump/restore), Postgres data directory then gets cloned on request. Such cloning takes just a couple of seconds. Developers, DBAs, and QA engineers can quickly get fully independent copies, perform testing, and idea verification obtaining reliable (close to production) results. As a result, development speed and quality significantly increase.

Database Lab Engine is open source, you can find the code, ongoing work, and the Issue tracker here: https://gitlab.com/postgres-ai/database-lab.

Here is the list of some tasks that Database Lab Engine can help solve:
  
1. Troubleshoot an SQL query (run `EXPLAIN`, `EXPLAIN (BUFFERS, ANALYZE)`): with query planner settings matching production, one can check any query, including `UPDATE`, `DELETE`, `INSERT`, `TRUNCATE`, not putting production master into any risks. See also: [Joe bot](/products/joe).
1. Verify an index idea: it is easy to create an index and check if it helps optimize your queries.
1. Check database migrations (DB schema changes) or massive data modifications and highlight potentially dangerous steps, to avoid performance degradation and downtime on production.  

A single Database Lab instance can provide multiple thin Postgres clones (full-size and fully independent) simultaneously. It becomes possible thanks to copy-on-write (CoW) technology. The only option supported in version 0.1 is ZFS; however, there are plans to support other technologies in the future.

Database Lab can be installed either on a physical machine or a VM. Both on-premise or cloud setups are possible. Users communicate with Database Lab using either REST API or client CLI. The first version of Database Lab has certain limitations:

- it works on Ubuntu 18.04 only,
- only Postgres versions 9.6, 10, 11, and 12 are supported,
- in addition to ZFS, the installation of Postgres and Golang is required (it is planned to get rid of this requirement in version 0.2, fully switching to containers).

Links:

- [Database Lab tutorial](/docs/tutorials/database-lab-tutorial)
- Please support the project giving a GitLab star: https://gitlab.com/postgres-ai/database-lab
- [Join our Slack](https://database-lab-team-slack-invite.herokuapp.com/) to discuss Database Lab and share your feedback with us
- [Source code and issue tracker](https://gitlab.com/postgres-ai/database-lab)
- [Release notes](https://gitlab.com/postgres-ai/database-lab/-/releases)
