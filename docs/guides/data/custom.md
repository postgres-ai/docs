---
title: "Data source: Custom"
sidebar_label: "Custom"
---

:::info
As the first step, you need to set up a machine for Database Lab Engine instance. See the guide [Set up a machine for the Database Lab Engine](/docs/guides/administration/machine-setup).
:::

## Configuration
With this data source type you can use any PostgreSQL backup tool (e.g. pg_basebackup, Barman, pgBackRest) to transfer the data to the Database Lab Engine instance.

### Jobs
To set up it you need to use following jobs:
- [physicalRestore](/docs/database-lab/config-reference#job-physicalrestore)
- [physicalSnapshot](/docs/database-lab/config-reference#job-physicalsnapshot)

### Options
Copy the contents of configuration example [`config.example.physical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/v2.0/configs/config.example.physical_generic.yml) from the Database Lab repository to `~/.dblab/server.yml`. For demo purposes we've made example based on `pg_basebackup` tool, but you can use any tool suitable for the task. Check and update the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Engine
- Set connection options in `physicalRestore:options:envs`, based on your tool
- Set PostgreSQL commands in `physicalRestore:options:customTool`:
    - `command`: defines the command to restore data using a custom tool
    - `restore_command`: defines the PostgreSQL `restore_command` configuration option to refresh data
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
  postgresai/dblab-server:2.1-latest
```

## Restart in the case of failure
```bash
TBD
```
