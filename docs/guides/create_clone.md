---
title: Create a Database Lab clone
---

<!--DOCUSAURUS_CODE_TABS-->
<!--GUI-->
1. Go to **Database Lab instance** page.
1. Click the **Create clone** button.
  ![Database Lab engine page / Create clone](/docs/assets/guides/create_clone_1.png)
1. Fill **ID** field with a meaningful name.
1. (optional) By default latest data snapshot (closest to production state) will be use to provision a clone. You can select any other available snapshot.
1. Fill **database credentials**. Remember the password it will not be available later, but you will need to use it to connect to the clone.
1. Click the **Create clone** button and wait for clone to provision.
![Database Lab engine clone creation page](/docs/assets/guides/create_clone_2.png)
1. You will be redirected on **Database Lab clone** page.
  ![Database Lab engine clone page](/docs/assets/guides/create_clone_3.png)
<!--CLI-->
Use [`dblab clone create`](/docs/database-lab/6_cli_reference#subcommand-create) command.
<!--END_DOCUSAURUS_CODE_TABS-->

## Related
- Guide: [Connect to a clone](/docs/guides/connect_clone)
- Guide: [Destroy a clone](/docs/guides/destroy_clone)

[↵ Back to Guides](/docs/guides/)
