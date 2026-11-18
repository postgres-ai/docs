---
title: Install PostgresAI monitoring
sidebar_label: Install monitoring
description: How to install PostgresAI monitoring using the PostgresAI Console at console.postgres.ai.
keywords:
  - "postgresai monitoring"
  - "postgresai monitoring installation"
  - "install postgresai monitoring"
---

# How to install PostgresAI monitoring from Console

Use [PostgresAI Console](https://console.postgres.ai/) to start the PostgresAI monitoring installation and connect your Postgres instance(s).

## What you get

- **Monitoring stack**: metrics collection for Postgres, with Grafana dashboards on Scale.
- **Daily reports as issues**: recurring issue reports with detected problems and recommended actions. These issues can be integrated into a Cursor-based team workflow, including one-click actions from the issue.
- **MCP integrations via CLI**: MCP is available for Claude Code, Cursor, Windsurf, and Codex.
- **Works with Postgres anywhere**: AWS RDS, Google CloudSQL, Heroku Postgres, DigitalOcean Postgres, Supabase, Timescale Cloud, and self-managed Postgres.

## Prerequisites

1. Sign up for an account in [PostgresAI Console](https://console.postgres.ai/) using one of the supported methods: Google, LinkedIn, GitHub, or GitLab.
2. [Create](https://console.postgres.ai/addorg) a new organization.
3. In your organization, open **Billing** and add a payment method:
   1. Click **Edit payment methods**.
   2. The Stripe portal will open (URL format: `https://billing.stripe.com/...`).
   3. Add your payment method in Stripe and close the page.

## Monitoring installation

Open **Monitoring** in the left sidebar, then click **Start setup** in **Hosted by PostgresAI**.

[![PostgresAI Console: Monitoring instances page with the Monitoring menu item and the Start setup button highlighted](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-1.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-1.png)

On the **Create PostgresAI monitoring managed instance** page:

1. In **Billing & plan**, select the plan that matches your needs. If you need to update payment details, use **Manage payment methods**.
2. In **Project setup**, optionally set **Project name** (if left empty, it is generated automatically).
3. In **Database preparation**, choose one of the options:
   - **Automatic**: PostgresAI creates a dedicated monitoring user automatically (requires admin credentials during provisioning; **these credentials are not stored and are only used to create the monitoring user with the required privileges**, which is then used for ongoing monitoring).
   - **Manual**: you prepare and verify the monitoring user before deployment.
4. In **Database connection**, provide:
   - **Database URL (without password)**
   - **Database password**
5. Click **Test connection** and confirm you see **Connection successful**.

[![PostgresAI Console: Create PostgresAI monitoring managed instance page with billing, project setup, database preparation, and database connection sections](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-2.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-2.png)

:::note
The console screenshot above shows old plan terms. The current terms are:

- **Starter** (shown as **Startup**) is $16/month per cluster, not $128/month.
- **Scale** includes 13-month retention, not 6 months. Scale includes two human expert requests per
  month, with a response within 24 business hours.
- Starter and Scale do not include a dedicated Slack or Zoom support channel.

Included monthly expert requests expire at month end and do not roll over or accumulate. Purchased-pack terms are separate; [contact us](/contact) for details.

See [Pricing](/pricing) for current plans.
:::

## Advanced setup (optional)

Use **Advanced setup** to choose where the monitoring VM runs:

1. **Cloud provider**: select where the monitoring VM will be provisioned (for example, AWS or Hetzner).
2. **Cloud region**: choose the geographic region for the monitoring VM. For best results, pick a region closest to where your Postgres instance is running.

The monitoring VM runs in PostgresAI cloud and PostgresAI operates it: it gets no SSH keys of yours.
Use PostgresAI Console on both plans; Grafana dashboards are available on Scale.

[![PostgresAI Console: Advanced setup section with cloud provider selection and cloud region selection](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-3.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-3.png)

## Deploy

Review the configuration to confirm everything is filled in correctly, then click **Deploy**.

## Wait for deployment

After you click **Deploy**, wait for the monitoring stack to be provisioned and configured. Use **Progress** to track the current step.

[![PostgresAI Console: Monitoring installation progress page](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-4.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-4.png)

While waiting, you can optionally set up the CLI tools — see [PostgresAI CLI](/docs/postgresai-howtos/postgresai-cli).

## After deployment

After deployment, open **Checkup reports** and **Issues** in your organization in [PostgresAI Console](https://console.postgres.ai/) to review findings and action plans. This is the route for Starter; Starter does not include Grafana dashboards.

After the first checkup, a checkup runs every day. Each issue covers one checkup type: a later
daily checkup does not open a second issue of the same type, and does not reopen one you closed.
Every Monday (from 15:00 UTC), a weekly review issue arrives with the week's verdict, actions and
top queries.

### Grafana access (Scale only) {#grafana-access-scale-only}

On Scale, the deployment confirmation also includes **Grafana access** details:

[![PostgresAI Console: Deployment completed successfully and Grafana access details](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-5.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-5.png)

- **URL**: open the Grafana URL provided on the page.
- **Username / password**: use the credentials shown in the form.
- **Save your credentials**: Grafana credentials are not stored in PostgresAI Console, so save them in your password manager.

## View the instance page

You can open the instance details page from the instances list:

1. In the left sidebar, click **Monitoring** to open **Monitoring instances**.
2. Select your instance in the list to open the **Monitoring instance** page.
3. Review the instance details such as status and IP address. Scale also shows the Grafana URL; Starter users continue in Console Checkup reports and Issues.

[![PostgresAI Console: Monitoring instance details page with Grafana URL and status](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-6.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-6.png)

## Open Grafana (Scale only)

Open the Grafana URL from **After deployment** (or from the instance page). You can sign in using one of the following methods:

- **Grafana credentials**: use the username and password shown in **Grafana access** after deployment.
- **OAuth**: click **Sign in with PostgresAI**.

[![Grafana: sign in with username/password or with PostgresAI](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-7.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-7.png)

If you choose OAuth, approve the access request by clicking **Authorize**.

[![PostgresAI ↔ Grafana: OAuth authorization screen with the Authorize button](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-8.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-8.png)

After authorization, you will be redirected to Grafana and can open dashboards.

[![Grafana: dashboards after successful sign-in](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-9.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-9.png)

## Next steps

Monitoring is ready about 10 minutes after you click **Deploy**, and the first issues arrive within about 30 minutes. See [How to work with issues](/docs/postgresai-howtos/how-to-work-with-issues) to learn about managing issues, assigning team members, and integrating with AI coding tools.

## Getting support

Async email / Slack product support is included with PostgresAI monitoring — please [use one of the available ways to contact](/contact/).
