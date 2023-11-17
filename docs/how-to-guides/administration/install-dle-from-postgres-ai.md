---
title: How to install DBLab using the Postgres.ai Console
sidebar_label: Install DBLab from Postgres.ai Console
---

Use [the Postgres.ai Console](https://console.postgres.ai/) for an easy and quick installation of DBLab. Following the steps below, in a few minutes, you will get:
- A single DBLab Standard Edition (DBLab SE) installed in your infrastructure (Postgres.ai does not have access to it)
- Additional components such as monitoring
- Ready-to-use, well-tested, vendor-supported Postgres images for DBLab that are compatible with your source databases located in popular managed Postgres services like RDS, CloudSQL, Supabase, and Heroku
- A DBLab SE subscription with guaranteed vendor support

The DBLab SE pricing model is simple:
1. For resources (VM, disk), direct payment is made to your cloud provider unless these resources are already owned.
1. For the DBLab SE license, payment is made to Postgres.ai, billed hourly through Stripe. This fee is based on the "compute" size of your instance, which is determined by CPU and RAM, and *does not depend on the database size*. Detailed information can be found on [the Pricing page](https://postgres.ai/pricing). Note that this cost is generally less than AWS EC2 pricing. For example, for a small machine with 2 vCPUs and 8 GiB RAM, it is as low as $0.086/h (~$62.78 per month).

## Any database is compatible
DBLab SE supports instant cloning and database branching for source Postgres databases located anywhere:
- Managed Postgres services such as AWS RDS, Google CloudSQL, Heroku Postgres, DigitalOcean Postgres, Supabase, and Timescale Cloud
- Self-managed Postgres, either cloud-based or on-premises

## Choose any location for installation
The location of your DBLab can be chosen according to your preference. The installation can be either cloud-based or on-premises. Two primary installation options are available:
- **Create DBLab in your cloud**: this option, applicable for AWS, GCP, DigitalOcean, and Hetzner Cloud, includes resource provisioning such as VM and disk.
- **BYOM** (Bring Your Own Machine): for other clouds or on-premises installations, ensure that a VM with Ubuntu 22.04 is installed and a suitable disk is attached. The installation tool will take care of the rest.

:::note Option 1: Create DBLab in your cloud
This option applies to AWS, GCP, Digital Ocean, and Hetzner Cloud. It covers the provisioning of all necessary resources (VM and disk) and the installation of all software components, including DBLab.
:::

:::note Option 2: BYOM – Bring Your Own Machine
If your cloud vendor is not supported by Option 1 or if you are using an on-premises solution, this option is suitable. You will need a VM or physical machine with a sufficiently large disk and Ubuntu 22.04 installed. The setup tool will then install all necessary components, including DBLab.
:::

In both scenarios, your data remains securely within your infrastructure.

## Prerequisites
- Sign up for an account at https://console.postgres.ai/, using one of four supported methods: Google, LinkedIn, GitHub, GitLab
- [Create](https://console.postgres.ai/addorg) a new organization
- Inside your organization, go to the "Billing" section and add a new payment method:
   - press the "Edit payment methods" button,
   - you will see the Stripe portal – note it has the address `https://billing.stripe.com/...` (Postgres.ai partners with Stripe for simplified billing),
   - add your payment methods there and close the page.

## DBLab installation
The first steps are trivial:
- Go to "Database Lab / Instances"

And then press the "Create" button to deploy DBLab in your cloud:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step1.png" alt="Database Lab Engine in Database Lab Platform: step 1" />
</p>

Select your cloud provider and region:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step2.png" alt="Database Lab Engine in Database Lab Platform: step 2" />
</p>

Choose the instance type:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step3.png" alt="Database Lab Engine in Database Lab Platform: step 3" />
</p>

Choose the volume type and size:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step4.png" alt="Database Lab Engine in Database Lab Platform: step 4" />
</p>

:::note
In this example the database size is 100 GiB, we want to create 3 datasets to be able to create 3 snapshots, so the volume with size 300 GiB will be created.
:::

Provide a name for your DBLab instance:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step5.png" alt="Database Lab Engine in Database Lab Platform: step 5" />
</p>

Define DBLab verification token (a non-trivial, password-like value is recommended):
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step6.png" alt="Database Lab Engine in Database Lab Platform: step 6" />
</p>

:::note
You can use the "Generate random" button to generate a new unique token.
:::

Choose DBLab version:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step7.v2.png" alt="Database Lab Engine in Database Lab Platform: step 7" />
</p>

Provide SSH public keys:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step8.png" alt="Database Lab Engine in Database Lab Platform: step 8" />
</p>

:::note
These SSH public keys will be added to the DBLab server's  ~/.ssh/authorized_keys  file. Providing at least one public key is recommended to ensure access to the server after deployment.
:::

Review the specifications of the virtual machine, and click "Create":
<p align="left">
    <img src="/assets/dle-platform/Platform_DLE_step9.v2.png" alt="Database Lab Engine in Database Lab Platform: step 9" width="50%"/>
</p>

Select the installation method and follow the instructions to create server and install DLE SE:
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step10.v3.png" alt="Database Lab Engine in Database Lab Platform: step 10" />
</p>

:::note
To perform the initial deployment, a new temporary SSH key will be generated and added to the Cloud. After the deployment is completed, this key will be deleted and the SSH key that was specified in the "ssh_public_keys" variable will be added to the server.
:::

After running the deployment command, You need to wait a few minutes, while all resources are provisioned and DBLab setup is complete. Check out the "usage instructions" – once DBLab API and UI are ready, you'll see the ordered list of instructions on how to connect to UI and API.

Example:

```bash
TASK [deploy-finish : Print usage instructions] *****************************************************************************************************************************************************************
ok: [root@5.161.212.233] => {
    "msg": [
        "1) Use SSH port forwarding for UI / API / CLI:",
        "    ssh -o StrictHostKeyChecking=no -N -L 2346:127.0.0.1:2346 root@5.161.212.233",
        "",
        "2) DBLab UI: http://127.0.0.1:2346",
        "",
        "3) Verification token (ensure to securely store it):",
        "    edlhYHOgBPkr4ix1qP3YvQMytfK2JSxH",
        "",
        "4) DBLab API:",
        "  - API URL: http://127.0.0.1:2346/api",
        "  - API docs: https://api.dblab.dev/",
        "",
        "5) DBLab CLI:",
        "  - CLI ('dblab') setup:",
        "      export DBLAB_CLI_VERSION=3.5.0",
        "      curl -sSL dblab.sh | bash",
        "      dblab init --environment-id=dblab-demo --token=edlhYHOgBPkr4ix1qP3YvQMytfK2JSxH --url=http://127.0.0.1:2346/api",
        "  - CLI docs: https://cli-docs.dblab.dev/",
        "",
        "6) Monitoring:",
        "  - SSH port forwarding:",
        "      ssh -o StrictHostKeyChecking=no -N -L 19999:127.0.0.1:19999 root@5.161.212.233",
        "  - Monitoring URL: http://127.0.0.1:19999",
        "",
        "7) To connect to clones, also use SSH port forwarding. E.g., for clone 6000:",
        "    ssh -o StrictHostKeyChecking=no -N -L 6000:127.0.0.1:6000 root@5.161.212.233",
        "  - and then use: 'host=127.0.0.1 port=6000 user=YOUR_USER dbname=postgres'",
        "",
        "(Optional) To destroy the DBLab server (for CLOUD, except BYOM):",
        "  - add the 'state=absent' variable to the snippet you used for deploy the DBLab server.",
        "  - run the command again to delete the server."
    ]
}
```
:::note
Save the data from the "Print usage instructions" task, because the Postgres.ai Platform does not save this data on its side.
:::


## Open UI
First, set up SSH port forwarding for UI port 2346:
```bash
ssh -N -L 2346:127.0.0.1:2346 user@server-ip-address
```

Now UI should be available at http://127.0.0.1:2346
<p align="center">
    <img src="/assets/dle-platform/Platform_DLE_step11.v2.png" alt="Database Lab Engine in Database Lab Platform: step 11" />
</p>

:::note
Currently, configuring DBLab in UI allows config changes only for the "logical" mode of data retrieval (dump/restore) – the only available method for managed PostgreSQL cloud services such as RDS Postgres, RDS Aurora Postgres, Azure Postgres, or Heroku. "Physical" mode is not yet supported in UI but is still possible (thru SSH connection and [editing DBLab config file directly](/docs/how-to-guides/administration/engine-manage)). More about [various data retrieval options for DBLab](/docs/how-to-guides/administration/data).
:::

## Configure DBLab and run the first data retrieval
Proceed with configuration in UI as described here: https://postgres.ai/docs/tutorials/database-lab-tutorial#step-2-configure-dle-and-run-the-data-retrieval


## Troubleshooting
To troubleshot:
- Use SSH to connect to the DBLab server
- Check the containers that are running: `sudo docker ps`
- Check the DBLab container's logs: `sudo docker logs dblab_server`
- If needed, check Postgres logs for the main branch. They are located in `/var/lib/dblab/dblab_pool/dataset_1/data/log` for the first snapshot of the database, in ``/var/lib/dblab/dblab_pool/dataset_2/data/log` for the second one (if it's already fetched); if you've configured DBLab to have more than 2 snapshots, check out the other directories too (`/var/lib/dblab/dblab_pool/dataset_$N/data/log`, where `$N` is the snapshot number, starting with `1`)

## Getting support
With DBLab installed from Database Lab Platform, guaranteed vendor support is included – please use [one of the available ways to contact](https://postgres.ai/contact).
