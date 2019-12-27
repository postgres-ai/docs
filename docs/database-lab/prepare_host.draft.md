## AWS Setup

...


## GCP Setup

### Create instance
Compute Engine -> VM instances -> Create Instance
- Set name to something like `dblab-dev1`.
- It's preferable to use Ubuntu 18.04 with at least 10 GB standard persistent disk.
- Check `Allow HTTPS traffic`.

### Create ZFS disk
Compute Engine -> Disks -> Create Disk
- Set name to something like `dblab-dev1-zfs`.
- Preferred type `SSD persistent disk`.
- Change size according to size of your PGDATA, keep in mind that GCP IOPS depend on disk size (the bigger disk, the more IOPS).

### Instance setup
- Go to VM instances and select `dblab-dev1` instance.
- Go to edit mode.
- In Additional disks click Attach existing disk and select `dblab-dev1-zfs` disk.
- Add your SSH key to the instance or use web shell to connect. 




## Prepare host – nstructions for Ubuntu 18.04

### Install Postgres
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
```

### Install ZFS
```bash
sudo apt-get install -y zfsutils-linux
```

### Create ZFS pool
```bash
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
  "/dev/disk/by-id/google-dblab-dev1-zfs"

# To verify: `df -hT`

sudo chown postgres:postgres /var/lib/dblab/data
sudo chmod 0700 /var/lib/dblab/data

# Use your own PGDATA instead of following line.
sudo -u postgres /usr/lib/postgresql/12/bin/initdb -D /var/lib/dblab/data

# Tweak config.
sudo -u postgres sh -f - <<ADD
echo "log_destination = 'stderr'" >> /var/lib/dblab/data/postgresql.conf
echo "log_directory = 'log'" >> /var/lib/dblab/data/postgresql.conf
ADD

 # TODO ensure that we won't lose Postgres process if we close our SSH session / screen / tmux
sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -w start
# Check with psql: `psql -U postgres -c 'select now()'`

# Only for tests.
psql -U postgres -c 'create database test'
pgbench -U postgres -i -s 100 test
```

### Install Database Lab
```bash
# Install golang. DB Lab requires +1.12 golang.
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

### Create a snapshot
```bash
sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -w stop

## TODO P-1 !!! if it is already the master, we need to specify the timestamp "DB state at" manually
##   for testing, use DATA_STATE_AT="$(date +%s)"
ZFS_POOL="dblab_pool" \
  PGDATA_SUBDIR="/" \
  MOUNT_DIR="/var/lib/dblab/clones" \
  PG_BIN_DIR="/usr/lib/postgresql/12/bin" \
  bash ./scripts/create_zfs_snapshot.sh

## Check: `sudo zfs list -o name,creation,mountpoint -t all`

sudo -u postgres /usr/lib/postgresql/12/bin/pg_ctl -D /var/lib/dblab/data -W start
```

### Configure Database Lab
```bash
cd ~/database-lab
cp ./config/config.sample.yml ./config/config.yml
```
Important: `pool`, `mountDir`, `logsDir`, `pgVersion`, `pgBindir`, `pgDataSubdir`.

### Run
```bash
./bin/dblab -v some_token
```

### Simple check
```bash
curl -X GET -H 'Verification-Token: some_token' -i http://localhost:3000/status
```

### Install and configure Nginx
```bash
sudo apt-get install -y nginx openssl

sudo mkdir /etc/nginx/ssl || true # dir exists?

# TODO: generate SSL cert with letsencrypt;
# we need hostname, not IP (so, create a DNS entry)
# to generate certificates, use, for instance, Let's Encrypt (e.g. https://zerossl.com/free-ssl/#crt)
sudo cp server.crt /etc/nginx/ssl
sudo cp server.key /etc/nginx/ssl

echo "server {
  listen 443 ssl;

  ssl on;
  ssl_certificate /etc/nginx/ssl/server.crt; 
  ssl_certificate_key /etc/nginx/ssl/server.key;

  server_name your_very_own_domain.com;
  access_log /var/log/nginx/joe.access.log;
  error_log /var/log/nginx/joe.error.log;
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
