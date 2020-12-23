---
title: Database Lab Engine configuration reference
sidebar_label: Database Lab Engine configuration
---

## Overview
Database Lab Engine behavior can be controlled using the main configuration file that has YAML format. This reference describes available configuration options.

Example config files can be found here: https://gitlab.com/postgres-ai/database-lab/-/tree/v2.0/configs.

The file can be placed anywhere. When running Database Lab Engine in a Docker container, it is supposed to be passed via using `--volume` option of the `docker run` command. For example, if the config file is located at `~/.dblab/server.yml` and mount point for the data is located at `/var/lib/dblab`, then Database Lab Engine can be started using the following snippet:

```shell
sudo docker run \
  --detach \
  --name dblab_test \
  --label dblab_control \
  --privileged \
  --publish 2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab:rshared \
  --volume ~/.dblab/server.yml:/home/dblab/configs/config.yml \
  postgresai/dblab-server:2.1-latest
```

:::tip
The configuration of Database Lab Engine can be reloaded without downtime:

`docker exec -it dblab_test kill -SIGHUP 1` 
:::

## The list of configuration sections
Here is how the configuration file is structured:

| Section | Description |
| --- | --- |
| `global` | Global parameters such as path to data directory or enabling debugging. |
| `server` | Database Lab Engine API server. |
| `provision` | How thin cloning is organized.  |
| `retrieval` | Defines the data flow: a series of "jobs" for initial retrieval of the data, and, optionally, continuous data synchronization with the source, snapshot creation and retention policies. The initial retrieval may be either "logical" (dump/restore) or "physical" (based on replication or restoration from a archive). |
| `cloning` | Thin cloning policies. |
| `platform` | Postgres.ai Platform integration (provides GUI, advanced features such as user management, logs). |
| `observer` | CI Observer configuration. CI Observer helps verify database schema changes (database migrations) automatically, in CI/CD pipelines. Available on the Postgres.ai Platform. |

## Section `global`: global parameters
- `engine` - defines the Database Lab Engine. Supported engines: `postgres`
- `mountDir` - specifies the location of the pool mount directory
- `dataSubDir` - specifies the location of restored data by Database Lab Engine relative to the pool mount directory (`mountDir`)
- `debug` - allows seeing more in the Database Lab Engine logs
- `database` (key-value, optional) - contains default configuration options of the restored database
  - `username` (string, optional, default: "postgres") - a default username for logical/physical restore jobs
  - `dbname` (string, optional, default: "postgres") - a default database name for logical/physical restore jobs

## Section `server`: Database Lab Engine API server
- `verificationToken` (string, required) - the token that is used to work with Database Lab API
- `host` (string, optional, default: "") - the host to which the Database Lab server accepts HTTP connections
- `port` (string, required) - HTTP server port

## Section `provision`: thin cloning environment settings
- `pgMgmtUsername` (string, optional, default: "postgres") - database username that will be used for Postgres management connections
- `options` (key-value, required) - options related to provisioning
    - `thinCloneManager` (string, required) - thin-clone managing module used for thin cloning
    - `pool` (string, required) - the name of pool (in the case of ZFS) or volume group with logic volume name (in the case of LVM)
    - `portPool` (key-value, required) - defines a pool of ports for Postgres clones
      - `from` (integer, required) - the lowest port value in the pool
      - `to` (integer, required) - the highest port value in the pool
    - `clonesMountDir` (string, optional, default: "/var/lib/dblab/clones/") - the directory that will be used to mount clones
    - `unixSocketDir` (string, optional, default: "/var/lib/dblab/sockets/") - the UNIX socket directory that will be used to establish local connections to cloned databases
    - `preSnapshotSuffix` (string, required) - the suffix to denote preliminary snapshots
    - `dockerImage` (string, required) - the Postgres Docker image that to be used when cloning
    - `useSudo` (boolean, optional, default: false) - use sudo for ZFS/LVM and Docker commands if Database Lab server running outside a container

## Section `retrieval`: data retrieval
- `jobs` - declares the set of running jobs. Stages must be defined in the `spec` section
- `spec` - contains a configuration spec for each job

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

