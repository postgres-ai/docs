---
title: Troubleshooting
sidebar_label: Overview
sidebar_position: 1
---

# Troubleshooting

Guides for diagnosing and resolving common PostgresAI monitoring issues.

## Quick diagnostics

### Check component status

```bash
# Docker Compose
docker compose ps

# Expected output
# NAME             STATUS
# pgwatch          Up
# victoriametrics  Up
# grafana          Up
```

### Verify metrics flow

```bash
# 1. Check pgwatch is collecting
curl http://localhost:8080/metrics | grep pg_stat

# 2. Check VictoriaMetrics is receiving
curl 'http://localhost:8428/api/v1/query?query=up'

# 3. Check Grafana data source
curl http://monitor:YOUR_PASSWORD@localhost:3000/api/datasources/proxy/1/api/v1/query?query=up
```

## Common issues

| Symptom | Likely cause | Guide |
|---------|--------------|-------|
| "No data" in all panels | Collection not running | [No data troubleshooting](/docs/monitoring/troubleshooting/no-data) |
| "Access denied" errors | Missing permissions | [Permission errors](/docs/monitoring/troubleshooting/permissions) |
| Slow dashboards | Query performance | [Performance tuning](/docs/monitoring/troubleshooting/performance) |
| Missing pg_stat_statements | Extension not loaded | [No data troubleshooting](/docs/monitoring/troubleshooting/no-data) |

## Diagnostic commands

### pgwatch logs

```bash
docker compose logs pgwatch --tail 100
```

### VictoriaMetrics logs

```bash
docker compose logs victoriametrics --tail 100
```

### Grafana logs

```bash
docker compose logs grafana --tail 100
```

### PostgreSQL connectivity

```bash
docker compose exec pgwatch psql -h target-host -U monitoring_user -c "select 1"
```

## Health check endpoints

| Component | Endpoint | Expected |
|-----------|----------|----------|
| pgwatch | `http://localhost:8080/health` | `{"status": "ok"}` |
| VictoriaMetrics | `http://localhost:8428/health` | `OK` |
| Grafana | `http://localhost:3000/api/health` | `{"database": "ok"}` |

## Getting help

1. Check logs for error messages
2. Review the specific troubleshooting guide
3. Search [GitHub Issues](https://github.com/postgres-ai/postgresai/issues)
4. Open a new issue with diagnostic output

## Sections

- [No data troubleshooting](/docs/monitoring/troubleshooting/no-data) — Empty dashboards
- [Permission errors](/docs/monitoring/troubleshooting/permissions) — Access denied issues
- [Performance tuning](/docs/monitoring/troubleshooting/performance) — Slow queries and dashboards
