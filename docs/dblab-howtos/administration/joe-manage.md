---
title: How to manage Joe bot
sidebar_label: Manage Joe bot
---

## Start Joe Bot container
Define the config file `~/.dblab/joe/configs/joe.yml` according the [configuration options page](/docs/reference-guides/joe-bot-configuration-reference) and run the command:
```bash
sudo docker run \
    --name joe_bot \
    --publish 2400:2400 \
    --restart=on-failure \
    --volume ~/.dblab/joe/configs:/home/configs \
    --volume ~/.dblab/joe/meta:/home/meta \
    --detach \
postgresai/joe:latest
``` 

Ensure that apps folder is writable by Joe inside docker container.
## Reconfigure Joe Bot container
Update the configuration file `~/.dblab/joe/configs/joe.yml`.

Restart the running Joe Bot container:
```bash
sudo docker restart joe_bot
```

After restart, all user sessions are restored and should keep working (but PostgreSQL connections are re-established so if users set some session variables, they are lost). This feature works only in Joe versions 0.10 and newer. If you need to reset user sessions, stop the container, remove the file `sessions.json` located in `~/.dblab/joe/meta`, and start the container.

## Upgrade Joe Bot 
Stop and remove the container using `sudo docker stop joe_bot` and `sudo docker rm joe_bot` and then [launching](#start-joe-bot-container) it again.

After upgrading, all user sessions are restored and should keep working (but PostgreSQL connections are re-established so if users set some session variables, they are lost). This feature works only in Joe versions 0.10 and newer. If you need to reset user sessions, stop the container, remove the file `sessions.json` located in `~/.dblab/joe/meta`, and start the container.

## Observe Joe Bot logs
To enable the debugging mode you can use one of the following approaches:

- Set the option `app: debug` to `true` in the [configuration file](/docs/reference-guides/joe-bot-configuration-reference#joe-bot-configuration-file). [Reconfigure the container](#reconfigure-the-joe-bot-container) if the option has been changed.
- Alternatively, use the environment variable [`JOE_DEBUG`](/docs/reference-guides/joe-bot-configuration-reference#joe_debug) when starting the container (`docker run ... --env JOE_DEBUG=true ...`).

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
