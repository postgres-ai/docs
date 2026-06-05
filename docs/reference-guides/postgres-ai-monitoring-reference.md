---
title: postgres_ai monitoring reference documentation
sidebar_label: postgres_ai monitoring
keywords:
  - "postgres_ai monitoring reference"
  - "Monitoring reference"
---

# postgres_ai monitoring reference documentation

## Metrics

:::note

This page lists the user-facing metric groups. The pgwatch collector ships with additional groups that are emitted but not yet documented here (for example, `pg_stat_slru`, `pg_statio_all_tables`, `pg_statio_all_indexes`, `multixact_size`, `pg_index_pilot`, `stats_reset`, `table_size_detailed`). To see the full set of metrics emitted by your monitoring instance, query the Prometheus / VictoriaMetrics endpoint directly (e.g. `/api/v1/label/__name__/values`).

:::

### Common labels

Most metrics include these standard labels:
- `cluster` - Cluster identifier (e.g., "default")
- `datname` - Database name being monitored
- `env` - Environment (e.g., "production")
- `instance` - pgwatch instance identifier
- `job` - Prometheus job name
- `node_name` - Database node name
- `sink_type` - Metrics sink type (e.g., "prometheus")
- `sys_id` - System identifier

### Metric-specific labels

Additional labels are available for specific metric types:
- **Query metrics** (`pg_stat_statements`): `queryid`, `datname`
- **Table metrics** (`table_stats`, `pg_stat_all_tables`): `schema`, `table_name`, `table_full_name`, `table_size_cardinality_mb`
- **Index metrics** (`pg_stat_all_indexes`): `schemaname`, `relname`, `indexrelname`
- **Lock metrics** (`locks_mode`): `lockmode`
- **Wait events** (`wait_events`): `wait_event`, `wait_event_type`
- **Replication metrics**: `application_name`, `client_info`, `usename`
- **Settings metrics**: `setting_name`, `setting_value`, `unit`, `category`, `vartype`

### Background writer metrics (`bgwriter`, `checkpointer`)
Collected every 30 seconds


| Metric | Description | Units |
|--------|-------------|-------|
| `bgwriter_checkpoints_timed` | Number of scheduled checkpoints performed | - |
| `bgwriter_checkpoints_req` | Number of requested checkpoints performed | - |
| `bgwriter_checkpoint_write_time` | Time spent writing checkpoint data to disk | Milliseconds |
| `bgwriter_checkpoint_sync_time` | Time spent syncing checkpoint data to disk | Milliseconds |
| `bgwriter_buffers_checkpoint` | Buffers written during checkpoints | - |
| `bgwriter_buffers_clean` | Buffers cleaned by background writer | - |
| `bgwriter_maxwritten_clean` | Times background writer stopped due to max write limit | - |
| `bgwriter_buffers_backend` | Buffers written directly by backends | - |
| `bgwriter_buffers_backend_fsync` | Times backends performed direct fsync | - |
| `bgwriter_buffers_alloc` | Buffers allocated | - |
| `bgwriter_last_reset_s` | Seconds since bgwriter stats reset | Seconds |
| `checkpointer_num_timed` | Number of timed checkpoints performed | - |
| `checkpointer_num_requested` | Number of requested checkpoints performed | - |
| `checkpointer_restartpoints_timed` | Number of timed restart points performed | - |
| `checkpointer_restartpoints_req` | Number of requested restart points performed | - |
| `checkpointer_restartpoints_done` | Number of restart points completed | - |
| `checkpointer_write_time` | Time spent writing checkpoint data | Milliseconds |
| `checkpointer_sync_time` | Time spent syncing checkpoint data | Milliseconds |
| `checkpointer_buffers_written` | Number of buffers written by checkpointer | - |
| `checkpointer_last_reset_s` | Seconds since stats reset | Seconds |

### Database statistics (`db_stats`, `db_size`, `pg_stat_activity`)
Collected every 15-30 seconds


