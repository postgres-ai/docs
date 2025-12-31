---
title: Vision & roadmap
sidebar_label: Vision & roadmap
slug: /roadmap
description: PostgresAI's vision for Self-Driving Postgres and the roadmap to get there
keywords:
  - "self-driving postgres"
  - "postgresai roadmap"
  - "postgresql automation"
  - "autonomous postgres"
  - "database autonomy"
---

# Vision & roadmap

## The problem

Every week, another million Postgres databases spin up. AI builders, startups, side projects — everyone's shipping. But there are maybe 50,000 people on Earth who truly understand Postgres internals. The math doesn't work.

Most teams don't have a senior DBA. When something breaks at 3am, they're on their own — googling error messages, hoping Stack Overflow has answers, praying the production database survives until morning.

## The solution: Self-Driving Postgres

Databases that take care of themselves. Your Postgres monitors itself, diagnoses problems, and delivers fixes — performance improvements, security patches, zero-downtime upgrades. Each recommendation is tested and verified on a clone of your real data.

This isn't a dashboard with more alerts. It's not another monitoring tool that tells you something is wrong and leaves you to figure it out. It's an AI system built on 20 years of production incident experience that actually fixes your problems.

We're not there yet. Today, **PostgresAI** watches, diagnoses, and prepares pull requests. You review, approve, and merge. Human in the loop on every change. As trust builds, we'll move toward full autonomy.

## The roadmap

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
2025         │   POSTGRESAI                                   ◄── WE ARE HERE
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

## Principles & ideas

### 1. Expert + AI > Either alone

We don't throw metrics at an LLM and pray. Our AI is built on battle-tested methodologies from 20 years of production incidents. Every recommendation is verified against your actual data. We're a Google for Startups AI company with rigorous experimental pipelines.

### 2. Test everything on real data

Thanks to DBLab Engine's thin cloning technology, every fix can be tested on a full copy of your production database before it reaches you. Not a sample. Not synthetic data. Your actual schema, your actual data volumes, your actual query patterns.

### 3. Your data stays yours

Monitoring can run in PostgresAI Cloud or in your own infrastructure. We see query shapes and performance metrics — not your actual data. Your secrets stay yours.

### 4. Gradual autonomy

We don't believe in "trust us, we're AI." PostgresAI starts with human approval on everything. As trust builds, safe operations can be automated. Risky changes always need a human in the loop.

### 5. Open source foundation

The core monitoring tool (postgres_ai) is Apache 2.0 licensed. We believe in transparency and community-driven development. The building blocks are open; the intelligence layer is how we sustain the business.

## Current milestone: PostgresAI (2025)

Here's how PostgresAI works today:

