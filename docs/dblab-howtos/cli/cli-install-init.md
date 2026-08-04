---
title: How to install and initialize DBLab CLI
sidebar_label: Install and initialize DBLab CLI
description: Install the DBLab CLI, optionally connect over an SSH tunnel, and initialize it with your instance URL and token to run dblab commands against DBLab Engine.
---

## Reference
- Command [`dblab init`](/docs/reference-guides/dblab-client-cli-reference#command-init)
- Command [`dblab instance status`](/docs/reference-guides/dblab-client-cli-reference#subcommand-status-1)

## Install CLI and connect
1. Install the DBLab CLI:
```bash
curl -sSL dblab.sh | bash
```

2. (optional) Connect to DBLab Engine using SSH port forwarding

:::note
A DBLab instance might run behind a firewall where opening the required ports is impossible or prohibited. In this case, the SSH keys must be on the server with DBLab Engine to use this connection option.
:::

In a separate terminal tab, launch SSH port forwarding. Use `http://localhost:2344` as the URL in step 3 below.
```
ssh -NTML 2344:localhost:2345 ssh://USERNAME@HOSTNAME:22 -i ~/.ssh/id_rsa
```

3. Initialize the configuration. Use the URL and verification token of your instance. Instead of a verification token, you can generate and use a personal access token. See details [here](/docs/dblab-howtos/platform/tokens).

```bash
dblab init --environment-id=ENV_ID --url=URL --token=TOKEN
```

- `--environment-id` - an arbitrary environment ID for the DBLab instance's API
- `--url` - URL of the DBLab instance's API
- `--token` - verification token of the DBLab instance used to send API requests

> You can also run [`dblab config`](/docs/reference-guides/dblab-client-cli-reference#command-config) at any time to change your settings or create a new configuration.

4. Test your configuration with instance status request `dblab instance status`:
```json
{
    "status": {
        "code": "OK",
        "message": "Instance is ready"
    },
    ...
}
```

## Related
- Video: [Basic install and initialization of DBLab CLI](https://www.youtube.com/watch?v=0En7misx2mg)
