---
title: "Data source: pg_dump"
sidebar_label: "pg_dump"
---

:::info
As the first step, you need to set up a machine for Database Lab Engine instance. See the guide [Set up a machine for the Database Lab Engine](/docs/how-to-guides/administration/machine-setup).
:::

## Configuration
### Jobs
In order to set up Database Lab Engine to automatically get the data from database using [dump/restore](https://www.postgresql.org/docs/current/app-pgdump.html) you need to use following jobs:
- [logicalDump](/docs/reference-guides/database-lab-engine-configuration-reference#job-logicaldump)
- [logicalRestore](/docs/reference-guides/database-lab-engine-configuration-reference#job-logicalrestore)
- [logicalSnapshot](/docs/reference-guides/database-lab-engine-configuration-reference#job-logicalsnapshot)

### Options
Copy the contents of configuration example [`config.example.logical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/2.4.1/configs/config.example.logical_generic.yml) from the Database Lab repository to `~/.dblab/server.yml` and update the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Engine
- Set connection options in `retrieval:spec:logicalDump:options:source:connection`:
    - `dbname`: database name to connect to
    - `host`: database server host
    - `port`: database server port
    - `username`: database user name
    - `password`: database master password (can be also set as `PGPASSWORD` environment variable of the Docker container)
- Set proper version in Postgres Docker images tags (change the images itself only if you know what are you doing):
    - `provision:options:dockerImage`
    - `retrieval:spec:logicalRestore:options:dockerImage`
    - `retrieval:spec:logicalDump:options:dockerImage`

## Run Database Lab Engine
```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume /var/lib/dblab/dblab_pool/dump:/var/lib/dblab/dblab_pool/dump \
  --volume ~/.dblab/server.yml:/home/dblab/configs/config.yml \
  --volume /sys/kernel/debug:/sys/kernel/debug:rw \
  --volume /lib/modules:/lib/modules:ro \
  --volume /proc:/host_proc:ro \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:2.4.1
```

You can use PGPASSWORD env to set the password.

## Restart Engine in the case of failure
```bash
# Stop and remove the Database Lab Engine control container.
sudo docker rm -f dblab_server

# Clean up data directory.
sudo rm -rf /var/lib/dblab/dblab_pool/data/*

# Remove dump directory.
sudo umount /var/lib/dblab/dblab_pool/dump
sudo rm -rf /var/lib/dblab/dblab_pool/dump
```

## Ways to prepare a snapshot

### How to dump and restore a database
A basic way of restoring database from the source contains three steps:
- `logicalDump` where DLE dumps from the source into files
- `logicalRestore` where downloaded dumps are restored into the DLE instance
- `logicalSnapshot` where a snapshot is taken

Since dump files are stored in intermediate files, make sure there is enough disk space.

A typical configuration might look like this:
```yaml
retrieval:
  jobs:
    - logicalDump
    - logicalRestore
    - logicalSnapshot

  spec:
    logicalDump:
      options:
        dumpLocation: "/var/lib/dblab/dblab_pool/dump"
        dockerImage: "postgresai/extended-postgres:13"
        source:
          type: remote
          connection:
            dbname: postgres
            host: 12.34.56.78
            port: 5432
            username: postgres
            password: postgres

    logicalRestore:
      options:
        dumpLocation: "/var/lib/dblab/dblab_pool/dump"
        dockerImage: "postgresai/extended-postgres:13"

    logicalSnapshot:
```

### How to restore from an already existing dump
To restore from existing dumps, describe two jobs `logicalRestore` and `logicalSnapshot`.
For the `logicalRestore` job provide with the `dumpLocation` option a dump location where files are stored.

The `dumpLocation` option must provide a file or directory that contains dump files of various formats: plain, custom, directory.
You can specify both a separate file and directory containing dumps to restore. Please note that DLE will skip dumps of unknown format.

DLE supports consecutive (but single-threaded) restoring multiple dumps. You even can mix dumps of different formats in a `dumpLocation` directory.

For example,
```yaml
retrieval:
  jobs:
    - logicalRestore
    - logicalSnapshot

  spec:
    logicalRestore:
      options:
        # The location of the archive files (or directories, for directory-format archives) 
        # on host machine to be restored.
        dumpLocation: "/var/lib/dblab/dblab_pool/dump"
        dockerImage: "postgresai/extended-postgres:13"

    logicalSnapshot:
```
Since DLE has to explore the `dumpLocation` directory and parse objects (files and directories) inside it, you must mount the directory from `dumpLocation` to the running Database Lab Engine container.

#### Supported plain-text formats and naming
Database Lab Engine supports restoring from a plain-text file (using the `psql` utility).

There are a number of possible scenarios of how a dump might be created:
- `pg_dump` with the `--create` option
- `pg_dump` without the `--create` option
-  via `dumpall`

:::info
DLE supports all derived dump files of the described types, such as those generated by `pg_dump_anon`
:::

Database Lab Engine automatically detects plain-text dump files and their origin type.

If DLE is working with a dump made by `dumpall` or `pg_dump` with the `--create` option, it doesn't need to know all database names from this file because psql runs queries and restores the dump to a correct database (even if the database already exists, even if the name is `postgres`)
and extracts database names as well.

If a provided dump has been made without the `--create` option (or there are no tables, or the original type cannot be detected because of compression), then DLE will use the filename as a database name, adjust it (if necessary, see a note about a fallback naming below), and will try to create a new database and restore the dump into it.

:::info
Fallback naming. All characters in the file name other than words (`[^0-9A-Za-z_]`) will be replaced with an underscore (`_`).
:::

#### Limits of plain-text restoring
- partial restore is not available for a plain-text dump. You cannot restore only specific tables.
  So, the `databases.tables` option is not supported.
- parallel restore is not available for a plain-text dump. It is always single-threaded.
  So, the `parallelJobs` option is not supported.

#### Process compressed dumps
It is a great idea to compress dump files of large databases. Database Lab Engine supports restoring  compressed plain-text dumps.

DLE supports several compression options for plain-text dumps:
- [gzip](https://www.gnu.org/software/gzip/)
- [bzip2](https://www.sourceware.org/bzip2/)
- no compression

This means that you can specify the `dumpLocation` parameters pointing not only to raw but also compressed plain-text dumps.


### Direct restore to Database Lab Engine instance
DLE provides a way of restoring from the source on the fly. It's useful to dump and restore a database without saving an intermediate file - so called `immediateRestore`
The advantage of this method is that no additional disk space is required to restore the database.

Keep in mind that unlike a classic "logicalRestore", this option does not support parallelization (specify `parallelJobs: 1` for logicalDump job). 
It is always a single-threaded (both for dumping on the source, and restoring on the destination end).

To restore directly, you do not need to use "logicalRestore" job. Just define a `logicalDump` job and uncomment the `immediateRestore` section inside it.

For example,
```yaml
retrieval:
  jobs:
    - logicalDump
    - logicalSnapshot

  spec:
    logicalDump:
      options:
        dumpLocation: "/var/lib/dblab/dblab_pool/dump"
        dockerImage: "postgresai/extended-postgres:13"
        source:
          type: remote
          connection:
            dbname: postgres
            host: 34.56.78.90
            port: 5432
            username: postgres
            password: postgres
        parallelJobs: 1
        immediateRestore:
          enabled: true

    logicalSnapshot:
```
