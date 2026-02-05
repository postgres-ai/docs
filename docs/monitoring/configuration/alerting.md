---
title: Alerting configuration
sidebar_label: Alerting
sidebar_position: 5
---

# Alerting configuration

Configure alert rules and notification channels for PostgresAI monitoring.

## Alert rule basics

PostgresAI includes pre-configured alert rules for common PostgreSQL issues.

### Alert structure

```yaml
groups:
  - name: postgresql_alerts
    rules:
      - alert: HighConnectionUsage
        expr: |
          sum(pg_stat_database_numbackends)
          /
          scalar(max(pg_settings_max_connections))
          > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Connection usage above 80%"
          description: "{{ $labels.cluster_name }} has {{ $value | humanizePercentage }} connections used"
```

### Alert components

| Component | Purpose |
|-----------|---------|
| expr | PromQL expression that triggers alert |
| for | Duration condition must be true |
| labels | Metadata for routing and filtering |
| annotations | Human-readable alert details |

## Pre-configured alerts

### Connection alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| HighConnectionUsage | > 80% of max_connections | warning |
| CriticalConnectionUsage | > 95% of max_connections | critical |
| IdleInTransactionLong | Session idle in transaction > 5min | warning |

### Performance alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| HighTransactionRollbackRate | Rollbacks > 5% of commits | warning |
| LowBufferCacheHitRatio | Buffer hit ratio < 95% | warning |
| HighDeadTupleRatio | Dead tuples > 20% of live | warning |

### Replication alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| ReplicationLagHigh | Lag > 100MB | warning |
| ReplicationLagCritical | Lag > 1 GiB | critical |
| ReplicaDisconnected | Replica not in pg_stat_replication | critical |

### Storage alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| TableBloatHigh | Estimated bloat > 50% | warning |
| IndexBloatHigh | Estimated bloat > 30% | warning |
| TempFileUsageHigh | Temp files > 1 GiB/hour | warning |

## Custom alert rules

### Creating custom rules

1. Create rules file:

```yaml
# custom-alerts.yml
groups:
  - name: custom_postgresql
    rules:
      - alert: SlowQueryDetected
        expr: |
          pg_stat_statements_mean_exec_time_seconds
          > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow query detected"
          description: "Query {{ $labels.queryid }} averaging {{ $value }}s"
```

2. Mount into container:

```yaml
volumes:
  - ./custom-alerts.yml:/etc/prometheus/rules/custom-alerts.yml
```

### Alert rule best practices

**Use `for` duration wisely:**
- Too short — false positives from transient spikes
- Too long — delayed notification

**Recommended `for` values:**
| Alert type | Duration |
|------------|----------|
| Critical outages | 1m |
| Performance issues | 5m |
| Resource usage | 10m |
| Trend alerts | 30m |

## Notification channels

### Email

```yaml
receivers:
  - name: email-team
    email_configs:
      - to: dba-team@example.com
        from: alerts@example.com
        smarthost: smtp.example.com:587
        auth_username: alerts@example.com
        auth_password: ${SMTP_PASSWORD}  # Use environment variable
```

:::warning Security
Never hardcode SMTP passwords. Use environment variable interpolation or external secrets management.
:::

### Slack

```yaml
receivers:
  - name: slack-alerts
    slack_configs:
      - api_url: https://hooks.slack.com/services/xxx/yyy/zzz
        channel: '#postgres-alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ .Annotations.description }}'
```

### PagerDuty

```yaml
receivers:
  - name: pagerduty-critical
    pagerduty_configs:
      - service_key: <PAGERDUTY_SERVICE_KEY>
        severity: '{{ .Labels.severity }}'
```

### OpsGenie

```yaml
receivers:
  - name: opsgenie
    opsgenie_configs:
      - api_key: your-api-key
        priority: '{{ if eq .Labels.severity "critical" }}P1{{ else }}P3{{ end }}'
```

## Alert routing

### Route configuration

```yaml
route:
  receiver: default
  group_by: [alertname, cluster_name]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    - match:
        severity: critical
      receiver: pagerduty-critical
      repeat_interval: 1h

    - match:
        severity: warning
      receiver: slack-alerts
      repeat_interval: 4h
```

### Routing labels

| Label | Purpose |
|-------|---------|
| severity | critical, warning, info |
| cluster_name | Target specific teams |
| team | Route to team channel |

## Silencing alerts

### Temporary silence

```bash
# Via Alertmanager API
curl -X POST http://localhost:9093/api/v2/silences \
  -H "Content-Type: application/json" \
  -d '{
    "matchers": [
      {"name": "alertname", "value": "HighConnectionUsage"}
    ],
    "startsAt": "2024-01-15T00:00:00Z",
    "endsAt": "2024-01-15T06:00:00Z",
    "createdBy": "admin",
    "comment": "Planned maintenance"
  }'
```

### Inhibition rules

Suppress dependent alerts:

```yaml
inhibit_rules:
  - source_match:
      alertname: PostgresDown
    target_match:
      severity: warning
    equal: [cluster_name]
```

## Grafana alerting

### Creating Grafana alerts

1. Open panel edit mode
2. Click "Alert" tab
3. Configure conditions:

```yaml
conditions:
  - evaluator:
      type: gt
      params: [0.8]
    query:
      params: [A, 5m, now]
    reducer:
      type: avg
```

### Grafana contact points

```yaml
apiVersion: 1
contactPoints:
  - orgId: 1
    name: slack
    receivers:
      - uid: slack-1
        type: slack
        settings:
          url: https://hooks.slack.com/xxx
```

## Testing alerts

### Dry run

```bash
# Check rule syntax
promtool check rules custom-alerts.yml

# Test PromQL expression
curl 'http://localhost:8428/api/v1/query?query=...'
```

### Alert testing

```bash
# Fire test alert
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {"alertname": "TestAlert", "severity": "warning"},
    "annotations": {"summary": "Test alert"}
  }]'
```

## Troubleshooting

### Alert not firing

1. Check expression returns data:
   ```bash
   curl 'http://localhost:8428/api/v1/query?query=<expression>'
   ```

2. Verify `for` duration has elapsed

3. Check Alertmanager received alert:
   ```bash
   curl http://localhost:9093/api/v2/alerts
   ```

### Alert not delivered

1. Check Alertmanager logs
2. Verify notification channel configuration
3. Test channel directly:
   ```bash
   curl -X POST https://hooks.slack.com/xxx -d '{"text":"test"}'
   ```

### Common issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No alerts | Expression returns empty | Check metric exists and labels match |
| Too many alerts | Threshold too sensitive | Adjust threshold or add `for` duration |
| Duplicate alerts | Multiple Alertmanagers | Configure HA clustering |
