---
title: Questions & answers
sidebar_label: Questions & answers
keywords:
  - "self-driving postgres"
  - "postgresql monitoring"
  - "database branching"
  - "postgresql thin cloning"
  - "autonomous postgres"
  - "database lab engine"
  - "postgresql automation"
---

# Questions & answers

## What is PostgresAI?

We're building Self-Driving Postgres. Your database monitors itself, diagnoses problems, and delivers fixes — performance improvements, security patches, zero-downtime upgrades. Each recommendation is tested and verified on a clone of your real data.

We're not fully autonomous yet. PostgresAI watches, diagnoses, and prepares pull requests. You review, approve, and merge. Human in the loop on every change.

See the full [Vision & roadmap](/docs/roadmap).

## How does PostgresAI work?

PostgresAI combines 24/7 AI monitoring with expert validation.

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
> — tested on a clone, validated by experts, ready to merge.

## What is postgres_ai monitoring?

Open-source (Apache 2.0), enterprise-grade Postgres observability. It runs in your infrastructure and powers PostgresAI's analysis.

Features:
- **Emergency dashboard** — identify problems in 1 minute
- **Query analysis** — comprehensive performance metrics
- **Wait event analysis** — similar to AWS RDS Performance Insights
- **Health check reports** — actionable recommendations

More: [postgres_ai monitoring documentation](/docs/monitoring)

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

**$512/month per cluster** for PostgresAI.

postgres_ai monitoring is open source (Apache 2.0).

PostgresAI adds:
- AI analysis layer
- Expert validation on recommendations
- Monthly deep-dive health checks
- Direct Slack access to senior DBAs

## Is my data safe?

Yes. Monitoring can run in PostgresAI Cloud or in your own infrastructure. We see query shapes and performance metrics — not your actual data. Your secrets stay yours.

## What Postgres versions are supported?

postgres_ai monitoring supports Postgres 14+. DBLab Engine supports Postgres 9.6+.

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

**Live demo**: https://demo.postgres.ai (login: demo / password: demo)

**Contact**: nik@postgres.ai

## Where can I learn more?

- [Vision & roadmap](/docs/roadmap) — The Self-Driving Postgres journey
- [postgres_ai monitoring](/docs/monitoring) — Observability and monitoring
- [Postgres how-tos](/docs/postgres-howtos) — 100+ practical guides
