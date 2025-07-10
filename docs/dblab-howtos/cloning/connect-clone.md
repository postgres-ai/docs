---
title: How to connect to a DBLab clone
sidebar_label: Connect to a clone
---

<!-- TODO proofread this (and all the HowTos (guides) -->
## Direct connection (psql)
### GUI
1. From the **DBLab clone** page under section **Connection info** copy **psql connection string** field contents by clicking the **Copy** button.
  ![DBLab clone page / psql connection string](/assets/guides/connect-clone-1.png)
1. In terminal type `psql` and paste **psql connection string** field contents. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection.
1. Run the command and type the password you've set during clone creation.
1. Test established connection by listing tables in the database with `\d` command.
  ![Terminal / psql](/assets/guides/connect-clone-2.png)

### CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/how-to-guides/cli/cli-install-init).

#### Reference
- Command [`dblab clone status`](/docs/reference-guides/dblab-client-cli-reference#subcommand-status)

#### Connection

1. Get the connection information for the clone:
```bash
dblab clone status CLONE_ID
```

```json
{
    "id": "CLONE_ID",
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    "db": {
        "connStr": "host=HOSTNAME port=6000 user=USERNAME dbname=DBNAME",
        "host": "HOSTNAME",
        "port": "6000",
        "username": "USERNAME",
        "password": ""
    },
    ...
}
```

2. Connect to the clone using any Postgres client, e.g. psql. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection. Type password you've set during clone creation:
```bash
psql "host=HOSTNAME port=6000 user=USERNAME dbname=DBNAME"
```

```text
Password for user USERNAME:
psql (12.1, server 12.3)
Type "help" for help.

DBNAME=#
```

3. Test established connection by listing tables in the database with `\d` command.

## Direct connection (JDBC)
1. From the **Database Lab clone** page under section **Connection info** copy **JDBC connection string** field contents by clicking the **Copy** button.
  ![Database Lab clone page / JDBC connection string](/assets/guides/connect-clone-3.png)
1. Use any Java-based PostgreSQL client to connect. For this guide, we will use [CloudBeaver](https://demo.cloudbeaver.io). Open the client.
1. Click **Connection** / **New connection** / **Custom**.
  ![CloudBeaver / New connection](/assets/guides/connect-clone-4.png)
1. Select the **URL** radio button and paste **JDBC connection string** field contents to **JDBC URL**. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection. Change the password `DBPASSWORD` parameter to the password you've set during clone creation.
  ![CloudBeaver / New connection](/assets/guides/connect-clone-5.png)
1. Test the connection by fetching tables.
  ![CloudBeaver / Tables](/assets/guides/connect-clone-6.png)

## SSH port forwarding
:::tip
SSH keys need to be on the server with the DBLab Engine to use this connection option.
:::

### GUI
1. From the **Database Lab clone** page under section **Connection info** copy **SSH port forwarding** field contents by clicking the **Copy** button.
  ![Database Lab clone page / SSH port forward](/assets/guides/connect-clone-7.png)
1. In the first tab of terminal start SSH port forwarding using the provided command. Change `USERNAME` to match the username of your SSH key. Change the path to the SSH key if needed.
  ![Terminal / SSH port forward](/assets/guides/connect-clone-8.png)
1. From the **Database Lab clone** page under section **Connection info** copy **psql connection string** (will work the same with JDBC).
  ![Database Lab clone page / psql connection string](/assets/guides/connect-clone-9.png)
1. In the second tab of terminal type `psql` and paste **psql connection string** field contents. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection. Make sure that `host=localhost`, as we need to connect to the local port forwarding tunnel.
1. Run the command and type password you've set during clone creation.
1. Test established connection by fetching the list of tables with `\d` command.
  ![Terminal / psql with port forward](/assets/guides/connect-clone-10.png)

### CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/how-to-guides/cli/cli-install-init).

#### Reference
- Command [`dblab clone status`](/docs/reference-guides/dblab-client-cli-reference#subcommand-status)

#### Connection

1. In the first tab of terminal start SSH port forwarding using the provided command. Change `USERNAME` to match the username of your SSH key. Change the path to the SSH key if needed.
```bash
ssh -NTML 6000:localhost:6000 ssh://USERNAME@HOSTNAME:22 -i ~/.ssh/id_rsa
```

2. Get connection information of a clone.
```bash
dblab clone status CLONE_ID
```

```json
{
    "id": "CLONE_ID",
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    "db": {
        "connStr": "host=HOSTNAME port=6000 user=USERNAME dbname=DBNAME",
        "host": "HOSTNAME",
        "port": "6000",
        "username": "USERNAME",
        "password": ""
    },
    ...
}
```

2. Connect to the clone using any Postgres client, e.g. psql launched from a second tab. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection. Type password you've set during clone creation. Make sure that `host=localhost`, as we need to connect to the local port forwarding tunnel.
```bash
psql "host=localhost port=6000 user=USERNAME dbname=DBNAME"
```

```text
Password for user USERNAME:
psql (12.1, server 12.3)
Type "help" for help.

DBNAME=#
```

3. Test established connection by listing tables in the database with `\d` command.

## Related
- Video: [Connect to Database Lab clone through SSH port forwarding](https://www.youtube.com/watch?v=Yq2Kv0-GYXg)
- Guide: [Resetting a clone state](/docs/how-to-guides/cloning/reset-clone)
- Guide: [Destroy a clone](/docs/how-to-guides/cloning/destroy-clone)
