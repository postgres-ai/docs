---
title: Database Lab Platform onboarding checklist
sidebar_label: Platform onboarding checklist
keywords:
  - "Database Lab Platform onboarding"
  - "Start using Database Lab Engine"
description: In this document, we will cover tasks that you can start with to work with the Database Lab Platform.
---

## Onboarding
Welcome aboard guys! :rocket:
To start using the Postgres.ai Platform you need to register with your work account/email on https://postgres.ai/signin.

:::note
You can copy [the content of this page](https://gitlab.com/postgres-ai/docs/-/blob/master/docs/tutorials/onboarding.md) and create a personal issue to enable checkboxes.
:::

## Joe Web UI
When you are ready let's try some of our features:
- [ ] Create a clone using Joe Web UI: go to `SQL Optimization / Ask Joe`, select an instance and type
- [ ] Try to run EXPLAIN for the query you've been working on recently and optimize it, e.g. create an index.
- [ ] Explore SQL optimization knowledge base: go to `SQL optimization / History` and choose the Joe session you've been working on. All commands and related metrics ran with Joe stored here, also, from the command details page you can explore EXPLAIN plain visualization without copy-pasting to external services. Secure and convenient.

## postgres-checkup reports
- [ ] Explore postgres-checkup reports: go to `Checkup / Reports` and choose any report and section, e.g. `K003 Top-50 Queries by total_time`, which may be helpful for discovering the most loaded queries in your database.

## Database Lab GUI, API, and CLI
If you have access to the production:
- [ ] Add SSH / GPG keys or OS login to be able to connect to the machine. Also, you will need to know the Database Lab Engine hostname (URL), database name (DBNAME). Ask your organization administrator for the details.
- [ ] Create a personal token (you will need it for connection to Database Lab instance): go to `Settings / Access tokens` and add your personal token.
- [ ] Install and setup Database Lab CLI:
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
Please remember that clones are automatically destroyed after some (configurable) time of inactivity. You can mark clones as protected from deletion, but please do not leave them for more than 1-2 days -- this will quickly lead to an out-of-disk-space event. You can always check the disk space available by going to Database Lab / Instances and checking the details of your Database Lab instance. So, please delete your long-living instances once your work is done. We can increase disk space if needed.
:::

## Next steps
Want to try more? Here are several ideas for you:
- Verify migrations
- Create two clones from various snapshots and ascertain that the date for the latest issue coincide with snapshot time
- Try your previous tasks: heavy query optimization / long queries for analytics / statement_timeout = 0 (?)
- Check documentation: https://postgres.ai/docs/
