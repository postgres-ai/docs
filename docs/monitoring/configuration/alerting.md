---
title: Alerting configuration
sidebar_label: Alerting
sidebar_position: 5
---

# Alerting configuration

:::info No bundled alerting in 0.15.0
PostgresAI monitoring 0.15.0 does **not** ship any alert rules, an Alertmanager service, or a
`vmalert` component. There are no pre-configured alerts (such as connection, replication, or
bloat alerts), no Alertmanager API on port `9093`, and no notification receivers bundled with the
stack.

The metrics-storage backend is VictoriaMetrics (the `sink-prometheus` service), exposed on host
port `59090` (container `9090`). The bundled `config/prometheus/prometheus.yml` contains only a
commented-out `rule_files:` placeholder and **no** `alerting:` / `alertmanager` block:

```yaml
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"
```

Everything on this page describes how you can *add your own* alerting on top of the stack. None of
it is provided out of the box.
:::

## Adding alerting yourself

Because the stack stores metrics in VictoriaMetrics, you have two common options to add alerting.

### Option 1: Grafana alerting

Grafana (the `grafana` service, container `grafana-with-datasources`, on host port `3000`,
default login `monitor` / `demo`) ships with its own alerting engine. You can define alert rules
against the `PGWatch-Prometheus` datasource entirely inside Grafana, with no extra components.

1. Open a panel and switch to the **Alert** tab, or use **Alerting → Alert rules**.
2. Build a query against the `PGWatch-Prometheus` datasource using the real metric names exported
   by pgwatch (all prefixed `pgwatch_`, for example `pgwatch_pg_stat_activity_count`,
   `pgwatch_db_stats_xact_commit`, `pgwatch_db_stats_numbackends`, and
   `pgwatch_settings_numeric_value{setting_name="max_connections"}`). See the
   [metrics reference](/docs/reference-guides/postgres-ai-monitoring-reference) for the exact
   series names.
3. Configure a threshold, an evaluation interval, and a contact point.

### Option 2: vmalert + Alertmanager (not bundled)

VictoriaMetrics supports Prometheus-style alerting through the separate `vmalert` component plus a
Prometheus Alertmanager. Neither is part of the PostgresAI compose stack, so you would run them
yourself and point them at the `sink-prometheus` datasource (`http://sink-prometheus:9090`,
which uses basic auth — `VM_AUTH_USERNAME` / `VM_AUTH_PASSWORD`).

If you go this route, write your own rules against the real `pgwatch_*` series. For example, a
connection-saturation rule:

```yaml
groups:
  - name: postgresql_alerts
    rules:
      - alert: HighConnectionUsage
        expr: |
          sum(pgwatch_db_stats_numbackends) by (cluster, node_name)
          /
          scalar(max(pgwatch_settings_numeric_value{setting_name="max_connections"}))
          > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Connection usage above 80%"
          description: "{{ $labels.cluster }} has {{ $value | humanizePercentage }} connections used"
```

:::note Verify metric and label names first
Use real series names and labels. pgwatch exports series as `pgwatch_<metric-group>_<column>`,
and the cluster label is `cluster` (not `cluster_name`; `cluster_name` is only a Grafana template
variable). Query `http://localhost:59090/api/v1/query?query=...` against VictoriaMetrics (with VM
basic auth) to confirm a series exists before writing a rule against it.
:::

## Best practices for any rules you add

**Use the `for` duration wisely:**
- Too short — false positives from transient spikes.
- Too long — delayed notification.

**Recommended `for` values:**

| Alert type | Duration |
|------------|----------|
| Critical outages | 1m |
| Performance issues | 5m |
| Resource usage | 10m |
| Trend alerts | 30m |

## Related

- [Monitoring reference](/docs/reference-guides/postgres-ai-monitoring-reference) — exact metric
  and label names to use in alert expressions.
- [pgwatch configuration](/docs/monitoring/configuration/pgwatch-config) — how metric collection
  is configured.
