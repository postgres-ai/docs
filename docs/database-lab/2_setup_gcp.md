---
title: GCP Setup
---

### Create an instance
Compute Engine -> VM instances -> Create Instance
- Set name to something like `dblab-dev1`.
- It's preferable to use Ubuntu 18.04 with at least 10 GB standard persistent disk.
- Check "Allow HTTPS traffic".

### Add a data disk
Compute Engine -> Disks -> Create Disk
- Set the name to something like `dblab-dev1-data`.
- Preferred type: "SSD persistent disk".
- Change the disk size according to your PGDATA size, and keep in mind that GCP IOPS limit depends on the disk size (the bigger disk, the more IOPS available).

### Instance setup
- Go to "VM instances" and select `dblab-dev1` instance.
- Go to edit mode.
- In "Additional disks", click "Attach existing disk" and select `dblab-dev1-data` disk.
- Add your SSH key to the instance or use web shell to connect. 
- Remember the path to this device in `DBLAB_DISK` variable: 

```bash
export DBLAB_DISK="/dev/disk/by-id/google-dblab-dev1-data"
```
