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
| 07 | [Autovacuum](/docs/monitoring/dashboards/autovacuum) | Vacuum progress and bloat |
| 08 | [Table stats](/docs/monitoring/dashboards/table-stats) | Aggregated table metrics |
| 09 | [Single table](/docs/monitoring/dashboards/single-table) | Deep-dive into specific table |
| 10 | [Index health](/docs/monitoring/dashboards/index-health) | Index usage and bloat |
| 11 | [Single index](/docs/monitoring/dashboards/single-index) | Deep-dive into specific index |
| 12 | [SLRU](/docs/monitoring/dashboards/slru) | SLRU cache statistics |

### Replication and HA

| # | Dashboard | Purpose |
|---|-----------|---------|
| 06 | [Replication](/docs/monitoring/dashboards/replication) | Replication lag and slot status |

### Stack health

| # | Dashboard | Purpose |
|---|-----------|---------|
| -- | [Self-monitoring](/docs/monitoring/dashboards/self-monitoring) | Monitoring stack health |

## Common variables

All dashboards share these filter variables:

| Variable | Purpose | Example |
|----------|---------|---------|
| `cluster_name` | Cluster identifier | `production`, `staging` |
| `node_name` | Node within cluster | `primary`, `replica-1` |
| `db_name` | Database filter | `myapp`, `All` |

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
| Vacuum status | 07. Autovacuum | Dead tuple accumulation |

## Legend options

Most query-related dashboards support multiple legend formats:

| Format | Shows | Use case |
|--------|-------|----------|
| `queryid` | Numeric ID only | Compact view |
| `displayname` | Truncated query | Default |
| `displayname_long` | Full query with context | Debugging |

Select the format using the **Query texts** variable at the top of dashboards.

## Time range tips

- **Incident investigation**: Start with 15m-1h to see recent patterns
- **Trend analysis**: Use 24h-7d for capacity planning
- **Comparison**: Use "Compare to" feature for week-over-week analysis

## Next steps

- [01. Node overview](/docs/monitoring/dashboards/node-overview) — Start here for incident response
- [02. Query analysis](/docs/monitoring/dashboards/query-analysis) — Top queries breakdown
