---
title: Set up on Ubuntu
---

## Prepare OS, FS, and Postgres (Ubuntu 18.04 LTS with ZFS module)

### Install Postgres

Install Postgres version that is needed. If we are going to use an existing PGDATA, the major version of Postgres must match: 12, 11, 10, 9.6, 9.5, etc. Below an example of Postgres 12 installation is provided.

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
  "${DBLAB_DISK}"

# To verify: `df -hT`

sudo chown postgres:postgres /var/lib/dblab/data
sudo chmod 0700 /var/lib/dblab/data
```

### Database Provisioning

#### Use of Existing Database

In case of using the existing PGDATA, we now need to copy (or restore using WAL-G/Barman/pgBackRest/any other archiving tool) data to `/var/lib/dblab/data`.
