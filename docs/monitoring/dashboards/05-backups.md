---
title: "05. WAL, backups, DR"
sidebar_label: "05. WAL, backups, DR"
sidebar_position: 6
---

# 05. WAL, backups, DR

Monitor backup status, WAL archiving, and disaster recovery readiness.

:::note
This dashboard requires WAL archiving to be configured (pgBackRest, WAL-G, or similar). Without backup tools configured, panels will show "No data".
:::

## Purpose

Track backup health to ensure:
- Backups complete successfully
- WAL archiving keeps pace with generation
- Recovery point objectives (RPO) are met

## When to use

- Daily backup verification
- Investigating failed backups
- Capacity planning for backup storage
- Validating DR readiness

## Key panels

The dashboard is organized into four rows: **WAL overview**, **WAL archiving**, **Replication slot
retention**, and **Configuration and WAL producers**.

### pg_wal directory size

**What it shows:**
- Size of the `pg_wal` directory over time

**Warning signs:**
- Steady growth = WAL is accumulating (archiving stuck or an inactive replication slot pinning WAL)

### WAL generation rate

**What it shows:**
- WAL bytes generated per second
- Helps size archive storage and bandwidth

### WAL archive success and errors / WAL archive success rate

**What it shows:**
- Counts of successful vs failed archive attempts (from `pg_stat_archiver`)
- The success rate as a percentage

**Healthy state:**
- 100% success rate, errors flat at zero

**Warning signs:**
- Archive failures = storage or network issues

### Archive lag bytes / Archive lag time and files

**What it shows:**
- How far behind archiving is, in bytes, in time, and in number of unarchived files

**Healthy state:**
- Lag near 0 (no backlog), consistent archive rate matching WAL generation

**Warning signs:**
- Growing lag = archiving falling behind

### Retained WAL by replication slot / Inactive replication slots

**What it shows:**
- WAL retained on behalf of each replication slot
- Count of inactive replication slots

**Warning signs:**
- An inactive slot retaining large amounts of WAL can fill the disk

### WAL-related settings / Top queries by WAL bytes/s

**What it shows:**
- A table of WAL-related configuration settings (e.g. `archive_mode`, `archive_command`,
  `wal_keep_size`, `max_wal_size`, `checkpoint_timeout`)
- The queries generating the most WAL per second (from `pg_stat_statements`)

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Node filter |
| `db_name` | Database filter |

## Backup tools integration

This dashboard monitors PostgreSQL-level metrics. For tool-specific monitoring:

| Tool | What to monitor |
|------|-----------------|
| pg_basebackup | Backup completion time, size |
| pgBackRest | Stanza status, backup retention |
| Barman | Server status, backup catalog |
| WAL-G | Backup list, WAL archive status |

## Related dashboards

- **Storage pressure** — [01. Node overview](/docs/monitoring/dashboards/node-overview)
- **Replication status** — [06. Replication](/docs/monitoring/dashboards/replication)

## Troubleshooting

### WAL archive backlog growing

1. Check archive command status:
   ```sql
   select * from pg_stat_archiver;
   ```

2. Verify archive destination has space

3. Check archive command in `postgresql.conf`:
   ```sql
   show archive_command;
   ```

### No backup metrics

Ensure your backup tool exposes metrics that pgwatch can collect, or configure custom metrics for your backup solution.
