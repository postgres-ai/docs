---
title: How to create a DBLab clone
sidebar_label: Create a clone
description: Create a thin DBLab clone from the GUI or the dblab CLI, including choosing a snapshot or branch, protecting the clone, and setting extra Postgres config.
---

## GUI
1. Go to the **DBLab instance** page.
1. Click the **Create clone** button.
  ![DBLab Engine page / Create clone](/assets/guides/create-clone-1.png)
1. Fill in the **ID** field with a meaningful name.
1. (optional) By default, the latest data snapshot (closest to production state) is used to provision a clone. You can select any other available snapshot.
1. Fill in the **database credentials**. Remember the password; it will not be available later, but you will need it to connect to the clone.
1. (optional) Enable protected status (it can be done later if needed). Be careful: abandoned protected clones may cause out-of-disk-space events. Read the details [here](/docs/dblab-howtos/cloning/clone-protection).
1. Click the **Create clone** button and wait for a clone to provision.
![DBLab Engine clone creation page](/assets/guides/create-clone-2.png)
1. You will be redirected to the **DBLab clone** page.
  ![DBLab Engine clone page](/assets/guides/create-clone-3.png)

## CLI
Before you run any commands, install DBLab CLI and initialize configuration. For more information, see [Install and initialize DBLab CLI](/docs/dblab-howtos/cli/cli-install-init).

### Reference
- Command [`dblab clone create`](/docs/reference-guides/dblab-client-cli-reference#subcommand-create)
- Command [`dblab snapshot list`](/docs/reference-guides/dblab-client-cli-reference#subcommand-list-1)

### Basic clone creation
Create a clone using the `dblab clone create` command. You need to specify the username and password that will be used to connect to the clone. Remember the password; it will not be available later, but you will need it to connect to the clone.

Starting with DBLab Engine 4.1, if you do not specify `--branch`, the clone is created from the default branch `main`.

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
By default, the latest data snapshot (closest to production state) is used to provision a clone. You can select any other available snapshot.

1. List available snapshots:

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

### Create a clone from a branch
:::note
Requires DBLab 4.0 or higher
:::

DBLab uses `main` as the default branch. Specify `--branch` only when you want a different branch.

Create a clone from a specific branch:
```bash
$ dblab clone create --username USERNAME --password PASSWORD --id CLONE_ID --branch main
```

### Protected status
You can make a clone protected during creation or later. Be careful: abandoned protected clones may cause out-of-disk-space events. Read the details [here](/docs/dblab-howtos/cloning/clone-protection).

Protect with default lease duration:
```bash
$ dblab clone create --username USERNAME --password PASSWORD --id CLONE_ID --protected true
```

Protect for a specific duration (e.g., 8 hours = 480 minutes):
```bash
$ dblab clone create --username USERNAME --password PASSWORD --id CLONE_ID --protected 480
```

```json
{
    "id": "democlone",
    "protected": true,
    "protectedTill": "2027-01-15T06:00:00Z",
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    ...
}
```

### Extra Postgres configuration
You can set additional Postgres configuration parameters for a clone:
```bash
$ dblab clone create --username USERNAME --password PASSWORD --id CLONE_ID --extra-config statement_timeout='30s'
```

## Related
- Guide: [Connect to a clone](/docs/dblab-howtos/cloning/connect-clone)
- Guide: [Destroy a clone](/docs/dblab-howtos/cloning/destroy-clone)
