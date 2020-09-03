---
title: Start using Database Lab for RDS
sidebar_label: Start using Database Lab for RDS
---

Database Lab aims to boost software development and testing processes via enabling ultra-fast provisioning of multi-terabyte databases.

In this tutorial, we will create an AWS EC2 instance with Ubuntu 18.04, PostgreSQL 12, and additional EBS volume for PostgreSQL data directory automatically retrieved from an RDS instance.

>Please support the project giving a GitLab star (it's on [the main page of the project repository](https://gitlab.com/postgres-ai/database-lab), at the upper right corner):
>
>![Add a star](assets/star.gif)

Our steps:

1. Prepare an AWS EC2 instance with an additional EBS volume to store data, Docker and copy-on-write file system;
1. Configure and launch the Database Lab Engine;
1. Start using its API and client CLI for the fast cloning of the Postgres database.


## Step 1. Prepare an AWS EC2 with additional volume and dependencies

### Prepare an instance

Create an EC2 instance with Ubuntu 18.04 and with an additionally attached EBS volume to store data. You can find detailed instructions on how to create an AWS EC2 instance [here](https://docs.aws.amazon.com/efs/latest/ug/gs-step-one-create-ec2-resources.html).

### (optional) Open ports in firewall 

To connect to the Database Lab Engine API or clones you need to whitelist the following ports:
- `2345`: Database Lab Engine API port;
- `6000-6100`: Postgres clones will be running listening TCP/IP ports in this range (configurable), so if need to connect to Postgres clones from outside, ensure that ports from this range are also whitelisted.

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

### Install and configure ZFS

```bash
sudo apt-get install -y \
  zfsutils-linux
```

#### Set database data disk name
Set `$DBLAB_DISK` environment variable with the name of the EBS volume device that will be used to store the database data directory being used to create thin clones.

To specify `$DBLAB_DISK`, check the list of disks using `lsblk`. Some examples:
  - **AWS EBS volume**: use `lsblk` that will show something like `/dev/xvdb`, so you need to run `export DBLAB_DISK="/dev/xvdb"`;
  - **AWS local ephemeral NVMe disk**: you would need something like `export DBLAB_DISK="/dev/nvme0n1"`.

> ⚠ Be careful with defining the value of `$DBLAB_DISK`. If you choose a wrong device and this device stores essential data, you may lose the data in the further steps, when we start writing new data to the device.

#### Create a ZFS pool

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

And check the result:
```bash
sudo zfs list
```


## Step 2. Configure and launch the Database Lab Engine

>To make your work with Database Lab API secure, install, and configure NGINX with a self-signed SSL certificate. See the [Secure Database Lab Engine](/docs/guides/administration/engine-secure) guide.

We have two options to connect to the RDS database, you need to consider the **Database authentication** method that is assigned to your RDS database.

Options:
- Using **password authentication (master password)**. This option can be used for all **Database authentication** method enabled for your database and requires to set the master password of the database in the Database Lab configuration file;
- **IAM database authentication**. This option can be used only with **Password and IAM database authentication**, it requires AWS user credentials and does not require the master password, use this option for granular control of the access to your database.

If you want to use **IAM database authentication**, read how to enable it [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.Enabling.html).


### Option 1: Password authentication

>You need to know the **master password**. If you lost the password it can be reset. Read how to reset it [here](https://aws.amazon.com/premiumsupport/knowledge-center/reset-master-user-password-rds/).

Copy the contents of configuration example [`config.example.logical_generic.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/master/configs/config.example.logical_generic.yml) from the Database Lab repository to `~/.dblab/server.yml` and update the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Engine;
- Set connection options in `retrieval:spec:logicalDump:options:source:connection`:
  - `dbname`: database name to connect to;
  - `host`: database server host;
  - `port`: database server port;
  - `username`: database user name;
  - `password`: database master password (can be also set as `PGPASSWORD` environment variable of the Docker container).
- Set proper version in Postgres Docker images tags (change the images itself only if you know what are you doing):
  - `provision:options:dockerImage`;
  - `retrieval:spec:logicalRestore:options:dockerImage`;
  - `retrieval:spec:logicalDump:options:dockerImage`.

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


### Option 2: IAM database authentication

#### Prepare AWS user and IAM database access policy
1. Create an AWS user (or use an existing one).
2. Save and assign AWS access environment variables:
- `export AWS_ACCESS_KEY="access_key"`;
- `export AWS_SECRET_ACCESS_KEY="secret_access_key"`.
Read how you can get the AWS access keys for the existing user [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).
3. Create and attach an IAM Policy for IAM Database Access to an AWS user. Read how you can to it [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.IAMPolicy.html).

> Alternatively, you can add `AmazonRDSFullAccess`, `IAMFullAccess` policies to an AWS user (not recommended).

#### Set up and run the Database Lab Engine
Copy the contents of configuration example [`config.example.logical_rds_iam.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/master/configs/config.example.logical_rds_iam.yml) from the Database Lab repository to `~/.dblab/server.yml` and update the following options:
- Set secure `server:verificationToken`, it will be used to authorize API requests to the Engine;
- Set connection options `retrieval:spec:logicalDump:options:source:connection`:
  - `dbname`: database name to connect to;
  - `username`: database user name;
- Set AWS params in `retrieval:spec:logicalDump:options:source:rdsIam`:
  - `awsRegion`: RDS instance region;
  - `dbInstanceIdentifier`: RDS instance identifier.
- Set proper version in Postgres Docker images tags (change the images itself only if you know what are you doing):
  - `provision:options:dockerImage`;
  - `retrieval:spec:logicalRestore:options:dockerImage`;
  - `retrieval:spec:logicalDump:options:dockerImage`.

#### Download AWS RDS certificate
This type of data retrieval requires a secure connection to a database. To setup it we need to download a certificate from AWS.

```bash
wget https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem -P ~/.dblab/
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

### Restart in the case of failure

```bash
# Stop and remove the Database Lab Engine control container.
sudo docker rm -f dblab_server

# Clean up data directory.
sudo rm -rf /var/lib/dblab/data/*

# Remove dump file.
sudo umount /var/lib/dblab/db.dump
sudo rm -rf /var/lib/dblab/db.dump
```

## Step 3. Start cloning!

### Option 1: GUI
>To use GUI, you need to [sign up](https://postgres.ai/console) to Database Lab Platform.

#### Expose API
Expose Database Lab Engine API server port `2345` and make it available either on some host or IP address.

#### Add Database Lab Engine to the Platform
1. On the **Database Lab instances** page of an organization click the **Add instance** button.
![Database Lab Engine / Database Lab instances](/docs/assets/guides/add-engine-instance-1.png)
1. One the **Add instance** page fill:
  - `Project`: any project name, it will be created automatically;
  - `Verification token`: same verification token that you've added to the Database Lab Engine configuration;
  - `URL`: host of Database Lab API server.
![Database Lab Engine / Add instance](/docs/assets/guides/add-engine-instance-2.png)
1. Click the **Verify URL** button to check the availability of the Engine.
1. Click the **Add** button to add the instance to the Platform.

#### Create a clone
1. Go to the **Database Lab instance** page.
1. Click the **Create clone** button.
  ![Database Lab engine page / Create clone](/docs/assets/guides/create-clone-1.png)
1. Fill the **ID** field with a meaningful name.
1. (optional) By default, the latest data snapshot (closest to production state) will be used to provision a clone. You can select any other available snapshot.
1. Fill **database credentials**. Remember the password, it will not be available later, but you will need to use it to connect to the clone.
1. (optional) Enable protected status (it can be done later if needed). Please be careful: abandoned protected clones may cause out-of-disk-space events. Read the details [here](/docs/guides/clone-protection).
1. Click the **Create clone** button and wait for a clone to provision.
![Database Lab engine clone creation page](/docs/assets/guides/create-clone-2.png)
1. You will be redirected to the **Database Lab clone** page.
  ![Database Lab engine clone page](/docs/assets/guides/create-clone-3.png)

#### Connect to a clone
1. From the **Database Lab clone** page under section **Connection info** copy **psql connection string** field contents by clicking the **Copy** button.
  ![Database Lab clone page / psql connection string](/docs/assets/guides/connect-clone-1.png)
1. In terminal type `psql` and paste **psql connection string** field contents. Change the database name `DBNAME` parameter, you can always use `postgres` for the initial connection.
1. Run the command and type the password you've set during clone creation.
1. Test established connection by listing tables in the database with `\d` command.
  ![Terminal / psql](/docs/assets/guides/connect-clone-2.png)

### Option 2: CLI
#### Install Database Lab client CLI
This can be done on any machine, you just need to be able to reach Database Lab Engine, in this tutorial we will install and use CLI locally on the same machine.

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
Now you can work with this clone using any PostgreSQL client, for example `psql`. Use connection info (`db` section of the `dblab clone create` response):
```bash
PGPASSWORD=secret_password psql \
  "host=localhost port=6000 user=dblab_user_1 dbname=test" \
  -c '\l+'
```

See the full client CLI reference [here](/docs/database-lab/cli-reference).
