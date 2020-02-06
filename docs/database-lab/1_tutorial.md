---
title: Database Lab Tutorial
---

Database Lab aims to boost software development and testing processes via
enabling ultra-fast provisioning of multi-terabyte databases.

Currently, Database Lab supports only PostgreSQL, versions 9.6, 10, 11, and 12. In this
tutorial, we will use a cloud (AWS) VM instance with Ubuntu 18.04 and PostgreSQL 12 installed,
and with additional EBS volume for PostgreSQL data directory.
However, it is possible to use any Linux machine
with two disks, one is for system and one is for the database.

Our steps:

1. prepare a machine with two disks, Docker and ZFS,
1. generate some PostgreSQL database for testing purposes,
1. prepare at least one snapshot to be used for cloning,
1. configure and launch the Database Lab server,
1. setup NGINX and self-signed SSL certificate (optional),
1. and, finally, start using its API and client CLI for the fast cloning
of the Postgres database.

If you want to use any other cloud platform (like GCP) or run your Database Lab
on VMWare, or on bare metal, only the first step will slightly differ.
In general, the overall procedure will be pretty much the same.


## Step 1. Prepare a machine with two disks, Docker and ZFS

Create an EC2 instance with Ubuntu 18.04 and with an additionaly attached
EBS volume. You can use either of the available methods (AWS CLI, API,
or manually). More detailed instructions you can find in
[AWS Setup](2_setup_aws.md) chapter (for GCP, respectively, see
[GCP Setup](2_setup_gcp.md)). Note that we will need to be able to connect
to this instance using SSH and HTTPS, so ensure that ports 22 and 443 are open
for the machine you are going to connect from.

Below we assume that two environment variables are defined:

- `$IP_OR_HOSTNAME`: either hostname or IP address that we will use
to connect to the instance,
- `$DBLAB_DISK`: EBS volume device name where we will store the database
with clones (for example, `export DBLAB_DISK="/dev/xvdb"` for an EBS volume on AWS,
or `export DBLAB_DISK="/dev/disk/by-id/google-DISK-NAME"` for a PD disk on GCP).

Next, we have to install ZFS and Docker. If needed, you can find detailed
installation guides:
- [for Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/),
- [for ZFS on Ubuntu](./2b_ubuntu_zfs.md)

```bash
sudo apt-get update && sudo apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  software-properties-common

sudo add-apt-repository \
  "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) \
  stable"

sudo apt-get update && sudo apt-get install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  zfsutils-linux
```

Now it is time ot create a ZFS pool:

```bash
# To specify $DBLAB_DISK, check the list of disks using `lsblk`
# AWS: `/dev/xvdb` for EBS, `/dev/nvm1e0` for local ephimeral NVMe
# GCP: `/dev/disk/by-id/google-DISK-NAME-YOU-PROVIDED-ABOVE` for PD
sudo zpool create -f \
  -O compression=on \
  -O atime=off \
  -O recordsize=8k \
  -O logbias=throughput \
  -m /var/lib/dblab/data \
  dblab_pool \
  "${DBLAB_DISK}"
```

## Step 2. Generate an example database for testing purposes

Let's generate some synthetic database with data directory located at `/var/lib/dblab/data`.
To do so we will use standard PostgreSQL tool called `pgbench`. With scale factor `-s 100`,
the database size will be ~1.4 GiB.

Alternatively, you can take an existing PostgreSQL database and just copy it to `/var/lib/dblab/data`.

```bash
sudo docker run \
  --name dblab_pg_initdb \
  --label dblab_sync \
  --env PGDATA=/var/lib/postgresql/pgdata \
  --volume /var/lib/dblab/data:/var/lib/postgresql/pgdata \
  --detach \
  postgres:12-alpine

sudo docker exec -it dblab_pg_initdb psql -U postgres -c 'create database test'
# Initializes DB: 10,000,000 accounts, ~1.4 GiB of data.
sudo docker exec -it dblab_pg_initdb pgbench -U postgres -i -s 100 test

sudo docker stop dblab_pg_initdb
```

## Step 3. Prepare the first snapshot

Create the first snapshot for our database:

```bash
### The script is WIP. Using it will currently require Postgres install
### on the machine.

# "stop" is not actually needed if the "sync" instance is not in standby mode
####### TODO: docker here!
sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -w stop

### !!! Use this line if your database is NOT in standby mode.
### Keep in mind that in this case, DATA_STATE_AT is not fully accurate – the real
### state of the data is older (TODO: describe a better way of getting this timestamp).
### The timestamp needs to have the following format: `YYYYMMDDHH24MISS`.
# export DATA_STATE_AT="$(TZ=UTC date '+%Y%m%d%H%M%S')"


####### TODO: docker must also be here!! pass docker image name
ZFS_POOL="dblab_pool" \
  PGDATA_SUBDIR="/" \
  MOUNT_DIR="/var/lib/dblab/clones" \
  PG_BIN_DIR="/usr/lib/postgresql/12/bin" \
  PGUSERNAME="postgres" \
  bash ./scripts/create_zfs_snapshot.sh

### Check: `sudo zfs list -o name,creation,mountpoint,dblab:datastateat -t all`

# "start" is not actually needed if the "sync" instance is not in standby mode reading the
# data from an archive of from another Postgres instance -- feel free to omit it
####### TODO: docker here!
sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -W start
```

## Step 4. Configure and launch the Database Lab server

