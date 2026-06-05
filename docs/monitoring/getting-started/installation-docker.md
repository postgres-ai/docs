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
- PostgreSQL 13+ (14+ recommended) target database

## Quick start

```bash
# Clone the repository
git clone https://gitlab.com/postgres-ai/postgresai.git
cd postgresai

# Configure stack secrets
cp .env.example .env
# Edit .env and set (at minimum):
#   PGAI_TAG=0.15.0          # .env.example ships 0.14.0 — bump it to this release
#   VM_AUTH_PASSWORD=...     # required (non-empty) — Grafana datasource won't provision without it
#   REPLICATOR_PASSWORD=...  # required if you keep the demo target-db/target-standby services

# Create instances.yml (the list of databases to monitor).
# This file MUST exist as a FILE before `docker compose up`: docker-compose.yml
# bind-mounts ./instances.yml, so if it is missing Docker creates a *directory*
# of that name and sources-generator produces zero targets.
cp instances.demo.yml instances.yml
# Edit instances.yml: set is_enabled: true and a real conn_str for each target
# (the connection string lives here, NOT in .env).

# Render the pgwatch source files from instances.yml
docker compose run --rm sources-generator

# Start the stack
docker compose up -d
```

:::tip Prefer the CLI
`postgresai mon local-install` automates the steps above (copies the demo files, prompts for a
target, generates sources, and starts the stack). Use the manual flow here only for custom
deployments.
:::

## Configuration

### Environment variables

Create a `.env` file or set these environment variables:

```bash
# Required
PGAI_TAG=0.15.0
REPLICATOR_PASSWORD=<generated-secret>

# Required in 0.15: VictoriaMetrics basic auth. VM_AUTH_PASSWORD must be non-empty.
# Grafana datasource provisioning depends on these — without them, dashboards show no data.
# See: Authentication and security in the Prometheus/VictoriaMetrics config guide.
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
    image: grafana/grafana:12.3.2
    container_name: grafana-with-datasources
    ports:
      - "${GRAFANA_BIND_HOST:-}3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - postgres_ai_configs:/postgres_ai_configs:ro
    environment:
      GF_SECURITY_ADMIN_USER: monitor
      GF_SECURITY_ADMIN_PASSWORD: ${GF_SECURITY_ADMIN_PASSWORD:-demo}
      GF_PATHS_PROVISIONING: /postgres_ai_configs/grafana/provisioning
      GF_PATHS_CONFIG: /postgres_ai_configs/grafana/provisioning/grafana.ini
      VM_AUTH_USERNAME: ${VM_AUTH_USERNAME:?VM_AUTH_USERNAME is required for Grafana datasource provisioning}
      VM_AUTH_PASSWORD: ${VM_AUTH_PASSWORD:?VM_AUTH_PASSWORD is required for Grafana datasource provisioning}
    restart: unless-stopped

  sink-postgres:
    image: postgres:17
    container_name: sink-postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_HOST_AUTH_METHOD: trust

  sink-prometheus:
    image: victoriametrics/victoria-metrics:v1.140.0
    container_name: sink-prometheus
    ports:
      - "${BIND_HOST:-}59090:9090"
    volumes:
      - victoria_metrics_data:/victoria-metrics-data
    environment:
      - VM_AUTH_USERNAME=${VM_AUTH_USERNAME:-}
      - VM_AUTH_PASSWORD=${VM_AUTH_PASSWORD:-}
      - VM_RETENTION_PERIOD=${VM_RETENTION_PERIOD:-336h}

  pgwatch-postgres:
    image: postgresai/pgwatch:${PGAI_TAG}
    container_name: pgwatch-postgres
    command:
      - "--sources=/postgres_ai_configs/pgwatch/sources.yml"
      - "--metrics=/postgres_ai_configs/pgwatch/metrics.yml"
      - "--sink=postgresql://pgwatch@sink-postgres:5432/measurements?sslmode=disable"
      - "--web-addr=:8080"
      - "--log-level=error"
    depends_on:
      - sources-generator
      - sink-postgres

  pgwatch-prometheus:
    image: postgresai/pgwatch:${PGAI_TAG}
    container_name: pgwatch-prometheus
    command:
      - "--sources=/postgres_ai_configs/pgwatch-prometheus/sources.yml"
      - "--metrics=/postgres_ai_configs/pgwatch-prometheus/metrics.yml"
      - "--sink=prometheus://0.0.0.0:9091/pgwatch"
      - "--web-addr=:8089"
      - "--log-level=error"
    depends_on:
      - sources-generator
      - sink-prometheus

  # Flask backend is internal-only (no published host port); other services
  # reach it over the Docker network.
  monitoring_flask_backend:
    image: postgresai/monitoring-flask-backend:${PGAI_TAG}
    container_name: flask-pgss-api
    environment:
      - PROMETHEUS_URL=http://sink-prometheus:9090
      - POSTGRES_SINK_URL=postgresql://pgwatch@sink-postgres:5432/measurements
      - QUERYID_RETENTION_HOURS=${QUERYID_RETENTION_HOURS:-720}

volumes:
  grafana_data:
  victoria_metrics_data:
```

