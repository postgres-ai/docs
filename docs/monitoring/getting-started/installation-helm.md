---
title: Helm installation
sidebar_label: Helm (Kubernetes)
sidebar_position: 5
---

# Helm installation

:::info Enterprise feature
Kubernetes deployment with Helm is available for Enterprise customers. [Contact us](https://postgres.ai/contact) to get started.
:::

Deploy PostgresAI monitoring on Kubernetes using Helm.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- `kubectl` configured for your cluster
- PostgreSQL 14+ target database (accessible from cluster)

## Quick start

```bash
# Add the postgres-ai Helm repository
helm repo add postgres-ai https://charts.postgres.ai
helm repo update

# Install with default values
helm install postgres-ai-monitoring postgres-ai/monitoring \
  --set target.host=your-postgres-host \
  --set target.port=5432 \
  --set target.database=your_database \
  --set target.user=pgwatch \
  --set target.password=your_password
```

## Configuration

### values.yaml overview

```yaml
# Target PostgreSQL connection
target:
  host: "postgres.default.svc.cluster.local"
  port: 5432
  database: "myapp"
  user: "pgwatch"
  password: ""  # Use secret instead
  existingSecret: ""  # Name of secret containing password

# Cluster identification
cluster:
  name: "production"
  nodeName: "primary"

# Grafana configuration
grafana:
  enabled: true
  replicas: 1
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi
  ingress:
    enabled: false
    hosts:
      - grafana.example.com
    tls: []
  adminPassword: ""  # Auto-generated if empty
  persistence:
    enabled: true
    size: 5Gi

# VictoriaMetrics configuration
victoriametrics:
  enabled: true
  replicas: 1
  retention: 90d
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 1000m
      memory: 1Gi
  persistence:
    enabled: true
    size: 50Gi

# pgwatch collector
pgwatch:
  enabled: true
  replicas: 1
  resources:
    requests:
      cpu: 50m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 256Mi
```

### Using Kubernetes secrets

For production, store credentials in a secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-ai-target
type: Opaque
stringData:
  password: "your-secure-password"
```

Reference in values:

```yaml
target:
  existingSecret: "postgres-ai-target"
  # passwordKey defaults to "password"
```

### Ingress configuration

Enable external access to Grafana:

```yaml
grafana:
  ingress:
    enabled: true
    className: nginx
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt
    hosts:
      - host: grafana.example.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: grafana-tls
        hosts:
          - grafana.example.com
```

## Installation commands

### Install with custom values

```bash
helm install postgres-ai-monitoring postgres-ai/monitoring \
  -f values.yaml \
  --namespace monitoring \
  --create-namespace
```

### Upgrade existing installation

```bash
helm upgrade postgres-ai-monitoring postgres-ai/monitoring \
  -f values.yaml \
  --namespace monitoring
```

### Uninstall

```bash
helm uninstall postgres-ai-monitoring --namespace monitoring
```

:::warning
Uninstalling removes all components including data. Back up VictoriaMetrics PVC if needed.
:::

## Accessing Grafana

### Port forward (development)

```bash
kubectl port-forward svc/postgres-ai-monitoring-grafana 3000:3000 -n monitoring
```

Open Grafana

### Get admin password

If not specified in values:

```bash
kubectl get secret postgres-ai-monitoring-grafana -n monitoring \
  -o jsonpath="{.data.admin-password}" | base64 --decode
```

## Multi-cluster monitoring

Monitor multiple PostgreSQL clusters from a single Grafana instance:

### Option 1: Multiple pgwatch deployments

```yaml
# values-cluster1.yaml
cluster:
  name: "prod-us-east"
pgwatch:
  enabled: true
grafana:
  enabled: false  # Disable for secondary clusters

# values-cluster2.yaml
cluster:
  name: "prod-us-west"
pgwatch:
  enabled: true
grafana:
  enabled: false
```

Install each:
```bash
helm install monitoring-us-east postgres-ai/monitoring -f values-cluster1.yaml
helm install monitoring-us-west postgres-ai/monitoring -f values-cluster2.yaml
```

### Option 2: Multi-target configuration

Configure pgwatch to scrape multiple databases:

```yaml
pgwatch:
  extraSources:
    - name: "staging-db"
      connstring: "postgresql://user:pass@staging-host:5432/db"
      cluster_name: "staging"
```

## Resource sizing

### Small (< 5 databases)

```yaml
grafana:
  resources:
    requests: { cpu: 100m, memory: 256Mi }
victoriametrics:
  resources:
    requests: { cpu: 100m, memory: 256Mi }
  persistence:
    size: 10Gi
```

### Medium (5-20 databases)

```yaml
grafana:
  resources:
    requests: { cpu: 200m, memory: 512Mi }
victoriametrics:
  resources:
    requests: { cpu: 500m, memory: 1Gi }
  persistence:
    size: 50Gi
```

### Large (20+ databases)

```yaml
grafana:
  resources:
    requests: { cpu: 500m, memory: 1Gi }
victoriametrics:
  resources:
    requests: { cpu: 1000m, memory: 4Gi }
  persistence:
    size: 200Gi
```

## Troubleshooting

### Pods not starting

Check events:
```bash
kubectl describe pod -l app=postgres-ai-monitoring -n monitoring
```

Common issues:
- PVC not provisioned (check storage class)
- Secret not found
- Resource limits too low

### No data in Grafana

1. Check pgwatch logs:
   ```bash
   kubectl logs -l app=pgwatch -n monitoring
   ```

2. Verify target connectivity:
   ```bash
   kubectl exec -it deploy/pgwatch -n monitoring -- \
     psql "postgresql://user:pass@host:5432/db" -c "SELECT 1"
   ```

3. Check VictoriaMetrics has data:
   ```bash
   kubectl port-forward svc/victoriametrics 8428:8428 -n monitoring
   curl 'http://localhost:8428/api/v1/query?query=up'
   ```

## Next steps

- [Cloud Installation](/docs/monitoring/getting-started/installation-cloud) - RDS, CloudSQL specifics
- [Alerting](/docs/monitoring/configuration/alerting) - Set up alerts
- [Multi-cluster](/docs/monitoring/advanced/multi-cluster) - Advanced multi-cluster setup
