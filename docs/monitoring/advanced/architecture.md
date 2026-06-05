---
title: Architecture
sidebar_label: Architecture
sidebar_position: 5
---

# Architecture

Deep-dive into PostgresAI monitoring system components and data flow.

## System overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PostgresAI Monitoring                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │ PostgreSQL  │    │ PostgreSQL  │    │ PostgreSQL  │              │
│  │  Cluster A  │    │  Cluster B  │    │  Cluster C  │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                     │
│         └──────────────────┼──────────────────┘                     │
│                            │                                        │
│                     ┌──────▼──────┐                                 │
│                     │   pgwatch   │                                 │
│                     │  (collector)│                                 │
│                     └──────┬──────┘                                 │
│                            │ Prometheus format                      │
│                     ┌──────▼────────┐                               │
│                     │VictoriaMetrics│                               │
│                     │  (storage)    │                               │
│                     └──────┬────────┘                               │
│                            │ PromQL                                 │
│                     ┌──────▼────────┐                               │
│                     │   Grafana     │                               │
│                     │(visualization)│                               │
│                     └───────────────┘                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

### pgwatch — Metrics collector

**Purpose:** Collect PostgreSQL metrics and expose in Prometheus format

**Key functions:**
- Execute SQL queries against PostgreSQL
- Transform results to Prometheus metrics
- Expose the `/pgwatch` metrics endpoint on `:9091` (Prometheus sink)

**Configuration:**
| Setting | Default | Description |
|---------|---------|-------------|
| Scrape interval | 30s | VictoriaMetrics scrapes the `pgwatch-prometheus` job every 30s (the 15s global default is overridden for this job; the separate `query-info` job — `metrics_path: /query_info_metrics` — runs every 300s) |
| Collection interval | per-metric | Each metric group has its own interval in `metrics.yml` (most 30s; `pg_stat_activity`/`wait_events` 15s) |

**Collected data sources:**
| View | Metrics |
|------|---------|
| pg_stat_statements | Query performance |
| pg_stat_activity | Session state |
| wait_events (from pg_stat_activity) | Wait event sampling |
| pg_stat_all_tables / table_stats | Table access patterns |
| pg_stat_all_indexes | Index usage |
| db_stats (from pg_stat_database) | Database-level stats |
| bgwriter | Checkpoint behavior |

### VictoriaMetrics — time-series database

**Purpose:** Store and query metrics

**Key functions:**
- Ingest metrics from pgwatch
- Compress and store time-series data
- Execute PromQL queries

**Performance characteristics:**
| Aspect | VictoriaMetrics | Prometheus |
|--------|-----------------|------------|
| Compression | 10x better | Baseline |
| Query speed | 2-5x faster | Baseline |
| Memory usage | 3-5x lower | Baseline |
| High availability | Built-in clustering | Federation |

**Storage model:**

In this deployment VictoriaMetrics is started with `-storageDataPath=/victoria-metrics-data`, and
the `victoria_metrics_data` Docker volume is mounted at `/victoria-metrics-data`. The on-disk
layout under that path follows VictoriaMetrics' standard structure (recent vs. historical data
parts, a label index, and optional snapshots).

### Grafana — Visualization

**Purpose:** Dashboard and alerting UI

**Key functions:**
- Render time-series charts
- Dashboard templating with variables
- Unified alerting

**Dashboard structure:**
```
PostgresAI dashboards:
├── 01. Node overview      (cluster-level)
├── 02. Query analysis     (top-N queries)
├── 03. Single query       (query deep-dive)
├── 04. Wait events        (session analysis)
├── 05. Backups            (WAL archiving)
├── 06. Replication        (lag monitoring)
├── 07. Autovacuum         (vacuum status)
├── 08. Table stats        (table analysis)
├── 09. Single table       (table deep-dive)
├── 10. Index health       (index analysis)
├── 11. Single index       (index deep-dive)
├── 12. SLRU               (cache stats)
├── 13. Lock contention    (lock waits)
├── 14. I/O statistics     (pg_stat_io, PG16+)
└── Self-monitoring        (stack health)
```

## Data flow

### Collection flow

