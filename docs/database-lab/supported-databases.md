---
title: PostgreSQL versions and extensions supported in Database Lab Engine
---

## PostgreSQL versions
Currently, Database Lab Engine fully supports the following [PostgreSQL major versions](https://www.postgresql.org/support/versioning/):
- 9.6 (released: 2016-09-29; EOL: 2021-11-11)
- 10 (released: 2017-10-05; EOL: 2022-11-10)
- 11 (released: 2018-10-18; EOL: 2023-11-09)
- 12 (released: 2019-10-03; EOL: 2024-11-14)
- 13 (released: 2020-09-24; EOL: 2025-11-13)
- 14 (released: 2021-09-31; EOL: 2026-11-12)
- 15 (released: 2022-10-13; EOL: 2027-11-11)
- 16 (released: 2023-09-14; EOL: 2028-11-09)
- 17 (RC1)

By default, version 16 is used: `postgresai/extended-postgres:16`.

The images are published in [Docker Hub](https://hub.docker.com/r/postgresai/extended-postgres).

For paid customers having production systems running on AWS RDS and RDS Aurora, GCP CloudSQL, Heroku, Supabase, Timescale Cloud or using PostGIS, Postgres.AI maintains a set of special images. Contact sales@postgres.ai for details.

## Extensions included by default
By default, the Database Lab Engine uses [the extended Postgres.ai Docker images](https://hub.docker.com/r/postgresai/extended-postgres) built on top of the official Docker images for PostgreSQL. It is easy to change the images – see the options named `dockerImage` in various sections of [the Database Lab Engine configuration](https://postgres.ai/docs/reference-guides/database-lab-engine-configuration-reference).

All these extended images include the following extensions:
- all official ["core" contrib modules](https://www.postgresql.org/docs/current/contrib.html)
- [pgvector](https://github.com/pgvector/pgvector) (only for Postgres 11+)
- [logerrors](https://github.com/munakoiso/logerrors) (only for Postgres 10+)
- [bg_mon](https://github.com/CyberDem0n/bg_mon)
- [pg_auth_mon](https://github.com/RafiaSabih/pg_auth_mon)
- [PoWA](https://github.com/powa-team/powa) (only for Postgres 9.6-16)
- [pg_hint_plan](https://pghintplan.osdn.jp/pg_hint_plan.html)
- [Timescale](https://github.com/timescale/timescaledb) (only for Postgres 12-16)
- [Citus](https://github.com/citusdata/citus) (only for Postgres 11-16)
- [HypoPG](https://github.com/HypoPG/hypopg)
- [pg_cron](https://github.com/citusdata/pg_cron)
- [pg_qualstats](https://github.com/powa-team/pg_qualstats) (only for Postgres 9.6-16)
- [pg_repack](https://github.com/reorg/pg_repack) (only for Postgres 9.6-16)
- [pg_show_plans](https://github.com/cybertec-postgresql/pg_show_plans) (only for Postgres 12+)
- [pg_stat_kcache](https://github.com/powa-team/pg_stat_kcache)
- [pg_wait_sampling](https://github.com/postgrespro/pg_wait_sampling)
- [pg_timetable](https://github.com/cybertec-postgresql/pg_timetable)
- [pgextwlist](https://github.com/dimitri/pgextwlist)
- [hll](https://github.com/citusdata/postgresql-hll)
- [topn](https://github.com/citusdata/postgresql-topn) (only for Postgres 10-16)
- [postgresql_anonymizer](https://github.com/webysther/postgresql_anonymizer)
- [pgaudit](https://github.com/pgaudit/pgaudit)
- [set_user](https://github.com/pgaudit/set_user) (only for Postgres 10+)

## How to add more extensions
There are two options:
1. Adjust Dockerfile and build your own Docker image: https://gitlab.com/postgres-ai/custom-images
2. Ask the Postgres.ai team for help – contact: sales@postgres.ai

