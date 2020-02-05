---
title: Database Lab Tutorial
---

Database Lab aims to boost software development and testing processes via
enabling ultra-fast provisioning of multi-terabyte databases. Currently,
Database Lab supports only PostgreSQL, versions 9.6, 10, 11, and 12. In this
tutorial we will use cloud VM instances but we also can do it on any machine
with two disks, one is for system and one is for the database.

Our steps:

1. prepare a machine with two disk and software requirements,
1. generate some PostgreSQL database for testing purposes,
1. prepare at least one snapshot needed for cloning,
1. configure and launch the Database Lab,
1. setup NGINX and self-signed SSL certificate (optional),
1. and, finally, start using its API for the fast cloning
of the Postgres database.

If you want to use any other cloud platform (like GCP) or run your Database Lab
on VMWare, or on bare metal, only the first step will slightly differ.
In general, the overall procedure will be pretty much the same.


## Step 1. Prepare machine and install requirements

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
with clones (for example, `export DBLAB_DISK="/dev/xvdb"`,
or `export DBLAB_DISK="/dev/disk/by-id/google-DISK-NAME"` for GCP).

Next, we need to install ZFS and Docker. If needed, you can find detailed
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


## Step 2a. Generate an example database for testing purposes

Let's create ZFS pool first:

```bash
# AWS: check with `lsblk` and use 
# GCP: just use `/dev/disk/by-id/google-DISK-NAME-YOU-PROVIDED-ABOVE`
# TODO describe all the options
sudo zpool create -f \
  -O compression=on \
  -O atime=off \
  -O recordsize=8k \
  -O logbias=throughput \
  -m /var/lib/dblab/data \
  dblab_pool \
  "${DBLAB_DISK}"
```

Now we are ready to prepare some database for our testing purposes.

We are going to generate some synthetic database, we now need to initiate
a fresh Postgres cluster in `/var/lib/dblab/data`. For example, below we
are using `pgbench` to generate some database of size ~1.4 GiB:

```bash
sudo docker run \
  --name dblab_pg_initdb \
  --label dblab_sync \
  --env PGDATA=/var/lib/postgresql/pgdata \
  --volume /var/lib/dblab/data:/var/lib/postgresql/pgdata \
  --detach \
  postgres:12-alpine

# Only for testing purposes.
sudo docker exec -it dblab_pg_initdb psql -U postgres -c 'create database test'
# Initializes DB: 10,000,000 accounts, ~1.4 GiB of data.
sudo docker exec -it dblab_pg_initdb pgbench -U postgres -i -s 100 test

sudo docker stop dblab_pg_initdb
```

## Step 2b. Prepare the first snapshot

Create the first snapshot for our pgbench database:

```bash
DATA_STATE_AT="$(TZ=UTC date '+%Y%m%d%H%M%S')"
sudo zfs snapshot dblab_pool@initdb
sudo zfs set dblab:datastateat="${DATA_STATE_AT}" dblab_pool@initdb
```

Or use `create_zfs_snapshot.sh` if you need to promote your database instance:

```bash
### The script is WIP. Using it will currently require Postgres install
### on the machine.

# "stop" is not actually needed if the "sync" instance is not in standby mode 
sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -w stop

### !!! Use this line if your database is NOT in standby mode.
### Keep in mind that in this case, DATA_STATE_AT is not fully accurate – the real
### state of the data is older (TODO: describe a better way of getting this timestamp).
### The timestamp needs to have the following format: `YYYYMMDDHH24MISS`.
# export DATA_STATE_AT="$(TZ=UTC date '+%Y%m%d%H%M%S')"

ZFS_POOL="dblab_pool" \
  PGDATA_SUBDIR="/" \
  MOUNT_DIR="/var/lib/dblab/clones" \
  PG_BIN_DIR="/usr/lib/postgresql/12/bin" \
  PGUSERNAME="postgres" \
  bash ./scripts/create_zfs_snapshot.sh

### Check: `sudo zfs list -o name,creation,mountpoint,dblab:datastateat -t all`

# "start" is not actually needed if the "sync" instance is not in standby mode reading the
# data from an archive of from another Postgres instance -- feel free to omit it
sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -W start
```


## Step 3. Configure and run Database Lab

If you are using exactly the same parameters provided in this tutorial
and created database using pgbench for testing purposes it is not required
to change default values of the config.

Prepare the configuration file and review it:

```bash
mkdir -p ~/.dblab/configs

echo '# Database Lab configuration.
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

    # Database Lab provisions thin-clones using Docker containers, we need
    # to specify which image is to be used when cloning. We can use any official
    # Docker image of Postgres (See https://hub.docker.com/_/postgres),
    # or any custom Docker image that runs Postgres with PGDATA located
    # at "/var/lib/postgresql/pgdata" directory. Our Dockerfile
    # (See https://gitlab.com/postgres-ai/database-lab/snippets/1932037)
    # recommended in case if customization is needed.
    dockerImage: "postgres:12-alpine"

cloning:
  mode: "base"

  # Host which will be specified in clone connection info.
  accessHost: "localhost"

  # Interval to delete clones after minutes of inactivity.
  # 0 - disables automatic deletion.
  idleTime: 10

debug: true
' > ~/.dblab/configs/config.yml
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

Check logs:

```bash
sudo docker logs dblab_server
```

*CLI usage instructions are coming soon.* Simple API check:
```bash
curl -X GET -H 'Verification-Token: secret_token' -i http://localhost:3000/status
```

## Step 4. Configure secure access to Database Lab API (optional for testing purposes)
To make your work with Database Lab API secure, install and configure NGINX
with a self-signed SSL certicate:

Install NGINX:

```bash
sudo apt-get install -y nginx openssl
```

Generate certificate (requires input from user) and configure NGINX:

```bash
YOUR_OWN_PASS="set_your_passphrase_here" # Edit.

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

echo 'server {
  listen 443 ssl;

  ssl on;
  ssl_certificate /etc/nginx/ssl/server.crt; 
  ssl_certificate_key /etc/nginx/ssl/server.key;

  server_name IP_OR_HOSTNAME;
  access_log /var/log/nginx/database_lab.access.log;
  error_log /var/log/nginx/database_lab.error.log;
  location / {
    proxy_set_header   X-Forwarded-For $remote_addr;
    proxy_set_header   Host $http_host;
    proxy_pass         "http://127.0.0.1:3000";
  }
}' > default
sudo cp default /etc/nginx/sites-available/default

sudo systemctl restart nginx

# See also (though here it was not used, it might be helpful):
# https://nginxconfig.io/

### TODO: How to check?
```

## Step 5. Start cloning!

Install Database Lab CLI:

```bash
curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/cli-install.sh | bash
```

Let's configure Database Lab CLI. We can use external `IP_OR_HOSTNAME`
or `http://localhost:3000` as API URL.

Initialize configuration:

```bash
dblab init --environment_id=tutorial --url=http://localhost:3000 --token=secret_token
```

### Basic Actions

An example of requesting for a new clone:

```bash
dblab clone create --username dblab_user_1 --password secret_password
```

After a second or two, if everything is configured correctly, you should see
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

Use `CLONE_ID` for `dblab clone create` or `dblab instance status` response
to delete a clone:

```bash
dblab clone delete CLONE_ID
```
