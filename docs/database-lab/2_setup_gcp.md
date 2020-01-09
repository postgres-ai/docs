## GCP Setup

### Create an instance
Compute Engine -> VM instances -> Create Instance
- Set name to something like `dblab-dev1`.
- It's preferable to use Ubuntu 18.04 with at least 10 GB standard persistent disk.
- Check `Allow HTTPS traffic`.

### Add a ZFS disk
Compute Engine -> Disks -> Create Disk
- Set name to something like `dblab-dev1-zfs`.
- Preferred type `SSD persistent disk`.
- Change size according to size of your PGDATA, keep in mind that GCP IOPS depend on disk size (the bigger disk, the more IOPS).

### Instance setup
- Go to VM instances and select `dblab-dev1` instance.
- Go to edit mode.
- In Additional disks click Attach existing disk and select `dblab-dev1-zfs` disk.
- Add your SSH key to the instance or use web shell to connect. 
- Remember the path to this device in `DBLAB_DISK` variable: 

```bash
export DBLAB_DISK="/dev/disk/by-id/google-dblab-dev1-zfs"
```