```
1. pgwatch connects to PostgreSQL
   └── Uses monitoring user credentials
   └── Executes metric collection queries

2. Query results transformed to metrics
   └── Column values → metric values
   └── Column names → labels

3. Metrics exposed on the `/pgwatch` endpoint (`:9091`)
   └── Prometheus exposition format
   └── Timestamp attached

4. VictoriaMetrics scrapes the pgwatch-prometheus sink
   └── HTTP GET pgwatch-prometheus:9091/pgwatch
   └── `pgwatch-prometheus` job scrape_interval: 30s (scrape_timeout 25s)

5. Metrics stored in VictoriaMetrics
   └── Compressed time-series storage
   └── Indexed by labels
```

### Query flow

```
1. User opens Grafana dashboard
   └── Dashboard loads panel queries

2. Grafana sends PromQL to VictoriaMetrics
   └── Variables substituted
   └── Time range applied

3. VictoriaMetrics executes query
   └── Index lookup by labels
   └── Data retrieval from storage
   └── Aggregation/calculation

4. Results returned to Grafana
   └── Time series data
   └── Rendered as charts
```

## Metric naming

### Convention

pgwatch exports series as `pgwatch_<metric-group>_<column>`. The Prometheus metric **type** is
driven by each metric group's `gauges:` list in `config/pgwatch-prometheus/metrics.yml`: a column
is emitted as a Prometheus gauge only if its group lists it (or uses `gauges: ['*']`); otherwise it
is emitted as a counter. Note this is the **exported** type, not the PostgreSQL semantics — the
`db_stats` and `pg_stat_statements` groups use `gauges: ['*']` / explicit gauge lists, so their
cumulative columns (e.g. `xact_commit`, `exec_time_total`) are exported as **gauges** even though
they only ever increase. Cumulative columns in the `pg_stat_database` family are also **not**
`_total`-suffixed.

```
pgwatch_<metric-group>_<column>

Examples (Type = the exporter's emitted Prometheus type):
pgwatch_db_stats_xact_commit                  # Gauge (transactions committed; db_stats uses gauges: ['*'])
pgwatch_db_stats_numbackends                  # Gauge (current backends)
pgwatch_pg_stat_statements_exec_time_total    # Gauge (total exec time, ms; listed in pg_stat_statements gauges)
```

### Labels

The cluster label is `cluster` (set from `custom_tags.cluster`). `cluster_name` is only the
Grafana template variable; dashboard filters select with `cluster="$cluster_name"`.

```
pgwatch_<metric-group>_<column>{
  cluster="production",
  node_name="primary",
  datname="myapp",
  schemaname="public",
  relname="users"
}
```

## Storage requirements

### Calculation

```
Storage = metrics_per_second × bytes_per_sample × retention_seconds

Typical values:
- metrics_per_second: 50-200 per database
- bytes_per_sample: 3-5 bytes (VictoriaMetrics compressed)
- retention: 1,209,600 seconds (14 days)

Example: 5 databases, 14-day retention
= 5 × 100 × 1.5 × 1,209,600
= 907,200,000 bytes ≈ 907 MB (≈ 865 MiB)
```

### Scaling factors

| Factor | Impact |
|--------|--------|
| More databases | Linear increase |
| More tables/indexes | Sublinear (only active tracked) |
| Longer retention | Linear increase |
| Shorter scrape interval | Linear increase |

## High availability

### HA architecture

```
┌─────────────────────────────────────────────────────┐
│                    Load Balancer                    │
└────────────────────────┬────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
    │pgwatch-1│     │pgwatch-2│     │pgwatch-3│
    └────┬────┘     └────┬────┘     └────┬────┘
         │               │               │
         └───────────────┼───────────────┘
                         │ remote_write
                         │
    ┌────────────────────▼────────────────────┐
    │           VictoriaMetrics Cluster       │
    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
    │  │vmstorage1│ │vmstorage2│ │vmstorage3│ │
    │  └──────────┘ └──────────┘ └──────────┘ │
    └────────────────────┬────────────────────┘
                         │
                    ┌────▼────┐
                    │ Grafana │
                    │  (HA)   │
                    └─────────┘
```

### Failure modes

| Component failure | Impact | Recovery |
|-------------------|--------|----------|
| Single pgwatch | Partial data loss | Automatic failover |
| Single vmstorage | No data loss (replication) | Automatic |
| All pgwatch | Collection stops | Manual restart |
| All vmstorage | Query unavailable | Restore from backup |
| Grafana | UI unavailable | Load balancer failover |

