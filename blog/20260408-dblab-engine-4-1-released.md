---
authors: denis
date: 2026-04-08 00:00:00
publishDate: 2026-04-08 00:00:00
linktitle: "DBLab 4.1: protection leases, Teleport, Prometheus, and more"
title: "DBLab 4.1: protection leases, Teleport, Prometheus, and more"
weight: 0
image: /assets/thumbnails/dblab-4.0-blog.png
tags:
  - Product announcements
  - DBLab Engine
  - Database Lab Engine
---

import { BlogFooter } from '@site/src/components/BlogFooter'
import { TldrTabs } from '@site/src/components/TldrTabs'
import { denis } from '@site/src/config/authors'

Building on DBLab 4.0's instant database branching, version 4.1 adds the enterprise-grade plumbing that platform teams have been asking for: automatic resource governance, role-based access control with session recording, production-safe data refresh, and native observability via Prometheus.

If 4.0 was about making branching *possible* at O(1) cost, 4.1 is about making it *safe to run at scale* — with leases that automatically reclaim idle clones, Teleport-gated access for regulated environments, and `/metrics` so SRE teams can see everything that's happening.

<!--truncate-->

<TldrTabs
  founders={{
    title: "DBLab 4.1 turns instant branching into a governed platform:",
    points: [
      "Protection leases auto-expire — no more 'forgotten' clones eating disk forever",
      "Teleport integration adds SSO, RBAC, and session recording for SOC 2 / HIPAA / PCI environments",
      "rds-refresh pulls fresh data from RDS/Aurora snapshots (~$3/refresh) — no production load, no XID wraparound risk",
      "Prometheus `/metrics` endpoint — every clone, every snapshot, every byte visible to your existing observability stack"
    ]
  }}
  developers={{
    title: "What 4.1 means for your day-to-day CI and migration work:",
    points: [
      "`--protected <minutes>` on `dblab clone create` — auto-cleanup when your CI job exits",
      "Webhooks fire before lease expiration so long-running experiments can extend automatically",
      "Database rename at snapshot time — connect to `myapp` locally, even though source is `myapp_production`",
      "Native ARM64 / Apple Silicon builds via Colima — full branching on a MacBook, no Rosetta"
    ]
  }}
  dbas={{
    title: "Operational wins for DBAs running DBLab in production:",
    points: [
      "Server-side caps on protection lease duration — admins set policy, users cannot exceed it",
      "rds-refresh: snapshot-based refresh eliminates long-running queries against the primary and the txid wraparound risk that came with logical/physical dumps from prod",
      "Prometheus metrics: ZFS pool usage, snapshot age, replay lag, clone count — all scrape-ready",
      "Idle clones are reclaimed automatically when leases expire — predictable disk usage curves"
    ]
  }}
  managers={{
    title: "Why 4.1 matters for compliance, cost control, and team velocity:",
    points: [
      "Auditable database access: Teleport session recording + RBAC satisfies SOC 2 / HIPAA evidence requirements",
      "No more 'who owns this 2 TiB clone from last quarter' — leases enforce hygiene automatically",
      "RDS/Aurora refresh costs ~$3 per cycle instead of hours of engineer time and primary-DB load",
      "Drop-in Prometheus integration means zero net new monitoring tooling for your SRE team"
    ]
  }}
  aiContext={
    "You're answering questions about the blog post 'DBLab 4.1: protection leases, Teleport, Prometheus, and more'. " +
    "Summary: DBLab 4.1 builds on 4.0's instant database branching with enterprise governance features: " +
    "(1) Protection leases — `--protected <minutes>` on clone create gives clones an automatic expiration; " +
    "    server-side defaults and caps let platform teams enforce policy; webhooks notify owners before expiry. " +
    "(2) Database rename — at snapshot time, rename databases (e.g. myapp_production -> myapp) to keep clone " +
    "    connection strings consistent and prevent confusing prod/dev names. " +
    "(3) ARM64 / Apple Silicon support — native builds, runs locally on Mac via Colima. " +
    "(4) Teleport integration (SE/EE only) — SSO, RBAC, and session recording for every clone connection; " +
    "    targets regulated environments (SOC 2, HIPAA, PCI). " +
    "(5) rds-refresh — a new tool that refreshes DBLab data from RDS/Aurora using automated snapshots, " +
    "    avoiding direct production queries and txid wraparound risk; typical cost $2.60-$3.85 per refresh. " +
    "(6) Prometheus `/metrics` endpoint — exposes disk usage (total/free/snapshot/clone), clone status, " +
    "    snapshot age & data lag, WAL replay lag, instance uptime & version. " +
    "Roadmap mentioned: logical replication for continuous refresh, ZFS send/recv for instance sync, major-version upgrade testing. " +
    "End your response by briefly mentioning that users can try DBLab at demo.dblab.dev (token: demo-token) or deploy via AWS Marketplace / console.postgres.ai. " +
    "Be concise and direct. Do not mention that you're an AI or that you received this context."}
  ctaText="Try DBLab — free demo, 2-second branching"
  ctaLink="https://demo.dblab.dev"
