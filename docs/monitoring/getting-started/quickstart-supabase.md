---
title: Quick start for Supabase
sidebar_label: Quick start for Supabase
sidebar_position: 8
keywords:
  - "PostgresAI for Supabase"
  - "Postgres monitoring for Supabase"
  - "PostgresAI checkup for Supabase"
  - "Supabase Grafana"
---

# Quick start guide for Supabase users

Set up PostgresAI monitoring for your Supabase databases using the built-in Supabase integration in
[PostgresAI Console](https://console.postgres.ai/).

## Overview

The Supabase integration uses OAuth to automatically discover your Supabase projects and provision
monitoring — no manual database credentials or network configuration required.

Two monitoring levels are available:

| Level | Includes | Plan |
|-------|----------|------|
| **Quick setup** | Auto-discovery, daily checkups, JSON reports | Free |
| **Full monitoring** | Grafana dashboards, real-time metrics, advanced alerts, historical data | Scaling |

## Prerequisites

1. A [Supabase](https://supabase.com/) account with at least one project.
2. A [PostgresAI Console](https://console.postgres.ai/) account. Sign up with Google, LinkedIn,
   GitHub, or GitLab.
3. An organization in PostgresAI Console.
   [Create one](https://console.postgres.ai/addorg) if you don't have one yet.
4. A payment method on file (required for the Scaling plan). In your organization, open **Billing**,
   click **Edit payment methods**, and add a card in the Stripe portal.

## Step 1. Start the Supabase setup

In PostgresAI Console, navigate to **Checkup — Getting started** and click **Connect Supabase**.

[![PostgresAI Console: Getting started page with the Connect Supabase button](/assets/supabase-monitoring/supabase-monitoring-1.png)](/assets/supabase-monitoring/supabase-monitoring-1.png)

## Step 2. Choose monitoring level

In the **Supabase monitoring** dialog, choose the monitoring level:

- **Quick setup** (Free) — one-click OAuth connection with auto-discovery, daily checkups, and JSON
  reports.
- **Full monitoring** (Scaling) — dedicated monitoring infrastructure with Grafana dashboards,
  real-time metrics, advanced alerts, and historical data.

See [Pricing](/pricing) for the full list of available options with feature comparison.

[![Supabase monitoring dialog: Quick setup and Full monitoring options](/assets/supabase-monitoring/supabase-monitoring-2.png)](/assets/supabase-monitoring/supabase-monitoring-2.png)

## Step 3. Authorize Supabase access

After selecting a monitoring level, you are redirected to Supabase to authorize PostgresAI.

Review the requested permissions and select the organization you want to monitor, then click
**Authorize PostgresAI**.

The requested permissions include:

- **Read and Write** access to Postgres configurations, SQL snippets, SSL enforcement
  configurations, and TypeScript schema types.
- **Read** access to the organization and all its members.
- **Read** access to project metadata, upgrade status, network restrictions, and network bans.

[![Supabase OAuth: Authorize API access for PostgresAI](/assets/supabase-monitoring/supabase-monitoring-3.png)](/assets/supabase-monitoring/supabase-monitoring-3.png)

## Step 4. Select projects and deploy

After authorization, you are returned to PostgresAI Console.

1. In **Billing & plan**, confirm your payment method.
2. In **Supabase project**, select the **Organization** and check the **Projects to provision**.
3. Optionally, expand **Advanced setup** to configure SSH keys, cloud provider, or cloud region.
4. Click **Deploy**.

[![Set up Supabase monitoring: billing, organization, and project selection](/assets/supabase-monitoring/supabase-monitoring-4.png)](/assets/supabase-monitoring/supabase-monitoring-4.png)

:::tip
PostgresAI automatically creates a dedicated monitoring user in your Supabase database and deploys
the monitoring stack. No manual database setup is required.
:::

## Step 5. Wait for deployment

After clicking **Deploy**, the monitoring stack is provisioned and configured. Track progress on the
installation page:

1. Waiting for SSH
2. Provisioning VM
3. Installing base packages
4. Starting monitoring services
5. Finishing setup

[![Monitoring installation progress page](/assets/supabase-monitoring/supabase-monitoring-5.png)](/assets/supabase-monitoring/supabase-monitoring-5.png)

While waiting, you can set up the CLI tools:

```bash
# Install CLI
npm i -g postgresai

# Authenticate
postgresai auth

# Set up MCP for your AI coding tool (Cursor, Claude Code, etc.)
postgresai mcp install
```

## Step 6. Save Grafana credentials

Once the deployment completes, the page shows **Deployment completed successfully!** with your
Grafana access details:

- **URL** — your dedicated Grafana instance
- **Username** — `monitor`
- **Password** — auto-generated

[![Deployment completed: Grafana access details with URL, username, and password](/assets/supabase-monitoring/supabase-monitoring-6.png)](/assets/supabase-monitoring/supabase-monitoring-6.png)

:::caution
Save your Grafana credentials in a password manager — they are not stored in PostgresAI Console.
:::

## Step 7. Open Grafana dashboards

Open the Grafana URL from the deployment page. You can sign in using one of the following methods:

- **Grafana credentials** — use the username and password from the previous step.
- **PostgresAI OAuth** — click **Sign in with PostgresAI** for passwordless access.

[![Grafana login page with Sign in with PostgresAI button](/assets/supabase-monitoring/supabase-monitoring-7.png)](/assets/supabase-monitoring/supabase-monitoring-7.png)

Start with **01. Single node performance overview (high-level)** for a high-level health check of
your Supabase database. Key panels to check first:

1. **Active session history (ASH)** — wait events over time
2. **Sessions** — active, idle, and idle in transaction connections
3. **TPS** — transactions per second
4. **QPS** — queries per second

## Step 8. Review first issues

After about 30 minutes, PostgresAI generates the first automated issue reports. Navigate to
**Issues** in PostgresAI Console to see detected problems and recommended actions.

[![PostgresAI Console: Issues page with auto-generated reports](/assets/supabase-monitoring/supabase-monitoring-8.png)](/assets/supabase-monitoring/supabase-monitoring-8.png)

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

### What database role is created and what permissions does it have?

The monitoring user is created automatically during Supabase setup with read-only access to metadata
only. To review the exact SQL statements used to create the monitoring role:

```bash
npx postgresai@0.15.0 prepare-db --print-sql
```

This shows all `grant` statements and confirms the minimal, read-only nature of the permissions.

### What data is collected from my database?

PostgresAI monitoring collects only database metadata — no actual data or query parameters. To
review exactly what metrics are collected, examine the metric definitions:

- **Prometheus sink metrics**:
  [metrics.yml (pgwatch-prometheus)](https://gitlab.com/postgres-ai/postgresai/-/blob/0.15.0/config/pgwatch-prometheus/metrics.yml)
- **PostgreSQL sink metrics** (including normalized queries):
  [metrics.yml (pgwatch-postgres)](https://gitlab.com/postgres-ai/postgresai/-/blob/0.15.0/config/pgwatch-postgres/metrics.yml)

See also: [data privacy details](/docs/monitoring/#data-privacy-metadata-only).
