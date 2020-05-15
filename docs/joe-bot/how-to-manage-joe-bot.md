---
title: How to Manage Joe Bot
---

## Start Joe Bot container

Define the config file `~/.dblab/configs/joe_config.yml` according the [configuration options page](./configuration-options) and run the command:

```bash
sudo docker run \
    --name joe_bot \
    --publish 2400:2400 \
    --restart=on-failure \
    --volume ~/.dblab/configs/joe_config.yml:/home/config/config.yml \
    --detach \
postgresai/joe:latest
``` 

## Reconfigure Joe Bot container

Update the configuration file `~/.dblab/configs/joe_config.yml`.

Restart the running Joe Bot container:
```bash
sudo docker restart joe_bot
```

> ⚠ Note that once `docker restart` is executed, all active sessions will be lost.

## Upgrade Joe Bot 

Stop and remove the container using `sudo docker stop joe_bot` and `sudo docker rm joe_bot` and then [launching](./how-to-manage-joe-bot#start-the-joe-bot-container) it again.

> ⚠ Note the upgrade removes all active sessions


## Observe Joe Bot logs

To enable the debugging mode you can use one of the following approaches:

- Set the option `app: debug` to `true` in the [configuration file](./configuration-options#joe-bot-configuration-file). [Reconfigure the container](#reconfigure-the-joe-bot-container) if the option has been changed.
- Alternatively, use the environment variable [`JOE_DEBUG`](./configuration-options#joe_debug) when starting the container (`docker run ... --env JOE_DEBUG=true ...`).

To observe the container logs, run:
```bash
sudo docker logs joe_bot -f
```

## Check Joe Bot status

To check the status of the running container, perform the request `GET /`. 

For example using `curl`:

```bash
curl -XGET 'https://joe.dev.domain.com/'
```

The response `HTTP/1.1 200 OK` is going to be:

```json
{
    "version":"v0.7.0-20200424-0408",
    "edition":"CE",
    "communication_types":["slack","webui"]
}
```
