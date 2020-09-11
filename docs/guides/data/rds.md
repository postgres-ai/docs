---
title: Data source: RDS
sidebar_label: Data source: RDS
---

[↵ Back to Data source guides](/docs/guides/data)

>You need to set up machine for Database Lab instance first. Check [Setup machine for the Database Lab Engine](/docs/guides/administration/machine-setup) guide for the details.

> Also, check the [Database Lab tutorial for Amazon RDS](/docs/tutorials/database-lab-tutorial-amazon-rds) tutorial.

We have two options to connect to the RDS database, you need to consider the **Database authentication** method that is assigned to your RDS database.

Options:
- Using **password authentication (master password)**. This option can be used for all **Database authentication** method enabled for your database and requires to set the master password of the database in the Database Lab configuration file;
- **IAM database authentication**. This option can be used only with **Password and IAM database authentication**, it requires AWS user credentials and does not require the master password, use this option for granular control of the access to your database.

If you want to use **IAM database authentication**, read how to enable it [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.Enabling.html).


## Option 1: Password authentication

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

## Option 2: IAM database authentication

### Prepare AWS user and IAM database access policy
1. Create an AWS user (or use an existing one).
2. Save and assign AWS access environment variables:
- `export AWS_ACCESS_KEY="access_key"`;
- `export AWS_SECRET_ACCESS_KEY="secret_access_key"`.
Read how you can get the AWS access keys for the existing user [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).
3. Create and attach an IAM Policy for IAM Database Access to an AWS user. Read how you can to it [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.IAMPolicy.html).

> Alternatively, you can add `AmazonRDSFullAccess`, `IAMFullAccess` policies to an AWS user (not recommended).

### Set up and run the Database Lab Engine
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

### Download AWS RDS certificate
This type of data retrieval requires a secure connection to a database. To setup it we need to download a certificate from AWS.

```bash
wget https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem -P ~/.dblab/
```

### Run Database Lab Engine
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

## Restart in the case of failure

```bash
# Stop and remove the Database Lab Engine control container.
sudo docker rm -f dblab_server

# Clean up data directory.
sudo rm -rf /var/lib/dblab/data/*

# Remove dump file.
sudo umount /var/lib/dblab/db.dump
sudo rm -rf /var/lib/dblab/db.dump
```

[↵ Back to Data source guides](/docs/guides/data)