| Metric | Description | Units |
|--------|-------------|-------|
| `db_stats_numbackends` | Number of active connections to database | - |
| `db_stats_xact_commit` | Transactions committed | - |
| `db_stats_xact_rollback` | Transactions rolled back | - |
| `db_stats_blks_read` | Disk blocks read | - |
| `db_stats_blks_hit` | Buffer cache hits | - |
| `db_stats_tup_returned` | Rows returned by queries | - |
| `db_stats_tup_fetched` | Rows fetched by queries | - |
| `db_stats_tup_inserted` | Rows inserted | - |
| `db_stats_tup_updated` | Rows updated | - |
| `db_stats_tup_deleted` | Rows deleted | - |
| `db_stats_conflicts` | Recovery conflicts | - |
| `db_stats_temp_files` | Temporary files created | - |
| `db_stats_temp_bytes` | Temporary file bytes written | Bytes |
| `db_stats_deadlocks` | Deadlocks detected | - |
| `db_stats_blk_read_time` | Time spent reading data file blocks | Milliseconds |
| `db_stats_blk_write_time` | Time spent writing data file blocks | Milliseconds |
| `db_stats_postmaster_uptime_s` | Postgres server uptime | Seconds |
| `db_stats_backup_duration_s` | Current backup duration | Seconds |
| `db_stats_in_recovery_int` | Whether instance is in recovery mode | Boolean (0/1) |
| `db_stats_invalid_indexes` | Count of invalid indexes | - |
| `db_stats_session_time` | Time spent in database sessions | Milliseconds |
| `db_stats_active_time` | Time spent executing queries | Milliseconds |
| `db_stats_idle_in_transaction_time` | Time spent idle in transactions | Milliseconds |
| `db_stats_sessions` | Total number of sessions | - |
| `db_stats_sessions_abandoned` | Sessions abandoned | - |
| `db_stats_sessions_fatal` | Sessions ended fatally | - |
| `db_stats_sessions_killed` | Sessions killed | - |
| `db_size_size_b` | Database size in bytes | Bytes |
| `db_size_catalog_size_b` | Catalog schema size in bytes | Bytes |
| `pg_stat_activity_count` | Count of sessions by state (additional labels: `state`, `application_name`) | - |
| `pg_stat_activity_max_tx_duration` | Maximum transaction duration (additional labels: `state`, `application_name`) | Seconds |

### Query performance (`pg_stat_statements`)
Collected every 30 seconds
**Additional Labels:** `queryid` (query identifier), `datname` (database name)

| Metric | Description | Units |
|--------|-------------|-------|
| `pg_stat_statements_calls` | Number of times query executed | - |
| `pg_stat_statements_plans_total` | Number of times query planned | - |
| `pg_stat_statements_exec_time_total` | Total execution time | Milliseconds |
| `pg_stat_statements_plan_time_total` | Total planning time | Milliseconds |
| `pg_stat_statements_rows` | Total rows returned/affected | - |
| `pg_stat_statements_shared_bytes_hit_total` | Shared buffer cache hits | Bytes |
| `pg_stat_statements_shared_bytes_read_total` | Shared buffer reads from disk | Bytes |
| `pg_stat_statements_shared_bytes_dirtied_total` | Shared buffer blocks dirtied | Bytes |
| `pg_stat_statements_shared_bytes_written_total` | Shared buffer blocks written | Bytes |
| `pg_stat_statements_block_read_total` | Time spent reading blocks | Milliseconds |
| `pg_stat_statements_block_write_total` | Time spent writing blocks | Milliseconds |
| `pg_stat_statements_wal_records` | WAL records generated | - |
| `pg_stat_statements_wal_fpi` | WAL full page images generated | - |
| `pg_stat_statements_wal_bytes` | WAL bytes generated | Bytes |
| `pg_stat_statements_temp_bytes_read` | Temporary file bytes read | Bytes |
| `pg_stat_statements_temp_bytes_written` | Temporary file bytes written | Bytes |

