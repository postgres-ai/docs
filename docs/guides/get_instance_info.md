---
title: Connect to a Database Lab clone
---

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/guides/cli_install_init).

### Reference
- Command [`dblab instance status`](/docs/database-lab/6_cli_reference#subcommand-status-1)
- Command [`dblab snapshot list`](/docs/database-lab/6_cli_reference#subcommand-list-1)
- Command [`dblab clone list`](/docs/database-lab/6_cli_reference#subcommand-list)
- Command [`dblab clone status`](/docs/database-lab/6_cli_reference#subcommand-status)

### Instance status

```bash
dblab instance status
```

```json
{
    "status": {
        "code": "OK",
        "message": "Instance is ready"
    },
    "fileSystem": {
        "size": 948650692608,
        "free": 682130422784
    },
    "dataSize": 953548571136,
    "expectedCloningTime": 1.216384936,
    "numClones": 1,
    "clones": [...]
}
```

### Snapshots list

```bash
dblab snapshot list
```

```json
[
    {
        "id": "SNAPSHOT_ID_1",
        "createdAt": "2020-08-12 19:00:09 UTC",
        "dataStateAt": "2020-08-12 18:59:13 UTC"
    },
    {
        "id": "SNAPSHOT_ID_2",
        "createdAt": "2020-08-12 18:00:10 UTC",
        "dataStateAt": "2020-08-12 17:59:08 UTC"
    },
    ...
]
```

### Clones list

```bash
dblab clone list
```

```json
[
    {
        "id": "CLONE_ID",
        "snapshot": {
            "id": "SNAPSHOT_ID_1",
            "createdAt": "2020-08-12 13:00:10 UTC",
            "dataStateAt": "2020-08-12 12:58:46 UTC"
        },
        "protected": true,
        "deleteAt": "",
        "createdAt": "2020-08-12 13:13:48 UTC",
        "status": {
            "code": "OK",
            "message": "Clone is ready to accept Postgres connections."
        },
        "db": {
            "connStr": "host=dev2.postgres.ai port=6000 user=demouser dbname=postgres",
            "host": "dev2.postgres.ai",
            "port": "6000",
            "username": "demouser",
            "password": ""
        },
        "metadata": {
            "cloneDiffSize": 651776,
            "cloningTime": 1.216384936,
            "maxIdleMinutes": 20
        },
        "project": ""
    }
]
```

### Clone status

```bash
dblab clone status CLONE_ID
```

```json
{
    "id": "CLONE_ID",
    "snapshot": {
        "id": "SNAPSHOT_ID_1",
        "createdAt": "2020-08-12 13:00:10 UTC",
        "dataStateAt": "2020-08-12 12:58:46 UTC"
    },
    "protected": true,
    "deleteAt": "",
    "createdAt": "2020-08-12 13:13:48 UTC",
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    "db": {
        "connStr": "host=dev2.postgres.ai port=6000 user=demouser dbname=postgres",
        "host": "dev2.postgres.ai",
        "port": "6001",
        "username": "demouser",
        "password": ""
    },
    "metadata": {
        "cloneDiffSize": 822784,
        "cloningTime": 1.216384936,
        "maxIdleMinutes": 20
    },
    "project": ""
}
```

[↵ Back to Guides](/docs/guides/)
