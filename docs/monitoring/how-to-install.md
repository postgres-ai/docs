---
title: How to install postgres_ai monitoring
sidebar_label: postgres_ai installation
keywords:
  - "postgres_ai installation"
  - "postgres_ai setup"
  - "monitoring installation"
  - "monitoring setup"
---

# How to install postgres_ai monitoring

~This documentation is under deveklopment; currently, the process includes many manual steps~

## Choose your installation method

Two primary installation options are available:

* **Demo installation**: Perfect for testing and learning, includes a synthetic database with sample data
* **Production installation**: Connect to your existing PostgreSQL databases with full monitoring capabilities

## Prepare VM

### VM for postgres_ai monitoring
* **Linux machine** with Docker installed (must be separate from your database server)
* **Docker permissions** - the user running `postgres_ai` must have Docker access
* **Network access** to Postgres database(s) you want to monitor
* **Database access** - proper `pg_hba.conf` configuration for connections

### Database requirements
* **Postgres versions**: 14-17 supported
* **Required extension**: `pg_stat_statements` must be created in the target database

### System resources
* **Recommended minimal configuration**: 3 CPU cores, 4 GiB RAM, 80 GiB disk space

### Obtain your organization's token in PostgresAI console
* Sign up for an account at https://console.postgres.ai
* Create a new organization
* Navigate to `Your Organization → Support → Checkup reports` and proceed with the payment 
* Inside `Your Organization → Support → Checkup reports` click `Generate new report` and click `Generate token`

<img src="/img/checkup-generate-token.png" alt="Generate access token" width="600" />

## Security considerations

**WARNING: Security is your responsibility!**

This monitoring solution exposes several ports that **MUST** be properly firewalled:

| Port | Service | Description |
|------|---------|-------------|
| 3000 | Grafana | Dashboard interface (contains sensitive database metrics) |
| 55000 | Flask API | Backend API service |
| 55432 | Demo DB | Demo database (only with `--demo` option) |
| 55433 | Metrics DB | PostgreSQL metrics storage |
| 58080 | PGWatch Postgres | Database monitoring interface |
| 58089 | PGWatch Prometheus | Database monitoring interface |
| 59090 | Prometheus | Metrics storage and queries |
| 59091 | PGWatch Prometheus | Metrics collection endpoint |

**Configure your firewall to:**
* Block public access to all monitoring ports
* Allow access only from trusted networks/IPs
* Use VPN or SSH tunnels for remote access

Example firewall configuration:
```bash
# Block public access to monitoring ports
sudo ufw deny 3000
sudo ufw deny 55000
sudo ufw deny 58080
sudo ufw deny 59090

# Allow access from trusted networks only
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 10.0.0.0/8 to any port 3000
```

Failure to secure these ports may expose sensitive database information!

## Database preparation

### Create monitoring user

Connect to your Postgres database as a superuser and run:

```sql
-- Create monitoring user
begin;

-- Create user with secure password
create user postgres_ai_mon with password '<your_secure_password>';

-- Grant database connection
grant connect on database <your_database_name> to postgres_ai_mon;

-- Grant monitoring permissions
grant pg_monitor to postgres_ai_mon;
grant select on pg_stat_statements to postgres_ai_mon;
grant select on pg_stat_database to postgres_ai_mon;
grant select on pg_stat_user_tables to postgres_ai_mon;

-- Create public view for pg_statistic access (required for bloat metrics)
create view public.pg_statistic as
select 
    n.nspname as schemaname,
    c.relname as tablename,
    a.attname,
    s.stanullfrac as null_frac,
    s.stawidth as avg_width,
    false as inherited
from pg_statistic s
join pg_class c on c.oid = s.starelid
join pg_namespace n on n.oid = c.relnamespace  
join pg_attribute a on a.attrelid = s.starelid and a.attnum = s.staattnum
where a.attnum > 0 and not a.attisdropped;

-- Grant access to the view
grant select on public.pg_statistic to pg_monitor;

-- Set search path
alter user postgres_ai_mon set search_path = "$user", public, pg_catalog;

commit;
```

### Enable pg_stat_statements extension

If not already enabled, add to your `postgresql.conf`:

```ini
# Add to postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
pg_stat_statements.max = 10000
```

Then restart Postgres and create the extension:

```sql
-- Connect to your database and run:
create extension if not exists pg_stat_statements;
```

