---
title: How to reset a DBLab clone's state
sidebar_label: Reset clone's state
description: Reset a DBLab clone to its initial snapshot state from the web UI or the DBLab CLI, discarding all changes made during testing on the clone.
---
With DBLab clones, you can test any change without risk to the source database (such as production).

## GUI
1. Connect to your clone and run a DDL or DML query. For example, drop a table:
  ![DBLab Engine page / Create clone](/assets/guides/reset-clone-1.png)
1. On the **DBLab clone page**, click the **Reset** button:
  ![DBLab Engine page / Create clone](/assets/guides/reset-clone-2.png)
1. Wait for the **OK** status and connect to your clone again. The data is restored to its initial state:
  ![DBLab Engine page / Create clone](/assets/guides/reset-clone-3.png)

## CLI
Before you run any commands, install the DBLab CLI and initialize its configuration. For more information, see [Install and initialize DBLab CLI](/docs/dblab-howtos/cli/cli-install-init).

### Reference
- Command [`dblab clone reset`](/docs/reference-guides/dblab-client-cli-reference#subcommand-reset)

### Reset a clone

To reset the clone to its initial state and discard all changes (revert to the snapshot used to create the clone):
```bash
dblab clone reset CLONE_ID
```

Result:
```text
The clone has been successfully reset: CLONE_ID
```

To reset to the latest available snapshot (feature available in DBLab Engine 2.5+). This is especially useful for long-lived clones, because you get a fresh version of the data without changing the database credentials (including the port) of your clone:
```bash
dblab clone reset --latest CLONE_ID
```

Finally, to reset the clone's state using a specific snapshot:
```bash 
dblab clone reset --snapshot-id SNAPSHOT_ID CLONE_ID
```

:::caution
The parameters `--latest` and `--snapshot-id` must not be specified at the same time.
:::

For long-running operations, use the `--async` flag:
```bash
dblab clone reset --async --latest CLONE_ID
```

## Related
- Guide: [Destroy a clone](/docs/dblab-howtos/cloning/destroy-clone)
