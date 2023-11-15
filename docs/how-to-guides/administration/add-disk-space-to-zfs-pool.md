---
title: How to add disk space to a ZFS pool without downtime
sidebar_label: Increase ZFS pool size without downtime
---

For ZFS, performance degradation might occur when more than 80% of disk space is used. Therefore, it is recommended to monitor the used and free disk space and increase the size of the pool for the Database Lab Engine (DLE) in a timely fashion.

ZFS on Linux does support online pool resizing, or "auto-expand". Thanks to this, we can increase the pool size without any downtime.

:::tip
When we talk about resizing the ZFS pool without downtime, we assume that the DLE is hosted in the cloud, and the cloud provider allows you to change the disk size online without restarting the server.
:::

To add disk space to a ZFS pool without downtime, follow the below steps.

## 1. Check the free space in the pool

In this example, the pool name is `dblab_pool`.

Use the `zpool list` command to display basic information about the pool:

```bash
zpool list dblab_pool
NAME         SIZE  ALLOC   FREE  CKPOINT  EXPANDSZ   FRAG    CAP  DEDUP    HEALTH  ALTROOT
dblab_pool  39.5G  32.6G  6.88G        -         -     0%    82%  1.00x    ONLINE  -
```

Use the `df -hT` command to display consumed and available disk space:

```bash
df -hT /var/lib/dblab/dblab_pool
Filesystem     Type  Size  Used Avail Use% Mounted on
dblab_pool     zfs    39G   33G  5.7G  86% /var/lib/dblab/dblab_pool
```

## 2. Determine the disk name(s) used by the pool
```bash
zpool status -v dblab_pool
  pool: dblab_pool
 state: ONLINE
  scan: none requested
config:

	NAME        STATE     READ WRITE CKSUM
	dblab_pool  ONLINE       0     0     0
	  nvme1n1   ONLINE       0     0     0

errors: No known data errors
```

In this example output, the disk name is `nvme1n1`.

## 3. Extend the disk in question to the size you need

Example for:

  - AWS: [Request modifications to your EBS volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/requesting-ebs-volume-modifications.html)
  - GCP: [Resize a persistent disk](https://cloud.google.com/compute/docs/disks/resize-persistent-disk)
  - Azure: [Resize without downtime](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/expand-os-disk#resize-without-downtime-preview)

## 4. Resize the disk partition

Check the volume partition that must be extended; use the `lsblk` command.

```bash
lsblk /dev/nvme1n1
NAME        MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
nvme1n1     259:2    0  80G  0 disk 
├─nvme1n1p1 259:3    0  40G  0 part 
└─nvme1n1p9 259:4    0   8M  0 part 
```

Use the `growpart` command to extend the partition.

```bash
sudo growpart /dev/nvme1n1 1
```

Read the new partition table using `partprobe`.

```bash
sudo partprobe
```

To verify that the partition reflects the increased volume size, use the `lsblk` command again.

```bash
lsblk /dev/nvme1n1
NAME        MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
nvme1n1     259:2    0  80G  0 disk 
├─nvme1n1p1 259:3    0  80G  0 part 
└─nvme1n1p9 259:4    0   8M  0 part 
```

## 5. Set your zpool with autoextend on 

Check if autoexpand is enabled (it defaults to off):

```bash
sudo zpool get autoexpand dblab_pool
NAME        PROPERTY    VALUE   SOURCE
dblab_pool  autoexpand  off     default
```

Enable autoexpand:

```bash
sudo zpool set autoexpand=on dblab_pool
```

Check the result:

```bash
sudo zpool get autoexpand dblab_pool
NAME        PROPERTY    VALUE   SOURCE
dblab_pool  autoexpand  on      local
```

## 6. Resize ZFS pool

You can expand the pool online by running the following command:

```bash
sudo zpool online -e dblab_pool nvme1n1
```

## 7. Check the pool size and free space

Use the `zpool list` command to display basic information about the pool:

```bash
zpool list dblab_pool
NAME         SIZE  ALLOC   FREE  CKPOINT  EXPANDSZ   FRAG    CAP  DEDUP    HEALTH  ALTROOT
dblab_pool  79.5G  32.6G  46.9G        -         -     0%    41%  1.00x    ONLINE  -
```

Use the `df -hT` command to display consumed and available disk space:

```bash
df -hT /var/lib/dblab/dblab_pool
Filesystem     Type  Size  Used Avail Use% Mounted on
dblab_pool     zfs    78G   33G   45G  43% /var/lib/dblab/dblab_pool
```
