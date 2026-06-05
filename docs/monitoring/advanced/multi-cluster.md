---
title: Multi-cluster monitoring
sidebar_label: Multi-cluster
sidebar_position: 2
---

# Multi-cluster monitoring

Centralized monitoring for multiple PostgreSQL clusters from a single Grafana instance.

## Architecture

The stack runs one pair of pgwatch collectors (`pgwatch-postgres` and `pgwatch-prometheus`) that
read a list of monitored databases from a generated `sources.yml`, write metrics to
VictoriaMetrics (the `sink-prometheus` service, internal port `9090`, host port `59090`), and
expose them in Grafana.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Cluster A  │     │  Cluster B  │     │  Cluster C  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                ┌──────────▼───────────┐
                │ pgwatch-prometheus   │  (reads sources.yml,
                │ pgwatch-postgres     │   generated from instances.yml)
                └──────────┬───────────┘
                           │  prometheus sink :9091/pgwatch
                ┌──────────▼───────────┐
                │ VictoriaMetrics      │  sink-prometheus :9090 (host 59090)
                └──────────┬───────────┘
                           │
                    ┌──────▼──────┐
                    │   Grafana   │  :3000
                    └─────────────┘
```

## Configuration

Monitored databases are defined in `instances.yml` (a YAML list). The
`config/scripts/generate-pgwatch-sources.sh` script renders this at runtime into the two
`sources.yml` files that pgwatch reads — `pgwatch/sources.yml` and `pgwatch-prometheus/sources.yml`
under the `/postgres_ai_configs` volume (i.e. `/postgres_ai_configs/pgwatch/sources.yml` and
`/postgres_ai_configs/pgwatch-prometheus/sources.yml`). These generated files are **not** committed
to the repository. There is **no** `PW_TARGETS` (or any `PW_*`) environment variable.

### Adding clusters

**CLI approach (recommended):**

```bash
# Add a target. The second positional argument is the instance name (optional).
postgresai mon targets add postgresql://user:pass@prod-us:5432/postgres production-us
postgresai mon targets add postgresql://user:pass@prod-eu:5432/postgres production-eu
```

`mon targets add` takes `[connStr]` and an optional positional `[name]` — there is no
`--cluster-name` flag. The connection string is parsed for user/password/host/port/database only;
cluster identity is **not** read from a `?cluster_name=...` query parameter. After adding a target,
the CLI regenerates `sources.yml` and applies it.

**instances.yml approach:**

Each entry is a YAML object. Cluster identity is set through the `cluster` key under
`custom_tags:` (the default is `cluster: local` in demo mode, `cluster: default` for
CLI-added targets):

```yaml
- name: production-us
  conn_str: postgresql://user:pass@prod-us:5432/postgres
  preset_metrics: full
  custom_metrics:
  is_enabled: true
  group: default
  custom_tags:
    env: production
    cluster: production-us       # <-- this becomes the `cluster` metric label
    node_name: prod-us-primary

- name: production-eu
  conn_str: postgresql://user:pass@prod-eu:5432/postgres
  preset_metrics: full
  custom_metrics:
  is_enabled: true
  group: default
  custom_tags:
    env: production
    cluster: production-eu
    node_name: prod-eu-primary
