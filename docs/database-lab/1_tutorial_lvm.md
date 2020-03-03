---
title: Database Lab on LVM Tutorial
---

>LVM support as an alternative to ZFS first appeared in [version 0.3.0 of Database Lab](https://gitlab.com/postgres-ai/database-lab/-/releases).

Database Lab aims to boost software development and testing processes via
enabling ultra-fast provisioning of multi-terabyte databases.

Currently, Database Lab supports only PostgreSQL, versions 9.6, 10, 11, and 12. In this
tutorial, we will use a cloud (AWS) VM instance with Ubuntu 18.04 and PostgreSQL 12 installed,
and with additional EBS volume for PostgreSQL data directory.
However, it is possible to use any Linux machine
with two disks, one is for system and one is for the database.

>Please support the project giving a GitLab star (it's on [the main page](https://gitlab.com/postgres-ai/database-lab),
>at the upper right corner):
>
>![Add a star](assets/star.gif)

Our steps:

1. prepare a machine with two disks, Docker and LVM2,
1. generate some PostgreSQL database for testing purposes,
1. prepare PGDATA to be used for cloning,
1. configure and launch the Database Lab server,
1. setup NGINX and self-signed SSL certificate (optional),
1. setup client CLI,
1. and, finally, start using its API and client CLI for the fast cloning
of the Postgres database.

If you want to use any other cloud platform (like GCP) or run your Database Lab
on VMWare, or on bare metal, only the first step will slightly differ.
In general, the overall procedure will be pretty much the same.


## Step 1. Prepare a machine with two disks, Docker and LVM2

Create an EC2 instance with Ubuntu 18.04 and with an additionally attached
EBS volume. You can use either of the available methods (AWS CLI, API,
or manually). More detailed instructions you can find in
[AWS Setup](2_setup_aws.md) chapter (for GCP, respectively, see
[GCP Setup](2_setup_gcp.md)). Note that we will need to be able to connect
to this instance using SSH and HTTPS, so ensure that ports 22 and 443 are open
for the machine you are going to connect from. In case if Postgres clones should
be accessible from outside you need to ensure that clones port pool (default:
6000-6100) are open.

Below we assume that two environment variables are defined:

- `$IP_OR_HOSTNAME`: either hostname or IP address that we will use
to connect to the instance,
- `$DBLAB_DISK`: EBS volume device name where we will store the database
with clones (for example, `export DBLAB_DISK="/dev/xvdb"` for an EBS volume on AWS,
or `export DBLAB_DISK="/dev/disk/by-id/google-DISK-NAME"` for a PD disk on GCP).

Next, we have to install LVM2 and Docker. If needed, you can find the detailed
installation guides for Docker [here](https://docs.docker.com/install/linux/docker-ce/ubuntu/).

Install dependencies:

```bash
sudo apt-get update && sudo apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  software-properties-common
```

Install Docker and LVM2:

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository \
  "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) \
  stable"

sudo apt-get update && sudo apt-get install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  lvm2
```

Now it is time ot create a LVM volume:

```bash
# To specify $DBLAB_DISK, check the list of disks using `lsblk`
#
# AWS: 
#   - for EBS volume:  export DBLAB_DISK=/dev/xvd
#   - for NVMe:        export DBLAB_DISK=/dev/nvme0n1
#
# GCP:
#   - PD disk:   export DBLAB_DISK=/dev/disk/by-id/google-YOUR-DISK-NAME

# Create Physical Volume and Volume Group.
sudo pvcreate "${DBLAB_DISK}"
sudo vgcreate dblab_vg "${DBLAB_DISK}"

# Create Logical Volume for PGDATA.
sudo lvcreate -l 10%FREE -n pg_lv dblab_vg
sudo mkfs.ext4 /dev/dblab_vg/pg_lv
sudo mkdir -p /var/lib/dblab/{data,clones,sockets}
sudo mount /dev/dblab_vg/pg_lv /var/lib/dblab/data

# Create PGDATA directory.
sudo mkdir -p /var/lib/dblab/data/pgdata

# Bootstrap LVM snapshots so they could be used inside Docker containers.
sudo lvcreate --snapshot --extents 10%FREE --yes --name dblab_bootstrap dblab_vg/pg_lv
sudo lvremove --yes dblab_vg/dblab_bootstrap
```

## Step 2. Generate an example database for testing purposes

Let's generate some synthetic database with data directory located at `/var/lib/dblab/data/pgdata`.
To do so we will use standard PostgreSQL tool called `pgbench`. With scale factor `-s 100`,
the database size will be ~1.4 GiB.

Alternatively, you can take an existing PostgreSQL database and just copy it to `/var/lib/dblab/data/pgdata`.

Let's run "initdb" container to generate PGDATA with `pgbench`. `POSTGRES_HOST_AUTH_METHOD=trust` will be used for connection; once the generation is done, the container will be stopped and we will use our `pg_hba.conf` for authorization configuration.

```bash
sudo docker run \
  --name dblab_pg_initdb \
  --label dblab_sync \
  --env PGDATA=/var/lib/postgresql/pgdata \
  --env POSTGRES_HOST_AUTH_METHOD=trust \
  --volume /var/lib/dblab/data/pgdata:/var/lib/postgresql/pgdata \
  --detach \
  postgres:12-alpine
```

Create the `test` database:
```bash
sudo docker exec -it dblab_pg_initdb psql -U postgres -c 'create database test'
```

Generate data in the `test` database using pgbench and stop the container:
```bash
# 10,000,000 accounts, ~1.4 GiB of data.
sudo docker exec -it dblab_pg_initdb pgbench -U postgres -i -s 100 test
sudo docker stop dblab_pg_initdb
```

## Step 3. Configure and launch the Database Lab server

If you followed the steps described above without modification, you can use
the default config. Otherwise, inspect all configuration options and adjust if needed.

```bash
mkdir -p ~/.dblab/configs

cat <<CONFIG > ~/.dblab/configs/config.yml
# Database Lab server configuration.

server:
  port: 3000

provision:
  # Provision mode to use.
  mode: "local"

  # Subdir where PGDATA located relative to the pool root dir.
  pgDataSubdir: "/pgdata/"

  # Username that will be used for Postgres management connections.
  # The user should exist.
  pgMgmtUsername: "postgres"

  # "Local" mode related parameters.
  local:
    # Which thin-clone manager to use.
    # Available options: "zfs", "lvm".
    thinCloneManager: "lvm"

    # Name of your pool (in the case of ZFS) or volume group
    # with logic volume name (e.g. "dblab_vg/pg_lv", in the case of LVM).
    pool: "dblab_vg/pg_lv"

    # Pool of ports for Postgres clones.
    portPool:
      from: 6000
      to: 6100

    # Clones PGDATA mount directory.
    mountDir: "/var/lib/dblab/clones"

    # Unix sockets directory for secure connection to Postgres clones.
    unixSocketDir: "/var/lib/dblab/sockets"

    # Database Lab provisions thin clones using Docker containers, we need
    # to specify which Postgres Docker image is to be used when cloning.
    # The default is the official Postgres image
    # (See https://hub.docker.com/_/postgres).
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
  maxIdleMinutes: 20

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
  postgresai/dblab-server:latest
```

Observe the logs:

```bash
sudo docker logs dblab_server -f
```

Now we can check the status of the Database Lab server using a simple API call:
```bash
curl \
  --include \
  --request GET \
  --header 'Verification-Token: secret_token' \
  http://localhost:3000/status
```

See the full API reference [here](https://postgres.ai/swagger-ui/dblab/).


## Step 4. Configure secure access to Database Lab API (optional)

This step is optional. However, it is highly recommended if you work with real-life databases.

To make your work with Database Lab API secure, install and configure NGINX
with a self-signed SSL certicate.

Install NGINX:

```bash
sudo apt-get install -y nginx openssl
```

Define `$YOUR_OWN_PASS` environment variable for certificate generation.

Generate SSL certificate request:

```bash
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
```

Finish SSL certificate generation and setup NGINX:

```bash
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

Now we can check the status using HTTPS connection (here we use `--insecure` flag
to allow working with the self-signed certificate we have generated above):
```bash
curl \
  --insecure \
  --include \
  --request GET \
  --header 'Verification-Token: secret_token' \
  https://${IP_OR_HOSTNAME}/status
```

## Step 5. Setup Database Lab client CLI

Install Database Lab client CLI:

```bash
curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/scripts/cli_install.sh | bash
sudo mv ~/.dblab/dblab /usr/local/bin/dblab
```

Initialize CLI (`$IP_OR_HOSTNAME` should be defined in Step 2) and allow HTTP
enabling `insecure` option in config (not recommended for real-life use):

```bash
dblab init \
  --environment-id=tutorial \
  --url=http://$IP_OR_HOSTNAME:3000 \
  --token=secret_token \
  --insecure
```

Check:

```bash
dblab instance status
```

## Step 6. Start cloning!

Request a new clone:

```bash
dblab clone create \
  --username dblab_user_1 \
  --password secret_password \
  --id my_first_clone
```

After a second or two, if everything is configured correctly, you will see
that the clone is ready to be used:
```json
{
    "id": "my_first_clone",
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

Now you can work with this clone using any PostgreSQL client, for example `psql`:
```bash
PGPASSWORD=secret_password \
  psql "host=${IP_OR_HOSTNAME} port=6000 user=dblab_user_1 dbname=test" \
  -c '\l+'
```

To see the full information about the Database Lab instance, including
the list of all currently available clones:

```bash
dblab instance status
```

Finally, let's manually delete the clone:

```bash
dblab clone destroy my_first_clone
```

See the full client CLI reference [here](./6_cli_reference).