### Lock statistics (`locks_mode`)
Collected every 30 seconds
**Additional Labels:** `lockmode` (lock type: AccessShareLock, RowExclusiveLock, etc.)

| Metric | Description | Units |
|--------|-------------|-------|
| `locks_mode_count` | Number of locks held by mode type | - |

### Lock waits (`lock_waits`)
Collected every 30 seconds

Detailed blocked / blocking pairs for lock-contention root cause analysis. New in 0.15:
the lock-wait metrics carry session PIDs as labels, so the blocker can be identified directly
in Grafana / PromQL without running the manual `pg_locks` join. Used by
[Dashboard 13 — Lock contention](/docs/monitoring/dashboards/lock-contention).

**Additional Labels:** `blocked_pid` (PID of the waiting backend), `blocker_pid` (PID of the
blocking backend), `blocked_user` / `blocker_user`, `blocked_appname` / `blocker_appname`,
`blocked_table` / `blocker_table` (affected relation), `blocked_query_id` / `blocker_query_id`,
and `datname`. Note: `blocked_mode` / `blocker_mode` and `blocked_locktype` / `blocker_locktype`
are emitted as plain (non-`tag_`) value columns in the metric definition, so they are **not**
Prometheus labels.

| Metric | Description | Units |
|--------|-------------|-------|
| `pgwatch_lock_waits_blocked_ms` | Time the blocked backend has been waiting | Milliseconds |
| `pgwatch_lock_waits_blocker_tx_ms` | Age of the blocking backend's transaction | Milliseconds |

:::tip Terminating a blocker
Use the `blocker_pid` label directly: `select pg_terminate_backend(<blocker_pid>);`. No manual
blocking-chain query is required to find the PID.
:::

### Wait events (`wait_events`)
Collected every 15 seconds
**Additional Labels:** `wait_event` (specific wait event), `wait_event_type` (wait category), and on PostgreSQL 14+ `query_id` (associated query)

| Metric | Description | Units |
|--------|-------------|-------|
| `wait_events_total` | Count of processes experiencing wait event | - |

### Table statistics (`table_stats`, `pg_stat_all_tables`)
Collected every 30 seconds
**Additional Labels:** `schema` (table schema), `table_name` (table name), `table_full_name` (schema.table), `table_size_cardinality_mb` (size category)

| Metric | Description | Units |
|--------|-------------|-------|
| `table_stats_table_size_b` | Table size in bytes | Bytes |
| `table_stats_total_relation_size_b` | Total relation size including indexes | Bytes |
| `table_stats_toast_size_b` | TOAST table size | Bytes |
| `table_stats_seq_scan` | Sequential scans performed | - |
| `table_stats_seq_tup_read` | Rows read by sequential scans | - |
| `table_stats_idx_scan` | Index scans performed | - |
| `table_stats_idx_tup_fetch` | Rows fetched by index scans | - |
| `table_stats_n_tup_ins` | Rows inserted | - |
| `table_stats_n_tup_upd` | Rows updated | - |
| `table_stats_n_tup_del` | Rows deleted | - |
| `table_stats_n_tup_hot_upd` | HOT updates performed | - |
| `table_stats_n_live_tup` | Estimated live rows | - |
| `table_stats_n_dead_tup` | Estimated dead rows | - |
| `table_stats_vacuum_count` | Manual vacuums performed | - |
| `table_stats_autovacuum_count` | Autovacuums performed | - |
| `table_stats_analyze_count` | Manual analyzes performed | - |
| `table_stats_autoanalyze_count` | Autoanalyzes performed | - |
| `table_stats_tx_freeze_age` | Transaction freeze age | - |
| `table_stats_is_part_root` | Whether table is a partition root | Boolean (0/1) |
| `table_stats_last_seq_scan_s` | Seconds since last sequential scan | Seconds |
| `table_stats_no_autovacuum` | Whether autovacuum is disabled | Boolean (0/1) |
| `table_stats_seconds_since_last_analyze` | Seconds since last analyze | Seconds |
| `table_stats_seconds_since_last_vacuum` | Seconds since last vacuum | Seconds |

