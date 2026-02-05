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
TARGET_DB_HOST=your-postgres-host
TARGET_DB_PORT=5432
TARGET_DB_NAME=your_database
TARGET_DB_USER=pgwatch
TARGET_DB_PASSWORD=your_password

# Optional - Cluster identification
CLUSTER_NAME=production
NODE_NAME=primary

# Optional - Grafana admin password (REQUIRED for production!)
# Default is 'demo' - always change this in production
GF_SECURITY_ADMIN_PASSWORD=your_secure_password

# Optional - Retention
VM_RETENTION_PERIOD=90d
```

### docker-compose.yml Overview

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

  victoriametrics:
    image: victoriametrics/victoria-metrics:latest
    ports:
      - "${VICTORIAMETRICS_PORT:-8428}:8428"
    volumes:
      - vm-data:/victoria-metrics-data
    command:
      - "-retentionPeriod=${VM_RETENTION_PERIOD:-90d}"

  pgwatch:
    image: cybertec/pgwatch:latest
    environment:
      - PW_SOURCES=postgresql://${TARGET_DB_USER}:${TARGET_DB_PASSWORD}@${TARGET_DB_HOST}:${TARGET_DB_PORT}/${TARGET_DB_NAME}
    depends_on:
      - victoriametrics

  monitoring_flask_backend:
    build: ./monitoring_flask_backend
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_URI=postgresql://${TARGET_DB_USER}:${TARGET_DB_PASSWORD}@${TARGET_DB_HOST}:${TARGET_DB_PORT}/${TARGET_DB_NAME}

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
victoriametrics:
  command:
    - "-retentionPeriod=90d"
    - "-memory.allowedPercent=60"
    - "-search.maxConcurrentRequests=16"
```

### pgwatch

Metrics collector for PostgreSQL. Scrapes your database every 60 seconds by default.

**Custom metrics interval:**
```yaml
pgwatch:
  environment:
    - PW_INTERNAL_STATS_PORT=8081
    - PW_MIN_DB_SIZE_MB=0
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

# Specific service
docker compose logs -f pgwatch
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

To monitor multiple PostgreSQL instances, add additional pgwatch services:

```yaml
services:
  pgwatch-prod:
    image: cybertec/pgwatch:latest
    environment:
      - PW_SOURCES=postgresql://postgres_ai_mon:pass@prod-db:5432/app
      - PW_SOURCE_NAME=prod-primary

  pgwatch-staging:
    image: cybertec/pgwatch:latest
    environment:
      - PW_SOURCES=postgresql://postgres_ai_mon:pass@staging-db:5432/app
      - PW_SOURCE_NAME=staging-primary
```

Use the `cluster_name` variable in Grafana to switch between environments.

## Troubleshooting

### Grafana shows "No data"

1. Check pgwatch is collecting metrics:
   ```bash
   docker compose logs pgwatch | grep -i error
   ```

2. Verify VictoriaMetrics has data:
   ```bash
   curl 'http://localhost:8428/api/v1/query?query=pg_stat_user_tables_n_tup_ins'
   ```

3. Check Grafana datasource:
   - Go to Configuration — Data Sources
   - Test the VictoriaMetrics connection

### High memory usage

VictoriaMetrics memory is proportional to active time series:

```yaml
victoriametrics:
  command:
    - "-memory.allowedPercent=40"  # Reduce from default 60%
```

### Container networking issues

If pgwatch can't reach your database:

```yaml
pgwatch:
  extra_hosts:
    - "host.docker.internal:host-gateway"  # For host machine access
```

## Next steps

- [Helm Installation](/docs/monitoring/getting-started/installation-helm) - Kubernetes deployment
- [Configuration](/docs/monitoring/configuration/) - Advanced settings
- [Alerting](/docs/monitoring/configuration/alerting) - Set up alerts
