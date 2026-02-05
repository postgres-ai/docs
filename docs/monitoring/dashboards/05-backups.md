---
title: "05. Backups"
sidebar_label: "05. Backups"
sidebar_position: 6
---

# 05. Backups and DR

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

### WAL archiving status

**What it shows:**
- WAL files waiting to be archived
- Archive success/failure rate
- Archive lag time

**Healthy state:**
- `ready_count` near 0 (no backlog)
- Consistent archive rate matching WAL generation

**Warning signs:**
- Growing `ready_count` = archiving falling behind
- Archive failures = storage or network issues

### Last backup age

**What it shows:**
- Time since last successful backup
- Backup duration trend

**Healthy range:**
- Within your backup schedule (e.g., < 24h for daily backups)

### WAL generation rate

**What it shows:**
- WAL bytes generated per second
- Helps size archive storage and bandwidth

### Checkpoint activity

**What it shows:**
- Checkpoint frequency and duration
- Checkpoint write/sync times

**Healthy state:**
- Checkpoints completing within `checkpoint_timeout`
- No checkpoint warnings in logs

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster_name` | Cluster filter |
| `node_name` | Node filter |

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
