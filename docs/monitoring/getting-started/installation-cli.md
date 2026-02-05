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
- PostgreSQL 14+ with `pg_stat_statements`

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
2. **Creates monitoring user** (`pgwatch`) with minimal read-only privileges
3. **Validates configuration** for optimal monitoring

### prepare-db options

```bash
npx postgresai@latest prepare-db [connection] [options]

Options:
  --mon-user <name>     Monitoring username (default: pgwatch)
  --mon-password <pass> Monitoring password (auto-generated if not set)
  --skip-extension      Skip pg_stat_statements setup
  --dry-run             Show what would be done without executing
```

### Example output

```
✓ Connected to PostgreSQL 16.2
✓ pg_stat_statements extension enabled
✓ Created monitoring user 'pgwatch'
✓ Granted required permissions

Monitoring connection string:
postgresql://postgres_ai_mon:auto_generated_pass@localhost:5432/mydb
```

## Step 2: Start monitoring stack

### Demo mode (no target database)

```bash
npx postgresai@latest mon local-install --demo
```

Starts a complete stack with a sample PostgreSQL database pre-loaded with pgbench data.

### Production mode

```bash
npx postgresai@latest mon local-install \
  --target-db postgresql://postgres_ai_mon:pass@host:5432/mydb
```

### local-install options

```bash
npx postgresai@latest mon local-install [options]

Options:
  --target-db <uri>     PostgreSQL connection string
  --demo                Start with demo database
  --grafana-port <port> Grafana port (default: 3000)
  --vm-port <port>      VictoriaMetrics port (default: 8428)
  --cluster-name <name> Cluster identifier in dashboards
  --node-name <name>    Node identifier (default: node-01)
  --detach              Run in background
  --stop                Stop running stack
  --status              Show stack status
```

## Step 3: Access Grafana

Open Grafana in your browser.

Credentials:
- **Username**: monitor
- **Password**: Auto-generated (shown in CLI output after installation)

To retrieve the password later:
```bash
grep grafana_password ~/.postgresai/.pgwatch-config
```

Navigate to **Dashboards — Browse — postgres_ai** to see your monitoring dashboards.

## Managing the stack

### Check status

```bash
npx postgresai@latest mon local-install --status
```

Output:
```
PostgresAI Monitoring Stack Status
───────────────────────────────────
Grafana:          Running (`http://localhost:3000`)
VictoriaMetrics:  Running (`http://localhost:8428`)
pgwatch:          Running
Flask Backend:    Running

Monitoring:
  Cluster: local
  Node: node-01
  Target: postgresql://...@localhost:5432/mydb
```

### Stop stack

```bash
npx postgresai@latest mon local-install --stop
```

### View logs

```bash
# All containers
docker compose -f ~/.postgresai/docker-compose.yml logs -f

# Specific service
docker compose -f ~/.postgresai/docker-compose.yml logs -f pgwatch
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
   --target-db postgresql://user:pass@host.docker.internal:5432/mydb
   ```

### "Permission denied"

The monitoring user needs these minimum privileges:

```sql
grant pg_read_all_stats to postgres_ai_mon;
```

For RDS/CloudSQL, ensure you're using the master user for `prepare-db`.

## Next steps

- [Dashboard Overview](/docs/monitoring/dashboards/) - Understanding the dashboards
- [Docker Compose](/docs/monitoring/getting-started/installation-docker) - For custom deployments
- [Alerting Setup](/docs/monitoring/configuration/alerting) - Configure alerts
