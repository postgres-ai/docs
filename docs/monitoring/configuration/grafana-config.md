---
title: Grafana configuration
sidebar_label: Grafana
sidebar_position: 4
---

# Grafana configuration

Configuration for Grafana dashboards and visualization.

## Authentication

### Default credentials

Default admin credentials for the local Docker installation (set via
`GF_SECURITY_ADMIN_USER` / `GF_SECURITY_ADMIN_PASSWORD` in the compose file):

```
Username: monitor
Password: demo
```

The password is `${GF_SECURITY_ADMIN_PASSWORD:-demo}` — override it by setting
`GF_SECURITY_ADMIN_PASSWORD` in `.env`. On Helm, the admin username and password come from the
chart secret keys `grafana-admin-user` / `grafana-admin-password`.

:::warning
The default password `demo` is for local testing only. Always set a strong
`GF_SECURITY_ADMIN_PASSWORD` before any production or exposed deployment.
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

The stack provisions three data sources automatically (from
`config/grafana/provisioning/datasources/datasources.yml`). They are re-provisioned on every
startup (`editable: false`), so edit the provisioning file rather than the Grafana UI.

| Data source | Type | URL | Default |
|-------------|------|-----|---------|
| `PGWatch-Prometheus` | `prometheus` | `http://sink-prometheus:9090` | **Yes** |
| `PGWatch-PostgreSQL` | `postgres` | `sink-postgres:5432` (db `measurements`) | No |
| `Infinity` | `yesoreyeram-infinity-datasource` | — | No |

The default `PGWatch-Prometheus` source points at the single-node VictoriaMetrics instance
(`sink-prometheus`, internal port 9090) and uses basic auth from `VM_AUTH_USERNAME` /
`VM_AUTH_PASSWORD`:

```yaml
apiVersion: 1
datasources:
  - name: PGWatch-Prometheus
    type: prometheus
    access: proxy
    url: http://sink-prometheus:9090
    isDefault: true
    basicAuth: true
    basicAuthUser: ${VM_AUTH_USERNAME}
    secureJsonData:
      basicAuthPassword: ${VM_AUTH_PASSWORD}
    editable: false
```

### Adding additional data sources

Add entries to the source provisioning file
`config/grafana/provisioning/datasources/datasources.yml`:

```yaml
datasources:
  - name: PostgreSQL
    type: postgres
    url: host:5432
    database: db
    user: readonly_user
    secureJsonData:
      password: ${DB_PASSWORD}  # Use environment variable
```

The datasources file lives only in the `postgres_ai_configs` volume (Grafana reads it
read-only via `GF_PATHS_PROVISIONING`), and Grafana provisions datasources **only at
container startup**. `postgresai mon update-config` does **not** apply this change — it
regenerates the pgwatch `sources.yml` only, and does not reseed the volume or restart
Grafana. To apply a datasources edit, reseed the config volume (which requires recreating
`config-init` with `docker compose up -d` directly), then restart Grafana so it re-reads the
provisioned file:

```bash
docker compose run --rm --entrypoint rm config-init /target/.pgai-configs-version
docker compose up -d --force-recreate config-init  # recreate config-init -> reseed the volume with the edited file
postgresai mon restart grafana                     # restart Grafana so it re-provisions from the reseeded volume
```

Use `docker compose up -d` here, **not** `postgresai mon start`: because you are editing a live
stack, `mon start` sees the running containers, prints `Monitoring services are already running`,
and exits **without** running `docker compose up -d`, so `config-init` is never recreated and the
edited `datasources.yml` is never reseeded — the subsequent `mon restart grafana` would then
re-provision Grafana from the **old** volume contents. `mon restart` alone would not work either:
`docker compose restart` restarts the existing `config-init` container in place, but with the marker
already gone the reseed only runs when `config-init` is **recreated** by `docker compose up -d`.

## Dashboard provisioning

### Auto-loading dashboards