If you followed the steps described above without modification, you can use
the default config. Otherwise, inspect all configuration options and adjust if needed.

```bash
mkdir -p ~/.dblab/configs

cat <<CONFIG > ~/.dblab/configs/config.yml
# Database Lab configuration.
server:
  port: 3000

provision:
  # More provision modes (e.g. LVM, enterprise storage snapshots/clones)
  # will be implemented in the future. Contributions are welcome!
  mode: "zfs"

  # Subdir where PGDATA located relative to the pool root dir.
  pgDataSubdir: "/"

  # ZFS mode related parameters.
  zfs:
    # Name of your ZFS pool.
    pool: "dblab_pool"

    portPool:
      from: 6000
      to: 6100

    mountDir: "/var/lib/dblab/clones"

    unixSocketDir: "/var/lib/dblab/sockets"

    snapshotFilterSuffix: "_pre"

    # Database Lab provisions thin clones using Docker containers, we need
    # to specify which Postgres Docker image is to be used when cloning.
    # The default is the official Postgres image (See https://hub.docker.com/_/postgres).
    # Any custom Docker image that runs Postgres with PGDATA located
    # in "/var/lib/postgresql/pgdata" directory. Our Dockerfile
    # (See https://gitlab.com/postgres-ai/database-lab/snippets/1932037)
    # is recommended in case if customization is needed.
    dockerImage: "postgres:12-alpine"

cloning:
  mode: "base"

  # Host which will be specified in clone connection info.
  accessHost: "localhost"

  # Auto-delete clones after the specified minutes of inactivity.
  # 0 - disable automatic deletion.
  idleTime: 10

debug: true
CONFIG
```

Launch your Database Lab instance:

```bash
sudo docker run \
  --name dblab_server \
  --label dblab_control \
  --privileged \
  --publish 3000:3000 \
  --restart on-failure \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /var/lib/dblab:/var/lib/dblab:rshared \
  --volume ~/.dblab/configs/config.yml:/home/dblab/configs/config.yml \
  --env VERIFICATION_TOKEN=secret_token \
  --detach \
  postgresai/dblab_server:latest
```

Observe the logs:

```bash
sudo docker logs dblab_server -f
```

Now we can check the status of the Database Lab server using a simple API call:
```bash
curl -X -i \
  GET -H 'Verification-Token: secret_token' \
  http://localhost:3000/status
```

## Step 5. Configure secure access to Database Lab API (optional)

This step is optional. However, it is highly recommended if you work with real-life databases.

To make your work with Database Lab API secure, install and configure NGINX
with a self-signed SSL certicate.

```bash
sudo apt-get install -y nginx openssl

YOUR_OWN_PASS="set_your_passphrase_here" # Edit this.

mkdir -p ~/ssl
cd ~/ssl

# TODO: Use https://github.com/suyashkumar/ssl-proxy instead.
# To generate certificates, use, for instance, Let's Encrypt
# (e.g. https://zerossl.com/free-ssl/#crt).
# Here we are generating a self-signed certificate.

openssl genrsa -des3 -passout pass:${YOUR_OWN_PASS} -out server.pass.key 2048
openssl rsa -passin pass:${YOUR_OWN_PASS} -in server.pass.key -out server.key
rm server.pass.key

# Will ask a bunch of questions which should be filled with answers.
openssl req -new -key server.key -out server.csr
openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key \
  -out server.crt

sudo mkdir -p /etc/nginx/ssl
sudo cp server.crt /etc/nginx/ssl
sudo cp server.key /etc/nginx/ssl

cat <<CONFIG > default
server {
  listen 443 ssl;

  ssl on;
  ssl_certificate /etc/nginx/ssl/server.crt; 
  ssl_certificate_key /etc/nginx/ssl/server.key;

  server_name ${IP_OR_HOSTNAME};
  access_log /var/log/nginx/database_lab.access.log;
  error_log /var/log/nginx/database_lab.error.log;
  location / {
    proxy_set_header   X-Forwarded-For \$remote_addr;
    proxy_set_header   Host \$http_host;
    proxy_pass         "http://127.0.0.1:3000";
  }
}
CONFIG

sudo cp default /etc/nginx/sites-available/default

sudo systemctl restart nginx

# See also (though here it was not used, it might be helpful):
# https://nginxconfig.io/
```

## Step 6. Start cloning!

Install Database Lab client CLI:

```bash
curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/cli-install.sh | bash
```

Initialize it (`$IP_OR_HOSTNAME` should be defined in Step 2):

```bash
dblab init \
  --environment_id=tutorial \
  --url=http://$IP_OR_HOSTNAME:3000 \
  --token=secret_token
```

Request a new clone:

```bash
dblab clone create \
  --username dblab_user_1 \
  --password secret_password
```

After a second or two, if everything is configured correctly, you will see
that the clone is ready to be used:
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
        "connStr": "host=localhost port=6000 user=dblab_user_1",
        "host": "localhost",
        "port": "6000",
        "username": "dblab_user_1",
        "password": ""
    },
    "metadata": {
        "cloneSize": 479232,
        "cloningTime": 2.892935211,
        "maxIdleMinutes": 0
    },
    "project": ""
}
```

To see the full information about the Database Lab instance, including
the list of all currently available clones:

```bash
dblab instance status
```

A clone can be deleted by its ID:

```bash
dblab clone delete CLONE_ID
```
