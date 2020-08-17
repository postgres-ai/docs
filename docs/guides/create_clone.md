---
title: Create a Database Lab clone
---

## GUI
1. Go to the **Database Lab instance** page.
1. Click the **Create clone** button.
  ![Database Lab engine page / Create clone](/docs/assets/guides/create_clone_1.png)
1. Fill the **ID** field with a meaningful name.
1. (optional) By default latest data snapshot (closest to production state) will be used to provision a clone. You can select any other available snapshot.
1. Fill **database credentials**. Remember the password, it will not be available later, but you will need to use it to connect to the clone.
1. (optional) Enable protected status (it can be done later if needed). Please be careful: abandoned protected clones may cause out-of-disk-space events. Read the details [here](/docs/guides/clone_protection).
1. Click the **Create clone** button and wait for a clone to provision.
![Database Lab engine clone creation page](/docs/assets/guides/create_clone_2.png)
1. You will be redirected on the **Database Lab clone** page.
  ![Database Lab engine clone page](/docs/assets/guides/create_clone_3.png)

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/guides/cli_install_init).

### Reference
- Command [`dblab clone create`](/docs/database-lab/6_cli_reference#subcommand-create)
- Command [`dblab snapshot list`](/docs/database-lab/6_cli_reference#subcommand-list-1)

### Basic clone creation
Create a clone using `dblab clone create` command. You need to specify the username and password that will be used to connect to the clone. Remember the password, it will not be available later, but you will need to use it to connect to the clone.

```bash
$ dblab clone create --username USERNAME --password PASSWORD --id CLONE_ID
```

```json
{
    "id": "CLONE_ID",
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    "db": {
        "connStr": "host=dev2.postgres.ai port=6001 user=USERNAME dbname=postgres",
        "host": "dev2.postgres.ai",
        "port": "6001",
        "username": "USERNAME",
        "password": ""
    },
    ...
}
```

### Create a clone with a non-default snapshot

By default latest data snapshot (closest to production state) will be used to provision a clone. You can select any other available snapshot.

1. List available snapshots.

```bash
$ dblab snapshot list
```

```json
[
    {
        "id": "SNAPSHOT_ID_2",
        "createdAt": "2020-08-12 12:00:11 UTC",
        "dataStateAt": "2020-08-12 11:59:24 UTC"
    },
    {
        "id": "SNAPSHOT_ID_1",
        "createdAt": "2020-08-12 11:00:11 UTC",
        "dataStateAt": "2020-08-12 10:59:04 UTC"
    },
    ...
]
```

2. Create a clone with the state, based on the desired snapshot.

```bash
$ dblab clone create --username USERNAME --password PASSWORD --id CLONE_ID --snapshot-id SNAPSHOT_ID
```

```json
{
    "id": "CLONE_ID",
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    "snapshot": {
        "id": "SNAPSHOT_ID",
        "createdAt": "2020-08-12 12:00:11 UTC",
        "dataStateAt": "2020-08-12 11:59:24 UTC"
    },
    ...
}
```

### Protected status

You can make clone protected during the creation or later (if needed). Please be careful: abandoned protected clones may cause out-of-disk-space events. Read the details [here](/docs/guides/clone_protection).

```bash
$ dblab clone create --username USERNAME --password PASSWORD --id CLONE_ID --protected
```

```json
{
    "id": "democlone",
    "protected": false,
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    ...
}
```

## Related
- Guide: [Connect to a clone](/docs/guides/connect_clone)
- Guide: [Destroy a clone](/docs/guides/destroy_clone)

[↵ Back to Guides](/docs/guides/)