PostgresAI dashboards are provisioned automatically from
`config/grafana/provisioning/dashboards/dashboards.yml`, which loads the JSON files mounted at
`/postgres_ai_configs/grafana/dashboards`:

```yaml
apiVersion: 1
providers:
  - name: 'PostgresAI Dashboards'
    orgId: 1
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /postgres_ai_configs/grafana/dashboards
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
GF_USERS_DEFAULT_TIMEZONE=browser

# Use specific time zone
GF_USERS_DEFAULT_TIMEZONE=UTC
```

These set Grafana's `[users] default_timezone` setting (the env override for an ini setting is
`GF_<SECTION>_<KEY>`).

### Theme

New in 0.15, the bundled Grafana ships with **Desert Bloom** as the default theme. It is set in
the provisioned `grafana.ini`:

```ini
[users]
default_theme = desertbloom

[feature_toggles]
# Required for the bundled experimental themes (desertbloom, etc.)
enable = grafanaconThemes
```

The `grafanaconThemes` feature toggle is enabled by default in the stack so the theme is
available. To revert to a stock theme, override the default:

```bash
# Revert to the stock Grafana theme (overrides the [users] default_theme ini setting)
GF_USERS_DEFAULT_THEME=dark  # dark, light
```

:::note
`grafanaconThemes` must remain enabled for `desertbloom` to apply. If you disable it, set
`GF_USERS_DEFAULT_THEME` to `dark` or `light` to avoid falling back to an unavailable theme.
:::

### Refresh interval

Default auto-refresh:

```bash
GF_DASHBOARDS_DEFAULT_INTERVAL=15s
```

## Performance

:::note
The bundled stack ships a minimal `grafana.ini`
(`config/grafana/provisioning/grafana.ini`) that only sets `[analytics]`,
`[users]`, `[feature_toggles]`, `[auth]`, and `[auth.generic_oauth]` keys. The
`grafana.ini` examples below are **optional, generic Grafana customizations**,
not stack defaults — add them yourself if you need them.
:::

### Query caching

Grafana's built-in query result caching (`[caching]`) is a **Grafana Enterprise**
feature and is **not** available in the OSS `grafana/grafana` image the stack
ships. If you run Grafana Enterprise, enable it with:

```ini
[caching]
enabled = true
ttl = 60s
```

### Max data points

Grafana has **no `grafana.ini` key** that limits the number of points returned
per query. The point count is capped per panel by the **Max data points**
(`maxDataPoints`) query option, set in the panel editor under **Query options**
(or as `"maxDataPoints"` in the panel's dashboard JSON). When left empty, Grafana
auto-derives it from the panel's pixel width; lowering it reduces the resolution
(and cost) of each query:

```json
// In a panel's dashboard JSON
{
  "maxDataPoints": 500
}
```

### Concurrent queries

Size Grafana's own backend database connection pool (this governs connections to
Grafana's config/session database, not to your monitored Postgres):

```ini
[database]
max_open_conn = 100
```

## Embedding

The `[security]` settings below are **optional, generic Grafana customizations**
— the bundled `grafana.ini` does not set any `[security]` keys (admin
credentials are supplied via the `GF_SECURITY_*` env vars instead).

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

The stack installs one external plugin (via `GF_INSTALL_PLUGINS` in Docker Compose, or
`grafana.plugins` on Helm):

| Plugin | Purpose |
|--------|---------|
| `yesoreyeram-infinity-datasource` | Backs the `Infinity` data source used by some panels |

The remaining panel types used by the dashboards (stat, time series, table, heatmap) are built
into Grafana and require no extra plugins.

## Resource limits

### Memory

Grafana's memory limit is set with `mem_limit` (default 512 MiB), overridable via the
`GRAFANA_MEM` `.env` variable (bytes):

```bash
# .env — raise Grafana's memory limit to 1 GiB
GRAFANA_MEM=1073741824
```

See [Resource limits (per service)](/docs/monitoring/configuration#resource-limits-per-service).

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
