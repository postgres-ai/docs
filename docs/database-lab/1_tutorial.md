# Database Lab Tutorial

Database Lab boosts aims to boost software development and testing processes via enabling ultra-fast provisioning of multi-terabyte databases. Currently, only PostgreSQL versions 9.6 and newer are supported.

In this tutorial we will:

1. prepare a Database Lab instance on AWS with Ubuntu 18.04 LTS, ZFS module for thin provisioning, and Postgres 12,
1. generate some PostgreSQL database for testing purposes,
1. install Database Lab,
1. prepare at least one snapshot that will be used from cloning,
1. configure and launch the database instance (with optional NGINX setup for SSL connections),
1. and, finally, start using its API for fast cloning of the database.

If you want to use any other cloud platform like GCP, or setup your Database Lab instance on VMWare or on bare metal, the first step will slightly differ, but in general, overall procedure will be pretty much the same.

## Step 1. Preparations. EC2 Instance Provisioning, OS and FS Setup

Create an EC2 instance with Ubuntu 18.04 and with an attached EBS volume. You can use either of available methods (AWS CLI, API, or manually). More detailed instructions you can find in [AWS Setup](2_setup_aws.md) chapter (for GCP, respectively, see [GCP Setup](2_setup_gcp.md)). Note, that we will need to be able to connect to this instance using SSH and HTTPS, so ensure that ports 22 and 443 are open for the machine you are going to connect from.

Below we assume that two environment variables are defined:

- `$EC2_ADDRESS`: either hostname or IP address that we will use to connect to the instance,
- `$DBLAB_DISK`: EBS volume device name where we will store the database with clones (for example, `export DBLAB_DISK="/dev/xvdb"`).

Next, we need to install Postgres and ZFS. Detailed instructions you can find in [Prepare OS, FS, and Postgres (Ubuntu 18.04 LTS with ZFS module)](./2b_ununtu_zfs.md). here we provide just a shell snippet.

Connect to the EC2 instance we have just provisioned:

```bash
ssh -i /path/to/private-key ubuntu@ip_or_hostname
```

Then install Postgres 12, ZFS, and create ZFS pool:

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
# Use your own PGDATA instead of following line.
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

Again, if we are just testing, then let's generate some data using `pgbench`, the database size will be ~1.5 GiB:

```bash
# Only for tests.
psql -U postgres -c 'create database test'
pgbench -U postgres -i -s 1000 test # initializes DB: 100,000,000 accounts, ~15 GiB of data
```

## Step 3. Install Database Lab

Compile Database Lab from sources (Go 1.12+ is needed):

```bash
# Install Golang. Database Lab requires version at least 1.12.
cd ~
sudo apt-get install -y build-essential
wget https://dl.google.com/go/go1.12.7.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.12.7.linux-amd64.tar.gz
### GOPATH – will be used default (`~/go`)
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
bash --login

git clone https://gitlab.com/postgres-ai/database-lab.git
cd ./database-lab
make all
```

## Step 4. Prepare a First Snapshot

```bash
sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -w stop

# !!! Remove this line if your database in in standby mode.
# If not, keep in mind that this DATA_STATE_AT is not fully accurate – the real
# state of the data is older (TODO: describe a better way of getting this timestamp).
export DATA_STATE_AT="$(TZ=UTC date '+%Y%m%d%H%M%S')"

ZFS_POOL="dblab_pool" \
  PGDATA_SUBDIR="/" \
  MOUNT_DIR="/var/lib/dblab/clones" \
  PG_BIN_DIR="/usr/lib/postgresql/12/bin" \
  bash ./scripts/create_zfs_snapshot.sh

## Check: `sudo zfs list -o name,creation,mountpoint -t all`

sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -W start
```

For each snapshot need to setup data state timestamp
`sudo zfs set dblab:datastateat="20200107113750" dblab_pool@snapshot_20200107113750_pre`
The timestamp needs to have the following format: `YYYYMMDDHH24MISS` (see [PostgreSQL documentation](https://www.postgresql.org/docs/current/functions-formatting.html)).

## Step 5. Configure Database Lab
```bash
cd ~/database-lab
cp ./configs/config.sample.yml ./configs/config.yml
```
Important: `pool`, `mountDir`, `logsDir`, `pgVersion`, `pgBindir`, `pgDataSubdir`. 
These options should have actual values, please check it.

### Launch the Database Lab
```bash
./bin/dblab -v some_token
```

### Simple Check
```bash
curl -X GET -H 'Verification-Token: some_token' -i http://localhost:3000/status
```

### Install and Configure NGINX with SSL
```bash
sudo apt-get install -y nginx openssl

sudo mkdir /etc/nginx/ssl || true # dir exists?

# To generate certificates, use, for instance, Letsencrypt (e.g. https://zerossl.com/free-ssl/#crt)
# Here we are generating a self-signed certificate
openssl genrsa -des3 -passout pass:${YOUR_OWN_PASS} -out server.pass.key 2048
openssl rsa -passin pass:${YOUR_OWN_PASS} -in server.pass.key -out server.key
rm server.pass.key
openssl req -new -key server.key -out server.csr # will ask a bunch of questions
openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt

sudo cp server.crt /etc/nginx/ssl
sudo cp server.key /etc/nginx/ssl

echo "server {
  listen 443 ssl;

  ssl on;
  ssl_certificate /etc/nginx/ssl/server.crt; 
  ssl_certificate_key /etc/nginx/ssl/server.key;

  server_name your_very_own_domain.com;
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

### Start Cloning!

#### Test with Postman

Now you can use HTTPS to communicate with your Database Lab instance using Database Lab API (!!! TODO link). Keep in mind that not any client allows using a self-signed SSL certificate. For testing, use [Postman](https://www.getpostman.com/), with disabled "SSL certificate verification" in its Preferences:

![Screen_Shot_2020-01-07_at_16.47.55](/uploads/00b12dc17f36629105fdf81f6ebef5fe/Screen_Shot_2020-01-07_at_16.47.55.png)

Once SSL certificate verification is disabled in Postman, you can use it to work with the Database Lab API:

![Screen_Shot_2020-01-07_at_16.52.30](/uploads/8f4bb91a5dc668029135d78d5c2ffbb9/Screen_Shot_2020-01-07_at_16.52.30.png)

#### Basic Actions

An example of requesting for a new clone:

```http
POST /clone HTTP/1.1
Host: {{ip_or_hostname}}
Verification-Token: {{token}}
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

After a second or two check the status of cloning, if everything is configured correctly, you will see that it's ready to be used:

```http
GET /clone/{{clone_id}} HTTP/1.1
Host: {{ip_or_hostname}}
Verification-Token: {{token}}
Content-Type: application/json
```

To see the full information about the Database Lab instance, including the list of all currently available clones:

```http
GET /status HTTP/1.1
Host: {{ip_or_hostname}}
Verification-Token: {{token}}
Content-Type: application/json
```

To delete a clone:

```http
DELETE /clone/{{clone_id}} HTTP/1.1
Host: {{ip_or_hostname}}
Verification-Token: {{token}}
Content-Type: application/json
```