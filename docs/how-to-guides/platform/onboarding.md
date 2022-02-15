---
title: Database Lab Platform onboarding checklist
sidebar_label: Platform onboarding checklist
keywords:
  - "Database Lab Platform onboarding"
  - "Start using Database Lab Engine"
description: In this document, we will cover tasks that you can start with to work with the Database Lab Platform.
---

:::note
You can copy [the Markdown version of this page](https://gitlab.com/postgres-ai/docs/-/blob/master/docs/how-to-guides/platform/onboarding.md) and use it as a GitHub or GitLab issue with interactive checkboxes.
:::

## Onboarding
Welcome! :rocket:
To start using the Postgres.ai Platform, you need to register using your work account/email here: https://postgres.ai/signin.

## Joe Web UI
### Chatbot
First, try using the basic features:
- [ ] Create an optimization session using Joe Web UI:
    - Go to `SQL Optimization / Ask Joe`
    - Select an instance
    - Type `explain select 1` and wait for Joe's response (normally, it takes several seconds; might be up to 1 minute if the Database Lab Engine is busy)
    - Type `\dt+` to get the full list of tables, with sizes. In the response, press the "Full command output" to see the full list
- [ ] Try running `EXPLAIN` for some query you've been working on recently and optimize it, e.g. create an index. Remember, for DDL (database schema changes), you need to use `exec`, while `explain` is for getting execution plans for DML (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `WITH`)
- [ ] Mark to acknowledge that you understand the following concepts of performance optimization in Database Lab environments:
    - Note that Database Lab and Joe bot are designed to provide production-like execution plans; however, the timing of the operations cannot be directly compared to production because of different system resources, cache states, and load. Stick to using the following approaches during the optimization:
        - apply relative comparison: compare two execution plans provided by Database Lab / Joe bot under the same circumstances (the same amount of data, a similar state of the cache; particularly, the timing for the very first execution should be discarded in this case because of a high probability of the cold state of caches)
        - focus on using the knowledge about the structure of the execution plan and the provided numbers that represent the amount of data involved, not timing (buffer numbers for "physical" setups; the planned and actual numbers of `rows` for "logical" setups)
    - Massive operations (such as `CREATE INDEX` for a large table) can be 2-4 times longer than in regular production environment – this is not a problem that can easily be solved; however, in the future, there are plans to provide estimates for production timing numbers (WIP)
- [ ] Create a table, experiment with it, and reset the state of your session
    - Create a table with some data: `exec create table t_example as select i from generate_series(1, 10000) i;`
    - See the actual number of rows in the table: `explain select from t_example;`
        - the number of rows is provided in the first line of the execution plan, inside the second pair of parentheses
        - in the same row, inside the first pair of parentheses, you should see another `rows` number, which represents how many rows the planner expects to see in the table; you should see that it's quite off, this is because the statistics haven't been yet calculated properly for this table, so let's fix it: `exec analyze t_example;`
        - now check it again: `explain select from t_example;` – this time, the expected `rows` number should be very close or even equal to the actual `rows` number
    - Reset the state: `reset` (normally, it takes several seconds)
    - Ensure that the table does not exist because the state of the database in your session has been reset: `explain select from t_example` should return an error saying that the table does not exist
        - // Note that sometimes, after performing `reset`, the very first command might fail with either `unexpected EOF` or "postmaster exit" error – this is a known minor issue; just repeat your command

### Query Optimization History and Visualization
- [ ] Explore the SQL optimization knowledge base:
    - go to `SQL optimization / History`
    - choose on your latest `explain` commands and click on it to see details
    - go back to the list and explore the search/filtering capabilities
    - note the bookmarking button on the right, try pressing it, and then use the button "Favorites" next to the search form
    - choose one of Joe sessions you've been working on; all commands and related metrics ran with Joe stored here; also, from the command details page, you can explore EXPLAIN plain visualization without copy-pasting to external services. Secure and convenient
- [ ] Explore the collaboration features, including sharing
    - Note that you can see optimization sessions of your colleagues; clicking on a particular username or session ID can be very helpful
        - // Note that currently, Slack usernames and Web UI usernames are not interconnected – if you used both communication channels, you would most likely find yourself as two different users presented in History
    - In History, use the "find similar" button (located on the right of each entry in the list) – this is a powerful way to find all `explain` commands ignoring the values (values define the execution plan, so the same query, being executed with different values, may have different execution plans)
    - Open an `EXPLAIN` entry, see its details, and try sharing using the "Share" button on the right (do not remember to save the settings by pressing "Save changes")
- [ ] Visualize an execution plan
    - Being on a page with details for some `EXPLAIN` command, you will see three buttons for visualization -- try them all; all of these visualization engines are installed internally, so all the data is not available to the public by default
    - However, if you want to share it with the public, you can try to combine sharing with visualization features: share a page as was done previously, then open it using the sharing link (`https://postgres.ai/console/shared/XXXXXX`), and use one of the visualization buttons to get a direct link to visualization (the link will have a `#xxx` suffix) – such a link can be used when discussing query behavior anywhere

## postgres-checkup reports
- [ ] Explore postgres-checkup reports: go to `Checkup / Reports` and choose any report and section, e.g., `K003 Top-50 Queries by total_time`, which may be helpful for discovering the most loaded queries in your database.

## Database Lab GUI, API, and CLI
If you have access to the production:
- [ ] Ask your administrator to add SSH / GPG keys or OS login to be able to connect to the machine. Also, you will need to know the Database Lab Engine hostname (URL) and the database name (DBNAME). Ask your organization administrator for the details.
- [ ] Create a personal token (you will need it for connection to Database Lab instance): go to `Settings / Access tokens` and add your personal token.
- [ ] Install Database Lab CLI:
```bash
curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/engine/scripts/cli_install.sh | bash
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
