---
title: "Data source: WAL-G"
sidebar_label: "WAL-G"
description: Configure DBLab Engine to restore a physical Postgres data directory from a WAL-G backup archive, using WAL-G environment variables and settings.
---

:::info
As the first step, you need to set up a machine for DBLab Engine instance. See the [guide](/docs/dblab-howtos/administration/install-dle-manually).
:::

## Configuration
### Jobs
To set up DBLab Engine to automatically get the data from a database using the [WAL-G](https://github.com/wal-g/wal-g) archival restoration tool, use the following jobs:
- [physicalRestore](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalrestore)
- [physicalSnapshot](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalsnapshot)

### Options
Copy the example configuration file [`config.example.physical_walg.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/v4.1.3/engine/configs/config.example.physical_walg.yml) from the DBLab Engine repository to `~/.dblab/engine/configs/server.yml` and update the following options:
- Set a secure `server:verificationToken` — it will be used to authorize API requests to the Engine
- Set connection options in `physicalRestore:options:envs`:
    - Use WAL-G environment variables to configure the job, see the [WAL-G configuration reference](https://github.com/wal-g/wal-g#configuration)
- Set WAL-G settings in `physicalRestore:options:walg`:
    - `backupName` - defines the backup name to restore
    - `customOptions` (optional) - extra `wal-g backup-fetch` flags, for options WAL-G exposes only on the command line, such as `--mask`, `--restore-spec` and `--restore-only`. Anything that has a `WALG_*` environment variable should go to `physicalRestore:options:envs` instead, because these options reach `backup-fetch` alone — see the [configuration reference](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalrestore)
- Set a proper version in Postgres Docker image tag (change the image itself only if you know what you are doing):
    - `databaseContainer:dockerImage`

## Run DBLab Engine

:::tip
Use Docker volumes to make credential files available to WAL-G. 

For example: `--volume ~/.dblab/credentials.json:/home/dblab/credentials.json` or store them into a config directory.

Note that the credentials location inside the container matches the right part of the mount expression.
:::

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
  --detach \
  --restart on-failure \
  postgresai/dblab-server:4.1.3
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

:::note
This page is unfinished. Reach out to the PostgresAI team to learn more.
:::