```

When you edit `instances.yml` by hand, the change does not take effect until you re-render the
generated `sources.yml` files and restart the collectors so they reload them:

```bash
postgresai mon update-config                 # runs sources-generator to re-render sources.yml
postgresai mon restart pgwatch-postgres
postgresai mon restart pgwatch-prometheus
```

`mon update-config` only re-renders the files (it does **not** restart the collectors), and
`mon restart` only restarts the collectors (it does **not** re-render the files) — you need both.
(The CLI `mon targets add` / `mon targets remove` path does this for you automatically: it
re-renders the sources and recreates the collectors.)

:::tip Security
Keep credentials in `instances.yml` out of version control. The stack's `.env` file holds stack
secrets (such as `REPLICATOR_PASSWORD` and `VM_AUTH_USERNAME` / `VM_AUTH_PASSWORD`), not the
monitored-database role passwords.
:::

### Cluster naming conventions

Use consistent, descriptive values for the `cluster` custom tag:

| Pattern | Example | Use case |
|---------|---------|----------|
| env-region | production-us-east | Multi-region |
| app-env | orders-prod | Per-application |
| team-purpose | platform-analytics | Per-team |

## Label strategy

### Required labels

Every metric carries (via pgwatch and `custom_tags`):

| Label | Purpose | Example |
|-------|---------|---------|
| `cluster` | Primary cluster identifier (from `custom_tags.cluster`) | `production-us` |
| `node_name` | Primary/replica distinction (from `custom_tags.node_name`) | `prod-us-primary` |
| `datname` | Database name | `orders` |

Note: the metric **label** is `cluster`. `cluster_name` is only the name of the Grafana template
variable; dashboard filters select with `cluster="$cluster_name"`.

### Extra labels

Add any extra labels per instance via additional keys under `custom_tags:` (for example `env`,
`region`, or `team`). There is no `external_labels:` configuration key in this stack.

```yaml
custom_tags:
  cluster: production-us
  node_name: prod-us-primary
  region: us-east-1
  env: production
  team: platform
```

## Dashboard configuration

### Cluster selector variable

Dashboards include a `cluster_name` template variable populated from the `cluster` label:

```text
# Grafana template variable
name: cluster_name
query: label_values(pgwatch_db_size_size_b, cluster)
```

### Cross-cluster queries

**Compare TPS across clusters** (the metric is `pgwatch_db_stats_xact_commit`; there is no
`_total`-suffixed pg_stat_database series):

```promql
sum by (cluster) (
  rate(pgwatch_db_stats_xact_commit[5m])
)
```

**Connection saturation per cluster** (current backends come from
`pgwatch_db_stats_numbackends`; `max_connections` from the `settings` metric as
`pgwatch_settings_numeric_value{setting_name="max_connections"}` — there is no
`pgwatch_settings_max_connections` series):

```promql
max by (cluster) (
  sum by (cluster) (pgwatch_db_stats_numbackends)
  /
  scalar(max(pgwatch_settings_numeric_value{setting_name="max_connections"}))
) > 0.8
```

## Scaling considerations

### Metrics volume

| Clusters | Estimated metrics/sec | VictoriaMetrics RAM |
|----------|----------------------|---------------------|
| 1-5 | 100-500 | 2 GiB |
| 5-20 | 500-2000 | 4 GiB |
| 20-50 | 2000-5000 | 8 GiB |
| 50+ | 5000+ | 16 GiB+ |

### Storage planning

```
Storage per cluster = (metrics/sec) × ~4 bytes × retention_seconds   # VictoriaMetrics, compressed

Example: 10 clusters, 30-day retention
= 10 × 100 × 4 × 30 × 86400
= 10,368,000,000 bytes
≈ 10 GiB
```

Retention is controlled by `VM_RETENTION_PERIOD` (default `336h` = 14 days).

## Troubleshooting

### Cluster not appearing

1. Check pgwatch logs for connection errors:
   ```bash
   docker compose logs pgwatch-postgres pgwatch-prometheus
   ```
2. Verify the `cluster` custom tag is set for the target in `instances.yml`.
3. Check VictoriaMetrics is receiving data (host port `59090`, VM basic auth required):
   ```bash
   curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
     'http://localhost:59090/api/v1/query?query=pgwatch_db_size_size_b{cluster="missing-cluster"}'
   ```

### Mixed-up metrics

Symptoms: metrics from one cluster appearing under another.

Cause: duplicate `cluster` custom-tag values across targets.

Solution: ensure a unique `cluster` value per target in `instances.yml`, then regenerate sources
with `postgresai mon update-config` (which runs `sources-generator` to re-render `sources.yml`) and
restart the collectors so they reload the file: `postgresai mon restart pgwatch-postgres` and
`postgresai mon restart pgwatch-prometheus`. (`mon restart` alone only runs `docker compose restart`
and does **not** re-render `sources.yml`; `update-config` re-renders the file but does **not**
restart the collectors — you need both.)
