---
title: How to configure PostgreSQL used by Database Lab Engine
sidebar_label: Configure PostgreSQL used by Database Lab Engine
---

## PostgreSQL configuration
It is important to properly configure all PostgreSQL instances managed by Database Lab Engine: the single "sync" instance, and clones.

### The "sync" instance
The "sync" instance, which is an asynchronous replica by nature, is currently supported only for the physical mode of data directory initialization, see option `syncInstance` in job [physicalRestore](/docs/database-lab/config-reference#job-physicalsnapshot). The only purpose of this PostgreSQL is fetching and replaying [WAL segments](https://www.postgresql.org/docs/current/wal-intro.html), maintaining the data directory in sync.

Normally, there is no need in configuring this PostgreSQL instance, as Database Lab Engine controls it fully, using a small value for `shared_buffers`, and very reliable values for all the configuration options. The only option that can be controlled by the Databae Lab Engine administrator is `restore_command` (see [physicalRestore](/docs/database-lab/config-reference#job-physicalsnapshot)). 

### PostgreSQL configuration in clones
It is possible and in many cases necessary to configure various PostgreSQL options in clones. It can be done both for logical and physical modes of data directory initialization:
- for the logical mode, all PostgreSQL parameters are to be specified in option `configs` of job `logicalSnapshot`
- for the physical mode, these parameters are configured in option `configs` of job `physicalSnapshot`

Technically, the specified PostgreSQL parameters are applied to `postgresql.conf` located in the data directory when preparing a working snapshot used for thin cloning. All thin clones automatically inherit these values.

When configuring Database Lab Engine, review and set up if needed the following parameters:
- **`shared_buffers`**: one of the most important parameters. The use of the same value that is used on the source is not recommended because it might lead to out-of-memory errors and the inability to create more than a few clones. Instead, use some moderate value such as `1GB`; with this value, if your server has, say, 64 GiB of RAM, then theoretical maximum number of clones is ~63 (some RAM is already used by OS and other apps)
- **`shared_preload_libraries`**: use the same value as on the source, to allow the same extensions that is used there
- **`work_mem`**: set the same value as used on the source database unless your Database Lab Engine server lacks memory and there are significant risks of out-of-memory errors
- **[Query Planning](https://www.postgresql.org/docs/current/runtime-config-query.html)** parameters (all of them). This is essential to ensure that cloned PostgreSQL most likely generates the same plans as on the source (specifically, it is crutial for query performance troubleshooting and optimization, including working with EXPLAIN plans)

For convenience, use the following SQL on the source database to get all the values:
```sql
select format($$%s: "%s"$$, name, setting)
from pg_settings
where
  name ~ '(work_mem$|^enable_|_cost$|scan_size$|effective_cache_size|^jit)'
  or name ~ '(^geqo|default_statistics_target|constraint_exclusion|cursor_tuple_fraction)'
  or name ~ '(collapse_limit$|parallel|plan_cache_mode|shared_preload_libraries)';
```

An example of `configs` option:
```yaml
...
        configs:
          autovacuum_work_mem: "-1"
          constraint_exclusion: "partition"
          cpu_index_tuple_cost: "0.005"
          cpu_operator_cost: "0.0025"
          cpu_tuple_cost: "0.01"
          cursor_tuple_fraction: "0.1"
          default_statistics_target: "100"
          effective_cache_size: "524288"
          enable_bitmapscan: "on"
          enable_gathermerge: "on"
          enable_hashagg: "on"
          enable_hashjoin: "on"
          enable_indexonlyscan: "on"
          enable_indexscan: "on"
          enable_material: "on"
          enable_mergejoin: "on"
          enable_nestloop: "on"
          enable_parallel_append: "on"
          enable_parallel_hash: "on"
          enable_partition_pruning: "on"
          enable_partitionwise_aggregate: "off"
          enable_partitionwise_join: "off"
          enable_seqscan: "on"
          enable_sort: "on"
          enable_tidscan: "on"
          force_parallel_mode: "off"
          from_collapse_limit: "8"
          geqo: "on"
          geqo_effort: "5"
          geqo_generations: "0"
          geqo_pool_size: "0"
          geqo_seed: "0"
          geqo_selection_bias: "2"
          geqo_threshold: "12"
          jit: "off"
          jit_above_cost: "100000"
          jit_debugging_support: "off"
          jit_dump_bitcode: "off"
          jit_expressions: "on"
          jit_inline_above_cost: "500000"
          jit_optimize_above_cost: "500000"
          jit_profiling_support: "off"
          jit_provider: "llvmjit"
          jit_tuple_deforming: "on"
          join_collapse_limit: "8"
          maintenance_work_mem: "65536"
          max_parallel_maintenance_workers: "2"
          max_parallel_workers: "8"
          max_parallel_workers_per_gather: "2"
          min_parallel_index_scan_size: "64"
          min_parallel_table_scan_size: "1024"
          parallel_leader_participation: "on"
          parallel_setup_cost: "1000"
          parallel_tuple_cost: "0.1"
          random_page_cost: "4"
          seq_page_cost: "1"
          shared_preload_libraries: ""
          work_mem: "102400"
...
```