---
title: CLI installation
sidebar_label: CLI (npx/bunx)
sidebar_position: 3
---

# CLI installation

The fastest way to get PostgresAI monitoring running locally.

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Docker 20.10+
- PostgreSQL 13+ (14+ recommended) with `pg_stat_statements`

:::tip Bun support
All commands work with both `npx` and `bunx`. The CLI is written in TypeScript and runs natively on Bun.
:::

## Step 1: Prepare target database

Before starting the monitoring stack, configure your PostgreSQL instance:

```bash
PGPASSWORD=your_password npx postgresai@latest prepare-db "postgresql://postgres@localhost:5432/mydb"
```

### What prepare-db does

1. **Enables pg_stat_statements** extension
2. **Creates monitoring user** (`postgres_ai_mon` by default) with minimal read-only privileges
3. **Validates configuration** for optimal monitoring

### prepare-db options

```bash
npx postgresai@latest prepare-db [connection] [options]

Options:
  --monitoring-user <name>       Monitoring username (default: postgres_ai_mon)
  --password <pass>              Monitoring password (auto-generated if not set)
  --skip-optional-permissions    Skip optional permissions for managed providers
  --print-sql                    Print SQL instead of executing it
  --verify                       Verify monitoring permissions after setup
```

### Example output

```
✓ Connected to PostgreSQL 16.2
✓ pg_stat_statements extension enabled
✓ Created monitoring user 'postgres_ai_mon'
✓ Granted required permissions

Monitoring connection string:
postgresql://postgres_ai_mon:auto_generated_pass@localhost:5432/mydb
```

## Step 2: Start monitoring stack

### Demo mode (no target database)

```bash
npx postgresai@latest mon local-install --demo
```

Starts a complete stack with a sample PostgreSQL database seeded with a small demo dataset (a
`sample_data` table plus the monitoring schema objects).

### Production mode

```bash
npx postgresai@latest mon local-install \
  --db-url postgresql://postgres_ai_mon:pass@host:5432/mydb
```

### local-install options

```bash
npx postgresai@latest mon local-install [options]

Options:
  --demo                demo mode with sample database (default: false)
  --api-key <key>       Postgres AI API key for automated report uploads
  --org <alias>         organization alias (or PGAI_ORG); required to register
                        with a global token
  --org-id <id>         organization id (or PGAI_ORG_ID); alternative to --org
  --db-url <url>        PostgreSQL connection URL to monitor
  --tag <tag>           Docker image tag to use (e.g., 0.14.0, 0.14.0-dev.33)
  --project <name>      Docker Compose project name (default: postgres_ai)
  --instance-id <uuid>  adopt a console-provisioned monitoring instance instead
                        of self-registering a new one (set automatically by the
                        provisioning flow; PGAI_INSTANCE_ID env also works)
  --vcpus <n>           source DB vCPU count used for AAS zone thresholds
                        (PGAI_VCPUS env also works). Omit or 0 = unknown: the
                        platform keeps the value it stamped at provision time.
                        An explicit non-zero value overwrites the stored one;
                        changing it re-arms the AAS backfill.
  --instance-jobs       enable the instance-jobs compose profile (outbound
                        collection channel; PGAI_INSTANCE_JOBS env also works).
                        Writes COMPOSE_PROFILES into the stack .env, so every
                        later mon command covers the container
  --no-instance-jobs    disable the instance-jobs compose profile and remove its
                        container
  -y, --yes             accept all defaults and skip interactive prompts
                        (default: false)
  -h, --help            display help for command
```

