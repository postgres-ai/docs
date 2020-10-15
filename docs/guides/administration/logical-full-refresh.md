---
title: How to refresh data when working in the "logical" mode
sidebar_label: Full refresh for "logical" mode
---

For the "logical" provisioning mode, the "sync" instance is not yet supported (although, it is possible to implement based on logical replication) and the only option to get fresh data on Database Lab Engine is to refresh it fully. Follow these instructions to automate this process. Note, that it is designed for ZFS; if you have a different setup, adjust the snippets accordingly. 

>Note, that the process described here requires some downtime for Database Lab Engine. Also, the existing clones are deleted and fully lost during the process. It means that the proper planning of the maintenance windows is needed. 

If you are using the "physical" privisoning mode, read [how to configure the "sync" instance](/docs/guides/administration/postgresql-configuration#the-sync-instance) instead.

## Refresh data from source 

### 1. Stop and remove the existing containers, then clean up the data directory and destroy the pool
```bash
sudo docker ps -aq | xargs --no-run-if-empty sudo docker rm -f
sudo rm -rf /var/lib/dblab/data/
sudo umount /var/lib/dblab/db.dump
sudo rm -rf /var/lib/dblab/db.dump
sudo zpool destroy dblab_pool
```
### 2. Set $DBLAB_DISK
Further, we will need `$DBLAB_DISK` environment variable. It must contain the device name corresponding to the disk where all the Database Lab Engine data will be stored.

To understand what needs to be specified in `$DBLAB_DISK` in your case, check the output of `lsblk`:
```bash
sudo lsblk
```

Some examples:
- **AWS local ephemeral NVMe disks; EBS volumes for instances built on [the Nitro system](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/nvme-ebs-volumes.html)**:
    ```bash
    $ sudo lsblk
    NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
    ...
    xvda    202:0    0     8G  0 disk
    └─xvda1 202:1    0     8G  0 part /
    nvme0n1 259:0    0   777G  0 disk

    $ export DBLAB_DISK="/dev/nvme0n1"
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
  -m /var/lib/dblab \
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

And check the instance status using client CLI:
```bash
dblab instance status
```
