---
title: "01. Single node performance overview (high level)"
sidebar_label: "01. Node overview (high level)"
sidebar_position: 2
keywords:
  - "PostgreSQL performance overview"
  - "active session history"
  - "TPS monitoring"
  - "database health check"
---

# 01. Single node performance overview

High-level dashboard for quick triage and overall database health assessment.

![01. Node overview dashboard](/img/monitoring/dashboards/01-node-overview.png)

## Purpose

This dashboard provides a "shallow but wide" view of database performance, ideal for:
- **Incident response**: Quickly identify which subsystem is problematic
- **Daily health checks**: Spot anomalies at a glance
- **Capacity planning**: Track growth trends

## When to use

- First dashboard to check during any performance incident
- Morning health check routine
- Before and after maintenance windows
- When users report "the database is slow"

## Key panels

### Active session history

Similar to AWS RDS Performance Insights, this panel shows wait event distribution over time.

![Active session history panel](/img/monitoring/dashboards/01-node-overview-ash-panel.png)

**What it shows:**
- Stacked bar chart of active sessions by wait event category
- Each bar represents a sampling interval

**Wait event categories:**
| Category | Color | Indicates |
|----------|-------|-----------|
| CPU* | Green | On-CPU activity (query execution) |
| IO | Blue | Disk I/O waits |
| Lock | Red | Row/table lock waits |
| LWLock | Dark red | Lightweight lock contention |
| Timeout | Brown (`#6f450c`) | Sleep/timeout events |

**Healthy state:**
- Mostly green (CPU) with occasional blue (IO)
- Total height below `max_connections * 0.5`

**Warning signs:**
- Sustained dark red (LWLock) — Internal contention
- Sustained red (Lock) — Application-level locking issues
- Spikes above normal baseline — Sudden load increase

### Sessions

**What it shows:**
- Current session count by state
- `active`: Executing queries
- `idle`: Connected but not executing
- `idle in transaction`: In transaction, not executing

**Healthy range:**
- `active` < 20-50 (depending on workload)
- `idle in transaction` should be minimal (< 5)

**Warning signs:**
- High `idle in transaction` — Connection leaks or long transactions
- `active` near `max_connections` — Connection exhaustion

### Non-idle sessions

Focused view of sessions doing actual work.

**Healthy state:**
- Stable pattern matching application load
- No sudden spikes without corresponding application events

### TPS

**What it shows:**
- Transactions per second: commit rate
- Rollback rate (if significant)

**Use for:**
- Capacity baseline
- Detecting throughput drops

### QPS (pg_stat_statements)

From `pg_stat_statements`, showing actual query execution rate.

**Note:** QPS typically higher than TPS since one transaction contains multiple queries.

## Variables

| Variable | Purpose | Options |
|----------|---------|---------|
| `cluster_name` | Cluster filter | Your cluster names |
| `node_name` | Node filter | `node-01`, `replica-01`, etc. |
| `db_name` | Database filter | Database names or `All` |

## Related dashboards

- **High wait events?** — [04. Wait events](/docs/monitoring/dashboards/wait-events) for ASH-style deep-dive
- **Query issues?** — [02. Query analysis](/docs/monitoring/dashboards/query-analysis) for top queries
- **Lock problems?** — [13. Lock contention](/docs/monitoring/dashboards/lock-contention) for blocking analysis

## Troubleshooting

### No data in ASH (Active Session History)

1. Verify pgwatch is collecting metrics:
   ```bash
   docker compose logs pgwatch-postgres pgwatch-prometheus | grep -i "wait\|session"
   ```

2. Check VictoriaMetrics has wait-event data backing the ASH panel (host port `59090`, VM basic auth):
   ```bash
   curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
     'http://localhost:59090/api/v1/query?query=pgwatch_wait_events_total'
   ```

### Sessions count doesn't match pg_stat_activity

The dashboard samples at intervals. For real-time view, query directly:
```sql
select state, count(*)
from pg_stat_activity
where backend_type = 'client backend'
group by state;
```
