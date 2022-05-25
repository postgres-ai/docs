---
title: DB Migration Checker
sidebar_label: Overview
hide_title: false
slug: /db-migration-checker
description: "Check DB migrations as a part of a standard pipeline"
keywords:
  - "DB migration in CI"
  - "Database Lab DB migration"
---

## Overview
DB Migration Checker is a DLE's component that enables integration with CI/CD tools to automatically test migrations in CI/CD pipelines.

## Key features
- **Automated:** DB migration testing in CI/CD pipelines
- **Realistic:** test results are realistic because real or close-to-real (the same size but no personal data) databases are used, thin-cloned in seconds, and destroyed after testing is done
- **Fast and inexpensive:** a single machine with a single disk can operate dozens of independent thin clones
- **Well-tested DB changes to avoid deployment failures:** DB Migration Checker automatically detects (and prevents!) long-lasting dangerous locks that could put your production systems down
- **Secure**: DB Migration Checker runs all tests in a secure environment: data cannot be copied outside the secure container
- **Lots of helpful data points**: Collect useful artifacts (such as `pg_stat_***` system views) and use them to empower your DB changes review process

## How to set up a DB migration checker
- Make sure that the Database Lab Engine is running
- Copy the example configuration file [`config.example.ci_checker.yml`](https://gitlab.com/postgres-ai/database-lab/-/blob/master/engine/configs/config.example.ci_checker.yml) from the Database Lab Engine repository to `~/.dblab/ci_checker/configs/ci_checker.yml`:

  ```bash
  mkdir -p ~/.dblab/ci_checker/configs

  curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/engine/configs/config.example.ci_checker.yml \
    --output ~/.dblab/ci_checker/configs/ci_checker.yml
  ```

- Configure the DB migration checker file `ci_checker.yml`. See the [DB Migration Checker configuration reference](https://postgres.ai/docs/reference-guides/db-migration-checker-configuration-reference).

- Launch DB migration checker
    ```bash
    sudo docker run \
      --name dblab_ci_checker \
      --label dblab_control \
      --detach \
      --restart on-failure \
      --publish 2500:2500 \
      --volume /var/run/docker.sock:/var/run/docker.sock \
      --volume /tmp/ci_checker:/tmp/ci_checker \
      --volume ~/.dblab/ci_checker/configs:/home/dblab/configs:ro \
      --env DOCKER_API_VERSION=1.41 \
      postgresai/dblab-ci-checker:3.1.1
    ```

- [optional] Run the [localtunnel](https://github.com/localtunnel/localtunnel) (or an analog) - use it only for debug purposes to make DB migration instance accessible for a CI pipeline
  `lt --port 2500`

- Prepare a new repository with your DB migrations(Flyway, Sqitch, Liquibase, etc.)
  - add secrets:
    - `DLMC_CI_ENDPOINT` - an endpoint of your Database Lab Migration Checker service. For example, `https://ci-checker.example.com/`, or in case of debug the endpoint given from the localtunnel.
    - `DLMC_VERIFICATION_TOKEN` - verification token for the Database Lab Migration Checker API 

- Configure a new workflow in the created repository (see an [example of configuration](https://github.com/postgres-ai/green-zone/blob/master/.github/workflows/main.yml))
  - add a custom action: https://github.com/marketplace/actions/database-lab-realistic-db-testing-in-ci
  - provide input params for the action (the full list of [available input params](#available-input-params))
  - provide environment variables:
    - DLMC_CI_ENDPOINT - use a CI Checker endpoint from the repository secrets
    - DLMC_VERIFICATION_TOKEN - use a verification token from the repository secrets

- Push a commit to the repository


## How it works
After configuring all components, the repository is ready to start a CI workflow. Receiving a push event, GitHub starts the workflow with the Database Lab DB migration action.
The Database Lab DB migration action makes a request to the DB migration checker.
The DB migration checker requests the DLE to create a new clone, start a new container with migration tools and, then runs commands from the GitHub action against this clone.

Take a look at the communication scheme
![Communication scheme of DB migration service](/assets/db-migration-checker/db-migration-service.png)

## Available input params
- `commands` (list, required) - list of commands to run needed database migrations'
- `dbname` (string, optional, default: "") - database that the workflow is running with
- `migration_envs` (list, optional) - list of environment variables that will be set during migrations running
- `download_artifacts` (string, optional, default: "false") - option that allows choosing whether to store artifacts
- `observation_interval` (string, optional, default: 10) - interval of metric gathering and output (in seconds)
- `max_lock_duration` (string, optional, default: 10) - maximum allowed duration for locks (in seconds)
- `max_duration` (string, optional, default: "3600") - maximum allowed duration for observation (in seconds)



## Supported DB migration tools:
 - [Sqitch](https://sqitch.org/) (Example: https://github.com/agneum/runci)
 - [Flyway](https://flywaydb.org/) (Example: https://github.com/postgres-ai/dblab-ci-test-flyway)
 - [Liquibase](https://www.liquibase.org/) (Example: https://github.com/postgres-ai/dblab-ci-test-liquibase)
 - [Ruby on Rails: Active Record Migrations (`rake db:migrate`)](https://ruby.github.io/rake/)
 - [Django migrations](https://docs.djangoproject.com/en/3.2/topics/migrations/#)

There are [prepared Docker images with DB migration tools](https://hub.docker.com/r/postgresai/migration-tools)

### How to extend
Proposals to extend this list are welcome in the project repository: https://gitlab.com/postgres-ai/custom-images.

:::tip
If needed, you can specify any custom Docker image with a DB migration tool in the Database Lab Migration Checker configuration. 
There is one requirement: such an image must remain running during the execution of all commands.

Use [these Dockerfiles](https://gitlab.com/postgres-ai/custom-images/-/tree/master/migration-tools) as examples. You can extend or modify it for your needs.
:::
