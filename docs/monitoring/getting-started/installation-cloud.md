---
title: Cloud installation
sidebar_label: Cloud (RDS, CloudSQL, Supabase)
sidebar_position: 6
---

# Cloud installation guide

Configure PostgresAI monitoring for managed PostgreSQL services.

## Overview

Managed PostgreSQL services (RDS, CloudSQL, Supabase) require specific configuration due to:
- Limited superuser access
- Pre-configured extensions
- Network restrictions
- Different permission models

## Amazon RDS for PostgreSQL

### Prerequisites

- RDS PostgreSQL 14+
- Parameter group with `pg_stat_statements` enabled
- Security group allowing monitoring access

### Step 1: Enable pg_stat_statements

Create or modify a parameter group:

```
shared_preload_libraries = pg_stat_statements
pg_stat_statements.track = all
pg_stat_statements.max = 10000
```

Apply to your RDS instance and reboot if required.

### Step 2: Create monitoring user

Connect as the master user:

```sql
-- Create monitoring user
create user postgres_ai_mon with password '<STRONG_RANDOM_PASSWORD>';

-- Grant required permissions
grant pg_read_all_stats to postgres_ai_mon;

-- Enable extension (if not already)
create extension if not exists pg_stat_statements;

-- For each database to monitor
\c your_database
grant usage on schema public to postgres_ai_mon;
grant select on all tables in schema public to postgres_ai_mon;
```

### Step 3: Configure security group

Allow inbound traffic from your monitoring stack:

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| PostgreSQL | TCP | 5432 | Monitoring VPC/IP |

### Step 4: Start monitoring

```bash
npx postgresai@0.15.0 mon local-install \
  --db-url "postgresql://postgres_ai_mon:password@your-instance.region.rds.amazonaws.com:5432/your_db"
```

