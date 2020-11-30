---
title: Database Lab Platform onboarding checklist
sidebar_label: Platform onboarding checklist
keywords:
  - "Database Lab Platform onboarding"
  - "Start using Database Lab Engine"
description: In this document, we will cover tasks that you can start with to work with the Database Lab Platform.
---

## Onboarding
Welcome aboard! :rocket:
To start using the Postgres.ai Platform you need to register with your work account/email here: https://postgres.ai/signin.

:::note
You can copy [the Markdown version of this page](https://gitlab.com/postgres-ai/docs/-/blob/master/docs/tutorials/onboarding.md) and use it as a GitHub or GitLab issue with interactive checkboxes.
:::

## Joe Web UI
First, try using the basic features:
- [ ] Create a clone using Joe Web UI: go to `SQL Optimization / Ask Joe`, select an instance and type
- [ ] Try to run EXPLAIN for the query you've been working on recently and optimize it, e.g. create an index.
- [ ] Explore SQL optimization knowledge base: go to `SQL optimization / History` and choose the Joe session you've been working on. All commands and related metrics ran with Joe stored here, also, from the command details page you can explore EXPLAIN plain visualization without copy-pasting to external services. Secure and convenient.

## postgres-checkup reports
- [ ] Explore postgres-checkup reports: go to `Checkup / Reports` and choose any report and section, e.g. `K003 Top-50 Queries by total_time`, which may be helpful for discovering the most loaded queries in your database.

## Database Lab GUI, API, and CLI
If you have access to the production:
- [ ] Ask your administrator to add SSH / GPG keys or OS login to be able to connect to the machine. Also, you will need to know the Database Lab Engine hostname (URL), and the database name (DBNAME). Ask your organization administrator for the details.
- [ ] Create a personal token (you will need it for connection to Database Lab instance): go to `Settings / Access tokens` and add your personal token.
- [ ] Install Database Lab CLI:
```bash
curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/scripts/cli_install.sh | bash
dblab init --environment-id ENV_ID --url URL --token YOUR_PERSONAL_TOKEN
```
- [ ] Create a clone using CLI (define any secure USERNAME and PASSWORD):
```bash
dblab clone create --username USERNAME --password PASSWORD
```
- [ ] Create an SSH tunnel to the machine, allowing to work with remote Postgres clone using -h localhost -p 6XXX – pay attention to the port:
```bash
ssh -L localhost:6XXX:URL:6XXX URL
```
- [ ] Use psql, Ruby app, or any PostgreSQL client to connect to clone's database: `host=localhost port=6xxx dbname=DBNAME username=USERNAME password=PASSWORD`.
- [ ] Create another clone using the GUI. Go to Database Lab / Instances, and proceed with clone creation. Then set up another SSH tunnel and try working with the new clone.

:::warning
Please remember that clones are automatically destroyed after some time of inactivity (configurable, the default is 2 hours). You can mark clones as protected from deletion, but please do not leave them for more than a few days -- this might quickly lead to an out-of-disk-space event if continuous synchronization is enabled in your Database Lab Engine (ask your administrator for details). You can always check free disk space by going to Database Lab / Instances and checking the details of your Database Lab Engine. So, please delete your long-living clones once your work is done. In some cases, if needed, may want to ask the administrator to add more disk space.
:::

## Next steps
Want to try more? Here are several ideas for you:
- Verify DB schema changes ("database migrations")
- Create two clones based on two different snapshots and ensure that the date for the latest records correspond to the snapshot time
- Try your previous tasks: a heavy query optimization or long queries for analytics
- Learn more using the documentation: https://postgres.ai/docs/
