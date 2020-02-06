---
title: Set up on Ubuntu
---

## Prepare OS, FS, and Postgres (Ubuntu 18.04 LTS with ZFS module)

### Install Docker

See [official installation guide](https://docs.docker.com/install/linux/docker-ce/ubuntu/) for Docker.

```bash
sudo apt-get update && sudo apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  software-properties-common

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
```

### Database Provisioning

#### Use of Existing Database

In case of using the existing PGDATA, we now need to copy (or restore using WAL-G/Barman/pgBackRest/any other archiving tool) data to `/var/lib/dblab/data`.
