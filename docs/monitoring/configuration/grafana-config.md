---
title: Grafana configuration
sidebar_label: Grafana
sidebar_position: 4
---

# Grafana configuration

Configuration for Grafana dashboards and visualization.

## Authentication

### Default credentials

Default admin credentials for local installation:

```
Username: admin
Password: admin
```

:::warning
Change the default password immediately after first login.
:::

### Disable anonymous access

```bash
GF_AUTH_ANONYMOUS_ENABLED=false
```

### LDAP/Active Directory

```ini
# grafana.ini
[auth.ldap]
enabled = true
config_file = /etc/grafana/ldap.toml
```

### OAuth/OIDC

```ini
[auth.generic_oauth]
enabled = true
name = OAuth
client_id = your-client-id
client_secret = your-client-secret
scopes = openid profile email
auth_url = https://auth.example.com/authorize
token_url = https://auth.example.com/token
api_url = https://auth.example.com/userinfo
```

## Data sources

### VictoriaMetrics data source

Automatically configured during installation:

```yaml
apiVersion: 1
datasources:
  - name: VictoriaMetrics
    type: prometheus
    url: http://victoriametrics:8428
    access: proxy
    isDefault: true
```

### Adding additional data sources

```yaml
datasources:
  - name: PostgreSQL
    type: postgres
    url: postgresql://host:5432/db
    user: readonly_user
    secureJsonData:
      password: ${DB_PASSWORD}  # Use environment variable
```

## Dashboard provisioning

### Auto-loading dashboards

PostgresAI dashboards are provisioned automatically:

```yaml
apiVersion: 1
providers:
  - name: postgres_ai
    folder: postgres_ai
    type: file
    options:
      path: /var/lib/grafana/dashboards/postgres_ai
```

### Custom dashboard folder

```bash
GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/var/lib/grafana/dashboards/custom/home.json
```

## Variables

### Default variable values

Override dashboard variable defaults:

```yaml
# In dashboard JSON
"templating": {
  "list": [
    {
      "name": "cluster_name",
      "current": {
        "value": "production"
      }
    }
  ]
}
```

### Variable refresh

Control when variables are refreshed:

| Setting | Behavior |
|---------|----------|
| On dashboard load | Refresh when dashboard opens |
| On time range change | Refresh when time picker changes |
| Never | Manual refresh only |

## Panel customization

### Time zone

```bash
# Use browser time zone
GF_DEFAULT_TIMEZONE=browser

# Use specific time zone
GF_DEFAULT_TIMEZONE=UTC
```

### Theme

```bash
GF_DEFAULT_THEME=dark  # dark, light
```

### Refresh interval

Default auto-refresh:

```bash
GF_DASHBOARDS_DEFAULT_INTERVAL=15s
```

## Performance

### Query caching

Enable query result caching:

```ini
[caching]
enabled = true
ttl = 60s
```

### Max data points

Limit data points returned per query:

```ini
[server]
router_logging = false
```

### Concurrent queries

```ini
[database]
max_open_conn = 100
```

## Embedding

### Allow embedding in iframes

```ini
[security]
allow_embedding = true
```

### CORS settings

```ini
[security]
cookie_samesite = none
cookie_secure = true
```

## Alerting

### Enable Grafana alerting

```ini
[unified_alerting]
enabled = true
```

### Disable classic alerting

```ini
[alerting]
enabled = false
```

See [Alerting configuration](/docs/monitoring/configuration/alerting) for alert rules.

## Plugins

### Install plugins

```bash
# Via environment variable
GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-piechart-panel

# Via CLI
grafana-cli plugins install grafana-clock-panel
```

### Required plugins

PostgresAI dashboards use these plugins:

| Plugin | Purpose |
|--------|---------|
| Stat panel | Single value displays |
| Time series | Metric charts |
| Table | Data grids |
| Heatmap | Wait event visualization |

## Resource limits

### Memory

```yaml
# docker-compose.yml
services:
  grafana:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Concurrent users

```ini
[server]
concurrent_render_request_limit = 30
```

## Backup and restore

### Backup dashboards

```bash
# Export all dashboards
for uid in $(curl -s http://monitor:YOUR_PASSWORD@localhost:3000/api/search | jq -r '.[].uid'); do
  curl -s "http://monitor:YOUR_PASSWORD@localhost:3000/api/dashboards/uid/$uid" > "dashboard-$uid.json"
done
```

### Restore dashboards

```bash
for file in dashboard-*.json; do
  curl -X POST -H "Content-Type: application/json" \
    -d @"$file" \
    http://monitor:YOUR_PASSWORD@localhost:3000/api/dashboards/db
done
```

## Troubleshooting

### Check data source connectivity

```bash
curl http://localhost:3000/api/datasources/proxy/1/api/v1/query?query=up
```

### Debug panel queries

1. Open panel edit mode
2. Click "Query Inspector"
3. Review raw query and response

### Common issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No data | Data source misconfigured | Check data source URL and credentials |
| Slow dashboards | Too many panels | Reduce time range or panel count |
| Login loop | Cookie issues | Clear cookies, check cookie_samesite |
