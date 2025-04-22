---
title: How to run Database Lab Engine on macOS
sidebar_label: Run Database Lab on macOS
---

This guide explains how to run the Database Lab Engine (DLE) with full ZFS support **on macOS**, using [**Colima**](https://github.com/abiosoft/colima) — a lightweight Linux VM with Docker support.  
All ZFS operations happen **inside the Colima VM**, so you don’t need ZFS installed on your Mac.

:::note
This guide provides an experimental way to run Database Lab Engine on macOS.
:::

## Prerequisites

### Install Docker and Colima:

```bash
brew install docker colima
```

###  Install Go
To build the DLE binary locally, **Go 1.23 or higher** is required.

Install it via Homebrew:
```bash
brew install go
```

Check your version:
```bash
go version
```
Expected:
```bash
go version go1.23.x darwin/arm64
```

If you’re using an older version of Go, update it:
```bash
brew update
brew upgrade go
```

## 1. Clone repo & enter engine directory

```bash
git clone https://gitlab.com/postgres-ai/database-lab.git
cd database-lab/engine
```

## 2. Start Colima VM

Run Colima with enough resources and mount your project directory:

```bash
colima start --cpu 4 --memory 6 --disk 20 --mount $HOME:w
```

The `--mount $HOME:w` flag makes your home directory accessible inside Colima at /mnt/host/Users/yourname/...

## 3. Initialize ZFS in Colima

You can either use the provided setup script or run all steps manually.

### Option 1: Run the setup script
```bash
colima ssh < ./scripts/init-zfs-colima.sh
```

This will:
 - Install `zfsutils-linux` if needed
 - Create a loop device-backed ZFS pool (`dblab_pool`)
 - Create default datasets: `dataset_1`, `dataset_2`, `dataset_3`


### Option 2: Manual setup (inside Colima)

**Step 1.** Open a Colima shell from your macOS terminal:
```bash
colima ssh
```

**Step 2.** Install ZFS:

```bash
sudo apt-get update
sudo apt-get install -y zfsutils-linux
```

**Step 3.** Create a virtual disk:

First, set the desired disk size (e.g. 5G, 10G, 20G):
```bash
DISK_SIZE=20G
```

Then create a virtual disk:

```bash
sudo mkdir -p /var/lib/dblab
sudo truncate -s "$DISK_SIZE" /var/lib/dblab/zfs-disk
```
This creates an empty file at /var/lib/dblab/zfs-disk which will be used as a virtual block device for the ZFS pool.

**Step 4.** Set up a loop device:

```bash
sudo losetup -fP /var/lib/dblab/zfs-disk
LOOP=$(sudo losetup -j /var/lib/dblab/zfs-disk | cut -d: -f1)
```

**Step 5.** Create a ZFS pool:

```bash
sudo zpool create -f \
  -O compression=on \
  -O atime=off \
  -O recordsize=128k \
  -O logbias=throughput \
  -m /var/lib/dblab/dblab_pool \
  dblab_pool \
  "$LOOP"
```

**Step 6.** Create base datasets:
```bash
sudo zfs create -o mountpoint=/var/lib/dblab/dblab_pool/dataset_1 dblab_pool/dataset_1
sudo zfs create -o mountpoint=/var/lib/dblab/dblab_pool/dataset_2 dblab_pool/dataset_2
sudo zfs create -o mountpoint=/var/lib/dblab/dblab_pool/dataset_3 dblab_pool/dataset_3
```

**Step 7.** Verify:
```bash
zfs list
```

You should see the created datasets:
```text
NAME                           USED  AVAIL     REFER  MOUNTPOINT
dblab_pool                     0B    20G       96.5K  /var/lib/dblab/dblab_pool
dblab_pool/dataset_1           0B    20G       96.5K  /var/lib/dblab/dblab_pool/dataset_1
dblab_pool/dataset_2           0B    20G       96.5K  /var/lib/dblab/dblab_pool/dataset_2
dblab_pool/dataset_3           0B    20G       96.5K  /var/lib/dblab/dblab_pool/dataset_3
```

**Step 8.** Exit Colima shell:
```bash
exit
```

## 4. Build engine

Compile DLE binary for Linux:

```bash
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bin/dblab-server ./cmd/database-lab/main.go
```

## 5. Build Docker image

```bash
docker build -t dblab_server:local -f Dockerfile.dblab-server .
```

## 6. Configure your Database Lab

Before running the server, create your configuration file:

```bash
cp configs/config.example.logical_generic.yml configs/server.yml
```

Then edit `configs/server.yml` and make the following changes:

- Set the ZFS mount path:
```yaml
mountDir: /var/lib/dblab/dblab_pool
```
> This should match the dataset mount path used by the ZFS pool.

- Set the database connection parameters:
```yaml
    connection:
        dbname: postgres
        host: localhost
        port: <port>
        username: postgres
        password: your_password
```

## 7. Run DLE container 

```bash
docker run \
  --rm \
  --name dblab_server \
  --privileged \
  --device /dev/zfs \
  -v /tmp:/tmp \
  -v /var/lib/dblab/dblab_pool:/var/lib/dblab/dblab_pool:rshared \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/run/zfs.sock:/var/run/zfs.sock \
  -v "$(pwd)/configs:/home/dblab/configs:rw" \
  -v "$(pwd)/configs/standard:/home/dblab/standard:ro" \
  -v "$(pwd)/meta:/home/dblab/meta" \
  -p 2345:2345 \
  dblab_server:local
```

### Open Database Lab web UI
Once the container is running, open your browser and go to [http://localhost:2346](http://localhost:2346).
> By default, the web interface is exposed on port 2346 (configured in server.yml).

You’ll see a **"refreshing"** state while the engine initializes.  
This may take some time — please wait until the refresh is complete.

Once the refresh is finished, the Database Lab Engine UI will become available.

## 8. Cleanup (optional)

Stop the container:
```bash
docker rm -f dblab_server
```

Stop Colima VM:
```bash
colima stop
```

Reset everything (⚠️ wipes Colima VM, ZFS pool, images):
```bash
colima delete
```