Note, that all jobs are optional. For example, all of the following approaches defining the initial data retrieval process are allowed:
- You may consider using both `logicalDump` and `logicalRestore` to make a dump to a file and then restore from it
- You may use only `logicalRestore` and restore from an already prepared dump file
- You may use only `logicalDump`, without `logicalRestore` (however, this approach makes sense only if you define `immediateRestore` option in the `logicalDump` job, to perform dump & restore on-the-fly, without saving the dump to a file)

### Job `logicalDump`
Dumps a PostgreSQL database from a provided source to an archive or to the Database Lab Engine instance.

Options:
- `dumpLocation` (string, required) - the dump file (or directory, for a directory-format archive) will be automatically created on this location on the host machine
- `dockerImage` (string, required) - specifies the Docker image containing the dump-required tool
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
- `partial` (key-value, optional) - defines options for partial dumping. Available options: `tables`:
   - `tables` (list of strings, optional) - dumps definition and/or data of only the listed tables
- `immediateRestore` (key-value, optional) - provides options for direct restore to a Database Lab Engine instance. 
   - `forceInit` (boolean, optional, default: false) - init data even if the Postgres directory (see the configuration options `global.mountDir` and `global.dataSubDir`) is not empty; note the existing data might be overwritten

### Job `logicalRestore`
Restores a PostgreSQL database from an archive created by pg_dump in one of the non-plain-text formats.

Options:
- `dbname` (string, required) - defines the database dbname to be restored
- `dumpLocation` (string, required) - specifies the location of the archive file (or directory, for a directory-format archive) on the host machine to be restored
- `dockerImage` (string, required) - specifies the Docker image containing the restore-required tool
- `forceInit` (boolean, optional, default: false) - init data even if the Postgres directory (see the configuration options `global.mountDir` and `global.dataSubDir`) is not empty; note the existing data might be overwritten
- `parallelJobs` (integer, optional, default: 1) - defines the number of concurrent jobs using the `pg_restore` option `jobs`. This option can dramatically reduce the time to restore a large database to a server running on a multiprocessor machine
- `partial` (key-value, optional) - defines options for partial restoring. Available options: `tables`:
   - `tables` (list of strings, optional) - restores definition and/or data of only the listed tables

### Job `logicalSnapshot`
Prepares a snapshot for logical restored PostgreSQL database.

Options:
- `dataPatching` (key-value, optional) - defines SQL queries for data patching
  - `dockerImage` (string, optional) - specifies the Docker image to run a data patching container
  - `queryPreprocessing` (key-value, optional) - defines pre-processing parameters
    - `queryPath` (string, optional, default: "") - specifies the path to SQL pre-processing queries; an empty string means that no pre-processing defined
    - `maxParallelWorkers` (integer, optional, default: 2) - defines the worker limit for parallel queries
- `preprocessingScript` (string, optional) - path on the host machine to a pre-precessing script
- `configs` (key-value, optional) - applies PostgreSQL configuration parameters when preparing a working snapshot. These parameters are inherited by all clones. See also: [How to configure PostgreSQL used by Database Lab Engine](/docs/guides/administration/postgresql-configuration)

### Job `physicalRestore`
Restores data from a physical backup.

