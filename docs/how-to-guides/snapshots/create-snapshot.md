---
title: How to create a snapshot
sidebar_label: Create a snapshot
---

:::info
DBLab Engine must be version `4.0` or higher.
:::

## GUI
1. Go to the **Database Lab instance** page.
2. Choose the Snapshots tab.
   ![Database Lab instance page / Create snapshot](/assets/guides/create-snapshot-1.png)
3. Click the **Create snapshot** button.
   ![Database Lab instance page / Create snapshot](/assets/guides/create-snapshot-2.png)
4. Choose Clone ID.
5. Fill in the Message field.
6. Click the **Create snapshot** button.   
   ![Database Lab instance page / Create snapshot](/assets/guides/create-snapshot-3.png)
7. You will be redirected to the **Database Lab snapshot** page.
   ![Database Lab instance page / Create snapshot](/assets/guides/create-snapshot-4.png) 

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/how-to-guides/cli/cli-install-init).

### Reference
- Command [`dblab snapshot`](/docs/reference-guides/dblab-client-cli-reference#command-snapshot)
- Command [`dblab commit`](/docs/reference-guides/dblab-client-cli-reference#command-commit)

### Create a snapshot
Create a snapshot using the `dblab commit` command and specify the clone ID and message (optional):
```bash
$ dblab commit --clone-id CLONE_ID --message "Snapshot message"
```

Command `dblab snapshot list` shows all snapshots, including the one just created:
```bash
$ dblab snapshot list
```

```json
[
    {
        "id": "dblab_pool/dataset_1/branch/main/test-clone/r0@20250418112725",
        "createdAt": "2025-04-18T11:27:25Z",
        "dataStateAt": "2025-04-18T11:27:25Z",
        "pool": "dblab_pool/dataset_1",
        "numClones": 1,
        "clones": [
            "test-clone"
        ],
        "branch": "main",
        "message": "Snapshot message",
        "physicalSize": "0 B",
        "logicalSize": "2.7 GiB"
    },
    ...
]
```

## Related
- Guide: [Delete a snapshot](/docs/how-to-guides/snapshots/delete-snapshot)