### Index statistics (`pg_stat_all_indexes`)
Collected every 30 seconds
**Additional Labels:** `schemaname` (schema name), `relname` (table name), `indexrelname` (index name)

| Metric | Description | Units |
|--------|-------------|-------|
| `pg_stat_all_indexes_idx_scan` | Index scans performed | - |
| `pg_stat_all_indexes_idx_tup_read` | Index entries returned | - |
| `pg_stat_all_indexes_idx_tup_fetch` | Table rows fetched via index | - |

### WAL and replication metrics (`wal`, `replication`, `replication_slots`, `pg_stat_replication`, `pg_stat_wal_receiver`, `pg_archiver`, `archive_lag`, `pg_xlog_position`)
Collected every 15-30 seconds


| Metric | Description | Units |
|--------|-------------|-------|
| `wal_xlog_location_b` | Current WAL location | Bytes |
| `wal_in_recovery_int` | Whether instance is in recovery mode | Boolean (0/1) |
| `wal_postmaster_uptime_s` | Postgres server uptime | Seconds |
| `wal_timeline` | Current timeline ID | - |
| `replication_sent_lag_b` | Replication sent lag | Bytes |
| `replication_write_lag_b` | Replication write lag | Bytes |
| `replication_flush_lag_b` | Replication flush lag | Bytes |
| `replication_replay_lag_b` | Replication replay lag | Bytes |
| `replication_write_lag_ms` | Replication write lag | Milliseconds |
| `replication_flush_lag_ms` | Replication flush lag | Milliseconds |
| `replication_replay_lag_ms` | Replication replay lag | Milliseconds |
| `archive_lag_current_lsn_numeric` | Current LSN as numeric value | - |
| `archive_lag_archived_wal_finish_lsn_numeric` | Archived WAL finish LSN as numeric | - |
| `archive_lag_wal_files_behind` | Number of WAL files behind archive | - |
| `archive_lag_seconds_since_archive` | Seconds since last archive | Seconds |
| `archive_lag_archived_count` | Total archived WAL files | - |
| `archive_lag_failed_count` | Failed archive attempts | - |
| `pg_archiver_pending_wal_count` | Number of WAL files pending archive | - |
| `pg_wal_size_bytes` | Total size of regular files in the `pg_wal` directory (via `pg_ls_waldir()`; excludes subdirectories such as `pg_wal/archive_status`). New in 0.15. Not emitted when `pg_wal_size_status_code` > 0. | Bytes |
| `pg_wal_size_status_code` | `pg_wal` size collection status: `0` = success, `1` = `pg_ls_waldir()` not available, `2` = monitoring role lacks EXECUTE privilege. New in 0.15. | - |

:::note Interpreting `pg_wal_size`
`pg_wal` growth that is not matched by archive or replica progress points to disk-fill risk —
typically a stuck WAL archiver, an inactive replication slot retaining WAL, or sustained high
WAL generation. Cross-reference with the archiver and replication-slot metrics above, and see
[How to troubleshoot a growing pg_wal directory](/docs/postgres-howtos/database-administration/maintenance/how-to-troubleshoot-a-growing-pg-wal-directory).
:::

### xmin horizon (`xmin_horizon`)
Collected every 30 seconds. Instance-level, primary only. New in 0.15.

Tracks the current xmin horizon age split by blocker class and horizon type. Component
`*_age_tx` / `*_count` columns emit `0` (never NULL) when that component has no active blocker.
Used by [Dashboard 07 — Autovacuum and xmin horizon](/docs/monitoring/dashboards/autovacuum).

