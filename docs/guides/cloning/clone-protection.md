---
title: Protect clones from manual and automatic deletion
---

[↵ Back to Cloning guides](/docs/guides/cloning)

Database Lab clones could be protected from manual and automatical deletion by enabling the **protected** status of a clone. When enabled no one can delete this clone and automated deletion is also disabled.

> Database Lab automatically deletes idle unprotected clones after an idle interval defined in the configuration 

> Please be careful: abandoned protected clones may cause out-of-disk-space events. Check disk space on a daily basis and delete protected clones once the work is done.

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

Also, clones could be made protected during clone creation. See [Create clone](/docs/guides/cloning/create-clone) guide.

## Related
- Guide: [Destroy a clone](/docs/guides/cloning/destroy-clone)

[↵ Back to Cloning guides](/docs/guides/cloning)
