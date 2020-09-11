---
title: Database Lab tutorial for Amazon RDS
sidebar_label: Tutorial for Amazon RDS
---

Database Lab is used to boost software development and testing processes via enabling ultra-fast provisioning of databases of any size.

In this tutorial, we are going to set up a Database Lab Engine for an existing PostgreSQL DB instance on Amazon RDS. If you don't have an RDS instance and want to have one to follow the steps in this tutorial, read [the official RDS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html). Database Lab Engine will be installed on an AWS EC2 instance with Ubuntu 18.04, and an additional EBS volume to store PostgreSQL data directory. The data will be automatically retrieved from the RDS database.

>⭐️ Please support the project giving a star on GitLab! ⭐<br/>
>It's on [the main page of the Database Lab Enginer repository](https://gitlab.com/postgres-ai/database-lab), at the upper right corner:
>
>![Add a GitLab star](/docs/assets/star.gif)

Our steps:

1. Prepare an EC2 instance with an additional EBS volume to store data, install Docker to run containers, and ZFS to enable copy-on-write for thin cloning;
1. Configure and launch the Database Lab Engine;
1. Start using Database Lab API and client CLI to clone Postgres database in seconds.

## Step 1. Prepare an EC2 instance with additional volume, Docker and ZFS
### Prepare an instance
Create an EC2 instance with Ubuntu 18.04 and an additional EBS volume to store data. You can find detailed instructions on how to create an AWS EC2 instance [here](https://docs.aws.amazon.com/efs/latest/ug/gs-step-one-create-ec2-resources.html).

### (optional) Ports need to be open in the Security Group being used
You will need to allow working with the following ports (outbound rules in your Security Group):
- `22`: to connect to the instance using SSH;
- `2345`: to work with Database Lab Engine API (can be changed in the Database Lab Engine configuration file);
- `6000-6100`: to connect to PostgreSQL clones (this is default port range used in the Database Lab Engine configuration file, can be chanfed if needed).

> For real-life use, it is not a good idea to open ports to the public. Instead, it is recommended to use VPN or SSH port forwarding to access both Database Lab API and PostgreSQL clones, or to enforce encryption for all connections using NGINX with SSL and configuring SSL in PostgreSQL configuration.

Additionally, to be able to install software, allow accessing external resources using HTTP/HTTPS (edit inbound rule in your Security Group):
- `80` for HTTP;
- `443` for HTTPS.

Here is how the inbound and outbound rules in your Security Group may look like:

![Database Lab architecture](/docs/assets/ec2_security_group_inbound.png)

![Database Lab architecture](/docs/assets/ec2_security_group_outbound.png)

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
Further, we will need `$DBLAB_DISK` environment variable. It must contain the device name corresponding the disk where all the Database Lab Engine data will be stored.

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
    xvda    202:0    0     8G  0 disk
    └─xvda1 202:1    0     8G  0 part /
    nvme0n1 259:0    0   777G  0 disk

    $ export DBLAB_DISK="/dev/nvme0n1"
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

### Install and prepare ZFS
Install ZFS:
```bash
sudo apt-get install -y zfsutils-linux
```

Create a new ZFS storage pool (make sure `$DBLAB_DISK` has the correct value, see the previous step!):
```bash
sudo zpool create -f \
  -O compression=on \
  -O atime=off \
  -O recordsize=8k \
  -O logbias=throughput \
  -m /var/lib/dblab/data \
  dblab_pool \
  "${DBLAB_DISK}"
```

And check the result using `zfs list` and `lsblk`, it has to be like this:
```bash
$ sudo zfs list
NAME         USED  AVAIL  REFER  MOUNTPOINT
dblab_pool   106K  777G    24K  /var/lib/dblab/data

$ sudo lsblk
NAME      MAJ:MIN  RM  SIZE RO TYPE MOUNTPOINT
...
xvda        202:0  0     8G  0 disk
└─xvda1     202:1  0     8G  0 part /
nvme0n1     259:0  0   777G  0 disk
├─nvme0n1p1 259:3  0   777G  0 part
└─nvme0n1p9 259:4  0     8M  0 part
```

## Step 2. Configure and launch the Database Lab Engine
>To make your work with Database Lab API secure, do not open Database Lab API and Postgres clones ports to the public and use VPN or SSH port forwarding. It is also a good idea to encrypt all the traffic: for Postgres clones, set up SSL in the configuration files; and for Database Lab API, install, and configure NGINX with a self-signed SSL certificate. See the [How to Secure Database Lab Engine](/docs/guides/administration/engine-secure).

We have two options to connect to the RDS database: password-based, and IAM-based. The former is always available, while the latter is more secure and recommended, but it is available only if you specified it inn **Database Authentication Options** when creating your RDS instance (it is not selected by default). To learn if IAM-based option is available for already created RDS instance, open "Configuration" tab and check if "IAM db authentication" is `Enabled`.

Options:
- **IAM database authentication**. This option can be used only if **Password and IAM database authentication** was specified during creation of the RDS instance, it requires AWS user credentials and does not require the master password, use this option for granular control of the access to your database.
- **Password authentication (master password)**. This option can always be used. It requires specifying of database master password in the Database Lab Engine configuration file or in `PGPASSWORD` environment variable.

For the sake of simplicity, we will use the password-based authentication in this tutorial. If you want to use IAM database authentication, read how to enable it [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.Enabling.html).

<!--DOCUSAURUS_CODE_TABS-->
<!--password-->
### Option 1: Password authentication
>You need to know the **master password**. If you lost the password it [can be reset](https://aws.amazon.com/premiumsupport/knowledge-center/reset-master-user-password-rds/).

#### Configure Database Lab Engine
Copy the contents of configuration example [`config.example.logical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/master/configs/config.example.logical_generic.yml) from the Database Lab repository to `~/.dblab/server.yml`:
```bash
mkdir ~/.dblab

curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/configs/config.example.logical_generic.yml \
  --output ~/.dblab/server.yml
```

Then open `~/.dblab/server.yml` and edit the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Database Lab Engine.
- Set connection options in `retrieval:spec:logicalDump:options:source:connection`:
    - `dbname`: database name to connect to;
    - `host`: database server host;
    - `port`: database server port;
    - `username`: database user name;
    - `password`: database master password (can be also set as `PGPASSWORD` environment variable and passed to the container using `--env` option of `docker run`).
- If your Postgres major version is not 12 (default), set the proper version in Postgres Docker images tags:
    - `provision:options:dockerImage`;
    - `retrieval:spec:logicalRestore:options:dockerImage`;
    - `retrieval:spec:logicalDump:options:dockerImage`.

#### Run Database Lab Engine
Run Database Lab Engine:
```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 2345:2345 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab/db.dump:/var/lib/dblab/db.dump \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume ~/.dblab/server.yml:/home/dblab/configs/config.yml \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:2.0.0-beta.2
```

<!--iam-based-->
### Option 2: IAM database authentication
#### Prepare AWS user and IAM database access policy
1. Create an AWS user (or use an existing one).

2. Save and assign AWS access environment variables:
```bash
export AWS_ACCESS_KEY="access_key"
export AWS_SECRET_ACCESS_KEY="secret_access_key"
```

Read how you can get the AWS access keys for the existing user [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).

3. Create and attach an IAM Policy for IAM Database Access to an AWS user. Read how you can to it [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.IAMPolicy.html).

> Alternatively, you can add `AmazonRDSFullAccess`, `IAMFullAccess` policies to an AWS user (not recommended).

#### Configure Database Lab Engine
Copy the contents of configuration example [`config.example.logical_rds_iam.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/master/configs/config.example.logical_rds_iam.yml) from the Database Lab repository to `~/.dblab/server.yml`:
```bash
mkdir ~/.dblab

curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/configs/config.example.logical_rds_iam.yml \
  --output ~/.dblab/server.yml
```

Then open `~/.dblab/server.yml` and edit the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Engine.
- Set connection options `retrieval:spec:logicalDump:options:source:connection`:
    - `dbname`: database name to connect to;
    - `username`: database user name.
- Set AWS params in `retrieval:spec:logicalDump:options:source:rdsIam`:
    - `awsRegion`: RDS instance region;
    - `dbInstanceIdentifier`: RDS instance identifier.
- If your Postgres major version is not 12 (default), set the proper version in Postgres Docker images tags:
    - `provision:options:dockerImage`;
    - `retrieval:spec:logicalRestore:options:dockerImage`;
    - `retrieval:spec:logicalDump:options:dockerImage`.

#### Download AWS RDS certificate
This type of data retrieval requires a secure connection to a database. To setup it we need to download a certificate from AWS.

```bash
curl https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem \
  --output ~/.dblab/rds-combined-ca-bundle.pem
```

#### Run Database Lab Engine
Run Database Lab Engine (set proper **AWS access keys** and update **Verification token**):
```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 2345:2345 \
  --volume ~/.dblab/server.yml:/home/dblab/configs/config.yml \
  --volume /var/lib/dblab/rds_db.dump:/var/lib/dblab/rds_db.dump \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab/:rshared \
  --volume ~/.dblab/rds-combined-ca-bundle.pem:/cert/rds-combined-ca-bundle.pem \
  --env AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY}" \
  --env AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
  --env DOCKER_API_VERSION=1.39 \
  --detach \
  --restart on-failure \
  postgresai/dblab-server:2.0.0-beta.2
```
<!--END_DOCUSAURUS_CODE_TABS-->

### How to check Databaes Lab Engine logs
```bash
sudo docker logs dblab_server -f
```

### Need to start over? Here is how to clean up
If something went south and you need to make another attempt to follow the steps in this tutorial, use the following steps to clean up:
```bash
# Stop and remove all Docker containers
sudo docker ps -aq | xargs --no-run-if-empty sudo docker rm -f

# Remove all Docker images
sudo docker images -q | xargs --no-run-if-empty sudo docker rmi

# Clean up data directory
sudo rm -rf /var/lib/dblab/data/*

# Remove dump file
sudo umount /var/lib/dblab/db.dump
sudo rm -rf /var/lib/dblab/db.dump

# To start from very beginning: destroy ZFS storage pool
sudo zpool destroy dblab_pool
```

## Step 3. Start cloning!

### Option 1: GUI (Database Lab Platform)
To use GUI, you need to [sign up](https://postgres.ai/console) to Database Lab Platform.

>Currently, Database Lab GUI is in "private beta" mode. The onboarding consists of two steps. Step 1: you sign up using either Google, or LinkedIn, or GitLab, or GitHub account. Step 2: the Postgres.ai team contacts you and schedules a demo, during which your account will be activated.

#### Add Database Lab Engine to the Platform
1. On the **Database Lab instances** page of your organization click the **Add instance** button.
![Database Lab Engine / Database Lab instances](/docs/assets/guides/add-engine-instance-1.png)
1. One the **Add instance** page fill the following:
    - `Project`: choose any project name, it will be created automatically;
    - `Verification token`: specify the same verification token that you've used in the Database Lab Engine configuration file;
    - `URL`: Database Lab API server (EC2 instance public IP or hostname).
![Database Lab Engine / Add instance](/docs/assets/guides/add-engine-instance-2.png)
1. Click the **Verify URL** button to check the availability of the Engine. Ignore the warning about insecure connection – in this Tutorial, we have skipped some security-related steps.
1. Click the **Add** button to add the instance to the Platform.

#### Create a clone
1. Go to the **Database Lab instance** page.
1. Click the **Create clone** button.
  ![Database Lab engine page / Create clone](/docs/assets/guides/create-clone-1.png)
1. Fill the **ID** field with a meaningful name.
1. (optional) By default, the latest data snapshot (closest to production state) will be used to provision a clone. You can choose another snapshot, if any.
1. Fill **database credentials**. Remember the password (it will not be available later, Database Lab Platform does not store it!) – you will need to use it to connect to the clone.
1. Click the **Create clone** button and wait for a clone to be provisioned. The process should take only a few seconds.
![Database Lab engine clone creation page](/docs/assets/guides/create-clone-2.png)
1. You will be redirected to the **Database Lab clone** page.
    ![Database Lab engine clone page](/docs/assets/guides/create-clone-3.png)

#### Connect to a clone
1. From the **Database Lab clone** page under section **Connection info** copy **psql connection string** field contents by clicking the **Copy** button.
    ![Database Lab clone page / psql connection string](/docs/assets/guides/connect-clone-1.png)
1. Here we assume that you have `psql` installed on your working machine. In terminal, type `psql` and paste **psql connection string** field contents. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection.
1. Run the command and type the password you've set during the clone creation.
1. Test established connection by listing tables in the database using `\d`.
    ![Terminal / psql](/docs/assets/guides/connect-clone-2.png)

### Option 2: CLI
#### Install Database Lab client CLI
CLI can be used on any machine, you just need to be able to reach Database Lab Engine API (port 2345 by default). In this tutorial, we will install and use CLI locally on the EC2 instance.

```bash
curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/scripts/cli_install.sh | bash
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

Now you can work with this clone using any PostgreSQL client, for example `psql`. Use connection info (`db` section of the response of the `dblab clone create` command):
```bash
PGPASSWORD=secret_password psql \
  "host=localhost port=6000 user=dblab_user_1 dbname=test"
```

Check the available table:
```
\d+
```

Now let's see how quickly we can reset the state of the clone. Delete some data or drop some table.

To reset, use the `clone reset` command (replace `my_first_clone` with the ID of your clone if you changed it). You can do it not leaving psql -- for that, use `\!` macrocommand:
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

Now check the database objects you've dropped or partially deleted – everything should be as when we started.

For more, see [the full client CLI reference](/docs/database-lab/cli-reference).

>Have questions? Reach out our team, we'll be happy to help! Use the Intercom widget located at the right bottom corner.

## 👋 Database Lab "Private Beta" program
Database Lab Platform (SaaS) is currently in a "private beta" mode, being tested by several hundred engineers. Want to become an early adopter? Join Database Lab by Postgres.ai "Private Beta" program today: https://postgres.ai/console/.