| Metric | Description | Units |
|--------|-------------|-------|
| `xmin_horizon_data_horizon_age_tx` | Age of the data horizon (worst of client-backend, slot, standby, prepared-xact blockers) | Transactions |
| `xmin_horizon_catalog_horizon_age_tx` | Age of the catalog horizon (data horizon plus catalog `catalog_xmin` blockers) | Transactions |
| `xmin_horizon_snapshot_xmin` | Raw snapshot xmin anchor (`txid_snapshot_xmin(txid_current_snapshot())`) | - |
| `xmin_horizon_pg_stat_activity_age_tx` | Oldest client-backend `backend_xmin` age | Transactions |
| `xmin_horizon_pg_stat_activity_count` | Number of client backends holding a horizon | - |
| `xmin_horizon_pg_replication_slots_age_tx` | Oldest replication-slot `xmin` age | Transactions |
| `xmin_horizon_pg_replication_slots_count` | Number of slots holding the data horizon | - |
| `xmin_horizon_pg_replication_slots_catalog_age_tx` | Oldest replication-slot `catalog_xmin` age | Transactions |
| `xmin_horizon_pg_replication_slots_catalog_count` | Number of slots holding the catalog horizon | - |
| `xmin_horizon_pg_stat_replication_age_tx` | Oldest standby-feedback `backend_xmin` age | Transactions |
| `xmin_horizon_pg_stat_replication_count` | Number of standbys holding a horizon | - |
| `xmin_horizon_pg_prepared_xacts_age_tx` | Oldest prepared-transaction age | Transactions |
| `xmin_horizon_pg_prepared_xacts_count` | Number of prepared transactions holding a horizon | - |

### xmin horizon blockers (`xmin_horizon_blockers`)
Collected every 30 seconds. Instance-level, primary only. New in 0.15.

Captures the single oldest (top) blocker for each currently active component as a separate
labeled series, with that blocker's xmin age in transactions. Emits one series per active
component and no series for an empty component, so cardinality varies between 0 and 5 per
scrape. The monitoring role's own sessions are excluded.

**Additional Labels:** `component` (`pg_stat_activity`, `pg_replication_slots`,
`pg_replication_slots_catalog`, `pg_stat_replication`, `pg_prepared_xacts`), `horizon_type`
(`data` / `catalog`), `blocker_database`, `blocker_user`, `blocker_appname`, `blocker_state`,
`queryid` (for activity blockers), `slot_name` / `slot_type` / `slot_plugin` /
`slot_xmin_source` / `slot_status` / `slot_wal_status` (for slot blockers), `standby_name`
(for replication blockers), `prepared_gid` / `owner` (for prepared-transaction blockers).

| Metric | Description | Units |
|--------|-------------|-------|
| `xmin_horizon_blockers_age_tx` | xmin age of the top blocker for the labeled component | Transactions |

:::note Query text is not a label
Query text is intentionally not emitted as a Prometheus label. Use the `queryid` label to look
up the query text in pgwatch query storage.
:::

### I/O statistics (`pg_stat_io`, PostgreSQL 16+) {#io-statistics-pg_stat_io-postgresql-16}
Collected every 30 seconds. Instance-level. New in 0.15.

Collects I/O statistics from the PostgreSQL `pg_stat_io` view (PostgreSQL 16+). On PostgreSQL
15 and earlier this group emits nothing. Values are aggregated by backend type with a `total`
row added via `ROLLUP`. Used by
[Dashboard 14 — I/O statistics](/docs/monitoring/dashboards/io-statistics).

**Additional Labels:** `backend_type` (e.g. `client backend`, `autovacuum worker`,
`background writer`, `checkpointer`, `walwriter`, or `total` for the rollup row).