## Data privacy — metadata only

PostgresAI monitoring collects **only database metadata** — no actual data or query parameters are ever accessed.

### Collected data types

| Data type | Example | Storage location |
|-----------|---------|------------------|
| Database statistics | Connections, transactions, cache hit ratio | Prometheus (VictoriaMetrics) |
| Normalized queries | `select * from users where id = $1` | PostgreSQL sink |
| Wait events | CPU, IO, Lock, LWLock | Prometheus (VictoriaMetrics) |
| Table statistics | Row count, dead tuples, last vacuum | Prometheus (VictoriaMetrics) |
| Index statistics | Size, scans, tuples read | Prometheus (VictoriaMetrics) |
| Column statistics | From `pg_statistic` for bloat estimates | Prometheus (VictoriaMetrics) |

### NOT collected

- Actual table data (row contents)
- Query parameter values (`$1`, `$2` remain as placeholders)
- Application secrets or credentials
- Connection passwords

### Metric definitions

Review exactly what is collected:

- **Prometheus metrics**: [pgwatch-prometheus/metrics.yml](https://gitlab.com/postgres-ai/postgresai/-/blob/0.15.0/config/pgwatch-prometheus/metrics.yml)
- **PostgreSQL metrics** (with query texts): [pgwatch-postgres/metrics.yml](https://gitlab.com/postgres-ai/postgresai/-/blob/0.15.0/config/pgwatch-postgres/metrics.yml)

### Verify monitoring database role and its permissions

```bash
# See exact SQL for creating monitoring role
npx postgresai@0.15.0 prepare-db --print-sql
```

## Security architecture

### Network

```
┌─────────────────────────────────────────────────────┐
│                    DMZ / Public                     │
│                                                     │
│                    ┌─────────┐                      │
│                    │ Grafana │ ← HTTPS (443)        │
│                    └────┬────┘                      │
└─────────────────────────┼───────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────┐
│                  Internal Network                   │
│                         │                           │
│  ┌──────────────────────▼─────────────────────────┐ │
│  │         VictoriaMetrics (sink-prometheus)      │ │
│  │      (port 9090 internal, host 59090)          │ │
│  └──────────────────────┬─────────────────────────┘ │
│            scrapes pgwatch-prometheus:9091/pgwatch   │
│  ┌──────────────────────▼─────────────────────────┐ │
│  │   pgwatch (pgwatch-postgres, pgwatch-prometheus)│ │
│  │   metrics scraped on pgwatch-prometheus:9091    │ │
│  │   (web/health ports 8080/8089 are internal)     │ │
│  └──────────────────────┬─────────────────────────┘ │
│                         │                           │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────┐
│                  Database Network                   │
│                         │                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │PostgreSQL│  │PostgreSQL│  │PostgreSQL│           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Credentials

| Component | Credential type | Storage |
|-----------|-----------------|---------|
| PostgreSQL | Password | Environment variable / secret |
| VictoriaMetrics | Basic auth | Config file |
| Grafana | OAuth/LDAP | Database |

## Performance characteristics

### Collection overhead

Frequencies below are the `full` preset intervals from `config/pgwatch-prometheus/metrics.yml`
(see the per-metric note above):

| Metric type | Query cost | Frequency |
|-------------|------------|-----------|
| pg_stat_database (`db_stats`) | Low | 30s |
| pg_stat_statements | Medium | 30s |
| pg_stat_all_tables / `table_stats` | Medium | 30s |
| Bloat estimation (`pg_table_bloat`, `pg_btree_bloat`) | High | 7200s (2h) |

### Query performance

| Query type | Typical latency |
|------------|-----------------|
| Instant query | 10-100ms |
| Range query (1h) | 50-200ms |
| Range query (24h) | 200-500ms |
| Range query (7d) | 500ms-2s |

### Resource usage

| Component | CPU | Memory | Disk I/O |
|-----------|-----|--------|----------|
| pgwatch | Low | 256 MiB | Minimal |
| VictoriaMetrics | Medium | 2 GiB+ | Medium |
| Grafana | Low | 512 MiB | Low |
