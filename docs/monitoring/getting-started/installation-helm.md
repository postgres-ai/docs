---
title: Helm installation
sidebar_label: Helm (Kubernetes)
sidebar_position: 5
---

# Helm installation

:::info Positioned for production / Enterprise
Kubernetes deployment with Helm is the recommended path for production and Enterprise use. The chart
is self-service and the full procedure is below; for dedicated support, SLAs, and managed rollout,
[contact us](https://postgres.ai/contact).
:::

Deploy PostgresAI monitoring on Kubernetes using Helm.

:::info 0.15 chart defaults
The Helm chart defaults have been prepared for PostgresAI 0.15 — review updated chart values
before upgrading. Two things to note when moving to 0.15:

- **VictoriaMetrics basic auth** is available but **off by default** (`victoriaMetrics.auth.enabled: false`).
  To protect the VictoriaMetrics endpoint, set `victoriaMetrics.auth.enabled: true` and supply the
  password — see [VictoriaMetrics authentication](#victoriametrics-authentication) below.
- **Metrics retention** is set with `victoriaMetrics.retentionPeriod`, which defaults to `336h`
  (14 days) — the same default as the Docker Compose stack. Set it explicitly to match your plan.
:::

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- `kubectl` configured for your cluster
- PostgreSQL 13+ (14+ recommended) target database (accessible from cluster)

## Quick start

Monitored databases are configured as a list under `monitoredDatabases`, and their passwords
come from a Kubernetes secret (never inline). The minimal flow is:

```bash
# 1. Create the namespace
kubectl create namespace postgres-ai-mon

# 2. Create the secret holding the sink, Grafana, and per-database passwords
kubectl create secret generic postgres-ai-monitoring-secrets \
  --namespace postgres-ai-mon \
  --from-literal=postgres-password='SINK_POSTGRES_PASSWORD' \
  --from-literal=grafana-admin-user='monitor' \
  --from-literal=grafana-admin-password='GRAFANA_PASSWORD' \
  --from-literal=pgai-api-key='POSTGRES_AI_API_KEY' \
  --from-literal=db-password-my-db-password='DB_PASSWORD'

# 3. Install the chart from a repository checkout
git clone https://gitlab.com/postgres-ai/postgresai.git && cd postgresai
helm install postgres-ai-monitoring ./postgres_ai_helm \
  --namespace postgres-ai-mon \
  --values custom-values.yaml
```

Installing from the chart directory in a repository checkout (the command above) works against
any tag or branch and is the most reliable option.

If you prefer a packaged `.tgz`, the chart is published as a release asset under a `helm-v<version>`
tag. Once the matching release exists (for example `helm-v0.15.0`), open its
[Releases page](https://gitlab.com/postgres-ai/postgresai/-/releases) and download the
`postgres-ai-monitoring-chart.tgz` asset from that release, then install it:

```bash
helm install postgres-ai-monitoring postgres-ai-monitoring-chart.tgz \
  --namespace postgres-ai-mon \
  --values custom-values.yaml
```

:::note
The packaged chart is registered as a generic release-asset link, so use the **Releases page**
asset for the tag to obtain its download URL. There is no stable
`/-/releases/<tag>/downloads/<file>` permalink for it. The `helm-v0.15.0` release may not be cut
yet at the time of reading — in that case use the repository-checkout install above.
:::

The secret key for each monitored database must be named `db-password-<passwordSecretKey>`,
where `<passwordSecretKey>` matches the `passwordSecretKey` set on that database in
`monitoredDatabases` (see below).

## Configuration

### values.yaml overview

The chart configures monitored databases as a **list** (`monitoredDatabases`), not a single
`target`. Cluster/node identity comes from `global.clusterName` / `global.nodeName` (with optional
per-database overrides), and all credentials live in a Kubernetes secret. The keys below match
the chart's `values.yaml` exactly:

```yaml
# Top-level secret reference (recommended). When set, the chart reads all
# credentials (postgres, grafana, vm-auth, per-database passwords) from this secret.
existingSecret:
  name: postgres-ai-monitoring-secrets

# Cluster/node identity applied to all monitored databases by default
global:
  clusterName: my-cluster
  nodeName: my-node
  customTags: {}

# Databases to monitor (a list). Passwords are referenced by secret key, never inline.
monitoredDatabases:
  - name: my-db
    host: db-host.example.com
    port: 5432
    database: postgres
    user: postgres_ai_mon
    passwordSecretKey: my-db-password   # secret key: db-password-my-db-password
    presetMetrics: full
    customMetrics: {}
    isEnabled: true
    group: production
    # Optional per-database overrides:
    # clusterName: prod-us-east
    # nodeName: node-02
    customTags:
      env: production

# VictoriaMetrics configuration
victoriaMetrics:
  image: victoriametrics/victoria-metrics:v1.140.0
  retentionPeriod: 336h  # default 336h (14 days); same as the Docker stack — set to match your plan
  scrapeInterval: 15s
  # VictoriaMetrics basic auth (optional in 0.15; off by default). The VictoriaMetrics
  # StatefulSet, Flask, and the reporter read the password from the chart secret key
  # `vm-auth-password`; the Grafana datasource instead reads the inline value
  # `secrets.vmAuth.password`, so enabling auth requires supplying both (see below).
  auth:
    enabled: false
    username: "vmauth"
  service:
    type: ClusterIP
    port: 8428
  resources: {}

# pgwatch collectors. Two deployments are shipped: one writing to the Postgres
# sink and one writing to the Prometheus (VictoriaMetrics) sink. Each runs a
# single replica.
pgwatchPostgres:
  enabled: true
  image: postgresai/pgwatch:0.15.0
  logLevel: error
  resources: {}

pgwatchPrometheus:
  enabled: true
  image: postgresai/pgwatch:0.15.0
  logLevel: error
  resources: {}

# Grafana is the upstream grafana/grafana subchart. Admin credentials come from
# the secret via grafana.admin; persistence/service/ingress are subchart values.
grafana:
  enabled: true
  image:
    repository: grafana/grafana
    tag: "12.3.2"
  admin:
    existingSecret: postgres-ai-monitoring-secrets
    userKey: grafana-admin-user
    passwordKey: grafana-admin-password
  persistence:
    enabled: true
    size: 5Gi
  service:
    type: ClusterIP
    port: 80

# Persistent volume sizing
storage:
  postgresSize: 50Gi
  victoriaMetricsSize: 150Gi
  grafanaSize: 5Gi
  storageClassName: ""   # empty = cluster default
```

:::note Subchart-managed Grafana
`grafana` is the upstream [grafana/grafana](https://github.com/grafana/helm-charts) subchart, so
its resource requests/limits, ingress, and replica count are configured with that subchart's own
values (for example `grafana.resources`). The PostgresAI chart only pins `grafana.image`,
`grafana.admin`, `grafana.persistence`, `grafana.service`, and the dashboard/datasource sidecars.
There is no top-level `grafana.adminPassword` value — set the admin password in the secret
(`grafana-admin-password`).
:::

### Using Kubernetes secrets

For production, store all credentials in a single Kubernetes secret and reference it with the
top-level `existingSecret`. The chart reads these keys:

| Secret key | Used for |
|------------|----------|
| `postgres-password` | Internal Postgres metrics sink |
| `grafana-admin-user` | Grafana admin username |
| `grafana-admin-password` | Grafana admin password |
| `pgai-api-key` | PostgresAI platform API key (reporter) |
| `vm-auth-password` | VictoriaMetrics basic auth (when `victoriaMetrics.auth.enabled: true`) |
| `db-password-<passwordSecretKey>` | Password for each monitored database |

```bash
kubectl create secret generic postgres-ai-monitoring-secrets \
  --namespace postgres-ai-mon \
  --from-literal=postgres-password='...' \
  --from-literal=grafana-admin-user='monitor' \
  --from-literal=grafana-admin-password='...' \
  --from-literal=pgai-api-key='...' \
  --from-literal=db-password-my-db-password='...'
```

Reference it in values:

```yaml
existingSecret:
  name: postgres-ai-monitoring-secrets
```

:::note Development only
For development/testing, the chart can render the secret from values by setting
`secrets.createFromValues: true` and supplying `secrets.postgres.password`,
`secrets.grafana.adminPassword`, etc. **Never commit real secrets to version control.**
:::

### VictoriaMetrics authentication

New in 0.15, VictoriaMetrics can be protected with HTTP basic auth. It is **off by default**
(`victoriaMetrics.auth.enabled: false`); enable it to secure the metrics endpoint. When enabled,
the VictoriaMetrics StatefulSet, the Flask backend, and the reporter read the password from the
chart secret key **`vm-auth-password`** (via `secretKeyRef`).

:::warning The Grafana datasource reads the password from an inline value, not the secret
The Grafana datasource ConfigMap is the exception: it renders `basicAuthPassword` from the
**inline** chart value `secrets.vmAuth.password`, **not** from the `vm-auth-password` secret key.
So when `victoriaMetrics.auth.enabled: true`, you must also supply `secrets.vmAuth.password` (for
example via `secrets.createFromValues: true`, or by setting it directly) — otherwise the datasource
is rendered with the unset placeholder default (`CHANGE_ME_vm_auth_password`), Grafana cannot
authenticate to VictoriaMetrics, and all dashboards show no data. Putting the password only in the
pre-created `existingSecret` is enough for VictoriaMetrics, Flask, and the reporter, but **not** for
the Grafana datasource.
:::

Turn it on in values:

```yaml
victoriaMetrics:
  auth:
    enabled: true
    username: "vmauth"   # default
```

Provide the `vm-auth-password` value through the chart's secret. For production, store it in a
pre-created Kubernetes secret and reference it via the top-level `existingSecret` (the same secret
also holds the Postgres and Grafana credentials):

```bash
kubectl create secret generic postgres-ai-monitoring-secrets \
  --namespace postgres-ai-mon \
  --from-literal=postgres-password='...' \
  --from-literal=grafana-admin-user='monitor' \
  --from-literal=grafana-admin-password='...' \
  --from-literal=vm-auth-password='your-vm-auth-secret'
```

```yaml
existingSecret:
  name: postgres-ai-monitoring-secrets
```

For development/testing only, the chart can render the secret from values
(`secrets.createFromValues: true`):

```yaml
secrets:
  createFromValues: true   # never commit real secrets to version control
  vmAuth:
    password: "your-vm-auth-secret"
```

This mirrors the `VM_AUTH_USERNAME` / `VM_AUTH_PASSWORD` keys used by the Docker Compose stack —
see [Authentication and security](/docs/monitoring/configuration/prometheus-config#authentication-and-security).

### Ingress configuration

External access to Grafana is configured with the chart's **top-level** `ingress` block (enabled
by default). The host is set under `ingress.hosts.grafana`:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
  hosts:
    grafana: grafana.example.com
  tls:
    - secretName: grafana-tls
      hosts:
        - grafana.example.com
```

:::note
This is the chart's own `ingress` value, not the Grafana subchart's. The subchart's
`grafana.ingress` is disabled by default and is not used by this stack.
:::

## Installation commands

### Install with custom values

```bash
# postgres-ai-monitoring-chart.tgz is the release artifact from GitLab Releases (see Quick start),
# or use ./postgres_ai_helm from a repository checkout
helm install postgres-ai-monitoring postgres-ai-monitoring-chart.tgz \
  -f custom-values.yaml \
  --namespace postgres-ai-mon \
  --create-namespace
```

### Upgrade existing installation

```bash
helm upgrade postgres-ai-monitoring postgres-ai-monitoring-chart.tgz \
  -f custom-values.yaml \
  --namespace postgres-ai-mon
```

### Uninstall

```bash
helm uninstall postgres-ai-monitoring --namespace postgres-ai-mon
```

:::warning
Uninstalling removes all components including data. Back up VictoriaMetrics PVC if needed.
:::

## Accessing Grafana

### Port forward (development)

The Grafana subchart's service listens on port 80:

```bash
kubectl port-forward svc/postgres-ai-monitoring-grafana 3000:80 -n postgres-ai-mon
```

Then open `http://localhost:3000`.

### Get admin credentials

The admin username and password come from the chart secret (keys `grafana-admin-user` /
`grafana-admin-password`):

```bash
kubectl get secret postgres-ai-monitoring-secrets -n postgres-ai-mon \
  -o jsonpath="{.data.grafana-admin-password}" | base64 --decode
```

## Multi-cluster monitoring

Monitor multiple PostgreSQL clusters from a single installation by adding entries to
`monitoredDatabases`. Set `clusterName` / `nodeName` per database to tag each one; if omitted,
they inherit `global.clusterName` / `global.nodeName`. The reporter creates a separate cronjob
for each unique cluster/node combination.

```yaml
global:
  clusterName: default
  nodeName: default

monitoredDatabases:
  - name: prod-us-east
    host: db-east.example.com
    port: 5432
    database: postgres
    user: postgres_ai_mon
    passwordSecretKey: prod-us-east-password
    presetMetrics: full
    isEnabled: true
    group: production
    clusterName: prod-us-east
    nodeName: node-01

  - name: prod-us-west
    host: db-west.example.com
    port: 5432
    database: postgres
    user: postgres_ai_mon
    passwordSecretKey: prod-us-west-password
    presetMetrics: full
    isEnabled: true
    group: production
    clusterName: prod-us-west
    nodeName: node-01
```

Add a matching `db-password-<passwordSecretKey>` key to the secret for each database.

## Resource sizing

### Small (< 5 databases)

```yaml
grafana:
  resources:
    requests: { cpu: 100m, memory: 256Mi }
victoriaMetrics:
  resources:
    requests: { cpu: 100m, memory: 256Mi }
storage:
  victoriaMetricsSize: 10Gi
```

### Medium (5-20 databases)

```yaml
grafana:
  resources:
    requests: { cpu: 200m, memory: 512Mi }
victoriaMetrics:
  resources:
    requests: { cpu: 500m, memory: 1Gi }
storage:
  victoriaMetricsSize: 50Gi
```

### Large (20+ databases)

```yaml
grafana:
  resources:
    requests: { cpu: 500m, memory: 1Gi }
victoriaMetrics:
  resources:
    requests: { cpu: 1000m, memory: 4Gi }
storage:
  victoriaMetricsSize: 200Gi
```

## Troubleshooting

### Pods not starting

Check events:
```bash
kubectl describe pod -l app.kubernetes.io/instance=postgres-ai-monitoring -n postgres-ai-mon
```

Common issues:
- PVC not provisioned (check storage class)
- Secret not found (check `existingSecret.name` and the `db-password-*` keys)
- Resource limits too low

### No data in Grafana

1. Check the pgwatch collector logs (two deployments: `-pgwatch-postgres` and
   `-pgwatch-prometheus`):
   ```bash
   kubectl logs -l app.kubernetes.io/component=pgwatch-prometheus -n postgres-ai-mon
   ```

2. Verify target connectivity. The pgwatch image is a minimal Alpine build
   with only the collector binary (no `psql`), so run the check from a throwaway
   `postgres:17` pod instead of `kubectl exec` into the pgwatch pod:
   ```bash
   kubectl run pg-check --rm -it --image=postgres:17 --restart=Never -n postgres-ai-mon -- \
     psql "postgresql://user:pass@host:5432/db" -c "SELECT 1"
   ```
   (If you prefer not to spin up a pod, the collector logs from step 1 already
   surface connection errors.)

3. Check VictoriaMetrics has data:
   ```bash
   kubectl port-forward svc/postgres-ai-monitoring-victoriametrics 8428:8428 -n postgres-ai-mon
   curl 'http://localhost:8428/api/v1/query?query=up'
   ```

## Next steps

- [Cloud Installation](/docs/monitoring/getting-started/installation-cloud) - RDS, CloudSQL specifics
- [Alerting](/docs/monitoring/configuration/alerting) - Set up alerts
- [Multi-cluster](/docs/monitoring/advanced/multi-cluster) - Advanced multi-cluster setup
