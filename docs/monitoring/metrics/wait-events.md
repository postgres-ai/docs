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

### Session state metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_stat_activity_count` | Gauge | Sessions by state |
| `pg_stat_activity_max_tx_duration_seconds` | Gauge | Longest running transaction |
| `pg_stat_activity_oldest_query_seconds` | Gauge | Oldest active query duration |

### Wait event metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pg_wait_event_count` | Gauge | Sessions waiting by event type |
| `pg_wait_event_activity_count` | Gauge | Sessions in activity wait states |

## Labels

### Session state labels

| Label | Values | Description |
|-------|--------|-------------|
| `state` | `active`, `idle`, `idle in transaction`, `idle in transaction (aborted)`, `fastpath function call`, `disabled` | Session state |
| `datname` | Database name | Target database |
| `usename` | User name | Connected user |

### Wait event labels

| Label | Values | Description |
|-------|--------|-------------|
| `wait_event_type` | `CPU`, `IO`, `Lock`, `LWLock`, `BufferPin`, `Activity`, `Extension`, `Client`, `IPC`, `Timeout` | Wait category |
| `wait_event` | Various | Specific wait event |

## Wait event categories

### CPU

On-CPU processing, no actual wait:

| Event | Description |
|-------|-------------|
| `CPU` | Query execution on CPU |

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
sum by (state) (pg_stat_activity_count)
```

### Wait events distribution

```promql
sum by (wait_event_type) (pg_wait_event_count)
```

### Active (non-idle) sessions

```promql
sum(pg_stat_activity_count{state!~"idle.*"})
```

### Sessions waiting on locks

```promql
sum(pg_wait_event_count{wait_event_type="Lock"})
```

### I/O wait ratio

```promql
sum(pg_wait_event_count{wait_event_type="IO"})
/
sum(pg_stat_activity_count{state="active"})
```

### Long-running transactions

```promql
pg_stat_activity_max_tx_duration_seconds > 300
```

## Dashboard usage

These metrics are used in:

- [01. Node overview](/docs/monitoring/dashboards/node-overview) — Active session history
- [04. Wait events](/docs/monitoring/dashboards/wait-events) — Wait event deep-dive
- [13. Lock contention](/docs/monitoring/dashboards/lock-contention) — Lock analysis

## Troubleshooting

### No wait event data

1. Verify pgwatch is collecting from pg_stat_activity:
   ```bash
   docker compose logs pgwatch | grep -i "stat_activity"
   ```

2. Check monitoring user permissions:
   ```sql
   grant pg_read_all_stats to postgres_ai_mon;
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
