---
title: How to refresh data when working in the "logical" mode
sidebar_label: Full refresh for "logical" mode
---

For the "logical" provisioning mode, the "sync" instance is not yet supported (although, it is possible to implement based on logical replication) and the only option to get a fresh data on Database Lab Engine is to refresh it fully. Follow these instructions to automate this process.

>Note, that the process described here requires some downtime for Database Lab Engine. Also, the existing clones are deleted and fully lost during the process. It means that the proper planning of the maintenance windows is needed. 

If you are using the "physical" privisoning mode, read [how to configure the "sync" instance](/docs/guides/administration/postgresql-configuration#the-sync-instance) instead.

## Refresh data from source 

### 1. Stop and remove the existing containers, then clean up the data directory
```bash
sudo docker ps -aq | xargs --no-run-if-empty sudo docker rm -f
sudo rm -rf /var/lib/dblab/data/
sudo umount /var/lib/dblab/db.dump
sudo rm -rf /var/lib/dblab/db.dump
```

### 2. Launch Database Lab Engine
```bash
sudo docker run ... # the same as it was done initially
``` 

### 3. Checking the result manually (optional step)
Optionally, if you do it manually, check the logs:
```bash
sudo docker logs dblab_server -f
```

And check the instance status using client CLI:
```bash
dblab instance status
```
