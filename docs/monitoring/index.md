---
title: PostgresAI monitoring overview
sidebar_label: Overview
slug: /monitoring
description: "PostgresAI monitoring documentation: install paths, architecture, collected metrics, dashboards, data privacy, and supported Postgres versions."
keywords:
  - "PostgreSQL monitoring"
  - "Postgres observability"
  - "PostgresAI monitoring"
  - "Grafana dashboards for PostgreSQL"
  - "PostgreSQL performance monitoring"
  - "database monitoring"
---

# PostgresAI monitoring

PostgresAI monitoring collects the state of your Postgres at short intervals and keeps the history: active sessions and wait events, query statistics, tables and indexes, autovacuum, replication, WAL, and I/O. People read it in Grafana dashboards and checkup reports. AI agents read the same data through the CLI.

The core components are open source (Apache 2.0): [gitlab.com/postgres-ai/postgresai](https://gitlab.com/postgres-ai/postgresai).

- Product page: [PostgresAI monitoring](/products/monitoring)
- Pricing: [plans](/pricing)

## Install

Choose one path. Each path needs `pg_stat_statements` and a monitoring role; see [System requirements](./getting-started/requirements.md).

| Path | Use it when | Guide |
|---|---|---|
| Hosted by PostgresAI | You want PostgresAI to run the monitoring stack | [Quick start](./getting-started/index.md), [Install from PostgresAI Console](/docs/postgresai-howtos/install-postgres-ai-monitoring-from-postgresai-console) |
| Supabase | Your database is a Supabase project | [Quick start for Supabase](./getting-started/quickstart-supabase.md) |
| Amazon RDS, not publicly accessible | The monitoring must connect over AWS PrivateLink | [Quick start for Amazon RDS over AWS PrivateLink](./getting-started/quickstart-rds-privatelink.md) |
| Your server, with the CLI | You have a Linux machine with Docker | [CLI installation](./getting-started/installation-cli.md) |
| Your server, with Docker Compose | You want to manage the containers yourself | [Docker Compose installation](./getting-started/installation-docker.md) |
| Kubernetes | You deploy with Helm | [Helm installation](./getting-started/installation-helm.md) |
| Your cloud account | You provision in AWS, GCP, or Azure | [Cloud installation](./getting-started/installation-cloud.md) |

To try it without a database of your own, run the demo mode on a Linux machine with Docker:

```bash
npx pgai@latest mon local-install --demo
```

Grafana opens on `http://localhost:3000`.

For a hosted installation, open [PostgresAI Console](https://console.postgres.ai), go to **Monitoring**, and choose a plan. Grafana dashboards are part of the Scale plan and of every self-hosted installation; the Starter plan has checkup reports and issues, without Grafana. See [pricing](/pricing).

To upgrade an existing installation, see [Upgrading the monitoring stack](./getting-started/upgrade.md).

## Architecture

```
your Postgres ──► pgwatch ──► VictoriaMetrics ──► Grafana dashboards
 (read-only        (collector)   (metrics            (14 dashboards)
  monitoring role)      │          storage)   ──► checkup reports, alerts
                        │
                        └──► Postgres sink (normalized query texts)
```

- **pgwatch** runs read-only SQL against your database on a schedule and exposes the results as metrics.
- **VictoriaMetrics** stores the metrics and answers PromQL queries.
- **A Postgres sink** stores normalized query texts, so that dashboards can show the query behind a query ID.
- **Grafana** shows the dashboards.
- **The reporter** builds checkup reports from the stored metrics.

Most metrics are collected every 30 seconds, and session state and wait events are sampled every 15 seconds. Heavy estimates, such as table and index bloat, run every 2 hours.

More: [Architecture](./advanced/architecture.md), [Multi-cluster monitoring](./advanced/multi-cluster.md), [Self-monitoring](./dashboards/self-monitoring.md).

## What it collects

| Area | Examples | Reference |
|---|---|---|
| Sessions and wait events | sessions by state, active session history with wait events per query ID, long transactions, lock waits | [Wait event metrics](./metrics/wait-events.md) |
| Queries | calls, total and mean time, rows, buffers, WAL, per query ID | [pg_stat_statements metrics](./metrics/pg-stat-statements.md) |
| Tables | size, scans, row changes, dead tuples, bloat estimates | [Table metrics](./metrics/table-metrics.md) |
| Indexes | size, usage, bloat estimates, unused, redundant, and invalid indexes | [Index metrics](./metrics/index-metrics.md) |
| Database and cluster | transactions, checkpoints, WAL, replication, xmin horizon, wraparound, settings | [Database- and cluster-level metrics](./metrics/system-metrics.md) |

Full list: [Metrics reference](./metrics/index.md).

## Find the dashboard for your task

| Task | Dashboard |
|---|---|
| Triage an incident; see the whole node on one page | [01. Single node performance overview](./dashboards/01-node-overview.md) |
| Find the queries that take the most time, I/O, or WAL | [02. Query performance analysis (top-N)](./dashboards/02-query-analysis.md) |
| Study one query over time | [03. Single queryid analysis](./dashboards/03-single-query.md) |
| See what active sessions wait for, and which queries wait | [04. Wait event analysis (Active Session History)](./dashboards/04-wait-events.md) |
| Check WAL generation, archiving lag, and WAL retained by slots | [05. WAL, backups, DR](./dashboards/05-backups.md) |
| Check replication lag and slots | [06. Replication](./dashboards/06-replication.md) |
| Check autovacuum, the xmin horizon, and wraparound risk | [07. Autovacuum and xmin horizon](./dashboards/07-autovacuum.md) |
| Compare tables: size, activity, dead tuples, bloat | [08. Aggregated table analysis](./dashboards/08-table-stats.md) |
| Study one table | [09. Single table analysis](./dashboards/09-single-table.md) |
| Find unused, redundant, invalid, or bloated indexes | [10. Aggregated index analysis](./dashboards/10-index-health.md) |
| Study one index | [11. Single index analysis](./dashboards/11-single-index.md) |
| Check SLRU caches, including multixact | [12. SLRU cache stats](./dashboards/12-slru.md) |
| Find who blocks whom | [13. Lock contention](./dashboards/13-lock-contention.md) |
| Break down I/O by backend type | [14. I/O statistics (pg_stat_io)](./dashboards/14-io-statistics.md) |
| Check the monitoring stack itself | [Self-monitoring](./dashboards/self-monitoring.md) |

Overview of all dashboards: [Dashboard overview](./dashboards/index.md).

## Use it with an AI agent

- **Agent skill.** The `postgresai` skill deploys monitoring and reports the problems it finds, worst first. For Claude Code: `claude plugin marketplace add postgres-ai/postgresai`, then `claude plugin install pgai@postgresai`.
- **Metrics from a shell.** `npx pgai@latest promql '<expression>'` runs a PromQL query on a monitoring instance and prints the result. See [`promql` in the CLI reference](/docs/reference-guides/postgresai-cli-reference#command-promql).
- **Issues.** The MCP server and the CLI give an agent the issues and action items from PostgresAI Console. See [How to install MCP](/docs/postgresai-howtos/how-to-install-mcp) and [How to work with issues](/docs/postgresai-howtos/how-to-work-with-issues).
- **Checkup reports.** `npx pgai@latest checkup --json <connection string>` prints a health report as JSON. See [checkup](/docs/checkup).

## Data privacy: metadata only

PostgresAI monitoring collects database metadata. It does not read table data. It does not collect query parameter values, with one exception that you can turn off.

### What is collected

- **Database statistics** from system views (`pg_stat_*`)
- **Normalized query texts** from `pg_stat_statements`, with parameter values replaced by `$1`, `$2`, and so on
- **Wait event information** from `pg_stat_activity`
- **Table and index statistics**: sizes, access patterns, bloat estimates

One exception, on by default: the health check includes the first 500 characters of the query that holds the xmin horizon, as written, so it can contain literal values. The setting `postgresai.capture_query_preview=off` disables it.

### What is NOT collected

- Table data
- Query parameter values, except in the query preview above
- Connection credentials
- Application data

### Verify collected metrics

Every metric is a SQL query in a public file. Read the definitions:

- **Prometheus sink metrics**: [metrics.yml (pgwatch-prometheus)](https://gitlab.com/postgres-ai/postgresai/-/blob/0.18.0/config/pgwatch-prometheus/metrics.yml)
- **PostgreSQL sink metrics** (including normalized queries): [metrics.yml (pgwatch-postgres)](https://gitlab.com/postgres-ai/postgresai/-/blob/0.18.0/config/pgwatch-postgres/metrics.yml)

### Verify database permissions

The monitoring user has read-only access to metadata. To print the exact SQL that creates the monitoring role, without running it:

```bash
npx pgai@latest prepare-db --print-sql
```

The output shows every `grant` statement.

More: [Monitoring security](./advanced/security.md), [Monitoring telemetry](./advanced/telemetry.md), [Permission errors](./troubleshooting/permissions.md).

## Supported Postgres versions

PostgresAI full monitoring, express-mode checkups, and PostgresAI Console
checkup analysis support PostgreSQL 14 through PostgreSQL 19.

It works with self-managed Postgres, Kubernetes deployments, and managed
services such as Amazon RDS, Google Cloud SQL, Azure Database, Supabase, and
TigerData.

PostgreSQL 19 is currently a pre-release (RC1). Use it for compatibility
testing rather than production workloads until PostgreSQL 19 reaches general
availability. PostgresAI preserves the pre-release version label in checkup reports,
selects PostgreSQL 19-compatible metric SQL, and does not report a PostgreSQL
19 pre-release server as being behind the latest stable major release.

On PostgreSQL 19, the full monitoring collector uses the native
[`pg_get_multixact_stats()`](https://www.postgresql.org/docs/19/functions-info.html)
function instead of scanning `pg_multixact` files. The monitoring role needs
`pg_read_all_stats` privileges (included by `pg_monitor`) for the function to
return values; otherwise the metric is reported as unavailable without
interrupting other collection.

PostgresAI Console's separate PostgreSQL cluster-provisioning workflow depends
on the PostgreSQL versions supported by its automation provider. Monitoring and
checkup compatibility does not make a pre-release version available for
provisioning automatically.

## Configure

- [Configuration](./configuration/index.md): what you can change, and where
- [pgwatch configuration](./configuration/pgwatch-config.md): metrics and collection intervals
- [Prometheus/VictoriaMetrics configuration](./configuration/prometheus-config.md): storage and retention
- [Grafana configuration](./configuration/grafana-config.md)
- [Alerting configuration](./configuration/alerting.md)

## Troubleshoot

- [No data troubleshooting](./troubleshooting/no-data.md): dashboards are empty
- [Permission errors](./troubleshooting/permissions.md): the monitoring role cannot read a view
- [Performance tuning](./troubleshooting/performance.md): the monitoring stack is slow or uses too many resources
- [Troubleshooting](./troubleshooting/index.md): everything else

## PostgresAI Console

With a PostgresAI Console account, monitoring also gives you:

- **Checkup reports on a schedule**, with findings and recommendations.
- **Issues and action plans**, which you or your agent can work through.
- **Shared access for PostgresAI consulting.** Consulting customers can give the PostgresAI team access to the same monitoring.

Both the express checkup and the full monitoring stack also work without a Console account.
