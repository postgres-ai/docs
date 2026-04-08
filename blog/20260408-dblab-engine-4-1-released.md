---
authors: [nik, bogdan]
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
import { nik } from '@site/src/config/authors'

DBLab Engine 4.1 is a release focused on making database branching safer, more convenient, and ready for enterprise adoption. Whether you are a solo developer running DBLab on a MacBook or a platform team managing clones for hundreds of engineers, this release has something for you.

<!--truncate-->

The 4.0 release introduced instant database branching with O(1) economics. With 4.1, we are strengthening the foundation: better resource governance, enterprise-grade access control, production-safe data refresh, and observability that lets you sleep at night.

## Protection leases: safe resource management

This is the headline quality-of-life improvement. In previous versions, a protected clone stayed protected forever -- even if nobody was using it. Forgotten protected clones would quietly consume disk and compute, becoming a problem for the entire team.

DBLab 4.1 introduces **protection leases** -- time-limited protection that expires automatically.

### How it works

When creating a clone, you can now specify a protection duration:

```bash
# Create a clone protected for 24 hours
dblab clone create \
  --branch main \
  --id my-experiment \
  --protected 1440 \
  --username postgres \
  --password secret
```

A background process checks leases every 5 minutes. When a lease expires:
1. The clone's protection is automatically lifted
2. A `clone_protection_expired` webhook fires (so your automation knows)
3. The clone becomes subject to normal idle cleanup rules

If the clone is still being actively used, it stays alive. If it has been sitting idle, it gets cleaned up -- exactly as it should be.

### Configuration

Three new options in the `cloning` section give administrators full control:

```yaml
cloning:
  # Default lease when a user creates a protected clone without specifying duration
  protectionLeaseDurationMinutes: 1440      # 24 hours

  # Hard cap -- no clone can be protected longer than this
  protectionMaxDurationMinutes: 10080       # 7 days

  # Send a webhook warning before protection expires
  protectionExpiryWarningMinutes: 1440      # 24 hours before
```

### Why it matters

This solves a real operational pain point. In teams with dozens of developers and CI pipelines, forgotten clones are inevitable. Protection leases let users mark important work as protected while giving platform teams the guarantee that resources will be reclaimed. No more "who left this clone running for three weeks?" conversations.

The warning webhooks also integrate naturally with Slack or PagerDuty -- remind the owner before their clone expires so they can extend the lease if needed.

## Database rename

When cloning production data for development, you often don't want the production database name showing up in your test environments. DBLab 4.1 adds native database renaming during snapshot creation.

```yaml
# In your DBLab configuration
physicalSnapshot:
  options:
    databaseRename:
      myapp_production: myapp_dev
      analytics_prod: analytics_dev
```

During snapshot creation, DBLab executes `ALTER DATABASE ... RENAME TO ...` in a temporary container, so every clone created from that snapshot already has the sanitized names. This works in both physical and logical modes.

### Use cases

- **Environment isolation**: Prevent accidental connections to the wrong database by giving dev/staging clones distinct names
- **Convention enforcement**: Your application configs can use consistent names (`myapp_dev`) across all environments
- **Compliance**: Eliminate production identifiers from non-production environments

Validation is thorough -- DBLab checks for empty names, circular renames, self-renames, and conflicts with the connection database, so misconfigurations are caught early.

## ARM64 and Colima support

DBLab Engine now runs natively on Apple Silicon. If you're on an M1, M2, M3, or M4 Mac, you can run full database branching locally using [Colima](https://github.com/abiosoft/colima) as the container runtime.

### Getting started on macOS

```bash
# Start Colima and initialize ZFS
colima start --cpu 4 --memory 8 --disk 60
colima ssh < engine/scripts/init-zfs-colima.sh

# Build ARM64 binary
GOOS=linux GOARCH=arm64 make build

# Build ARM64 Postgres image
docker build -t dblab-postgres:17-arm64 -f Dockerfile.arm64 .
```

