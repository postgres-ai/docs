---
title: Database Lab tutorial for any PostgreSQL database
sidebar_label: Tutorial for any PostgreSQL database
keywords:
  - "Database Lab Engine tutorial"
  - "Start using Database Lab Engine"
  - "Postgres.ai tutorial"
description: In this tutorial, we are going to create a "demo" PostgreSQL database and then set up a Database Lab Engine for it. Database Lab is used to boost software development and testing processes via enabling ultra-fast provisioning of databases of any size.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Database Lab is used to boost software development and testing processes via enabling ultra-fast provisioning of databases of any size.

:::tip Terraform Module released 🎉
Try out [Database Lab installation using Terraform Module](/docs/how-to-guides/administration/install-database-lab-with-terraform), it's simpler and automates a bunch of manual steps. Continue with the current tutorial for more customizability and granual control, or see [Database Lab tutorial for Amazon RDS](/docs/tutorials/database-lab-tutorial-amazon-rds).
:::

In this tutorial, we are going to create a "demo" PostgreSQL database and then set up a Database Lab Engine for it. Database Lab Engine will be installed on an AWS EC2 instance (alternatively, it can be an instance on another cloud platform such as GCP, or a bare-metal machine) with Ubuntu 18.04 or 20.04, and add an EBS volume to store PostgreSQL data directory. Optionally, you'll be able to skip creating the "demo" database and use an existing database instead.

Steps:

1. Prepare a virtual machine (we will use AWS EC2) with an additional disk to store data, install Docker to run containers, and ZFS to enable copy-on-write for thin cloning
1. Configure and launch the Database Lab Engine
1. Start using Database Lab API and client CLI to clone Postgres database in seconds

:::tip
Not using AWS? Not a problem: if you want to use any other cloud provider (like Google Cloud) or run your Database Lab on VMWare, or on bare metal; only the first step is going to be slightly different. In general, the overall procedure is the same.
:::

