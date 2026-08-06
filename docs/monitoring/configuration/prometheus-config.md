---
title: Prometheus/VictoriaMetrics configuration
sidebar_label: Prometheus/VictoriaMetrics
sidebar_position: 3
---

# Prometheus/VictoriaMetrics configuration

Configuration for the time-series database storing monitoring metrics.

PostgresAI uses VictoriaMetrics by default — a Prometheus-compatible TSDB with better performance and compression.

## Authentication and security

New in 0.15, the VictoriaMetrics endpoint is protected with HTTP basic auth. Two `.env` keys
are now **required**:

```bash
VM_AUTH_USERNAME=vmauth
VM_AUTH_PASSWORD=<non-empty secret>
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `VM_AUTH_USERNAME` | `vmauth` | Basic-auth username for the VictoriaMetrics endpoint |
| `VM_AUTH_PASSWORD` | (none — must be set) | Basic-auth password; generate with `openssl rand -base64 18` |

**What it protects and why it is required:**

- It guards the VictoriaMetrics HTTP API so the metrics store is not exposed unauthenticated.
- Grafana's provisioned datasource authenticates with these same credentials. If they are
  missing or empty, **Grafana cannot query VictoriaMetrics and all dashboards show no data**.
- The shipped `.env.example` ships empty placeholders that make Docker Compose fail fast until
  a value is set, to prevent an accidentally unauthenticated deployment.

The CLI (`postgresai mon local-install` / `mon update` / `mon update-config`) generates and
preserves these automatically. If you run Docker Compose directly, you must add them before
`docker compose up -d` — see
[Upgrading the monitoring stack](/docs/monitoring/getting-started/upgrade#required-new-keys-in-015-victoriametrics-basic-auth).

### Rotating VictoriaMetrics credentials

The monitoring project directory (`~/.config/postgresai/monitoring/` for npx/global installs)
contains only `docker-compose.yml`, `instances.yml`, `.pgwatch-config`, and `.env` — the
`scripts/` directory is **not** copied there. So the simplest path that works for every install
type is to set a new password in `.env` and then recreate the affected services:

```bash
# Edit ~/.config/postgresai/monitoring/.env and set a new VM_AUTH_PASSWORD, e.g.
#   VM_AUTH_PASSWORD=$(openssl rand -base64 18)
# then recreate sink-prometheus (to pick up the new -httpAuth password) and Grafana
# (to re-provision its datasource with the new password):
docker compose up -d --force-recreate sink-prometheus grafana
```

:::warning `mon update-config` does not rotate the password
Running `postgresai mon update-config` alone is **not** enough here: in 0.15 it migrates required
`.env` keys (additive), refreshes the CLI-owned `docker-compose.yml` for non-git installs (a
no-op for git checkouts), and regenerates the pgwatch sources (`docker compose run --rm
sources-generator`). It does not restart Grafana or sink-prometheus. Grafana provisions its datasource
(with `editable: false`) only at container startup, so a rotated `VM_AUTH_PASSWORD` does not take
effect in the running Grafana until it is recreated — which is exactly why the bundled
`scripts/rotate-vm-auth.sh` runs `docker compose up -d --force-recreate sink-prometheus grafana`.
:::

If you are working from a full git checkout of the repository, the bundled helper
`scripts/rotate-vm-auth.sh` does the same thing in one step (run it from the repo root, not from
the monitoring project directory):

```bash
VM_AUTH_PASSWORD="$(openssl rand -base64 18)" ./scripts/rotate-vm-auth.sh
```

After rotating, confirm the recreated services are running:

```bash
postgresai mon health
```

`mon health` only checks that each container is running (via `docker inspect`); it does not query
Grafana or VictoriaMetrics, so it will not surface a stale credential on its own. To confirm the
new credentials actually work, open a dashboard in Grafana (it should render data, not an auth
error) or query the VictoriaMetrics API directly with the new basic-auth credentials (the bundled
stack publishes VictoriaMetrics on host port `59090`):

```bash
curl -fsS -u "${VM_AUTH_USERNAME:-vmauth}:${VM_AUTH_PASSWORD}" \
  'http://localhost:59090/api/v1/query?query=up'
