---
title: DBLab tutorial for any PostgreSQL database
sidebar_label: Tutorial for any Postgres
keywords:
  - "DBLab tutorial"
  - "Start using DBLab Engine"
  - "Postgres.ai tutorial"
description: In this tutorial, we are going set up a DBLab Engine (Database Lab Engine) in the Cloud. DBLab is used to boost software development and testing processes via enabling ultra-fast provisioning of databases of any size.
---

DBLab Engine is used to boost software development and testing processes by enabling ultra-fast provisioning of databases of any size.

Use [the Postgres.ai Console](https://console.postgres.ai/) for an easy and quick installation of DBLab. Following the steps below, in a few minutes, you will get:
- A single DBLab Standard Edition (DBLab SE) installed in your infrastructure (Postgres.ai does not have access to it)
- Additional components such as monitoring
- Ready-to-use, well-tested, vendor-supported Postgres images for DBLab that are compatible with your source databases located in popular managed Postgres services like RDS, CloudSQL, Supabase, and Heroku
- A DBLab SE subscription with guaranteed vendor support

Using this tutorial, you can set up DBLab on your AWS account:
- Make sure you have an AWS account. If you don’t, [sign up](https://aws.amazon.com/resources/create-account/) for one.
- We'll be using a small instance for this tutorial: 2 vCPUs and 8 GiB RAM. It'll cost you about $0.20 every hour (total, sum for both AWS resources and DBLab SE subscription; see [Pricing](https://postgres.ai/pricing)).
- If you're using a different cloud service or you already have hardware, that's okay. You can still use this guide. Just tweak the steps a bit to fit your setup.

### Any database is compatible
DBLab supports instant cloning and database branching for source Postgres databases located anywhere:
- Managed Postgres services such as AWS RDS, Google CloudSQL, Heroku Postgres, DigitalOcean Postgres, Supabase, Timescale Cloud, and others
- Any self-managed Postgres, either cloud-based or on-premises
- Postgres-compatible database services such as Amazon Aurora PostgreSQL

### Choose any location for installation
The location of your DBLab can be chosen according to your preference. The installation can be either cloud-based or on-premises. Two primary installation options are available:
- **Create DBLab in your cloud**: this option, applicable for AWS, GCP, DigitalOcean, and Hetzner Cloud, includes resource provisioning such as VM and disk.
- **BYOM** (Bring Your Own Machine): for other clouds or on-premises installations, ensure that a VM with Ubuntu 22.04 is installed and a suitable disk is attached. The installation tool will take care of the rest.

:::note Option 1: Create DBLab in your cloud
This option applies to AWS, GCP, Digital Ocean, and Hetzner Cloud. It covers the provisioning of all necessary resources (VM and disk) and the installation of all software components, including DBLab.
:::

:::note Option 2: BYOM – Bring Your Own Machine
If your cloud vendor is not supported by Option 1 or if you are using an on-premises solution, this option is suitable. You will need a VM or physical machine with a sufficiently large disk and Ubuntu 22.04 installed. The setup tool will then install all necessary components, including DBLab.
:::

In both scenarios, your data remains securely within your infrastructure.


## Step 1. Deploying DBLab in Cloud
### Prerequisites
- Sign up for an account at https://console.postgres.ai/, using one of four supported methods: Google, LinkedIn, GitHub, GitLab
- [Create](https://console.postgres.ai/addorg) a new organization
- Inside your organization, go to the "Billing" section and add a new payment method:
   - press the "Edit payment methods" button,
   - you will see the Stripe portal – note it has the address `https://billing.stripe.com/...` (Postgres.ai partners with Stripe for simplified billing),
   - add your payment methods there and close the page.

### DBLab installation
The first steps are trivial:
- Go to "Database Lab / Instances"

And then press the "Create" button to deploy DBLab in your cloud:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step1.png" alt="DBLab Engine in DBLab Platform: step 1" />
</p>

Select your cloud provider and region:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step2.png" alt="DBLab Engine in DBLab Platform: step 2" />
</p>

Choose the instance type:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step3.png" alt="DBLab Engine in DBLab Platform: step 3" />
</p>

Choose the volume type and size:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step4.png" alt="DBLab Engine in DBLab Platform: step 4" />
</p>

:::note
In this example the database size is 100 GiB, we want to create 3 datasets to be able to create 3 snapshots, so the volume with size 300 GiB will be created.
:::

Provide a name for your DBLab instance:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step5.png" alt="DDBLab Engine in DBLab Platform: step 5" />
</p>

Define DBLab verification token (a non-trivial, password-like value is recommended):
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step6.png" alt="DBLab Engine in DBLab Platform: step 6" />
</p>

:::note
You can use the "Generate random" button to generate a new unique token.
:::

Choose DBLab version:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step7.v2.png" alt="DBLab Engine in DBLab Platform: step 7" />
</p>

Provide SSH public keys:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step8.png" alt="DBLab Engine in DBLab Platform: step 8" />
</p>

:::note
These SSH public keys will be added to the DBLab server's  ~/.ssh/authorized_keys  file. Providing at least one public key is recommended to ensure access to the server after deployment.
:::

Review the specifications of the virtual machine, and click "Create DBLab":
<p align="left">
    <img src="/assets/dle-platform/Platform_DLE_step9.v2.png" alt="DBLab Engine in DBLab Platform: step 9" width="50%"/>
</p>

Select the installation method and follow the instructions to create server and install DBLab SE:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step10.v3.png" alt="DBLab Engine in DBLab Platform: step 10" />
</p>

:::note
To perform the initial deployment, a new temporary SSH key will be generated and added to the Cloud. After the deployment is completed, this key will be deleted and the SSH key that was specified in the "ssh_public_keys" variable will be added to the server.
:::

After running the deployment command, You need to wait a few minutes, while all resources are provisioned and DBLab setup is complete. Check out the "usage instructions" – once DBLab API and UI are ready, you'll see the ordered list of instructions on how to connect to UI and API.

Example:

```bash
TASK [deploy-finish : Print usage instructions] ****************************************************************************************************************************************************************
ok: [ubuntu@35.183.123.243] => {
    "msg": [
        "1) Verification token (ensure to securely store it):                            ",
        "       tEsuMyA3M108AZYEXWNXDqNJfFp8vefx                                             ",
        "                                                                                ",
        "2) Use SSH port forwarding for UI / API / CLI:                                      ",
        "       ssh -N -L 2346:127.0.0.1:2346 ubuntu@35.183.123.243 -i YOUR_PRIVATE_KEY     ",
        "                                                                                ",
        "3) DBLab UI:          http://127.0.0.1:2346                                     ",
        "                                                                                ",
        "4) DBLab API:                                                                   ",
        "  - API URL:          http://127.0.0.1:2346/api                                 ",
        "  - API docs:         https://api.dblab.dev/                                    ",
        "                                                                                ",
        "5) DBLab CLI:                                                                   ",
        "  - CLI ('dblab') setup:                                                        ",
        "        export DBLAB_CLI_VERSION=3.4.0                                          ",
        "        curl -sSL dblab.sh | bash                                               ",
        "        dblab init --environment-id=dle-demo --token=tEsuMyA3M108AZYEXWNXDqNJfFp8vefx --url=http://127.0.0.1:2346/api",
        "  - CLI docs:         https://cli-docs.dblab.dev/                               ",
        "                                                                                ",
        "6) Monitoring:                                                                  ",
        "  - SSH port forwarding:                                                        ",
        "       ssh -N -L 19999:127.0.0.1:19999 ubuntu@35.183.123.243 -i YOUR_PRIVATE_KEY    ",
        "  - Monitoring URL:   http://127.0.0.1:19999                                     ",
        "                                                                                ",
        "7) To connect to clones, also use SSH port forwarding. E.g., for clone 6000:     ",
        "       ssh -N -L 6000:127.0.0.1:6000 ubuntu@35.183.123.243 -i YOUR_PRIVATE_KEY      ",
        "  - and then use: 'host=127.0.0.1 port=6000 user=YOUR_USER dbname=postgres'     "
    ]
}
```
:::note
Save the data from the "Print usage instructions" task, because the Postgres.ai Platform does not save this data on its side.
:::


### Open UI
First, set up SSH port forwarding for UI port 2346:
```bash
# Replace with your server IP
ssh -N -L 2346:127.0.0.1:2346 ubuntu@35.183.123.243
```

Now UI should be available at http://127.0.0.1:2346
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step11.v2.png" alt="DBLab Engine in DBLab Platform: step 11" />
</p>


## Step 2. Configure DBLab and run the data retrieval

:::note
Currently, configuring DBLab in UI allows config changes only for the "logical" mode of data retrieval (dump/restore) – the only available method for managed PostgreSQL cloud services such as RDS Postgres, RDS Aurora Postgres, Azure Postgres, or Heroku. "Physical" mode is not yet supported in UI but is still possible (thru SSH connection and [editing DBLab config file directly](/docs/how-to-guides/administration/engine-manage)). More about [various data retrieval options for DBLab](/docs/how-to-guides/administration/data).
:::

Enter the verification token, you have created earlier.

<p align="center">
    <img src="/assets/dle-platform/DLE_config_step1.png" alt="DBLab Engine configuration: step 1" />
</p>

Now it's time to define DB credentials of the source to initiate database privisioning – this is how DBLab will be initialized, performing the very first data retrieval, and then the same parameters will be used for scheduled full refreshes according to the schedule defined. Fill the forms, and use the information in the tooltips if needed.

<p align="center">
    <img src="/assets/dle-platform/DLE_config_step2.png" alt="DBLab Engine configuration: step 2" />
</p>

Then press "Test connection" to check access to the source database from which the dump will be created.

:::note
You can use the "Get version from source" and "Get from source database" buttons to get the PostgreSQL version and the necessary Query tuning parameters from the source database server.
:::

<p align="center">
    <img src="/assets/dle-platform/DLE_config_step3.png" alt="DBLab Engine configuration: step 3" />
</p>

Apply changes and press "Switch to Overview" to track the process of data retrieval.

<p align="center">
    <img src="/assets/dle-platform/DLE_config_step4.png" alt="DBLab Engine configuration: step 4" />
</p>

In the Overview tab, you can see the status of the data retrieval. Note that the initial data retrieval takes some time – it depends on the source database size. However, DBLab API, CLI, and UI are already available for use. To observe the current activity on both source and target sides use "Show details".

<p align="center">
    <img src="/assets/dle-platform/DLE_config_step5.png" alt="DBLab Engine configuration: step 5" />
</p>

<p align="center">
    <img src="/assets/dle-platform/DLE_config_step6.png" alt="DBLab Engine configuration: step 6" />
</p>

<p align="center">
    <img src="/assets/dle-platform/DLE_config_step7.png" alt="DBLab Engine configuration: step 7" />
</p>

Once the retrieval is done, you can create your first clone. Happy cloning!

## Step 3. Start cloning!
### UI
#### Create a clone
1. Click the **Create clone** button.
 ![DBLab engine clone creation page](/assets/dle-platform/DLE_create_clone1.png)
1. Fill the **ID** field with a meaningful name.
1. (optional) By default, the latest data snapshot (closest to production state) will be used to provision a clone. You can choose another snapshot if any.
1. Fill **database credentials**. Remember the password (it will not be available later, DBLab Platform does not store it!) – you will need to use it to connect to the clone.
1. Click the **Create clone** button and wait for a clone to be provisioned. The process should take only a few seconds.
![DBLab engine clone creation page](/assets/dle-platform/DLE_create_clone2.png)
1. You will be redirected to the **DBLab clone** page.
    ![DBLab engine clone page](/assets/dle-platform/DLE_create_clone3.png)
:::note
You also can click the "Enable deletion protection" box. When enabled no one can delete this clone and automated deletion is also disabled.
:::

#### Connect to a clone
1. From the **DBLab clone** page under section **Connection info**, copy the **psql connection string** field contents by clicking the **Copy** button.
    ![DBLab clone page / psql connection string](/assets/dle-platform/DLE_connect_clone1.png)
2. To connect to clones, also use SSH port forwarding:
```bash
# Replace with your server IP and clone port
ssh -N -L 6000:127.0.0.1:6000 ubuntu@35.183.123.243
```
3. Here we assume that you have `psql` installed on your working machine. In the terminal, type `psql` and paste the **psql connection string** field contents. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection.
4. Run the command and type the password you've set during the clone creation.
5. Test established connection by listing tables in the database using `\dt`.
```bash
vitabaks@MacBook-Pro-Vitaliy ~ % psql "host=localhost port=6000 user=demo_user dbname=test"  
Password for user demo_user: 
psql (14.6 (Homebrew), server 15.3 (Debian 15.3-1.pgdg110+1))
WARNING: psql major version 14, server major version 15.
         Some psql features might not work.
Type "help" for help.

test=# \dt
              List of relations
 Schema |       Name       | Type  |  Owner   
--------+------------------+-------+----------
 public | pgbench_accounts | table | postgres
 public | pgbench_branches | table | postgres
 public | pgbench_history  | table | postgres
 public | pgbench_tellers  | table | postgres
(4 rows)

test=# \q
```

### CLI
#### Install DBLab client CLI (`dblab`)
CLI can be used on any machine, you just need to be able to reach the DBLab UI/API (port 2346).

```bash
curl -sSL dblab.sh | bash
```

Set up SSH port forwarding for UI/API port 2346:
```bash
# Replace with your server IP
ssh -N -L 2346:127.0.0.1:2346 ubuntu@35.183.123.243
```

Initialize CLI configuration (assuming that `localhost:2346` forwards to DBLab machine's port 2346):
```bash
dblab init \
  --environment-id=dle-demo \
  --token=tEsuMyA3M108AZYEXWNXDqNJfFp8vefx \
  --url=http://127.0.0.1:2346/api \
  --insecure
```

Check the configuration by fetching the status of the instance:
```bash
dblab instance status
```

#### Create a clone
```bash
dblab clone create \
  --username dblab_user_1 \
  --password secret_password \
  --id my_first_clone
```

To connect to clones, also use SSH port forwarding:
```bash
# Replace with your server IP and clone port
ssh -N -L 6000:127.0.0.1:6000 ubuntu@35.183.123.243
```

After a second or two, if everything is configured correctly, you will see that the clone is ready to be used. It should look like this:
```json
{
    "id": "my_first_clone",
    "protected": false,
    "deleteAt": null,
    "createdAt": "2023-08-15T21:24:42Z",
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    "db": {
        "connStr": "host=localhost port=6001 user=dblab_user_1 dbname=postgres",
        "host": "localhost",
        "port": "6000",
        "username": "dblab_user_1",
        "password": "",
        "dbName": ""
    },
    "snapshot": {
        "id": "dblab_pool/dataset_2@snapshot_20230815202914",
        "createdAt": "2023-08-15T20:30:47Z",
        "dataStateAt": "2023-08-15T20:29:14Z",
        "pool": "dblab_pool/dataset_2",
        "numClones": 2,
        "physicalSize": "0 B",
        "logicalSize": "587 MiB"
    },
    "metadata": {
        "cloningTime": 1.077492737,
        "maxIdleMinutes": 120,
        "cloneDiffSize": "182 KiB",
        "logicalSize": "587 MiB"
    }
}
```

#### Connect to a clone
You can work with the clone you created earlier using any PostgreSQL client, for example, `psql`. To install `psql`:
- macOS (with [Homebrew](https://brew.sh/)):
    ```bash
    brew install libpq
    ```
- Ubuntu:
    ```bash
    sudo apt-get install postgresql-client
    ```

Use connection info (the `db` section of the response of the `dblab clone create` command):
```bash
PGPASSWORD=secret_password psql \
  "host=localhost port=6000 user=dblab_user_1 dbname=test"
```

Check the available tables:
```
\dt+
```

Now let's see how quickly we can reset the state of the clone. Delete some data or drop a table. Do any damage you want! And then use the `clone reset` command (replace `my_first_clone` with the ID of your clone if you changed it). You can do it not leaving `psql` – for that, use the `\!` command:
```bash
\! dblab clone reset my_first_clone
```

Check the status of the clone:
```bash
\! dblab clone status my_first_clone
```

Notice how fast the resetting was, just a few seconds! 💥

Reconnect to the clone:
```
\c
```

Now check the database objects you've dropped or partially deleted – the "damage" has gone.

For more, see [the full client CLI reference](/docs/reference-guides/dblab-client-cli-reference).

## Troubleshooting
To troubleshot:
- Use SSH to connect to the DBLab server
- Check the containers that are running: `sudo docker ps`
- Check the DBLab container's logs: `sudo docker logs dblab_server`
- If needed, check Postgres logs for the main branch. They are located in `/var/lib/dblab/dblab_pool/dataset_1/data/log` for the first snapshot of the database, in ``/var/lib/dblab/dblab_pool/dataset_2/data/log` for the second one (if it's already fetched); if you've configured DBLab to have more than 2 snapshots, check out the other directories too (`/var/lib/dblab/dblab_pool/dataset_$N/data/log`, where `$N` is the snapshot number, starting with `1`)

## Getting support
With DBLab installed from DBLab Platform, guaranteed vendor support is included – please use [one of the available ways to contact](https://postgres.ai/contact).
