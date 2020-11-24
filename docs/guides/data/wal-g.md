---
title: "Data source: WAL-G"
sidebar_label: "WAL-G"
---

:::info
As the first step, you need to set up a machine for Database Lab Engine instance. See the guide [Set up a machine for the Database Lab Engine](/docs/guides/administration/machine-setup).
:::

## Configuration
### Jobs
In order to set up Database Lab Engine to automatically get the data from database using [WAL-G](https://github.com/wal-g/wal-g) archival restoration tool you need to use following jobs:
- [physicalRestore](/docs/database-lab/config-reference#job-physicalrestore)
- [physicalSnapshot](/docs/database-lab/config-reference#job-physicalsnapshot)

### Options
Copy the contents of configuration example [`config.example.physical_walg.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/v2.0/configs/config.example.physical_walg.yml) from the Database Lab repository to `~/.dblab/server.yml` and update the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Engine
- Set connection options in `physicalRestore:options:envs`:
    - Use WAL-G environment variables to configure the job, see the [WAL-G configuration reference](https://github.com/wal-g/wal-g#configuration)
- Set WAL-G settings in `physicalRestore:options:walg`:
    - `backupName` - defines the backup name to restore
- Set a proper version in Postgres Docker images tags (change the images itself only if you know what are you doing):
    - `provision:options:dockerImage`
    - `retrieval:spec:physicalRestore:options:dockerImage`
    - `retrieval:spec:physicalSnapshot:options:promotion:dockerImage`

## Run Database Lab Engine

:::tip
Use Docker volumes to make credential files available to WAL-G. For example: `--volume ~/.dblab/sa.json:/home/dblab/sa.json`.
:::

```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume ~/.dblab/server.yml:/home/dblab/configs/config.yml \
  --volume ~/.dblab/sa.json:/home/dblab/sa.json \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:2.0-latest
```

## Restart in the case of failure
```bash
TBD
```

:::note
This page is unfinished. Reach out to the Postgres.ai team to learn more.
:::