| Metric | Description | Units |
|--------|-------------|-------|
| `pg_stat_io_reads` | Read operations | - |
| `pg_stat_io_read_bytes_mb` | Data read | MiB |
| `pg_stat_io_read_time_ms` | Time spent reading | Milliseconds |
| `pg_stat_io_writes` | Write operations | - |
| `pg_stat_io_write_bytes_mb` | Data written | MiB |
| `pg_stat_io_write_time_ms` | Time spent writing | Milliseconds |
| `pg_stat_io_writebacks` | Writeback operations | - |
| `pg_stat_io_writeback_bytes_mb` | Data written back | MiB |
| `pg_stat_io_writeback_time_ms` | Time spent on writebacks | Milliseconds |
| `pg_stat_io_fsyncs` | fsync operations | - |
| `pg_stat_io_fsync_time_ms` | Time spent on fsyncs | Milliseconds |
| `pg_stat_io_extends` | Relation extend operations | - |
| `pg_stat_io_extend_bytes_mb` | Data added by extends | MiB |
| `pg_stat_io_hits` | Blocks found in shared buffers | - |
| `pg_stat_io_evictions` | Buffers evicted to make room | - |
| `pg_stat_io_reuses` | Buffers reused directly (e.g. ring buffers) | - |
| `pg_stat_io_stats_reset_s` | Seconds since `pg_stat_reset_shared('io')` | Seconds |

### Bloat analysis metrics (`pg_table_bloat`, `pg_btree_bloat`, `unused_indexes`, `rarely_used_indexes`, `redundant_indexes`, `pg_invalid_indexes`)
Collected every 2-3 hours


| Metric | Description | Units |
|--------|-------------|-------|
| `pg_table_bloat_real_size_mib` | Actual size of table/index | Megabytes |
| `pg_table_bloat_extra_size` | Extra space due to bloat | Bytes |
| `pg_table_bloat_extra_pct` | Percentage of space wasted | Percent |
| `pg_table_bloat_bloat_size` | Estimated bloat size | Bytes |
| `pg_table_bloat_bloat_pct` | Estimated bloat percentage | Percent |
| `pg_btree_bloat_real_size_mib` | Actual index size | Megabytes |
| `pg_btree_bloat_extra_size` | Extra space due to index bloat | Bytes |
| `pg_btree_bloat_extra_pct` | Percentage of index space wasted | Percent |
| `pg_btree_bloat_bloat_size` | Estimated index bloat size | Bytes |
| `pg_btree_bloat_bloat_pct` | Estimated index bloat percentage | Percent |
| `pg_btree_bloat_fillfactor` | Index fill factor | - |
| `pg_btree_bloat_is_na` | Whether bloat calculation is not available | Boolean (0/1) |

### Transaction and process metrics (`pg_blocked`, `pg_long_running_transactions`, `pg_stuck_idle_in_transaction`, `pg_txid`, `pg_database_wraparound`, `pg_vacuum_progress`, `pg_total_relation_size`)
Collected every 30 seconds


| Metric | Description | Units |
|--------|-------------|-------|
| `pg_blocked_queries` | Number of blocked queries | - |
| `pg_long_running_transactions_transactions` | Number of long-running transactions | - |
| `pg_long_running_transactions_age_in_seconds` | Age of longest transaction | Seconds |
| `pg_database_wraparound_age_datfrozenxid` | Age of database frozen transaction ID | - |
| `pg_database_wraparound_age_datminmxid` | Age of database minimum multixact ID | - |
| `pg_stuck_idle_in_transaction_queries` | Number of stuck idle-in-transaction queries | - |
| `pg_txid_current` | Current transaction ID | - |
| `pg_txid_xmin` | Minimum transaction ID in snapshot | - |
| `pg_txid_xmin_age` | Age of minimum transaction ID | - |
| `pg_total_relation_size_bytes` | Total relation size including indexes | Bytes |

### Configuration settings (`settings`)
Collected every 5 minutes
**Additional Labels:** `setting_name` (parameter name), `setting_value` (parameter value), `unit` (value unit), `category` (setting category), `vartype` (variable type)

| Metric | Description | Units |
|--------|-------------|-------|
| `settings_numeric_value` | Numeric value of configuration setting | - |
| `settings_is_default` | Whether setting is at default value | Boolean (0/1) |
| `settings_configured` | Whether setting is configured | Boolean (0/1) |