## Image tags and supply chain

All stack images are **version-pinned** in 0.15 — none use `:latest`. PostgresAI images
(`pgwatch`, `monitoring-flask-backend`, `reporter`, configs) are pinned to `PGAI_TAG`, and the
third-party images are pinned to specific releases (for example `grafana/grafana:12.3.2`,
`victoriametrics/victoria-metrics:v1.140.0`, `postgres:17`). Pinning makes deployments
reproducible and auditable and avoids silent, unreviewed upgrades — set `PGAI_TAG=0.15.0` to
deploy this release.

## Reliability and restart behavior

Critical services ship with `restart: unless-stopped` so the monitoring stack comes back
automatically after a Docker daemon restart or host reboot — no manual systemd unit is needed.
The excerpt above shows the `restart:` key on the Grafana service; the full
`docker-compose.yml` sets it on the other long-running services as well.

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
The backend listens on port 8000 inside the Docker network and is **not published to the host**, so
reach its health endpoint from within the network:

**Health check:**

The backend image is `python:3.11-slim` and does not include `curl`, so hit the endpoint with the
Python interpreter that ships in the image:

```bash
docker compose exec monitoring_flask_backend \
  python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"
```

## Directory structure

```
postgresai/
├── docker-compose.yml
├── .env
├── instances.yml                         # Databases to monitor
├── config/
│   ├── grafana/
│   │   ├── dashboards/                    # Dashboard JSON files (14 dashboards + self-monitoring)
│   │   └── provisioning/
│   │       ├── dashboards/
│   │       │   └── dashboards.yml         # Dashboard provider
│   │       ├── datasources/
│   │       │   └── datasources.yml        # PGWatch-PostgreSQL / PGWatch-Prometheus / Infinity datasources
│   │       └── grafana.ini
│   └── prometheus/
│       └── prometheus.yml                 # Scrape configuration
└── monitoring_flask_backend/
    ├── app.py
    └── Dockerfile
```

At runtime these configs are copied into the `postgres_ai_configs` Docker volume by the
`config-init` service and mounted into the containers at `/postgres_ai_configs` (Grafana reads
its provisioning from `GF_PATHS_PROVISIONING=/postgres_ai_configs/grafana/provisioning`).

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

After editing `instances.yml`, re-render both `sources.yml` files and restart the collectors so
they reload the new list (the running pgwatch collectors read `sources.yml` only at startup):

```bash
docker compose run --rm sources-generator                 # re-render pgwatch/*/sources.yml
docker compose restart pgwatch-postgres pgwatch-prometheus  # reload the regenerated sources
```

Use the `cluster` and `node_name` custom tags in Grafana to switch between environments.

## Troubleshooting

### Grafana shows "No data"

1. Check pgwatch is collecting metrics:
   ```bash
   docker compose logs pgwatch-postgres pgwatch-prometheus | grep -i error
   ```

2. Verify VictoriaMetrics has data (host port `59090`, VM basic auth; all pgwatch series are
   `pgwatch_`-prefixed):
   ```bash
   curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
     'http://localhost:59090/api/v1/query?query=pgwatch_pg_stat_all_tables_n_tup_ins'
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
