---
title: How to delete a snapshot
sidebar_label: Delete a snapshot
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
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/how-to-guides/cli/cli-install-init).

### Reference
- Command [`dblab snapshot delete`](/docs/reference-guides/dblab-client-cli-reference#subcommand-delete)

### Delete snapshot
Delete a snapshot with `dblab snapshot` command, using subcommand `delete`.

```bash
$ dblab snapshot delete SNAPSHOT_ID
```

## Related
- Guide: [Create a snapshot](/docs/how-to-guides/branching/create-snapshot)
