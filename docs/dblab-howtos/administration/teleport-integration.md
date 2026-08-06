---
title: Teleport integration
sidebar_label: Teleport integration
description: Integrate DBLab Engine 4.1+ with Teleport for secure, audited, certificate-based access to Postgres database clones with role-based access control.
---

DBLab Engine 4.1 includes built-in integration with [Teleport](https://goteleport.com/), enabling secure, audited access to database clones through Teleport's access control. The integration works as a sidecar process that automatically registers and deregisters DBLab clones as Teleport database resources.

## Architecture

```
+--------------+   webhooks    +------------------+   tctl    +------------------+
| DBLab Engine |-------------->| dblab teleport   |---------->| Teleport Auth    |
| (Docker)     |               | serve (sidecar)  |           | Server           |
+--------------+               +------------------+           +------------------+
       |                                                             |
       | clone containers                                            |
       v                                                             v
+--------------+               +------------------+           +------------------+
| Clone PG     |<--------------| Teleport DB Agent|<----------| tsh proxy db     |
| (port 6000)  |   proxied     | (db_service)     |  tunnel   | (end user)       |
+--------------+               +------------------+           +------------------+
```

The sidecar:
- Receives `clone_create` / `clone_delete` webhooks from DBLab Engine
- Calls `tctl create` / `tctl rm` to register/deregister Teleport DB resources
- Runs startup reconciliation to catch missed events

The sidecar does **not** proxy database connections. A separate Teleport agent with `db_service` enabled handles the actual proxying.

## Prerequisites

### 1. Teleport bot role

Create a bot role with permissions to manage database resources:

```yaml
kind: role
version: v7
metadata:
  name: dblab-bot
spec:
  allow:
    db_labels:
      '*': '*'
    db_names: ['*']
    db_users: ['*']
    rules:
    - resources: [db, db_server]
      verbs: [list, create, read, update, delete]
    - resources: [app, app_server]
      verbs: [list, create, read, update, delete]
```

Apply with `tctl create -f dblab-bot-role.yaml`.

### 2. Teleport bot identity

Create a bot and generate the identity file. The role from step 1 must already exist before this step.

**Self-hosted Teleport:**
```bash
tctl bots add dblab-sidecar --roles=dblab-bot
tctl auth sign --format=tls --user=bot-dblab-sidecar -o /etc/teleport/dblab-identity
```

**Teleport Cloud:**
```bash
tctl bots add dblab-sidecar --roles=dblab-bot
# Use the token from the output above
tbot start --oneshot \
  --token=<TOKEN> \
  --proxy-server=yourcluster.teleport.sh:443 \
  --join-method=token \
  --data-dir=/etc/teleport/bot-data \
  --destination-dir=/etc/teleport/bot-dest
# The identity file is at /etc/teleport/bot-dest/identity
```

### 3. Teleport database agent

A Teleport agent must run on the DBLab host with `db_service` enabled:

```yaml
# /etc/teleport.yaml (on the DBLab host)
db_service:
  enabled: true
  resources:
  - labels:
      dblab: "true"
```

### 4. User role for database access

Teleport users who need to connect to DBLab clones need a role granting database access:

```yaml
kind: role
version: v7
metadata:
  name: dblab-user
spec:
  allow:
    db_labels:
      dblab: "true"
    db_names: ['*']
    db_users: ['*']
```

### 5. SSL/TLS for Postgres clones

Teleport always initiates TLS to backend databases. DBLab clones must have SSL enabled.

**Generate self-signed certs:**
```bash
openssl req -new -x509 -days 3650 -nodes \
  -out /etc/dblab/certs/server.crt \
  -keyout /etc/dblab/certs/server.key \
  -subj "/CN=dblab-clone"

chown 999:999 /etc/dblab/certs/server.crt /etc/dblab/certs/server.key
chmod 600 /etc/dblab/certs/server.key
```

**Export the Teleport DB CA certificate:**
```bash
tctl auth export --type=db-client > /etc/dblab/certs/teleport-ca.crt
chown 999:999 /etc/dblab/certs/teleport-ca.crt
```

### 6. pg_hba.conf — certificate authentication

Starting with DBLab Engine 4.1, the default `pg_hba.conf` includes a `hostssl ... cert` rule that enables Teleport certificate authentication out of the box:

```
local all all trust
hostssl all all 0.0.0.0/0 cert
host all all 0.0.0.0/0 md5
```

No custom `pg_hba.conf` or volume mount is required for Teleport.

### 7. Volume mounting for certs

Clone containers only inherit DBLab Engine container volumes whose source is under `poolManager.mountDir`. For SSL certs stored outside the pool, use `containerConfig`:

```yaml
databaseContainer: &db_container
  dockerImage: "postgresai/extended-postgres:16"
  containerConfig:
    "shm-size": 1gb
    volume: "/etc/dblab/certs:/var/lib/postgresql/cert:ro"
```

Cert files on the host must have uid 999 ownership before DBLab Engine starts, because the postgres user inside the container runs as uid 999.

### 8. Webhook URL — Docker networking

DBLab Engine runs inside Docker, so `localhost:9876` from within the Engine container resolves to the container itself, not the host.

Options:
- Use `host.docker.internal:9876` (Docker Desktop / Docker 20.10+)
- Use the Docker bridge IP (typically `172.17.0.1:9876`)
- Run the sidecar in the same Docker network as DBLab Engine

## Configuration

### DBLab Engine server.yml

Add SSL configuration and webhook settings:

```yaml
databaseContainer: &db_container
  dockerImage: "postgresai/extended-postgres:16"
  containerConfig:
    "shm-size": 1gb
    volume: "/etc/dblab/certs:/var/lib/postgresql/cert:ro"

databaseConfigs: &db_configs
  configs:
    ssl: "on"
    ssl_cert_file: "/var/lib/postgresql/cert/server.crt"
    ssl_key_file: "/var/lib/postgresql/cert/server.key"
    ssl_ca_file: "/var/lib/postgresql/cert/teleport-ca.crt"

webhooks:
  hooks:
    - url: "http://host.docker.internal:9876/teleport-sync"
      secret: "your-webhook-secret"
      trigger:
        - clone_create
        - clone_delete
```

:::tip
After adding or changing `databaseConfigs`, a data refresh is required. These settings are applied during snapshot creation. Existing snapshots are not affected.
:::

## Running the sidecar

```bash
dblab teleport serve \
  --environment-id production \
  --teleport-proxy teleport.example.com:3025 \
  --teleport-identity /etc/teleport/dblab-identity \
  --listen-addr 0.0.0.0:9876 \
  --dblab-url http://localhost:2345 \
  --dblab-token "$DBLAB_TOKEN" \
  --webhook-secret "$WEBHOOK_SECRET"
```

See the [CLI reference](/docs/reference-guides/dblab-client-cli-reference#command-teleport) for all available options.

## Connecting to a clone

Once everything is running, users connect through Teleport:

```bash
# Login to Teleport
tsh login --proxy=teleport.example.com

# List available databases (clones appear automatically)
tsh db ls

# Connect to a clone
tsh db connect dblab-clone-production-<clone-id>-6000 \
  --db-user postgres --db-name postgres

# Or use a local tunnel (works with any psql client)
tsh proxy db --tunnel dblab-clone-production-<clone-id>-6000
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Clone registered but can't connect | No Teleport DB agent running | Start `teleport` with `db_service.enabled: true` |
| TLS handshake failure | Clone doesn't have SSL enabled | Add `ssl: "on"` + cert paths to `databaseConfigs.configs` |
| "no pg_hba.conf entry" | Missing `hostssl ... cert` entry | Upgrade to DBLab Engine 4.1+ which includes this rule by default |
| "root certificate store not available" | Missing `ssl_ca_file` | Export Teleport DB CA with `tctl auth export --type=db-client` |
| SSL settings not applied to new clones | Snapshot created before SSL config | Trigger a data refresh to create a new snapshot |
| Webhook not received | Docker networking issue | Use `host.docker.internal` or bridge IP for webhook URL |
| Permission denied on cert files | Wrong file ownership | `chown 999:999` on cert files |
