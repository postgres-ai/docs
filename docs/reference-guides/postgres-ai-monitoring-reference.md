---
title: postgres_ai monitoring reference documentation
sidebar_label: postgres_ai monitoring
keywords:
  - "postgres_ai monitoringreference"
  - "Monitoring reference"
---

# postgres_ai monitoring reference documentation

## Metrics

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
- **Query metrics** (`pg_stat_statements`): `queryid`, `user`
- **Table metrics** (`table_stats`, `pg_stat_user_tables`): `schema`, `table_name`, `table_full_name`, `table_size_cardinality_mb`
- **Index metrics** (`pg_stat_user_indexes`): `schemaname`, `relname`, `indexrelname`
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
| `pg_stat_activity_count` | Count of sessions by state | - |
| `pg_stat_activity_max_tx_duration` | Maximum transaction duration | Seconds |

### Query performance (`pg_stat_statements`)
Collected every 30 seconds
**Additional Labels:** `queryid` (query identifier), `user` (database user)

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

### Wait events (`wait_events`)
Collected every 15 seconds
**Additional Labels:** `wait_event` (specific wait event), `wait_event_type` (wait category), `query_id` (associated query)

| Metric | Description | Units |
|--------|-------------|-------|
| `wait_events_total` | Count of processes experiencing wait event | - |

### Table statistics (`table_stats`, `pg_stat_user_tables`)
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

### Index statistics (`pg_stat_user_indexes`)
Collected every 30 seconds
**Additional Labels:** `schemaname` (schema name), `relname` (table name), `indexrelname` (index name)

| Metric | Description | Units |
|--------|-------------|-------|
| `pg_stat_user_indexes_idx_scan` | Index scans performed | - |
| `pg_stat_user_indexes_idx_tup_read` | Index entries returned | - |
| `pg_stat_user_indexes_idx_tup_fetch` | Table rows fetched via index | - |

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

