---
title: pgwatch configuration
sidebar_label: pgwatch
sidebar_position: 2
---

# pgwatch configuration

Configuration options for the pgwatch metrics collectors.

The 0.15 stack runs **two** pgwatch v3 collectors — one writing to the PostgreSQL sink
(`pgwatch-postgres`) and one writing to the Prometheus/VictoriaMetrics sink
(`pgwatch-prometheus`). Both are configured the same way: from generated `sources.yml` and
`metrics.yml` files, plus a small set of command-line flags. There are **no `PW_*` environment
variables** in this stack — collection is driven by file-based config, not env vars.

## What you edit vs. what is generated

| File | Edited by you? | Purpose |
|------|----------------|---------|
| `instances.yml` | **Yes** | The list of databases to monitor (connection, preset, tags) |
| `sources.yml` (runtime volume) | No (generated) | Rendered from `instances.yml` by `sources-generator` into the `postgres_ai_configs` volume |
| `metrics.yml` (runtime volume) | Rarely | Metric/SQL definitions and the `full` preset |

Nothing named `sources.yml` is committed under `config/`. The `sources-generator` service renders
two copies into the `postgres_ai_configs` volume, one per sink:

- `/postgres_ai_configs/pgwatch/sources.yml` — for the PostgreSQL-sink collector (note the
  directory is `pgwatch/`, **not** `pgwatch-postgres/`)
- `/postgres_ai_configs/pgwatch-prometheus/sources.yml` — for the Prometheus-sink collector

After editing `instances.yml`, re-render `sources.yml` and restart the collectors so they reload
it. `mon update-config` re-renders the file but does **not** restart the collectors, so restart
each one afterward:

```bash
postgresai mon update-config
postgresai mon restart pgwatch-postgres
postgresai mon restart pgwatch-prometheus
```

When running Docker Compose manually, the `sources-generator` service re-renders both
`sources.yml` files from `instances.yml` on `docker compose up`.

## Defining databases (instances.yml)

Each entry in `instances.yml` is one monitored database:

```yaml
- name: prod-primary
  conn_str: postgresql://postgres_ai_mon:pass@prod-db:5432/app
  preset_metrics: full
  custom_metrics:
  is_enabled: true
  group: production
  custom_tags:
    env: production
    cluster: prod
    node_name: primary
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique name for the source |
| `conn_str` | Yes | PostgreSQL connection string for the monitoring role |
| `preset_metrics` | Yes | Metrics preset to collect (the stack ships the `full` preset) |
| `custom_metrics` | No | Map of additional metric definitions (leave empty to use only the preset) |
| `is_enabled` | Yes | Whether this source is collected |
| `group` | No | Logical group label |
| `custom_tags` | No | Extra labels (e.g. `env`, `cluster`, `node_name`) used as Grafana variables |

Use the `cluster` and `node_name` custom tags to switch between environments in Grafana.

## Metric presets

The collectors apply a metrics preset named in `preset_metrics`. The stack ships a **`full`**
preset, but note that the two collectors use **different** `metrics.yml` files with
**different** `full` presets — they are not the same metric set:

- `config/pgwatch-prometheus/metrics.yml` (the Prometheus/VictoriaMetrics collector, which feeds
  the Grafana dashboards) defines a `full` preset of 49 metric groups, described as
  *"almost all available metrics for a even deeper performance understanding"*. It includes groups
  like `bgwriter`, `checkpointer`, `db_size`, `db_stats`, `table_stats`, `pg_stat_statements`,
  `wait_events`, and `pg_stat_activity` (it does **not** contain `pgss_queryid_queries` or
  `index_definitions`):

  ```yaml
  presets:
    full:
      description: almost all available metrics for a even deeper performance understanding
      metrics:
        bgwriter: 30
        db_stats: 30
        table_stats: 30
        pg_stat_statements: 30
        wait_events: 15
        pg_stat_activity: 15
        # ... 49 groups total
  ```

- `config/pgwatch-postgres/metrics.yml` (the Postgres-sink collector) defines its own, much
  smaller `full` preset, described as *"Full metrics for PostgreSQL storage"*, containing only two
  groups:

  ```yaml
  presets:
    full:
      description: "Full metrics for PostgreSQL storage"
      metrics:
        pgss_queryid_queries: 30
        index_definitions: 3600
  ```

The preset maps each metric group to its collection interval (in seconds). To change which metrics
are collected or how often, edit the relevant `metrics.yml` definitions (advanced) or add entries
under `custom_metrics` for a specific database in `instances.yml`.

## Collector command-line flags

Both collectors are started with the same flag shape (see `docker-compose.yml`); the
Prometheus-sink collector differs only in its sources/metrics paths, sink URL, and web address:

```yaml
pgwatch-prometheus:
  command:
    - "--sources=/postgres_ai_configs/pgwatch-prometheus/sources.yml"
    - "--metrics=/postgres_ai_configs/pgwatch-prometheus/metrics.yml"
    - "--sink=prometheus://0.0.0.0:9091/pgwatch"
    - "--web-addr=:8089"
    - "--log-level=error"
```

| Flag | Purpose |
|------|---------|
| `--sources` | Path to the generated `sources.yml` |
| `--metrics` | Path to the `metrics.yml` definitions |
| `--sink` | Where collected metrics are written (Postgres or Prometheus sink) |
| `--web-addr` | Address for the collector's built-in web/health endpoint |
| `--log-level` | Log verbosity (`error` by default; also `info`, `warn`, `debug`) |

On Helm, the equivalent log level is set with `pgwatchPostgres.logLevel` /
`pgwatchPrometheus.logLevel` (default `error`).

## Resource limits

Collector CPU and memory limits are exposed as optional `.env` variables (Docker Compose
`mem_limit` is in bytes, `cpus:` is a float). Defaults preserve laptop/dev sizing:

```bash
# pgwatch (Postgres sink) — defaults: 0.35 CPU, 512 MiB
PGWATCH_POSTGRES_CPUS=0.35
PGWATCH_POSTGRES_MEM=536870912

# pgwatch (Prometheus sink) — defaults: 0.5 CPU, 512 MiB
PGWATCH_PROMETHEUS_CPUS=0.5
PGWATCH_PROMETHEUS_MEM=536870912
```

See [Resource limits (per service)](/docs/monitoring/configuration#resource-limits-per-service)
for the full table. On Helm, set `pgwatchPostgres.resources` / `pgwatchPrometheus.resources`.

## Troubleshooting

### Check the collector logs

```bash
docker compose logs pgwatch-postgres pgwatch-prometheus | grep -i error
```

### Common issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No metrics | Connection failed | Check the `conn_str` credentials and network reachability |
| Missing pg_stat_statements | Extension not loaded | Add `pg_stat_statements` to `shared_preload_libraries` and restart |
| High CPU on target | Expensive queries | Reduce the number of monitored databases or raise preset intervals |
| Source not collected | `is_enabled: false` | Set `is_enabled: true` in `instances.yml`, run `mon update-config` to re-render `sources.yml`, then restart the collectors so they reload it: `mon restart pgwatch-postgres` and `mon restart pgwatch-prometheus` |