:::info
LVM support as an alternative to ZFS first appeared in [version 0.3.0 of Database Lab](https://gitlab.com/postgres-ai/database-lab/-/releases). Note that LVM, unlike a ZFS, does not support multiple snapshots and related features.
:::

## Step 1. Prepare a machine with disk, Docker, and ZFS
### Prepare a machine
Create an EC2 instance with Ubuntu 18.04 or 20.04, and add an EBS volume to store data. You can find detailed instructions on how to create an AWS EC2 instance [here](https://docs.aws.amazon.com/efs/latest/ug/gs-step-one-create-ec2-resources.html) (if you want to use Google Cloud, see [the GCP documentation](https://cloud.google.com/compute/docs/instances/create-start-instance)).

### (optional) Ports need to be open in the Security Group being used
You will need to open the following ports (inbound rules in your Security Group):
- `22`: to connect to the instance using SSH
- `2345`: to work with Database Lab Engine API (can be changed in the Database Lab Engine configuration file)
- `6000-6100`: to connect to PostgreSQL clones (this is the default port range used in the Database Lab Engine configuration file, and can be changed if needed)

:::caution
For real-life use, it is not a good idea to open ports to the public. Instead, it is recommended to use VPN or SSH port forwarding to access both Database Lab API and PostgreSQL clones, or to enforce encryption for all connections using NGINX with SSL and configuring SSL in PostgreSQL configuration.
:::

Additionally, to be able to install software, allow access to external resources using HTTP/HTTPS (edit the outbound rules in your Security Group):
- `80` for HTTP
- `443` for HTTPS

Here is how the inbound and outbound rules in your Security Group may look:

![EC2 security group inbound](/assets/ec2-security-group-inbound.png)

![EC2 security group outbound](/assets/ec2-security-group-outbound.png)

### Install Docker
If needed, you can find the detailed installation guides for Docker [here](https://docs.docker.com/install/linux/docker-ce/ubuntu/).

Install dependencies:
```bash
sudo apt-get update && sudo apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  software-properties-common
```

Install Docker:
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository \
  "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) \
  stable"

sudo apt-get update && sudo apt-get install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io
```

### Set $DBLAB_DISK
Further, we will need environment variable `$DBLAB_DISK`. It must contain the device name that corresponds to the disk where all the Database Lab Engine data will be stored.

To understand what needs to be specified in `$DBLAB_DISK` in your case, check the output of `lsblk`:
```bash
sudo lsblk
```

Some examples:
- **AWS local ephemeral NVMe disks; EBS volumes for instances built on [the Nitro system](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/nvme-ebs-volumes.html)**:
    ```bash
    $ sudo lsblk
    NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
    ...
    nvme0n1     259:0    0    8G  0 disk
    └─nvme0n1p1 259:1    0    8G  0 part /
    nvme1n1     259:2    0   777G  0 disk

    $ export DBLAB_DISK="/dev/nvme1n1"
    ```
- **AWS EBS volumes for older (pre-Nitro) EC2 instances**:
    ```bash
    $ sudo lsblk
    NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
    ...
    xvda    202:0    0    8G  0 disk
    └─xvda1 202:1    0    8G  0 part /
    xvdb    202:16   0  777G  0 disk

    $ export DBLAB_DISK="/dev/xvdb"
    ```

### Set up either ZFS or LVM to enable thin cloning
ZFS is a recommended way to enable thin cloning in Database Lab. LVM is also available, but has certain limitations:
- much less flexible disk space consumption and risks for a clone to be destroyed during massive operations in it
- inability to work with multiple snapshots ("time travel"), cloning always happens based on the most recent version of data

<Tabs
  groupId="file-systems"
  defaultValue="zfs"
  values={[
    {label: 'ZFS', value: 'zfs'},
    {label: 'LVM', value: 'lvm'},
  ]
}>
<TabItem value="zfs">

Install ZFS:
```bash
sudo apt-get install -y zfsutils-linux
```

Create a new ZFS storage pool (make sure `$DBLAB_DISK` has the correct value, see the previous step!):
```bash
sudo zpool create -f \
  -O compression=on \
  -O atime=off \
  -O recordsize=128k \
  -O logbias=throughput \
  -m /var/lib/dblab/dblab_pool \
  dblab_pool \
  "${DBLAB_DISK}"
```

:::tip
If you're going to keep the state of DLE up-to-date with the source (`physicalRestore.sync.enabled: true` in the DLE config), then consider lower values for `recordsize`. Using `recordsize=128k` might give you a better compression ratio and performance of massive IO-bound operations like the creation of an index, but worse performance of WAL replay, so the lag can be higher. And vice versa, with `recordsize=8k`, the performance of WAL replay will be better, but the trade-off is a lower compression ratio and longer duration of index creation.
:::

And check the result using `zfs list` and `lsblk`, it has to be like this:
```bash
$ sudo zfs list
NAME         USED  AVAIL  REFER  MOUNTPOINT
dblab_pool   106K  777G    24K  /var/lib/dblab/dblab_pool

$ sudo lsblk
NAME      MAJ:MIN  RM  SIZE RO TYPE MOUNTPOINT
...
nvme0n1     259:0    0     8G  0 disk
└─nvme0n1p1 259:1    0     8G  0 part /
nvme1n1     259:0    0   777G  0 disk
├─nvme1n1p1 259:3    0   777G  0 part
└─nvme1n1p9 259:4    0     8M  0 part
```

</TabItem>
<TabItem value="lvm">

Install LVM2:
```bash
sudo apt-get install -y lvm2
```

Create an LVM volume (make sure `$DBLAB_DISK` has the correct value, see the previous step!):
```bash
# Create Physical Volume and Volume Group
sudo pvcreate "${DBLAB_DISK}"
sudo vgcreate dblab_vg "${DBLAB_DISK}"

# Create Logical Volume and filesystem
sudo lvcreate -l 10%FREE -n pool_lv dblab_vg
sudo mkfs.ext4 /dev/dblab_vg/pool_lv

# Mount Database Lab pool
sudo mkdir -p /var/lib/dblab/dblab_vg-pool_lv
sudo mount /dev/dblab_vg/pool_lv /var/lib/dblab/dblab_vg-pool_lv

# Bootstrap LVM snapshots so they could be used inside Docker containers
sudo lvcreate --snapshot --extents 10%FREE --yes --name dblab_bootstrap dblab_vg/pool_lv
sudo lvremove --yes dblab_vg/dblab_bootstrap
```

:::info
Logical volume size needs to be defined at volume creation time. By default, we allocate 10% of the available memory. If the volume size exceeds the allocated memory, the volume will be destroyed and potentially lead to data loss. To prevent volumes from being destroyed, consider enabling the LVM auto-extend feature.
:::

To enable the auto-extend feature, the following LVM configuration options need to be updated:
- `snapshot_autoextend_threshold`: auto-extend a "snapshot" volume when its usage exceeds the specified percentage
- `snapshot_autoextend_percent`: auto-extend a "snapshot" volume by the specified percentage of the available space once the usage exceeds the threshold

Update LVM configuration (located in `/etc/lvm/lvm.conf` by default):
```bash
sudo sed -i 's/snapshot_autoextend_threshold.*/snapshot_autoextend_threshold = 70/g' /etc/lvm/lvm.conf
sudo sed -i 's/snapshot_autoextend_percent.*/snapshot_autoextend_percent = 20/g' /etc/lvm/lvm.conf
```

</TabItem>
</Tabs>

## Step 2. Configure and launch the Database Lab Engine
:::caution
To make your work with Database Lab API secure, do not open Database Lab API and Postgres clone ports to the public and instead use VPN or SSH port forwarding. It is also a good idea to encrypt all the traffic: for Postgres clones, set up SSL in the configuration files; and for Database Lab API, install, and configure NGINX with a self-signed SSL certificate. See the [How to Secure Database Lab Engine](/docs/how-to-guides/administration/engine-secure).
:::

### Prepare database data directory
Next, we need to get the data to the Database Lab Engine server. For our testing needs, we have 3 options:
1. "Generated database": generate a synthetic database for testing purposes
1. "Physical copy" (`pg_basebackup`): copy an existing database (perform "think cloning" once) using a "physical" method such as `pg_basebackup`
1. "Logical copy" (dump/restore): copy an existing database using the "logical" method (dump/restore)

<Tabs
  groupId="tutorial-data-sources"
  defaultValue="generated-database"
  values={[
    {label: '1. Generated database', value: 'generated-database'},
    {label: '2. Physical copy (pg_basebackup)', value: 'physical-copy'},
    {label: '3. Logical copy (dump/restore)', value: 'logical-copy'},
  ]
}>
<TabItem value="generated-database">

If you don't have an existing database for testing, then let's just generate some synthetic database in the data directory ("PGDATA") located at `/var/lib/dblab/dblab_pool/data`. A simple way of doing this is to use PostgreSQL standard benchmarking tool, `pgbench`. With scale factor `-s 100`, the database size will be ~1.4 GiB; feel free to adjust the scale factor value according to your needs.

To generate PGDATA with `pgbench`, we are going to run a regular Docker container with Postgres temporarily. We will use `POSTGRES_HOST_AUTH_METHOD=trust` to allow a connection without authentication (not suitable for real-life use).

```bash
sudo docker run \
  --name dblab_pg_initdb \
  --label dblab_sync \
  --env PGDATA=/var/lib/postgresql/pgdata \
  --env POSTGRES_HOST_AUTH_METHOD=trust \
  --volume /var/lib/dblab/dblab_pool/data:/var/lib/postgresql/pgdata \
  --detach \
  postgres:14-alpine
```

Create the `test` database:
```bash
sudo docker exec -it dblab_pg_initdb psql -U postgres -c 'create database test'
```

Generate data in the `test` database using `pgbench`:
```bash
# 10,000,000 accounts, ~1.4 GiB of data.
sudo docker exec -it dblab_pg_initdb pgbench -U postgres -i -s 100 test
```

PostgreSQL data directory is ready. Now let's stop and remove the container:
```bash
sudo docker stop dblab_pg_initdb
sudo docker rm dblab_pg_initdb
```

Now, we need to take care of Database Lab Engine configuration. Copy the contents of configuration example [`config.example.logical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/v3.0.3/configs/config.example.logical_generic.yml) from the Database Lab repository to `~/.dblab/engine/configs/server.yml`:
```bash
mkdir -p ~/.dblab/engine/configs

curl https://gitlab.com/postgres-ai/database-lab/-/raw/v3.0.3/configs/config.example.logical_generic.yml \
  --output ~/.dblab/engine/configs/server.yml
```

Open `~/.dblab/engine/configs/server.yml` and edit the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Database Lab Engine
- Remove `logicalDump` section completely
- Remove `logicalRestore` section completely
- Leave `logicalSnapshot` as is
- If your Postgres major version is not 14 (default), set the proper version in Postgres Docker image tag:
    - `databaseContainer:dockerImage`

</TabItem>
<TabItem value="physical-copy">

If you want to try Database Lab for an existing database, you need to copy the data to PostgreSQL data directory on the Database Lab server, to the directory `/var/lib/dblab/dblab_pool/data`. This step is called "thick cloning". It only needs to be completed once. There are several options to physically copy the data directory. Here we will use the standard PostgreSQL tool, `pg_basebackup`. However, we are not going to use it directly (although, it is possible) – we will specify its options in the Database Lab Engine configuration file.

First, copy the example configuration file[`config.example.physical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/v3.0.3/configs/config.example.physical_generic.yml) from the Database Lab repository to `~/.dblab/engine/configs/server.yml`:
```bash
mkdir -p ~/.dblab/engine/configs

curl https://gitlab.com/postgres-ai/database-lab/-/raw/v3.0.3/configs/config.example.physical_generic.yml \
  --output ~/.dblab/engine/configs/server.yml
```

Next, open `~/.dblab/engine/configs/server.yml` and edit the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Database Lab Engine
- In `retrieval:spec:physicalRestore:options:envs`, specify how to reach the source Postgres database to run `pg_basebackup`: `PGUSER`, `PGPASSWORD`, `PGHOST`, and `PGPORT`
- If your Postgres major version is not 14 (default), set the proper version in Postgres Docker image tag:
    - `databaseContainer:dockerImage`

:::tip
Optionally, you might want to keep PGDATA up-to-date (which is being continuously updated). Good news is that this is supported if you chose the "physical" method of initialization for the data directory. To have PGDATA updated continuously, configure `retrieval:spec:physicalRestore:restore_command` option by specifying the value normally used in `restore_command` on PostgreSQL replicas based on WAL shipping.
:::

</TabItem>
<TabItem value="logical-copy">

If you want to try Database Lab for an existing database, you need to copy the data to the PostgreSQL data directory on the Database Lab server, to the directory `/var/lib/dblab/dblab_pool/data`. This step is called "thick cloning". It only needs to be completed once.

Here we will configure Database Lab Engine to use a "logical" method of thick cloning, dump/restore.

First, copy the configuration example configuration file[`config.example.logical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/v3.0.3/configs/config.example.logical_generic.yml) from the Database Lab repository to `~/.dblab/engine/configs/server.yml`:
```bash
mkdir -p ~/.dblab/engine/configs

curl https://gitlab.com/postgres-ai/database-lab/-/raw/v3.0.3/configs/config.example.logical_generic.yml \
  --output ~/.dblab/engine/configs/server.yml
```

Now open `~/.dblab/engine/configs/server.yml` and edit the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Database Lab Engine
- Set connection options in `retrieval:spec:logicalDump:options:source:connection`:
    - `dbname`: database name to connect to
    - `host`: database server host
    - `port`: database server port
    - `username`: database user name
    - `password`: database master password (can be also set as `PGPASSWORD` environment variable and passed to the container using `--env` option of `docker run`)
- If your Postgres major version is not 14 (default), set the proper version in Postgres Docker image tag:
    - `databaseContainer:dockerImage`

</TabItem>
</Tabs>

### Launch Database Lab server

<Tabs
  groupId="tutorial-data-sources"
  defaultValue="generated-database"
  values={[
    {label: '1. Generated database', value: 'generated-database'},
    {label: '2. Physical copy (pg_basebackup)', value: 'physical-copy'},
    {label: '3. Logical copy (dump/restore)', value: 'logical-copy'},
  ]
}>
<TabItem value="generated-database">

```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 127.0.0.1:2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume ~/.dblab/engine/configs:/home/dblab/configs:ro \
  --volume ~/.dblab/engine/meta:/home/dblab/meta \
  --volume /sys/kernel/debug:/sys/kernel/debug:rw \
  --volume /lib/modules:/lib/modules:ro \
  --volume /proc:/host_proc:ro \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:3.0.3
```

</TabItem>
<TabItem value="physical-copy">

```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 127.0.0.1:2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume ~/.dblab/engine/configs:/home/dblab/configs:ro \
  --volume ~/.dblab/engine/meta:/home/dblab/meta \
  --volume /sys/kernel/debug:/sys/kernel/debug:rw \
  --volume /lib/modules:/lib/modules:ro \
  --volume /proc:/host_proc:ro \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:3.0.3
```

</TabItem>
<TabItem value="logical-copy">

```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 127.0.0.1:2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume ~/.dblab/engine/configs:/home/dblab/configs:ro \
  --volume ~/.dblab/engine/meta:/home/dblab/meta \
  --volume /var/lib/dblab/dblab_pool/dump:/var/lib/dblab/dblab_pool/dump \
  --volume /sys/kernel/debug:/sys/kernel/debug:rw \
  --volume /lib/modules:/lib/modules:ro \
  --volume /proc:/host_proc:ro \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:3.0.3
```

</TabItem>
</Tabs>

:::info
Parameter `--publish 127.0.0.1:2345:2345` means that only local connections will be allowed.

To allow external connections, consider either using additional software such as NGINX or Envoy or changing this parameter. Removing the host/IP part (`--publish 2345:2345`) allows listening to all available network interfaces.
See more details in the official [Docker command-line reference](https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose).
:::


### How to check the Database Lab Engine logs
```bash
sudo docker logs dblab_server -f
```

### Need to start over? Here is how to clean up
If something went south and you need to make another attempt at the steps in this tutorial, use the following steps to clean up:
```bash
# Stop and remove all Docker containers
sudo docker ps -aq | xargs --no-run-if-empty sudo docker rm -f

# Remove all Docker images
sudo docker images -q | xargs --no-run-if-empty sudo docker rmi

# Clean up the data directory
sudo rm -rf /var/lib/dblab/dblab_pool/data/*

# Remove dump directory
sudo umount /var/lib/dblab/dblab_pool/dump
sudo rm -rf /var/lib/dblab/dblab_pool/dump

# To start from the very beginning: destroy ZFS storage pool
sudo zpool destroy dblab_pool
```

## Step 3. Start cloning!
### CLI
#### Install Database Lab client CLI
CLI can be used on any machine, you just need to be able to reach the Database Lab Engine API (port 2345 by default). In this tutorial, we will install and use CLI locally on the EC2 instance.

```bash
curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/engine/scripts/cli_install.sh | bash
sudo mv ~/.dblab/dblab /usr/local/bin/dblab
```

Initialize CLI configuration:
```bash
dblab init \
  --environment-id=tutorial \
  --url=http://localhost:2345 \
  --token=secret_token \
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

After a second or two, if everything is configured correctly, you will see that the clone is ready to be used. It should look like this:
```json
{
    "id": "botcmi54uvgmo17htcl0",
    "snapshot": {
        "id": "dblab_pool@initdb",
        "createdAt": "2020-02-04 23:20:04 UTC",
        "dataStateAt": "2020-02-04 23:20:04 UTC"
    },
    "protected": false,
    "deleteAt": "",
    "createdAt": "2020-02-05 14:03:52 UTC",
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    "db": {
        "connStr": "host=111.222.000.123 port=6000 user=dblab_user_1",
        "host": "111.222.000.123",
        "port": "6000",
        "username": "dblab_user_1",
        "password": ""
    },
    "metadata": {
        "cloneDiffSize": 479232,
        "cloningTime": 2.892935211,
        "maxIdleMinutes": 0
    },
    "project": ""
}
```

#### Connect to a clone
Install psql:
```bash
sudo apt-get install postgresql-client
```

Now you can work with this clone using any PostgreSQL client, for example, `psql`. Use the following connection info (`db` section of the response of the `dblab clone create` command):
```bash
PGPASSWORD=secret_password psql \
  "host=localhost port=6000 user=dblab_user_1 dbname=test"
```

Check the available table:
```
\d+
```

Now let's see how quickly we can reset the state of the clone. Delete some data or drop some table.

To reset, use the `clone reset` command (replace `my_first_clone` with the ID of your clone if you changed it). You can do it not leaving psql -- for that, use the `\!` command:
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

Now check the database objects you've dropped or partially deleted – everything should be the same as when we started.

For more, see [the full client CLI reference](/docs/database-lab/cli-reference).


### GUI (Database Lab Platform)
To use the GUI, you need to [sign up for Database Lab Platform](https://postgres.ai/console).


#### Add Database Lab Engine to the Platform
1. On the **Database Lab instances** page of your organization click the **Add instance** button.
![Database Lab Engine / Database Lab instances](/assets/guides/add-engine-instance-1.png)
1. On the **Add instance** page fill in the following:
    - `Project`: choose any project name, it will be created automatically
    - `Verification token`: specify the same verification token that you've used in the Database Lab Engine configuration file
    - `URL`: Database Lab API server (EC2 instance public IP or hostname, specify port if needed, e.g. `https://my-domain.com/dblab-engine/` or `http://30.100.100.1:2345`)

![Database Lab Engine / Add instance](/assets/guides/add-engine-instance-2.png)
1. Click the **Verify URL** button to check the availability of the Engine. Ignore the warning about insecure connection – in this Tutorial, we have skipped some security-related steps.
1. Click the **Add** button to add the instance to the Platform.

#### Create a clone
1. Go to the **Database Lab instance** page.
1. Click the **Create clone** button.
  ![Database Lab engine page / Create clone](/assets/guides/create-clone-1.png)
1. Fill the **ID** field with a meaningful name.
1. (optional) By default, the latest data snapshot (closest to production state) will be used to provision a clone. You can choose another snapshot if any.
1. Fill **database credentials**. Remember the password (it will not be available later, Database Lab Platform does not store it!) – you will need to use it to connect to the clone.
1. Click the **Create clone** button and wait for a clone to be provisioned. The process should take only a few seconds.
![Database Lab engine clone creation page](/assets/guides/create-clone-2.png)
1. You will be redirected to the **Database Lab clone** page.
    ![Database Lab engine clone page](/assets/guides/create-clone-3.png)

#### Connect to a clone
1. From the **Database Lab clone** page under section **Connection info**, copy the **psql connection string** field contents by clicking the **Copy** button.
    ![Database Lab clone page / psql connection string](/assets/guides/connect-clone-1.png)
1. Here we assume that you have `psql` installed on your working machine. In the terminal, type `psql` and paste the **psql connection string** field contents. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection.
1. Run the command and type the password you've set during the clone creation.
1. Test established connection by listing tables in the database using `\d`.
    ![Terminal / psql](/assets/guides/connect-clone-2.png)

:::info Have questions?
Reach out to our team, we'll be happy to help! Use the Intercom widget located at the right bottom corner.
:::
