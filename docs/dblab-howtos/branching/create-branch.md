---
title: How to create a database branch
sidebar_label: Create a database branch
---

:::info
DBLab Engine must be version `4.0` or higher.
:::

## GUI
1. Go to the **Database Lab instance** page.
2. Choose the Branches tab.
   ![Database Lab instance page / Create branch](/assets/guides/create-branch-1.png)
3. Click the **Create branch** button.
   ![Database Lab instance page / Create branch](/assets/guides/create-branch-2.png)
4. Fill the **Branch name** field with a meaningful name.
5. (optional) Change the **Parent branch** and **Snapshot ID** if needed.
6. Click the **Create branch** button.   
   ![Database Lab instance page / Create branch](/assets/guides/create-branch-3.png)
7. You will be redirected to the **Database Lab branch** page.
   ![Database Lab instance page / Create branch](/assets/guides/create-branch-4.png) 

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/how-to-guides/cli/cli-install-init).

### Reference
- Command [`dblab branch`](/docs/reference-guides/dblab-client-cli-reference#command-branch)

### Basic branch creation
Create a database branch using the `dblab branch` command and specify the branch name; after creation, you will switch into the new branch automatically:
```bash
$ dblab branch test
```

### Create a database branch with a different parent
By default, the created branch will be a child of the current branch. You can specify a different parent branch using `--parent-branch`:
```bash
$ dblab branch --parent-branch dev test
```

### Create a database branch from a specific snapshot ID

1. List all available snapshots:
```bash
$ dblab snapshot list
[
    {
        "id": "SNAPSHOT_ID_1",
        "createdAt": "2025-04-07T20:16:57Z",
        "dataStateAt": "2025-04-07T20:16:57Z",
        "branch": "test",
        ...
    },
    {
        "id": "SNAPSHOT_ID_2",
        "createdAt": "2025-04-07T20:14:43Z",
        "dataStateAt": "2025-04-07T20:14:43Z",
        "branch": "test2",
        ...
    },
    ...
```

2. Create a database branch specifying the desired snapshot:
```bash
$ dblab branch --snapshot-id SNAPSHOT_ID_1 test
```

## Related
- Guide: [Delete a database branch](/docs/how-to-guides/branching/delete-branch)
