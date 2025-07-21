---
title: How to reset Database Lab clone's state
sidebar_label: Reset clone's state
---
With Database Lab clones, you can verify any changes and without any risks for the source database (such as production).

## GUI
1. Connect to your clone and execute DDL or DML query – for example, drop some table:
  ![DBLab Engine page / Create clone](/assets/guides/reset-clone-1.png)
1. At the **Database Lab clone page**, click the **Reset** button:
  ![DBLab Engine page / Create clone](/assets/guides/reset-clone-2.png)
1. Wait for the **OK** status and connect to your clone again. The data will be recovered to the initial state:
  ![DBLab Engine page / Create clone](/assets/guides/reset-clone-3.png)

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/dblab-howtos/cli/cli-install-init).

### Reference
- Command [`dblab clone reset`](/docs/reference-guides/dblab-client-cli-reference#subcommand-reset)

### Reset a clone

If you need to reset the clone to the initial state and discard all changes that were done (revert to the snapshot that was used for clone creation):
```bash
dblab clone reset CLONE_ID
```

Result:
```text
The clone has been successfully reset: CLONE_ID
```

To reset to the latest available snapshot (feature available in DLE version 2.5+) – this is especially useful for long-living clones because you can get the fresh version of data not changing the DB credentials (including port) of your clone:
```bash
dblab clone reset --latest CLONE_ID
```

Finally, if you want to reset the clone's state using specific snapshot:
```bash 
dblab clone reset --snapshot-id SNAPSHOT_ID CLONE_ID
```

:::caution
The parameters `--latest` and `--snapshot-id` must not be specified at the same time.
:::

## Related
- Guide: [Destroy a clone](/docs/dblab-howtos/cloning/destroy-clone)
