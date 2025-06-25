---
title: DBLab Engine configuration reference
sidebar_label: DBLab Engine configuration
---

## Overview
DBLab Engine behavior can be controlled using the main configuration file that has YAML format. This reference describes available configuration options.

:::tip
DBLab Engine supports [YAML 1.2](https://yaml.org/spec/1.2/spec.html) including anchors, aliases, tags, map merging.
:::

Example config files can be found here: https://gitlab.com/postgres-ai/database-lab/-/tree/v3.5.0/configs.

You may store configuration files in any suitable location. The recommended location of configuration files for DBLab Engine is `~/.dblab/engine/configs`.

In addition, DBLab Engine provides functionality for storing information about current sessions and the state of the instance.
The recommended location of metadata files is `~/.dblab/engine/meta`. Note the metadata folder must be writable.

:::info
Make sure that the file name is `server.yml` and its directory is mounted to `/home/dblab/configs` inside the DBLab Engine container. 
:::

Useful guides that help manage DBLab Engine:
- [How to configure and start DBLab Engine](/docs/how-to-guides/administration/engine-manage#configure-and-start-a-database-lab-engine-instance)
- [Reconfigure DBLab Engine without downtime](/docs/how-to-guides/administration/engine-manage#reconfigure-database-lab-engine)

:::tip
The configuration of DBLab Engine can be reloaded without downtime:

```shell
docker exec -it dblab_server kill -SIGHUP 1
docker logs --since 1m dblab_server
``` 
:::

## YAML Anchors and Configuration Patterns

DBLab Engine configuration extensively uses YAML anchors and aliases to reduce repetition and maintain consistency across different configuration sections. This approach allows you to define common configuration patterns once and reuse them throughout the configuration file.

### Basic YAML Anchors Syntax
- `&anchor_name` - defines an anchor (creates a reusable reference)
- `*anchor_name` - uses an anchor (references the defined anchor)
- `<<: *anchor_name` - merges an anchor into the current mapping (inheritance)

### Common Configuration Patterns

#### Database Container Configuration (`databaseContainer`)
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

#### Database Configuration Parameters (`databaseConfigs`)
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

### Best Practices for YAML Anchors

1. **Define anchors at the top level** of your configuration file for better readability
2. **Use descriptive names** that clearly indicate the purpose (e.g., `&db_container`, `&db_configs`)
3. **Combine anchors when needed** - you can use multiple `<<:` merge operators in the same section
4. **Override specific values** - anchor merging allows you to override individual values while keeping the rest

### Example: Combining Multiple Anchors
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
| `retrieval` | Defines the data flow: a series of "jobs" for initial retrieval of the data, and, optionally, continuous data synchronization with the source, snapshot creation and retention policies. The initial retrieval may be either "logical" (dump/restore) or "physical" (based on replication or restoration from a archive). |
| `cloning` | Thin cloning policies.                                                                                                                                                                                                                                                                                                    |
| `platform` | Postgres AI Platform integration (provides GUI, advanced features such as user management, logs).                                                                                                                                                                                                                         |
| `observer` | CI Observer configuration. CI Observer helps verify database schema changes (database migrations) automatically, in CI/CD pipelines. Available on the Postgres AI Platform.                                                                                                                                               |
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
- `verificationToken` (string, required) - the token that is used to work with Database Lab API
- `host` (string, optional) - The host which the DBLab Engine API server accepts HTTP connections from. An empty string (default) means "all available addresses".
- `port` (string, required, default: 2345) - HTTP server port
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
- `useSudo` (boolean, optional, default: false) - use sudo for ZFS/LVM and Docker commands if Database Lab server running outside a container
- `keepUserPasswords` (bool, optional, default: "false") - By default, in addition to creating a new user with administrative privileges, DBLab Engine resets passwords for all existing users. This is done for security reasons. If this behavior is undesirable and you want to keep the ability authenticate for the existing users with their unchanged passwords, then set the value of the variable to `true`.
- `containerConfig` (key-value, optional) - options to pass custom parameters to clone containers
- `cloneAccessAddresses` (string, optional, default: "127.0.0.1") - IP addresses that can be used to access clones. By default, use a loop-back to accept only local connections. The empty string means "all available addresses". The option supports multiple IPs (using comma-separated format) and IPv6 addresses (for example, `[::1]`)

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
- `dumpLocation` (string, required) - specifies the location to store dump files (or directories, for directory-format archives), it will be automatically created on the host machine. DBLab Engine deletes all files and directories in this directory before creating new dumps.
- `dockerImage` (string, required) - specifies the Docker image containing the dump-required tool
- `containerConfig` (key-value, optional) - options to pass custom parameters to logicalDump container. Supports standard Docker container configuration options such as memory limits, CPU limits, volumes, etc. Can be inherited using YAML anchors (see `databaseContainer` pattern above)
  - Example: `"memory": "2gb"`, `"cpus": "1.5"`, `"shm-size": "1gb"`
- `source` (key-value, required) - describes source of data:
   - `type` (string, required) -  defines location type of a dumped database. Available values: `local`, `remote`, `rdsIam`
   - `connection` (key-value, required) - defines connection parameters of source:
      - `dbname` (string, required) - database name used for connection purposes; also see `logicalDump.databases`
      - `host` (string, required) - defines hostname of the database
      - `port` (integer, optional, default: 5432) - defines port of the database
      - `username` (string, optional, default: postgres) - defines database username to connect to the database
      - `password` (string, optional, default: "") - defines username password to connect to the database; the environment variable PGPASSWORD can be used instead of this option; the environment variable has a higher priority
   - `rdsIam` (key-value, optional) - contains options specific for RDS IAM source type
      - `awsRegion` (string, required) - AWS Region where RDS is located
      - `dbInstanceIdentifier` (string, required) - RDS instance Identifier
      - `sslRootCert` (string, required) - path on the host machine to the SSL root certificate. You can download it from https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem 
- `parallelJobs` (integer, optional, default: 1) - defines the number of concurrent jobs using the `pg_dump` option `jobs`. This option can dramatically reduce the time to dump a large database
- `databases` (key-value, optional) - defines options for specifying the database list that must be copied. By default, DBLab Engine dumps and restores all available databases. Do not specify the databases section to take all databases. Available options for each database: `tables`
   - `tables` (list of strings, optional) - dumps definition and/or data of only the listed tables. Do not specify the tables section to dump all available tables
   - `excludeTables` (list of strings, optional) - excludes all tables matching any of the patterns from the dump. Accept specific schemas and tables or will allow for wildcards (*) for more flexibility.
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
- `containerConfig` (key-value, optional) - options to pass custom parameters to logicalRestore container
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
- `dataPatching` (key-value, optional) - defines SQL queries for data patching. This allows you to run custom SQL queries against the restored database before creating the snapshot, useful for data masking, test data setup, or schema modifications
  - `dockerImage` (string, optional) - specifies the Docker image to run a data patching container. Can be inherited using YAML anchors (see `databaseContainer` pattern above)
  - `containerConfig` (key-value, optional) - options to pass custom parameters to data patching container. Supports standard Docker options like memory/CPU limits
  - `queryPreprocessing` (key-value, optional) - defines pre-processing parameters
    - `queryPath` (string, optional, default: "") - specifies the path to SQL pre-processing queries; an empty string means that no pre-processing defined
    - `maxParallelWorkers` (integer, optional, default: 2) - defines the worker limit for parallel queries. Parallelization doesn't work for inline SQL queries
    - `inline` (string, optional, default: "") - inline SQL queries to execute; if specified, queries from `queryPath` are executed before `inline`
- `preprocessingScript` (string, optional) - path on the host machine to a pre-processing script
- `configs` (key-value, optional) - applies PostgreSQL configuration parameters when preparing a working snapshot. These parameters are inherited by all clones. See also: [How to configure PostgreSQL used by DBLab Engine](/docs/how-to-guides/administration/postgresql-configuration)

### Job `physicalRestore`
Restores data from a physical backup.

Supported restore tools:
- WAL-G (`walg`) - an archival restoration tool for PostgreSQL, it uses LZ4, LZMA, or Brotli compression, multiple processors, and non-exclusive base backups for Postgres ([GitHub](https://github.com/wal-g/wal-g))
- pgBackRest (`pgbackrest`) - a reliable, easy-to-use backup and restore solution that can seamlessly scale up to the largest databases and workloads by utilizing algorithms that are optimized for database-specific requirements ([GitHub](https://github.com/pgbackrest/pgbackrest)); supported since DBLab Engine 3.1
- Custom (`custom`) - allows defining own command to restore data

Options:
- `tool` (string, required) - defines the tool to restore data. See available restore tools list
- `dockerImage` (string, required) - specifies the Docker image containing the restoring tool
- `containerConfig` (key-value, optional) - options to pass custom parameters to physicalRestore container
- `sync`  (key-value, optional) - keep PGDATA up to date after (replaying new WALs from the source) the initial data fetching:
   - `enabled` (boolean, optional, default: false) - runs a separate container to keep Database Lab data up to date
   - `healthCheck` (key-value, optional) - describes health check options for the  sync container:
      - `interval` (int, optional, default: 5) - health check interval for the data sync container (in seconds)
      - `maxRetries` (int, optional, default: 200) - maximum number of health check retries
   - `configs` (key-value, optional) - applies PostgreSQL configuration parameters to the sync instance
- `envs` (key-value, optional) - passes custom environment variables to the Docker container with the restoring tool
- `walg` (key-value, optional) - defines WAL-G configuration options:
   - `backupName` (string, required) - defines the backup name to restore
- `pgbackrest` (key-value, optional) - defines pgBackRest configuration options:
   - `stanza` (string, required) - defines the stanza name to restore ([pgBackrest docs](https://pgbackrest.org/user-guide.html#quickstart/configure-stanza))
   - `delta` (boolean, optional, default: false) - defines usage `--delta` option for restore using checksums ([pgBackRest docs](https://pgbackrest.org/user-guide.html#restore/option-delta))
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
- `configs` (key-value, optional) - applies PostgreSQL configuration parameters to snapshot. These parameters are inherited by all clones. See also: [How to configure PostgreSQL used by DBLab Engine](/docs/how-to-guides/administration/postgresql-configuration)
- `envs` (key-value, optional) - passes custom environment variables to the promotion Docker container
- `scheduler` (key-value, required) - contains tasks which run on a schedule:
   - `snapshot` (key-value, optional) - defines rules to create a new snapshot on a schedule:
      - `timetable` (string, required) - defines a timetable in crontab format: https://en.wikipedia.org/wiki/Cron#Overview
   - `retention` (key-value, optional) - defines rules to clean up old snapshots on a schedule:
      - `timetable` (string, required) - defines a timetable in crontab format: https://en.wikipedia.org/wiki/Cron#Overview
      - `limit` (integer, required) -  defines how many snapshots should be held

## Section `cloning`: thin cloning policies
- `accessHost` (string, required) - the host that will be specified in the database connection string to inform users about how to connect to database clones. This should match one of the addresses specified in `provision.cloneAccessAddresses` or be a hostname that resolves to one of those addresses. Use public IP address if database connections are allowed from outside, or "localhost"/private IP for local-only access.
- `maxIdleMinutes` (integer, optional, default: 0) - automatically delete clones after the specified minutes of inactivity, 0 is being used to disable this feature. Inactivity means no active sessions (queries being processed) and no recently logged queries in the query log.

## Section `platform`: Postgres AI Platform integration
- `url` (string, optional, default: "https://postgres.ai/api/general") - Platform API URL
- `accessToken` (string, required) - the token for authorization in Platform API. This token can be obtained on the Postgres AI Console
- `enablePersonalTokens` (boolean, optional, default: false) - enables authorization with personal tokens of the organization's members
- `projectName` (string, optional) - project name for identification in the Platform
- `orgKey` (string, optional) - organization key for Platform integration
- `enableTelemetry` (boolean, optional, default: true) - enable anonymous statistics collection sent to Postgres AI; used to analyze DBLab Engine usage and help development decisions. See [telemetry documentation](https://postgres.ai/docs/database-lab/telemetry) for the full list of collected data points

## Section `observer`: CI Observer configuration
CI Observer helps verify database schema changes (database migrations) automatically in CI/CD pipelines. Available on the Postgres AI Platform.

- `replacementRules` (key-value, optional) - set up rules based on regular expressions (a pair of values `"regexp":"replace"`; to check syntax, use [this document](https://github.com/google/re2/wiki/Syntax )) for Postgres logs that will be sent to the Platform when running Observed Sessions; this helps ensure that sensitive data is masked properly and it doesn't leave the origin

### Log Fields Affected
Replacement rules apply to the following PostgreSQL log fields: `message`, `detail`, `hint`, `internal_query`, `query`

### Common Replacement Patterns

#### Masking Numeric Values
```yaml
observer:
  replacementRules:
    "select \\d+": "select ***"
    "\\d{4}-\\d{2}-\\d{2}": "YYYY-MM-DD"  # Dates
    "\\b\\d{3,}\\b": "***"                # Numbers with 3+ digits
```

#### Masking Email Addresses
```yaml
observer:
  replacementRules:
    # Keep domain but mask local part
    "[a-z0-9._%+\\-]+(@[a-z0-9.\\-]+\\.[a-z]{2,4})": "***$1"
    # Or mask completely
    "[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,4}": "user@example.com"
```

#### Masking SQL Values
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

#### Complete Example
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

### Security Considerations
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

### Webhook payload format
Webhook requests are sent as HTTP POST with JSON payload containing:
- Event type (matching the trigger)
- Clone information (ID, port, connection details)
- Timestamp of the event
- Instance information

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

## Environment Variables
DBLab Engine supports several environment variables that can override configuration file settings or provide sensitive data like passwords. Environment variables have higher priority than configuration file values.

### Supported Environment Variables

#### Database Connection
- `PGPASSWORD` - PostgreSQL password for source database connections. Overrides `password` in job configurations
- `PGUSER` - PostgreSQL username. Can override `username` in job configurations  
- `PGHOST` - PostgreSQL hostname. Can override `host` in job configurations
- `PGPORT` - PostgreSQL port. Can override `port` in job configurations
- `PGDATABASE` - PostgreSQL database name. Can override `dbname` in job configurations

#### AWS/Cloud Integration  
- `AWS_ACCESS_KEY_ID` - AWS access key for S3/RDS access
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_SESSION_TOKEN` - AWS session token (for temporary credentials)
- `AWS_REGION` - AWS region (can override `awsRegion` in RDS IAM configuration)

#### WAL-G Configuration
- `WALG_S3_PREFIX` - S3 prefix for WAL-G backups
- `WALG_COMPRESSION_METHOD` - compression method for WAL-G
- `WALG_S3_STORAGE_CLASS` - S3 storage class

#### Platform Integration
- `DLE_PLATFORM_ACCESS_TOKEN` - Platform access token (overrides `platform.accessToken`)
- `DLE_VERIFICATION_TOKEN` - API verification token (overrides `server.verificationToken`)

### Priority Order
When the same parameter is defined in multiple places, DBLab Engine uses this priority order:
1. **Environment variables** (highest priority)
2. **Configuration file values**
3. **Default values** (lowest priority)

### Security Best Practices
- **Use environment variables for sensitive data** like passwords and tokens
- **Avoid putting credentials in configuration files** in production
- **Use Docker secrets or Kubernetes secrets** to manage environment variables securely
- **Rotate credentials regularly** and update environment variables accordingly

### Example Usage
```yaml
# Configuration file - no sensitive data
retrieval:
  spec:
    logicalDump:
      options:
        source:
          connection:
            host: "postgres.example.com"
            port: 5432
            username: "backup_user"
            # password: "" # Use PGPASSWORD environment variable instead
```

```bash
# Environment variables - sensitive data
export PGPASSWORD="secure_password_here"
export DLE_VERIFICATION_TOKEN="secure_api_token"
export AWS_ACCESS_KEY_ID="your_access_key"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
```

## Section `diagnostic`: Diagnostic collection configuration
- `logsRetentionDays` (integer, optional, default: 7) - the number of days after which collected containers logs will be discarded
