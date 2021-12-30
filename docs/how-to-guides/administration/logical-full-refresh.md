---
title: How to refresh data when working in the "logical" mode
sidebar_label: Full refresh for "logical" mode
---

For the "logical" provisioning mode, the "sync" instance is not yet supported (although, it is possible to implement based on logical replication) and the only option to get fresh data on Database Lab Engine is to refresh it fully. Follow these instructions to automate this process. Note, that it is designed for ZFS; if you have a different setup, adjust the snippets accordingly. 

:::caution
Note, that the process described here requires a maintenance window (brief period of downtime) for the Database Lab Engine. Also, the existing clones are deleted and completely lost during the process. It means that the proper planning of the maintenance windows is needed. 
:::

If you are using the "physical" provisioning mode, read [how to configure the "sync" instance](/docs/how-to-guides/administration/postgresql-configuration#the-sync-instance) instead.

## Refresh data from source
### 1. Cleanup
Stop and remove the existing containers, then clean up the data directory and destroy the pool:
```bash
sudo docker ps -aq | xargs --no-run-if-empty sudo docker rm -f
sudo rm -rf /var/lib/dblab/dblab_pool/data/
sudo umount /var/lib/dblab/dblab_pool/dump
sudo rm -rf /var/lib/dblab/dblab_pool/dump
sudo zpool destroy dblab_pool
```

### 2. Set $DBLAB_DISK
Further, we will need `$DBLAB_DISK` environment variable. It must contain the device name corresponding to the disk where all the Database Lab Engine data will be stored.

To understand what needs to be specified in `$DBLAB_DISK` in your particular case, check the output of `lsblk`:
```bash
sudo lsblk
```

Some examples:
- **AWS local ephemeral NVMe disks; EBS volumes for instances built on [the Nitro system](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/nvme-ebs-volumes.html)**:
    ```bash
    $ sudo lsblk
    NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
    ...
    nvme0n1     259:0    0    8G  0 disk
    └─nvme0n1p1 259:1    0    8G  0 part /
    nvme1n1     259:2    0   777G  0 disk

    $ export DBLAB_DISK="/dev/nvme1n1"
    ```
- **AWS EBS volumes for older (pre-Nitro) EC2 instances**:
    ```bash
    $ sudo lsblk
    NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
    ...
    xvda    202:0    0    8G  0 disk
    └─xvda1 202:1    0    8G  0 part /
    xvdb    202:16   0  777G  0 disk

    $ export DBLAB_DISK="/dev/xvdb"
    ```

### 3. Recreate ZFS pool
```bash
sudo zpool create -f \
  -O compression=on \
  -O atime=off \
  -O recordsize=128k \
  -O logbias=throughput \
  -m /var/lib/dblab/dblab_pool \
  dblab_pool \
  "${DBLAB_DISK}"
```

### 4. Launch Database Lab Engine
```bash
sudo docker run ... # the same as it was done initially
``` 

### 5. Checking the result manually (optional step)
Optionally, if you do it manually, check the logs:
```bash
sudo docker logs dblab_server -f
```

And check the instance status using the client CLI:
```bash
dblab instance status
```

## Automatic full refresh data from a source
Database Lab Engine can work with two or more disks for an automatic full refresh without downtime.

### 1. Prepare two disks
In this guide, we will use two environment variables: `$DBLAB_DISK1` and `$DBLAB_DISK2`. They are supposed to contain the device names corresponding to the disks where all the Database Lab Engine data will be stored. It is possible to use more disks if needed.

To understand what needs to be specified in `$DBLAB_DISK1` and `$DBLAB_DISK2` in your particular case, check the output of `lsblk`:
```bash
sudo lsblk
```

Some examples:
- **AWS local ephemeral NVMe disks; EBS volumes for instances built on [the Nitro system](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/nvme-ebs-volumes.html)**:
    ```bash
    $ sudo lsblk
    nvme0n1     259:0    0    8G  0 disk
    └─nvme0n1p1 259:1    0    8G  0 part /
    nvme1n1     259:2    0   777G  0 disk
    nvme2n1     259:2    0   777G  0 disk

    $ export DBLAB_DISK1="/dev/nvme1n1"
    $ export DBLAB_DISK2="/dev/nvme2n1"
    ```
- **AWS EBS volumes for older (pre-Nitro) EC2 instances**:
    ```bash
    $ sudo lsblk
    NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
    ...
    xvda    202:0    0    8G  0 disk
    └─xvda1 202:1    0    8G  0 part /
    xvdb    202:16   0  777G  0 disk
    xvdc    202:16   0  777G  0 disk

    $ export DBLAB_DISK1="/dev/xvdb"
    $ export DBLAB_DISK2="/dev/xvdc"
    ```

### 2. Create two ZFS pools
```bash
sudo zpool create -f \
  -O compression=on \
  -O atime=off \
  -O recordsize=128k \
  -O logbias=throughput \
  -m /var/lib/dblab/dblab_pool_01 \
  dblab_pool_01 \
  "${DBLAB_DISK1}"
```

```bash
sudo zpool create -f \
  -O compression=on \
  -O atime=off \
  -O recordsize=128k \
  -O logbias=throughput \
  -m /var/lib/dblab/dblab_pool_02 \
  dblab_pool_02 \
  "${DBLAB_DISK2}"
```

### 3. Define a refresh timetable
Set up a desirable timetable in the `retrieval` section of [your configuration](/docs/how-to-guides/administration/engine-manage#configure-and-start-a-database-lab-engine-instance) to perform a full refresh automatically
```yaml
retrieval:
  refresh:
    timetable: "0 0 * * 1"
...
```

### 4. Enable `forceInit` for logicalRestore job
```yaml
    logicalRestore:
        ...
        # Restore data even if the Postgres data directory (`global.dataDir`) is not empty.
        # Note the existing data will be overwritten.
        forceInit: true
```

or for logicalDump job if `immediateRestore` is used.
```yaml
    logicalDump:
        ...
        immediateRestore:
          # Enable immediate restore.
          enabled: true
          # Restore data even if the Postgres data directory (`global.dataDir`) is not empty.
          # Note the existing data will be overwritten.
          forceInit: true
```

### 5. Launch Database Lab Engine
```bash
sudo docker run ... # the same as it was done initially
``` 

### 6. Checking the result manually (optional step)
Optionally, if you do it manually, check the logs:
```bash
sudo docker logs dblab_server -f
```
