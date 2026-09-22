---
title: How to delete a database branch
sidebar_label: Delete a database branch
description: Delete a database branch in DBLab Engine from the GUI, the dblab branch command, or the API; protect a branch from deletion or let the retention policy expire unused branches automatically (DBLab Engine 4.2+).
---

:::info
DBLab Engine must be version `4.0` or higher.
:::

## GUI
1. Go to the **Database Lab instance** page.
2. Choose the Branches tab.
   ![Database Lab instance page / Delete branch](/assets/guides/create-branch-1.png)
3. Click on the branch you want to delete.
   ![Database Lab instance page / Delete branch](/assets/guides/delete-branch-1.png)
4. Click on **Delete branch**.
   ![Database Lab instance page / Delete branch](/assets/guides/delete-branch-2.png)
5. You will be asked to confirm the deletion.
   ![Database Lab instance page / Delete branch](/assets/guides/delete-branch-3.png)

## CLI
Before you run any commands, install the DBLab CLI and initialize the configuration. For more information, see [Install and initialize DBLab CLI](/docs/dblab-howtos/cli/cli-install-init).

### Reference
- Command [`dblab branch`](/docs/reference-guides/dblab-client-cli-reference#command-branch)

### Delete branch
Delete a database branch with the `dblab branch` command, using `-d` or `--delete`:
```bash
$ dblab branch -d test
```

## Protect a branch from deletion (DBLab Engine 4.2+)
A protected branch cannot be deleted manually and is skipped by the automatic [retention sweep](#automatic-deletion-of-unused-branches-dblab-engine-42). Protection uses the same lease grammar as [clone protection](/docs/dblab-howtos/cloning/clone-protection): a number of minutes or a duration such as `30m`, `2h`, `7d`; `true` or `0` for no expiry; `false` to remove it. Branches and snapshots have no default lease. When the administrator sets `retention.protectionMaxDurationMinutes` (no cap by default), `true` and `0` yield a lease equal to that cap and longer requests are shortened to it.

### GUI
On the **Database Lab branch** page, set the **Deletion protection** dropdown to the desired duration.

### CLI
```bash
# Protect for 7 days
$ dblab branch --protected 7d test

# Protect with no expiry
$ dblab branch --protected 0 test

# Remove protection
$ dblab branch --protected false test
```

The list output annotates protected branches with `[protected]` or `[protected until <time>]`.

### API
```bash
curl -X PATCH \
  -H "Verification-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"protected": true, "protectionDurationMinutes": 10080}' \
  http://localhost:2345/branch/test
```

## Automatic deletion of unused branches (DBLab Engine 4.2+)
When `retention.unusedBranchMinutes` is set to a non-zero value in `server.yml`, the engine deletes a branch that has stayed unused for that long. A branch is unused when it has no clones and no child branches; the timer starts when the sweeper first sees it in that state and is cleared if a clone or child branch appears. Protected branches and the default branch `main` are never removed, and pools without branch metadata (LVM) are not swept. The setting is off by default, and enabling it requires an engine restart. See the [`retention` section](/docs/reference-guides/database-lab-engine-configuration-reference#section-retention-automatic-deletion-of-unused-branches-and-snapshots) of the configuration reference.

## Related
- Guide: [Create a database branch](/docs/dblab-howtos/branching/create-branch)
- Guide: [Protect clones from deletion](/docs/dblab-howtos/cloning/clone-protection)
