---
title: Quick start for Amazon RDS / Aurora over AWS PrivateLink
sidebar_label: Quick start for Amazon RDS (AWS PrivateLink)
sidebar_position: 9
keywords:
  - "PostgresAI for Amazon RDS"
  - "Postgres monitoring for RDS"
  - "Amazon RDS AWS PrivateLink"
  - "private RDS monitoring"
  - "Aurora monitoring Grafana"
---

# Quick start guide for Amazon RDS / Aurora over AWS PrivateLink

Set up PostgresAI monitoring for a **private** Amazon RDS or Aurora database — one that has no
public endpoint — using the guided setup in [PostgresAI Console](https://console.postgres.ai/).
PostgresAI reaches your database over **AWS PrivateLink**, so **no inbound port is ever opened** on
your account: the connection is outbound-only, from your VPC to PostgresAI.

:::info Available on the Scale plan and Enterprise only
Private-RDS monitoring over **AWS PrivateLink** is available on the **Scale** plan and on
**Enterprise**. Consulting clients get it packaged as part of their
engagement. If you prefer not to use PrivateLink, you can instead monitor RDS by exposing a
publicly reachable database port to PostgresAI
(see [Cloud installation](/docs/monitoring/getting-started/installation-cloud)). See
[Pricing](/pricing) for the full feature comparison.
:::

## Overview

This flow connects a database that lives entirely inside your VPC:

1. You create a least-privilege, **read-only** monitoring role on your RDS instance.
2. You launch a one-click CloudFormation stack **in your own AWS account**. It publishes your RDS
   over **AWS PrivateLink** (an internal Network Load Balancer plus a VPC endpoint service) and
   allowlists only the PostgresAI principal.
3. You paste the resulting endpoint-service name back into PostgresAI Console.
4. PostgresAI provisions a dedicated monitoring VM, creates an interface endpoint to your service,
   and starts collecting metrics.

The collector is **read-only and metadata-only** — it reads statistics, normalized query text, and
wait events. It never reads your data or raw query parameters. See
[data privacy details](/docs/monitoring/#data-privacy-metadata-only).

:::caution Amazon RDS (single instance) only
The one-click CloudFormation template publishes a **single-instance Amazon RDS** database. Aurora
clusters and multi-instance setups are not yet supported by this flow.
:::

## Prerequisites

1. A private Amazon RDS for PostgreSQL instance (PostgreSQL 14+), with no public access required.
2. A [PostgresAI Console](https://console.postgres.ai/) account on the **Scale** plan (or
   Enterprise). Sign up with Google, LinkedIn, GitHub, or GitLab.
3. An organization in PostgresAI Console.
   [Create one](https://console.postgres.ai/addorg) if you don't have one yet. You must be an
   **organization admin** to provision RDS monitoring.
4. A payment method on file. In your organization, open **Billing**, click **Edit payment
   methods**, and add a card in the Stripe portal.
5. AWS permissions to launch a CloudFormation stack in the account and Region where your RDS runs
   (it creates an internal NLB and a VPC endpoint service), and the **master database user** to run
   the one-time preparation SQL.

## Step 1. Start the guided setup

In PostgresAI Console, navigate to **DB health — Getting started**. On the **RDS / Aurora** card,
click **Start guided setup**.

[![PostgresAI Console: Getting started page with the RDS / Aurora "Start guided setup" card](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-1.png)](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-1.png)

## Step 2. Choose the Scale (or Enterprise) plan

AWS PrivateLink monitoring runs on the full monitoring stack, which is available on **Scale** and
**Enterprise**. On the plan page, click **Choose Scale** (or **Contact sales** for Enterprise).
Consulting clients already have it enabled and can skip this step.

See [Pricing](/pricing) for the full list of options with feature comparison.

[![Choose the PostgresAI plan: Scale includes private RDS via AWS PrivateLink](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-2.png)](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-2.png)

:::note
The console screenshot above still shows the retired **Starter** plan (the Scale card's "Everything
included in Starter" bullet refers to it). The Scale card also still shows the previous 6-month
monitoring retention; Scale now includes 13-month retention. Starter is no longer offered — click
**Choose Scale**, or contact us about **Enterprise**.
:::

## Step 3. Create the read-only monitoring role

The **Set up RDS monitoring over AWS PrivateLink** wizard opens. In **Step 1**, click **Generate
database-preparation SQL**. PostgresAI shows a one-time script that creates the least-privilege,
**read-only, metadata-only** `postgres_ai_mon` role, grants `pg_monitor`, and creates the
`postgres_ai` schema with a few read-only helper views.

[![Set up RDS monitoring over AWS PrivateLink: the four-step in-console wizard](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-3.png)](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-3.png)

Run it once as the **master user**, for example:

```bash
psql "host=<your-rds-endpoint> port=5432 dbname=<your-database> sslmode=require"
```

Then paste the SQL shown in the console.

:::tip Review the SQL and run it against the right database
Read through the generated SQL before you run it — it is short, and only creates a read-only role,
the `postgres_ai` schema, and helper views; it grants no write access and touches no table data.
Make sure you connect to the **correct logical database** — the one you actually want monitored
(typically your application database, not the default `postgres`) — because the role and helper
objects are created in whichever database you run the script against.
:::

To review the exact statements at any time, run:

```bash
npx postgresai@latest prepare-db --print-sql
```

This confirms the minimal, read-only nature of the permissions.

## Step 4. Launch and fill the CloudFormation stack

Back in the wizard, in **Step 2** select your **AWS Region** (it scopes the stack-launch link, and
it must match the Region your RDS runs in). In **Step 3**, click **Launch stack in AWS console**.
This opens the AWS **Quick create stack** page in your own account, pre-filled with the PostgresAI
principal to allowlist. The launch link carries only non-secret parameters.

Review the template (it is intentionally published and line-by-line auditable), then fill in the
typed parameters:

- **Stack name** — for example `postgresai-rds-privatelink`.
- **RDS DB instance identifier** — your RDS instance's identifier, taken from the RDS console (a
  **single-instance** Amazon RDS, not an Aurora cluster).
- **RDS port** — default `5432`.
- **VPC of the RDS** — the VPC your RDS instance runs in (a typed `AWS::EC2::VPC::Id` dropdown).
- **Subnets (the RDS's AZs)** — pick one subnet per Availability Zone your RDS can run in. **For a
  Multi-AZ instance, select the subnets for _all_ of its AZs** so the internal load balancer can
  follow the database if it fails over. They must be in the VPC above and able to reach the RDS (no
  NAT gateway or special egress is required — it stays inside the VPC).
- **PostgresAI principal ARN** — pre-filled; leave it as-is unless instructed otherwise.

[![AWS CloudFormation Quick create stack: the Your RDS parameters (identifier, port, VPC, subnets)](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-4.png)](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-4.png)

A filled-in example — note that **all** of the RDS's subnets are selected for failover coverage:

[![CloudFormation parameters filled in: DB identifier, VPC, and all AZ subnets selected](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-5.png)](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-5.png)

The stack creates an **internal** Network Load Balancer in front of your RDS primary (its target IP
is kept current by a small failover Lambda) and a **VPC endpoint service** — the AWS PrivateLink
provider — that allows **only** the PostgresAI principal. **No inbound security-group rule or public
database port is created**; the path is outbound-only from your VPC to PostgresAI.

:::caution Keep everything in the same AWS Region
Your RDS instance, the Network Load Balancer, and the VPC endpoint service must all be in the
**same AWS Region** — AWS PrivateLink does not cross Regions. Make sure the Region you selected in
PostgresAI Console matches the Region of your RDS.
:::

## Step 5. Copy the endpoint-service name

When the stack reaches **CREATE_COMPLETE**, open its **Outputs** tab and copy the
**`VpceServiceName`** value — it looks like `com.amazonaws.vpce.<region>.vpce-svc-0abc…`.

[![CloudFormation stack Outputs tab with the VpceServiceName value highlighted](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-6.png)](/assets/rds-privatelink-monitoring/rds-privatelink-monitoring-6.png)

:::tip
The **`RevokeAccessHint`** output tells you exactly how to cut PostgresAI off later (drop the role,
remove the principal from the endpoint-service permissions, or delete the stack).
:::

## Step 6. Paste it back and deploy

Back in PostgresAI Console (wizard **Step 4**), paste the **`VpceServiceName`** into the
**VPC Endpoint Service name** field and your **RDS endpoint** hostname into the **RDS endpoint**
field, then click **Deploy**.

## Step 7. Wait for deployment

PostgresAI provisions a dedicated monitoring VM, creates an interface endpoint to your endpoint
service over **AWS PrivateLink**, and connects to your database as the read-only role.

The connection is verified automatically before monitoring is reported as active: PostgresAI
confirms it can reach the database, that the monitoring role works, and that the database belongs to
your organization. Once all checks pass, the console shows **Monitoring active — this database is
now being monitored.**

While waiting, you can set up the CLI tools:

```bash
# Install CLI
npm i -g postgresai

# Authenticate
postgresai auth

# Set up MCP for your AI coding tool (Cursor, Claude Code, etc.)
postgresai mcp install
```

:::note Deployment, Grafana, and Issues are the same across providers
The installation-progress, Grafana sign-in, and first-Issues screens are identical for every
PostgresAI monitoring setup. See the [Supabase quick start](/docs/monitoring/getting-started/quickstart-supabase)
(steps 5–8) for screenshots of those steps.
:::

## Step 8. Open Grafana dashboards

Once monitoring is active, open the Grafana URL from the console. You can sign in with the Grafana
credentials shown after deployment, or click **Sign in with PostgresAI** for passwordless access.

Start with **01. Single node performance overview (high-level)** for a high-level health check of
your RDS / Aurora database. Key panels to check first:

1. **Active session history (ASH)** — wait events over time (similar to RDS Performance Insights)
2. **Sessions** — active, idle, and idle in transaction connections
3. **TPS** — transactions per second
4. **QPS** — queries per second

## Step 9. Review first issues

After about 30 minutes, PostgresAI generates the first automated issue reports. Navigate to
**Issues** in PostgresAI Console to see detected problems and recommended actions.

Common issues detected automatically include:

- **Redundant indexes** — duplicate indexes wasting storage
- **Unused indexes** — indexes that are never scanned
- **Invalid indexes** — indexes that failed to build
- **Autovacuum tuning** — recommended configuration changes
- **Minor version updates** — available PostgreSQL updates

See [How to work with issues](/docs/postgresai-howtos/how-to-work-with-issues) for details on
managing issues, assigning team members, and integrating with AI coding tools.

## Next steps

- [Dashboard guide](/docs/monitoring/dashboards/) — complete dashboard reference
- [PostgresAI CLI](/docs/postgresai-howtos/postgresai-cli) — CLI setup and commands
- [MCP integration](/docs/postgresai-howtos/how-to-install-mcp) — set up MCP for Cursor, Claude
  Code, or other AI coding tools

## FAQ

### Does PostgresAI open any inbound ports on my account?

No. The connection uses **AWS PrivateLink** and is outbound-only: your VPC endpoint service exposes
the database to the PostgresAI principal you allowlist, with no inbound security-group rule and no
public database port. To cut PostgresAI off, drop the monitoring role, remove the PostgresAI
principal from the endpoint-service permissions, or delete the CloudFormation stack (see the
`RevokeAccessHint` stack output).

### What database role is created and what permissions does it have?

The `postgres_ai_mon` role is created with read-only, metadata-only access (`pg_monitor` plus the
`postgres_ai` helper schema). On RDS, optional superuser-only grants are skipped
(`include_optional = false`). To review the exact SQL statements at any time:

```bash
npx postgresai@latest prepare-db --print-sql
```

### What data is collected from my database?

Only database metadata — no actual data or raw query parameters. Query text is collected
**normalized** (parameters stripped) from `pg_stat_statements`. To review exactly what metrics are
collected, examine the metric definitions:

- **Prometheus sink metrics**:
  [metrics.yml (pgwatch-prometheus)](https://gitlab.com/postgres-ai/postgresai/-/blob/0.15.0/config/pgwatch-prometheus/metrics.yml)
- **PostgreSQL sink metrics** (including normalized queries):
  [metrics.yml (pgwatch-postgres)](https://gitlab.com/postgres-ai/postgresai/-/blob/0.15.0/config/pgwatch-postgres/metrics.yml)

See also: [data privacy details](/docs/monitoring/#data-privacy-metadata-only).

### Why is private-RDS monitoring available only on Scale and Enterprise?

The **AWS PrivateLink** path provisions dedicated infrastructure (a monitoring VM and an interface
endpoint) and is part of the full monitoring stack, available on the **Scale** plan and
**Enterprise**. Consulting clients get it packaged with their engagement. If you prefer not to use
PrivateLink, you can instead monitor RDS by exposing a publicly reachable database port — see
[Cloud installation](/docs/monitoring/getting-started/installation-cloud).
