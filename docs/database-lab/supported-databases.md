---
title: PostgreSQL versions and extensions supported in Database Lab Engine
---

## PostgreSQL versions
Currently, Database Lab Engine fully supports the following PostgreSQL major versions:
- 9.6
- 10
- 11
- 12
- 13
- 14

## Extensions
By default, Database Lab Engine uses [the extended Postgres.ai Docker images](https://hub.docker.com/r/postgresai/extended-postgres) built on top of the official Docker images for PostgreSQL. Use these images with Database Lab when you need non-standard Postgres extensions. 

All these extended images include the following extensions:
- all official ["core" contrib modules](https://www.postgresql.org/docs/current/contrib.html)
- [bg_mon](https://github.com/CyberDem0n/bg_mon)
- [Citus](https://github.com/citusdata/citus)
- [HypoPG](https://github.com/HypoPG/hypopg)
- [pg_auth_mon](https://github.com/RafiaSabih/pg_auth_mon)
- [pg_cron](https://github.com/citusdata/pg_cron)
- [pg_hint_plan](https://pghintplan.osdn.jp/pg_hint_plan.html)
- [pg_qualstats](https://github.com/powa-team/pg_qualstats)
- [pg_repack](https://github.com/reorg/pg_repack)
- [pg_show_plans](https://github.com/cybertec-postgresql/pg_show_plans)
- [pg_stat_kcache](https://github.com/powa-team/pg_stat_kcache)
- [pg_timetable](https://github.com/cybertec-postgresql/pg_timetable)
- [pgextwlist](https://github.com/dimitri/pgextwlist)
- [hll](https://github.com/citusdata/postgresql-hll)
- [topn](https://github.com/citusdata/postgresql-topn)
- [postgresql_anonymizer](https://github.com/webysther/postgresql_anonymizer) 
- [PoWA](https://github.com/powa-team/powa)
- [set_user](https://github.com/pgaudit/set_user)
- [Timescale](https://github.com/timescale/timescaledb)

#### Not included in the PostgreSQL 13 image (yet)
The PostgreSQL 13 image does not have the following extensions (they might be added in the future):
- bg_mon
- pg_auth_mon
- powa

#### Not included in the PostgreSQL 14 image (yet)
The PostgreSQL 14 image does not have the following extensions (they might be added in the future):
- bg_mon
- pg_auth_mon
- pg_hint_plan
- powa
- timescaledb

### How to extend
Proposals to extend this list are welcome in the project repository: https://gitlab.com/postgres-ai/custom-images.

:::tip
If needed, you can specify any custom Docker image with PostgreSQL in the Database Lab Engine configuration. There is one requirement: such an image needs to use the directory `/var/lib/postgresql/pgdata` as PostgreSQL data directory (`PGDATA`).

Use [this Dockerfile](https://gitlab.com/postgres-ai/database-lab/snippets/1932037) as an example. You can extend or modify it for your needs.
:::
