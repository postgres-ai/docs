---
title: Query duration difference between Database Lab and production environments
sidebar_label: Query duration for production environments
description: "Why there is a difference in query durationn between Database Lab and production environments? How to deal with it? What other parameters could be used for the SQL optimization process?"
keywords:
  - "Query timing"
  - "Query duration"
  - "Timing estimation"
  - "Database Lab timing estimator"
---

Database Lab clones are almost exact copies of the production database yet some limitations should be kept in mind. Under the hood, Database Lab clones use copy-on-write technology (currently supported: [ZFS](https://en.wikipedia.org/wiki/ZFS) and [LVM&nbsp;2](https://en.wikipedia.org/wiki/Logical_Volume_Manager_(Linux)). This technology allows reducing cloning time and amount of the extra disk space needed for it almost to zero. On the other side, it has different IO performance in comparison to file systems most commonly used on production environments (such as [ext4](https://en.wikipedia.org/wiki/Ext4)). This difference affects the database operations *timing*, it may be noticeably bigger on the clones. Other factors may affect query *timing* too. That is why it is recommended to focus on the plan structure and data volumes (buffer numbers in the case of "physical" provisioning mode, and row numbers in the case of "logical" provisioning mode) when dealing with EXPLAIN plans. Timing numbers in such plans obtained on thing clones should not be directly compared to the corresponding numbers obtained on production.

:::note
When [configured properly](https://postgres.ai/docs/guides/administration/postgresql-configuration#postgresql-configuration-in-clones), Database Lab clones execute SQL queries very similarly to production:
- Execution plan structure is identical to production thanks to identical data statistics and PostgreSQL planner settings
- Data volumes processed by the executor and reported in the EXPLAIN plans are the same:
    - row numbers for "logical" mode
    - buffer and row numbers for "physical" mode (hit/read ratios may be different because of different cache states)
:::

## Estimator
The estimator is a feature of [Database Lab Virtual DBA](https://gitlab.com/postgres-ai/joe) (former Joe bot) to estimate a timing of queries on the production database.

The estimator aims to forecast the timing numbers for the source (production) eliminating the difference related to the disk IO (slower disks, difference filesystem). The estimator is triggered only for queries that are running more than 0.2 second (default value, configurable) and it works under the following assumptions:
- CPU and RAM models on prod and those that used on clones are the same or very similar
- No resources are saturated (CPU, memory, disk IO, network) – neither on clones nor on the source (production) node
- The state of caches is very similar (estimation works better when the majority of the data we are working with is cached or not cached at all).
- Locking issues do not affect the timing: there is no significant time spent waiting for some lock to be acquired

## How is the estimated timing calculated?
General idea is to use the PostgreSQL waits model, which can be taken from `pg_stat_activity` 

During SQL query (or batch) execution, `pg_stat_activity` is queried 100 times per second (default value, configurable) to get current wait events for the target PID or PIDs. The frequency can be changed in the configuration file.

It gives a report like this providing an understanding of where PostgreSQL spent time:
```
LOG: Profiling process 63 with 10ms sampling
% time      seconds wait_event
------ ------------ -----------------------------
57.30     17.715111 IO.DataFileRead
25.53      7.893916 Running
3.55       1.097738 IO.DataFileExtend
2.55       0.787341 LWLock.WALWriteLock
2.25       0.696663 IO.BufFileRead
2.14       0.662457 IO.BufFileWrite
2.12       0.654081 IO.WALInitWrite
1.62       0.499461 IO.WALInitSync
1.09       0.335660 IO.WALWrite
0.98       0.301637 IO.DataFileImmediateSync
0.81       0.250249 IO.WALSync
0.07       0.020805 LWLock.WALBufMappingLock
------ ------------ -----------------------------
100.00    30.915119
```

The estimation methodology implies that the non-IO parts of the overall timing are expected to be very similar on production and clones, focusing on adjusting the values of the IO parts (reads, writes). This makes sense only if the assumptions explained above are true (resources are not saturated, cache states are similar, and so on). This yields to the following formula:

`Time estimated` = `CPU and other non-IO wait time` + `IO read time` / `Read ratio` + `IO write time` / `Write ratio`

Here `Read ratio` and `Write ratio` are the constants that need to be pre-defined during configuration as described below.

## How to configure the timing estimator
### Step 1. Calculate read and write ratios for your setup
Read and write ratios are based on write performance metrics on the production database and a clone.

Run this query on both production and clone databases:
```sql
select
  checkpoint_write_time,
  buffers_checkpoint,
  buffers_backend,
  blk_write_time,
  blks_read,
  blks_hit,
  blk_read_time
from pg_stat_bgwriter, pg_stat_database
where datname = current_database();
```

Calculate read and write ratios using statistics gathered from running the query on both databases.
```
write_speed_on_prod = buffers_backend_on_prod / blk_write_time_on_prod
read_speed_on_prod = blks_read_on_prod / blk_read_time_on_prod

write_speed_on_clone = buffers_backend_on_clone / blk_write_time_on_clone
read_speed_on_clone = blks_read_on_clone / blk_read_time_on_clone

read_ratio = read_speed_on_prod / read_speed_on_clone
write_ratio = write_speed_on_prod / write_speed_on_clone
```

These read and write ratios are supposed to be stored in the bot configuration (later it will be moved to the DLE configuration). There might be a need to update them periodically, synchronizing with statistics observed on the production.

### Step 2. Configure the estimator
To configure the estimator for Virtual DBA (Joe bot) you will need to add the `estimator` section to the [Virtual DBA configuration](https://postgres.ai/docs/joe-bot/config-reference) and change options according to your deployment.

`estimator` section example:
```
estimator:
   readRatio: 1
   writeRatio: 1
   profilingInterval: 20ms
   sampleThreshold: 100
```

- `readRatio` - the ratio evaluating the timing difference for operations involving IO Read between Database Lab and production environments (use the value from the previous step)
- `writeRatio` - the ratio evaluating the timing difference for operations involving IO Write between Database Lab and production environments (use the value from the previous step)
- `profilingInterval` - time interval of samples taken by the profiler, more frequent sampling gives more precise picture of database server waits, but with additional overhead as a trade-off, default is 10ms (100 samples per second)
- `sampleThreshold` - the minimum number of samples sufficient to display the estimation results, more samples gives more precise picture of database server waits during SQL execution, default value is 20 samples; for example, 20 samples with 10ms interval is 0.2 seconds, it means SQL queries with execution time lower than 0.2 seconds cannot be analysed, decreasing this value increases cost of one sample (20 samples equals 5% as cost of one sample) and decrease quality of such analysis
