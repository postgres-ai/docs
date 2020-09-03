---
title: Install and initialize Database Lab CLI
---

[↵ Back to CLI guides](/docs/guides/cli)

## Reference
- Command [`dblab init`](/docs/database-lab/cli-reference#command-init)
- Command [`dblab instance status`](/docs/database-lab/cli-reference#subcommand-status-1)

## Install CLI and connect
1. Install Database Lab CLI.

```bash
curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/scripts/cli_install.sh | bash
```

2. (optional) Connect to Database Lab through SSH port forward

> A Database Lab instance might be running behind firewalls when making exclusions for specific ports is impossible or prohibited. SSH keys should be on the server with Database Lab engine in order to use this connection option.

In a separate terminal tab laucnh SSH port forwarding. Use `http://localhost:2344` as URL in a step 3 below.
```
ssh -NTML 2344:localhost:2345 ssh://USERNAME@HOSTNAME:22 -i ~/.ssh/id_rsa
```

3. Initialize configuration. Use URL and verification token of your instance. Instead of using verification token you can generate and use your personal access token. See details [here](/docs/guides/personal-tokens).

```bash
dblab init --environment-id=ENV_ID --url=URL --token=TOKEN
```

- `--environment-id` - an arbitrary environment ID of Database Lab instance's API.
- `--url` - URL of Database Lab instance's API.
- `--token` - verification token of the Database Lab instance to send API requests.

> You can also run [`dblab config`](#command-config) at any time to change your settings or create a new configuration.

4. Test your configuration with instance status request `dblab instance status`.

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

[↵ Back to CLI guides](/docs/guides/cli)
