---
title: How to delete a snapshot
sidebar_label: Delete a snapshot
description: Delete a DBLab Engine snapshot using the GUI or the dblab CLI, and force-delete snapshots that still have dependent clones.
---

:::info
DBLab Engine must be version `4.0` or higher.
:::

## GUI
1. Go to the **Database Lab instance** page.
2. Choose the Snapshots tab.
   ![Database Lab instance page / Delete snapshot](/assets/guides/create-snapshot-1.png)
3. Click on the snapshot you want to delete.
   ![Database Lab instance page / Delete snapshot](/assets/guides/delete-snapshot-1.png)
4. Click **Delete snapshot**.
   ![Database Lab instance page / Delete snapshot](/assets/guides/delete-snapshot-2.png)
5. You will be asked to confirm the deletion.
   ![Database Lab instance page / Delete snapshot](/assets/guides/delete-snapshot-3.png)
6. If the snapshot has dependent clones, you can force-delete it.
   ![Database Lab instance page / Delete snapshot](/assets/guides/delete-snapshot-4.png)

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/dblab-howtos/cli/cli-install-init).

### Reference
- Command [`dblab snapshot delete`](/docs/reference-guides/dblab-client-cli-reference#subcommand-delete)

### Delete snapshot
Delete a snapshot with the `dblab snapshot delete` command.

```bash
$ dblab snapshot delete SNAPSHOT_ID
```

:::tip
If the snapshot has dependent clones, you can force-delete it via the GUI (see screenshots above) or via the API (`DELETE /snapshot/{id}?force=true`).
:::

## Related
- Guide: [Create a snapshot](/docs/dblab-howtos/snapshots/create-snapshot)