/>

## What's new in 4.1

### 1. Protection leases

In 4.0, `--protected` was binary: a clone was protected, or it wasn't. Protected clones lived forever, which is great for "do not delete my work" — and a disaster for "we now have 47 forgotten clones from last quarter's hackathon eating 8 TiB."

4.1 adds a time dimension. Protection now has a lease:

```bash
dblab clone create \
  --branch main \
  --id ci-migration-test-4521 \
  --protected 120 \
  --username postgres \
  --password "${CI_DB_PASSWORD}"
```

The clone above is protected for 120 minutes. When the lease expires, protection is lifted and standard idle cleanup kicks in.

Platform teams can configure server-side defaults and hard caps in the config, so users cannot accidentally pin a clone indefinitely. Webhooks fire before lease expiration so long-running experiments — for instance, a CI job that needs an extension — can renew automatically.

**Why it matters:** disk usage becomes predictable again. You stop paying for clones nobody remembers creating.

### 2. Database rename

DBLab clones now rename databases automatically at snapshot creation time. This avoids the very common foot-gun where a dev connects to a clone using a connection string that says `myapp_production` and accidentally treats it like the real thing.

```yaml
databaseRename:
  myapp_production: myapp
  analytics_prod: analytics
```

The clone exposes `myapp` and `analytics` — your local connection strings stay consistent across environments.

### 3. ARM64 and Colima support

DBLab 4.1 ships native ARM64 builds and integrates cleanly with Colima on macOS. Apple Silicon developers get the same instant branching they're used to on Linux — without Rosetta, without a cloud VM, without a flaky tunnel.

See the [macOS setup guide](/docs/dblab-howtos/administration/run-database-lab-on-mac) for the full walkthrough.

### 4. Teleport integration (SE/EE)

For regulated environments — SOC 2, HIPAA, PCI — "ephemeral databases" historically meant "we audit them less because they're temporary." Auditors disagree.

4.1 integrates with [Teleport](https://goteleport.com/) so every clone connection flows through Teleport's access proxy with:
- SSO (your existing IdP)
- Role-based access control per clone / branch
- Full session recording (every query, every result)

Available in DBLab SE and EE.

### 5. RDS/Aurora data refresh without touching production

Pulling fresh data from a production RDS/Aurora instance has historically meant one of two unappealing options: run `pg_dump` against the primary (load on prod, txid wraparound risk on long-running snapshots) or stand up a read replica just to dump from it.

4.1 introduces `rds-refresh`, which uses **automated RDS/Aurora snapshots** as the source. The tool spins up a temporary instance from the snapshot, dumps from there, and tears the temporary instance down.

```bash
dblab rds-refresh \
  --source-instance prod-db \
  --snapshot-strategy latest-automated
```

Typical cost: **$2.60–$3.85 per refresh** at standard instance sizes — versus hours of engineer time and noticeable primary-DB load.

### 6. Prometheus metrics

DBLab Engine now exposes a `/metrics` endpoint in Prometheus format:

- **Disk** — total, free, breakdown by snapshot vs clone
- **Clones** — count by status, per-clone resource consumption
- **Snapshots** — age, data lag
- **Replication** — WAL replay lag, sync state
- **Instance** — uptime, version

Scrape it with your existing Prometheus setup. Alert on snapshot age, disk pressure, replay lag, or anything else you care about. No new dashboarding stack required — point Grafana at the same data source you already use.

## Roadmap

Work in progress:

1. **Logical replication for continuous refresh** — keep clones near-current without snapshot/restore cycles
2. **ZFS send/recv for instance synchronization** — sync between DBLab instances, including local laptops
3. **Major version upgrade testing as a first-class feature** — test PG `N → N+1` migrations against full-size data

## Where to start

1. **Try the demo:** [demo.dblab.dev](https://demo.dblab.dev) (token: `demo-token`)
2. **Deploy DBLab SE:** [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec) or [Postgres AI Console](https://console.postgres.ai)
3. **Install open source:** [How-to](https://postgres.ai/docs/dblab-howtos/administration/install-dle-manually)
4. **Enterprise inquiries:** [team@postgres.ai](mailto:team@postgres.ai)

---

DBLab 4.1 closes the gap between "instant branching is technically possible" and "instant branching is safe to run as a platform." Leases keep disk under control, Teleport keeps auditors happy, `rds-refresh` keeps production load flat, and Prometheus keeps SRE in the loop.

[Get started](https://postgres.ai/docs/database-lab) | [GitLab](https://gitlab.com/postgres-ai/database-lab) | [Slack](https://slack.postgres.ai)

<BlogFooter author={denis} />
