---
title: Database Lab Tutorial
---

Database Lab aims to boost software development and testing processes via enabling ultra-fast provisioning of multi-terabyte databases. Currently, Database Lab supports only PostgreSQL, versions 9.6, 10, 11, and 12.

In this tutorial, we will:

1. prepare an EC2 instance on AWS, with Ubuntu 18.04 LTS, ZFS module for thin provisioning, and Postgres 12,
1. generate some PostgreSQL database for testing purposes,
1. install Docker,
1. install Database Lab,
1. prepare at least one snapshot needed for cloning,
1. configure and launch the Database Lab instance (with NGXIN and self-signed SSL certificate,
1. and, finally, start using its API for the fast cloning of the Postgres database.

If you want to use any other cloud platform (like GCP) or run your Database Lab on VMWare, or on bare metal, only the first step will slightly differ. In general, the overall procedure will be pretty much the same.

## Step 1. Preparations. EC2 Instance Provisioning, OS and FS Setup

Create an EC2 instance with Ubuntu 18.04 and with an attached EBS volume. You can use either of the available methods (AWS CLI, API, or manually). More detailed instructions you can find in [AWS Setup](2_setup_aws.md) chapter (for GCP, respectively, see [GCP Setup](2_setup_gcp.md)). Note that we will need to be able to connect to this instance using SSH and HTTPS, so ensure that ports 22 and 443 are open for the machine you are going to connect from.

Below we assume that two environment variables are defined:

- `$IP_OR_HOSTNAME`: either hostname or IP address that we will use to connect to the instance,
- `$DBLAB_DISK`: EBS volume device name where we will store the database with clones (for example, `export DBLAB_DISK="/dev/xvdb"`, or `export DBLAB_DISK="/dev/disk/by-id/google-DISK-NAME"` for GCP).

Next, we need to install Postgres and ZFS. Detailed instructions you can find in [Prepare OS, FS, and Postgres (Ubuntu 18.04 LTS with ZFS module)](./2b_ubuntu_zfs.md). here we provide just a shell snippet.

Connect to the EC2 instance we have just provisioned:

```bash
ssh -i /path/to/private-key ubuntu@$IP_OR_HOSTNAME
```

Then install Postgres 12, ZFS, and create a ZFS storage pool:

```bash
cd ~

# add the repository
sudo tee /etc/apt/sources.list.d/pgdg.list <<END
deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main
END

# get the signing key and import it
wget https://www.postgresql.org/media/keys/ACCC4CF8.asc
sudo apt-key add ACCC4CF8.asc

# fetch the metadata from the new repo
sudo apt-get update

sudo apt install -y postgresql-12
sudo systemctl stop postgresql

sudo apt-get install -y zfsutils-linux

sudo mkdir -p /var/lib/dblab/data

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

sudo chown postgres:postgres /var/lib/dblab/data
sudo chmod 0700 /var/lib/dblab/data
```

Now we are ready to prepare some database for our testing purposes.

## Step 2. Generate an Example Database for Testing Purposes

We are going to generate some synthetic database, we now need to initiate a fresh Postgres cluster in `/var/lib/dblab/data`. For example, below we are using `pgbench` to generate some database of size ~15 GiB:

```bash
# Use your own PGDATA instead of the following line.
sudo -u postgres /usr/lib/postgresql/12/bin/initdb -D /var/lib/dblab/data
```

```bash
# Tweak config.
sudo -u postgres sh -f - <<ADD
echo "log_destination = 'stderr'" >> /var/lib/dblab/data/postgresql.conf
echo "log_directory = 'log'" >> /var/lib/dblab/data/postgresql.conf
echo "log_statement = 'none'" >> /var/lib/dblab/data/postgresql.conf
echo "log_min_duration_statement = 0" >> /var/lib/dblab/data/postgresql.conf
ADD

# TODO ensure that we won't lose Postgres process if we close our SSH session / screen / tmux
sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -w start

# Check with psql: `psql -U postgres -c 'select now()'`
```

Again, if we are just testing, then let's generate some data using `pgbench`, the database size will be ~1.4 GiB:

```bash
# Only for tests.
psql -U postgres -c 'create database test'
pgbench -U postgres -i -s 100 test # initializes DB: 10,000,000 accounts, ~1.4 GiB of data
```

## Step 2. Install Docker

Database Lab uses Docker containers to provision thin clones. Before we will launch Database Lab we need to install Docker.
See [official installation guide](https://docs.docker.com/install/linux/docker-ce/ubuntu/).

## Step 3. Install Database Lab

Compile Database Lab from sources (Go 1.12+ is needed):

```bash
# Install Golang. Database Lab requires version at least 1.12.
cd ~
sudo apt-get install -y build-essential
wget https://dl.google.com/go/go1.12.15.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.12.15.linux-amd64.tar.gz
### GOPATH – will be used default (`~/go`)
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
bash --login
```

```bash
git clone https://gitlab.com/postgres-ai/database-lab.git
cd ./database-lab
make all
```

## Step 4. Prepare a First Snapshot

```bash
sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -w stop

# !!! Remove this line if your database in standby mode.
# If not, keep in mind that this DATA_STATE_AT is not fully accurate – the real
# state of the data is older (TODO: describe a better way of getting this timestamp).
export DATA_STATE_AT="$(TZ=UTC date '+%Y%m%d%H%M%S')"

ZFS_POOL="dblab_pool" \
  PGDATA_SUBDIR="/" \
  MOUNT_DIR="/var/lib/dblab/clones" \
  PG_BIN_DIR="/usr/lib/postgresql/12/bin" \
  bash ./scripts/create_zfs_snapshot.sh

## Check: `sudo zfs list -o name,creation,mountpoint -t all`

# "start" is not actually needed if the "shadow" instance is not in standby mode reading the
# data from an archive of from another Postgres instance -- feel free to omit it
sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -W start
```

For each snapshot need to setup data state timestamp
`sudo zfs set dblab:datastateat="20200107113750" dblab_pool@snapshot_20200107113750_pre`
The timestamp needs to have the following format: `YYYYMMDDHH24MISS` (see [PostgreSQL documentation](https://www.postgresql.org/docs/current/functions-formatting.html)).

## Step 5. Configure and Launch Your Database Lab Instance

Prepare the configuration file and review it:

```bash
cd ~/database-lab
cp ./configs/config.sample.yml ./configs/config.yml
```

If you are using exactly the same parameters provided in this tutorial and created
database using pgbench for testing purposes it is not required to change default values of
the config.

However, here is a short guide to most important options:

### mode
Currently, only ZFS mode is supported. More provision modes (e.g. LVM, enterprise storage snapshots/clones) will be implemented in the future. Contributions are welcome! 

### dockerImage
Database Lab provisions thin-clones using Docker containers, we need to specify which image
is to be used when cloning.

We can use any official Docker image of Postgres (see https://hub.docker.com/_/postgres),
or any custom Docker image that runs Postgres with PGDATA located at `/var/lib/postgresql/pgdata` directory
(our Dockerfile recommended in this case https://gitlab.com/postgres-ai/database-lab/snippets/1932037).

### pool
Name of your ZFS pool.

### pgDataSubdir
In case if PGDATA was put not in root directory of ZFS pool, we should specify a subdirectory in pool to PGDATA.

Launch your Database Lab instance:

```bash
./bin/dblab-server -v some_token
```

Simple check:
*CLI usage instructions are coming soon.*
```bash
curl -X GET -H 'Verification-Token: some_token' -i http://localhost:3000/status
```

To make your work with Database Lab API secure, install and configure NGINX with a self-signed SSL certicate:

```bash
sudo apt-get install -y nginx openssl
```

```bash
# YOUR_OWN_PASS="set your passphrase here"

mkdir -p ~/ssl
cd ~/ssl

# TODO: Use https://github.com/suyashkumar/ssl-proxy instead.
# To generate certificates, use, for instance, Let's Encrypt (e.g. https://zerossl.com/free-ssl/#crt).
# Here we are generating a self-signed certificate.
openssl genrsa -des3 -passout pass:${YOUR_OWN_PASS} -out server.pass.key 2048
openssl rsa -passin pass:${YOUR_OWN_PASS} -in server.pass.key -out server.key
rm server.pass.key
openssl req -new -key server.key -out server.csr # will ask a bunch of questions which should be filled with answers
openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt

sudo mkdir -p /etc/nginx/ssl
sudo cp server.crt /etc/nginx/ssl
sudo cp server.key /etc/nginx/ssl

echo "server {
  listen 443 ssl;

  ssl on;
  ssl_certificate /etc/nginx/ssl/server.crt; 
  ssl_certificate_key /etc/nginx/ssl/server.key;

  server_name $IP_OR_HOSTNAME;
  access_log /var/log/nginx/database_lab.access.log;
  error_log /var/log/nginx/database_lab.error.log;
  location / {
    proxy_set_header   X-Forwarded-For \$remote_addr;
    proxy_set_header   Host \$http_host;
    proxy_pass         \"http://127.0.0.1:3000\";
  }
}" > default
sudo cp default /etc/nginx/sites-available/default

sudo systemctl restart nginx

# see also (though here it was not used, it might be helpful):
# https://nginxconfig.io/
```

## Start Cloning!

### Test with Postman

Now you can use HTTPS to communicate with your Database Lab instance using Database Lab API (!!! TODO link). Keep in mind that not any client allows using a self-signed SSL certificate. For testing, use [Postman](https://www.getpostman.com/), with disabled "SSL certificate verification" in its Preferences:

![Postman - Disable SSL verification](assets/tutorial-1-postman-1.png)

Once SSL certificate verification is disabled in Postman, you can use it to work with the Database Lab API:

![Postman - Request and response](assets/tutorial-1-postman-2.png)

### Basic Actions

An example of requesting for a new clone:

```http
POST /clone HTTP/1.1

Host: {{IP_OR_HOSTNAME}}
Verification-Token: {{TOKEN}}
Content-Type: application/json

{
  "project": "test",
  "db": {
    "username": "xxx",
    "password": "xxx"
  },
  "username": "xxx",
  "name": "xxx"
}
```

After a second or two, check the status of cloning, if everything is configured correctly, you should see that it's ready to be used:

```http
GET /clone/{{CLONE_ID}} HTTP/1.1

Host: {{IP_OR_HOSTNAME}}
Verification-Token: {{TOKEN}}
Content-Type: application/json
```

To see the full information about the Database Lab instance, including the list of all currently available clones:

```http
GET /status HTTP/1.1

Host: {{IP_OR_HOSTNAME}}
Verification-Token: {{TOKEN}}
Content-Type: application/json
```

To delete a clone:

```http
DELETE /clone/{{CLONE_ID}} HTTP/1.1

Host: {{IP_OR_HOSTNAME}}
Verification-Token: {{TOKEN}}
Content-Type: application/json
```
