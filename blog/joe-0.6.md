---
slug: joe-0-6
author: "Artyom Kartasov"
date: 2020-03-23 10:42:00
linktitle: Joe 0.6.0 supports hypothetical indexes
title: Joe 0.6.0 supports hypothetical indexes
description: Have an index idea for a large table? Get a sneak peek of how SQL plan will look like using Joe's new command, "hypo", that provides support of hypothetical indexes
weight: 0
image: /assets/joe-3-silhouettes.svg
tags:
  - Postgres.ai
  - Joe
  - PostgreSQL
  - release
  - HypoPG
  - EXPLAIN
---

import { AuthorBanner } from '../src/components/AuthorBanner'
import { DbLabBanner } from '../src/components/DbLabBanner'

## Joe's new command `hypo` to further boost development processes

Building indexes for large tables may take a long time. The new release of Joe bot includes the ability to get a sneak peek of the SQL query plan, using [hypothetical indexes](https://hypopg.readthedocs.io/en/latest/), before proceeding to actually building large indexes.

A hypothetical index is an index that doesn't exist on disk. Therefore it doesn't cost IO, CPU, or any resource to create. It means that such indexes are created almost instantly.

With the brand new command, [`hypo`](https://postgres.ai/docs/reference-guides/joe-bot-commands-reference#hypo), you can create hypothetical indexes with Joe and ensure that PostgreSQL would use them. Once it's done, you can use [`exec`](https://postgres.ai/docs/reference-guides/joe-bot-commands-reference#exec) to build the actual indexes (in some cases, you'll need to wait some hours for this) and see the actual plan in action.

Note, since the command works on top of the HypoPG extension, your Database Lab image has to use a Docker image for Postgres that contains HypoPG, because this extension is not a part of the core PostgreSQL distribution. For convenience, [we have prepared images](https://hub.docker.com/r/postgresai/extended-postgres) with HypoPG (and some other extensions) included, for Postgres versions 9.6, 10, 11, and 12. Of course, you can always use your custom image.

To be able to see the plan without actual execution, we have added one more new command: [`plan`](https://postgres.ai/docs/reference-guides/joe-bot-commands-reference#plan). It is aware of hypothetical indexes, so if one is detected in the plan, it presents two versions of the plan, with and without HypoPG involved.

<!--truncate-->

### What's new in version 0.6.0

Version 0.6.0 adds new commands to work with hypothetical indexes and get a query plan without execution, grand improvements in message processing, more. The full list of changes can be found in [Changelog](https://gitlab.com/postgres-ai/joe/-/releases). Stay tuned!


### Demo

![Joe demo](https://gitlab.com/postgres-ai/joe/uploads/6550b22f37b16ebde0c5e2fcc8d184d5/joe0.6.0.gif#center)

First, we need a running Database Lab instance that uses a Docker image with HypoPG extension. Choose a custom Docker image in [Database Lab Engine configuration](https://postgres.ai/docs/reference-guides/database-lab-engine-configuration-reference), specifying `dockerImage` in `config.yml` of your Database Lab instance:

```
...
dockerImage: "postgresai/extended-postgres:12"
...
```

Let's see how to use hypothetical indexes with Joe. Generate a synthetic database using standard PostgreSQL tool called pgbench: 

```
$ pgbench -i -s 10000 test
```

Check the size of tables `\d+`:

```
List of relations
 Schema |       Name       | Type  |  Owner   |  Size   | Description 
--------+------------------+-------+----------+---------+-------------
 public | pgbench_accounts | table | postgres | 171 GB  | 
 public | pgbench_branches | table | postgres | 520 kB  | 
 public | pgbench_history  | table | postgres | 0 bytes | 
 public | pgbench_tellers  | table | postgres | 5960 kB | 
(4 rows)
```

Then, get a query plan that should benefit an index that’s not here:

```
explain select * from pgbench_accounts where bid = 1;
```

The result is:

```
Plan with execution:
 Gather  (cost=1000.00..29605106.00 rows=118320 width=97) (actual time=770.623..3673842.642 rows=100000 loops=1)
   Workers Planned: 2
   Workers Launched: 2
   Buffers: shared hit=64 read=22457314
   ->  Parallel Seq Scan on public.pgbench_accounts  (cost=0.00..29592274.00 rows=49300 width=97) (actual time=748.869..3673654.643 rows=33333 loops=3)
         Filter: (pgbench_accounts.b

Recommendations:
SeqScan is used – Consider adding an index Show details
Query processes too much data to return a relatively small number of rows. – Reduce data cardinality as early as possible during the execution, using one or several of the following techniques: new indexes, partitioning, query rewriting, denormalization. See the visualization of the plan to understand which plan nodes are the main bottlenecks. Show details
Add LIMIT – The number of rows in the result set is too big. Limit number of rows. Show details

Summary:
Time: 61.231 min
  - planning: 0.079 ms
  - execution: 61.231 min
    - I/O read: 0.000 ms
    - I/O write: 0.000 ms

Shared buffers:
  - hits: 64 (~512.00 KiB) from the buffer pool
  - reads: 22457314 (~171.30 GiB) from the OS file cache, including disk I/O
  - dirtied: 0
  - writes: 0
  ```

This query takes an enormously long time. The recommendations suggest adding an index. Before building a real index, let's verify our index idea with instant creation of the corresponding hypothetical index, simply using `hypo create index on pgbench_accounts (bid)`:

```
HypoPG response:
  INDEXRELID |             INDEXNAME              
-------------+------------------------------------
  24588      | <24588>btree_pgbench_accounts_bid  
```

Check that index has been created `hypo desc`:

```
HypoPG response:
  INDEXRELID |             INDEXNAME             | NSPNAME |     RELNAME      | AMNAME  
-------------+-----------------------------------+---------+------------------+---------
  24588      | <24588>btree_pgbench_accounts_bid | public  | pgbench_accounts | btree   
```

Get more details about the index such as estimated size and index definition `hypo desc 24588`:

```
HypoPG response:
  INDEXRELID |             INDEXNAME             |      HYPOPG GET INDEXDEF       | PG SIZE PRETTY  
-------------+-----------------------------------+--------------------------------+-----------------
  24588      | <24588>btree_pgbench_accounts_bid | CREATE INDEX ON                | 1366 MB         
             |                                   | public.pgbench_accounts USING  |                 
             |                                   | btree (bid)                    |         
```

With the consideration that it may be annoying and not really useful to wait seconds (or even minutes) for actual execution when we deal with hypothetical index checks - so let's use  the `plan` command `plan select * from pgbench_accounts where bid = 1;` and save even more time:

Joe's response will be:

```
Plan (HypoPG involved 👻):
Index Scan using <24588>btree_pgbench_accounts_bid on pgbench_accounts  (cost=0.08..5525.68 rows=118320 width=97)
  Index Cond: (bid = 1)

Plan without HypoPG indexes:
Gather  (cost=1000.00..29605106.00 rows=118320 width=97)
  Workers Planned: 2
  ->  Parallel Seq Scan on pgbench_accounts  (cost=0.00..29592274.00 rows=49300 width=97)
        Filter: (bid = 1)
JIT:
  Functions: 2
  Options: Inlining true, Optimization true, Expressions true, Deforming true
```

Perfect! The index works! It means we can reset the hypothetical index `hypo reset` and create the real one `exec create index pgbench_accounts_bid on pgbench_accounts (bid);`:

```
exec create index pgbench_accounts_bid on pgbench_accounts (bid);

Session: joe-bps8quk2n8ejes08vnhg
The query has been executed. Duration: 126.975 min
```

It's obvious that `hypo` and `plan` extremely save developers' time!

See the full list of Joe's commands in the docs: https://postgres.ai/docs/reference-guides/joe-bot-commands-reference.


### Links:

- Open-source repository and issue tracker: https://gitlab.com/postgres-ai/joe/
- Full command list: https://postgres.ai/docs/joe-bot/usage
- Extended images with PostgreSQL: https://hub.docker.com/r/postgresai/extended-postgres Includes HypoPG, pg_hint_plan, more
- Proposals to add more extensions are welcome in the Custom Images repo: https://gitlab.com/postgres-ai/custom-images
- Community Slack (English): https://slack.postgres.ai/. After joining, the live demo is available in the #joe-bot-demo channel: https://database-lab-team.slack.com/archives/CTL5BB30R

<AuthorBanner
  avatarUrl="/assets/author/artyom.jpg"
  name="Artyom Kartasov"
  role="Software Engineer at"
  twitterUrl="https://twitter.com/arkartasov"
  gitlabUrl="https://github.com/agneum"
  githubUrl="https://gitlab.com/akartasov"
/>

<DbLabBanner />