This is the 0.17 option list. For details on each flag, see
[`mon local-install` in the CLI reference](/docs/reference-guides/postgresai-cli-reference#subcommand-mon-local-install).
Despite its help text, `--project` is not the Docker Compose project name (Compose uses the
monitoring directory's name): it is the PostgresAI Console project, saved as `project_name` in
`.pgwatch-config`.
For `--api-key`, use a per-organization token. The key is saved in `.pgwatch-config` on the
monitoring host and also replaces the key stored in the CLI configuration file (if you use a global
token with the CLI on this machine, run `postgresai login` again afterwards). The report uploader and `instance-jobs` send no organization selector: a
global token registers the instance (with `--org`), but then report uploads fall back to
local-only and `instance-jobs` cannot poll for work.

Re-running `local-install` on an existing stack keeps the `.env` settings it does not manage
(retention, resource limits, and so on) and resets `PGAI_TAG` to the CLI's version. What else it
does depends on whether the stack is running:

- **Running** (any Grafana or pgwatch container is up): it writes `.env` (plus `--project` to
  `.pgwatch-config` and, on a non-git install, the CLI-owned `docker-compose.yml`) and applies
  `--instance-jobs` / `--no-instance-jobs`, then exits with `Monitoring services are already
  running`. `instances.yml` is left alone, and no other container is recreated.
- **Stopped:** it runs the full install. Outside demo mode that **starts `instances.yml` fresh**,
  with only the `--db-url` target: re-add any other targets with `mon targets add` afterwards.

To upgrade, use `mon update` instead — see
[Upgrading](/docs/monitoring/getting-started/upgrade#upgrade-with-the-cli-recommended).

### Outbound collection channel (instance-jobs)

New in 0.17. The optional `instance-jobs` container lets PostgresAI run requests against this
stack's metrics — for example, [`postgresai promql`](/docs/reference-guides/postgresai-cli-reference#command-promql)
queries — without any inbound connection: it polls the platform over HTTPS, runs the job locally,
and posts the result back. It is off by default.

```bash
# Running stack. Turn the channel on: writes COMPOSE_PROFILES=instance-jobs to .env and starts the container
npx postgresai@latest mon local-install --instance-jobs

# Turn it off: removes the profile AND the running container
npx postgresai@latest mon local-install --no-instance-jobs
```

On a running stack, both write `.env` (as described above) and start or remove the container;
`instances.yml` is not touched, and `--db-url` is not read. On a stopped stack they run the full
install, so the `instances.yml` reset described above applies: pass your `--db-url`
(`mon local-install --db-url <url> --instance-jobs`) and re-add any other targets afterwards.

- Passing neither flag keeps the current setting, so upgrades and routine re-installs never turn
  the channel on or off. Other profiles already listed in `COMPOSE_PROFILES` are kept.
- Once enabled, `mon start`, `mon stop`, `mon update`, and `mon status` cover the container, and
  `mon health` reports a missing one as `enabled but not running`.
- PostgresAI must also enable the channel on the platform side; until then the container runs but
  receives no work.
- On a monitoring instance provisioned through PostgresAI Console, ask PostgresAI to enable it
  rather than re-running `local-install` by hand: on a stopped stack, an install without the
  instance id (`--instance-id`) registers a second monitoring instance.

See [Architecture](/docs/monitoring/advanced/architecture#instance-jobs--outbound-collection-channel-optional)
for how it works and [Security](/docs/monitoring/advanced/security#credentials-on-the-monitoring-host)
for how the container is locked down.

## Step 3: Access Grafana

Open Grafana in your browser.

Credentials:
- **Username**: monitor
- **Password**: Auto-generated (shown in CLI output after installation)

To retrieve the password later:
```bash
grep grafana_password ~/.config/postgresai/monitoring/.pgwatch-config
```

(The monitoring project lives in `~/.config/postgresai/monitoring` by default, or in
`$PGAI_PROJECT_DIR` if set.)

Navigate to **Dashboards — Browse — postgres_ai** to see your monitoring dashboards.

## Managing the stack

### Check status

```bash
npx postgresai@latest mon status
```

Output is the Docker Compose service table for the monitoring stack, including `grafana-with-datasources`, `sink-postgres`, `sink-prometheus`, `pgwatch-postgres`, `pgwatch-prometheus`, and `flask-pgss-api`.

### Stop stack

```bash
npx postgresai@latest mon stop
```

### View logs

```bash
# All containers
docker compose -f ~/.config/postgresai/monitoring/docker-compose.yml logs -f

# Specific service
docker compose -f ~/.config/postgresai/monitoring/docker-compose.yml logs -f pgwatch-postgres pgwatch-prometheus
```

## Troubleshooting

### "pg_stat_statements not found"

Ensure the extension is loaded in `postgresql.conf`:

```ini
shared_preload_libraries = 'pg_stat_statements'
```

Restart PostgreSQL after this change.

### "Connection refused"

1. Check PostgreSQL is accepting connections:
   ```bash
   psql postgresql://postgres:pass@localhost:5432/mydb -c "SELECT 1"
   ```

2. Verify Docker can reach the host:
   ```bash
   # On macOS/Windows, use host.docker.internal
   --db-url postgresql://user:pass@host.docker.internal:5432/mydb
   ```

### "Permission denied"

The monitoring user needs the built-in `pg_monitor` role (this is what `prepare-db` grants and
what the install/verify step checks for; `pg_read_all_stats` alone is a strict subset and is not
sufficient):

```sql
grant pg_monitor to postgres_ai_mon;
```

For RDS/CloudSQL, ensure you're using the master user for `prepare-db`.

## Next steps

- [Dashboard Overview](/docs/monitoring/dashboards/) - Understanding the dashboards
- [Docker Compose](/docs/monitoring/getting-started/installation-docker) - For custom deployments
- [Alerting Setup](/docs/monitoring/configuration/alerting) - Configure alerts
