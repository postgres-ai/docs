---
title: How to install DLE from the AWS Marketplace
sidebar_label: Install DLE from the AWS Marketplace
---

<p align="center">
    <img src="/assets/dle-for-aws-marketplace.png" alt="Database Lab Engine and AWS Marketplace"/>
</p>

If you're using AWS, [installing DLE from the AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec) is the fastest way to have powerful database branching for any database, including RDS and RDS Aurora. But not only RDS: any Postgres and Postgres-compatible source is supported as a source for DLE.

:::info
AWS Marketplace version of DLE is currently in preview – you can see it checking the version – it contains the `preview` suffix (e.g., `3.1.1-aws2-preview`). There are certain limitations as described in [the blog post](/blog/20220701-dle-in-aws-marketplace). When the GA version will be published in AWS Marketplace, it will come without `preview` suffix.
:::

:::info
Currently, only the "logical" mode of data retrieval (dump/restore) is supported – the only available method for managed PostgreSQL cloud services such as RDS Postgres, RDS Aurora Postgres, Azure Postgres, or Heroku. "Physical" mode is not yet supported by the module, but it will be in the future. More about [various data retrieval options for DLE](/docs/how-to-guides/administration/data).
:::

:::note
Manual installation guides:
- [Database Lab tutorial for any PostgreSQL database](/docs/tutorials/database-lab-tutorial)
- [Database Lab tutorial for Amazon RDS](/docs/tutorials/database-lab-tutorial-amazon-rds)
- [How to install Database Lab with Terraform on AWS](docs/how-to-guides/administration/install-database-lab-with-terraform)
:::

## Prerequisites
- [AWS cloud account](https://aws.amazon.com)
- SSH client (available by default on Linux and MacOS; Windows users: consider using [PuTTY](https://www.putty.org/))
- A key pair already generated for the AWS region that we are going to use during the installation. Both RSA or ed25519 will work. If you're not familiar of the process of creation a key pair in AWS, read their documentation: ["Create key pairs"](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html).

## Stepps to install Database Lab Engine from AWS Marketplace
The first steps are trivial:
- Log in into AWS: https://console.aws.amazon.com/
- Open the DLE on AWS Marketplace page: [aws.databaselab.io](https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec)

And then press the "Continue..." buttons a couple of times:
<p align="center">
    <img src="/assets/dle-aws/dle_aws_step01.png" alt="Database Lab Engine in AWS Marketplace: step 1" /><br />
    <img src="/assets/dle-aws/dle_aws_step02.png" alt="Database Lab Engine in AWS Marketplace: step 2" />
</p>

Now check that the DLE version (the latest is recommended) and the AWS regions are chosen correctly, then press "Continue to Launch":
<p align="center">
    <img src="/assets/dle-aws/dle_aws_step03.png" alt="Database Lab Engine in AWS Marketplace: step 3" />
</p>

On this page you need to choose "Launch CloudFormation" and press "Launch":
<p align="center">
    <img src="/assets/dle-aws/dle_aws_step04.png" alt="Database Lab Engine in AWS Marketplace: step 4" />
</p>

This page should be left unmodified, just press the "Next" button:
<p align="center">
    <img src="/assets/dle-aws/dle_aws_step05.png" alt="Database Lab Engine in AWS Marketplace: step 5" />
</p>

Now it's time to choose the type and size of the EC2 instance (it will define the hourly price you'll pay), and then start filling the form to configure your Database Lab Engine:
- the size of the disk;
- subnet mask to restrict connections (for testing, you can use `0.0.0.0/0`; for production use, restrict connections wisely);
- VPC and subnet – you can choose any of them if you're testing DLE for some database which is publicly available; for production database, you need to choose those options that will allow DLE to connect to the source for the successful data retrieval process.
<p align="center">
    <img src="/assets/dle-aws/dle_aws_step06.png" alt="Database Lab Engine in AWS Marketplace: step 6" />
</p>

Next, on the same page:
- choose your AWS key pair (has to be created already);
- fill the parameters for TLS certificate or leave the fields empty if you don't need it (good for testing);
- configure the schedule for full refresh (more about it: ["Full refresh for 'logical' mode"](https://postgres.ai/docs/how-to-guides/administration/logical-full-refresh)) – it is to be defined in crontab format, for example, `0 1 * * *` means "every day at 1 a.m." (a good editor: [crontab.guru](https://crontab.guru/));
- number of pg_dump jobs – for better speed, use the number of vCPUs on the source machine, unless you don't want to overload it;
- define secret token (at least 9 numbers!), it will be used to communicate with DLE API, CLI, and UI;
- set debug mode to true (good for testing) or false, it will define the level of DLE log verbosity.
<p align="center">
    <img src="/assets/dle-aws/dle_aws_step07.png" alt="Database Lab Engine in AWS Marketplace: step 7" />
</p>

Now it's time to define DB credentials of the source – this is how DLE will be initialized, performing the very first data retrieval, and then the same parameters will be used for scheduled full refreshes. The last two parameters on the form are:
- the value of [`shared_preload_libraries`](https://postgresqlco.nf/doc/en/param/shared_preload_libraries/) – it is a CSV list of Postgres extensions (the minimal recommended value is `pg_stat_statements,auto_explain,logerrors`), and
- CSV list of the databases to copy from the source.
<p align="center">
    <img src="/assets/dle-aws/dle_aws_step08.png" alt="Database Lab Engine in AWS Marketplace: step 8" />
</p>

Once you've pressed "Next", the process begins!

You need to wait a few minutes, while all resources are provisioned and DLE setup is complete. Check out the "Outputs" section – once DLE API and UI are ready, you'll see the ordered list of instructions on how to connect to UI and API.

Note that the initial data retrieval can be long – it depends on the size of the source database(s). However, DLE API, CLI, and UI are available for use while it's happening. And once the retrieval is finished, DLE is ready for use. Happy cloning!

## Setup demonstration
<div class="embed-responsive embed-responsive-4by3 mb-4">
  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/kaUSrANXec4?autoplay=0&origin=https://postgres.ai&modestbranding=1&playsinline=0&loop=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Troubleshooting
To troubleshot:
- Use SSH to connect to the EC2 instance
- Check the containers that are running: `sudo docker ps`
- Check the DLE container's logs: `sudo docker logs dblab_server`
- If needed, check Postgres logs for the main branch. They are located in `/var/lib/dblab/dblab_pool/dataset_1/data/log` for the first snapshot of the database, in ``/var/lib/dblab/dblab_pool/dataset_2/data/log` for the second one (if it's already fetched); if you've configured DLE to have more than 2 snapshots, check out the other directories too (`/var/lib/dblab/dblab_pool/dataset_$N/data/log`, where `$N` is the snapshot number, starting with `1`)

## Getting support
With DLE installed from AWS Marketplace, guaranted vendor support is included – please use [one of the available ways to contact](https://postgres.ai/contact).
