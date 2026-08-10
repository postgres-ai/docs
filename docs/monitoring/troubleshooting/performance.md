---
title: Performance tuning
sidebar_label: Performance
sidebar_position: 4
---

# Performance tuning

Optimizing PostgresAI monitoring for better performance and lower resource usage.

## Diagnosing performance issues

### Symptoms

| Symptom | Likely cause |
|---------|--------------|
| Slow dashboard loading | Complex queries, many time series |
| High CPU on target database | Expensive collection queries |
| VictoriaMetrics using high memory | Large cardinality, long retention |
| Grafana timeouts | Query timeout too short |

### Quick diagnostics

```bash
# Check resource usage
docker stats

# Check query times in Grafana
# Dashboard → Panel → Query Inspector → Stats
```

## Target database impact

### Reducing collection overhead

There are no `PW_*` environment variables in this stack. Collection is controlled per metric group
in the pgwatch `metrics.yml` files, and the set of metrics is fixed by the `full` preset that the
generated `sources.yml` uses.

**1. Increase a metric group's collection interval:**

Each group lists an interval (seconds) under `presets:` in
`config/pgwatch-prometheus/metrics.yml`. For example, most groups collect every `30s` while
`pg_stat_activity` and `wait_events` collect every `15s`. Raise these values for the groups you
care less about to reduce load. There is no `PW_SCRAPE_INTERVAL` variable.

**2. Preset selection:**

The generated source hardcodes `preset_metrics: full` (see
`config/scripts/generate-pgwatch-sources.sh` and `cli/lib/instances.ts`). `mon local-install` has
**no** `--preset` flag — its options are `--demo`, `--api-key`, `--db-url`, `--tag`, `--project`,
and `-y/--yes`. There are no `basic`/`standard` preset tiers. To trim collection, edit the `full`
preset (or define a custom preset) in `metrics.yml`.

**3. Disable expensive metrics:**

Remove or lengthen the interval of expensive groups (for example the bloat groups
`pg_table_bloat`, `pg_btree_bloat` — already at `7200s`) directly in the `full` preset in
`metrics.yml`. There is no `PW_DISABLED_METRICS` variable.

### Monitoring query overhead

Check which queries monitoring runs:

```sql
select
  query,
  calls,
  mean_exec_time,
  total_exec_time
from pg_stat_statements
where query like '%pg_stat%'
order by total_exec_time desc
limit 10;
```

## VictoriaMetrics tuning

The compose stack reads only these VictoriaMetrics (`sink-prometheus`) environment variables:
`VM_AUTH_USERNAME`, `VM_AUTH_PASSWORD`, `VM_RETENTION_PERIOD`, `VM_QUERY_DURATION`, and
`VM_MAX_CONCURRENT_REQUESTS`. Variables such as `VM_STORAGE_*`, `VM_SEARCH_*`, and a per-query
memory limit do not exist here.

### Query performance

**Increase query duration limit:**

```bash
VM_QUERY_DURATION=60s   # default 30s; maps to -search.maxQueryDuration
```

**Limit concurrent queries:**

```bash
VM_MAX_CONCURRENT_REQUESTS=8   # default 16; maps to -search.maxConcurrentRequests
```

### Storage optimization

**Shorter retention:**

```bash
VM_RETENTION_PERIOD=168h   # 7 days, down from the default 336h (14 days)
```

`VM_RETENTION_PERIOD` accepts VictoriaMetrics durations with hour/day/week/year suffixes — for
example `168h` or `7d`, `336h` or `14d`, `30d` (a bare integer is interpreted as months).
The bundled `.env.example` lists `30d` as a valid example.

**Enable compression:**

VictoriaMetrics compresses by default. Check TSDB status (host port `59090`, VM basic auth):

```bash
curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
  http://localhost:59090/api/v1/status/tsdb
```

## Grafana optimization

### Dashboard design

**Reduce panels per dashboard:**
- Limit to 20-30 panels
- Use collapsed rows for less-used panels

**Optimize panel queries:**
- Use `rate()` instead of raw counters
- Limit time series with `topk()` or `bottomk()`
- Add `{cluster="production"}` filters (the metric label is `cluster`, not `cluster_name`)

**Example — limit to top 10:**

```promql
topk(10, rate(pgwatch_pg_stat_statements_calls[5m]))
```

### Query caching

Enable in Grafana:

```ini
[caching]
enabled = true
ttl = 60s
```

### Data point reduction

Limit data points returned:

```ini
# grafana.ini
[dataproxy]
max_idle_connections = 100
row_limit = 10000
```

## pgwatch tuning

### Connection and collection settings

