---
title: Quick start
sidebar_label: Quick start
sidebar_position: 1
keywords:
  - "PostgreSQL monitoring setup"
  - "PostgresAI Cloud"
  - "Grafana PostgreSQL"
---

# Quick start guide

Get PostgresAI monitoring running in minutes with PostgresAI Cloud.

## Step 1: Choose your plan

Go to [console.postgres.ai](https://console.postgres.ai), open **Monitoring** in the left sidebar to reach the **Monitoring instances** page, then click **Start setup** (under **Hosted by PostgresAI**) and choose a plan.

Select a plan for one cluster:
- **Starter ($16/cluster/month)** — primary only, Full monitoring, 14-day retention, no included human expert requests.
- **Scale ($512/cluster/month)** — one primary + up to 5 replicas in one cluster, 13-month retention, Grafana dashboards, Private RDS / PrivateLink, Trend analysis (Performance Cliffs and Walls), and two human expert requests per month on two topics. Response within 24 business hours; an issue conversation can continue for one week.
- **Enterprise** — [contact us](/contact) to discuss your requirements.

Included monthly expert requests expire at month end and do not roll over or accumulate. Purchased-pack terms are separate; [contact us](/contact) for details.

Both Starter and Scale include Checkup reports, Work with your AI agent, Issues and action plans, historical root cause analysis, email and Slack alerts, and async email / Slack support. Agent workflows include Claude Code, Codex, and MCP, using the appropriate integration for each tool. Full monitoring does not mean Grafana access: dashboards are Scale-only.

Both plans offer a one-off pack of two additional expert requests for $500. Expert requests are separate from ordinary async support; neither plan includes a dedicated channel. [Contact us](/contact) for pack terms. For ongoing expert help, compare upgrading with buying packs; buying an expert pack does not change your plan.

See [Pricing](/pricing) for the complete comparison. Hobby and Express are retired and unsupported; they are not available plans. Existing monitoring customers will transition to Scale. Contact PostgresAI to arrange your transition.

## Step 2: Select deployment method

After selecting a plan, choose how to connect your database:

![Scale deployment options](/img/monitoring/cloud-setup/02-scale-options.png)

**Hosted by PostgresAI:**
- **Any PostgreSQL database** — We provision and manage the monitoring stack for you
- **Your Supabase projects** — One-click integration with connected Supabase projects

**Self-hosted:**
- **Your cloud account (BYOC)** — Provision in your AWS, GCP, or Azure
- **Your server (BYOM)** — Install on existing Linux machine with Docker
- **Kubernetes** — Deploy via Helm chart

## Step 3: Connect your database

### Option A: Supabase integration

If you have Supabase projects, select them for automatic setup:

![Supabase project selection](/img/monitoring/cloud-setup/03-supabase-project.png)

PostgresAI automatically:
- Creates a dedicated monitoring user in your Supabase database
- Deploys the monitoring stack
- No manual setup required

### Option B: Any PostgreSQL database

For other PostgreSQL databases (RDS, CloudSQL, self-hosted):

![Any PostgreSQL connection](/img/monitoring/cloud-setup/04-anydb-connection.png)

1. Enter your database connection URL
2. Choose automatic or manual database preparation
3. Click **Test Connection** to verify connectivity
4. Deploy the monitoring stack

:::tip Database preparation
For automatic setup, provide superuser credentials (used once, never stored). For manual setup, follow the [database preparation guide](/docs/monitoring/getting-started/requirements#permissions).
:::

## Step 4: Review monitoring results

On both plans, open Checkup reports and Issues in Console to review findings and action plans.
Starter includes historical monitoring for root cause analysis without Grafana access.

On **Scale**, you also receive:
- Grafana URL with your dashboards
- Login credentials

On Scale, start with **01. Single node performance overview (high-level)** for a high-level health check.

## Verify database permissions

The monitoring user has read-only access to metadata only. To review the exact SQL statements used
to create the monitoring role:

```bash
npx postgresai@latest prepare-db --print-sql
```

This shows all `grant` statements and confirms the minimal, read-only nature of the permissions.

## What data is collected?

Only database metadata is collected — no actual data or query parameters:
- Query statistics from `pg_stat_statements` (normalized queries only)
- Wait events and session information
- Table and index statistics
- Replication status

To review exactly what metrics are collected, examine the metric definitions:

- **Prometheus sink metrics**:
  [metrics.yml (pgwatch-prometheus)](https://gitlab.com/postgres-ai/postgresai/-/blob/0.17.0/config/pgwatch-prometheus/metrics.yml)
- **PostgreSQL sink metrics** (including normalized queries):
  [metrics.yml (pgwatch-postgres)](https://gitlab.com/postgres-ai/postgresai/-/blob/0.17.0/config/pgwatch-postgres/metrics.yml)

See [data privacy details](/docs/monitoring/#data-privacy-metadata-only).

## First dashboard walkthrough (Scale)

Key panels to check in **01. Single node performance overview (high-level)**:
1. **Active session history (ASH)** — Wait events over time (similar to RDS Performance Insights)
2. **Sessions** — Active, idle, and idle in transaction connections
3. **TPS** — Transactions per second
4. **QPS** — Queries per second

## Decision tree: which dashboard to use? (Scale)

```
Is there an ongoing incident?
├─ Yes — Start with "01. Single node performance overview (high-level)" for quick triage
│        └─ High wait events? — "04. Wait event analysis (Active Session History)" for deep-dive
│        └─ Slow queries? — "02. Query performance analysis (top-N)" then "03. Single queryid analysis"
│        └─ Lock contention? — "13. Lock contention"
│
├─ No, routine monitoring
│   ├─ Query performance review — "02. Query performance analysis (top-N)"
│   ├─ Index health check — "10. Aggregated index analysis"
│   ├─ Table bloat check — "07. Autovacuum and xmin horizon" or "08. Aggregated table analysis"
│   └─ Replication lag — "06. Replication and HA"
```

## Self-hosted alternative

If you prefer to run the monitoring stack on your own infrastructure:

| Method | Best for |
|--------|----------|
| [Cloud databases](/docs/monitoring/getting-started/installation-cloud) | RDS, CloudSQL, Supabase specifics |
| [Helm](/docs/monitoring/getting-started/installation-helm) | Kubernetes production |
| [Docker Compose](/docs/monitoring/getting-started/installation-docker) | Development, small deployments |
| [CLI (npx)](/docs/monitoring/getting-started/installation-cli) | Quick local setup, demos |

## Next steps

- [Dashboard guide](/docs/monitoring/dashboards/) — Complete dashboard reference
- [System requirements](/docs/monitoring/getting-started/requirements) — Hardware and software requirements
