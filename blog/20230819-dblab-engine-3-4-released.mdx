---
author: "Nikolay Samokhvalov"
date: 2023-08-19 03:51:12
publishDate: 2023-08-19 03:51:12
linktitle: "DBLab 3.4: new name, SE installer, and lots of improvements"
title: "DBLab 3.4: new name, SE installer, and lots of improvements"
weight: 0
image: /assets/thumbnails/dblab-3.4-blog-upd.png
tags:
  - Product announcements
  - DBLab Engine
  - Database Lab Engine
---

import { BlogFooter } from '@site/src/components/BlogFooter'
import { nik } from '@site/src/config/authors'

DBLab Engine version 3.4, an open-source tool for PostgreSQL thin cloning and database branching, has been released with numerous improvements.

Rapid, cost-effective cloning and branching are extremely valuable when you need to enhance the development process. DBLab Engine can handle numerous independent clones of your database on a single machine, so each engineer or automated process can work with their own database created within seconds without additional expenses. This enables testing of any changes and optimization concepts, whether manually or in CI/CD pipelines, as well as validating all the concepts suggested by ChatGPT or another LLM. This effectively addresses the issue of LLM hallucinations.

<!--truncate-->
---

## New name: DBLab Engine
The new name for the Database Lab Engine is "DBLab Engine". Updates are currently underway across our materials to reflect this change. To align with this change, we have introduced specific domains for the product: `dblab.dev` and `dblab.sh`. For ease of access, we have established the following short URLs:
- https://cli.dblab.dev/ and https://dblab.sh – CLI setup script (works on macOS/Linux/Windows: `curl -sSL dblab.sh | bash`)
- https://demo.dblab.dev/ – DBLab 3.4 demo (token: `demo-token`)
- https://branching.dblab.dev/ – DBLab 4.0-alpha demo, implementing full-fledged DB branching and snapshots on demand (token: `demo-token`)
- https://aws.dblab.dev/ – DBLab SE page in AWS Marketplace
- https://docs.dblab.dev/ – the docs
- https://api.dblab.dev/ – interactive API reference (powered by readme.io)

<img src="/assets/blog/20230819-dblab.sh.png" width="400" />

