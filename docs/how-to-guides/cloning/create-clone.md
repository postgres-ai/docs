---
title: How to create a Database Lab clone
sidebar_label: Create a clone
---

## GUI
1. Go to the **Database Lab instance** page.
1. Click the **Create clone** button.
  ![Database Lab engine page / Create clone](/assets/guides/create-clone-1.png)
1. Fill the **ID** field with a meaningful name.
1. (optional) By default, the latest data snapshot (closest to production state) will be used to provision a clone. You can select any other available snapshot.
1. Fill **database credentials**. Remember the password, it will not be available later, but you will need to use it to connect to the clone.
1. (optional) Enable protected status (it can be done later if needed). Please be careful: abandoned protected clones may cause out-of-disk-space events. Read the details [here](/docs/how-to-guides/cloning/clone-protection).
1. Click the **Create clone** button and wait for a clone to provision.
![Database Lab engine clone creation page](/assets/guides/create-clone-2.png)
1. You will be redirected to the **Database Lab clone** page.
  ![Database Lab engine clone page](/assets/guides/create-clone-3.png)

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/how-to-guides/cli/cli-install-init).

### Reference
- Command [`dblab clone create`](/docs/reference-guides/dblab-client-cli-reference#subcommand-create)
- Command [`dblab snapshot list`](/docs/reference-guides/dblab-client-cli-reference#subcommand-list-1)

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
<!-- TODO proper indentation -->
```bash
$ dblab snapshot list
```

```json
[
    {
        "id": "SNAPSHOT_ID_2",
        "createdAt": "2020-08-12T12:00:11Z",
        "dataStateAt": "2020-08-12T11:59:24Z"
    },
    {
        "id": "SNAPSHOT_ID_1",
        "createdAt": "2020-08-12T11:00:11Z",
        "dataStateAt": "2020-08-12T10:59:04Z"
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
        "createdAt": "2020-08-12T12:00:11Z",
        "dataStateAt": "2020-08-12T11:59:24Z"
    },
    ...
}
```

### Protected status
You can make clone protected during the creation or later (if needed). Please be careful: abandoned protected clones may cause out-of-disk-space events. Read the details [here](/docs/how-to-guides/cloning/clone-protection).
```bash
$ dblab clone create --username USERNAME --password PASSWORD --id CLONE_ID --protected
```

```json
{
    "id": "democlone",
    "protected": true,
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    ...
}
```

## Related
- Guide: [Connect to a clone](/docs/how-to-guides/cloning/connect-clone)
- Guide: [Destroy a clone](/docs/how-to-guides/cloning/destroy-clone)
