---
title: Docker Compose installation
sidebar_label: Docker Compose
sidebar_position: 4
---

# Docker Compose installation

For custom deployments and development environments.

## Prerequisites

- Docker 20.10+
- Docker Compose v2
- PostgreSQL 14+ target database

## Quick start

```bash
# Clone the repository
git clone https://gitlab.com/postgres-ai/postgresai.git
cd postgresai

# Configure target database
cp .env.example .env
# Edit .env with your database connection

# Start the stack
docker compose up -d
```

## Configuration

### Environment variables

Create a `.env` file or set these environment variables:

```bash
# Required
PGAI_TAG=0.15.0
REPLICATOR_PASSWORD=<generated-secret>
VM_AUTH_USERNAME=vmauth
VM_AUTH_PASSWORD=<generated-secret>

# Target databases are defined in instances.yml
# Use postgres_ai_mon by default after running prepare-db.

# Optional - Grafana admin password (REQUIRED for production!)
# Default is 'demo' - always change this in production
GF_SECURITY_ADMIN_PASSWORD=your_secure_password

# Optional - Retention
VM_RETENTION_PERIOD=336h
```

### docker-compose.yml excerpt

This excerpt omits the `config-init` and `sources-generator` helper services that
the pgwatch collectors depend on (see `depends_on` below); both are defined in the
full `docker-compose.yml` in the repository. `sources-generator` renders the pgwatch
source files from `instances.yml`.

```yaml
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "${GRAFANA_BIND_HOST:-}3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./config/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_USER=monitor
      - GF_SECURITY_ADMIN_PASSWORD=${GF_SECURITY_ADMIN_PASSWORD:-demo}

  sink-postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_HOST_AUTH_METHOD: trust

  sink-prometheus:
    image: victoriametrics/victoria-metrics:v1.140.0
    ports:
      - "${BIND_HOST:-}59090:9090"
    volumes:
      - vm-data:/victoria-metrics-data
    environment:
      - VM_AUTH_USERNAME=${VM_AUTH_USERNAME:-}
      - VM_AUTH_PASSWORD=${VM_AUTH_PASSWORD:-}
      - VM_RETENTION_PERIOD=${VM_RETENTION_PERIOD:-336h}

  pgwatch-postgres:
    image: postgresai/pgwatch:${PGAI_TAG}
    command:
      - "--sources=/postgres_ai_configs/pgwatch/sources.yml"
      - "--metrics=/postgres_ai_configs/pgwatch/metrics.yml"
      - "--sink=postgresql://pgwatch@sink-postgres:5432/measurements?sslmode=disable"
      - "--web-addr=:8080"
    depends_on:
      - sources-generator
      - sink-postgres

  pgwatch-prometheus:
    image: postgresai/pgwatch:${PGAI_TAG}
    command:
      - "--sources=/postgres_ai_configs/pgwatch-prometheus/sources.yml"
      - "--metrics=/postgres_ai_configs/pgwatch-prometheus/metrics.yml"
      - "--sink=prometheus://0.0.0.0:9091/pgwatch"
      - "--web-addr=:8089"
    depends_on:
      - sources-generator
      - sink-prometheus

  monitoring_flask_backend:
    image: postgresai/monitoring-flask-backend:${PGAI_TAG}
    ports:
      - "8000:8000"
    environment:
      - PROMETHEUS_URL=http://sink-prometheus:9090
      - POSTGRES_SINK_URL=postgresql://pgwatch@sink-postgres:5432/measurements

volumes:
  grafana-data:
  vm-data:
```

## Access Grafana

After starting the stack, open Grafana at `localhost:3000` in your browser.

Credentials:
- **Username**: `monitor`
- **Password**: Value of `GF_SECURITY_ADMIN_PASSWORD` (default: `demo`)

:::danger Change default password
The default password `demo` is for local testing only. Always set a strong `GF_SECURITY_ADMIN_PASSWORD` in your `.env` file before any production or exposed deployment.
:::

## Service details

### Grafana

Pre-configured with:
- postgres_ai dashboards (14 dashboards)
- VictoriaMetrics data source
- Anonymous access disabled

**Customization:**
```yaml
grafana:
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=your_secure_password
    - GF_AUTH_ANONYMOUS_ENABLED=false
    - GF_SERVER_ROOT_URL=https://grafana.example.com
```

