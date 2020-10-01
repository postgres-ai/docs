---
title: How to destroy a Database Lab clone
sidebar_label: Destroy a clone
---

> Database Lab clone will be automatically deleted after an idle interval defined in the configuration in order to avoid it [protect a clone](/docs/guides/cloning/clone-protection).

> The protected clone could not be deleted automatically or manually. In order to delete the clone, you would need to [unprotect it](/docs/guides/cloning/clone-protection).

## GUI
1. On the **Database Lab clone** page click the **Destroy** button.
  ![Database Lab engine page / Create clone](/assets/guides/create-clone-1.png)
1. Accept confirmation dialog and wait for it. You will be redirected to the **Database Lab instance** page.

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/guides/cli/cli-install-init).

### Reference
- Command [`dblab clone destroy`](/docs/database-lab/cli-reference#subcommand-destroy)

### Destroy a clone
```bash
dblab clone destroy CLONE_ID
```

```
The clone has been successfully destroyed: CLONE_ID
```

## Related
- Guide: [Clone protection from manual and automatic deletion](/docs/guides/cloning/clone-protection)
- Guide: [Resetting a clone state](/docs/guides/cloning/reset-clone)
