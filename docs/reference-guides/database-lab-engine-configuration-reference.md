---
title: DBLab Engine configuration reference
sidebar_label: DBLab Engine configuration
---

## Overview
DBLab Engine behavior can be controlled using the main configuration file that has YAML format. This reference describes available configuration options.

:::tip
DBLab Engine supports [YAML 1.2](https://yaml.org/spec/1.2/spec.html) including anchors, aliases, tags, map merging.
:::

Example config files can be found here: https://gitlab.com/postgres-ai/database-lab/-/tree/v4.2.0/engine/configs.

:::tip Secrets out of the config file (DBLab Engine 4.2+)
Any value that is exactly `${VAR}` or `$VAR` is replaced with that environment variable when the config is read, and the engine refuses to start when the variable is unset. See [Environment variables](#environment-variables).
:::

You may store configuration files in any suitable location. The recommended location of configuration files for DBLab Engine is `~/.dblab/engine/configs`.

In addition, DBLab Engine provides functionality for storing information about current sessions and the state of the instance.
The recommended location of metadata files is `~/.dblab/engine/meta`. Note the metadata folder must be writable.

:::info
Make sure that the file name is `server.yml` and its directory is mounted to `/home/dblab/configs` inside the DBLab Engine container. 
:::

Useful guides that help manage DBLab Engine:
- [How to configure and start DBLab Engine](/docs/dblab-howtos/administration/engine-manage#configure-and-start-a-dblab-engine-instance)
- [Reconfigure DBLab Engine without downtime](/docs/dblab-howtos/administration/engine-manage#reconfigure-dblab-engine)

:::tip
The configuration of DBLab Engine can be reloaded without downtime:

```shell
docker exec -it dblab_server kill -SIGHUP 1
docker logs --since 1m dblab_server
``` 
:::

## YAML anchors and configuration patterns

DBLab Engine configuration extensively uses YAML anchors and aliases to reduce repetition and maintain consistency across different configuration sections. This approach allows you to define common configuration patterns once and reuse them throughout the configuration file.

### Basic YAML anchors syntax
- `&anchor_name` - defines an anchor (creates a reusable reference)
- `*anchor_name` - uses an anchor (references the defined anchor)
- `<<: *anchor_name` - merges an anchor into the current mapping (inheritance)

### Common configuration patterns

#### Database container configuration (`databaseContainer`)
This pattern defines common Docker container settings used across multiple jobs:

```yaml
# Define the anchor
databaseContainer: &db_container
  dockerImage: "postgresai/extended-postgres:16-0.5.0"
  containerConfig:
    "shm-size": 1gb

# Use the anchor in jobs
provision:
  <<: *db_container
  portPool:
    from: 6000
    to: 6099

retrieval:
  spec:
    logicalDump:
      options:
        <<: *db_container
        dumpLocation: "/var/lib/dblab/dblab_pool/dump"
```

#### Database configuration parameters (`databaseConfigs`)
This pattern defines PostgreSQL configuration parameters that should be consistent across jobs:

```yaml
# Define the anchor
databaseConfigs: &db_configs
  configs:
    shared_buffers: 1GB
    shared_preload_libraries: "pg_stat_statements, pg_stat_kcache, auto_explain, logerrors"
    work_mem: "100MB"
    maintenance_work_mem: "500MB"

# Use the anchor in jobs
retrieval:
  spec:
    logicalRestore:
      options:
        <<: *db_configs
        dumpLocation: "/var/lib/dblab/dblab_pool/dump"
    
    logicalSnapshot:
      options:
        <<: *db_configs
        preprocessingScript: ""
```

### Best practices for YAML anchors

1. **Define anchors at the top level** of your configuration file for better readability
2. **Use descriptive names** that clearly indicate the purpose (e.g., `&db_container`, `&db_configs`)
3. **Combine anchors when needed** - you can use multiple `<<:` merge operators in the same section
4. **Override specific values** - anchor merging allows you to override individual values while keeping the rest

### Example: combining multiple anchors
```yaml
# Define multiple anchors
databaseContainer: &db_container
  dockerImage: "postgresai/extended-postgres:16-0.5.0"
  containerConfig:
    "shm-size": 1gb

databaseConfigs: &db_configs
  configs:
    shared_buffers: 1GB
    work_mem: "100MB"

# Use both anchors in a job
retrieval:
  spec:
    logicalRestore:
      options:
        <<: *db_container
        <<: *db_configs
        dumpLocation: "/var/lib/dblab/dblab_pool/dump"
        parallelJobs: 4
```

:::tip
Using YAML anchors helps ensure consistency across your configuration and makes it easier to maintain. When you need to update a Docker image or PostgreSQL parameter, you only need to change it in one place.
:::

## The list of configuration sections
Here is how the configuration file is structured:

| Section | Description |
| --- | --- |
| `global` | Contains global parameters, such as data directory path or enabling debugging. |
| `server` | Pertains to the DBLab Engine API server. |
| `embeddedUI` | Refers to the DBLab Engine UI.  |
| `poolManager` | Manages filesystem pools or volume groups. |
| `provision` | Describes how thin cloning and database branching are organized. |
| `retrieval` | Defines the data flow: a series of "jobs" for initial retrieval of the data, and, optionally, continuous data synchronization with the source, snapshot creation and retention policies. The initial retrieval may be either "logical" (dump/restore) or "physical" (based on replication or restoration from an archive). |
| `cloning` | Thin cloning policies.                                                                                                                                                                                                                                                                                                    |
| `retention` | Automatic deletion of unused branches and snapshots, and the cap on their protection leases. Supported since DBLab Engine 4.2. |
| `platform` | PostgresAI Platform integration (provides GUI, advanced features such as user management, logs).                                                                                                                                                                                                                         |
| `observer` | CI Observer configuration. CI Observer helps verify database schema changes (database migrations) automatically, in CI/CD pipelines. Available on the PostgresAI Platform.                                                                                                                                               |
| `webhooks` | Webhook configuration for clone lifecycle events. Allows integration with external systems for notifications and automation.                                                                                                                                                                                               |
| Environment Variables | Supported environment variables for configuration override and sensitive data management.                                                                                                                                                                                                                                   |
| `diagnostic`  | Configuration to collect diagnostics logs - containers output, Postgres logs.                                                                                                                                                                                                                                             | 
| `estimator` | (removed in DBLab Engine 3.4.0) Estimator configuration. Estimator estimates a timing of queries on the production database.                                                                                                                                                                                                       |

## Section `global`: global parameters
- `engine` - defines the DBLab Engine. Supported engines: `postgres`
- `debug` - allows seeing more in the DBLab Engine logs; WARNING: in this mode, sensitive data (such as passwords) can be printed to logs
- `database` (key-value, optional) - contains default configuration options of the restored database
  - `username` (string, optional, default: "postgres") - a default username for logical/physical restore jobs
  - `dbname` (string, optional, default: "postgres") - a default database name for logical/physical restore jobs

## Section `server`: DBLab Engine API server
- `verificationToken` (string, required) - the token that is used to work with Database Lab API. Since DBLab Engine 4.2 the example configs reference it from the environment: `verificationToken: "${DBLAB_VERIFICATION_TOKEN}"` (see [Environment variables](#environment-variables))
- `host` (string, optional) - The host which the DBLab Engine API server accepts HTTP connections from. An empty string (default) means "all available addresses".
- `port` (integer, required, default: 2345) - HTTP server port
- `disableConfigModification` (boolean, optional, default: false) - disable modifying configuration via UI/API; when enabled, configuration changes can only be made by editing the config file directly

## Section `embeddedUI`: DBLab Engine user interface
- `enabled` (boolean, optional, default: true) - manages the state of the UI container
- `dockerImage` (string, required) - a Docker image of the UI application
- `host` (string, required, default: "127.0.0.1") - the host which the embedded UI container accepts HTTP connections from
- `port` (integer, required, default: 2346) - an HTTP port of the UI application

## Section `poolManager`: filesystem pools or volume groups management
- `mountDir` (string, required) - specifies the location of the pools mount directory (can contain multiple pool directories)
- `dataSubDir` (string, optional, default: "") - specifies the location of restored data by DBLab Engine relative to the pool which is placed inside the mount directory (`mountDir`)
- `clonesMountSubDir` (string, required) -  the directory that will be used to mount clones
- `socketSubDir` (string, required) - the UNIX socket directory that will be used to establish local connections to cloned databases
- `observerSubDir` (string, optional, default: "observer") - directory that will be used to store observability artifacts; the directory will be created inside PGDATA
- `preSnapshotSuffix` (string, required) - the suffix to denote preliminary snapshots
- `selectedPool` (string, optional, default: "") - enforce selection of the working pool (or dataset) inside the `mountDir` directory. If this option is specified, it disables the automatic rotation of multiple pools, which may be useful when multiple DBLab Engine instances are running on the same machine, sharing the same set of pools. An empty string turns off this feature, enabling the standard pool selection and rotation mechanism (default behavior).

## Section `provision`: thin cloning environment settings
- `portPool` (key-value, required) - defines a pool of ports for Postgres clones
  - `from` (integer, required) - the lowest port value in the pool
  - `to` (integer, required) - the highest port value in the pool
- `dockerImage` (string, required) - Postgres Docker image to be used for cloning. IMPORTANT: Postgres version of this image should match the source's Postgres version. For logical mode, it is a recommendation. For physical mode, it is a *requirement*.
- `useSudo` (boolean, optional, default: false) - use sudo for ZFS/LVM and Docker commands if Database Lab server is running outside a container
- `keepUserPasswords` (bool, optional, default: "false") - By default, in addition to creating a new user with administrative privileges, DBLab Engine resets passwords for all existing users. This is done for security reasons. If this behavior is undesirable and you want to keep the ability to authenticate for the existing users with their unchanged passwords, then set the value of the variable to `true`.
- `containerConfig` (key-value, optional) - options to pass custom parameters to clone containers
- `cloneAccessAddresses` (string, optional, default: "127.0.0.1") - IP addresses that can be used to access clones. By default, use a loop-back to accept only local connections. The empty string means "all available addresses". The option supports multiple IPs (using comma-separated format) and IPv6 addresses (for example, `[::1]`)
- `pgUpgradeImage` (string, optional) - the image that runs `pg_upgrade` for [clone major upgrades](/docs/dblab-howtos/cloning/clone-upgrade) (`dblab clone upgrade`, `POST /clone/{id}/upgrade`). Its major is the version clones are upgraded to: the engine reads it out of a release tag (`:17`, `:17-0.8.0`, `:17-0.8.0-glibc236`) and re-reads it from the image's `PG_MAJOR` before every upgrade; a tag that states no major (a digest pin, `latest`) is fetched in the background at startup and the major is read from the image. Leave unset to disable clone upgrades. The clone must be on Postgres 12 or newer, and the target must be newer than the clone's major and at most four majors ahead. Supported since DBLab Engine 4.2. Example: `"postgresai/pg-upgrade:17"`
- `pgUpgradeTimeout` (string, optional, default: `3h`) - how long a single clone upgrade run may take, as a Go duration (`30m`, `3h`); this option takes a duration rather than a `...Minutes` integer. When the budget runs out, the upgrade container is removed and the outcome is handled like any other failed upgrade: the clone restarts on its original version if nothing had been converted yet, otherwise it is rebuilt from its origin snapshot and data written since the clone was created is lost. Supported since DBLab Engine 4.2.
- `pgUpgradePullTimeout` (string, optional, default: `1h`) - how long each of the two image pulls made for a clone upgrade may take, as a Go duration. The pulls happen while the clone is still running, so exceeding the budget leaves the clone untouched. Supported since DBLab Engine 4.2.
- `upgradeImageAllowList` (list of strings, optional) - repositories an explicit `dblab clone upgrade --docker-image` (or the `dockerImage` field of the upgrade request) may name. When unset or empty, any repository the instance can reach is accepted, which lets any API token holder run an arbitrary image over a clone's data; set it whenever the API is reachable by non-administrators, especially with `platform.enablePersonalTokens`. Supported since DBLab Engine 4.2. Example: `["postgresai/extended-postgres"]`

## Section `retrieval`: data retrieval
- `refresh` (key-value, optional) - describes configuration for a full refresh.
  - `timetable` (string, optional, default: "") - defines a timetable in crontab format: https://en.wikipedia.org/wiki/Cron#Overview
  - `skipStartRefresh` (boolean, optional, default: false) - skips running retrieval jobs while the DBLab Engine instance starts; supported since DBLab Engine 3.4
- `jobs` (list, optional) - declares the set of running jobs. Stages must be defined in the `spec` section
- `spec` (key-value, optional) - contains a configuration spec for each job

### Data retrieval jobs
Available job names:
- `logicalDump`
- `logicalRestore`
- `logicalSnapshot`
- `physicalRestore`
- `physicalSnapshot`

:::info
You need to choose either "logical" or "physical" set of jobs. Mixing is not allowed
:::

Note, that all jobs are optional. For example, all the following approaches defining the initial data retrieval process are allowed:
- You may consider using both `logicalDump` and `logicalRestore` to make a dump to a file and then restore from it
- You may use only `logicalRestore` and restore from an already prepared dump file
- You may use only `logicalDump`, without `logicalRestore` (however, this approach makes sense only if you define `immediateRestore` option in the `logicalDump` job, to perform dump & restore on-the-fly, without saving the dump to a file)

### Job `logicalDump`
Dumps a PostgreSQL database from a provided source to an archive or to the DBLab Engine instance.

Options:
- `dumpLocation` (string, required) - specifies the location to store dump files (or directories, for directory-format archives) — it will be automatically created on the host machine. DBLab Engine deletes all files and directories in this directory before creating new dumps.
- `dockerImage` (string, required) - specifies the Docker image containing the dump-required tool
- `containerConfig` (key-value, optional) - options to pass custom parameters to logicalDump container. Supports standard Docker container configuration options such as memory limits, CPU limits, volumes, etc. Can be inherited using YAML anchors (see `databaseContainer` pattern above)
  - Example: `"memory": "2gb"`, `"cpus": "1.5"`, `"shm-size": "1gb"`
- `source` (key-value, required) - describes source of data:
   - `type` (string, required) -  defines location type of a dumped database. Available values: `local`, `remote`, `rdsIam`
   - `connectionString` (string, optional) - a full libpq connection string for the source (`source.connectionString`, a sibling of `source.connection`), either a URI (`postgresql://user@host:5432/dbname?sslmode=verify-full&sslrootcert=/path/to/ca.pem`) or keyword/value form (`host=... port=... dbname=... sslmode=...`). When set, it wins over the discrete `connection.*` fields and preserves every libpq option (`sslmode`, `connect_timeout`, `sslrootcert`, `options`, ...) end-to-end into `pg_dump` and the engine's own connections to the source. The password must not be embedded here; set it via `connection.password` or the `PGPASSWORD` environment variable. Note that `sslmode=require` encrypts but does not authenticate the server; use `verify-full` with `sslrootcert` for managed providers, and mount the CA file into both the DBLab Engine container and the `logicalDump` container (`containerConfig` `volume`), since both open the path. Supported since DBLab Engine 4.2.
   - `connection` (key-value, required) - defines connection parameters of source:
      - `dbname` (string, required) - database name used for connection purposes; also see `logicalDump.databases`
      - `host` (string, required) - defines hostname of the database
      - `port` (integer, optional, default: 5432) - defines port of the database
      - `username` (string, optional, default: postgres) - defines database username to connect to the database
      - `password` (string, optional, default: "") - defines username password to connect to the database; the environment variable PGPASSWORD can be used instead of this option; the environment variable has a higher priority
   - `rdsIam` (key-value, optional) - contains options specific for RDS IAM source type
      - `awsRegion` (string, required) - AWS Region where RDS is located
      - `dbInstanceIdentifier` (string, required) - RDS instance Identifier. This value is also exposed through the `/admin/config` projection as `RDSIAMDBInstance`.
      - `sslRootCert` (string, required) - path on the host machine to the SSL root certificate. You can download it from https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem 
- `parallelJobs` (integer, optional, default: 1) - defines the number of concurrent jobs using the `pg_dump` option `jobs`. This option can dramatically reduce the time to dump a large database
- `databases` (key-value, optional) - defines options for specifying the database list that must be copied. By default, DBLab Engine dumps and restores all available databases. Do not specify the databases section to take all databases. Available options for each database: `tables`
   - `tables` (list of strings, optional) - dumps definition and/or data of only the listed tables. Do not specify the tables section to dump all available tables
   - `excludeTables` (list of strings, optional) - excludes all tables matching any of the patterns from the dump. Accepts specific schemas and tables, or wildcards (*) for more flexibility.
- `customOptions` (list of strings, optional) - defines one or multiple `pg_dump` options. See available options in [the official PostgreSQL documentation](https://www.postgresql.org/docs/current/app-pgdump.html). Common examples:
  - `"--no-publications"` - exclude publications (useful for replica databases)
  - `"--no-subscriptions"` - exclude subscriptions 
  - `"--no-tablespaces"` - ignore tablespace assignments
  - `"--exclude-schema=information_schema"` - exclude specific schemas
- `immediateRestore` (key-value, optional) - provides options for direct restore to a DBLab Engine instance.
   - `enabled` (boolean, optional, default: false) - enable immediate restore.
   - `forceInit` (removed, boolean, optional, default: false) - init data even if the Postgres directory (see the configuration options `global.mountDir` and `global.dataSubDir`) is not empty; note the existing data might be overwritten; removed since DBLab Engine 3.4.0
   - `configs` (key-value, optional) - applies PostgreSQL configuration parameters for the immediate restore process. Can be inherited using YAML anchors (see `databaseConfigs` pattern above)
   - `customOptions` (list of strings, optional) - defines one or multiple `pg_restore` options. See available options in [the official PostgreSQL documentation](https://www.postgresql.org/docs/current/app-pgrestore.html)
- `ignoreErrors` (boolean, optional, default: false) - ignore errors that occurred during logical data dump; supported since DBLab Engine 3.4

### Job `logicalRestore`
Restores a PostgreSQL database from an archive created by pg_dump in one of the non-plain-text formats.

Options:
- `dumpLocation` (string, required) - specifies the location of the archive files (or directories, for directory-format archives) on the host machine to be restored
- `dockerImage` (string, required) - specifies the Docker image containing the restore-required tool
- `containerConfig` (key-value, optional) - options to pass custom parameters to logicalRestore container. Since DBLab Engine 4.2, `volume` entries here are applied as bind mounts to the retrieval container
- `forceInit` (removed, boolean, optional, default: false) - init data even if the Postgres directory (see the configuration options `global.mountDir` and `global.dataSubDir`) is not empty; note the existing data might be overwritten; removed since DBLab Engine 3.4.0
- `parallelJobs` (integer, optional, default: 1) - defines the number of concurrent jobs using the `pg_restore` option `jobs`. This option can dramatically reduce the time to restore a large database to a server running on a multiprocessor machine
- `databases` (key-value, optional) - defines options for specifying the database list that must be restored. By default, DBLab Engine restores all available databases. Do not specify the databases section to restore all databases. Available options for each database: `tables`, `format`
    - `format` (string, optional, default: "") - defines a dump format. Available formats: `directory`, `custom`, `plain`. Default format: `directory`. See the description of each format in the [official PostgreSQL documentation](https://www.postgresql.org/docs/current/app-pgdump.html).
    - `compression` (string, optional, default: "no") - defines a compression type for plain-text dumps. Available compression types: `gzip`, `bzip2`, `no`.
    - `tables` (list of strings, optional) - restores definition and/or data of only the listed tables. Do not specify the tables section to restore all available tables
- `customOptions` (list of strings, optional)- defines one or multiple `pg_restore` options. See available options in [the official PostgreSQL documentation](https://www.postgresql.org/docs/current/app-pgrestore.html). Common examples:
  - `"--no-tablespaces"` - ignore tablespace assignments (most common)
  - `"--no-privileges"` - skip restoration of access privileges 
  - `"--no-owner"` - skip restoration of object ownership
  - `"--exit-on-error"` - exit on first error (recommended for CI/CD)
  - `"--if-exists"` - use IF EXISTS when dropping objects
- `queryPreprocessing` (key-value, optional) - defines pre-processing parameters; supported since DBLab Engine 3.2
    - `queryPath` (string, optional, default: "") - specifies the path to SQL pre-processing queries; an empty string means that no pre-processing defined
    - `maxParallelWorkers` (integer, optional, default: 2) - defines the worker limit for parallel queries
    - `inline` (string, optional, default: "") - inline SQL queries to execute; if specified, queries from `queryPath` are executed before `inline`
- `configs` (key-value, optional) - applies PostgreSQL configuration parameters for the logical restore process. These parameters are used during restore and can be inherited using YAML anchors (see `databaseConfigs` pattern above)
- `ignoreErrors` (boolean, optional, default: false) - ignore errors that occurred during logical data restore; supported since DBLab Engine 3.4
- `skipPolicies` (boolean, optional, default: true) - do not restore row-level security policies (`CREATE POLICY`); supported since DBLab Engine 3.4

### Job `logicalSnapshot`
Prepares a snapshot for logical restored PostgreSQL database.

Options:
- `databaseRename` (key-value, optional) - rename databases before finalizing the snapshot. Runs after `preprocessingScript`. Each entry maps the original database name to the new name. This is useful when you want clones to use different database names than production (e.g., renaming `mydb_prod` to `mydb_dev`). Supported since DBLab Engine 4.1. See [Rename databases during snapshot creation](/docs/dblab-howtos/administration/data/database-rename).
  ```yaml
  databaseRename:
    mydb_prod: mydb_dev
    analytics_production: analytics_dblab
  ```
- `dataPatching` (key-value, optional) - defines SQL queries for data patching. This allows you to run custom SQL queries against the restored database before creating the snapshot, useful for data masking, test data setup, or schema modifications
  - `dockerImage` (string, optional) - specifies the Docker image to run a data patching container. Can be inherited using YAML anchors (see `databaseContainer` pattern above)
  - `containerConfig` (key-value, optional) - options to pass custom parameters to data patching container. Supports standard Docker options like memory/CPU limits
  - `queryPreprocessing` (key-value, optional) - defines pre-processing parameters
    - `queryPath` (string, optional, default: "") - specifies the path to SQL pre-processing queries; an empty string means that no pre-processing defined
    - `maxParallelWorkers` (integer, optional, default: 2) - defines the worker limit for parallel queries. Parallelization doesn't work for inline SQL queries
    - `inline` (string, optional, default: "") - inline SQL queries to execute; if specified, queries from `queryPath` are executed before `inline`
- `preprocessingScript` (string, optional) - path on the host machine to a pre-processing script
- `configs` (key-value, optional) - applies PostgreSQL configuration parameters when preparing a working snapshot. These parameters are inherited by all clones. See also: [How to configure PostgreSQL used by DBLab Engine](/docs/dblab-howtos/administration/postgresql-configuration)

### Job `physicalRestore`
Restores data from a physical backup.

Supported restore tools:
- WAL-G (`walg`) - an archival restoration tool for PostgreSQL, it uses LZ4, LZMA, or Brotli compression, multiple processors, and non-exclusive base backups for Postgres ([GitHub](https://github.com/wal-g/wal-g))
- pgBackRest (`pgbackrest`) - a reliable, easy-to-use backup and restore solution that can seamlessly scale up to the largest databases and workloads by utilizing algorithms that are optimized for database-specific requirements ([GitHub](https://github.com/pgbackrest/pgbackrest)); supported since DBLab Engine 3.1
- Custom (`custom`) - allows defining own command to restore data

Options:
- `tool` (string, required) - defines the tool to restore data. See available restore tools list
- `dockerImage` (string, required) - specifies the Docker image containing the restoring tool
- `containerConfig` (key-value, optional) - options to pass custom parameters to physicalRestore container. Since DBLab Engine 4.2, `volume` entries here are applied as bind mounts to the retrieval containers (restore and sync); earlier versions ignored them for retrieval jobs. Do not mount into `/var/lib/postgresql/...` on Postgres 18+ images (see the [Teleport guide](/docs/dblab-howtos/administration/teleport-integration#7-volume-mounting-for-certs))
- `sync`  (key-value, optional) - keep PGDATA up to date after (replaying new WALs from the source) the initial data fetching:
   - `enabled` (boolean, optional, default: false) - runs a separate container to keep Database Lab data up to date
   - `healthCheck` (key-value, optional) - describes health check options for the  sync container:
      - `interval` (int, optional, default: 5) - health check interval for the data sync container (in seconds)
      - `maxRetries` (int, optional, default: 200) - maximum number of health check retries
   - `configs` (key-value, optional) - applies PostgreSQL configuration parameters to the sync instance
- `envs` (key-value, optional) - passes custom environment variables to the Docker container with the restoring tool
- `walg` (key-value, optional) - defines WAL-G configuration options:
   - `backupName` (string, required) - defines the backup name to restore
   - `customOptions` (list of strings, optional) - defines one or multiple [`wal-g backup-fetch`](https://github.com/wal-g/wal-g/blob/master/docs/PostgreSQL.md#backup-fetch) options, appended to the command DBLab Engine builds. Use it for options WAL-G exposes only as command-line flags; anything that has a `WALG_*` environment variable belongs in `envs` instead. The options are appended to a shell command line, so quote any value containing whitespace or glob characters. They apply to `backup-fetch` only — not to the `backup-list` used to resolve `LATEST`, and not to the `wal-fetch` in the generated `restore_command` — so select a storage with `WALG_TARGET_STORAGE` in `envs` rather than with `--target-storage`. `--target-user-data` cannot be combined with `backupName`; WAL-G rejects the two together. Common examples:
     - `"--restore-only=mydb"` - restore only the listed databases
     - `"--mask 'base/*'"` - fetch only the files matching a pattern
     - `"--restore-spec /path/to/spec.json"` - restore using a tablespace specification
- `pgbackrest` (key-value, optional) - defines pgBackRest configuration options:
   - `stanza` (string, required) - defines the stanza name to restore ([pgBackrest docs](https://pgbackrest.org/user-guide.html#quickstart/configure-stanza))
   - `delta` (boolean, optional, default: false) - defines usage `--delta` option for restore using checksums ([pgBackRest docs](https://pgbackrest.org/user-guide.html#restore/option-delta))
   - `customOptions` (list of strings, optional) - defines one or multiple [`pgbackrest restore`](https://pgbackrest.org/command.html#command-restore) options, appended to the command DBLab Engine builds. The options are appended to a shell command line, so quote any value containing whitespace or glob characters. Do not repeat `--type`, `--stanza`, `--pg1-path` or `--delta`: pgBackRest rejects a single-valued option that is set twice. List options such as `--db-include` may be repeated. Select a repository with the `PGBACKREST_REPO` environment variable rather than with `--repo`, since the generated `archive-get` command reads the variable but does not receive these options. Common examples:
     - `"--db-include=mydb"` - restore only the listed databases
     - `"--process-max=4"` - use more processes for decompression
   - avoid `--recovery-option` in `customOptions`. It is accepted, but it does not stay inside the restore command and its effect depends on the Postgres version: on Postgres 12 and newer pgBackRest writes it to `postgresql.auto.conf`, which Postgres reads *after* the recovery configuration DBLab Engine generates, so the value silently overrides DBLab Engine's own `restore_command`; on Postgres 11 and older pgBackRest writes it to `recovery.conf`, which DBLab Engine then rewrites, so the value is silently dropped. Never set `recovery_target*` this way — promotion relies on `recovery_target=immediate` together with `recovery_target_action=promote`
- `customTool` (key-value, optional) - defines configuration options for custom restoring tool:
   - `command` (string, required) - defines the command to restore data using a custom tool
   - `restore_command` (string, optional) - defines the PostgreSQL [`restore_command`](https://postgresqlco.nf/en/doc/param/restore_command/) configuration option to keep the data up to date; DBLab Engine automatically propagates the specified value to the proper location, depending on the version of PostgreSQL: in versions 11 and older, it is to be stored in `recovery.conf`, while in 12 and newer, it is a part of the main file, `postgresql.conf`

### Job `physicalSnapshot`
Prepares a snapshot for physical restored PostgreSQL database.

Options:
- `skipStartSnapshot` (boolean, optional, default: false) - skip taking a snapshot while the retrieval starts
- `promotion`  (key-value, optional) - promotes PGDATA after data fetching:
   - `enabled`  (boolean, optional, default: false) - enable PGDATA promotion
   - `dockerImage` (string, optional) - specifies the Docker image containing the promotion-compatible PostgreSQL instance
   - `containerConfig` (key-value, optional) - options to pass custom parameters to physicalSnapshot container
   - `healthCheck` (key-value, optional) - describes health check options for a data promotion container:
      - `interval` (int, optional, default: 5) - health check interval for a data promotion container (in seconds)
      - `maxRetries` (int, optional, default: 200) - maximum number of health check retries
   - `queryPreprocessing` (key-value, optional) - defines pre-processing SQL queries
      - `queryPath` (string, optional, default: "") - specifies the path to SQL pre-processing queries; an empty string means that no pre-processing defined
      - `maxParallelWorkers` (integer, optional, default: 2) - defines the worker limit for parallel queries
    - `inline` (string, optional, default: "") - inline SQL queries to execute; if specified, queries from `queryPath` are executed before `inline`
   - `configs` (key-value, optional) - applies PostgreSQL configuration parameters to the promotion instance
- `sysctls` (key-value, optional) - allows configuring namespaced kernel parameters (sysctls) of Docker container for a promotion stage of taking a snapshot. See supported parameters: https://docs.docker.com/reference/cli/docker/container/run/#sysctl
- `preprocessingScript` (string, optional) - path on the host machine to a pre-processing script
- `databaseRename` (key-value, optional) - rename databases before finalizing the snapshot. Runs after `preprocessingScript`. Each entry maps the original database name to the new name. Supported since DBLab Engine 4.1. See [Rename databases during snapshot creation](/docs/dblab-howtos/administration/data/database-rename).
  ```yaml
  databaseRename:
    example_production: example_dblab
    analytics_prod: analytics_dblab
  ```
- `configs` (key-value, optional) - applies PostgreSQL configuration parameters to snapshot. These parameters are inherited by all clones. See also: [How to configure PostgreSQL used by DBLab Engine](/docs/dblab-howtos/administration/postgresql-configuration)
- `envs` (key-value, optional) - passes custom environment variables to the promotion Docker container
- `scheduler` (key-value, required) - contains tasks which run on a schedule:
   - `snapshot` (key-value, optional) - defines rules to create a new snapshot on a schedule:
      - `timetable` (string, required) - defines a timetable in crontab format: https://en.wikipedia.org/wiki/Cron#Overview
   - `retention` (key-value, optional) - defines rules to clean up old snapshots on a schedule:
      - `timetable` (string, required) - defines a timetable in crontab format: https://en.wikipedia.org/wiki/Cron#Overview
      - `limit` (integer, required) -  defines how many snapshots should be held

## Section `cloning`: thin cloning policies
- `accessHost` (string, required) - the host that will be specified in the database connection string to inform users about how to connect to database clones. This should match one of the addresses specified in `provision.cloneAccessAddresses` or be a hostname that resolves to one of those addresses. Use public IP address if database connections are allowed from outside, or "localhost"/private IP for local-only access.
- `maxIdleMinutes` (integer, optional, default: 120) - automatically delete clones after the specified minutes of inactivity, 0 is being used to disable this feature. Inactivity means no active sessions (queries being processed) and no recently logged queries in the query log.
- `protectionLeaseDurationMinutes` (integer, optional, default: 1440) - default protection lease duration in minutes when a clone is marked as protected. When a clone is protected with a lease, it will automatically become unprotected after this duration elapses. Use `0` for infinite protection (no automatic expiration). Supported since DBLab Engine 4.1.
- `protectionMaxDurationMinutes` (integer, optional, default: 10080) - maximum allowed protection duration in minutes. Users cannot request a protection duration longer than this value. Use `0` to remove the limit. Supported since DBLab Engine 4.1.
- `protectionExpiryWarningMinutes` (integer, optional, default: 1440) - send a warning webhook notification the specified number of minutes before a protection lease expires. Supported since DBLab Engine 4.1.

## Section `retention`: automatic deletion of unused branches and snapshots
Supported since DBLab Engine 4.2. A background sweeper deletes branches and snapshots that have stayed unused for longer than the configured window. The sweep is safe-only: an entity that has clones, child branches or child snapshots, is a branch head, or is protected is never removed, and nothing is force-deleted to make room. Both windows default to `0`, so upgrading changes nothing until you opt in.

An entity counts as *unused* when it has no dependents (clones, child branches, child snapshots) and no protection. The sweeper schedules the deletion the first time it sees the entity unused (`now + window`), skips it while the schedule has not been reached, and clears the schedule again if the entity gains a dependent or protection in the meantime. Deleted entities produce the usual `branch_delete` / `snapshot_delete` [webhooks](#section-webhooks-webhook-configuration).

What the sweep does **not** cover:
- the automatic pool-level snapshots created by data retrieval (full refresh) and the physical `_pre` snapshots. These are managed separately: in physical mode, `physicalSnapshot.options.scheduler.retention` (`timetable`, `limit`, see [Job `physicalSnapshot`](#job-physicalsnapshot)) sets how many are kept; in logical mode, older snapshots without clones are removed on each full refresh. Only user snapshots (on branches or created from clones) are candidates for this sweep
- the default branch `main`
- pools without branch metadata (LVM)

Enabling retention, or changing `checkIntervalMinutes`, takes effect only after an engine restart.

- `unusedSnapshotMinutes` (integer, optional, default: 0) - auto-delete a snapshot with no clones or child snapshots after this many minutes unused; `0` disables it
- `unusedBranchMinutes` (integer, optional, default: 0) - auto-delete a branch with no clones or child branches after this many minutes unused; `0` disables it
- `checkIntervalMinutes` (integer, optional, default: 5) - sweep cadence in minutes. Unlike the windows and the per-tick cap, which are re-read on every sweep and picked up on configuration reload, a changed interval needs an engine restart (see above)
- `protectionMaxDurationMinutes` (integer, optional, default: 0) - cap for timed protection of branches and snapshots set via API or CLI (`dblab branch --protected`, `dblab snapshot update --protected`, `PATCH /branch/{name}`, `PATCH /snapshot/{id}`), in minutes; `0` means no cap. Clone protection is capped separately by `cloning.protectionMaxDurationMinutes`
- `maxDeletionsPerTick` (integer, optional, default: 50) - maximum number of entities deleted per sweep; the excess is deferred to the next tick so that a first sweep after downtime cannot flood webhooks

```yaml
retention:
  unusedSnapshotMinutes: 0
  unusedBranchMinutes: 0
  checkIntervalMinutes: 5
  protectionMaxDurationMinutes: 0
  maxDeletionsPerTick: 50
```

## Section `platform`: PostgresAI Platform integration
- `url` (string, optional, default: "https://postgres.ai/api/general") - Platform API URL
- `accessToken` (string, required) - the token for authorization in Platform API. This token can be obtained on the PostgresAI Console
- `enablePersonalTokens` (boolean, optional, default: false) - enables authorization with personal tokens of the organization's members
- `bindClonesToUser` (boolean, optional, default: false) - label each clone created with a personal token with the authenticated user's full email address (`dblab_user`), taken from the identity behind the token rather than from any request parameter. The [Teleport sidecar](/docs/dblab-howtos/administration/teleport-integration#per-user-clone-access) uses this label for per-user clone access. Requires `enablePersonalTokens`. Clones created with the shared `verificationToken` stay unlabeled unless the caller asserts a user with the `X-Forwarded-User-Email` header, which every holder of the shared token may do, so the label is only as trustworthy as the shared token itself. The clone's Postgres username is unchanged. Supported since DBLab Engine 4.2.
- `projectName` (string, optional) - project name for identification in the Platform
- `orgKey` (string, optional) - organization key for Platform integration
- `enableTelemetry` (boolean, optional, default: true) - enable anonymous statistics collection sent to PostgresAI; used to analyze DBLab Engine usage and help development decisions. See [telemetry documentation](https://postgres.ai/docs/database-lab/telemetry) for the full list of collected data points

## Section `observer`: CI Observer configuration
CI Observer helps verify database schema changes (database migrations) automatically in CI/CD pipelines. Available on the PostgresAI Platform.

- `replacementRules` (key-value, optional) - set up rules based on regular expressions (a pair of values `"regexp":"replace"`; to check syntax, use [this document](https://github.com/google/re2/wiki/Syntax )) for Postgres logs that will be sent to the Platform when running Observed Sessions; this helps ensure that sensitive data is masked properly and it doesn't leave the origin

### Log fields affected
Replacement rules apply to the following PostgreSQL log fields: `message`, `detail`, `hint`, `internal_query`, `query`

### Common replacement patterns

#### Masking numeric values
```yaml
observer:
  replacementRules:
    "select \\d+": "select ***"
    "\\d{4}-\\d{2}-\\d{2}": "YYYY-MM-DD"  # Dates
    "\\b\\d{3,}\\b": "***"                # Numbers with 3+ digits
```

#### Masking email addresses
```yaml
observer:
  replacementRules:
    # Keep domain but mask local part
    "[a-z0-9._%+\\-]+(@[a-z0-9.\\-]+\\.[a-z]{2,4})": "***$1"
    # Or mask completely
    "[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,4}": "user@example.com"
```

#### Masking SQL values
```yaml
observer:
  replacementRules:
    # Mask string literals in SQL
    "'[^']*'": "'***'"
    # Mask numeric literals
    "= \\d+": "= ***"
    # Mask IP addresses
    "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b": "XXX.XXX.XXX.XXX"
```

#### Complete example
```yaml
observer:
  replacementRules:
    # Mask emails but keep domain structure
    "[a-z0-9._%+\\-]+(@[a-z0-9.\\-]+\\.[a-z]{2,4})": "***$1"
    # Mask numbers in SELECT statements
    "select \\d+": "select ***"
    # Mask string literals
    "'[^']*'": "'***'"
    # Mask credit card patterns
    "\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b": "XXXX-XXXX-XXXX-XXXX"
    # Mask phone numbers
    "\\b\\d{3}[.-]?\\d{3}[.-]?\\d{4}\\b": "XXX-XXX-XXXX"
```

### Security considerations
- **Test regex patterns** carefully to ensure they match the intended data
- **Use capture groups** (like `$1`) to preserve necessary parts of matched text
- **Order matters** - more specific patterns should come before general ones
- **Validate with sample logs** before deploying to production

## Section `webhooks`: Webhook configuration
Webhooks provide a way to notify external systems about clone lifecycle events. This allows integration with monitoring systems, CI/CD pipelines, or custom automation workflows. Supported since DBLab Engine 4.0.

- `hooks` (list, optional) - defines a list of webhook configurations. Each hook can be triggered by different clone events
  - `url` (string, required) - the HTTP endpoint URL where webhook payloads will be sent via POST request
  - `secret` (string, optional) - optional secret token sent with the request in the `DBLab-Webhook-Token` HTTP header for authentication/verification
  - `trigger` (list of strings, required) - specifies which clone events should trigger this webhook. Available trigger types:
    - `clone_create` - triggered when a new clone is created
    - `clone_reset` - triggered when an existing clone is reset to a different snapshot
    - `clone_upgrade` - triggered when a clone has been [upgraded to a newer Postgres major](/docs/dblab-howtos/cloning/clone-upgrade); the payload has the same fields as `clone_create` except `owner_user`. Supported since DBLab Engine 4.2.
    - `clone_delete` - triggered when a clone is deleted. Supported since DBLab Engine 4.1.
    - `clone_protection_expiring` - triggered when a clone's protection lease is about to expire (based on `protectionExpiryWarningMinutes`). Supported since DBLab Engine 4.1.
    - `clone_protection_expired` - triggered when a clone's protection lease has expired and protection has been automatically removed. Supported since DBLab Engine 4.1.
    - `snapshot_create` - triggered when a new snapshot is created. Supported since DBLab Engine 4.1.
    - `snapshot_delete` - triggered when a snapshot is deleted. Supported since DBLab Engine 4.1.
    - `branch_create` - triggered when a new branch is created. Supported since DBLab Engine 4.1.
    - `branch_delete` - triggered when a branch is deleted. Supported since DBLab Engine 4.1.

### Webhook payload format
Webhook requests are sent as HTTP `POST` with a JSON body. If `secret` is configured, DBLab Engine also sends the `DBLab-Webhook-Token` HTTP header.

Payload shape depends on the event type:
- Basic events (`snapshot_create`, `snapshot_delete`, `branch_create`, `branch_delete`) include:
  - `event_type`
  - `entity_id`
- Clone lifecycle events (`clone_create`, `clone_reset`, `clone_delete`) include:
  - `event_type`
  - `entity_id`
  - `host`
  - `port`
  - `username`
  - `dbname`
  - `container_name`
- Clone protection events (`clone_protection_expiring`, `clone_protection_expired`) include all clone lifecycle fields plus:
  - `protected_till`
  - `expires_in_hours`

### Example payload: `clone_create`
```json
{
  "event_type": "clone_create",
  "entity_id": "clone-1",
  "host": "localhost",
  "port": 5432,
  "username": "user1",
  "dbname": "postgres",
  "container_name": "dblab_clone_5432"
}
```

### Example payload: `clone_protection_expiring`
```json
{
  "event_type": "clone_protection_expiring",
  "entity_id": "clone-1",
  "host": "localhost",
  "port": 5432,
  "username": "user1",
  "dbname": "postgres",
  "container_name": "dblab_clone_5432",
  "protected_till": "2027-01-15T14:00:00Z",
  "expires_in_hours": 24
}
```

### Example configuration
```yaml
webhooks:
  hooks:
    - url: "https://monitoring.example.com/webhook/dblab"
      secret: "webhook-secret-token"
      trigger:
        - clone_create
        - clone_reset
    - url: "https://ci.example.com/api/v1/database-ready"
      trigger:
        - clone_create
```

:::tip
Use webhooks to integrate DBLab Engine with:
- Monitoring and alerting systems
- CI/CD pipeline notifications
- Automated testing workflows
- Custom database provisioning orchestration
:::

## Section `estimator`: Estimator configuration
:::caution
The section has been removed in DBLab Engine 3.4.0
:::
- `readRatio` (float, optional, default: 1) - the ratio evaluating the timing difference for operations involving IO Read between Database Lab and production environments 
- `writeRatio` (float, optional, default: 1) - the ratio evaluating the timing difference for operations involving IO Write between Database Lab and production environments.
- `profilingInterval` (string, optional, default: 10ms) - time interval of samples taken by the profiler
- `sampleThreshold` - (integer, optional, default: 20) - the minimum number of samples sufficient to display the estimation results

## Environment variables
A DBLab config has to hold a source password, and usually cloud storage or WAL-G credentials too. Two mechanisms keep such values out of the file.

### Placeholders in the config file (DBLab Engine 4.2+)
Any config value that is exactly `${VAR}` or `$VAR` is replaced with the environment variable `VAR` when the config is read. This works for every string value in the file, including the retrieval job options, except the `observer.replacementRules` subtree (where `${name}` is a regex backreference), so any credential can be referenced this way:

```yaml
server:
  verificationToken: "${DBLAB_VERIFICATION_TOKEN}"

platform:
  accessToken: "${PGAI_PLATFORM_ACCESS_TOKEN}"

retrieval:
  spec:
    logicalDump:
      options:
        source:
          connection:
            host: "postgres.example.com"
            username: "backup_user"
            password: "${SOURCE_DB_PASSWORD}"
```

```bash
# /etc/dblab/engine.env, owned by root, chmod 600
DBLAB_VERIFICATION_TOKEN=secure_api_token
PGAI_PLATFORM_ACCESS_TOKEN=platform_token
SOURCE_DB_PASSWORD=secure_password_here
```

```bash
docker run --name dblab_server --env-file /etc/dblab/engine.env ...
```

Passing the values inline (`-e VAR=value`) also works but leaves the secrets in the shell history and the process list. A bare `-e VAR` forwards the variable from the calling environment without writing the value on the command line, but note that `sudo docker run` resets the environment by default, so the variable is silently dropped unless you run `sudo --preserve-env=VAR docker run ...`; `--env-file` is not affected by `sudo`.

Rules:
- Only a *whole* value is a placeholder. A value that merely contains a `$` (a password, a regex backreference such as `***$1` in `observer.replacementRules`, a dollar-quoted SQL block) is a literal and reaches its consumer untouched, so nothing needs escaping.
- An unset variable is a startup failure. A config that silently loses its verification token is worse than one that refuses to start.
- Quoting decides the resulting type: a quoted placeholder is always a string, while an unquoted one can also stand in for a numeric or boolean setting (spell booleans `true` and `false`; `yes` and `no` stay strings).
- The admin API and the UI Configuration page keep the placeholder text rather than the resolved value, so saving the configuration from the UI cannot persist a resolved secret into the file. They also refuse to *introduce* a placeholder the file on disk does not already reference; new placeholders are added by editing the file.
- The `dblab` CLI accepts the same `${VAR}` form for the environment token (`dblab init --token '${DBLAB_TOKEN}'`) and fails when the variable is unset.

The variable names above (`DBLAB_VERIFICATION_TOKEN`, `PGAI_PLATFORM_ACCESS_TOKEN`) are the ones used in the example configs; any name works. The 4.2 example configs ship with `verificationToken: "${DBLAB_VERIFICATION_TOKEN}"`, so an engine started from an unedited example needs that variable set or it refuses to start.

### `PGPASSWORD` for the logical dump source
For the `logicalDump` job, the environment variable `PGPASSWORD` set on the DBLab Engine container is used as the source password when `source.connection.password` is empty, and takes precedence over it when both are set. On DBLab Engine 4.2+ prefer a `${VAR}` placeholder in `password`, which behaves the same for every job type.

### Security best practices
- **Keep credentials out of the configuration file**: reference them with placeholders (4.2+) or `PGPASSWORD`
- **Use Docker secrets or Kubernetes secrets** to populate the environment variables
- **Rotate credentials regularly** and restart or reload the engine after updating the environment

## Section `diagnostic`: Diagnostic collection configuration
- `logsRetentionDays` (integer, optional, default: 7) - the number of days after which collected containers logs will be discarded