The setup guide covers everything from ZFS pool creation inside the Colima VM to volume mount propagation for ZFS clones.

### Why it matters

This unlocks a fully offline development workflow. You can now run DBLab on a plane, in a secure facility, or anywhere you don't have cloud access. For teams evaluating DBLab, the barrier to trying it drops to zero -- just `colima start` and go.

It also means DBLab works on the hardware most developers already have. No need to provision a cloud VM just to experiment with database branching.

## Teleport integration (Standard and Enterprise editions)

For teams using [Teleport](https://goteleport.com/) for infrastructure access, DBLab 4.1 adds native integration. When a clone is created, it is automatically registered as a Teleport database resource. When it is destroyed, the resource is cleaned up.

### Architecture

DBLab uses a sidecar model:

```
Developer → tsh db connect → Teleport Proxy → Teleport DB Agent → DBLab Clone
                                                        ↑
DBLab Engine ──webhook──► Teleport Sidecar ──tctl──► Teleport Auth
```

The sidecar (`dblab teleport serve`) listens for webhook events and manages Teleport resources via `tctl`. A separate Teleport Database Agent handles connection proxying with full certificate-based authentication.

### What you get

- **Automatic resource lifecycle**: No manual registration of database resources. Clones appear and disappear in Teleport automatically
- **Certificate-based auth**: DBLab 4.1 includes `hostssl all all 0.0.0.0/0 cert` in the default `pg_hba.conf`, so Teleport connections work out of the box
- **Startup reconciliation**: If the sidecar restarts, it reconciles any missed events within 5 minutes
- **Audit trail**: Every clone connection goes through Teleport, giving you a complete access log

### Why it matters

In regulated environments -- finance, healthcare, government -- you need auditable access control for every database, even ephemeral ones. Teleport integration means DBLab clones inherit your organization's access policies, role-based permissions, and session recording. This makes database branching viable in environments where "just give them the password" is not an option.

:::note
Teleport integration is available in Standard Edition (SE) and Enterprise Edition (EE) only.
:::

## RDS/Aurora logical refresh without production impact

Running `pg_dump` directly against a production RDS or Aurora instance is risky. It holds the `xmin` horizon for the entire duration of the dump, which can cause bloat accumulation, degrade vacuum effectiveness, and create load on the primary.

DBLab 4.1 ships a dedicated `rds-refresh` tool that eliminates this problem entirely.

### How it works

```
Production ──RDS snapshot──► Snapshot ──restore──► Temporary RDS clone ──pg_dump──► DBLab
                                                         │
                                                    (auto-deleted)
```

Instead of dumping from production, the tool:
1. Finds the latest RDS automated snapshot
2. Creates a temporary RDS clone from that snapshot
3. Runs `pg_dump` against the temporary clone
4. Feeds the data into DBLab's logical refresh pipeline
5. Deletes the temporary clone -- even if something fails

The temporary clone costs roughly $0.35-$1.20 for a typical 2-5 hour refresh window (using `db.t3.medium` to `db.r5.large`).

### Safety features

The tool has multiple layers of orphan protection:
- **Defer cleanup**: The temporary clone is always deleted on exit
- **Signal handlers**: Catches SIGINT, SIGTERM, and SIGHUP to clean up on interruption
- **State file**: Tracks the active clone so it can be recovered after crashes
- **Tag scanning**: Finds orphaned clones by the `ManagedBy=dblab-rds-refresh` tag
- **Manual cleanup**: `rds-refresh cleanup --max-age 48h` finds and removes stale clones

### Configuration

```yaml
source:
  type: rds                    # or "aurora-cluster"
  identifier: my-production-db

clone:
  instanceClass: db.t3.medium
  securityGroups:
    - sg-0123456789abcdef0
  subnetGroup: my-db-subnet-group

refresh:
  timeout: 4h

dblab:
  url: https://dblab.internal:2345
  token: your-dblab-token
```

Scheduling is supported via cron, Kubernetes CronJob, or ECS Scheduled Task.

### Why it matters

This is essential for any team running on RDS or Aurora. You get fresh production data in your DBLab instance without touching the primary at all. No bloat accumulation, no load impact, no risk. Combined with DBLab's instant cloning, your developers and CI pipelines always work with recent production-like data.

## Prometheus metrics exporter

DBLab 4.1 exposes a comprehensive `/metrics` endpoint in Prometheus format -- no authentication required, ready to scrape.

### What's exposed

| Category | Key metrics |
|----------|------------|
| **Instance** | Uptime, health status (0=OK, 1=Warning, 2=Bad), edition |
| **Disk** | Total/free/used bytes, compression ratio, data directory size |
| **Clones** | Total count, count by status, max age, CPU/memory usage, protected count |
| **Snapshots** | Total count, max age, physical/logical size, data lag |
| **Sync instance** | WAL lag (seconds), uptime, last replayed timestamp |

### Setup

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'dblab'
    static_configs:
      - targets: ['dblab-host:2345']
    metrics_path: /metrics
```

### Example alerts

The [documentation](https://github.com/postgres-ai/database-lab-engine/blob/master/PROMETHEUS.md) includes ready-to-use alert rules:

- **Low disk space**: Fire when free disk drops below 20%
- **Stale snapshots**: Fire when the newest snapshot is older than 24 hours
- **High clone count**: Fire when more than 50 clones are active
- **WAL replay lag**: Fire when the sync instance falls more than 1 hour behind (physical mode)
- **Sync instance down**: Fire when the sync instance is unreachable

### OpenTelemetry support

For teams using different observability stacks, DBLab includes an [OpenTelemetry Collector configuration example](https://github.com/postgres-ai/database-lab-engine/blob/master/engine/configs/otel-collector.example.yml) that can export metrics to Grafana Cloud, Datadog, New Relic, AWS CloudWatch, or any OTLP-compatible backend.

### Why it matters

Until now, monitoring DBLab required checking the API manually or building custom integrations. With native Prometheus support, DBLab fits into your existing monitoring stack with zero effort. You get visibility into disk usage trends, clone proliferation, snapshot freshness, and replication lag -- the metrics that matter most for keeping your database branching infrastructure healthy.

## Summary of changes

| Feature | Benefit | Availability |
|---------|---------|-------------|
| **Protection leases** | Automatic cleanup of forgotten clones | All editions |
| **Database rename** | Sanitized database names in clones | All editions |
| **ARM64 / Colima** | Run DBLab on Apple Silicon Macs | All editions |
| **Teleport integration** | Auditable access control for clones | SE and EE |
| **RDS/Aurora refresh** | Production-safe data refresh | All editions |
| **Prometheus exporter** | Native observability | All editions |

## Where to start

1. **Try the demo**: [demo.dblab.dev](https://demo.dblab.dev) (token: `demo-token`)
2. **Deploy DBLab SE**: [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec) or [Postgres.ai Console](https://console.postgres.ai)
3. **Install open source**: [How-to](https://postgres.ai/docs/dblab-howtos/administration/install-dle-manually)
4. **macOS setup**: [Run DBLab on Mac](/docs/dblab-howtos/administration/run-database-lab-on-mac)
5. **Enterprise inquiries**: Contact [team@postgres.ai](mailto:team@postgres.ai) for DBLab EE

---

DBLab 4.1 makes database branching production-ready at every scale. Protection leases keep your infrastructure clean. Teleport keeps access auditable. The Prometheus exporter keeps you informed. And RDS refresh keeps your data fresh without putting production at risk. All of this on top of the O(1) economics that make DBLab unique.

[Get Started](https://postgres.ai/docs/database-lab) | [GitHub](https://github.com/postgres-ai/database-lab-engine) | [Join our Slack](https://slack.postgres.ai)

<BlogFooter author={nik} />
