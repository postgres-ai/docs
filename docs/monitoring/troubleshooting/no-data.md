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
docker compose ps pgwatch
```

Expected: `Up` status

If not running:
```bash
docker compose logs pgwatch --tail 50
```

### 2. Verify PostgreSQL connectivity

```bash
# Use PGPASSWORD environment variable for authentication
docker compose exec -e PGPASSWORD="$PGPASSWORD" pgwatch psql \
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

```bash
# Check pgwatch is scraping
curl http://localhost:8080/metrics | head -20
```

Expected: Prometheus-format metrics

```bash
# Check specific metrics
curl http://localhost:8080/metrics | grep pg_stat_statements_calls
```

### 5. Check VictoriaMetrics ingestion

```bash
curl 'http://localhost:8428/api/v1/query?query=up'
```

Expected:
```json
{"status":"success","data":{"result":[...]}}
```

Check data for specific metric:
```bash
curl 'http://localhost:8428/api/v1/query?query=pg_stat_database_xact_commit_total'
```

### 6. Verify Grafana data source

```bash
curl http://monitor:YOUR_PASSWORD@localhost:3000/api/datasources
```

Check data source URL points to VictoriaMetrics.

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

2. **Database excluded from collection:**
   Check pgwatch configuration for `PW_EXCLUDE_DATABASES`.

### No data for specific cluster

**Symptoms:**
- Cluster dropdown shows the cluster
- All metrics for that cluster are empty

**Causes and solutions:**

1. **Check connectivity for that specific connection:**
   ```bash
   docker compose exec pgwatch psql "connection_string" -c "select 1"
   ```

2. **Check pgwatch logs for errors:**
   ```bash
   docker compose logs pgwatch | grep "cluster_name"
   ```

### Data stops after some time

**Symptoms:**
- Historical data exists
- Recent data missing

**Causes and solutions:**

1. **pgwatch crashed:**
   ```bash
   docker compose restart pgwatch
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
- Check `datname` variable
- Try "All" option if available

### Query timeout

Complex dashboards may timeout:
- Check Grafana query inspector for errors
- Increase `VM_SEARCH_QUERY_TIMEOUT`

## Permission issues

If pgwatch can connect but gets no data:

```sql
-- Check monitoring user permissions
\du monitoring_user

-- Grant required permissions
grant pg_monitor to monitoring_user;
-- or for older PostgreSQL versions:
grant pg_read_all_stats to monitoring_user;
```

See [Permission errors](/docs/monitoring/troubleshooting/permissions) for details.

## Still no data?

1. Collect diagnostic information:
   ```bash
   docker compose logs > monitoring-logs.txt
   docker compose ps >> monitoring-logs.txt
   curl http://localhost:8080/metrics >> monitoring-logs.txt 2>&1
   ```

2. Check GitHub Issues for similar problems

3. Open a new issue with the diagnostic output
