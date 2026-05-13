---
title: How to destroy a Database Lab clone
sidebar_label: Destroy a clone
---

:::tip
DBLab Engine automatically deletes idle unprotected clones after the idle interval which is defined in the configuration. To disable auto-deletion for a particular clone, [protect this clone](/docs/dblab-howtos/cloning/clone-protection). 
:::

:::info
A protected clone cannot be deleted automatically or manually. To delete it, first [remove protection](/docs/dblab-howtos/cloning/clone-protection). With protection leases (DBLab Engine 4.1+), protection expires automatically after the configured duration.
:::

## GUI
1. On the **Database Lab clone** page click the **Destroy** button.
1. Accept confirmation dialog and wait for it. You will be redirected to the **Database Lab instance** page.

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/dblab-howtos/cli/cli-install-init).

### Reference
- Command [`dblab clone destroy`](/docs/reference-guides/dblab-client-cli-reference#subcommand-destroy)

### Destroy a clone
```bash
dblab clone destroy CLONE_ID
```

```
The clone has been successfully destroyed: CLONE_ID
```

### Destroy a clone asynchronously
For long-running operations, use the `--async` flag:
```bash
dblab clone destroy --async CLONE_ID
```

## Related
- Guide: [Clone protection from manual and automatic deletion](/docs/dblab-howtos/cloning/clone-protection)
- Guide: [Resetting a clone state](/docs/dblab-howtos/cloning/reset-clone)
