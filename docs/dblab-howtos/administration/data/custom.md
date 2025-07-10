---
title: "Data source: Custom"
sidebar_label: "Custom"
---

:::info
As the first step, you need to set up a machine for DBLab Engine instance. See the [guide](/docs/how-to-guides/administration/install-dle-manually).
:::

## Configuration
With this data source type you can use any PostgreSQL backup tool (e.g. pg_basebackup, Barman, pgBackRest) to transfer the data to the DBLab Engine instance.

### Jobs
To set up it you need to use following jobs:
- [physicalRestore](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalrestore)
- [physicalSnapshot](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalsnapshot)

### Options
Copy the example configuration file [`config.example.physical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/v4.0.0-rc.4/engine/configs/config.example.physical_generic.yml) from the Database Lab repository to `~/.dblab/engine/configs/server.yml`. For demo purposes we've used `pg_basebackup` tool, but you can use any tool suitable for the task. Check and update the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Engine
- Set connection options in `physicalRestore:options:envs`, based on your tool
- Set PostgreSQL commands in `physicalRestore:options:customTool`:
    - `command`: defines the command to restore data using a custom tool
    - `restore_command`: defines the PostgreSQL `restore_command` configuration option to refresh data
- Set a proper version in Postgres Docker image tag (change the images itself only if you know what are you doing):
    - `databaseContainer:dockerImage`

## Run DBLab Engine
```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 127.0.0.1:2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume ~/.dblab/engine/configs:/home/dblab/configs \
  --volume ~/.dblab/engine/meta:/home/dblab/meta \
  --volume ~/.dblab/engine/logs:/home/dblab/logs \
  --volume /sys/kernel/debug:/sys/kernel/debug:rw \
  --volume /lib/modules:/lib/modules:ro \
  --volume /proc:/host_proc:ro \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:4.0.0-rc.4
```

:::info
Parameter `--publish 127.0.0.1:2345:2345` means that only local connections will be allowed.

To allow external connections, consider either using additional software such as NGINX or Envoy or changing this parameter. Removing the host/IP part (`--publish 2345:2345`) allows listening to all available network interfaces.
See more details in the official [Docker command-line reference](https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose).
:::


## Restart in the case of failure
```bash
TBD
```
