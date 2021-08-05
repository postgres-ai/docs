---
title: How to install Database Lab with Terraform on AWS
sidebar_label: Install Database Lab with Terraform
---

<p align="center">
    <img src="/assets/install-dl-with-terraform.png" alt="Database Lab + Terraform"/>
</p>

The most convenient and fastest way to install the Database Lab Engine (DLE) and other Database Lab Platform components are using our [Terraform Module](https://gitlab.com/postgres-ai/database-lab-infrastructure). Your source PostgreSQL database can be located anywhere. DLE and other components will be created under your AWS account on an EC2 instance.

:::info
Currently, only the "logical" mode of data retrieval (dump/restore) is supported – the only available method for managed PostgreSQL cloud services such as RDS Postgres, RDS Aurora Postgres, Azure Postgres, or Heroku. "Physical" mode is not yet supported by the module, but it will be in the future. More about [various data retrieval options for DLE](/docs/how-to-guides/administration/data).
:::

:::note
Manual installation guides:
- [Database Lab tutorial for any PostgreSQL database](/docs/tutorials/database-lab-tutorial)
- [Database Lab tutorial for Amazon RDS](/docs/tutorials/database-lab-tutorial-amazon-rds)
:::

## Prerequisites
- [AWS cloud account](https://aws.amazon.com)
    - You must have AWS Access Keys and a default region in your Terraform environment. To successfully run this Terraform module, the IAM User/Role must have the following permissions:
        * Read/Write permissions on EC2
        * Read/Write permissions on Route53
        * Read/Write permissions on Cloudwatch
    - The DLE runs on an EC2 instance which can be accessed using a selected set of SSH keys uploaded to EC2. Use the Terraform parameter `aws_keypair` to specify which EC2 Keypair to use
    - AWS [Route 53](https://aws.amazon.com/route53/) Hosted Zone (For setting up TLS) for a domain or sub-domain you control
- [Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli)
    - Minimum version: 1.0
    - :construction: Currently, it is supposed that you run `terraform` commands on a Linux machine (macOS and Windows support planned, but not yet implemented)

## Install Database Lab components using Terraform
The following steps were tested on Ubuntu 20.04 but should be valid for other Linux distributions without significant modification.

### 1. Install Terraform (optional)
1. SSH to any machine with internet access, it will be used as deployment machine.
1. Install Terraform CLI (see the [official guide](https://learn.hashicorp.com/tutorials/terraform/install-cli)). Example for Ubuntu:
```shell
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl 
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"  # Adjust if you have ARM platform.
sudo apt-get update && sudo apt-get install terraform
# Verify installation.
terraform -help
```

### 2. Get and configure Database Lab Terraform Module
:::note
The module will be available using Terraform Registry soon, though you can clone [module's Git repository](https://gitlab.com/postgres-ai/database-lab-infrastructure) and adjust the code for your needs.
:::

1. Get our Terraform Module for Database Lab using Git:
```shell
git clone https://gitlab.com/postgres-ai/database-lab-infrastructure.git
cd database-lab-infrastructure/
```

:::note
- To configure parameters used by Terraform (and the Database Lab Engine itself), you will need to modify `terraform.tfvars` and create a `secret.tfvars` file with secrets
- The variables can be set in multiple ways with the following precedence order (lowest to highest):
    - values passed on the command line
    - values defined in `terraform.tfvars`
    - default values in `variables.tf`
- All variables starting with `postgres_` represent the source database connection information for the data (from that database) to be fetched by the DLE. That database must be accessible from the instance hosting the DLE (that one created by Terraform)
:::

2. Edit `terraform.tfvars` file. Variables which values start with `YOUR_` are required to configure for your deployment, others are optional.
```config
dle_version_full = "2.4.1"

aws_ami_name = "DBLABserver*"
aws_keypair = "YOUR_AWS_KEYPAIR" # e.g. "johndoe"

aws_deploy_region = "us-east-1"
aws_deploy_ebs_availability_zone = "us-east-1a"
aws_deploy_ec2_instance_type = "t2.large"
aws_deploy_ec2_instance_tag_name = "DBLABserver-ec2instance"
aws_deploy_ebs_size = "YOUR_INSTANCE_DISK_SIZE" # e.g. "40".
aws_deploy_ebs_type = "gp2"
aws_deploy_allow_ssh_from_cidrs = ["0.0.0.0/0"]
aws_deploy_dns_zone_name = "YOUR_HOSTED_ZONE" # e.g. "mycompany.com".
aws_deploy_dns_api_subdomain = "dle-tf-test" # Requires Route 53 hosted zone setup.

# Data source. You can choose one of two options:
#    - direct connection to source DB (source_type = "postgres")
#    - dump stored on AWS S3 (source_type = "s3")

# Option 1 – direct Postgres connection.
source_type = "postgres"
source_postgres_version = "YOUR_POSTGRES_VERSION" # e.g. "13".
source_postgres_host = "YOUR_POSTGRES_HOST" # e.g. "ec2-3-215-57-87.compute-1.amazonaws.com".
source_postgres_port = "YOUR_POSTGRES_PORT" # e.g. "5432".
source_postgres_dbname = "YOUR_POSTGRES_DBNAME" # e.g. "postgres".
source_postgres_username = "YOUR_POSTGRES_USERNAME" # e.g. "postgres".

# Option 2 – dump on S3.
# Important: your AWS user has to be able to create IAM roles
# to work with S3 buckets in your AWS account.
# source_type = "s3" # source is dump stored on demo s3 bucket
# source_pgdump_s3_bucket = "YOUR_S3_BUCKET" # e.g. tf-demo-dump", this is an example public bucket.
# source_pgdump_path_on_s3_bucket = "YOUR_PGDUMP_FILENAME" # e.g. "heroku.dmp", this is an example dump from demo database.

dle_debug_mode = "true"
dle_retrieval_refresh_timetable = "0 0 * * 0"

# Include all libraries your installation are using.
# Database Lab DB Migration Checker requires "logerrors" extension.
postgres_config_shared_preload_libraries = "pg_stat_statements,logerrors"

platform_project_name = "aws_test_tf"
```

3. Create `secret.tfvars` containing `platform_access_token`, `source_postgres_password`, and `vcs_github_secret_token`. An example:
```config
# Database Lab Platform.
# Open https://console.postgres.ai/, choose your organization,
# then "Access tokens" in the left menu, generate token under "Add token"
# section, "Personal token" should be unchecked.
platform_access_token = "YOUR_PLATFORM_ACCESS_TOKEN"

# Postgres password, set only if you are using a direct Postgres connection.
source_postgres_password = "YOUR_POSTGRES_PASSWORD"

# GitHub token. To generate, open https://github.com/settings/tokens/new.
vcs_github_secret_token = "YOUR_VCS_SECRET_TOKEN"
```

4. Set environment variables with AWS credentials:
```shell
# Browse to AWS Console / My security credentials / Access keys for CLI, SDK, & API access.
# Create or use existing Access Key.
# Link: https://console.aws.amazon.com/iam/home#/security_credentials?credentials=iam
export AWS_ACCESS_KEY_ID="YOUR_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
```

### 3. Run deployment
1. Initialize Terraform working directory:
```shell
terraform init
```
1. Deploy:
```shell
terraform apply -var-file="secret.tfvars" -auto-approve
```
1. If everything goes well, you should get an output like this:
```config
vcs_db_migration_checker_verification_token = "gsio7KmgaxECfJ80kUx2tUeIf4kEXZex"
dle_verification_token = "zXPodd13LyQaKgVXGmSCeB8TUtnGNnIa"
ec2_public_dns = "ec2-11-111-111-11.us-east-2.compute.amazonaws.com"
ec2instance = "i-0000000000000"
ip = "11.111.111.11"
platform_joe_signing_secret = "lG23qZbUh2kq0ULIBfW6TRwKzqGZu1aP"
public_dns_name = "demo-api-engine.aws.postgres.ai"  # todo: this should be URL, not hostname – further we'll need URL, with protocol – `https://`
```
1. To verify the result and check the progress, you might want to connect to the just-created EC2 machine using the IP address or hostname from the Terraform output. In our example, it can be done using this one-liner:
```shell
echo "sudo docker logs dblab_server -f" | ssh ubuntu@18.118.126.25 -i postgres_ext_test.pem
```

    DLE server started successfully and is waiting for your commands if you see a message like:

```
2021/07/02 10:28:51 [INFO]   Server started listening on :2345.
```

:::note
You can find more about DLE logs and configuration on [this page](/docs/how-to-guides/administration/engine-manage).
:::

### 4. Set up Database Lab Platform
:::note
🚀 We are working on the automation of this step, the auto-registration feature will be available soon.
:::

 1. Sign in to the [Postgres.ai Platform](https://console.postgres.ai/) and register your new DLE server:
    1. Go to `Database Lab / Instances` in the left menu.
    1. Press the `Add instance` button.
    1. `Project` – specify any name (this is how your DLE server will be named in the platform).
    1. `Verification token` – use the token generated above (`verification_token` value); do NOT press the "Generate" button here!
    1. `URL` – use the value generated above.
    1. Click the `Verify URL` button to check the connectivity. Then click the `Add` button to register the DLE instance. If everything is right, you should see the DLE page with green "OK" status.
 1. Add Joe chatbot for efficient SQL optimization workflow:
    1. Go to the `SQL Optimization / Ask Joe` page using the left menu, click the `Add instance` button, specify the same project as you defined in the previous step.
    1. `Signing secret` – use `platform_joe_signing_secret` from the Terraform output.
    1. `URL` – use `public_dns_name` values from the Terraform output with port `444`; in our example, it's `https://demo-api-engine.aws.postgres.ai:444`.
    1. Click the `Verify URL` button to check the connectivity and then click the `Add` button to register the Joe instance.

    Now you can start using Joe chatbot for SQL execution plans troubleshooting and verification of optimization ideas. As a quick test, go to `SQL Optimization / Ask Joe` in the left menu, select the instance, and enter `\dt+` command (a psql command to show the list of tables with sizes). You should see how Joe created a thin clone behind the scenes and immediately ran this psql command, presenting the result to you.

### 5. Set up Database Migration Checker
1. Prepare a repository with your DB migrations (Flyway, Sqitch, Liquibase, etc.)
1. Add secrets:
  - `DLMC_CI_ENDPOINT` - an endpoint of your Database Lab Migration Checker service – use `vcs_db_migration_checker_registration_url` from the Terraform output
  - `DLMC_VERIFICATION_TOKEN` - verification token for the Database Lab Migration Checker API – use `vcs_db_migration_checker_verification_token` from the Terraform output
1. Configure a new workflow in the created repository (see an example of configuration: https://github.com/postgres-ai/green-zone/blob/master/.github/workflows/main.yml)
  - add a custom action: https://github.com/marketplace/actions/database-lab-realistic-db-testing-in-ci
  - provide input params for the action (the full list of available input params)
  - provide environment variables:
    - `DLMC_CI_ENDPOINT` - use a CI Checker endpoint from the repository secrets
    - `DLMC_VERIFICATION_TOKEN` - use a verification token from the repository secrets

### 6. Install and try the client CLI (`dblab`)
1. Follow the [guide](https://postgres.ai/docs/how-to-guides/cli/cli-install-init) to install Database Lab CLI
1. Initialize CLI:
```shell
dblab init --environment-id=<ANY NAME FOR ENVIRONMENT> --url=https://<public_dns_name> --token=<your_personal_token_from_postgres_ai_platform>
```
1. Try it:
```shell
dblab instance status
```
It should return the OK status:
```json
{
    "status": {
        "code": "OK",
        "message": "Instance is ready"
    },
    ...
}
```

## Important Note
When the DLE creates new database clones, it makes them available on incremental ports in the 6000 range (e.g. 6000, 6001, ...). The DLE CLI will also report that the clone is available on a port in the 6000 range.  However, please note that these are the ports when accessing the DLE from `localhost`. This Terraform module deploys [Envoy](https://www.envoyproxy.io/) to handle SSL termination and port forwarding to provide connection to the clones provisioned by the DLE.

Bottom Line: When connecting to clones, add `3000` to the port number reported by the DLE CLI to connect to the clone. for example, if the CLI reports that a new clone is available at port `6001` connect that clone at port `9001`.

## Known Issues
### Certificate Authority Authorization (CAA) for your Hosted Zone
Depending on your DNS provider and configuration, you may need to create a CAA record in your hosted zone.vOn instance creation, this Terraform module will use [Let's Encrypt](https://letsencrypt.org/) to generate a valid SSL Certificate. For that to succeed, Let's Encrypt must be recognized as a valid issuing CA by your domain.  To do this, add a DNS record that looks like this:

```
Domain Record  type  Value
example.com.   CAA   0 issue "letsencrypt.org"
```

## Troubleshooting
You can get help deploying the DLE. Here are two great ways to do this:
- Join the [Database Lab Community Slack](https://database-lab-team.slack.com)
- Reach out to the Postgres.ai team on [Intercom chat widget](https://postgres.ai/) (located at the bottom right corner)

## Reporting Issues & Contributing
We want to make deploying and managing the Database Lab Engine as easy as possible! Please report bugs
and submit feature ideas using Gitlab's [Issue feature](https://gitlab.com/postgres-ai/database-lab-infrastructure/-/issues/new).
