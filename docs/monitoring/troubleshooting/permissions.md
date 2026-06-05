---
title: Permission errors
sidebar_label: Permission errors
sidebar_position: 3
---

# Permission errors

Resolving access denied and permission issues in PostgresAI monitoring.

## Common error messages

| Error | Cause |
|-------|-------|
| `permission denied for relation pg_stat_statements` | Missing pg_monitor role |
| `must be superuser to read pg_stat_statements` | pg_stat_statements requires privileges |
| `permission denied for function pg_stat_reset` | Reset requires superuser |
| `access denied` in Grafana | Data source credentials wrong |

## Required PostgreSQL permissions

### Minimum permissions

The monitoring user needs:

```sql
-- PostgreSQL 10+
grant pg_monitor to monitoring_user;
```

This includes:
- `pg_read_all_settings`
- `pg_read_all_stats`
- `pg_stat_scan_tables`

### Pre-PostgreSQL 10

```sql
-- Grant individual permissions
grant select on pg_stat_activity to monitoring_user;
grant select on pg_stat_replication to monitoring_user;
grant select on pg_stat_database to monitoring_user;
grant select on pg_stat_bgwriter to monitoring_user;
grant select on pg_stat_user_tables to monitoring_user;
grant select on pg_stat_user_indexes to monitoring_user;
grant select on pg_statio_user_tables to monitoring_user;
grant select on pg_statio_user_indexes to monitoring_user;
```

### pg_stat_statements access

For PostgreSQL 14+:
```sql
grant pg_read_all_stats to monitoring_user;
```

## Cloud-specific permissions

### Amazon RDS

```sql
-- Use rds_superuser for setup
grant rds_superuser to monitoring_user;

-- Or more restrictive:
grant pg_monitor to monitoring_user;
```

:::note
RDS doesn't allow true superuser access. `rds_superuser` provides most monitoring capabilities.
:::

### Google Cloud SQL

```sql
-- Cloud SQL uses cloudsqlsuperuser
grant cloudsqlsuperuser to monitoring_user;

-- Or:
grant pg_monitor to monitoring_user;
```

### Azure Database for PostgreSQL

```sql
-- Azure uses azure_pg_admin
grant azure_pg_admin to monitoring_user;

-- Or:
grant pg_monitor to monitoring_user;
```

## Checking current permissions

### View user roles

```sql
select
  r.rolname,
  r.rolsuper,
  r.rolcreaterole,
  r.rolcreatedb,
  array_agg(m.rolname) as member_of
from pg_roles r
left join pg_auth_members am on r.oid = am.member
left join pg_roles m on am.roleid = m.oid
where r.rolname = 'monitoring_user'
group by r.rolname, r.rolsuper, r.rolcreaterole, r.rolcreatedb;
```

### Test specific access

```sql
-- Test pg_stat_statements access
set role monitoring_user;
select count(*) from pg_stat_statements;
reset role;

-- Test pg_stat_activity access
set role monitoring_user;
select count(*) from pg_stat_activity;
reset role;
```

## Fixing permission errors

### pg_stat_statements access denied

**Error:**
```
permission denied for relation pg_stat_statements
```

**Solution:**
```sql
grant pg_read_all_stats to monitoring_user;
-- or
grant pg_monitor to monitoring_user;
```

### pg_stat_activity limited

**Symptom:** Only sees own sessions, not all sessions

**Solution:**
```sql
grant pg_read_all_stats to monitoring_user;
```

### Cannot reset statistics

**Error:**
```
must be superuser to reset statistics
```

**Note:** Statistics reset is not required for monitoring. This error can be ignored unless you need reset functionality.

If reset is required:
```sql
-- Create a function owned by superuser
create or replace function public.monitoring_stats_reset()
returns void
language plpgsql
security definer
as $$
begin
  perform pg_stat_reset();
end;
$$;

grant execute on function public.monitoring_stats_reset() to monitoring_user;
```

## Grafana permission issues

### Data source access denied

**Symptom:** Grafana shows "Access denied" or "Bad Gateway"

**Check:**
1. Data source URL is correct
2. Credentials are valid
3. Network connectivity exists

```bash
# Test from the Grafana container. The datasource points at sink-prometheus:9090
# (there is no host named "victoriametrics", and the container port is 9090, not
# 8428). The endpoint requires VM basic auth.
docker compose exec grafana curl \
  -u "$VM_AUTH_USERNAME:$VM_AUTH_PASSWORD" \
  'http://sink-prometheus:9090/api/v1/query?query=up'
```

### Dashboard access

**Symptom:** User cannot see dashboards

**Solution:**
1. Check folder permissions in Grafana
2. Assign user to appropriate team/role
3. Grant "Viewer" role minimum for dashboard access

## pg_hba.conf issues

### Connection rejected

**Error:**
```
no pg_hba.conf entry for host "x.x.x.x"
```

**Solution:**
Add entry to pg_hba.conf:
```
host    all    monitoring_user    monitoring_host_ip/32    scram-sha-256
```

Then reload:
```sql
select pg_reload_conf();
```

### SSL required

**Error:**
```
FATAL: no pg_hba.conf entry for host ... SSL off
```

**Solutions:**

1. Add SSL to connection string:
   ```
   postgresql://user:pass@host:5432/db?sslmode=require
   ```

2. Or update pg_hba.conf to allow non-SSL:
   ```
   host    all    monitoring_user    x.x.x.x/32    scram-sha-256
   ```

## Security best practices

### Use dedicated monitoring user

```sql
create user monitoring_user with password 'strong_password';
grant pg_monitor to monitoring_user;
```

### Limit network access

```
# pg_hba.conf - only allow from monitoring server
host    all    monitoring_user    10.0.0.5/32    scram-sha-256
```

### Use SSL

```
# pg_hba.conf - require SSL
hostssl    all    monitoring_user    10.0.0.0/24    scram-sha-256
```

### Rotate monitoring database credentials

This rotates the **monitored database** role's password. To rotate the VictoriaMetrics
basic-auth credentials instead, see
[Rotating VictoriaMetrics credentials](/docs/monitoring/configuration/prometheus-config#rotating-victoriametrics-credentials).

The monitored-database connection (including its password) lives in `instances.yml`, which is
rendered into pgwatch's `sources.yml` by `config/scripts/generate-pgwatch-sources.sh` — **not** in
`docker-compose.yml` or `.env` (the `.env` file holds stack secrets such as `REPLICATOR_PASSWORD`
and `VM_AUTH_*`). Update the target's `conn_str` in `instances.yml`, then regenerate sources and
recreate the pgwatch collectors:

```bash
# Edit the target's conn_str in instances.yml, then regenerate sources.yml from it:
postgresai mon update-config
# Apply the new connection by restarting the collectors. `mon restart` takes at most one
# service argument, so restart each collector separately:
postgresai mon restart pgwatch-postgres
postgresai mon restart pgwatch-prometheus
```

`postgresai mon restart` alone is **not** enough: it only runs `docker compose restart` and never
re-renders `sources.yml` from `instances.yml`, so the new `conn_str` would never reach the
collectors. `mon update-config` runs the `sources-generator` service that regenerates the sources.
(`mon restart` with no service argument restarts the whole stack; it accepts at most one service,
so the two collectors must be restarted with two separate commands.)

## Troubleshooting checklist

1. ☐ User exists in database
2. ☐ User has pg_monitor role (or equivalent)
3. ☐ pg_hba.conf allows connection
4. ☐ Password is correct
5. ☐ SSL mode matches server configuration
6. ☐ Extensions are installed in correct database
