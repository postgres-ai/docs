---
title: "14. I/O statistics (pg_stat_io)"
sidebar_label: "14. I/O statistics"
sidebar_position: 15
keywords:
  - "pg_stat_io"
  - "PostgreSQL I/O monitoring"
  - "I/O statistics dashboard"
  - "backend type I/O"
  - "PostgreSQL 16 I/O"
---

# 14. I/O statistics (pg_stat_io)

New in 0.15. Monitor PostgreSQL I/O activity broken down by backend type using the
`pg_stat_io` view.

:::note PostgreSQL 16+ required
`pg_stat_io` was introduced in PostgreSQL 16. On PostgreSQL 15 and earlier this dashboard has
no data — the collector emits nothing for the `pg_stat_io` metric group on those versions. See
[System requirements](/docs/monitoring/getting-started/requirements#postgresql-requirements).
:::

## Purpose

Understand where I/O is happening inside PostgreSQL and which backend type is responsible:

- Distinguish client-backend reads from background-writer, checkpointer, autovacuum, and WAL I/O
- See cache hits versus actual reads
- Spot excessive evictions (shared buffers under pressure)
- Track relation extends (table/index growth) and fsync activity

`pg_stat_io` exposes operations that older views could not attribute to a backend type, which
makes it far easier to tell, for example, whether reads come from queries or from vacuum.

## When to use

- Investigating disk I/O pressure on PostgreSQL 16+
- Deciding whether `shared_buffers` is too small (high evictions / reuses)
- Attributing read/write load to a specific backend type
- Correlating I/O spikes with checkpointer or autovacuum activity

## Key panels

The dashboard is organized into four rows: **I/O overview**, **I/O by backend type**,
**Writebacks, fsyncs, and file extends**, and **Buffer cache efficiency**.

### I/O overview

**What it shows:**
- **Total I/O throughput (MiB/s)** and **I/O time (ms/s)**
- **Buffer hit ratio (%)** — a gauge of blocks found in shared buffers vs fetched from the OS/disk
- **I/O operations (ops/s)**

**Healthy state:**
- High buffer hit ratio for hot data

**Warning signs:**
- Falling hit ratio / rising reads = working set no longer fits in shared buffers

### I/O by backend type

**What it shows:**
- **Reads by backend type (ops/s)** and **Writes by backend type (ops/s)**, grouped by `backend_type`

**Interpretation:**
- `client backend` dominating reads = query workload is I/O bound
- `autovacuum worker` dominating reads = vacuum is reading heavily; check bloat and the
  [Autovacuum dashboard](/docs/monitoring/dashboards/autovacuum)
- `checkpointer` / `background writer` dominating writes = normal flushing behavior

### Writebacks, fsyncs, and file extends

**What it shows:**
- **Writebacks (ops/s)**, **Fsyncs (ops/s)**, and **File extends (ops/s)**

**Interpretation:**
- High file-extend rates track heavy inserts / table growth
- High fsync activity can point to slow storage

### Buffer cache efficiency

**What it shows:**
- **Buffer evictions and reuses (ops/s)** — evictions (a buffer had to be evicted to make room)
  and reuses (a buffer was reused directly, e.g. by ring buffers during bulk operations)
- **Buffer hits by backend type (ops/s)**

**Interpretation:**
- High evictions under steady load is a classic signal that `shared_buffers` is undersized

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Node filter |

I/O statistics are instance-level; this dashboard has no database or table filter (only
`cluster_name` and `node_name`).

## Underlying query

The dashboard is built on the `pg_stat_io` view, aggregated by backend type:

```sql
select
  coalesce(backend_type, 'total') as backend_type,
  sum(reads) as reads,
  sum(writes) as writes,
  sum(extends) as extends,
  sum(hits) as hits,
  sum(evictions) as evictions,
  sum(reuses) as reuses,
  sum(fsyncs) as fsyncs
from pg_stat_io
group by rollup (backend_type);
```

`pg_stat_io` counters are cumulative until `pg_stat_reset_shared('io')`; the dashboard shows
rates derived from them.

## Related dashboards

- **Node overview** — [01. Node overview](/docs/monitoring/dashboards/node-overview)
- **Autovacuum and xmin horizon** — [07. Autovacuum](/docs/monitoring/dashboards/autovacuum)
- **Backups and WAL** — [05. Backups](/docs/monitoring/dashboards/backups)

## Metrics reference

The signals behind this dashboard are documented as the `pg_stat_io` metric group in the
[monitoring reference](/docs/reference-guides/postgres-ai-monitoring-reference#io-statistics-pg_stat_io-postgresql-16).

## Troubleshooting

### No data on this dashboard

1. Confirm the monitored database runs PostgreSQL 16 or newer:
   ```sql
   select current_setting('server_version_num')::int >= 160000 as has_pg_stat_io;
   ```
2. Verify the view is readable by the monitoring role:
   ```sql
   select count(*) from pg_stat_io;
   ```

### Counters look reset

`pg_stat_io` is reset by `pg_stat_reset_shared('io')` and on server restart. The `stats_reset`
timestamp is exposed so you can tell when the window started.
