---
title: No data troubleshooting
sidebar_label: No data
sidebar_position: 2
---

# No data troubleshooting

Diagnosing and fixing "No data" issues in PostgresAI dashboards.

## Quick checklist

1. ☐ pgwatch container is running
2. ☐ Target PostgreSQL is reachable
3. ☐ Credentials are correct
4. ☐ Required extensions are installed
5. ☐ Time range includes recent data
6. ☐ Dashboard variables are set correctly

## Step-by-step diagnosis

### 1. Check pgwatch status

```bash
docker compose ps pgwatch-postgres pgwatch-prometheus
```

Expected: `Up` status

If not running:
```bash
docker compose logs pgwatch-postgres pgwatch-prometheus --tail 50
```

### 2. Verify PostgreSQL connectivity

The `pgwatch-postgres` container has no `psql` (it is a minimal Alpine image with only the pgwatch
binary). Run the check from `sink-postgres` (image `postgres:17`), which has a client:

```bash
# Use PGPASSWORD environment variable for authentication
docker compose exec -e PGPASSWORD="$PGPASSWORD" sink-postgres psql \
  "postgresql://user@host:5432/dbname" \
  -c "select 1"
```

Common connection errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `could not connect to server` | Network issue | Check firewall, DNS |
| `password authentication failed` | Wrong credentials | Verify username/password |
| `no pg_hba.conf entry` | pg_hba.conf missing entry | Add monitoring host to pg_hba.conf |
| `SSL required` | SSL not configured | Add `?sslmode=require` to connection string |

### 3. Check required extensions

```sql
-- Connect to target database
select * from pg_extension where extname = 'pg_stat_statements';
```

If missing:
```sql
create extension pg_stat_statements;
```

Verify it's in shared_preload_libraries:
```sql
show shared_preload_libraries;
-- Should include: pg_stat_statements
```

:::warning
Adding to shared_preload_libraries requires PostgreSQL restart.
:::

### 4. Verify metrics collection

The pgwatch-prometheus sink serves metrics at `pgwatch-prometheus:9091/pgwatch` on the internal
network; it is not published to the host. The simplest check is to query VictoriaMetrics (which
scrapes it) for a `pgwatch_`-prefixed series:

```bash
# Confirm pgwatch metrics have been ingested (host port 59090, VM basic auth)
curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
  'http://localhost:59090/api/v1/query?query=pgwatch_pg_stat_statements_calls'
```

### 5. Check VictoriaMetrics ingestion

```bash
curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
  'http://localhost:59090/api/v1/query?query=up'
```

Expected:
```json
{"status":"success","data":{"result":[...]}}
```

Check data for a specific metric (all pgwatch series are `pgwatch_`-prefixed; the transaction
commit counter is `pgwatch_db_stats_xact_commit`):
```bash
curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
  'http://localhost:59090/api/v1/query?query=pgwatch_db_stats_xact_commit'
```

### 6. Verify Grafana data source

```bash
curl 'http://monitor:demo@localhost:3000/api/datasources'
```

Check the `PGWatch-Prometheus` data source URL points to `http://sink-prometheus:9090`.

## Specific scenarios

### No data for pg_stat_statements metrics

**Symptoms:**
- Query Analysis dashboard empty
- Single Query dashboard shows no queries

**Causes and solutions:**

1. **Extension not installed:**
   ```sql
   create extension pg_stat_statements;
   ```

2. **Not in shared_preload_libraries:**
   ```ini
   # postgresql.conf
   shared_preload_libraries = 'pg_stat_statements'
   ```
   Then restart PostgreSQL.

3. **Insufficient track level:**
   ```sql
   show pg_stat_statements.track;
   -- Should be 'all' or 'top'
   ```

4. **Statistics were reset:**
   ```sql
   select stats_reset from pg_stat_database where datname = current_database();
   ```

### No data for specific database

**Symptoms:**
- Some databases show data, others don't
- Database dropdown shows the database

**Causes and solutions:**

1. **Extension not installed in that database:**
   ```sql
   -- Connect to specific database
   \c problematic_database
   create extension pg_stat_statements;
   ```

2. **Database not included in collection:**
   pgwatch monitors the databases listed in `instances.yml` (rendered into `sources.yml`). There
   is no `PW_EXCLUDE_DATABASES` (or any `PW_*`) environment variable. Verify the target's
   `conn_str` and that `is_enabled: true` in `instances.yml`.

### No data for specific cluster

**Symptoms:**
- Cluster dropdown shows the cluster
- All metrics for that cluster are empty

**Causes and solutions:**

1. **Check connectivity for that specific connection** (run `psql` from `sink-postgres`, since the
   `pgwatch-postgres` image has no client):
   ```bash
   docker compose exec sink-postgres psql "connection_string" -c "select 1"
   ```

2. **Check pgwatch logs for errors:**
   ```bash
   docker compose logs pgwatch-postgres pgwatch-prometheus | grep -i cluster
   ```

### Data stops after some time

**Symptoms:**
- Historical data exists
- Recent data missing

**Causes and solutions:**

1. **pgwatch crashed:**
   ```bash
   docker compose restart pgwatch-postgres pgwatch-prometheus
   ```

2. **Target PostgreSQL connection dropped:**
   Check network stability and connection timeouts.

3. **VictoriaMetrics storage full:**
   ```bash
   df -h /var/lib/docker/volumes/
   ```

## Dashboard-specific issues

### Time range too narrow

Grafana time range may not include collected data:
- Check "Last 15 minutes" or wider
- Verify timezone settings

### Wrong variable selection

Dashboard variables filter displayed data:
- Check `cluster_name` variable
- Check `db_name` variable (the standard database-selection variable; only
  [11. Single index](/docs/monitoring/dashboards/single-index) names it `datname`)
- Try "All" option if available

### Query timeout

Complex dashboards may timeout:
- Check Grafana query inspector for errors
- Increase `VM_QUERY_DURATION` (default `30s`; maps to VictoriaMetrics' `-search.maxQueryDuration`)

## Permission issues

If pgwatch can connect but gets no data:

```sql
-- Check monitoring user permissions
\du monitoring_user

-- Grant the required role (pg_monitor; this is what prepare-db grants and what
-- the install/verify step checks for). pg_read_all_stats is a strict subset and
-- is not sufficient on its own.
grant pg_monitor to monitoring_user;
```

See [Permission errors](/docs/monitoring/troubleshooting/permissions) for details.

## Still no data?

1. Collect diagnostic information:
   ```bash
   docker compose logs > monitoring-logs.txt
   docker compose ps >> monitoring-logs.txt
   curl -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
     'http://localhost:59090/api/v1/query?query=up' >> monitoring-logs.txt 2>&1
   ```

2. Check [GitLab Issues](https://gitlab.com/postgres-ai/postgresai/-/issues) for similar problems

3. Open a new issue with the diagnostic output
