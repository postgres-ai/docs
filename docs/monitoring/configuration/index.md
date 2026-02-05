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

Configuration via environment variables and command-line flags:

```bash
postgresai mon local-install \
  --retention 30d \
  --scrape-interval 15s \
  postgresql://user@host:5432/db
```

### Docker Compose

Configuration via `docker-compose.yml` and environment files:

```yaml
services:
  pgwatch:
    environment:
      PW_SCRAPE_INTERVAL: 15s
      PW_RETENTION: 720h
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
| Retention | 14d | How long to keep metrics |
| Max connections | 3 | Connections per monitored database |

## Sections

- [pgwatch configuration](/docs/monitoring/configuration/pgwatch-config) — Metrics collector settings
- [Prometheus/VictoriaMetrics](/docs/monitoring/configuration/prometheus-config) — Time-series storage
- [Grafana configuration](/docs/monitoring/configuration/grafana-config) — Dashboard customization
- [Alerting](/docs/monitoring/configuration/alerting) — Alert rules and notifications
