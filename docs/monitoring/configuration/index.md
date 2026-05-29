---
title: Configuration
sidebar_label: Overview
sidebar_position: 1
---

# Configuration

Configuration guides for customizing PostgresAI monitoring components.

## Components

| Component | Purpose | Configuration scope |
|-----------|---------|---------------------|
| pgwatch | Metrics collection | Collection intervals, custom metrics |
| VictoriaMetrics | Time-series storage | Retention, storage, scrape settings |
| Grafana | Visualization | Dashboards, data sources, authentication |
| Alerting | Notifications | Alert rules, notification channels |

## Configuration methods

### CLI installation

Configuration is stored in the monitoring directory `.env` file and can be applied with `update-config`:

```bash
# Example .env overrides (default VM_RETENTION_PERIOD is 336h ≡ 14 days)
VM_RETENTION_PERIOD=30d
VM_QUERY_DURATION=30s
VM_MAX_CONCURRENT_REQUESTS=16

postgresai mon update-config
```

### Docker Compose

Configuration is passed through `docker-compose.yml` and the generated `.env` file:

```bash
# Example overrides (default VM_RETENTION_PERIOD is 336h ≡ 14 days)
VM_RETENTION_PERIOD=30d
VM_QUERY_DURATION=30s
VM_MAX_CONCURRENT_REQUESTS=16
```

### Helm

Configuration via `values.yaml`:

```yaml
monitoring:
  retention: 30d
  scrapeInterval: 15s
```

## Quick reference

| Setting | Default | Description |
|---------|---------|-------------|
| Scrape interval | 15s | How often to collect metrics |
| Retention | 14 days (`336h`) | How long to keep metrics |
| Max connections | 3 | Connections per monitored database |

## Sections

- [pgwatch configuration](/docs/monitoring/configuration/pgwatch-config) — Metrics collector settings
- [Prometheus/VictoriaMetrics](/docs/monitoring/configuration/prometheus-config) — Time-series storage
- [Grafana configuration](/docs/monitoring/configuration/grafana-config) — Dashboard customization
- [Alerting](/docs/monitoring/configuration/alerting) — Alert rules and notifications