Supported restore tools:
- WAL-G (`walg`) - is an archival restoration tool (https://github.com/wal-g/wal-g)
- Custom (`custom`) - allows defining own command to restore data

Options:
- `tool` (string, required) - defines the tool to restore data. See available restore tools list
- `dockerImage` (string, required) - specifies the Docker image containing the restoring tool
- `sync`  (key-value, optional) - refresh PGDATA after data fetching:
   - `enabled` (boolean, optional, default: false) - runs a separate container to refresh Database Lab data
   - `healthCheck` (key-value, optional) - describes health check options for a sync container:
      - `interval` (int, optional, default: 5) - health check interval for a data sync container (in seconds)
      - `maxRetries` (int, optional, default: 200) - maximum number of health check retries
   - `configs` (key-value, optional) - applies PostgreSQL configuration parameters to the sync instance
- `envs` (key-value, optional) - passes custom environment variables to the Docker container with the restoring tool
- `walg` (key-value, optional) - defines WAL-G configuration options:
   - `backupName` (string, required) - defines the backup name to restore
- `customTool` (key-value, optional) - defines configuration options for custom restoring tool:
   - `command` (string, required) - defines the command to restore data using a custom tool
   - `restore_command` (string, optional) - defines the PostgreSQL [`restore_command`](https://postgresqlco.nf/en/doc/param/restore_command/) configuration option to refresh data; Database Lab Engine automatically propagates the specified value to the proper location, depending on the version of PostgreSQL: in versions 11 and older, it is to be stored in `recovery.conf`, while in 12 and newer, it is a part of the main file, `postgresql.conf`

### Job `physicalSnapshot`
Prepares a snapshot for physical restored PostgreSQL database.

Options:
- `skipStartSnapshot` (boolean, optional, default: false) - skip taking a snapshot while the retrieval starts
- `promotion`  (key-value, optional) - promotes PGDATA after data fetching:
   - `enabled`  (boolean, optional, default: false) - enable PGDATA promotion
   - `dockerImage` (string, optional) - specifies the Docker image containing the promotion-compatible PostgreSQL instance
   - `healthCheck` (key-value, optional) - describes health check options for a data promotion container:
      - `interval` (int, optional, default: 5) - health check interval for a data promotion container (in seconds)
      - `maxRetries` (int, optional, default: 200) - maximum number of health check retries
   - `queryPreprocessing` (key-value, optional) - defines pre-processing SQL queries
      - `queryPath` (string, optional, default: "") - specifies the path to SQL pre-processing queries; an empty string means that no pre-processing defined
      - `maxParallelWorkers` (integer, optional, default: 2) - defines the worker limit for parallel queries
   - `configs` (key-value, optional) - applies PostgreSQL configuration parameters to the promotion instance
- `sysctls` (key-value, optional) - allows configuring namespaced kernel parameters (sysctls) of Docker container for a promotion stage of taking a snapshot. See supported parameters: https://docs.docker.com/engine/reference/commandline/run/#configure-namespaced-kernel-parameters-sysctls-at-runtime
- `preprocessingScript` (string, optional) - path on the host machine to a pre-precessing script
- `configs` (key-value, optional) - applies PostgreSQL configuration parameters to snapshot. These parameters are inherited by all clones. See also: [How to configure PostgreSQL used by Database Lab Engine](/docs/guides/administration/postgresql-configuration)
- `envs` (key-value, optional) - passes custom environment variables to the promotion Docker container
- `scheduler` (key-value, required) - contains tasks which run on a schedule:
   - `snapshot` (key-value, optional) - defines rules to create a new snapshot on a schedule:
      - `timetable` (string, required) - defines a timetable in crontab format: https://en.wikipedia.org/wiki/Cron#Overview
   - `retention` (key-value, optional) - defines rules to clean up old snapshots on a schedule:
      - `timetable` (string, required) - defines a timetable in crontab format: https://en.wikipedia.org/wiki/Cron#Overview
      - `limit` (integer, required) -  defines how many snapshots should be held

## Section `cloning`: thin cloning policies
- `accessHost` (string, required) - the host that will be specified in the database connection string to inform users about how to connect to database clones
- `maxIdleMinutes` (integer, optional, default: 0) - automatically delete clones after the specified minutes of inactivity

## Section `platform`: Postgres.ai Platform integration
- `url` (string, optional, default: "https://postgres.ai/api/general") - Platform API URL
- `accessToken` (string, required) - the token for authorization in Platform API. This token can be obtained on the Postgres.ai Console
- `enablePersonalTokens` (boolean, optional, default: false) - enables authorization with personal tokens of the organization's members

## Section `observer`: CI Observer configuration
- `replacementRules` (key-value, optional) - set up rules based on regular expressions (a pair of values `"regexp":"replace"`; to check syntax, use [this document](https://github.com/google/re2/wiki/Syntax )) for Postgres logs that will be sent to the Platform when running Observed Sessions; this helps ensure that sensitive data is masked properly and it doesn't leave the origin
Replacement rules applies to the following log fields: `message`, `detail`, `hint`, `internal_query`, `query`
