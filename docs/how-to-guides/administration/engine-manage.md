---
title: How to manage Database Lab Engine
sidebar_label: Manage Database Lab Engine
description: Learn how to configure and maintain Database Lab Engine instances to build powerful non-production environments for PostgreSQL.
keywords:
  - "database lab engine management"
  - "administration database lab engine"
  - "postgres.ai cloning management"
---

## Configure and start a Database Lab Engine instance
Define config file `~/.dblab/engine/configs/server.yml`

:::tip
All YAML features can be used, including anchors and aliases, to help you conveniently manage your configuration sections.

For instance, you can define a binding with `&` and then refer to it using an alias denoted by `*`.

See config examples [here](https://gitlab.com/postgres-ai/database-lab/-/blob/2.4.1/configs/)
:::

After configuring Database Lab Engine, run the following command:

```bash
sudo docker run \
  --detach \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab:rshared \
  --volume ~/.dblab/engine/configs:/home/dblab/configs:ro \
  --volume ~/.dblab/engine/meta:/home/dblab/meta \
  --volume /sys/kernel/debug:/sys/kernel/debug:rw \
  --volume /lib/modules:/lib/modules:ro \
  --volume /proc:/host_proc:ro \
  postgresai/dblab-server:2.4.1
``` 

## Reconfigure Database Lab Engine
Database Lab Engine supports reconfiguration without a restart (therefore, without any downtime):

- Edit the configuration file (usually, `~/.dblab/engine/configs/server.yml`). 
- Issue a [SIGHUP](https://en.wikipedia.org/wiki/SIGHUP) signal to the main process in the DLE container – if the container name is `dblab_server`, then run this (note that `kill` here is not killing the process, it just sends the SIGHUP signal to it):
    ```bash
    sudo docker exec -it dblab_server kill -SIGHUP 1
    ```

- Ensure that configuration was reloaded, it should be seen in the logs (message `Configuration has been reloaded`):
    ```bash
    sudo docker logs --since 5m dblab_server
    ```

:::tip Tip for Vim users
Note, that by default, editing a file in Vim leads to file inode change, so your change wouldn't propagate into the container. To mitigate this issue, put `set backupcopy=yes` into `~/.vimrc` before launching Vim. If you already launched it, type `:set backupcopy=yes`.
:::

## Upgrade Database Lab Engine
Stop and remove the container using `sudo docker stop dblab_server` and `sudo docker rm dblab_server` After that, [launch](#start-database-lab-instance) a new container.

:::caution
Note any upgrade removes all the running clones.
:::

## Observe Database Lab Engine logs
To observe the logs for Database Lab Engine running in a container (remove `--since 1m` to see the log from the very beginning):
```bash
sudo docker logs --since 1m -f dblab_server
```

If you need to save the logs in a file:
```bash
sudo docker logs dblab_server 2>&1 | gzip > dblab_server.log.gz
```

If you want to see more details, enable debug mode setting option `debug` to `true` (see [example](https://gitlab.com/postgres-ai/database-lab/-/blob/2.4.1/configs/config.sample.yml)). Next, follow  [the reconfiguration guidelines](#reconfigure-database-lab) to apply the change.

:::caution
When debug mode is turned on, logs may contain sensitive data such as API secret keys for the backup system.
:::

## Check Database Lab Engine status

To check the status of the running container, perform an HTTP request `GET /healthz`. For example, using cURL:
```bash
curl -XGET 'http://127.0.0.1:2345/healthz'
```

If the instance is up and running, you will get the response with status code `HTTP/1.1 200 OK` and a body like this:
```json
{
    "version":"2.1.0-20201119-0423"
}
```