pgwatch in this stack is configured through its `sources.yml` / `metrics.yml` files (generated
from `instances.yml`), not through `PW_*` environment variables. Variables such as
`PW_MAX_PARALLEL_CONNECTIONS_PER_DB` and `PW_CONNECT_TIMEOUT` do not exist here. To reduce load,
adjust per-metric collection intervals in `metrics.yml` (see
[Reducing collection overhead](#reducing-collection-overhead) above) or disable targets in
`instances.yml`.

## Resource allocation

### Minimum requirements

| Component | CPU | Memory | Disk |
|-----------|-----|--------|------|
| pgwatch | 0.5 cores | 256 MiB | minimal |
| VictoriaMetrics | 1 core | 2 GiB | 10 GiB/week |
| Grafana | 0.5 cores | 512 MiB | 100 MiB |

### Scaling recommendations

**Per monitored database:**
- Add 50 MiB RAM to VictoriaMetrics
- Add 5 GiB storage per week

**Example — 10 databases, 30-day retention:**
```
VictoriaMetrics RAM: 2 GiB + (10 × 50 MiB) = 2.5 GiB
VictoriaMetrics Disk: 10 × 4 weeks × 5 GiB = 200 GiB
```

## Docker resource limits

Each service in `docker-compose.yml` sets top-level `cpus:` and `mem_limit:` keys whose defaults
come from environment variables — there is no `deploy.resources.limits` block. Override them in
`.env` rather than editing the compose file. These limits apply only when a container is
recreated, so after editing `.env` run `docker compose up -d --force-recreate <service>` to apply
them (`postgresai mon update-config` migrates `.env` but does not recreate services). CPUs are
floats (Docker Compose `cpus:` semantics); memory is in **bytes**.

```bash
# .env — override the per-service defaults
PGWATCH_PROMETHEUS_CPUS=1.0
PGWATCH_PROMETHEUS_MEM=536870912     # 512 MiB (default)

SINK_PROMETHEUS_CPUS=2.0             # VictoriaMetrics (sink-prometheus)
SINK_PROMETHEUS_MEM=4294967296       # 4 GiB

GRAFANA_CPUS=1.0
GRAFANA_MEM=1073741824               # 1 GiB
```

The matching `cpus:`/`mem_limit:` lines in `docker-compose.yml` read these variables, for example:

```yaml
  pgwatch-prometheus:
    cpus: ${PGWATCH_PROMETHEUS_CPUS:-0.5}
    mem_limit: ${PGWATCH_PROMETHEUS_MEM:-536870912}
```

## High cardinality issues

### Identify high cardinality

```bash
curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
  http://localhost:59090/api/v1/status/tsdb | jq '.data.totalSeries'
```

### Common cardinality sources

| Source | Impact | Mitigation |
|--------|--------|------------|
| queryid labels | High | Use query digest instead |
| Per-table metrics | Medium | Filter to important tables |
| Per-index metrics | Medium | Filter to important indexes |
| Multiple clusters | Additive | Separate VictoriaMetrics instances |

### Reduce cardinality

**Reduce query-identity cardinality:**

Query-level series are keyed by the `queryid` label (used throughout the dashboards via
`pgwatch_query_info`). There is no `query` label carrying full query text on the Prometheus
metrics to drop. The primary cardinality control is the per-metric `LIMIT 100` in the pgwatch
`metrics.yml` (and the `sample_limit` safety nets in `prometheus.yml`); lower these to cap the
number of distinct `queryid`s retained.

**Aggregate metrics:**

```promql
# Instead of per-table, aggregate across tables
sum by (datname) (pgwatch_pg_stat_all_tables_seq_tup_read)
```

## Monitoring the monitoring

Use the Self-Monitoring dashboard to track:

- Collection latency
- Query durations
- Memory usage
- Disk usage

The stack does not ship alert rules (there is no Alertmanager or `vmalert`; see
[Alerting configuration](/docs/monitoring/configuration/alerting)). If you add your own alerting,
note that there is no `pgwatch_collection_duration_seconds` metric in this stack — base health
alerts on series that actually exist (for example `up{job="pgwatch-prometheus"}` for the pgwatch
scrape job, or VM's own self-monitoring metrics).

## Troubleshooting slow dashboards

### Step 1: Identify slow panels

1. Open dashboard
2. Click panel → Inspect → Query
3. Check "Query" tab for execution time

### Step 2: Analyze query

Look for:
- Missing time range filter
- High cardinality selectors
- Expensive aggregations

### Step 3: Optimize

```promql
# Before (slow)
sum(rate(pgwatch_pg_stat_statements_calls[5m]))

# After (faster - add filter; the label is `cluster`)
sum(rate(pgwatch_pg_stat_statements_calls{cluster="$cluster_name"}[5m]))
```
