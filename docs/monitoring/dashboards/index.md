---
title: Dashboard overview
sidebar_label: Overview
sidebar_position: 1
keywords:
  - "Grafana dashboards"
  - "PostgreSQL dashboards"
  - "performance monitoring dashboards"
  - "query analysis dashboard"
  - "wait events dashboard"
---

# Dashboard overview

PostgresAI monitoring includes 14 pre-built Grafana dashboards designed for expert-level PostgreSQL troubleshooting.

## Dashboard categories

### Triage and overview

| # | Dashboard | Purpose |
|---|-----------|---------|
| 01 | [Node overview](/docs/monitoring/dashboards/node-overview) | High-level node health, wait events, sessions |
| 02 | [Query analysis](/docs/monitoring/dashboards/query-analysis) | Top-N queries by various metrics |
| 03 | [Single query](/docs/monitoring/dashboards/single-query) | Deep-dive into specific queryid |

### Wait events and locks

| # | Dashboard | Purpose |
|---|-----------|---------|
| 04 | [Wait events](/docs/monitoring/dashboards/wait-events) | Active session history (ASH-style) |
| 13 | [Lock contention](/docs/monitoring/dashboards/lock-contention) | Lock waits and blocking chains |

### Storage and maintenance

| # | Dashboard | Purpose |
|---|-----------|---------|
| 05 | [Backups](/docs/monitoring/dashboards/backups) | Backup status and WAL archiving |
| 07 | [Autovacuum & xmin horizon](/docs/monitoring/dashboards/autovacuum) | Autovacuum, dead tuples, bloat, and xmin-horizon root cause analysis |
| 08 | [Table stats](/docs/monitoring/dashboards/table-stats) | Aggregated table metrics |
| 09 | [Single table](/docs/monitoring/dashboards/single-table) | Deep-dive into specific table |
| 10 | [Index health](/docs/monitoring/dashboards/index-health) | Index usage and bloat |
| 11 | [Single index](/docs/monitoring/dashboards/single-index) | Deep-dive into specific index |
| 12 | [SLRU](/docs/monitoring/dashboards/slru) | SLRU cache statistics |

### Replication and HA

| # | Dashboard | Purpose |
|---|-----------|---------|
| 06 | [Replication](/docs/monitoring/dashboards/replication) | Replication lag and slot status |

### I/O

| # | Dashboard | Purpose |
|---|-----------|---------|
| 14 | [I/O statistics](/docs/monitoring/dashboards/io-statistics) | I/O by backend type (`pg_stat_io`, PostgreSQL 16+) |

### Stack health

| # | Dashboard | Purpose |
|---|-----------|---------|
| -- | [Self-monitoring](/docs/monitoring/dashboards/self-monitoring) | Monitoring stack health |

## Common variables

Most dashboards share these filter variables:

| Variable | Purpose | Example |
|----------|---------|---------|
| `cluster_name` | Cluster identifier | `production`, `staging` |
| `node_name` | Node within cluster | `primary`, `replica-1` |
| `db_name` | Database filter | `myapp`, `All` |

**Exceptions:**
- **06. Replication** and **Self-monitoring** have no template variables at all (06 is a
  placeholder; self-monitoring reports on the single monitoring instance).
- **14. I/O statistics** has only `cluster_name` and `node_name` (no database filter — `pg_stat_io`
  is instance-level).
- **11. Single index** names its database variable `datname` (label "DB name") rather than `db_name`.

## Recommended workflow

### Incident response

1. **Start with 01. Node overview**
   - Check wait event distribution
   - Look for session count anomalies
   - Note TPS/QPS patterns

2. **Identify the bottleneck**
   - High CPU wait events — Check queries (02)
   - High IO wait events — Check disk activity, queries
   - High LWLock — Check specific lock type (13)

3. **Drill down**
   - Use 02. Query analysis to find problematic queries
   - Use 03. Single query for detailed metrics on specific queryid

### Routine monitoring

| Task | Dashboard | What to look for |
|------|-----------|------------------|
| Query review | 02. Query analysis | New slow queries, regression |
| Index health | 10. Index health | Unused indexes, bloat |
| Table health | 08. Table stats | Bloat, sequential scans |
| Vacuum status | 07. Autovacuum & xmin horizon | Dead tuple accumulation, xmin-horizon blockers |
| I/O attribution | 14. I/O statistics | Reads/writes by backend type (PG16+) |

## Legend options

[02. Query analysis](/docs/monitoring/dashboards/query-analysis) has a **Query texts** variable
(`legend_label`) that switches how query texts are rendered in legends:

| Option | Value | Shows |
|--------|-------|-------|
| Smart truncation (default) | `displayname_long` | Query text with smart truncation |
| Raw texts | `displayname_raw_long` | Full raw query text |

Select the format using the **Query texts** variable at the top of the dashboard.

## Top-N filtering

Many dashboards limit each panel to the top-N series (for example, the `top_n` variable on
[02. Query analysis](/docs/monitoring/dashboards/query-analysis) offers 5, 10, 15, 20, 50, 100, 500).
These panels use plain PromQL `topk($top_n, ...)`, which keeps only the highest-ranked series and
**drops the long tail** — it does not sum the remainder into a separate bucket. The per-relation
dashboards ([08. Table stats](/docs/monitoring/dashboards/table-stats),
[10. Index health](/docs/monitoring/dashboards/index-health)) use the same `topk($top_n, ...)` approach.

If the objects you care about are not visible, raise `top_n` or drill into the corresponding
single-object dashboard to see the detail.

## Time range tips

Dashboards default to a **`now-1h`** time range in 0.15, tuned for readable, recent patterns
out of the box.

- **Incident investigation**: The default `now-1h` shows recent patterns; widen as needed
- **Trend analysis**: Use 24h-7d for capacity planning
- **Comparison**: Use "Compare to" feature for week-over-week analysis

## Next steps

- [01. Node overview](/docs/monitoring/dashboards/node-overview) — Start here for incident response
- [02. Query analysis](/docs/monitoring/dashboards/query-analysis) — Top queries breakdown
