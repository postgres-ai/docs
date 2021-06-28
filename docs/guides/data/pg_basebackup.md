---
title: "Data source: pg_basebackup"
sidebar_label: "pg_basebackup"
---

:::info
As the first step, you need to set up a machine for Database Lab Engine instance. See the guide [Set up a machine for the Database Lab Engine](/docs/guides/administration/machine-setup).
:::

## Configuration
### Jobs
In order to set up Database Lab Engine to automatically get the data from database using [pg_basebackup](https://www.postgresql.org/docs/current/app-pgbasebackup.html) you need to use following jobs:
- [physicalRestore](/docs/database-lab/config-reference#job-physicalrestore)
- [physicalSnapshot](/docs/database-lab/config-reference#job-physicalsnapshot)

### Options
Copy the contents of configuration example [`config.example.physical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/2.3.3/configs/config.example.physical_generic.yml) from the Database Lab repository to `~/.dblab/server.yml` and update the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Engine
- Set connection options in `physicalRestore:options:envs`:
    - `PGUSER`: database user name
    - `PGPASSWORD`: database master password
    - `PGHOST`: database server host
- Set PostgreSQL commands in `physicalRestore:options:customTool`:
    - `command`: `pg_basebackup -X stream -D /var/lib/dblab/dblab_pool/data`
    - `restore_command`: `TBD`
- Set a proper version in Postgres Docker images tags (change the images itself only if you know what are you doing):
    - `provision:options:dockerImage`
    - `retrieval:spec:physicalRestore:options:dockerImage`
    - `retrieval:spec:physicalSnapshot:options:promotion:dockerImage`

## Run Database Lab Engine
```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume ~/.dblab/server.yml:/home/dblab/configs/config.yml \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:2.3.3
```

## Restart in the case of failure
```bash
TBD
```
