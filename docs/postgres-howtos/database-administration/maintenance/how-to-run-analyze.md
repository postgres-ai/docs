---
title: How to run ANALYZE (to collect statistics)
sidebar_label: run ANALYZE (to collect statistics)
description: Learn how to how to run analyze (to collect statistics)
keywords:
  - postgresql
  - analyze
  - collect
  - statistics)
  - intermediate
tags:
  - intermediate
  - analyze
  - statistics
  - query-planning
  - maintenance
  - performance
difficulty: intermediate
estimated_time: 5 min
---

The command `ANALYZE` collects statistics about a database ([docs](https://www.postgresql.org/docs/current/sql-analyze.html)). Maintaining fresh statistics is crucial for achieving good database performance.

Running it is trivial:
```sql
analyze;
```

However, this, being single-threaded, can take a lot of time.

## How to run ANALYZE at full speed
To utilize multiple CPU cores, we can use client program `vacuumdb` with option `--analyze-only` and multiple workers ([docs](https://www.postgresql.org/docs/current/app-vacuumdb.html)).

The following runs `ANALYZE` on *all* databases (`--all`; might be not supported in case of managed Postgres such as RDS), using the number of workers matching the number of vCPUs, and limiting overall duration by 2 hours (connection options like `-h`, `-U` are not shown here):
```shell
{  
    while IFS= read -r line; do  
        echo "$(date '+%Y-%m-%d %H:%M:%S') $line"  
    done  
} < <(
  PGOPTIONS='-c statement_timeout=2h' \
    vacuumdb \
      --analyze-only \
      --all \
      --jobs $JOBS \
      --echo
) | tee -a analyze_all_$(date +%Y%m%d).log
```

With this snippet, all the commands are going to be also printed and logged, with a timestamps (alternatively, instead of the `while`, one could use `ts` from `moreutils`).

The number of jobs, `$JOBS`, should be chosen taking into account the number of vCPUs the server has. For example, if we want to go with the full speed, it makes sense to match the number of vCPUs on the server. The client machine can be "good enough" (it makes sense to double-check the client machine for CPU and disk IO saturation, to ensure that it's not a bottleneck). Note that if there are large unpartitioned tables, at some point, only a few workers may remain active. A solution to this problem can be partitioning: with many smaller partitions, it can allow all workers to remain busy, which can speed up the whole operation drastically on machines with a high number of CPU cores.

It is highly recommended to run this on a reliable client machine close to server, or right on the server itself, in a `tmux` session, so external network interruptions wouldn't affect the process.

Important: for partitioned table, it is known that `vacuumdb --analyze-only` doesn't update statistics for partitioned tables (parent tables), it only takes care of partitions ([discussion](https://www.postgresql.org/message-id/ZyQgY_ErJszSZTNq%40momjian.us)). However, good news is that this has chances to be fixed in PG19 ([commitfest entry](https://commitfest.postgresql.org/patch/5871/)). Meanwhile, to have parallel gathering of stats for partitioned tables, we need to stick to a single-threaded `ANALYZE` (which will process all partitions one by one, but it will take care of parent table too), or we need another parallelization approach. // TODO: describe alternative approach

## On overhead
Of course, under certain circumstances, this process may take significant time and utilize lots of resources (CPU, disk):
- if database is large,
- if has many options,
- if `default_statistics_target` is increased from default 100 (say, to 1000).


## Running after bulk data load
It is crucial to run `ANALYZE` after initial data load to a table, or when content of table changes significantly. Two additional considerations here:
- yes, it is autovacuum's job to run it, but it may take significant time, depending on the settings and workers available, for autovacuum to be triggered; during this time, we may have suboptimal performance;
- in this particular case, it is also worth running `VACUUM` – thus, either `VACUUM VERBOSE ANALYZE <tablename>;` or `vacuumdb` with the `--analyze` option (without suffix `-only` it is going to apply both `VACUUM` and `ANALYZE`).

## Major upgrade
It is *CRUCIAL* to have `ANALYZE` as a mandatory post-upgrade step. It is not automated, as of 2024:
- `pg_upgrade` doesn't run it
- major cloud providers, don't automate as well (checked: AWS RDS, GCP CloudSQL, Azure).

This leads to numerous cases when people forget about this crucial step, ending up having critical database incidents on the very first busy day after the upgrade (usually, Mondays).

It is highly recommended including this step in your automation.

## On `--analyze-in-stages`
The option `--analyze-in-stages` runs  three stages of analyze; the first stage uses the lowest possible `default_statistics_target` to produce usable statistics ASAP, and subsequent stages build the full statistics ([docs](https://www.postgresql.org/docs/current/app-vacuumdb.html)).

Often, there is a little value in running `--analyze-in-stages` in OLTP cases (web, mobile apps). Consider two options:
1. In-place upgrades. In this case, we have a downtime window of few minutes allocated already, to run `pg_upgrade --links`. And in most cases, `ANALYZE` (with full processing), being executed using multiple workers (via `vacuumdb`), doesn't increase it too much. Opening the gates too early, without statistics, usually leads to suboptimal performance and even unexpected downtime, because lack of proper statistics is harmful for performance. The idea to start processing traffic with "weak" statistics can lead to such incidents. So it is recommended to have a single iteration of `ANALYZE`, during the maintenance window, right after running `pg_upgrade`, and as much automated fashion as possible. Of course, it is very useful to know the timings – to forecast the duration of overall operation, it is a good idea to test the operation on a clone for the largest clusters, and remember the overall timing.
1. In the case of zero-downtime upgrades relying on logical replication, it is not needed at all: the `ANALYZE` is to be executed on the target cluster's primary while logical replication is running.
