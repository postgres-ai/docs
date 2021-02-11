---
title: "Data source: pg_dump"
sidebar_label: "pg_dump"
---

:::info
As the first step, you need to set up a machine for Database Lab Engine instance. See the guide [Set up a machine for the Database Lab Engine](/docs/guides/administration/machine-setup).
:::

## Configuration
### Jobs
In order to set up Database Lab Engine to automatically get the data from database using [dump/restore](https://www.postgresql.org/docs/current/app-pgdump.html) you need to use following jobs:
- [logicalDump](/docs/database-lab/config-reference#job-logicaldump)
- [logicalRestore](/docs/database-lab/config-reference#job-logicalrestore)
- [logicalSnapshot](/docs/database-lab/config-reference#job-logicalsnapshot)

### Options
Copy the contents of configuration example [`config.example.logical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/v2.2/configs/config.example.logical_generic.yml) from the Database Lab repository to `~/.dblab/server.yml` and update the following options:
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
  --volume /var/lib/dblab/dblab_pool/dump:/var/lib/dblab/dblab_pool/dump \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume ~/.dblab/server.yml:/home/dblab/configs/config.yml \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:2.2-latest
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
