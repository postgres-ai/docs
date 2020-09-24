---
title: How to reset Database Lab clone
---

[↵ Back to Cloning guides](/docs/guides/cloning)

## GUI
1. With Database Lab clones you can perform any changes and not be afraid to damage the data. For example, connect to your clone and drop any table.
  ![Database Lab engine page / Create clone](/assets/guides/reset-clone-1.png)
1. From the **Database Lab clone page**, click the **Reset** button.
  ![Database Lab engine page / Create clone](/assets/guides/reset-clone-2.png)
1. Wait for **OK** status and connect to your clone again. The data will be recovered to the initial state.
  ![Database Lab engine page / Create clone](/assets/guides/reset-clone-3.png)

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/guides/cli-install-init).

### Reference
- Command [`dblab clone reset`](/docs/database-lab/cli-reference#subcommand-reset)

### Reset a clone

1. With Database Lab clones you can perform any changes and not be afraid to damage the data. For example, connect to your clone and drop any table.

2. Reset a clone.
```bash
dblab clone reset CLONE_ID
```

```text
The clone has been successfully reset: CLONE_ID
```

3. The data will be recovered to the initial state.

## Related
- Guide: [Destroy a clone](/assets/destroy-clone)

[↵ Back to Cloning guides](/docs/guides/cloning)
