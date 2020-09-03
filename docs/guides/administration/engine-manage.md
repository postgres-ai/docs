---
title: How to Manage Database Lab
---

[↵ Back to Administration guides](/docs/guides/administration)

## Start Database Lab instance

Define config file `~/.dblab/server.yml` according to [example](https://gitlab.com/postgres-ai/database-lab/-/blob/master/configs/config.example.physical_generic) and run the following command:

```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 2345:2345 \
  --restart on-failure \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab:rshared \
  --volume ~/.dblab/server.yml:/home/dblab/configs/config.yml \
  --detach \
  postgresai/dblab-server:latest
``` 

## Reconfigure Database Lab

Update the configuration file `~/.dblab/server.yml`.

Restart container:
```bash
sudo docker restart dblab_server
```

> ⚠ Note that once `docker restart` is executed, all existing clones will be lost.

## Upgrade Database Lab 

Stop and remove the container using `sudo docker stop dblab_server` and `sudo docker rm dblab_server` After that, [launch](#start-database-lab-instance) a new container.

> ⚠ Note the upgrade removes all running clones


## Observe Database Lab logs

To enable debugging mode, set option `debug` to `true` (see [example](https://gitlab.com/postgres-ai/database-lab/-/blob/master/configs/config.sample.yml)). Next, [follow the reconfiguration guidelines](#reconfigure-database-lab) to apply the change.

To observe container's logs, run:
```bash
sudo docker logs dblab_server -f
```

## Check Database Lab status

To check the status of the running container, perform the request `GET /healthz`. 

For example using `curl`:

```bash
curl -XGET 'https://dblab.domain.com/healthz'
```

If the instance is configured properly, you will get the response with status code `HTTP/1.1 200 OK` and a body similar to the following:

```json
{
    "version":"0.3.1-20200428-1333"
}
```

[↵ Back to Administration guides](/docs/guides/administration)
