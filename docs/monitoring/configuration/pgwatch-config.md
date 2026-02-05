---
title: pgwatch configuration
sidebar_label: pgwatch
sidebar_position: 2
---

# pgwatch configuration

Configuration options for the pgwatch metrics collector.

## Collection intervals

### Global interval

Default collection interval for all metrics:

```bash
# CLI
postgresai mon local-install --scrape-interval 15s

# Environment variable
PW_SCRAPE_INTERVAL=15s
```

| Interval | Use case |
|----------|----------|
| 10s | High-resolution troubleshooting |
| 15s | Default — balanced |
| 30s | Lower resource usage |
| 60s | Large-scale deployments |

### Per-metric intervals

Some metrics use different intervals by default:

| Metric group | Default interval | Rationale |
|--------------|------------------|-----------|
| pg_stat_statements | 15s | Query metrics — high value |
| pg_stat_activity | 5s | Wait events — time-sensitive |
| Table/index stats | 60s | Slow-changing, expensive |
| Bloat estimates | 300s | Very expensive queries |

## Connection settings

### Max connections

Limit connections to monitored databases:

```bash
PW_MAX_PARALLEL_CONNECTIONS_PER_DB=3
```

Impact:
- Higher values — faster collection, more load
- Lower values — slower collection, less load

### Connection timeout

```bash
PW_CONNECT_TIMEOUT=10s
```

### Statement timeout

Prevent long-running collection queries:

```bash
PW_STATEMENT_TIMEOUT=30s
```

## Metric presets

### Preset levels

| Preset | Metrics collected | Use case |
|--------|-------------------|----------|
| basic | pg_stat_database, pg_stat_activity | Minimal monitoring |
| standard | Above + pg_stat_statements, table/index stats | Most deployments |
| full | All available metrics | Deep analysis |
| exhaustive | Full + expensive bloat queries | Troubleshooting |

```bash
postgresai mon local-install --preset standard
```

### Custom metric selection

Enable specific metrics:

```bash
PW_ENABLED_METRICS="pg_stat_statements,pg_stat_activity,table_stats"
```

Disable specific metrics:

```bash
PW_DISABLED_METRICS="bloat_indexes,bloat_tables"
```

## Database filtering

### Include specific databases

```bash
PW_INCLUDE_DATABASES="production,staging"
```

### Exclude databases

```bash
PW_EXCLUDE_DATABASES="template0,template1,postgres"
```

## Custom metrics

### Adding a custom metric

1. Create metric definition file:

```yaml
# custom-metrics/my_metric.yaml
metrics:
  my_custom_metric:
    query: |
      select
        datname,
        count(*) as connection_count
      from pg_stat_activity
      where state = 'active'
      group by datname
    interval: 30s
    labels:
      - datname
    value_columns:
      - connection_count
```

2. Mount into container:

```yaml
volumes:
  - ./custom-metrics:/etc/pgwatch/custom-metrics
```

### Metric definition fields

| Field | Required | Description |
|-------|----------|-------------|
| query | Yes | SQL query to execute |
| interval | No | Override default interval |
| labels | No | Columns to use as labels |
| value_columns | Yes | Columns containing metric values |
| is_counter | No | Mark as counter vs gauge |

## Logging

### Log level

```bash
PW_LOG_LEVEL=info  # debug, info, warn, error
```

### Log format

```bash
PW_LOG_FORMAT=json  # json, text
```

## Resource limits

### Memory

Limit pgwatch memory usage:

```yaml
# docker-compose.yml
services:
  pgwatch:
    deploy:
      resources:
        limits:
          memory: 512M
```

### CPU

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
```

## High availability

### Multiple pgwatch instances

For HA, run multiple pgwatch instances with load balancing:

```yaml
services:
  pgwatch-1:
    environment:
      PW_INSTANCE_ID: pgwatch-1
      PW_CLUSTER_NODES: "pgwatch-1:8080,pgwatch-2:8080"

  pgwatch-2:
    environment:
      PW_INSTANCE_ID: pgwatch-2
      PW_CLUSTER_NODES: "pgwatch-1:8080,pgwatch-2:8080"
```

## Troubleshooting

### Check collection status

```bash
curl http://localhost:8080/metrics | grep pgwatch_
```

### View collected metrics

```bash
curl http://localhost:8080/api/v1/metrics
```

### Common issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No metrics | Connection failed | Check credentials and network |
| Missing pg_stat_statements | Extension not loaded | Add to shared_preload_libraries |
| High CPU on target | Expensive queries | Use lower preset or longer intervals |