```
╔════════════╗        ╔════════════ PostgresAI ═══════════════════╗
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

### Components

1. **postgres_ai monitoring** — Open-source, enterprise-grade observability running in your infrastructure
2. **Health checks & Issues** — Automated detection of problems with actionable recommendations
3. **AI-powered fixes** — Integration with AI coding tools to generate pull requests
4. **Expert validation** — Every recommendation backed by human Postgres expertise

### What PostgresAI delivers

- 24/7 monitoring that catches issues before they page you
- Actual solutions, not just alerts:
  > `CREATE INDEX idx_orders_customer_id ON orders(customer_id);`
  > — tested on a clone, validated by experts, ready to merge
- Monthly deep-dive health checks from senior DBAs
- Direct Slack access to people who've seen everything

## Future milestones

### Autopilot (2026)

- Safe operations (index creation, vacuum tuning, parameter adjustments) run automatically
- Risky changes (schema migrations, major version upgrades) still require approval
- First versions of true self-driving capabilities by late 2026

### Self-Driving (2027+)

- Full database autonomy
- Postgres runs itself: monitoring, optimization, scaling, recovery
- You focus on shipping product, not managing infrastructure

## Pricing

**$512/month per cluster.**

postgres_ai monitoring is open source (Apache 2.0). PostgresAI adds the AI layer, expert validation, monthly deep-dive health checks, and direct Slack access to senior DBAs.

## Get started

- [Install PostgresAI monitoring](/docs/postgresai-howtos/install-postgres-ai-monitoring-from-postgresai-console)
- [Live demo](https://demo.postgres.ai)
- Contact: nik@postgres.ai

---

## DBLab Engine roadmap

DBLab Engine is the thin cloning technology that enables testing fixes on real data. Below is the detailed development roadmap.

<details>
<summary>View detailed DBLab Engine roadmap</summary>

### Physical provisioning
Physical provisioning: native support of DB provisioning from archives created by a specific backup solution or based on an existing Postgres database

- [ ] Support various sources
    - [x] Generic (anything: pg_basebackup, rsync, any backup tools)
    - Native support for specific backup tools
        - [x] WAL-E/WAL-G
        - [x] pgBackRest
        - [ ] Barman
        - [ ] pg_probackup
- [x] Continuously updated state (physical replication based on WAL shipping)
- [x] Snapshot management (schedule, retention policy)

### Logical provisioning
Logical provisioning: native support of DB provisioning for managed Postgres databases

- [x] Support various sources
    - [x] Any Postgres DB via dump/restore: Amazon RDS, Heroku Postgres, Azure Postgres, GCP CloudSQL, Digital Ocean Postgres, etc.
    - [x] AWS: RDS IAM
    - [ ] GCP: CloudSQL IAM
    - [ ] Azure IAM
    - [x] Restore from backups stored on AWS S3
        - [x] uncompressed
        - [x] compressed (gzip, bzip2)
- [ ] Continuously updated state (logical replication)
- [x] Dump/restore on the fly (without need to save dumps on disk)
- [x] Multiple pools, rotation/refresh on schedule
    - [ ] "Selected pool": allow to specify pool for the case when multiple DBLab instances are running on the same machine
    - [ ] Advanced refresh policies: force refresh on pools being in use, warning period, number of retries before forcing
- [ ] Partial data retrieval
    - [x] specific databases
    - [x] specific tables
    - [ ] arbitrary filtering (column and row filtering)

### Engine features
- [x] Persisting clones when the engine restarts (added in DBLab 3.0.0)
- [ ] Point-in-time recovery (PITR) (Can be used for ultra-fast recovery of accidentally deleted data)
- [ ] Troubleshoot/test standby behavior
    - [ ] Creating a clone running in read-only mode to allow troubleshooting hot standby issues
    - [ ] Support for launching N replicas for a clone
    - [ ] For the "physical" mode: creating clone from "pre" snapshot (read-only, unpromoted; admins only)
- [ ] Duplicate DBLab instance (create a new DBLab based on existing one)
- [ ] Clone observability
    - [ ] "Temporary" system- and Postgres-level monitoring for clones/sessions
    - [ ] Clone analytics
    - [ ] Advanced audit
    - [ ] perf/FlameGraphs
- [ ] Utilization of DBLab instance and alerts
- [ ] Usage and estimated savings reports
- [x] SSH port forwarding for API and Postgres connections
- [ ] Tags
- [ ] Framework for macro database experiments (work with thick/regular clones)
- [ ] Auto-register DBLab in Platform
- [x] Resource usage quotas for clones: CPU, RAM (container quotas, supported by Docker)
- [ ] User quotas
- [ ] Disk quotas (`zfs set quota=xx`)
- [x] GUI with key features (added in DBLab 3.0.0)
- [ ] Fast connection to clone's DB via CLI
- [ ] Advanced snapshot management
    - [ ] API handle to create/destroy snapshots (for continuously updated state)
    - [x] User-defined snapshots for clones
    - [ ] Snapshot export/import (S3)
- [ ] Advanced schema management
    - [ ] schema diff
    - [ ] zero-downtime DDL auto-generation
- [x] Reset clone's state to particular database version – keeping DB creds the same (including port)
    - [x] physical: allow choosing `dataStateAt`
    - [x] logical: allow "jumping" between DB versions (pools)

### Platform features
- [x] Support working with multiple DBLab instances
- [x] Backups, PITR
- [x] User management: basic permissions
- [ ] User management: advanced permissions
- [ ] SSO
- [ ] Clone (Postgres, Postgres over SSH / port forwarding) connection options
    - [ ] LDAP
    - [ ] SSH key management
- [ ] Security
    - [ ] Security overview: software used, incidents, code analysis
    - [x] Basic audit logging
    - [ ] Advanced audit logging and alerting
    - [ ] Export audit logs from GUI
    - [ ] Send events to SIEM
- [ ] Usage stats
- [x] Monitoring (Netdata)
- [ ] Notifications
    - [ ] Notification management – turn on/off all or specific ones
    - [ ] Non-deletable clone is abandoned / not used for too long
    - [ ] Clone and snapshot are using too much disk space / out-of-disk-space risks
    - [ ] CPU saturation
    - [ ] Disk space saturation
    - [ ] Disk IO saturation
    - [ ] Refresh cannot be done because all pools are busy and policy doesn't allow forced refresh
    - [ ] Full refresh started
    - [ ] Full refresh finished
    - [ ] Lag value is too high ("sync" container)
    - [ ] Initial data retrieval started
    - [ ] Initial data retrieval finished
    - [ ] Snapshot created
    - [ ] Snapshot deleted
- [x] Pricing, billing
    - [x] report usage to postgres.ai
    - [x] flexible pricing options
    - [x] AWS: instance type and size based

### Automated verification of database migrations
- [x] History and logging for clones/sessions
- [x] Automated detection of locking issues
- [x] Setting custom `statement_timeout`
- [x] Postgres logs for the migration
- [x] Report in CI and Platform
- [ ] Integration with CI tools – advanced integration
    - [x] GitHub Actions
    - [ ] Bitbucket CI/CD
    - [ ] CircleCI
    - [ ] Jenkins
    - [ ] GitLab CI/CD
    - [ ] Bamboo
    - [ ] TravisCI
- [x] Support various database migration tools + demo
    - [x] Sqitch
    - [x] Flyway
    - [x] Liquibase
    - [x] Ruby on Rails Active Record
    - [x] Django migrations
- [x] "Production timing" estimator (experimental feature, added in DBLab 2.3.0, removed in DBLab 3.4.0)
- [x] More artifacts to support decisions: pg_stat_*, system usage, WAL, checkpoints, etc.

### Cloning (CoW technology)
- [x] ZFS
- [x] LVM
- [ ] Storage-based CoW

### Automation, clouds, Kubernetes
- [ ] Simplify setup for major Cloud Service Providers, automation of installation in clients' accounts
    - [x] Basic Terraform templates
    - [x] One-click setup on AWS. AWS Marketplace
    - [ ] One-click setup on GCP. GCP Marketplace
    - [ ] One-click setup on Azure. Azure Marketplace
- [ ] Cloud DBLab Platform ("DBLab SaaS"): cloud offering (fully managed DBLab)
    - [ ] AWS
    - [ ] GCP
    - [ ] Azure
- [ ] Self-managed DBLab Platform ("DBLab Enterprise"): work with multiple DBLab instances and all platform features in customer's account
- [ ] Cost optimization
    - [ ] AWS spot instances
    - [ ] GCP preemptible instances (24h max)
    - [ ] Azure spot instances
    - [ ] AWS/GCP/Azure: Self-stopping instances for cost savings, keeping disk present, and refreshing when needed
- [ ] Kubernetes support
    - [ ] DBLab operator
    - [ ] Integration with [StackGres](https://stackgres.io)
        - [x] PoC (logical, physical: WAL-E/G)
        - [ ] integration
    - [ ] Support [CSI Volume Cloning](https://kubernetes.io/docs/concepts/storage/volume-pvc-datasource/) (GA: k8s 1.18)

### SQL optimization chatbot (Joe bot)
- [x] Web UI version
- [x] Slack chatbot
- [ ] Telegram chatbot
- [x] History with Search and Share options
- [ ] Visualizations
    - [x] explain.depesz
    - [x] explain.dalibo (PEV2)
    - [ ] pgMustard (WebUI/SaaS only)
    - [x] FlameGraphs
- [ ] Better optimization recommendations
- [ ] Macroanalysis insights (suggestions based on postgres-checkup / pgss)
- [x] Hypothetical indexes
- [ ] Hypothetical partitioning
- [ ] Index advisor
- [ ] Utilization control
- [x] Restore user sessions after Joe container restarts
- [ ] Chatbot security
    - [x] Do not use DB superuser
    - [x] Quotas (rate limits)
    - [ ] Alerting admins when a quota is reached
- [ ] Runtime execution plan observability: [pg_query_state](https://github.com/postgrespro/pg_query_state)
- [ ] Reset to specific `dataStateAt`
- [ ] perf/FlameGraphs
- [ ] Wait event sampling
- [ ] Heavylock analysis

### Data masking and anonymization
- [x] Basic support for masking and obfuscation
    - [x] custom scripts
    - [x] parallel execution of custom scripts
    - [x] [postgres_anonymizer](https://postgresql-anonymizer.readthedocs.io/en/stable/masking_functions.html)
    - [x] [kitchen-sync](https://github.com/willbryant/kitchen_sync)
    - [ ] [pgsync](https://github.com/ankane/pgsync)
- [ ] Hybrid setup: raw and obfuscated/masked clones on the same DBLab instance
- [ ] Dump/restore with runtime anonymization, parallelized, via GitOps
- [ ] Simplified setup for anonymization - GUI
- [ ] Automated masking / anonymization

</details>
