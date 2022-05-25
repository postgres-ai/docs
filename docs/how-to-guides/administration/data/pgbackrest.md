---
title: "Data source: pgBackRest"
sidebar_label: "pgBackRest"
---

Native support of pgBackRest has been implemented in DLE 3.1.

:::info
As the first step, you need to set up a machine. See the guide [Set up a machine for the Database Lab Engine](/docs/how-to-guides/administration/machine-setup).
:::

## Configuration
### Jobs
In order to configure DLE to automatically restore the database using the [pgBackRest](https://github.com/pgbackrest/pgbackrest) archival restoration tool you need to use following jobs:
- [physicalRestore](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalrestore)
- [physicalSnapshot](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalsnapshot)

### Options
Copy the example configuration file [`config.example.physical_pgbackrest.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/v3.1.1/engine/configs/config.example.physical_pgbackrest.yml) from the Database Lab repository to `~/.dblab/engine/configs/server.yml` and update the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Engine
- Set repository options in `physicalRestore:options:envs`:
    - pgBackRest allows using environment variables instead of command-line options (see [pgBackRest docs](https://pgbackrest.org/command.html#introduction)):
      Any option may be set in an environment variable using the `PGBACKREST_` prefix and the option name in all caps replacing `-` with `_`, e.g. `pg1-path` becomes `PGBACKREST_PG1_PATH`. Boolean options are represented as they would be in a configuration file, e.g. `PGBACKREST_COMPRESS="n"`, and `reset-*` variants are not allowed. Options that can be specified multiple times in the command line or in a config file can be represented by separating the values with colons, e.g. PGBACKREST_DB_INCLUDE="db1:db2". 
- Set pgBackRest settings in `physicalRestore:options:pgbackrest`:
    - `stanza` - defines the stanza name to restore ([pgBackRest docs](https://pgbackrest.org/user-guide.html#quickstart/configure-stanza))
    - `delta` - defines usage the `--delta` option for restore using checksums ([pgBackRest docs](https://pgbackrest.org/user-guide.html#restore/option-delta); this will override `PGBACKREST_DELTA` if it is specified in `physicalRestore:options:envs`))
- Set a proper version of Postgres Docker image (change the tag only leaving the image name itsesf as is, unless you need to use some custom built Postgres image and know what you are doing):
    - `databaseContainer:dockerImage`

## Run DLE
:::tip
Use Docker volumes to make host secret key and repository public key available to pgBackRest in case of using `--repo-type=posix`. For example:  
```
...
--volume ~/pgbackrest/.ssh/id_rsa:/var/lib/postgresql/.ssh/id_rsa \
--volume ~/pgbackrest/.ssh/known_hosts:/var/lib/postgresql/.ssh/known_hosts \
...
```

(Reminder: the location of the keys inside containers matches the second field of the mount expression.)

Make sure you set the correct permissions on the key file for the PostgreSQL user. For example:
```bash
docker run \
  -it \
  --rm \
  --privileged \
  --volume ~/pgbackrest/.ssh/id_rsa:/var/lib/postgresql/.ssh/id_rsa \
  postgresai/extended-postgres:14 \
  chown postgres:postgres /var/lib/postgresql/.ssh/id_rsa

chmod 400 ~/pgbackrest/.ssh/id_rsa
```
:::

```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 127.0.0.1:2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume ~/.dblab/engine/configs:/home/dblab/configs:ro \
  --volume ~/.dblab/engine/meta:/home/dblab/meta \
  --volume /sys/kernel/debug:/sys/kernel/debug:rw \
  --volume /lib/modules:/lib/modules:ro \
  --volume /proc:/host_proc:ro \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:3.1.1
```

:::info
Parameter `--publish 127.0.0.1:2345:2345` means that only local connections will be allowed to work with DLE API. To allow external connections, consider either using additional software such as NGINX or Envoy or change this parameter. Removing the host/IP part (`--publish 2345:2345`) will make it possible to work using any available network interface.
See more details in the official [Docker command-line reference](https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose).
:::
