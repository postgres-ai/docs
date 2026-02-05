---
title: System requirements
sidebar_label: Requirements
sidebar_position: 2
---

# System requirements

## PostgreSQL requirements

### Supported versions

| PostgreSQL version | Support status |
|--------------------|----------------|
| 18 (beta) | Supported |
| 17 | Fully supported |
| 16 | Fully supported |
| 15 | Fully supported |
| 14 | Fully supported |
| 13 | Not recommended (EOL Nov 2025) |
| 12 and earlier | Not supported |

### Required extensions

#### pg_stat_statements (required)

```sql
-- Check if installed
select * from pg_extension where extname = 'pg_stat_statements';

-- Install if missing (requires superuser)
create extension if not exists pg_stat_statements;
```

**Configuration** (postgresql.conf):
```ini
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = 'top'
pg_stat_statements.max = 5000
```

:::warning Restart Required
Changes to `shared_preload_libraries` require a PostgreSQL restart.
:::

:::note No additional extensions required for wait events
The wait events dashboard uses `pg_stat_activity`, which is built into PostgreSQL. No additional extensions are required.
:::

## Monitoring stack requirements

### Local installation (Docker)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 2 GiB | 4 GiB |
| Disk | 10 GiB | 50 GiB |
| Docker | 20.10+ | Latest |

### Kubernetes

Kubernetes deployment is available for Enterprise customers. [Contact us](https://postgres.ai/contact) for details.

## Network requirements

### PostgresAI Cloud (managed)

Your PostgreSQL instance must be accessible from the internet on its database port (typically 5432).

:::tip Private networks
If your database isn't publicly accessible but you still prefer managed setup, [contact us](https://postgres.ai/contact) to discuss options.
:::

### Self-managed installation

For self-managed deployments, you need connectivity between the monitoring node and your PostgreSQL instance(s). This can be within a VPC, local network, or any network where the monitoring stack can reach the database port.

**Inbound ports** (on the monitoring node):

| Service | Default port | Notes |
|---------|--------------|-------|
| Grafana | 3000 | Recommended: protect behind a reverse proxy with TLS |
| VictoriaMetrics | 8428 | Internal use |
| Flask backend | 8000 | Internal use |

## Cloud-specific requirements

### Amazon RDS

- Parameter group with `pg_stat_statements` enabled
- Enhanced Monitoring (optional, for OS metrics)
- Security group allowing monitoring stack access

### Google CloudSQL

- Database flag: `cloudsql.enable_pg_stat_statements = on`
- Private IP or authorized network for monitoring access

## Storage considerations

### Metrics retention

Default retention periods:
- **VictoriaMetrics**: 90 days
- **Prometheus**: 15 days (if using instead of VM)

### Disk usage estimates

| Monitored databases | Daily growth | 90-day storage |
|--------------------|--------------|----------------|
| 1 | ~50 MiB | ~4.5 GiB |
| 5 | ~200 MiB | ~18 GiB |
| 20 | ~800 MiB | ~72 GiB |

:::tip Compression
VictoriaMetrics typically achieves 10-15x compression on time-series data.
:::

## Permissions

### Monitoring user privileges

The `prepare-db` command creates a user with **read-only access to metadata only** — no actual data is ever accessed.

```sql
-- Read-only access to system catalogs
grant pg_read_all_stats to postgres_ai_mon;
```

:::tip Review exact permissions
To see the complete SQL used to create the monitoring role:
```bash
npx postgresai@latest prepare-db --print-sql
```
This transparency lets you verify the minimal, read-only nature of the permissions before running.
:::

### What the monitoring user can access

| Can access | Cannot access |
|------------|---------------|
| System statistics (`pg_stat_*`) | Table data |
| Normalized queries (parameters replaced with `$1`, `$2`) | Query parameter values |
| Wait events | Application secrets |
| Table/index sizes | Actual row content |

### RDS/CloudSQL notes

For managed databases, use the master/admin user to run `prepare-db`:

```bash
# RDS
npx postgresai@latest prepare-db postgresql://master_user:pass@instance.region.rds.amazonaws.com:5432/postgres

# CloudSQL
npx postgresai@latest prepare-db postgresql://postgres:pass@/dbname?host=/cloudsql/project:region:instance
```
