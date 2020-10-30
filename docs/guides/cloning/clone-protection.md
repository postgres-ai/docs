---
title: Protect clones from manual and automatic deletion
sidebar_label: Protect clones from manual and automatic deletion
---

Database Lab clones can be protected from manual and automatical deletion by enabling the **protected** status of a clone. When enabled no one can delete this clone and automated deletion is also disabled.

:::tip
Database Lab Engine automatically deletes idle unprotected clones after the idle interval which is defined in the configuration.
:::

:::caution
Please be careful: abandoned protected clones may cause out-of-disk-space events. Check disk space on a daily basis and delete protected clones once the work is done.
:::

## GUI
From the **Database Lab clone** page enable or disable the **Enable deletion protection** checkbox.
  ![Database Lab engine page / Create clone](/assets/guides/clone-protection-1.png)

## CLI
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/guides/cli/cli-install-init).

### Reference
- Command [`dblab clone update`](/docs/database-lab/cli-reference#subcommand-update)

### Protect a clone
```bash
dblab clone update --protected CLONE_ID
```

```
{
    "id": "CLONE_ID",
    "protected": true,
}
```

### Unprotect a clone
```bash
dblab clone update CLONE_ID
```

```
{
    "id": "CLONE_ID",
    "protected": false,
}
```

Also, clones can marked as protected at creation time. See [Create a clone](/docs/guides/cloning/create-clone).

## Related
- Guide: [Destroy a clone](/docs/guides/cloning/destroy-clone)
