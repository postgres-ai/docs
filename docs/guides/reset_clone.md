---
title: Resetting a Database Lab clone state
---

<!--DOCUSAURUS_CODE_TABS-->
<!--GUI-->
1. With Database Lab clones you can perform any changes and not be afraid to damage the data. For example, connect to your clone and drop any table.
  ![Database Lab engine page / Create clone](/docs/assets/guides/reset_clone_1.png)
1. From the **Database Lab clone page**, click the **Reset** button.
  ![Database Lab engine page / Create clone](/docs/assets/guides/reset_clone_2.png)
1. Wait for **OK** status and connect to your clone again. The data will be recovered to the initial state.
  ![Database Lab engine page / Create clone](/docs/assets/guides/reset_clone_3.png)
<!--CLI-->
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/guides/cli_install_init).

### Reference
- Command [`dblab clone reset`](/docs/database-lab/6_cli_reference#subcommand-reset)

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
<!--END_DOCUSAURUS_CODE_TABS-->

## Related
- Guide: [Destroy a clone](/docs/assets/destroy_clone)

[↵ Back to Guides](/docs/guides/)
