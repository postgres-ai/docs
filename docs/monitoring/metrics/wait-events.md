---
title: Wait event metrics
sidebar_label: Wait events
sidebar_position: 3
---

# Wait event metrics

Active session history and wait event metrics from `pg_stat_activity`.

## Data source

Wait event data is collected from `pg_stat_activity`:

```sql
select
  pid,
  state,
  wait_event_type,
  wait_event,
  query
from pg_stat_activity
where backend_type = 'client backend';
```

## Core metrics

Series are exported with the `pgwatch_` prefix. Wait-event sampling counts come from the
`wait_events` metric group (column `total`), and session state/duration come from the
`pg_stat_activity` group.

### Session state metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_pg_stat_activity_count` | Gauge | Sessions, grouped by state |
| `pgwatch_pg_stat_activity_max_tx_duration` | Gauge | Longest running transaction (seconds) |

### Wait event metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pgwatch_wait_events_total` | Gauge | Sampled count of backends per wait event / type |

There is no `pg_wait_event_count` or `pg_wait_event_activity_count` series.

## Labels

### Session state labels (`pgwatch_pg_stat_activity_count`)

| Label | Values | Description |
|-------|--------|-------------|
| `state` | `active`, `idle`, `idle in transaction`, `idle in transaction (aborted)`, ... | Session state |
| `datname` | Database name | Target database |
| `application_name` | Application name | Reported `application_name` |

### Wait event labels (`pgwatch_wait_events_total`)

| Label | Values | Description |
|-------|--------|-------------|
| `wait_event_type` | `LWLock`, `Lock`, `BufferPin`, `Activity`, `Client`, `Extension`, `IPC`, `Timeout`, `IO`, plus the synthesized `CPU*` placeholder (see below) | Wait category |
| `wait_event` | Various | Specific wait event |
| `datname` | Database name | Target database |
| `query_id` | queryid (PG14+) | Associated query id, when available |

## Wait event categories

### CPU* (synthesized placeholder)

`CPU` is **not** a real PostgreSQL `wait_event_type`. When a backend is running on CPU, its
`wait_event` and `wait_event_type` are `NULL`. To make on-CPU activity visible, the `wait_events`
metric coalesces those NULLs into a `CPU*` placeholder value — so you will see `CPU*` (not `CPU`)
in the `wait_event` / `wait_event_type` labels. The categories below are the standard PostgreSQL
wait-event types reported as-is.

### IO

Disk I/O operations:

| Event | Description |
|-------|-------------|
| `DataFileRead` | Reading data file blocks |
| `DataFileWrite` | Writing data file blocks |
| `DataFileExtend` | Extending data file |
| `DataFileFlush` | Flushing data file |
| `WALRead` | Reading WAL |
| `WALWrite` | Writing WAL |
| `WALSync` | Syncing WAL to disk |

### Lock

Row and table-level locks:

| Event | Description |
|-------|-------------|
| `relation` | Table lock wait |
| `tuple` | Row lock wait |
| `transactionid` | Transaction lock wait |
| `virtualxid` | Virtual transaction lock |

### LWLock

PostgreSQL internal lightweight locks:

| Event | Description |
|-------|-------------|
| `buffer_content` | Buffer content lock |
| `buffer_mapping` | Buffer mapping lock |
| `WALInsert` | WAL insertion lock |
| `lock_manager` | Lock manager lock |
| `ProcArray` | Process array lock |

### BufferPin

Buffer pinning waits:

| Event | Description |
|-------|-------------|
| `BufferPin` | Waiting for buffer pin |

### Activity

Background process waits:

| Event | Description |
|-------|-------------|
| `LogicalLauncherMain` | Logical replication launcher |
| `AutoVacuumMain` | Autovacuum launcher |
| `BgWriterMain` | Background writer |
| `CheckpointerMain` | Checkpointer process |
| `WalWriterMain` | WAL writer |

## Common queries

### Sessions by state

```promql
sum by (state) (pgwatch_pg_stat_activity_count)
```

### Wait events distribution

```promql
sum by (wait_event_type) (pgwatch_wait_events_total)
```

### Active (non-idle) sessions

