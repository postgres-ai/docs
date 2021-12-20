---
title: "Data source: pg_basebackup"
sidebar_label: "pg_basebackup"
---

:::info
As the first step, you need to set up a machine for Database Lab Engine instance. See the guide [Set up a machine for the Database Lab Engine](/docs/how-to-guides/administration/machine-setup).
:::

## Configuration
### Jobs
In order to set up Database Lab Engine to automatically get the data from database using [pg_basebackup](https://www.postgresql.org/docs/current/app-pgbasebackup.html) you need to use following jobs:
- [physicalRestore](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalrestore)
- [physicalSnapshot](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalsnapshot)

### Options
Copy the contents of configuration example [`config.example.physical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/3.0.0/configs/config.example.physical_generic.yml) from the Database Lab repository to `~/.dblab/engine/configs/server.yml` and update the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Engine
- Set connection options in `physicalRestore:options:envs`:
    - `PGUSER`: database user name
    - `PGPASSWORD`: database master password
    - `PGHOST`: database server host
- Set PostgreSQL commands in `physicalRestore:options:customTool`:
    - `command`: `pg_basebackup -X stream -D /var/lib/dblab/dblab_pool/data`
    - `restore_command`: `TBD`
- Set a proper version in Postgres Docker image tag (change the images itself only if you know what are you doing):
    - `databaseContainer:dockerImage`

## Run Database Lab Engine
```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 2345:2345 \
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
  postgresai/dblab-server:3.0.0
```

## Restart in the case of failure
```bash
TBD
```
