---
title: Questions & answers
sidebar_label: Questions & answers
keywords:
  - "self-driving postgres"
  - "postgresql monitoring"
  - "database branching"
  - "postgresql thin cloning"
  - "postgresai copilot"
  - "database lab engine"
  - "postgresql automation"
---

# Questions & answers

## What is PostgresAI?

We're building self-driving Postgres. Your database monitors itself,
diagnoses problems, tests fixes, and hands you a PR. You approve, it ships.

## What is self-driving Postgres?

Every week, another million Postgres databases spin up. AI builders, startups,
side projects — everyone's shipping. But there are maybe 50,000 people on
Earth who truly understand Postgres internals. The math doesn't work.

Self-driving Postgres is the solution: databases that take care of themselves.

### The roadmap

```
2018-2024    │   FOUNDATION
             │
             │   Consulting: GitLab, Midjourney, Miro, Chewy, Suno...
             │   Thousands of RCAs, production incidents, 3am fixes
             │   Clusters scaled from 10 GiB to 100+ TiB
             │
             │   Building blocks:
             │   ├── postgres-checkup (health analysis)
             │   ├── DBLab Engine (thin cloning, branching)
             │   ├── postgres_ai monitoring (FOSS)
             │   └── PostgresAI Assistant (AI chat)
             │
             │
2025         │   COPILOT                                    ◄── WE ARE HERE
             │
             │   AI watches, diagnoses, suggests
             │   Expert validation on every recommendation
             │   You approve, you merge
             │
             │
2026         │   AUTOPILOT
             │
             │   Safe operations run automatically
             │   Risky changes still need approval
             │   Self-driving: first versions late 2026
             │
             │
2027+        │   SELF-DRIVING
             │
             │   Full autonomy
             │   Your Postgres runs itself
             │   You ship product
             │
             ▼
```

## What is DBLab?

DBLab Engine enables database branching — instant, full-size clones of your
Postgres in seconds, not hours. This lets us test every fix on a copy of your
real database before it reaches you. Experiment at incredible speed, risk-free.

More: [DBLab Engine documentation](/docs/database-lab)

## How does PostgresAI Copilot work?

```
╔════════════╗        ╔═ PostgresAI Copilot ═════════════════════╗
║    Your    ║░       ║  ┏━━━━━━━━━━━━━━┓     ┏━━━━━━━━━━━━━━┓   ║░
║  Postgres  ║░──────▶║  ┃  Monitoring  ┃────▶┃ Health check ┃   ║░
║  database  ║░       ║  ┗━━━━━━━━━━━━━━┛     ┃   & Issues   ┃   ║░
╚════════════╝░       ║                       ┗━━━━━━━━━━━━━━┛   ║░
 ░░░░░░░░░░░░░░       ╚══════════════════════════════════════════╝░
      ▲                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      │                                               │
      │                                               ▼
      │     ╔═════════════════════════╗     ╔═════════════════════╗
      └─────║ GitHub PRs / GitLab MRs ║░◀───║ AI tool (Cursor, …) ║░
            ╚═════════════════════════╝░    ╚═════════════════════╝░
             ░░░░░░░░░░░░░░░░░░░░░░░░░░░     ░░░░░░░░░░░░░░░░░░░░░░░
```

Open-source monitoring (postgres_ai) runs in your infra. Copilot watches 24/7,
catches issues before they page you, and delivers fixes as pull requests.

This isn't another monitoring tool with dashboards and alerts. Copilot gives
you actual solutions:

> `CREATE INDEX idx_orders_customer_id ON orders(customer_id);`
> — tested on a clone, validated by experts, ready to merge.

We don't throw metrics at an LLM and pray. Our AI is built on battle-tested
methodologies from 20 years of production incidents. Every recommendation is
verified against your actual data. We're a Google for Startups AI company with
rigorous experimental pipelines.

Expert + AI > Either alone.

## How much?

$500/month per cluster.

Monitoring is free, forever, open source. Copilot adds the AI layer, expert
validation, monthly deep-dive health checks, and direct Slack access to
people who've seen everything.

## Is my data safe?

Yes. Monitoring runs in your infrastructure. We see query shapes and
performance metrics — not your actual data. Your secrets stay yours.

## How do I start?

Currently in preview — reach out to nik@postgres.ai if you believe your case
can positively influence our development and need to get access faster.
