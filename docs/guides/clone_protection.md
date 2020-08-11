---
title: Clone protection from manual and automatic deletion
---

Database Lab clones could be protected from manual and automatical deletion by enabling the **protected** status of a clone. When enabled no one can delete this clone and automated deletion is also disabled.

> Database Lab automatically deletes idle unprotected clones after an idle interval defined in the configuration 

> Please be careful: abandoned protected clones may cause out-of-disk-space events. Check disk space on a daily basis and delete protected clones once the work is done.

<!--DOCUSAURUS_CODE_TABS-->
<!--GUI-->
From the **Database Lab clone** page enable or disable the **Enable deletion protection** checkbox.
  ![Database Lab engine page / Create clone](/docs/assets/guides/clone_protection_1.png)
<!--CLI-->
Use [`dblab clone update --protected CLONE_ID`](/docs/database-lab/6_cli_reference#subcommand-update) command.
<!--END_DOCUSAURUS_CODE_TABS-->

Also, clones could be made protected during clone creation. See [Create clone](/docs/guides/create_clone) guide.

## Related
- Guide: [Destroy a clone](/docs/guides/destroy_clone)

[↵ Back to Guides](/docs/guides/)