## By the numbers
- [DBLab GitHub repository](https://github.com/postgres-ai/database-lab-engine) has crossed the 1700+ stars mark
- X/Twitter account [@Database_Lab](https://twitter.com/Database_Lab) has more than 1300 followers
- Our [LinkedIn page](https://www.linkedin.com/company/postgres-ai/posts/) has amassed 1500+ followers

Thank you for the support!

## New DBLab SE installer
We've expanded the installation options for DBLab SE. Besides its presence in [the AWS Marketplace](https://aws.dblab.dev/), you can now seamlessly install DBLab SE directly from [the Postgres.ai Console](https://console.postgres.ai/).

<img src="/assets/blog/20230819-dblab-se-installer.gif" width="800" />

This setup is entirely automated and can be used anywhere:
- For those who have existing machines, we support the "BYOM" (Bring Your Own Machine) method
- If you're utilizing AWS, GCP, DigitalOcean, or Hetzner Cloud, the installer handles resource provisioning—including VMs, disks, and more—automatically.

Check out [step-by-step tutorial](https://postgres.ai/docs/tutorials/database-lab-tutorial).

## New configuration options
### cloneAccessAddresses
To improve control over how clones are created, it is now possible to configure network interfaces that will be used for clone containers, using new option `cloneAccessAddresses`. It is set to `127.0.0.1` by default, meaning that only local TCP connections will be allowed. It is possible to specify multiple addresses, and IPv6 is also supported: see [the docs](https://postgres.ai/docs/reference-guides/database-lab-engine-configuration-reference#section-provision-thin-cloning-environment-settings).

### ignoreErrors and skipPolicies for logical data provisioning
Some DBLab Engine users experienced issues with logical data provisioning (automated full refreshes that use `pg_dump`/`pg_restore`), so the following two convenient flags were added to help mitigate those issues:
- `ignoreErrors` in subsections `logicalDump` and `logicalRestore` to allow not to interrupt the process of dump/restore in case of errors,
- `skipPolicies` in subsection `logicalRestore` to allow to skip policies (`CREATE POLICY`) during restore process.

## Postgres restarts in clone containers
Postgres clone containers under DBLab Engine's management were always supposed to support Postgres restarts - although, due to a bug, it didn't really work in versions 3.0—3.2. With a proper fix, it works again – just make sure you're using tags with the `-0.3.0` suffix or later, such as `postgresai/extended-postgres:15-0.3.0`.

With restart support, it is possible, for example, to run `pg_upgrade -k` inside a particular clone container (of course, with previous installation of newer binaries) – and start testing a newer Postgres major version right away, in an isolated environment. And, most importantly, you don't need to spend extra time or money – this is exactly why we created and develop DBLab Engine. Any testing has to be fast, cheap, and scalable, even for multi-terabyte databases.

## UI improvements
The "Configuration" tab received numerous improvements (though, config editing is still only supported for the logical mode), as well as "Logs" which now has filter buttons:
<img src="/assets/blog/20230819-log-filters.png" width="800" />

## API docs
As already mentioned, we now have a short URL for the API docs: [API.dblab.dev](https://API.dblab.dev/). It is backed by excellent service ReadMe, and is based on [the OpenAPI spec](https://gitlab.com/postgres-ai/database-lab/-/tree/master/engine/api) that you can find in Git.

[API.dblab.dev](https://API.dblab.dev/) is interactive, you can use the token `demo-token` to test API calls for the demo instance ([demo.dblab.dev](https://demo.dblab.dev/)):

<img src="/assets/blog/20230819-api-docs.png" width="800" />

## Postgres images for DBLab: pgvector and upgrades
[Following](https://www.timescale.com/blog/postgresql-as-a-vector-database-create-store-and-query-openai-embeddings-with-pgvector/) [the](https://cloud.google.com/blog/products/databases/announcing-vector-support-in-postgresql-services-to-power-ai-enabled-applications) [obvious](https://supabase.com/docs/guides/database/extensions/pgvector) [trends](https://aws.amazon.com/about-aws/whats-new/2023/05/amazon-rds-postgresql-pgvector-ml-model-integration/), we added [`pgvector`](https://github.com/pgvector/pgvector) to the Postgres images for DBLab Engine.

And, as usual, upgraded all extensions to most up-to-date. See the full list of extensions in [the docs](https://v2.postgres.ai/docs/database-lab/supported-databases#extensions-included-by-default).

For the DBLab SE, we also prepared special sets of our Postgres container images, with Postgres versions 10-15, and extensions that are needed to run DBLab Engine for the following source databases:
- GCP Cloud SQL for PostgreSQL
- Amazon RDS for PostgreSQL
- Amazon Aurora PostgreSQL
- Supabase
- Timescale
- Heroku
- PostGIS

## Other changes
There is a huge number of improvements in DBLab Engine 3.4.0 – this release has the largest number of changes ever. Please read the full list of changes in the [CHANGELOG](https://gitlab.com/postgres-ai/database-lab/-/releases/v3.4.0#changelog). If you need to upgrade an existing DBLab Engine to 3.4.0, do not forget to follow the [Migration Notes](https://gitlab.com/postgres-ai/database-lab/-/releases/v3.4.0#migration-notes).

## Where to start / get help
- [Tutorial](https://postgres.ai/docs/tutorials/database-lab-tutorial)
- [DBLab 3.4 demo instance](https://demo.dblab.dev/) (token: `demo-token`)
- [Docs](http://docs.dblab.dev/)
- [Postgres.ai Console](https://console.postgres.ai/)
- [Contact us](https://postgres.ai/contact)

## Provide feedback, contribute
We greatly value your feedback. Connect with us via:
- X/Twitter [@Database_Lab](https://twitter.com/Database_Lab)
- [LinkedIn](https://www.linkedin.com/company/postgres-ai/posts/)
- [DBLab Community Slack](https://slack.postgres.ai/)

Additional resources where you can get insights about DBLab and Postgres:
- [YouTube channel PostgresTV](https://www.youtube.com/PostgresTV)
- [Podcast Postgres.FM](https://postgres.fm)

Interested in giving back to the project? Here's how you can make an impact:
- Give a star to our [GitHub repository](https://github.com/postgres-ai/database-lab-engine)
- Help us reach more enthusiasts. Share about Database Lab on Twitter (don't forget to tag [@Database_Lab](https://twitter.com/Database_Lab)) or any other platform you fancy
- Multilingual? Consider [translating our README.md](https://gitlab.com/postgres-ai/database-lab/-/blob/master/CONTRIBUTING.md#translation) to share the knowledge in your language
- Are you a developer? Dive in and enhance the Database Lab Engine (DLE) experience; check out our [CONTRIBUTING guidelines](https://gitlab.com/postgres-ai/database-lab/-/blob/master/CONTRIBUTING.md) and explore [the "good first issues" list](https://gitlab.com/postgres-ai/database-lab/-/issues?sort=created_date&state=opened&label_name[]=good+first+issue) on GitLab

<BlogFooter author={nik} />