```

A `200` with a JSON result confirms the new credentials are accepted; a `401` means Grafana would
also fail to authenticate.

:::note Not the same as the database role
This rotates the *VictoriaMetrics* basic-auth credentials. To rotate the *monitored database*
role's password instead, see
[Rotate monitoring database credentials](/docs/monitoring/troubleshooting/permissions#rotate-monitoring-database-credentials).
:::

## Retention

### Setting retention period

```bash
# Set in the monitoring stack .env file.
# Default is 336h (14 days); the value below overrides it to 30 days.
VM_RETENTION_PERIOD=30d

# Migrate .env, then recreate sink-prometheus so it reads the new value.
# `mon update-config` migrates .env but does NOT restart sink-prometheus,
# which only reads VM_RETENTION_PERIOD at container startup.
postgresai mon update-config
docker compose up -d --force-recreate sink-prometheus
```

| Retention | Disk usage (approx) | Use case |
|-----------|---------------------|----------|
| 7d | ~500 MiB per database | Development |
| 14d | ~1 GiB per database | Default |
| 30d | ~2 GiB per database | Production |
| 90d | ~6 GiB per database | Compliance requirements |

### Query-id mapping retention

New in 0.15. The Flask backend keeps a mapping from `queryid` to query text so dashboards can
show readable query text instead of numeric IDs. How long that mapping is retained is
controlled separately from metrics retention:

```bash
# Hours to retain the queryid -> query text mapping in the Flask backend.
# Independent of VM_RETENTION_PERIOD; for new plan-specific configuration,
# use the same window as VM_RETENTION_PERIOD expressed in hours.
QUERYID_RETENTION_HOURS=720
```

| Setting | Controls | Independent of |
|---------|----------|----------------|
| `VM_RETENTION_PERIOD` | How long time-series metrics are kept in VictoriaMetrics | — |
| `QUERYID_RETENTION_HOURS` | How long the query-id → query-text mapping is kept | `VM_RETENTION_PERIOD` |

Paired examples:

| History | `VM_RETENTION_PERIOD` | `QUERYID_RETENTION_HOURS` |
|---------|-----------------------|---------------------------|
| Short (7 days) | `168h` | `168` |
| Long (6 months) | `4380h` | `4380` |

Migrate `.env` with `postgresai mon update-config`, then recreate the services that read these
values at startup — `VM_RETENTION_PERIOD` is read by sink-prometheus and `QUERYID_RETENTION_HOURS`
by the Flask backend: `docker compose up -d --force-recreate sink-prometheus monitoring_flask_backend`
(`update-config` does not restart services). When running Compose manually, set the keys before the
initial `docker compose up -d`.

## Storage

### Disk allocation

Estimate storage needs:

```
Storage = (metrics/sec) × (bytes/metric) × (retention_seconds)
```

Typical values:
- ~100 metrics/sec per monitored database
- ~3-5 bytes/sample (VictoriaMetrics with typical monitoring data)
- 14 days = 1,209,600 seconds

Worked example: 100 × 5 × 1,209,600 ≈ 605 MB of compressed samples; allowing for indexes and
on-disk overhead this rounds to roughly **~1 GiB per database for 14-day retention**, matching
the 14d row in the [retention table](#setting-retention-period) above.

### Memory allocation

VictoriaMetrics sizes its caches from the container memory limit. In this stack the service is
named `sink-prometheus` and its limit is set with `mem_limit` (bytes), overridable via the
`SINK_PROMETHEUS_MEM` `.env` variable (default 1.5 GiB):

```bash
# .env — raise the VictoriaMetrics memory limit to 2 GiB
SINK_PROMETHEUS_MEM=2147483648
```

`SINK_PROMETHEUS_MEM` sets the Compose `mem_limit`, which only takes effect when the
container is recreated — `postgresai mon update-config` does not recreate services, so
apply it by recreating sink-prometheus: `docker compose up -d --force-recreate sink-prometheus`.
See [Resource limits (per service)](/docs/monitoring/configuration#resource-limits-per-service).

## Scrape configuration

VictoriaMetrics scrapes the collectors and self-monitoring exporters using the bundled
`config/prometheus/prometheus.yml`. The main job pulls metrics from the `pgwatch-prometheus`
collector:

```yaml
global:
  scrape_interval: 15s
  scrape_timeout: 10s

scrape_configs:
  # Main monitoring target: pgwatch metrics
  - job_name: 'pgwatch-prometheus'
    static_configs:
      - targets: ['pgwatch-prometheus:9091']
    scrape_interval: 30s
    scrape_timeout: 25s
    metrics_path: /pgwatch
    sample_limit: 10000
