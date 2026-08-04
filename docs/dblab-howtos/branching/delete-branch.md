---
title: How to delete a database branch
sidebar_label: Delete a database branch
description: Delete a database branch in DBLab Engine from the GUI or with the dblab branch command, freeing up resources when the branch is no longer needed.
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

## Related
- Guide: [Create a database branch](/docs/dblab-howtos/branching/create-branch)
