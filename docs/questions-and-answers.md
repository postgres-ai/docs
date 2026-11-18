---
title: Questions & answers
sidebar_label: Questions & answers
keywords:
  - "postgresql monitoring"
  - "database branching"
  - "postgresql thin cloning"
  - "database lab engine"
  - "postgresql automation"
---

# Questions & answers

## What is PostgresAI?

Slow queries, incidents, major upgrades and growth: PostgresAI combines monitoring, expert help and database branching to address Postgres trouble. Changes are tested on a copy of your data before they reach production.

Human or agent, the same rule applies: review the evidence and approve the change before production.

See the full [Vision & roadmap](/docs/roadmap).

## How does PostgresAI work?

PostgresAI combines 24/7 AI monitoring with human expert assistance on request, subject to your plan allowance or purchased requests.

```
╔════════════╗        ╔════════════ PostgresAI ═══════════════════╗
║    Your    ║░       ║  ┏━━━━━━━━━━━━━━┓     ┏━━━━━━━━━━━━━━┓    ║░
║  Postgres  ║░──────▶║  ┃  Monitoring  ┃────▶┃ Health check ┃    ║░
║  database  ║░       ║  ┗━━━━━━━━━━━━━━┛     ┃   & Issues   ┃    ║░
╚════════════╝░       ║                       ┗━━━━━━━━━━━━━━┛    ║░
 ░░░░░░░░░░░░░░       ╚═══════════════════════════════════════════╝░
      ▲                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      │                                               │
      │                                               ▼
      │     ╔═════════════════════════╗     ╔═════════════════════╗
      └─────║ GitHub PRs / GitLab MRs ║░◀───║ AI tool (Cursor, …) ║░
            ╚═════════════════════════╝░    ╚═════════════════════╝░
             ░░░░░░░░░░░░░░░░░░░░░░░░░░░     ░░░░░░░░░░░░░░░░░░░░░░░
```

PostgresAI gives you actual solutions, not just alerts:

> `CREATE INDEX idx_orders_customer_id ON orders(customer_id);`
> — tested on a clone, with expert review available on request within plan or purchased-request limits.

## What is PostgresAI monitoring?

Open-source (Apache 2.0), enterprise-grade Postgres observability. It runs in your infrastructure and powers PostgresAI's analysis.

Features:
- **Emergency dashboard** — identify problems in 1 minute
- **Query analysis** — comprehensive performance metrics
- **Wait event analysis** — similar to AWS RDS Performance Insights
- **Health check reports** — actionable recommendations

More: [PostgresAI monitoring documentation](/docs/monitoring) and the [product page](/products/monitoring)

## What is DBLab Engine?

DBLab Engine enables database branching — instant, full-size clones of your Postgres in seconds, not hours. This lets us test every fix on a copy of your real database before it reaches you.

Key capabilities:
- Thin clones using ZFS or LVM
- Full production data, created in seconds
- Test migrations, indexes, and queries risk-free

More: [DBLab Engine documentation](/docs/database-lab)

## What are Issues?

Issues are core to PostgresAI. When a problem is detected, the system creates an Issue with:

- Clear description of the problem
- Severity and impact assessment
- Specific fix recommendation
- Supporting evidence

Issues can be turned into pull requests using AI coding tools (Cursor, etc.).

## How much does it cost?

**Starter is $16/month per cluster**: primary only, Full monitoring, 14-day retention, and no included human expert requests. **Scale is $512/month per cluster**: one primary + up to 5 replicas in one cluster, 13-month retention, Grafana dashboards, Private RDS / PrivateLink, Trend analysis (Performance Cliffs and Walls), and two human expert requests per month on two topics.

Both include Checkup reports, Work with your AI agent, Issues and action plans, historical root cause analysis, email and Slack notifications when PostgresAI opens or updates an issue, and async email / Slack support. Scale has a response guarantee within 24 business hours and a one-week issue conversation. Neither plan includes a dedicated channel.

Included monthly expert requests expire at month end and do not roll over or accumulate. Purchased-pack terms are separate; [contact us](/contact) for details.

Both plans offer a one-off pack of two additional expert requests for $500. [Contact us](/contact) about pack terms or Enterprise. For ongoing expert help, compare upgrading with buying packs; buying an expert pack does not change your plan. See [Pricing](/pricing) for the full comparison.

The monitoring software is open source (Apache 2.0). Hosted monitoring plans are separate from self-hosting the software.

## Is my data safe?

Yes. Monitoring can run in PostgresAI Cloud or in your own infrastructure. We see query shapes and performance metrics — not your actual data. Your secrets stay yours.

## What Postgres versions are supported?

PostgresAI full monitoring, express-mode checkups, and Console checkup analysis
support Postgres 14 through PostgreSQL 19. PostgreSQL 19 is currently RC1,
so use that version for compatibility testing rather than production workloads
until general availability. DBLab Engine supports Postgres 10+.

## Does it work with managed Postgres?

Yes. PostgresAI works with:
- Amazon RDS and Aurora
- Google Cloud SQL
- Azure Database for Postgres
- Supabase
- Any self-managed Postgres

## How do I get started?

1. [Install PostgresAI monitoring](/docs/postgresai-howtos/install-postgres-ai-monitoring-from-postgresai-console)
2. Start receiving Issues and fixes

**Contact**: nik@postgres.ai

## Where can I learn more?

- [Vision & roadmap](/docs/roadmap) — PostgresAI vision and roadmap
- [PostgresAI monitoring](/docs/monitoring) — Observability and monitoring
- [Postgres how-tos](/docs/postgres-howtos) — 100+ practical guides
