---
title: PostgresAI monitoring overview
sidebar_label: Overview
slug: /monitoring
keywords:
  - "PostgreSQL monitoring"
  - "Postgres observability"
  - "PostgresAI monitoring"
  - "Grafana dashboards for PostgreSQL"
  - "PostgreSQL performance monitoring"
  - "database monitoring"
---

# PostgresAI – enterprise-grade Postgres observability tool

<img src="https://gitlab.com/postgres-ai/postgresai/-/raw/main/assets/postgresai.png" alt="PostgresAI monitoring" width="800" />

Expert-level Postgres monitoring tool designed for humans and AI systems

Built for senior DBAs, SREs, and AI systems who need rapid root cause analysis and deep performance insights. This isn't a tool for beginners — it's designed for Postgres experts who need to understand complex performance issues in minutes, not hours.

Part of [Self-Driving Postgres](/blog/20250725-self-driving-postgres) - PostgresAI monitoring is a foundational component of PostgresAI's open-source Self-Driving Postgres (SDP) initiative, providing the advanced monitoring and intelligent root cause analysis capabilities essential for achieving higher levels of database automation.

## Live demo
Experience the full monitoring solution: https://demo.postgres.ai (login: demo / password: demo)


## Console.Postgres.ai integration

PostgresAI monitoring integrates with [Console.Postgres.ai](https://console.postgres.ai), enabling:

- **Automated health checks (checkups)** — Comprehensive database health assessments with actionable recommendations, running automatically on schedule
- **PostgresAI consulting support** — Consulting customers benefit from shared monitoring access, allowing the PostgresAI team to work more efficiently on performance optimization and troubleshooting

## Key features

- **Open source foundation** – PostgresAI core components are Apache 2.0 licensed, ensuring transparency and community-driven development
- **Metadata only** — Only database metadata is collected (statistics, query patterns, wait events). No actual data or query parameters are accessed. [See data privacy details](#data-privacy-metadata-only)
- **Expert-focused design**: Assumes deep Postgres knowledge and performance troubleshooting experience

- **Universal integration** – Works with any type of Postgres, including:
  - All popular cloud platforms (RDS, CloudSQL, Azure Database, Supabase, TigerData, and more)
  - Self-managed Postgres installations
  - Kubernetes deployments
- **Top-down troubleshooting methodology**: Follows the Four Golden Signals approach (Latency, Traffic, Errors, Saturation)


- **Powerful dashboards** featuring:
  - **Emergency dashboard** – "Shallow but wide" analysis of all database components and key metrics to identify problematic areas within 1 minute (ideal for incident troubleshooting)
  - **Query analysis** – Top-to-bottom examination with comprehensive metrics for complete visibility into performance patterns and bottlenecks
  - **Wait event analysis** – Similar to AWS RDS Performance Insights and CloudSQL Query Insights, providing deep visibility into database wait events



- **Renowned PostgresAI health check reports** – Comprehensive health assessments with actionable recommendations based on industry best practices and real-world experience

- **AI-powered insights backed by human expertise** – From diagnostics to mitigation strategies, combining artificial intelligence with seasoned Postgres expert knowledge for actionable recommendations

## Documentation

- **[Getting started](/docs/monitoring/getting-started/)** — Installation guides for CLI, Docker, Helm, and cloud platforms
- **[Dashboards](/docs/monitoring/dashboards/)** — Complete reference for all 14 Grafana dashboards
- **[Metrics reference](/docs/monitoring/metrics/)** — Detailed metrics documentation
- **[Configuration](/docs/monitoring/configuration/)** — Customization and alerting setup
- **[Troubleshooting](/docs/monitoring/troubleshooting/)** — Common issues and solutions
- **[Advanced topics](/docs/monitoring/advanced/)** — Multi-cluster, custom metrics, API integration

## Data privacy: metadata only

PostgresAI monitoring collects **only database metadata** — no actual data or query parameters are ever accessed or stored.

### What is collected

- **Database statistics** from system views (`pg_stat_*`)
- **Normalized query texts** from `pg_stat_statements` (with parameter values replaced by `$1`, `$2`, etc.)
- **Wait event information** from `pg_stat_activity`
- **Table and index statistics** (sizes, access patterns, bloat estimates)

### What is NOT collected

- Actual table data
- Query parameter values
- Connection credentials
- Application data

### Verify collected metrics

Review exactly what metrics are collected by examining the metric definitions:

- **Prometheus sink metrics**: [metrics.yml (pgwatch-prometheus)](https://gitlab.com/postgres-ai/postgresai/-/blob/0.15.0/config/pgwatch-prometheus/metrics.yml)
- **PostgreSQL sink metrics** (including normalized queries): [metrics.yml (pgwatch-postgres)](https://gitlab.com/postgres-ai/postgresai/-/blob/0.15.0/config/pgwatch-postgres/metrics.yml)

### Verify database permissions

The monitoring user has read-only access to metadata only. To review the exact SQL statements used to create the monitoring role:

```bash
npx postgresai@0.15.0 prepare-db --print-sql
```

This shows all `GRANT` statements and confirms the minimal, read-only nature of the permissions.

## Get started with Console.Postgres.ai

The easiest way to set up PostgresAI monitoring is through [Console.Postgres.ai](https://console.postgres.ai):

1. Navigate to **Checkup → Monitoring instances** in the left menu
2. Click **Choose plan**
3. Select **Starter** or **Scale** plan

See [pricing](/pricing) for plan details and features. 
