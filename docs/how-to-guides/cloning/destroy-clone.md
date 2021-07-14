---
title: How to destroy a Database Lab clone
sidebar_label: Destroy a clone
---

:::tip
Database Lab Engine automatically deletes idle unprotected clones after the idle interval which is defined in the configuration. To disable auto-deletion for a particular clone, [protect this clone](/docs/how-to-guides/cloning/clone-protection). 
:::

:::info
The protected clone could not be deleted automatically or manually. In order to delete the clone, you would need to [unprotect it](/docs/how-to-guides/cloning/clone-protection).
:::

## GUI
1. On the **Database Lab clone** page click the **Destroy** button.
  ![Database Lab engine page / Create clone](/assets/guides/create-clone-1.png)
1. Accept confirmation dialog and wait for it. You will be redirected to the **Database Lab instance** page.

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/how-to-guides/cli/cli-install-init).

### Reference
- Command [`dblab clone destroy`](/docs/reference-guides/dblab-client-cli-reference#subcommand-destroy)

### Destroy a clone
```bash
dblab clone destroy CLONE_ID
```

```
The clone has been successfully destroyed: CLONE_ID
```

## Related
- Guide: [Clone protection from manual and automatic deletion](/docs/how-to-guides/cloning/clone-protection)
- Guide: [Resetting a clone state](/docs/how-to-guides/cloning/reset-clone)
