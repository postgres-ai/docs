---
title: Performance tuning
sidebar_label: Performance
sidebar_position: 4
---

# Performance tuning

Optimizing PostgresAI monitoring for better performance and lower resource usage.

## Diagnosing performance issues

### Symptoms

| Symptom | Likely cause |
|---------|--------------|
| Slow dashboard loading | Complex queries, many time series |
| High CPU on target database | Expensive collection queries |
| VictoriaMetrics using high memory | Large cardinality, long retention |
| Grafana timeouts | Query timeout too short |

### Quick diagnostics

```bash
# Check resource usage
docker stats

# Check query times in Grafana
# Dashboard → Panel → Query Inspector → Stats
```

## Target database impact

### Reducing collection overhead

**1. Increase collection interval:**

```bash
# Default: 15s, increase for less load
PW_SCRAPE_INTERVAL=30s
```

**2. Use appropriate preset:**

| Preset | Load | Coverage |
|--------|------|----------|
| basic | Low | Essential metrics only |
| standard | Medium | Most use cases |
| full | Higher | Complete visibility |

```bash
postgresai mon local-install --preset basic
```

**3. Disable expensive metrics:**

```bash
PW_DISABLED_METRICS="bloat_tables,bloat_indexes"
```

### Monitoring query overhead

Check which queries monitoring runs:

```sql
select
  query,
  calls,
  mean_exec_time,
  total_exec_time
from pg_stat_statements
where query like '%pg_stat%'
order by total_exec_time desc
limit 10;
```

## VictoriaMetrics tuning

### Memory optimization

**Reduce active time series:**

```bash
# Limit cardinality
VM_STORAGE_MAX_UNIQUE_SERIES=1000000
```

**Adjust cache sizes:**

```bash
# Reduce if memory constrained
VM_STORAGE_CACHE_SIZE_STORAGE_TSID=128MB
VM_STORAGE_CACHE_SIZE_INDEX_DB=64MB
```

### Query performance

**Increase query timeout:**

```bash
VM_SEARCH_QUERY_TIMEOUT=60s
```

**Limit concurrent queries:**

```bash
VM_SEARCH_MAX_CONCURRENT_REQUESTS=8
```

**Reduce query memory:**

```bash
VM_SEARCH_MAX_MEMORY_PER_QUERY=256MB
```

### Storage optimization

**Shorter retention:**

```bash
VM_RETENTION_PERIOD=7d  # Down from 14d
```

**Enable compression:**

VictoriaMetrics compresses by default. Check compression ratio:

```bash
curl http://localhost:8428/api/v1/status/tsdb
```

## Grafana optimization

### Dashboard design

**Reduce panels per dashboard:**
- Limit to 20-30 panels
- Use collapsed rows for less-used panels

**Optimize panel queries:**
- Use `rate()` instead of raw counters
- Limit time series with `topk()` or `bottomk()`
- Add `{cluster_name="production"}` filters

**Example — limit to top 10:**

```promql
topk(10, rate(pg_stat_statements_calls_total[5m]))
```

### Query caching

Enable in Grafana:

```ini
[caching]
enabled = true
ttl = 60s
```

### Data point reduction

Limit data points returned:

```ini
# grafana.ini
[dataproxy]
max_idle_connections = 100
row_limit = 10000
```

## pgwatch tuning

### Connection pooling

**Limit connections per database:**

```bash
PW_MAX_PARALLEL_CONNECTIONS_PER_DB=2  # Down from 3
```

**Increase connection timeout:**

```bash
PW_CONNECT_TIMEOUT=15s
```

### Collection scheduling

**Stagger collection times:**

For multiple databases, avoid simultaneous collection:

```yaml
# Configure different scrape offsets
databases:
  - name: db1
    scrape_offset: 0s
  - name: db2
    scrape_offset: 5s
  - name: db3
    scrape_offset: 10s
```

## Resource allocation

### Minimum requirements

| Component | CPU | Memory | Disk |
|-----------|-----|--------|------|
| pgwatch | 0.5 cores | 256 MiB | minimal |
| VictoriaMetrics | 1 core | 2 GiB | 10 GiB/week |
| Grafana | 0.5 cores | 512 MiB | 100 MiB |

### Scaling recommendations

**Per monitored database:**
- Add 50 MiB RAM to VictoriaMetrics
- Add 5 GiB storage per week

**Example — 10 databases, 30-day retention:**
```
VictoriaMetrics RAM: 2 GiB + (10 × 50 MiB) = 2.5 GiB
VictoriaMetrics Disk: 10 × 4 weeks × 5 GiB = 200 GiB
```

## Docker resource limits

```yaml
# docker-compose.yml
services:
  pgwatch:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'

  victoriametrics:
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'

  grafana:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
```

## High cardinality issues

### Identify high cardinality

```bash
curl http://localhost:8428/api/v1/status/tsdb | jq '.data.totalSeries'
```

### Common cardinality sources

| Source | Impact | Mitigation |
|--------|--------|------------|
| queryid labels | High | Use query digest instead |
| Per-table metrics | Medium | Filter to important tables |
| Per-index metrics | Medium | Filter to important indexes |
| Multiple clusters | Additive | Separate VictoriaMetrics instances |

### Reduce cardinality

**Drop high-cardinality labels:**

```yaml
# VictoriaMetrics relabel config
relabel_configs:
  - action: labeldrop
    regex: query  # Drop full query text
```

**Aggregate metrics:**

```promql
# Instead of per-table
sum by (datname) (pg_stat_user_tables_seq_scan_total)
```

## Monitoring the monitoring

Use the Self-Monitoring dashboard to track:

- Collection latency
- Query durations
- Memory usage
- Disk usage

Set up alerts for monitoring health:

```yaml
- alert: MonitoringCollectionSlow
  expr: pgwatch_collection_duration_seconds > 30
  for: 5m
  labels:
    severity: warning
```

## Troubleshooting slow dashboards

### Step 1: Identify slow panels

1. Open dashboard
2. Click panel → Inspect → Query
3. Check "Query" tab for execution time

### Step 2: Analyze query

Look for:
- Missing time range filter
- High cardinality selectors
- Expensive aggregations

### Step 3: Optimize

```promql
# Before (slow)
sum(rate(pg_stat_statements_calls_total[5m]))

# After (faster - add filter)
sum(rate(pg_stat_statements_calls_total{cluster_name="$cluster"}[5m]))
```
