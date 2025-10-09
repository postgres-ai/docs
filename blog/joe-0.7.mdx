---
slug: joe-0-7
author: 'Artyom Kartasov'
date: 2020-05-18 11:16:00
linktitle: 'Joe 0.7.0: Web UI, Channel Mapping, and new commands'
title: 'Joe 0.7.0 released! New in this release: Web UI, Channel Mapping, and new commands'
description: Secure and performant Web UI brings more flexibility, 1:1 communication, and visualization options
weight: 0
image: /assets/joe-3-silhouettes.svg
tags:
  - Product announcements
  - Postgres.ai
  - Joe
  - PostgreSQL
  - release
  - WebUI
---

import { BlogFooter } from '@site/src/components/BlogFooter'
import { artyom } from '@site/src/config/authors'

In addition to Slack integration, Joe Bot can be now integrated with [Postgres.ai Platform](https://postgres.ai/docs/platform), providing convenient Web UI for all developers who want to troubleshoot and optimize SQL efficiently. Secure and performant Web UI works in any modern browser (even mobile!) and brings more flexibility, 1:1 communication, and visualization options.

## What's new in version 0.7.0

- \[EE\] Support Web UI integration with Postgres.ai Platform (see our updated [Joe Bot Tutorial](https://postgres.ai/docs/tutorials/joe-setup) to integrate)
- Extendable communication types: implement support for your favorite messenger
- Channel Mapping: plug-in as many databases as you want in one Database Lab instance
- [EE] Support multiple Database Lab instances in parallel
- New commands to monitor current activity and terminate long-lasting queries
- Flexible Bot configuration: various convenient options are available in one place
- Permalinks: when integrated with Postgres.ai Platform, Joe responses contain links to a detailed analysis of SQL execution plans, with three visualization options (FlameGraphs, PEV2 by Dalibo, and good old "explain.depesz.com", all embedded to the Platform)

The full list of changes can be found in [Changelog](https://gitlab.com/postgres-ai/joe/-/releases). Can't wait to try!

<!--truncate-->

### Web UI communication type

Originally, only the Slack version of Joe Bot was publicly available. Today, we are excited to announce that there are two available types of communication with Joe:

- Web UI powered by [Postgres.ai Platform](https://postgres.ai/console),
- Slack.

The good news is that you can use both of them in parallel.

Thanks to recent refactoring of Joe codebase, and the fact that this codebase is open-source, you can develop and add support for any messenger. Feel free to open issues to discuss the implementation and merge requests to include the code into the main Joe Bot repository. See also: [communication channels issues](https://gitlab.com/postgres-ai/joe/-/issues?label_name%5B%5D=Communication+channel), and discussions in our [Community Slack](https://slack.postgres.ai/).

Check [Platform Overview](https://postgres.ai/docs/platform) to discover all advantages of using Web UI working on Postgres.ai Platform.

Joe Bot Tutorial was adjusted and now explains setting up both Slack and Web UI versions: https://postgres.ai/docs/tutorials/joe-setup.

> 🚀 Note that currently, [Postgres.ai Platform](https://postgres.ai) is working in "Closed Beta" mode. During this period, we activate accounts on Postgres.ai only after a 30-minute video call with a demo session and screen sharing. Feel free to join [https://postgres.ai](https://postgres.ai) using our Google/GitLab/GitHub/LinkedIn account but allow some time while we process your registration and reach you to organize a demo session.

### Channel Mapping

Often the infrastructure doesn't limit by a single database. In addition, we want to work with different kinds of communication types. Someone is comfortable with Slack, whereas someone prefers Web UI.

Does it mean that we have to run multiple Joe instances? Starting with version 0.7.0 the answer is no.

Thanks to Channel Mapping you can easily use multiple databases and communication types. Moreover, you can configure multiple Database Lab instances in Enterprise Edition.

Check all configuration options in [the docs](https://postgres.ai/docs/reference-guides/joe-bot-configuration-reference) to realize how the channel mapping can be implemented.

### New commands: `activity` and `terminate`

Imagine, we have a PostgreSQL database `\d+`:

```
List of relations
 Schema |       Name       | Type  |  Owner   |  Size   | Description
--------+------------------+-------+----------+---------+-------------
 public | pgbench_accounts | table | postgres | 171 GB  |
 public | pgbench_branches | table | postgres | 624 kB  |
 public | pgbench_history  | table | postgres | 512 kB  |
 public | pgbench_tellers  | table | postgres | 6616 kB |
 (4 rows)
```

We are running a query and realizing that it will take for a long time:

```
explain select from pgbench_accounts where bid = 100;

Plan without execution:

Gather  (cost=1000.00..29605361.74 rows=118321 width=0)
  Workers Planned: 2
  ->  Parallel Seq Scan on pgbench_accounts  (cost=0.00..29592529.64 rows=49300 width=0)
        Filter: (bid = 100)
JIT:
  Functions: 3
  Options: Inlining true, Optimization true, Expressions true, Deforming true
```

What can we do if we don't want to waste our time? Version 0.7.0 adds new commands to control running queries.

The `activity` command shows currently running sessions in Postgres for following states: `active`, `idle in transaction`, `disabled`.
We can easily discover the current clone activity using this command:

```
Activity response:
  PID |             QUERY              | STATE  |  BACKEND TYPE   |  WAIT EVENT  | WAIT EVENT TYPE | QUERY DURATION  | STATE CHANGED AGO
------+--------------------------------+--------+-----------------+--------------+-----------------+-----------------+--------------------
  20  | EXPLAIN (ANALYZE, COSTS,       | active | client backend  | DataFileRead | IO              | 00:10:06.738739 | 00:10:06.738783
      | VERBOSE, BUFFERS, FORMAT JSON) |        |                 |              |                 |                 |
      | select from pgbench_accounts   |        |                 |              |                 |                 |
      | where bid = 100...             |        |                 |              |                 |                 |
  29  | EXPLAIN (ANALYZE, COSTS,       | active | parallel worker | DataFileRead | IO              | 00:10:06.738798 | 00:10:06.698513
      | VERBOSE, BUFFERS, FORMAT JSON) |        |                 |              |                 |                 |
      | select from pgbench_accounts   |        |                 |              |                 |                 |
      | where bid = 100...             |        |                 |              |                 |                 |
  28  | EXPLAIN (ANALYZE, COSTS,       | active | parallel worker | DataFileRead | IO              | 00:10:06.738807 | 00:10:06.705874
      | VERBOSE, BUFFERS, FORMAT JSON) |        |                 |              |                 |                 |
      | select from pgbench_accounts   |        |                 |              |                 |                 |
      | where bid = 100...             |        |                 |
```

It shows we have a long-lasting query. So, in case if we don't want to wait when it finishes, a new `terminate` command will help us with this. The command terminates Postgres backend that has the specified PID. As we can see above, the client backend process has PID `20`. Therefore, let's run `terminate 20`:

```
Terminate response:
  PG TERMINATE BACKEND
------------------------
  true
```

Success. Then repeat the command `activity`:

```
Activity response:
No results.
```

Also, we can notice that the previously running command has been stopped:

```
explain select from pgbench_accounts where bid = 100;

ERROR: FATAL: terminating connection due to administrator command (SQLSTATE 57P01)
```

That's a very powerful tool!

See the full list of Joe's commands in [the docs](https://postgres.ai/docs/reference-guides/joe-bot-commands-reference).

## Links:

- Open-source repository and issue tracker: https://gitlab.com/postgres-ai/joe
- Full command list: https://postgres.ai/docs/reference-guides/joe-bot-commands-reference
- Configuration options: https://postgres.ai/docs/reference-guides/joe-bot-configuration-reference
- Joe Bot Tutorial: https://postgres.ai/docs/tutorials/joe-setup
- Community Slack (English): https://slack.postgres.ai/. After joining, the live demo is available in the #joe-bot-demo channel: https://database-lab-team.slack.com/archives/CTL5BB30R

<BlogFooter author={artyom} />
