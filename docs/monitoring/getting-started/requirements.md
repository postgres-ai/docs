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
| 18 | Fully supported |
| 17 | Fully supported |
| 16 | Fully supported |
| 15 | Fully supported |
| 14 | Fully supported |
| 13 | Not recommended (EOL Nov 2025) |
| 12 and earlier | Not supported |

:::note PostgreSQL 16+ for I/O statistics
The [I/O statistics dashboard (14)](/docs/monitoring/dashboards/io-statistics) and the
`pg_stat_io` metric group require **PostgreSQL 16 or newer** (`pg_stat_io` was introduced in
PG16). On PostgreSQL 15 and earlier, all other dashboards work but the I/O statistics dashboard
has no data.
:::

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

## CLI runtime

The `postgresai` CLI (used for `prepare-db`, `checkup`, `mon`, and MCP) requires:

| Runtime | Version |
|---------|---------|
| Node.js | 18+ |
| Bun (alternative) | 1.0+ |

Older Node.js versions fail fast in 0.15 with a clear error instead of breaking partway through
a command.

## Monitoring stack requirements

### Local installation (Docker)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 6 cores |
| RAM | 8 GiB | 12 GiB |
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

| Service | Host port | Notes |
|---------|-----------|-------|
| Grafana | 3000 | Published to the host. Recommended: protect behind a reverse proxy with TLS |
| VictoriaMetrics | 59090 | Published to the host (container listens on 9090); used for direct metric queries |
| Flask backend | — | Internal only — not published to the host (container port 8000) |

:::note Helm uses different ports
The port numbers above apply to the Docker Compose stack. On Kubernetes, the VictoriaMetrics
service listens on port 8428 and Grafana on port 80 (cluster-internal); expose them via Ingress
or `kubectl port-forward`.
:::

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
- **VictoriaMetrics**: 14 days (`336h`), tunable via `VM_RETENTION_PERIOD`
- **Query-id → query-text mapping** (Flask backend): tunable via `QUERYID_RETENTION_HOURS`, independent of metrics retention
- **Prometheus**: not used by the default local-install stack

See [Retention](/docs/monitoring/configuration/prometheus-config#retention) for tuning both
knobs together.

### Disk usage estimates

| Monitored databases | Daily growth | 14-day storage |
|--------------------|--------------|----------------|
| 1 | ~50 MiB | ~700 MiB |
| 5 | ~200 MiB | ~2.8 GiB |
| 20 | ~800 MiB | ~11.2 GiB |

:::tip Compression
VictoriaMetrics typically achieves 10-15x compression on time-series data.
:::

## Permissions

### Monitoring user privileges

The `prepare-db` command creates a user with **read-only access to metadata only** — no actual data is ever accessed.

```sql
-- Standard monitoring privileges (the built-in pg_monitor role)
grant pg_monitor to postgres_ai_mon;
grant connect on database <database> to postgres_ai_mon;
grant select on pg_catalog.pg_index to postgres_ai_mon;
-- plus a small postgres_ai schema (with a pg_statistic view for bloat analysis)
-- that prepare-db creates and grants usage/select on
```

`prepare-db` grants the built-in `pg_monitor` role (not `pg_read_all_stats`, which is a strict
subset of `pg_monitor` and would not be sufficient — the install/verify step checks for
`pg_monitor` membership).

:::tip Review exact permissions
To see the complete SQL used to create the monitoring role:
```bash
npx postgresai@0.15.0 prepare-db --print-sql
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
npx postgresai@0.15.0 prepare-db postgresql://master_user:pass@instance.region.rds.amazonaws.com:5432/postgres

# CloudSQL
npx postgresai@0.15.0 prepare-db postgresql://postgres:pass@/dbname?host=/cloudsql/project:region:instance
```
