---
title: Supported Databases
---

By default, Database Lab uses [extended Postgres.ai Docker images](https://hub.docker.com/repository/docker/postgresai/extended-postgres) built on top of the official Docker images for PostgreSQL. Use these images with Database Lab when you need non-standard Postgres extensions. 

All these extended images include the following extensions:
- [HypoPG](https://github.com/HypoPG/hypopg) 
- [pg_hint_plan](https://github.com/ossc-db/pg_hint_plan)

Proposals to extend this list are welcome in the project repository: https://gitlab.com/postgres-ai/custom-images.

Currently, only PostgreSQL versions 9.6, 10, 11, and 12 are supported.

If needed, any custom Docker image that runs Postgres with `PGDATA` located in `/var/lib/postgresql/pgdata` directory can be specified in the configuration. See this [Dockerfile](https://gitlab.com/postgres-ai/database-lab/snippets/1932037) as an example.
