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

# Expected services (names)
# NAME                       STATUS
# pgwatch-postgres           Up
# pgwatch-prometheus         Up
# sink-postgres              Up
# sink-prometheus            Up   (VictoriaMetrics)
# grafana                    Up   (container grafana-with-datasources)
```

### Verify metrics flow

```bash
# 1. Check pgwatch metrics are exposed (internal only; the prometheus sink
#    serves them at pgwatch-prometheus:9091/pgwatch — no host port 8080).
#    sink-prometheus enables VM basic auth when VM_AUTH_USERNAME/PASSWORD are set,
#    so /api/v1/query needs credentials (otherwise it returns 401).
#    sink-prometheus is the VictoriaMetrics image: its wget is BusyBox wget, which
#    has NO --user/--password flags — pass the credentials in the URL userinfo instead.
docker compose exec sink-prometheus wget -qO- \
  "http://$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD@localhost:9090/api/v1/query?query=pgwatch_pg_stat_activity_count"

# 2. Check VictoriaMetrics is receiving (host port 59090; VM basic auth)
curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
  'http://localhost:59090/api/v1/query?query=up'

# 3. Check the Grafana data source proxy (admin: monitor / demo; the proxy path
#    takes the datasource UID, not its name — PGWatch-Prometheus has uid
#    P7A0D6631BB10B34F; Grafana adds the VM basic auth under the hood)
curl 'http://monitor:demo@localhost:3000/api/datasources/proxy/uid/P7A0D6631BB10B34F/api/v1/query?query=up'
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
docker compose logs pgwatch-postgres pgwatch-prometheus --tail 100
```

### VictoriaMetrics logs

```bash
docker compose logs sink-prometheus --tail 100
```

### Grafana logs

```bash
docker compose logs grafana --tail 100
```

### PostgreSQL connectivity

The `pgwatch-postgres` image is a minimal Alpine build that ships only the pgwatch binary — it has no
`psql`. Run the connectivity check from a container that does have a client, such as `sink-postgres`
(image `postgres:17`):

```bash
docker compose exec sink-postgres psql -h target-host -U monitoring_user -c "select 1"
```

## Health check endpoints

Only Grafana (port `3000`) and VictoriaMetrics (host `59090`) are reachable from the host. pgwatch's
internal web address (`:8080` on `pgwatch-postgres`) is not published to the host.

| Component | Endpoint | Expected |
|-----------|----------|----------|
| Grafana | `http://localhost:3000/api/health` | `{"database": "ok"}` |
| VictoriaMetrics | `http://localhost:59090/health` | `OK` |

## Getting help

1. Check logs for error messages
2. Review the specific troubleshooting guide
3. Search [GitLab Issues](https://gitlab.com/postgres-ai/postgresai/-/issues)
4. Open a new issue with diagnostic output

## Sections

- [No data troubleshooting](/docs/monitoring/troubleshooting/no-data) — Empty dashboards
- [Permission errors](/docs/monitoring/troubleshooting/permissions) — Access denied issues
- [Performance tuning](/docs/monitoring/troubleshooting/performance) — Slow queries and dashboards