### Configure pg_hba.conf

Add connection rules for the monitoring user:

```ini
# Add to pg_hba.conf (adjust IP ranges as needed)
host    <your_database>    postgres_ai_mon    <monitoring_server_ip>/32    md5
```

Reload Postgres configuration:
```bash
sudo systemctl reload postgresql
# or
select pg_reload_conf();
```

### Using access tokens

Once you have an access token, you can use it during installation:

```bash
# Production installation with access token
./postgres_ai quickstart --api-key=your_access_token

# Or add it to existing installation
./postgres_ai configure --api-key=your_access_token
```

The access token enables automatic upload of monitoring data for health check analysis by our team

> **Note:** Your database data remains securely within your infrastructure. Only aggregated metrics and performance statistics are shared with PostgresAI for analysis.

## postgres_ai installation

### Download the CLI

```bash
# Download the CLI tool
curl -o postgres_ai https://gitlab.com/postgres-ai/postgres_ai/-/raw/main/postgres_ai

# Make it executable
chmod +x postgres_ai

# Optional: Move to system PATH
sudo mv postgres_ai /usr/local/bin/
```

### Option 1: Demo installation

Perfect for testing and learning:

```bash
# Complete demo setup with synthetic data
./postgres_ai quickstart --demo
```

This creates:
- Demo Postgres database
- Pre-configured monitoring
- Sample data and queries
- All dashboards ready to explore

### Option 2: Production installation

For monitoring real databases:

```bash
# Basic interactive production setup
./postgres_ai quickstart --api-key=your_access_token

# Or with immediate database addition
./postgres_ai quickstart \
  --api-key=your_access_token \
  --add-instance="postgresql://postgres_ai_mon:password@host:port/database"
```

### Wait for initialization

The installation process will:
1. Download required Docker images
2. Start all monitoring services
3. Initialize databases
4. Configure dashboards
5. Begin collecting metrics


## Verification

### Check service status

```bash
# Verify all services are running
./postgres_ai status

# Check service logs
./postgres_ai logs
```

### Test database connections

```bash
# Test specific database connection
./postgres_ai test-instance my-database-name

# List all configured instances
./postgres_ai list-instances
```

### Verify data collection

After 5-10 minutes, you should see:
- Metrics appearing in Grafana dashboards
- Query statistics being collected

## Post-installation configuration

### Adding additional databases

```bash
# Add new database instance
./postgres_ai add-instance

# Test the new connection
./postgres_ai test-instance database-name
```

### Service management

```bash
# Restart all services
./postgres_ai restart

# View service logs
./postgres_ai logs

# Stop all services
./postgres_ai stop

# Start services
./postgres_ai start
```

## Access points

After successful installation:

### Primary interface
- **Grafana Dashboards**: http://localhost:3000
  - Contains all monitoring dashboards

### Technical interfaces (advanced users)
- **PGWatch Interface**: http://localhost:58080
- **Prometheus Metrics**: http://localhost:59090
- **Flask API**: http://localhost:55000
- **Demo Database** (if using `--demo`): postgresql://postgres:postgres@localhost:55432/target_database

## Troubleshooting

### Common issues

**Port conflicts:**
```bash
# Check if ports are already in use
netstat -tlnp | grep -E '(3000|55000|58080|59090)'

# Stop conflicting services or change ports in configuration
```

**Docker permission issues:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, or run:
newgrp docker
```

**Database connection failures:**
```bash
# Test database connectivity
psql "postgresql://postgres_ai_mon:password@host:port/database" -c "select 1;"

# Check pg_hba.conf and firewall rules
# Verify pg_stat_statements extension is installed
```

**Service startup issues:**
```bash
# Check Docker daemon
sudo systemctl status docker

# View detailed logs
./postgres_ai logs --follow

# Check disk space
df -h
```

### Getting help

```bash
# View all available commands
./postgres_ai help

# View configuration
./postgres_ai config
```

### Log locations

- **Service logs**: `./postgres_ai logs`
- **Docker logs**: `docker-compose logs`
- **System logs**: `/var/log/syslog` or `journalctl`


## Getting support

- **Documentation**: Check project README and monitoring guides
- **Issues**: Report problems via project issue tracker  
- **Professional Support**: Contact PostgresAI team for enterprise support

---

**Success!** Your postgres_ai monitoring solution is now ready to provide comprehensive Postgres monitoring and analysis.
