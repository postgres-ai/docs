---
title: How to delete a snapshot
sidebar_label: Delete a snapshot
description: Delete a DBLab Engine snapshot using the GUI, the dblab CLI, or the API; force-delete snapshots with dependent clones; protect a snapshot from deletion or let the retention policy expire unused snapshots automatically (DBLab Engine 4.2+).
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

## Protect a snapshot from deletion (DBLab Engine 4.2+)
A protected snapshot cannot be deleted manually and is skipped by the automatic [retention sweep](#automatic-deletion-of-unused-snapshots-dblab-engine-42). Protection uses the same lease grammar as [clone protection](/docs/dblab-howtos/cloning/clone-protection): a number of minutes or a duration such as `30m`, `2h`, `7d`; `true` or `0` for no expiry; `false` to remove it. Branches and snapshots have no default lease. When the administrator sets `retention.protectionMaxDurationMinutes` (no cap by default), `true` and `0` yield a lease equal to that cap and longer requests are shortened to it.

### GUI
On the **Database Lab snapshot** page, set the **Deletion protection** dropdown to the desired duration.

### CLI
Reference: [`dblab snapshot update`](/docs/reference-guides/dblab-client-cli-reference#subcommand-update-1).

```bash
# Protect for 7 days
$ dblab snapshot update --protected 7d SNAPSHOT_ID

# Remove protection
$ dblab snapshot update --protected false SNAPSHOT_ID
```

### API
```bash
curl -X PATCH \
  -H "Verification-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"protected": true, "protectionDurationMinutes": 10080}' \
  "http://localhost:2345/snapshot/SNAPSHOT_ID"
```

## Automatic deletion of unused snapshots (DBLab Engine 4.2+)
When `retention.unusedSnapshotMinutes` is set to a non-zero value in `server.yml`, the engine deletes a snapshot that has stayed unused for that long. Only user snapshots (on branches or created from clones) are considered, and only leaf ones: a snapshot with clones, child snapshots, or one that is a branch head or fork point is never removed, and nothing is force-deleted. The automatic pool-level snapshots created by data retrieval and the physical `_pre` snapshots are not covered by this sweep; they are managed separately (in physical mode by [`physicalSnapshot.options.scheduler.retention`](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalsnapshot), in logical mode by the cleanup that runs on each full refresh). The timer starts when the sweeper first sees the snapshot unused and is cleared if a dependent appears. Protected snapshots are never removed. The setting is off by default, and enabling it requires an engine restart. See the [`retention` section](/docs/reference-guides/database-lab-engine-configuration-reference#section-retention-automatic-deletion-of-unused-branches-and-snapshots) of the configuration reference.

## Related
- Guide: [Create a snapshot](/docs/dblab-howtos/snapshots/create-snapshot)
- Guide: [Protect clones from deletion](/docs/dblab-howtos/cloning/clone-protection)
