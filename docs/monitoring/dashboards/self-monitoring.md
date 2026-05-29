---
title: "Self-monitoring"
sidebar_label: "Self-monitoring"
sidebar_position: 15
---

# Self-monitoring dashboard

Monitor the health of the monitoring stack itself.

![Self-monitoring dashboard](/img/monitoring/dashboards/self-monitoring.png)

:::note Screenshot note
The screenshot shows a containerized demo environment. Some host-level panels (CPU, memory, disk, network) require node_exporter or cAdvisor with Docker socket access. In production environments with proper host metrics collection, all panels display data.
:::

## Purpose

Ensure the monitoring infrastructure is functioning correctly:
- Metrics collection is working
- Storage has capacity
- No data gaps
- Alert pipeline is healthy

## When to use

- Regular monitoring stack health checks
- After monitoring stack updates
- When dashboards show "No data"
- Capacity planning for monitoring infrastructure

## Key panels

### Scrape success rate

**What it shows:**
- Percentage of successful metric scrapes
- Per-target breakdown

**Healthy state:**
- 100% success rate
- Consistent scrape intervals

**Warning signs:**
- Scrape failures — check target availability
- Timeouts — target may be overloaded

### Metrics ingestion rate

**What it shows:**
- Samples ingested per second
- Trend over time

**Use for:**
- Capacity planning
- Detecting metric explosion

### Storage usage

**What it shows:**
- VictoriaMetrics disk usage
- Projected capacity based on retention

**Warning threshold:**
- Alert when > 80% capacity

### Active time series

**What it shows:**
- Number of unique metric series
- Growth trend

**Monitoring series growth:**
- Sudden spikes may indicate cardinality explosion
- Gradual growth expected as you add targets

### Query performance

**What it shows:**
- Grafana query latency
- Slow queries

## Variables

| Variable | Purpose |
|----------|---------|
| `cluster` | Filter by monitored cluster (from the `custom_tags.cluster` instance tag) |
| `node_name` | Filter by node (from the `custom_tags.node_name` instance tag) |

## Health check commands

### Check VictoriaMetrics status

```bash
curl http://localhost:59090/api/v1/status/tsdb
```

### Check pgwatch status

```bash
docker compose logs pgwatch-postgres pgwatch-prometheus --tail=50
```

### Check Prometheus/VM targets

```bash
curl http://localhost:59090/api/v1/targets
```

### Verify metrics collection

```bash
curl 'http://localhost:59090/api/v1/query?query=up'
```

## Common issues

### Dashboards show "No data"

1. Check scrape targets are up:
   ```bash
   curl http://localhost:59090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
   ```

2. Verify metric exists:
   ```bash
   curl 'http://localhost:59090/api/v1/label/__name__/values' | jq '.data[]' | grep pg_
   ```

3. Check time range alignment

### High storage growth

1. Check for cardinality explosion:
   ```bash
   curl 'http://localhost:59090/api/v1/status/tsdb' | jq '.data.totalSeries'
   ```

2. Review high-cardinality metrics:
   ```bash
   curl 'http://localhost:59090/api/v1/status/tsdb' | jq '.data.seriesCountByMetricName | to_entries | sort_by(-.value) | .[0:10]'
   ```

3. Adjust retention if needed (default is `336h` ≡ 14 days):
   ```yaml
   # docker-compose.yml
   sink-prometheus:
     environment:
       - VM_RETENTION_PERIOD=30d  # Adjust retention if needed
   ```

### Scrape timeouts

1. Increase scrape timeout:
   ```yaml
   # prometheus.yml
   scrape_configs:
     - job_name: 'pgwatch'
       scrape_timeout: 30s
   ```

2. Check target database performance

3. Review pgwatch resource allocation

## Capacity planning

### Estimating storage needs

| Factor | Impact |
|--------|--------|
| Number of databases | Linear increase |
| Scrape interval | Shorter = more data |
| Retention period | Longer = more storage |
| Query cardinality | High = more series |

**Formula:**
```
Daily storage ≈ (series_count × samples_per_day × bytes_per_sample) / compression_ratio
```

Typical values:
- Bytes per sample: ~2-4 (compressed)
- Compression ratio: 10-15x
- Samples per day at 60s interval: 1,440

### Scaling recommendations

| Databases | Recommended resources |
|-----------|----------------------|
| 1-5 | 2 CPU, 2 GiB RAM, 20 GiB disk |
| 5-20 | 4 CPU, 4 GiB RAM, 100 GiB disk |
| 20-50 | 8 CPU, 8 GiB RAM, 500 GiB disk |

## Related dashboards

- **Target database health** — [01. Node Overview](/docs/monitoring/dashboards/node-overview)
