---
title: How to run DBLab Engine on macOS
sidebar_label: Run DBLab on macOS
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide explains how to run the DBLab Engine with full ZFS support **on macOS**, using [**Colima**](https://github.com/abiosoft/colima), a lightweight Linux VM with Docker support.  
All ZFS operations happen **inside the Colima VM**, so you don't need to install the ZFS module to your macOS.

:::note
This guide provides an experimental way to run DBLab Engine on macOS.
:::

## Prerequisites: Docker, Colima, Go
First, install Homebrew, if you don't have it yet:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install Docker, Colima, and Go:
```bash
brew install docker colima go
```

To build the DLE binary locally, **Go 1.23 or higher** is required, so let's check Go version:
```bash
go version
```

If your Go version is older than 1.23, update it:
```bash
brew update
brew upgrade go
```

## 1. Get DBLab source code
```bash
git clone https://gitlab.com/postgres-ai/database-lab.git
cd database-lab/engine
```

## 2. Start Colima VM
Run Colima with enough resources and mount your project directory (adjust parameters based on available resources):
```bash
colima start --cpu 4 --memory 6 --disk 20 --mount $HOME:w
```

The `--mount $HOME:w` flag makes your home directory accessible inside Colima at `/mnt/host/Users/yourname/...`.

## 3. Initialize ZFS in Colima VM
You can either use the provided setup script or run all steps manually if you prefer better control.

<Tabs>
<TabItem value="script" label="Option 1: Run the setup script" default>

```bash
# to run this, we must be in `./engine` subdirectory
colima ssh < ./scripts/init-zfs-colima.sh
```

This will:
- Install `zfsutils-linux` if needed
- Create a loop device-backed ZFS pool (`dblab_pool`)
- Create default datasets: `dataset_1`, `dataset_2`, `dataset_3`

</TabItem>
<TabItem value="manual" label="Option 2: Manual setup (inside Colima)">

**Step 1.** Open Colima shell from your macOS terminal:
```bash
colima ssh
```

**Step 2.** Install ZFS:
```bash
sudo apt-get update
sudo apt-get install -y zfsutils-linux
```

**Step 3.** Create a virtual disk:
Specify desired disk size (e.g. `5G`, `10G`, `20G`) and create a virtual disk:
```bash
DISK_SIZE=20G
sudo mkdir -p /var/lib/dblab
sudo truncate -s "$DISK_SIZE" /var/lib/dblab/zfs-disk
```

This creates an empty file at `/var/lib/dblab/zfs-disk`, which will be used as a virtual block device for the ZFS pool.

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

You should see datasets similar to this:
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

</TabItem>
</Tabs>

## 4. Build engine
Compile DBLab for Linux:
```bash
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bin/dblab-server ./cmd/database-lab/main.go
```

## 5. Build Docker image
```bash
docker build -t dblab_server:local -f Dockerfile.dblab-server .
```

## 6. Configure your DBLab Engine
Before running the server, create your configuration file:
```bash
cp configs/config.example.logical_generic.yml configs/server.yml
```

Then edit `configs/server.yml` and make the following changes:
- Set the ZFS mount path to `/var/lib/dblab/dblab_pool`:
    ```yaml
    mountDir: /var/lib/dblab/dblab_pool
    ```
    This should match the dataset mount path used by the ZFS pool.
- Configure connection to the source database:
    ```yaml
    connection:
        dbname: postgres
        host: localhost
        port: <port>
        username: postgres
        password: your_password
    ```

## 7. Run DBLab main container 
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
  --env DOCKER_API_VERSION=1.39 \
  -p 2345:2345 \
  dblab_server:local
```

## 8. Start working with DBLab UI and CLI
### Open DBLab UI
When the main container (`dblab_server`) starts, it launches an additional container with UI, whose name looks like `dblab_embedded_ui_xxx`; it provides UI available at port `2346` by default (can be changed in `server.yml`).

In your browser, open [http://127.0.0.1:2346](http://127.0.0.1:2346).

You'll see a **"refreshing"** state while the engine initializes.  This may take some time; please wait until the refresh is complete. Once it's done, you will be able to create snapshots, branches, and clones.

To learn how to work with DBLab UI, see [DBLab Guides](/docs/how-to-guides).

### Install and configure DBLab CLI
```bash
curl -sSL dblab.sh | bash
```

Now configure to work with your local DBLab (edit the token value if it was changed):
```bash
dblab init --environment-id=local --url=http://127.0.0.1:2345 --token=secret_token
```

And verify it works:
```
dblab instance status
```

More about DBLab CLI: [How to install and initialize Database Lab CLI](/docs/how-to-guides/cli/cli-install-init).

## How to clean up to start from scratch
Stop the container:
```bash
docker stop dblab_server
docker rm -f dblab_server
```

Ensure no extra containers (UI, Postgres) that were launched by `dblab_server`, are present (if there are, delete them using `docker rm`):
```
docker ps -a \
  --format "ID: {{.ID}}\tName: {{.Names}}\tImage: {{.Image}}\tLabels: {{.Labels}}" \
| grep dblab
```

Stop Colima VM:
```bash
colima stop
```

Reset everything (⚠️ this wipes Colima VM, ZFS pool, images):
```bash
colima delete
```