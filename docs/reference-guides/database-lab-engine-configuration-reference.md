---
title: Database Lab Engine configuration reference
sidebar_label: Database Lab Engine configuration
---

## Overview
Database Lab Engine behavior can be controlled using the main configuration file that has YAML format. This reference describes available configuration options.

:::tip
Database Lab Engine supports [YAML 1.2](https://yaml.org/spec/1.2/spec.html) including anchors, aliases, tags, map merging.
:::

Example config files can be found here: https://gitlab.com/postgres-ai/database-lab/-/tree/2.5.0/configs.

You may store configuration files in any suitable location. The recommended location of configuration files for Database Lab Engine is `~/.dblab/engine/configs`.

In addition, Database Lab Engine provides functionality for storing information about current sessions and the state of the instance.
The recommended location of metadata files is `~/.dblab/engine/meta`. Note the metadata folder must be writable.

:::info
Make sure that the file name is `server.yml` and its directory is mounted to `/home/dblab/configs` inside the DLE container. 
:::

Useful guides that help manage Database Lab Engine:
- [How to configure and start Database Lab Engine](/docs/how-to-guides/administration/engine-manage#configure-and-start-a-database-lab-engine-instance)
- [Reconfigure Database Lab Engine without downtime](/docs/how-to-guides/administration/engine-manage#reconfigure-database-lab-engine)

:::tip
The configuration of Database Lab Engine can be reloaded without downtime:

```shell
docker exec -it dblab_server kill -SIGHUP 1
docker logs --since 1m dblab_server
``` 
:::

## The list of configuration sections
Here is how the configuration file is structured:

| Section | Description |
| --- | --- |
| `global` | Global parameters such as path to data directory or enabling debugging. |
| `server` | Database Lab Engine API server. |
| `poolManager` | Manages filesystem pools or volume groups. |
| `provision` | How thin cloning is organized.  |
| `retrieval` | Defines the data flow: a series of "jobs" for initial retrieval of the data, and, optionally, continuous data synchronization with the source, snapshot creation and retention policies. The initial retrieval may be either "logical" (dump/restore) or "physical" (based on replication or restoration from a archive). |
| `cloning` | Thin cloning policies. |
| `platform` | Postgres.ai Platform integration (provides GUI, advanced features such as user management, logs). |
| `observer` | CI Observer configuration. CI Observer helps verify database schema changes (database migrations) automatically, in CI/CD pipelines. Available on the Postgres.ai Platform. |
| `estimator` | Estimator configuration. Estimator estimates a timing of queries on the production database.

## Section `global`: global parameters
- `engine` - defines the Database Lab Engine. Supported engines: `postgres`
- `debug` - allows seeing more in the Database Lab Engine logs; WARNING: in this mode, sensitive data (such as passwords) can be printed to logs
- `database` (key-value, optional) - contains default configuration options of the restored database
  - `username` (string, optional, default: "postgres") - a default username for logical/physical restore jobs
  - `dbname` (string, optional, default: "postgres") - a default database name for logical/physical restore jobs

## Section `server`: Database Lab Engine API server
- `verificationToken` (string, required) - the token that is used to work with Database Lab API
- `host` (string, optional, default: "") - the host to which the Database Lab server accepts HTTP connections
- `port` (string, required) - HTTP server port

## Section `poolManager`: filesystem pools or volume groups management
- `mountDir` (string, required) - specifies the location of the pools mount directory (can contain multiple pool directories)
- `dataSubDir` (string, optional, default: "") - specifies the location of restored data by Database Lab Engine relative to the pool which is placed inside the mount directory (`mountDir`)
- `clonesMountSubDir` (string, required) -  the directory that will be used to mount clones
- `socketSubDir` (string, required) - the UNIX socket directory that will be used to establish local connections to cloned databases
- `preSnapshotSuffix` (string, required) - the suffix to denote preliminary snapshots
- `selectedPool` (string, optional, default: "") - enforce selection of the working pool (or dataset) inside the `mountDir` directory. If this option is specified, it disables the automatic rotation of multiple pools, which may be useful when multiple DLEs are running on the same machine, sharing the same set of pools. An empty string turns off this feature, enabling the standard pool selection and rotation mechanism (default behavior).

## Section `provision`: thin cloning environment settings
- `portPool` (key-value, required) - defines a pool of ports for Postgres clones
  - `from` (integer, required) - the lowest port value in the pool
  - `to` (integer, required) - the highest port value in the pool
- `dockerImage` (string, required) - the Postgres Docker image that to be used when cloning
- `useSudo` (boolean, optional, default: false) - use sudo for ZFS/LVM and Docker commands if Database Lab server running outside a container
- `keepUserPasswords` (bool, optional, default: "false") - By default, in addition to creating a new user with administrative privileges, Database Lab Engine resets passwords for all existing users. This is done for security reasons. If this behavior is undesirable and you want to keep the ability authenticate for the existing users with their unchanged passwords, then set the value of the variable to `true`.
- `containerConfig` (key-value, optional) - options to pass custom parameters to clone containers

## Section `retrieval`: data retrieval
- `refresh` (key-value, optional) - describes configuration for a full refresh.
  - `timetable` (string, optional, default: "") - defines a timetable in crontab format: https://en.wikipedia.org/wiki/Cron#Overview
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
Dumps a PostgreSQL database from a provided source to an archive or to the Database Lab Engine instance.

Options:
- `dumpLocation` (string, required) - specifies the location to store dump files (or directories, for directory-format archives), it will be automatically created on the host machine
- `dockerImage` (string, required) - specifies the Docker image containing the dump-required tool
- `containerConfig` (key-value, optional) - options to pass custom parameters to logicalDump container
- `source` (key-value, required) - describes source of data:
   - `type` (string, required) -  defines location type of a dumped database. Available values: `local`, `remote`, `rdsIam`
   - `connection` (key-value, required) - defines connection parameters of source:
      - `dbname` (string, required) - defines the database dbname to be restored
      - `host` (string, required) - defines hostname of the database
      - `port` (integer, optional, default: 5432) - defines port of the database
      - `username` (string, optional, default: postgres) - defines database username to connect to the database
      - `password` (string, optional, default: "") - defines username password to connect to the database; the environment variable PGPASSWORD can be used instead of this option; the environment variable has a higher priority
   - `rdsIam` (key-value, optional) - contains options specific for RDS IAM source type
      - `awsRegion` (string, required) - AWS Region where RDS is located
      - `dbInstanceIdentifier` (string, required) - RDS instance Identifier
      - `sslRootCert` (string, required) - path on the host machine to the SSL root certificate. You can download it from https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem 
- `parallelJobs` (integer, optional, default: 1) - defines the number of concurrent jobs using the `pg_dump` option `jobs`. This option can dramatically reduce the time to dump a large database
- `databases` (key-value, optional) - defines options for specifying the database list that must be copied. By default, DLE dumps and restores all available databases. Do not specify the databases section to take all databases. Available options for each database: `tables`
   - `tables` (list of strings, optional) - dumps definition and/or data of only the listed tables. Do not specify the tables section to dump all available tables
- `immediateRestore` (key-value, optional) - provides options for direct restore to a Database Lab Engine instance.
   - `enabled` (boolean, optional, default: false) - enable immediate restore.
   - `forceInit` (boolean, optional, default: false) - init data even if the Postgres directory (see the configuration options `global.mountDir` and `global.dataSubDir`) is not empty; note the existing data might be overwritten

### Job `logicalRestore`
Restores a PostgreSQL database from an archive created by pg_dump in one of the non-plain-text formats.

Options:
- `dumpLocation` (string, required) - specifies the location of the archive files (or directories, for directory-format archives) on the host machine to be restored
- `dockerImage` (string, required) - specifies the Docker image containing the restore-required tool
- `containerConfig` (key-value, optional) - options to pass custom parameters to logicalRestore container
- `forceInit` (boolean, optional, default: false) - init data even if the Postgres directory (see the configuration options `global.mountDir` and `global.dataSubDir`) is not empty; note the existing data might be overwritten
- `parallelJobs` (integer, optional, default: 1) - defines the number of concurrent jobs using the `pg_restore` option `jobs`. This option can dramatically reduce the time to restore a large database to a server running on a multiprocessor machine
- `databases` (key-value, optional) - defines options for specifying the database list that must be restored. By default, DLE restores all available databases. Do not specify the databases section to restore all databases. Available options for each database: `tables`, `format`
    - `format` (string, optional, default: "") - defines a dump format. Available formats: `directory`, `custom`, `plain`. Default format: `directory`. See the description of each format in the [official PostgreSQL documentation](https://www.postgresql.org/docs/current/app-pgdump.html).
    - `compression` (string, optional, default: "no") - defines a compression type for plain-text dumps. Available compression types: `gzip`, `bzip2`, `no`.
    - `tables` (list of strings, optional) - restores definition and/or data of only the listed tables. Do not specify the tables section to restore all available tables

### Job `logicalSnapshot`
Prepares a snapshot for logical restored PostgreSQL database.

Options:
- `dataPatching` (key-value, optional) - defines SQL queries for data patching
  - `dockerImage` (string, optional) - specifies the Docker image to run a data patching container
  - `containerConfig` (key-value, optional) - options to pass custom parameters to data patching container
  - `queryPreprocessing` (key-value, optional) - defines pre-processing parameters
    - `queryPath` (string, optional, default: "") - specifies the path to SQL pre-processing queries; an empty string means that no pre-processing defined
    - `maxParallelWorkers` (integer, optional, default: 2) - defines the worker limit for parallel queries
- `preprocessingScript` (string, optional) - path on the host machine to a pre-processing script
- `configs` (key-value, optional) - applies PostgreSQL configuration parameters when preparing a working snapshot. These parameters are inherited by all clones. See also: [How to configure PostgreSQL used by Database Lab Engine](/docs/how-to-guides/administration/postgresql-configuration)

### Job `physicalRestore`
Restores data from a physical backup.

Supported restore tools:
- WAL-G (`walg`) - is an archival restoration tool (https://github.com/wal-g/wal-g)
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
- `customTool` (key-value, optional) - defines configuration options for custom restoring tool:
   - `command` (string, required) - defines the command to restore data using a custom tool
   - `restore_command` (string, optional) - defines the PostgreSQL [`restore_command`](https://postgresqlco.nf/en/doc/param/restore_command/) configuration option to keep the data up to date; Database Lab Engine automatically propagates the specified value to the proper location, depending on the version of PostgreSQL: in versions 11 and older, it is to be stored in `recovery.conf`, while in 12 and newer, it is a part of the main file, `postgresql.conf`

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
   - `configs` (key-value, optional) - applies PostgreSQL configuration parameters to the promotion instance
- `sysctls` (key-value, optional) - allows configuring namespaced kernel parameters (sysctls) of Docker container for a promotion stage of taking a snapshot. See supported parameters: https://docs.docker.com/engine/reference/commandline/run/#configure-namespaced-kernel-parameters-sysctls-at-runtime
- `preprocessingScript` (string, optional) - path on the host machine to a pre-processing script
- `configs` (key-value, optional) - applies PostgreSQL configuration parameters to snapshot. These parameters are inherited by all clones. See also: [How to configure PostgreSQL used by Database Lab Engine](/docs/how-to-guides/administration/postgresql-configuration)
- `envs` (key-value, optional) - passes custom environment variables to the promotion Docker container
- `scheduler` (key-value, required) - contains tasks which run on a schedule:
   - `snapshot` (key-value, optional) - defines rules to create a new snapshot on a schedule:
      - `timetable` (string, required) - defines a timetable in crontab format: https://en.wikipedia.org/wiki/Cron#Overview
   - `retention` (key-value, optional) - defines rules to clean up old snapshots on a schedule:
      - `timetable` (string, required) - defines a timetable in crontab format: https://en.wikipedia.org/wiki/Cron#Overview
      - `limit` (integer, required) -  defines how many snapshots should be held

## Section `cloning`: thin cloning policies
- `accessHost` (string, required) - the host that will be specified in the database connection string to inform users about how to connect to database clones
- `maxIdleMinutes` (integer, optional, default: 0) - automatically delete clones after the specified minutes of inactivity, 0 is being used to disable this feature

## Section `platform`: Postgres.ai Platform integration
- `url` (string, optional, default: "https://postgres.ai/api/general") - Platform API URL
- `accessToken` (string, required) - the token for authorization in Platform API. This token can be obtained on the Postgres.ai Console
- `enablePersonalTokens` (boolean, optional, default: false) - enables authorization with personal tokens of the organization's members

## Section `observer`: CI Observer configuration
- `replacementRules` (key-value, optional) - set up rules based on regular expressions (a pair of values `"regexp":"replace"`; to check syntax, use [this document](https://github.com/google/re2/wiki/Syntax )) for Postgres logs that will be sent to the Platform when running Observed Sessions; this helps ensure that sensitive data is masked properly and it doesn't leave the origin
Replacement rules applies to the following log fields: `message`, `detail`, `hint`, `internal_query`, `query`
  
## Section `estimator`: Estimator configuration
- `readRatio` (float, optional, default: 1) - the ratio evaluating the timing difference for operations involving IO Read between Database Lab and production environments 
- `writeRatio` (float, optional, default: 1) - the ratio evaluating the timing difference for operations involving IO Write between Database Lab and production environments.
- `profilingInterval` (string, optional, default: 10ms) - time interval of samples taken by the profiler
- `sampleThreshold` - (integer, optional, default: 20) - the minimum number of samples sufficient to display the estimation results
