---
title: Connect to a Database Lab clone
---

## Direct connection (psql)
<!--DOCUSAURUS_CODE_TABS-->
<!--GUI-->
1. From the **Database Lab clone** page under section **Connection info** copy **psql connection string** field contents by clicking the **Copy** button.
  ![Database Lab clone page / psql connection string](/docs/assets/guides/connect_clone_1.png)
1. In terminal type `psql` and paste **psql connection string** field contents. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection.
1. Run the command and type password you've set during clone creation.
1. Test established connection by listing tables in the database with `\d` command.
  ![Terminal / psql](/docs/assets/guides/connect_clone_2.png)
<!--CLI-->
TBD
<!--END_DOCUSAURUS_CODE_TABS-->

## Direct connection (JDBC)
<!--DOCUSAURUS_CODE_TABS-->
<!--GUI-->
1. From the **Database Lab clone** page under section **Connection info** copy **JDBC connection string** field contents by clicking the **Copy** button.
  ![Database Lab clone page / JDBC connection string](/docs/assets/guides/connect_clone_3.png)
1. Use any Java-based PostgreSQL client to connect. For this guide, we will use [CloudBeaver](https://demo.cloudbeaver.io). Open the client.
1. Click **Connection** / **New connection** / **Custom**.
  ![CloudBeaver / New connection](/docs/assets/guides/connect_clone_4.png)
1. Select **URL** radio button and paste **JDBC connection string** field contents to **JDBC URL**. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection. Change password `DBPASSWORD` parameter to the password you've set during clone creation.
  ![CloudBeaver / New connection](/docs/assets/guides/connect_clone_5.png)
1. Test the connection by fetching tables.
  ![CloudBeaver / Tables](/docs/assets/guides/connect_clone_6.png)
<!--CLI-->
TBD
<!--END_DOCUSAURUS_CODE_TABS-->

## SSH port forwarding
> SSH keys should be on the server with Database Lab engine in order to use this connection option.

> If clone ports are not closed on your server you can use direct connections described above.

<!--DOCUSAURUS_CODE_TABS-->
<!--GUI-->
1. From the **Database Lab clone** page under section **Connection info** copy **SSH port forwarding** field contents by clicking the **Copy** button.
  ![Database Lab clone page / SSH port forward](/docs/assets/guides/connect_clone_7.png)
1. In the first tab of terminal start SSH port forwarding using the provided command. Change `USERNAME` to match the username of your SSH key. Change the path to the SSH key if needed.
  ![Terminal / SSH port forward](/docs/assets/guides/connect_clone_8.png)
1. From the **Database Lab clone** page under section **Connection info** copy **psql connection string** (will work the same with JDBC).
  ![Database Lab clone page / psql connection string](/docs/assets/guides/connect_clone_9.png)
1. In the second tab of terminal type `psql` and paste **psql connection string** field contents. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection. Make sure that `host=localhost`, as we need to connect to the local port forwarding tunnel.
1. Run the command and type password you've set during clone creation.
1. Test established connection by fetching the list of tables with `\d` command.
  ![Terminal / psql with port forward](/docs/assets/guides/connect_clone_10.png)
<!--CLI-->
TBD
<!--END_DOCUSAURUS_CODE_TABS-->


## Related
- Video: [Connect to Database Lab clone through SSH port forwarding](https://www.youtube.com/watch?v=Yq2Kv0-GYXg)
- Guide: [Resetting a clone state](/docs/guides/reset_clone)
- Guide: [Destroy a clone](/docs/guides/destroy_clone)

[↵ Back to Guides](/docs/guides/)