```

The same file also defines self-monitoring jobs (`victoriametrics`, `self-cadvisor`,
`self-node-exporter`, `self-postgres-exporter`) and a `query-info` job that scrapes the Flask
backend's `/query_info_metrics` endpoint every 5 minutes for query-text labels.

:::note Basic auth in the scrape file
The `victoriametrics` self-scrape job authenticates with `%{VM_AUTH_USERNAME}` /
`%{VM_AUTH_PASSWORD}` — VictoriaMetrics expands these percent-brace env references in the scrape
file (this is a VictoriaMetrics extension, not standard Prometheus syntax).
:::

## Query and search tuning

VictoriaMetrics query/search behavior is tuned with two `.env` variables. These map directly to
the underlying VictoriaMetrics `-search.*` flags and have the same literal defaults whether or
not you set them — leaving them unset is a no-op. Set them in the monitoring stack `.env`, then
migrate `.env` with `postgresai mon update-config` and recreate sink-prometheus so it picks up
the new flags (`update-config` does not restart sink-prometheus, which reads these only at
container startup).

| `.env` variable | Default | VictoriaMetrics flag | Purpose |
|-----------------|---------|----------------------|---------|
| `VM_QUERY_DURATION` | `30s` | `-search.maxQueryDuration` | Maximum duration of a single query before it is cancelled |
| `VM_MAX_CONCURRENT_REQUESTS` | `16` | `-search.maxConcurrentRequests` | Maximum number of concurrent search requests |

```bash
# Example overrides in .env
VM_QUERY_DURATION=30s
VM_MAX_CONCURRENT_REQUESTS=16

postgresai mon update-config
docker compose up -d --force-recreate sink-prometheus
```

:::note Canonical variable names
Earlier drafts referenced `VM_SEARCH_*` names; the shipped 0.15 variables are
`VM_QUERY_DURATION` and `VM_MAX_CONCURRENT_REQUESTS` as listed above. These match
[`.env` configuration](/docs/monitoring/configuration#cli-installation).
:::

:::note Single-node VictoriaMetrics
This stack ships a **single-node** `victoriametrics/victoria-metrics` instance (the
`sink-prometheus` service). VictoriaMetrics cluster mode, remote write, multi-tenancy, and
downsampling are upstream/Enterprise features that are **not configured by this stack** and have
no `.env` or chart knobs here. The only supported VictoriaMetrics tuning is retention
(`VM_RETENTION_PERIOD`), the search limits above (`VM_QUERY_DURATION`,
`VM_MAX_CONCURRENT_REQUESTS`), basic auth (`VM_AUTH_USERNAME` / `VM_AUTH_PASSWORD`), and the
container memory limit (`SINK_PROMETHEUS_MEM`).
:::

## Backup

VictoriaMetrics backups use its native snapshot tooling. In the Docker Compose stack the
VictoriaMetrics API is published on host port `59090` (container port 9090):

```bash
# Create a snapshot (VM basic auth required)
curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
  http://localhost:59090/snapshot/create

# Back up / restore with vmbackup / vmrestore (run against the data path)
vmbackup -snapshotName=<name> -dst=s3://bucket/path
vmrestore -src=s3://bucket/path -storageDataPath=/victoria-metrics-data
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
# Docker Compose publishes VictoriaMetrics on host port 59090 (container port 9090); VM basic auth
curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
  http://localhost:59090/api/v1/status/tsdb
```

### Debug slow queries

```bash
# Enable query logging
-search.logSlowQueryDuration=5s
```

### Common issues

| Issue | Cause | Solution |
|-------|-------|----------|
| High memory | Large / concurrent queries | Lower `VM_MAX_CONCURRENT_REQUESTS`, reduce query cardinality |
| Slow queries | High cardinality | Check cardinality, reduce label count; consider lowering `VM_QUERY_DURATION` to fail fast |
| Disk full | Retention too long | Reduce `VM_RETENTION_PERIOD` or add storage |
| No data in Grafana | Missing VM auth | Set `VM_AUTH_USERNAME` / `VM_AUTH_PASSWORD`, run `mon update-config`, then recreate sink-prometheus + Grafana (`docker compose up -d --force-recreate sink-prometheus grafana`) so both pick up the credentials |
