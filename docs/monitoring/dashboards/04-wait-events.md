---
title: "04. Wait event analysis (Active Session History)"
sidebar_label: "04. Wait event analysis (ASH)"
sidebar_position: 5
keywords:
  - "PostgreSQL wait events"
  - "active session history"
  - "ASH PostgreSQL"
  - "performance insights"
  - "lock waits"
---

# 04. Wait event analysis (Active Session History)

Active Session History (ASH) style dashboard for deep wait event analysis.

### ASH by wait type

![ASH by wait type](/img/monitoring/dashboards/04-wait-events-ash-by-type.png)

### ASH by wait event

![ASH by wait event](/img/monitoring/dashboards/04-wait-events-ash-by-event.png)

### ASH by query

![ASH by query](/img/monitoring/dashboards/04-wait-events-ash-by-query.png)

## Purpose

Similar to AWS RDS Performance Insights or Oracle ASH, this dashboard provides:
- Detailed breakdown of what sessions are waiting on
- Historical wait event patterns
- Correlation between waits and performance issues

## When to use

- Database is slow but CPU is not high
- Investigating lock contention
- Understanding I/O patterns
- Diagnosing intermittent slowdowns

## Prerequisites

This dashboard uses wait event data collected from `pg_stat_activity` by pgwatch. No additional extensions are required.


## Key panels

### Wait event distribution

**What it shows:**
- Stacked area chart of wait events over time
- Each color represents a wait event type

**Wait event categories:**

| Category | Description | Common events |
|----------|-------------|---------------|
| **CPU** | On-CPU processing | `CPU` |
| **IO** | Disk I/O operations | `DataFileRead`, `WALWrite` |
| **LWLock** | Internal PostgreSQL locks | `BufferContent`, `LockManager` |
| **Lock** | Row/table locks | `tuple`, `transactionid` |
| **BufferPin** | Buffer pinning | `BufferPin` |
| **Activity** | Background processes | `LogicalLauncherMain` |
| **IPC** | Inter-process communication | `BgWorkerStartup` |

### Top wait events

**What it shows:**
- Ranked list of most common wait events
- Percentage of total wait time

**Interpretation guide:**

| Wait event | Meaning | Action |
|------------|---------|--------|
| `CPU` | Query processing | Normal if workload-appropriate |
| `DataFileRead` | Reading from disk | Check shared_buffers, add memory |
| `DataFileWrite` | Writing to disk | Normal for writes |
| `WALWrite` | WAL I/O | Check storage speed |
| `LWLock:BufferContent` | Buffer contention | Scale up, partition tables, reduce bloat |
| `Lock:tuple` | Row lock wait | Check for lock conflicts |
| `Lock:transactionid` | Transaction wait | Long transactions blocking |

### Wait events by database

Breakdown showing which databases contribute most to waits.

### Wait events by query

Links wait events to specific queries (when available).

**Limitations:**
- Only captures queries active during sampling
- Short queries may be missed
- Use with [02. Query analysis](/docs/monitoring/dashboards/query-analysis) for complete picture

## Understanding wait events

### CPU waits

High CPU wait is normal for compute-bound workloads. Investigate if:
- CPU wait is disproportionate to actual CPU usage
- Query throughput is lower than expected

### I/O waits

Common I/O wait events:

| Event | Cause | Solution |
|-------|-------|----------|
| `DataFileRead` | Reading data not in cache | Increase `shared_buffers`, add indexes |
| `DataFileExtend` | Growing data files | Pre-extend files, faster storage |
| `DataFileFlush` | Flushing dirty pages | Tune `checkpoint_*` settings |
| `WALSync` | Syncing WAL | Faster WAL storage, adjust `commit_delay` |

### Lock waits

Lock wait events indicate heavyweight lock contention:

| Event | Cause | Solution |
|-------|-------|----------|
| `Lock:tuple` | Row-level lock wait | Avoid multiple sessions modifying same rows; use `FOR UPDATE SKIP LOCKED` or `NOWAIT` |
| `Lock:transactionid` | Waiting for transaction | Find and address long transactions |
| `Lock:relation` | Table-level lock | Use low `lock_timeout` with retries for DDL. See [Zero-downtime schema migrations](https://postgres.ai/blog/20210923-zero-downtime-postgres-schema-migrations-lock-timeout-and-retries) |

### LWLock waits

Lightweight locks are internal to PostgreSQL:

| Event | Cause | Solution |
|-------|-------|----------|
| `LWLock:BufferContent` | Concurrent access to same buffer page | Scale up instance, partition tables, reduce foreign keys, address bloat with `VACUUM FULL` or `pg_repack` |
| `LWLock:LockManager` | Fast-path lock limit exceeded (16 locks/backend) | Enable partition pruning, reduce indexes, use connection pooler. See [Postgres Marathon series](https://postgres.ai/blog/20251009-postgres-marathon-2-005) |

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Node filter |
| `db_name` | Database filter |
| `wait_event_type` | Filter by event type |

## Related dashboards

- **Overview** — [01. Node overview](/docs/monitoring/dashboards/node-overview)
- **Lock details** — [13. Lock contention](/docs/monitoring/dashboards/lock-contention)
- **Query correlation** — [02. Query analysis](/docs/monitoring/dashboards/query-analysis)

## Troubleshooting

### No wait event data

1. Verify pgwatch is collecting metrics:
   ```bash
   docker compose logs pgwatch | grep -i wait
   ```

2. Check VictoriaMetrics has wait event data:
   ```bash
   curl 'http://localhost:8428/api/v1/query?query=pg_stat_activity_count'
   ```

3. Ensure `pg_stat_activity` is accessible to the monitoring user

### Wait events don't match RDS Performance Insights

Different sampling rates and methodologies may cause variations. PostgresAI monitoring uses:
- Default: 10ms sampling interval
- Aggregation into time buckets for visualization

RDS Performance Insights may use different intervals.

### "Other" category too large

The "Other" category contains infrequent or miscellaneous waits. If large:
1. Check for uncommon extensions
2. Review background worker activity
3. Consider if sampling rate is appropriate
