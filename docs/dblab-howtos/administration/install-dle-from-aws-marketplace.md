---
title: How to install DBLab using the AWS Marketplace
sidebar_label: Install DBLab from AWS Marketplace
---

<p align="center">
    <img src="/assets/dle-for-aws-marketplace.png" alt="DBLab Engine and AWS Marketplace"/>
</p>

If you're using AWS, [installing DBLab from the AWS Marketplace](https://bit.ly/dleawsmarketplace) is the fastest way to have powerful database branching for any database, including RDS and RDS Aurora. But not only RDS: any Postgres and Postgres-compatible source is supported as a source for DBLab.

:::info
Currently, only the "logical" mode of data retrieval (dump/restore) is supported – the only available method for managed PostgreSQL cloud services such as RDS Postgres, RDS Aurora Postgres, Azure Postgres, or Heroku. "Physical" mode is not yet supported by the module, but it will be in the future. More about [various data retrieval options for DBLab](/docs/dblab-howtos/administration/data).
:::

:::note
Check out the DBLab installation tutorial:
[Database Lab tutorial for Amazon RDS](/docs/tutorials/database-lab-tutorial-amazon-rds)
:::

## Prerequisites
- [AWS cloud account](https://aws.amazon.com)
- SSH client (available by default on Linux and MacOS; Windows users: consider using [PuTTY](https://www.putty.org/))
- A key pair already generated for the AWS region that we are going to use during the installation. Both RSA or ed25519 will work. If you're not familiar with the process of creation a key pair in AWS, read their documentation: ["Create key pairs"](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html).

## Steps to install DBLab Engine from AWS Marketplace
The first steps are trivial:
- Log in into AWS: https://console.aws.amazon.com/
- Open [the DBLab on AWS Marketplace page](https://bit.ly/dleawsmarketplace)

And then press the "Continue..." buttons a couple of times:
<p align="center">
    <img src="/assets/dle-aws/AWS_DLE_3.2_step1.png" alt="DBLab Engine in AWS Marketplace: step 1" /><br />
    <img src="/assets/dle-aws/AWS_DLE_3.2_step2.png" alt="DBLab Engine in AWS Marketplace: step 2" />
</p>

Now check that the DBLab Engine version (the latest is recommended) and the AWS regions are chosen correctly, then press "Continue to Launch":
<p align="center">
    <img src="/assets/dle-aws/AWS_DLE_3.2_step3.png" alt="DBLab Engine in AWS Marketplace: step 3" />
</p>

On this page you need to choose "Launch CloudFormation" and press "Launch":
<p align="center">
    <img src="/assets/dle-aws/AWS_DLE_3.2_step4.png" alt="DBLab Engine in AWS Marketplace: step 4" />
</p>

This page should be left unmodified, just press the "Next" button:
<p align="center">
    <img src="/assets/dle-aws/AWS_DLE_3.2_step5.png" alt="DBLab Engine in AWS Marketplace: step 5" />
</p>

Now it is time to fill the form that defines the AWS resources that we need:
- EC2 instance type and size – it defines the hourly price for "compute" (see [the full price list](https://postgres.ai/pricing#aws-pricing-details));
- subnet mask to restrict connections (for testing, you can use `0.0.0.0/0`; for production use, restrict connections wisely);
- VPC and subnet – you can choose any of them if you're testing DBLab for some database which is publicly available (the only thing to remember: subnet belongs to a VPC, so make sure they match); for production database, you need to choose those options that will allow DBLab to connect to the source for the successful data retrieval process;
- choose your AWS key pair (has to be created already).
<p align="center">
    <img src="/assets/dle-aws/AWS_DLE_3.2_step6new.png" alt="DBLab Engine in AWS Marketplace: step 6" />
</p>

Next, on the same page:
- define the size of EBS volume that will be created (you can find pricing calculator here: ["Amazon EBS pricing"](https://aws.amazon.com/ebs/pricing/)):
    - put as many GiB as roughly your database has (it is always possible to add more space without downtime),
    - define how many snapshots you'll be needed (minimum 2);
- define secret token (at least 9 characters are required!) – it will be used to communicate with DBLab API, CLI, and UI.

Then press "Next".

<p align="center">
    <img src="/assets/dle-aws/AWS_DLE_3.2_step7.png" alt="DBLab Engine in AWS Marketplace: step 7" />
</p>

This page should be left unmodified, just press the "Next" button:

<p align="center">
    <img src="/assets/dle-aws/AWS_DLE_3.2_step8.png" alt="DBLab Engine in AWS Marketplace: step 8" />
</p>

At the bottom of the next page acknowledge that AWS CloudFormation might create IAM resources. Once you've pressed "Create stack", the process begins.

<p align="center">
    <img src="/assets/dle-aws/AWS_DLE_3.2_step9.png" alt="DBLab Engine in AWS Marketplace: step 9" />
</p>

You need to wait a few minutes, while all resources are provisioned and DBLab setup is complete. Check out the "Outputs" section – once DBLab API and UI are ready, you'll see the ordered list of instructions on how to connect to UI and API.

Note that the initial data retrieval can be long – it depends on the size of the source database(s). However, DBLab API, CLI, and UI are available for use while it's happening. And once the retrieval is finished, DBLab is ready for use. Happy cloning!

## Setup demonstration
<div class="embed-responsive embed-responsive-4by3 mb-4">
  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/z5XSR8xbe-Q?autoplay=0&origin=https://postgres.ai&modestbranding=1&playsinline=0&loop=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Troubleshooting
To troubleshoot:
- Use SSH to connect to the EC2 instance
- Check the containers that are running: `sudo docker ps`
- Check the DBLab Engine container's logs: `sudo docker logs dblab_server`
- If needed, check Postgres logs for the main branch. They are located in `/var/lib/dblab/dblab_pool/dataset_1/data/log` for the first snapshot of the database, in ``/var/lib/dblab/dblab_pool/dataset_2/data/log` for the second one (if it's already fetched); if you've configured DBLab to have more than 2 snapshots, check out the other directories too (`/var/lib/dblab/dblab_pool/dataset_$N/data/log`, where `$N` is the snapshot number, starting with `1`)

## Getting support
With DBLab installed from AWS Marketplace, guaranteed vendor support is included – please use [one of the available ways to contact](https://postgres.ai/contact).
