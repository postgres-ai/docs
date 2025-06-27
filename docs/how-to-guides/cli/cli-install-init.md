---
title: How to install and initialize DBLab CLI
sidebar_label: Install and initialize DBLab CLI
---

<!-- TODO proofread this (and all the HowTos (guides) -->
## Reference
- Command [`dblab init`](/docs/reference-guides/dblab-client-cli-reference#command-init)
- Command [`dblab instance status`](/docs/reference-guides/dblab-client-cli-reference#subcommand-status-1)

## Install CLI and connect
1. Install Database Lab CLI:
```bash
curl -sSL dblab.sh | bash
```

2. (optional) Connect to DBLab Engine using SSH port forwarding

:::note
A Database Lab instance might be running behind firewalls and opening proper ports might be impossible or prohibited. In this case, SSH keys should be on the server with DBLab Engine in order to use this connection option.
:::

In a separate terminal tab launch SSH port forwarding. Use `http://localhost:2344` as URL in the step 3 below.
```
ssh -NTML 2344:localhost:2345 ssh://USERNAME@HOSTNAME:22 -i ~/.ssh/id_rsa
```

3. Initialize configuration. Use URL and verification token of your instance. Instead of using verification token you can generate and use your personal access token. See details [here](/docs/how-to-guides/platform/tokens).

```bash
dblab init --environment-id=ENV_ID --url=URL --token=TOKEN
```

- `--environment-id` - an arbitrary environment ID of Database Lab instance's API
- `--url` - URL of Database Lab instance's API
- `--token` - verification token of the Database Lab instance to send API requests

> You can also run [`dblab config`](#command-config) at any time to change your settings or create a new configuration.

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

# Related
- Video: [Basic install and initialization of Database Lab CLI](https://www.youtube.com/watch?v=0En7misx2mg)
