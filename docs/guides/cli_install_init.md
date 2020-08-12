---
title: Install and initialize Database Lab CLI
---

## Reference
- Command [`dblab init`](/docs/database-lab/6_cli_reference#command-init)
- Command [`dblab instance status`](/docs/database-lab/6_cli_reference#subcommand-status-1)

## Install CLI and connect
1. Install Database Lab CLI.

```bash
curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/scripts/cli_install.sh | bash
```

2. (optional) Connect to Database Lab through SSH port forward

> SSH keys should be on the server with Database Lab engine in order to use this connection option.

In a separate terminal tab laucnh SSH port forwarding. Use `http://localhost:2344` as URL in a step 3 below.
```
ssh -NTML 2344:localhost:2345 ssh://USERNAME@HOSTNAME:22 -i ~/.ssh/id_rsa
```

3. Initialize configuration. Use URL and verification token of your instance. Instead of using verification token you can generate and use your personal access token. See details [here](/personal_tokens).

```bash
dblab init --environment-id=ENV_ID --url=URL --token=TOKEN
```

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

[↵ Back to Guides](/docs/guides/)
