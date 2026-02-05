---
title: Prometheus/VictoriaMetrics configuration
sidebar_label: Prometheus/VictoriaMetrics
sidebar_position: 3
---

# Prometheus/VictoriaMetrics configuration

Configuration for the time-series database storing monitoring metrics.

PostgresAI uses VictoriaMetrics by default — a Prometheus-compatible TSDB with better performance and compression.

## Retention

### Setting retention period

```bash
# CLI
postgresai mon local-install --retention 30d

# Environment variable
VM_RETENTION_PERIOD=30d
```

| Retention | Disk usage (approx) | Use case |
|-----------|---------------------|----------|
| 7d | ~500 MiB per database | Development |
| 14d | ~1 GiB per database | Default |
| 30d | ~2 GiB per database | Production |
| 90d | ~6 GiB per database | Compliance requirements |

### Retention with downsampling

For long retention with reduced storage:

```bash
# Keep full resolution for 14 days
# Downsample to 1-minute resolution for 90 days
VM_RETENTION_PERIOD=14d
VM_DOWNSAMPLING_PERIOD=90d:1m
```

## Storage

### Data directory

```bash
VM_STORAGE_DATA_PATH=/var/lib/victoriametrics
```

### Disk allocation

Estimate storage needs:

```
Storage = (metrics/sec) × (bytes/metric) × (retention_seconds)
```

Typical values:
- ~100 metrics/sec per monitored database
- ~3-5 bytes/sample (VictoriaMetrics with typical monitoring data)
- 14 days = 1,209,600 seconds

Result: ~12 GiB per database for 14-day retention

### Memory allocation

VictoriaMetrics uses memory for caching:

```yaml
# docker-compose.yml
services:
  victoriametrics:
    deploy:
      resources:
        limits:
          memory: 2G
```

Rule of thumb: 2 GiB minimum, add 512 MiB per 10 monitored databases.

## Scrape configuration

### Scrape interval

How often VictoriaMetrics pulls from pgwatch:

```yaml
# prometheus.yml or vmagent config
scrape_configs:
  - job_name: pgwatch
    scrape_interval: 15s
    static_configs:
      - targets: ['pgwatch:8080']
```

### Scrape timeout

```yaml
scrape_timeout: 10s
```

### Labels

Add global labels to all metrics:

```yaml
global:
  external_labels:
    environment: production
    region: us-east-1
```

## Query settings

### Query timeout

```bash
VM_SEARCH_QUERY_TIMEOUT=30s
```

### Max concurrent queries

```bash
VM_SEARCH_MAX_CONCURRENT_REQUESTS=16
```

### Max query memory

```bash
VM_SEARCH_MAX_MEMORY_PER_QUERY=512MB
```

## Remote write

### Writing to external TSDB

Send metrics to additional destinations:

```yaml
# VictoriaMetrics remote write
-remoteWrite.url=https://external-tsdb.example.com/api/v1/write
-remoteWrite.basicAuth.username=user
-remoteWrite.basicAuth.password=secret
```

### Multi-tenancy

For SaaS deployments with multiple customers:

```bash
# Enable multi-tenancy
VM_ENABLE_MULTI_TENANCY=true

# Tenant ID from label
VM_TENANT_LABEL=customer_id
```

## Clustering

### VictoriaMetrics cluster mode

For high availability and horizontal scaling:

```yaml
services:
  vmstorage-1:
    image: victoriametrics/vmstorage
    command:
      - -storageDataPath=/data
      - -retentionPeriod=30d

  vminsert:
    image: victoriametrics/vminsert
    command:
      - -storageNode=vmstorage-1:8400,vmstorage-2:8400
      - -replicationFactor=2

  vmselect:
    image: victoriametrics/vmselect
    command:
      - -storageNode=vmstorage-1:8401,vmstorage-2:8401
```

### Replication

```bash
# Replicate data across N storage nodes
-replicationFactor=2
```

## Backup

### Creating backups

```bash
# Snapshot-based backup
curl http://localhost:8428/snapshot/create

# Download backup
vmbackup -snapshotName=<name> -dst=s3://bucket/path
```

### Restore

```bash
vmrestore -src=s3://bucket/path -storageDataPath=/var/lib/victoriametrics
```

## Performance tuning

### Compaction

```bash
# Merge compaction interval
VM_STORAGE_MIN_FREE_DISK_SPACE_BYTES=1 GiB
```

### Cache sizes

```bash
# Index cache
VM_STORAGE_CACHE_SIZE_STORAGE_TSID=256MB

# Data cache
VM_STORAGE_CACHE_SIZE_INDEX_DB=128MB
```

## Monitoring VictoriaMetrics

VictoriaMetrics exposes its own metrics:

```promql
# Ingestion rate
rate(vm_rows_inserted_total[5m])

# Query latency
histogram_quantile(0.99, rate(vm_request_duration_seconds_bucket[5m]))

# Storage size
vm_data_size_bytes
```

## Troubleshooting

### Check ingestion

```bash
curl http://localhost:8428/api/v1/status/tsdb
```

### Debug slow queries

```bash
# Enable query logging
-search.logSlowQueryDuration=5s
```

### Common issues

| Issue | Cause | Solution |
|-------|-------|----------|
| High memory | Large queries | Increase VM_SEARCH_MAX_MEMORY_PER_QUERY |
| Slow queries | No indexes | Check cardinality, reduce label count |
| Disk full | Retention too long | Reduce retention or add storage |
