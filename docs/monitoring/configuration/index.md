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

Configuration is stored in the monitoring directory `.env` file. `update-config` migrates `.env`
and regenerates the pgwatch `sources.yml`, but it does **not** restart services — keys read by a
service at container startup (e.g. the `VM_*` flags below, consumed by sink-prometheus) only take
effect once that service is recreated:

```bash
# Example .env overrides (default VM_RETENTION_PERIOD is 336h ≡ 14 days)
VM_RETENTION_PERIOD=30d
VM_QUERY_DURATION=30s
VM_MAX_CONCURRENT_REQUESTS=16

postgresai mon update-config
# These VM_* values are read by sink-prometheus at startup; recreate it to apply:
docker compose up -d --force-recreate sink-prometheus
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

Configuration via `values.yaml` (see [Helm installation](/docs/monitoring/getting-started/installation-helm)):

```yaml
victoriaMetrics:
  retentionPeriod: 336h   # default; 14 days
  scrapeInterval: 15s
```

## Quick reference

| Setting | Default | Description |
|---------|---------|-------------|
| Scrape interval | 15s | How often to collect metrics (`victoriaMetrics.scrapeInterval`) |
| Retention | 14 days (`336h`) | How long to keep metrics (`VM_RETENTION_PERIOD` / `victoriaMetrics.retentionPeriod`) |
| Query-id mapping retention | 720 hours (30 days) | How long the Flask backend keeps the queryid → query-text mapping (`QUERYID_RETENTION_HOURS`, a bare integer number of hours — no `h` suffix) |

## Resource limits (per service)

New in 0.15, each monitoring-stack service has optional CPU and memory limits exposed as `.env`
variables. All of them are **optional** — leaving them unset preserves the default
laptop/dev sizing and produces no behavior change. Memory limits are in **bytes** (Docker
Compose `mem_limit` convention); `*_CPUS` values are floats (Docker Compose `cpus:` semantics).
Provisioning playbooks can export production-grade values per VM size class without forking the
compose file.

| Service | CPU variable | Memory variable | Default memory |
|---------|--------------|-----------------|----------------|
| Demo target database | `TARGET_DB_CPUS` (0.2) | `TARGET_DB_MEM` | 768 MiB |
| Demo target standby | `TARGET_STANDBY_CPUS` (0.2) | `TARGET_STANDBY_MEM` | 768 MiB |
| Postgres sink | `SINK_POSTGRES_CPUS` (0.4) | `SINK_POSTGRES_MEM` | 1 GiB |
| VictoriaMetrics sink | `SINK_PROMETHEUS_CPUS` (0.75) | `SINK_PROMETHEUS_MEM` | 1.5 GiB |
| pgwatch (Postgres sink) | `PGWATCH_POSTGRES_CPUS` (0.35) | `PGWATCH_POSTGRES_MEM` | 512 MiB |
| pgwatch (Prometheus sink) | `PGWATCH_PROMETHEUS_CPUS` (0.5) | `PGWATCH_PROMETHEUS_MEM` | 512 MiB |
| Grafana | `GRAFANA_CPUS` (0.5) | `GRAFANA_MEM` | 512 MiB |
| Flask backend | `FLASK_CPUS` (0.5) | `FLASK_MEM` | 1 GiB |
| Reporter | `POSTGRES_REPORTS_CPUS` (1.0) | `POSTGRES_REPORTS_MEM` | 1.75 GiB |
| cAdvisor (self-monitoring) | `CADVISOR_CPUS` (0.25) | `CADVISOR_MEM` | 384 MiB |
| node exporter (self-monitoring) | `NODE_EXPORTER_CPUS` (0.05) | `NODE_EXPORTER_MEM` | 96 MiB |
| postgres exporter (self-monitoring) | `POSTGRES_EXPORTER_CPUS` (0.1) | `POSTGRES_EXPORTER_MEM` | 128 MiB |

Set the values in the monitoring stack `.env`. These are Compose `cpus:` / `mem_limit:` keys that
only take effect when a container is recreated, so after migrating `.env` with
`postgresai mon update-config` recreate the affected services with
`docker compose up -d --force-recreate <service>` (or set the values before the initial
`docker compose up -d` for manual installs); `update-config` does not recreate services. The
VictoriaMetrics engine tuning flags
(`VM_QUERY_DURATION`, `VM_MAX_CONCURRENT_REQUESTS`) are documented under
[Query and search tuning](/docs/monitoring/configuration/prometheus-config#query-and-search-tuning).

## Config seeding and operator edits

The stack seeds its generated configuration once and guards it with a **version marker**, so
operator edits to provisioned config persist across restarts and are not silently overwritten.
The reseed is performed by the `config-init` service: on start it compares the image's `/VERSION`
against the `.pgai-configs-version` marker in the config volume, and reseeds only when they
differ. A reseed therefore happens when you **recreate** the stack on a newer image — i.e. on
`docker compose up -d` after the image tag (and thus the image version) is bumped, since `up -d`
recreates `config-init` from the new image and it then sees the version mismatch. (`postgresai mon
start` runs `docker compose up -d` **only when the stack is stopped** — on an already-running stack
it reports `Monitoring services are already running` and exits without recreating anything — so for
an in-place upgrade of a running stack, run `docker compose up -d` directly to recreate `config-init`,
not `mon start`.) `postgresai mon restart` does **not** trigger a reseed: it runs
`docker compose restart`, which restarts the existing `config-init` container in place on the
**old** image, so it still reads the old `/VERSION`, the marker still matches, and nothing is
re-copied. Note that `postgresai mon update-config` does **not** reseed the volume either: it
migrates the `.env` file (additive required keys), refreshes the CLI-owned `docker-compose.yml`
to match the stack version for non-git/global installs (a no-op for git checkouts; it touches
only the compose file, never `.env`/`instances.yml`/`.pgwatch-config`), and regenerates the
pgwatch sources (`docker compose run --rm sources-generator`). It does not restart Grafana or
sink-prometheus. To force a fresh reseed, remove the version marker from the config volume so
`config-init` re-copies the image defaults on the next start.

The `config-init` service is the only one that mounts the volume read-write (at `/target`); every
long-running service mounts it read-only (`/postgres_ai_configs:ro`), so you cannot delete the
marker from, say, the Grafana container. The service is also a one-shot init container that exits
immediately, so plain `docker exec config-init …` fails (the container name is
`postgres-ai-config-init` and it is not running). Instead, run a throwaway `config-init` with its
entrypoint overridden to `rm` (its normal entrypoint is the seeder script, which ignores extra
arguments), then restart:

```bash
docker compose run --rm --entrypoint rm config-init /target/.pgai-configs-version
docker compose up -d --force-recreate config-init
```

`docker compose up -d --force-recreate config-init` recreates the one-shot `config-init` container;
with the marker now absent, `init-configs.sh` reseeds unconditionally. (A plain `docker compose up -d`
also works — it recreates `config-init` because nothing else depends on the cleared marker — but the
explicit `--force-recreate config-init` makes the intent unambiguous.) Do **not** use `postgresai mon
start` here: on an already-running stack `mon start` only checks whether the containers are up and, if
they are, prints `Monitoring services are already running` and exits **without** running `docker compose
up -d`, so `config-init` is never recreated and the reseed silently does not happen. Likewise
`postgresai mon restart` only restarts the existing containers in place and would not re-run the seeder
against the cleared volume. Recreating `config-init` on a live stack must therefore go through
`docker compose up -d` directly.

## Sections

- [pgwatch configuration](/docs/monitoring/configuration/pgwatch-config) — Metrics collector settings
- [Prometheus/VictoriaMetrics](/docs/monitoring/configuration/prometheus-config) — Time-series storage
- [Grafana configuration](/docs/monitoring/configuration/grafana-config) — Dashboard customization
- [Alerting](/docs/monitoring/configuration/alerting) — Alert rules and notifications
