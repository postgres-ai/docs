---
title: Setup machine for the Database Lab Engine
sidebar_label: Setup machine for the Database Lab Engine
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Prepare a machine
Create an EC2 instance with Ubuntu 18.04 and an additional EBS volume to store data. You can find detailed instructions on how to create an AWS EC2 instance [here](https://docs.aws.amazon.com/efs/latest/ug/gs-step-one-create-ec2-resources.html) (if you want to use Google Cloud, see [the GCP documentation](https://cloud.google.com/compute/docs/instances/create-start-instance)).

## (optional) Ports need to be open in the Security Group being used
You will need to allow working with the following ports (outbound rules in your Security Group):
- `22`: to connect to the instance using SSH;
- `2345`: to work with Database Lab Engine API (can be changed in the Database Lab Engine configuration file);
- `6000-6100`: to connect to PostgreSQL clones (this is default port range used in the Database Lab Engine configuration file, can be chanfed if needed).

> For real-life use, it is not a good idea to open ports to the public. Instead, it is recommended to use VPN or SSH port forwarding to access both Database Lab API and PostgreSQL clones, or to enforce encryption for all connections using NGINX with SSL and configuring SSL in PostgreSQL configuration.

Additionally, to be able to install software, allow accessing external resources using HTTP/HTTPS (edit inbound rule in your Security Group):
- `80` for HTTP;
- `443` for HTTPS.

Here is how the inbound and outbound rules in your Security Group may look like:

![Database Lab architecture](/assets/ec2-security-group-inbound.png)

![Database Lab architecture](/assets/ec2-security-group-outbound.png)

## Install Docker
If needed, you can find the detailed installation guides for Docker [here](https://docs.docker.com/install/linux/docker-ce/ubuntu/).

Install dependencies:
```bash
sudo apt-get update && sudo apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  software-properties-common
```

Install Docker:
```bash
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

## Set $DBLAB_DISK
Further, we will need `$DBLAB_DISK` environment variable. It must contain the device name corresponding the disk where all the Database Lab Engine data will be stored.

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

## Set up either ZFS or LVM to enable thin cloning
ZFS is a recommended way to enable thin cloning in Database Lab. LVM is also available, but has certain limitations:
- much less flexible disk space consumption and risks for a clone to be destroyed during massive operations in it,
- inability to work with multiple snapshots ("time travel"), cloning always happens based on the most recent version of data.

<Tabs
  groupId="file-systems"
  defaultValue="zfs"
  values={[
    {label: 'ZFS', value: 'zfs'},
    {label: 'LVM', value: 'lvm'},
  ]
}>
<TabItem value="zfs">

Install ZFS:
```bash
sudo apt-get install -y zfsutils-linux
```

Create a new ZFS storage pool (make sure `$DBLAB_DISK` has the correct value, see the previous step!):
```bash
sudo zpool create -f \
  -O compression=on \
  -O atime=off \
  -O recordsize=8k \
  -O logbias=throughput \
  -m /var/lib/dblab/data \
  dblab_pool \
  "${DBLAB_DISK}"
```

And check the result using `zfs list` and `lsblk`, it has to be like this:
```bash
$ sudo zfs list
NAME         USED  AVAIL  REFER  MOUNTPOINT
dblab_pool   106K  777G    24K  /var/lib/dblab/data

$ sudo lsblk
NAME      MAJ:MIN  RM  SIZE RO TYPE MOUNTPOINT
...
xvda        202:0  0     8G  0 disk
└─xvda1     202:1  0     8G  0 part /
nvme0n1     259:0  0   777G  0 disk
├─nvme0n1p1 259:3  0   777G  0 part
└─nvme0n1p9 259:4  0     8M  0 part
```

</TabItem>
<TabItem value="lvm">

Install LVM2:
```bash
sudo apt-get install -y lvm2
```

Create a LVM volume (make sure `$DBLAB_DISK` has the correct value, see the previous step!):
```bash
# Create Physical Volume and Volume Group
sudo pvcreate "${DBLAB_DISK}"
sudo vgcreate dblab_vg "${DBLAB_DISK}"

# Create Logical Volume for PGDATA
sudo lvcreate -l 10%FREE -n pg_lv dblab_vg
sudo mkfs.ext4 /dev/dblab_vg/pg_lv
sudo mkdir -p /var/lib/dblab/{data,clones,sockets}
sudo mount /dev/dblab_vg/pg_lv /var/lib/dblab/data

# Create PGDATA directory
sudo mkdir -p /var/lib/dblab/data/pgdata

# Bootstrap LVM snapshots so they could be used inside Docker containers
sudo lvcreate --snapshot --extents 10%FREE --yes --name dblab_bootstrap dblab_vg/pg_lv
sudo lvremove --yes dblab_vg/dblab_bootstrap
```

>Logical volume size needs to be defined at volume creation time. By default, we allocate 10% of the available memory. If the volume size exceeds the allocated memory volume will be destroyed, potentially leading to data losses. To prevent volumes from being destroyed, consider enabling the LVM auto-extend feature.

To enable the auto-extend feature, the following LVM configuration options need to be updated:
- `snapshot_autoextend_threshold`: auto-extend a "snapshot" volume when its usage exceeds the specified percentage,
- `snapshot_autoextend_percent`: auto-extend a "snapshot" volume by the specified percentage of the available space once the usage exceeds the threshold.

Update LVM configuration (located in `/etc/lvm/lvm.conf` by default):
```bash
sudo sed -i 's/snapshot_autoextend_threshold.*/snapshot_autoextend_threshold = 70/g' /etc/lvm/lvm.conf
sudo sed -i 's/snapshot_autoextend_percent.*/snapshot_autoextend_percent = 20/g' /etc/lvm/lvm.conf
```

</TabItem>
</Tabs>

## Related
- [Data sources](/docs/guides/data)
- [Database Lab tutorial for Amazon RDS](/docs/tutorials/database-lab-tutorial-amazon-rds)
- [Database Lab tutorial (generic)](/docs/tutorials/database-lab-tutorial)