### VictoriaMetrics

Single-node time-series database optimized for Prometheus metrics.

**Performance tuning:**
```yaml
sink-prometheus:
  environment:
    - VM_RETENTION_PERIOD=336h
    - VM_QUERY_DURATION=30s
    - VM_MAX_CONCURRENT_REQUESTS=16
```

### pgwatch

Metrics collectors for PostgreSQL. The 0.15 stack runs separate `postgresai/pgwatch` services for PostgreSQL and Prometheus-compatible sinks.

**Prometheus sink options:**
```yaml
pgwatch-prometheus:
  command:
    - "--sources=/postgres_ai_configs/pgwatch-prometheus/sources.yml"
    - "--metrics=/postgres_ai_configs/pgwatch-prometheus/metrics.yml"
    - "--sink=prometheus://0.0.0.0:9091/pgwatch"
    - "--web-addr=:8089"
    - "--log-level=error"
```

### Flask backend

Provides query text lookup for Grafana dashboards (joining pg_stat_statements queryid with actual SQL).

**Health check:**
```bash
curl http://localhost:8000/health
```

## Directory structure

```
postgresai/
├── docker-compose.yml
├── .env
├── config/
│   ├── grafana/
│   │   ├── provisioning/
│   │   │   ├── dashboards/
│   │   │   │   └── postgres_ai/      # Dashboard JSON files
│   │   │   └── datasources/
│   │   │       └── default.yaml      # VictoriaMetrics datasource
│   │   └── grafana.ini
│   └── prometheus/
│       └── prometheus.yml            # Scrape configuration
└── monitoring_flask_backend/
    ├── app.py
    └── Dockerfile
```

## Operations

### Start stack

```bash
docker compose up -d
```

### Stop stack

```bash
docker compose down
```

### View logs

```bash
# All services
docker compose logs -f

# Specific services
docker compose logs -f pgwatch-postgres pgwatch-prometheus
```

### Restart service

```bash
docker compose restart grafana
```

### Update images

```bash
docker compose pull
docker compose up -d
```

## Adding multiple databases

To monitor multiple PostgreSQL instances, add them to `instances.yml`; `sources-generator` renders both pgwatch source files from that list:

```yaml
- name: prod-primary
  conn_str: postgresql://postgres_ai_mon:pass@prod-db:5432/app
  preset_metrics: full
  is_enabled: true
  group: production
  custom_tags:
    env: production
    cluster: prod
    node_name: primary

- name: staging-primary
  conn_str: postgresql://postgres_ai_mon:pass@staging-db:5432/app
  preset_metrics: full
  is_enabled: true
  group: staging
  custom_tags:
    env: staging
    cluster: staging
    node_name: primary
```

Use the `cluster` and `node_name` custom tags in Grafana to switch between environments.

## Troubleshooting

### Grafana shows "No data"

1. Check pgwatch is collecting metrics:
   ```bash
   docker compose logs pgwatch-postgres pgwatch-prometheus | grep -i error
   ```

2. Verify VictoriaMetrics has data:
   ```bash
   curl 'http://localhost:59090/api/v1/query?query=pg_stat_user_tables_n_tup_ins'
   ```

3. Check Grafana datasource:
   - Go to Configuration — Data Sources
   - Test the VictoriaMetrics connection

### High memory usage

VictoriaMetrics memory is proportional to active time series. It sizes its caches
from the container memory limit, so cap memory by lowering that limit (or set
`SINK_PROMETHEUS_MEM` in `.env`) rather than overriding the service `command`:

```yaml
sink-prometheus:
  mem_limit: 1073741824  # 1 GiB (default is 1.5 GiB / SINK_PROMETHEUS_MEM)
```

### Container networking issues

If the pgwatch collectors can't reach your database, add the host mapping to both collector services:

```yaml
pgwatch-postgres:
  extra_hosts:
    - "host.docker.internal:host-gateway"  # For host machine access

pgwatch-prometheus:
  extra_hosts:
    - "host.docker.internal:host-gateway"
```

## Next steps

- [Helm Installation](/docs/monitoring/getting-started/installation-helm) - Kubernetes deployment
- [Configuration](/docs/monitoring/configuration/) - Advanced settings
- [Alerting](/docs/monitoring/configuration/alerting) - Set up alerts