:::note Labeling clusters and nodes
The 0.15 `local-install` command does not accept `--cluster-name`/`--node-name`. To
tag metrics by cluster or node, set `custom_tags.cluster` and `custom_tags.node_name`
in `instances.yml` (see [Docker Compose → Adding multiple databases](/docs/monitoring/getting-started/installation-docker#adding-multiple-databases)).
:::

### RDS-specific considerations

**Enhanced Monitoring:**
RDS Enhanced Monitoring provides OS-level metrics. PostgresAI focuses on PostgreSQL-internal metrics, so both complement each other.

**Performance Insights:**
If using RDS Performance Insights, PostgresAI provides similar wait event analysis with more customization options.

**Multi-AZ:**
Monitor the primary endpoint. For read replicas, add separate monitoring targets.

## Google Cloud SQL

### Prerequisites

- Cloud SQL PostgreSQL 14+
- Private IP or authorized network
- `cloudsql.pg_stat_statements` flag enabled

### Step 1: Enable extensions

In Cloud Console or via gcloud:

```bash
gcloud sql instances patch INSTANCE_NAME \
  --database-flags=cloudsql.enable_pg_stat_statements=on
```

This requires instance restart.

### Step 2: Create monitoring user

Using Cloud SQL admin user:

```sql
-- Create monitoring user
create user postgres_ai_mon with password '<STRONG_RANDOM_PASSWORD>';

-- Grant permissions
grant pg_read_all_stats to postgres_ai_mon;

-- On each database
grant usage on schema public to postgres_ai_mon;
grant select on all tables in schema public to postgres_ai_mon;
```

### Step 3: Configure network access

**Option A: Private IP (Recommended)**

Enable Private IP on your Cloud SQL instance and connect from your monitoring VPC.

**Option B: Authorized Networks**

Add your monitoring stack's IP to authorized networks:
- Cloud Console — SQL — Instance — Connections — Authorized networks

### Step 4: Connection string

For private IP:
```bash
npx postgresai@0.15.0 mon local-install \
  --db-url "postgresql://postgres_ai_mon:password@10.x.x.x:5432/your_db"
```

For Cloud SQL Auth Proxy:
```bash
# Start proxy
cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432

# Connect
npx postgresai@0.15.0 mon local-install \
  --db-url "postgresql://postgres_ai_mon:password@localhost:5432/your_db"
```

:::note Labeling clusters and nodes
The 0.15 `local-install` command does not accept `--cluster-name`/`--node-name`. To
tag metrics by cluster or node, set `custom_tags.cluster` and `custom_tags.node_name`
in `instances.yml` (see [Docker Compose → Adding multiple databases](/docs/monitoring/getting-started/installation-docker#adding-multiple-databases)).
:::

### Cloud SQL-specific considerations

**Insights:**
Cloud SQL Query Insights provides similar functionality. PostgresAI offers more detailed dashboards and historical analysis.

**Read Replicas:**
Each replica needs separate monitoring configuration with distinct `node_name`.

## Supabase

### Prerequisites

- Supabase project with PostgreSQL
- Direct database connection enabled
- Database password from Supabase dashboard

### Step 1: Get connection details

In Supabase Dashboard:
1. Go to **Settings → Database**
2. Find **Connection string** under "Direct connection"
3. Note the host, port, and password

### Step 2: Enable pg_stat_statements

Supabase has `pg_stat_statements` enabled by default. Verify:

```sql
select * from pg_extension where extname = 'pg_stat_statements';
```

### Step 3: Create monitoring user

Connect to your Supabase database and run:

```sql
-- Create monitoring user
create user postgres_ai_mon with password '<STRONG_RANDOM_PASSWORD>';

-- Grant permissions
grant pg_read_all_stats to postgres_ai_mon;

-- Grant access to your schemas
grant usage on schema public to postgres_ai_mon;
grant select on all tables in schema public to postgres_ai_mon;
```

### Step 4: Start monitoring

```bash
npx postgresai@0.15.0 mon local-install \
  --db-url "postgresql://postgres_ai_mon:password@db.xxxx.supabase.co:5432/postgres?sslmode=require"
```

:::note Labeling clusters and nodes
The 0.15 `local-install` command does not accept `--cluster-name`/`--node-name`. To
tag metrics by cluster or node, set `custom_tags.cluster` and `custom_tags.node_name`
in `instances.yml` (see [Docker Compose → Adding multiple databases](/docs/monitoring/getting-started/installation-docker#adding-multiple-databases)).
:::

:::note Connection pooling
Use the "Direct connection" string, not the pooled connection (port 6543). Monitoring requires direct PostgreSQL protocol access.
:::

## Common cloud considerations

### SSL/TLS connections

Most cloud providers require SSL:

```bash
# Require SSL
--db-url "postgresql://...?sslmode=require"

# Verify certificate (recommended for production)
--db-url "postgresql://...?sslmode=verify-full&sslrootcert=/path/to/ca.crt"
```

### Permission limitations

Cloud databases don't allow true superuser access. The monitoring user can access:
- ✅ `pg_stat_statements`
- ✅ `pg_stat_*` views
- ✅ System catalogs (pg_class, pg_index, etc.)
- ❌ File system functions
- ❌ Some pg_stat_kcache features

### Connection limits

Cloud instances have connection limits. Ensure monitoring doesn't exhaust connections:
- pgwatch uses ~2-5 connections per target
- Consider connection pooling if near limits

### Network latency

For optimal metric collection:
- Deploy monitoring in same region as database
- Use private networking when available
- Account for ~1-2 second scrape intervals

## Troubleshooting

### "permission denied for function"

Grant required permissions:
```sql
grant pg_read_all_stats to postgres_ai_mon;
```

### "pg_stat_statements must be loaded"

Ensure extension is in preload libraries and instance was restarted.

### Connection timeout

Check:
1. Security group / firewall rules
2. VPC peering / private link configuration
3. Correct endpoint (primary vs replica)

### SSL errors

Verify SSL mode and certificates:
```bash
psql "postgresql://...?sslmode=verify-full" -c "SELECT 1"
```

## Next steps

- [Dashboards](/docs/monitoring/dashboards/) - Explore the dashboards
- [Alerting](/docs/monitoring/configuration/alerting) - Set up cloud-aware alerts
- [Troubleshooting](/docs/monitoring/troubleshooting/) - Common issues
