---
title: How to configure PostgreSQL used by Database Lab Engine
sidebar_label: Configure PostgreSQL used by Database Lab Engine
---

## PostgreSQL configuration
It is important to properly configure all PostgreSQL instances managed by Database Lab Engine: the single "sync" instance, and clones.

### The "sync" instance
The "sync" instance, which is an asynchronous replica by nature, is currently supported only for the physical mode of data directory initialization, see option `syncInstance` in job [physicalRestore](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalsnapshot). The only purpose of this PostgreSQL is fetching and replaying [WAL segments](https://www.postgresql.org/docs/current/wal-intro.html), maintaining the data directory in sync.

Normally, there is no need in configuring this PostgreSQL instance, as Database Lab Engine controls it fully, using a small value for `shared_buffers`, and very reliable values for all the configuration options. The only option that can be controlled by the Databae Lab Engine administrator is `restore_command` (see [physicalRestore](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalsnapshot)). 

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

Use the following SQL on the source database to get all non-default values of the parameters affecting the planner's behavior:
```sql
select
  format('   %s: "%s"', name, setting) as configs
from
  pg_settings
where
  source <> 'default'
  and (
    name ~ '(work_mem$|^enable_|_cost$|scan_size$|effective_cache_size|^jit)'
    or name ~ '(^geqo|default_statistics_target|constraint_exclusion|cursor_tuple_fraction)'
    or name ~ '(collapse_limit$|parallel|plan_cache_mode|shared_preload_libraries)'
  );
```

Here is an example of who the `databaseConfigs` configuration section is supposed to look:
```yaml
...
databaseConfigs: &db_configs
  configs:
    shared_buffers: 1GB
    default_statistics_target: "1000"
    effective_cache_size: "43352064"
    jit: "off"
    maintenance_work_mem: "2097152"
    random_page_cost: "1.1"
    seq_page_cost: "1.0"
    shared_preload_libraries: "pg_stat_statements,auto_explain,pg_wait_sampling,pg_stat_kcache"
    work_mem: "102400"
...
```