```promql
sum(pgwatch_pg_stat_activity_count{state!~"idle.*"})
```

### Sessions waiting on locks

```promql
sum(pgwatch_wait_events_total{wait_event_type="Lock"})
```

### I/O wait ratio

```promql
sum(pgwatch_wait_events_total{wait_event_type="IO"})
/
sum(pgwatch_pg_stat_activity_count{state="active"})
```

### Long-running transactions

```promql
pgwatch_pg_stat_activity_max_tx_duration > 300
```

## Dashboard usage

These metrics are used in:

- [01. Node overview](/docs/monitoring/dashboards/node-overview) — Active session history
- [04. Wait events](/docs/monitoring/dashboards/wait-events) — Wait event deep-dive
- [13. Lock contention](/docs/monitoring/dashboards/lock-contention) — Lock analysis

## Average Active Sessions (AAS) health matrix

The PostgresAI console rolls this wait-event data up into its **DB health matrix** as Average Active
Sessions (AAS) checks: an overall check plus one per wait-event category (IO, IPC, Lock, LWLock).
Each check pairs a sustained **avg** value with a **peak** value. The peak is derived from
`pgwatch_wait_events_total` — the worst single time bucket, plus a p99 across buckets — and
normalized to the instance's vCPU count, so a cell reads the same regardless of machine size.

### Peak granularity: 1-minute buckets

The peak metrics are computed over **1-minute** buckets:

- The zone is driven by the **worst 1-minute** bucket (previously the worst 5-minute bucket).
- The displayed p99 label is the **p99 of 1-minute** buckets (previously p99 of 5-minute buckets).

A 1-minute maximum catches short bursts that 5-minute averaging smooths away, surfacing
sub-5-minute CPU-queuing spikes that the coarser bucket hid. The **avg (sustained) checks are
unaffected** — only the peak metrics change.

### Thresholds are absolute and resolution-invariant

The peak zone cutoffs are unchanged, and intentionally so:

| Peak check | Green | Yellow | Red |
|------------|-------|--------|-----|
| Overall (`AASp`) | < 50% of vCPUs | 50–80% | > 80% |
| Per type (`AAS_IOp`, `AAS_IPCp`, `AAS_LOCKp`, `AAS_LWLOCKp`) | < 20% of vCPUs | 20–50% | > 50% |

These cutoffs are **absolute** and deliberately not raised for the finer granularity. The worst
minute exceeding 80% of vCPUs means real CPU queuing regardless of bucket size, so the threshold is
resolution-invariant. Raising the cutoffs to compensate for 1-minute granularity would either
under-alert spiky workloads or re-smooth the very sub-5-minute bursts that 1-minute buckets exist to
surface.

### The switchover is a calibration boundary

Because a 1-minute maximum catches bursts that 5-minute averaging smooths, worst/peak values
computed over 1-minute buckets run **greater than or equal to** the old 5-minute values for the same
workload. At the switchover:

- Peak cells may shift **redder** even though the underlying workload has not changed.
- Peak history from before the switch is **not directly comparable** to peak history after it.

Treat the switchover as a **calibration boundary**: compare peaks within a single granularity
regime, not across it. The avg/sustained values are continuous across the boundary.

## Troubleshooting

### No wait event data

1. Verify pgwatch is collecting from pg_stat_activity:
   ```bash
   docker compose logs pgwatch-postgres pgwatch-prometheus | grep -i "stat_activity"
   ```

2. Check monitoring user permissions (the product grants `pg_monitor`, not `pg_read_all_stats`):
   ```sql
   grant pg_monitor to postgres_ai_mon;
   ```

### Wait events show "unknown"

Some wait events may not be captured if the session state changes between sampling intervals. This is normal for very short waits.

### High "idle in transaction" count

Indicates connection leaks or application issues:

```sql
select pid, usename, state, query_start, query
from pg_stat_activity
where state = 'idle in transaction'
order by query_start;
```

## Related metrics

- [pg_stat_statements](/docs/monitoring/metrics/pg-stat-statements) — Query-level metrics
- [Table metrics](/docs/monitoring/metrics/table-metrics) — Table access patterns
