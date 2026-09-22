---
title: Teleport integration
sidebar_label: Teleport integration
description: Integrate DBLab Engine 4.1+ with Teleport for secure, audited, certificate-based access to Postgres database clones with role-based access control, including per-user clone access and custom resource labels (4.2+).
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
    volume: "/etc/dblab/certs:/certs:ro"
```

Cert files on the host must have uid 999 ownership before DBLab Engine starts, because the postgres user inside the container runs as uid 999.

:::danger Never mount into `/var/lib/postgresql/...`
Earlier versions of this guide used `/var/lib/postgresql/cert` as the container-side path. On Postgres 18+ images that directory is a Docker `VOLUME` (the official image moved it from `/var/lib/postgresql/data` to the parent directory in v18, and `extended-postgres` inherits it). A bind mount nested inside a Docker volume is deleted **on the host** when the clone container is removed with its anonymous volumes. Mount certs to a neutral path such as `/certs` instead. If you change the path on an existing setup, update the `ssl_*` values in `databaseConfigs` too and run a data refresh: the values are baked into the snapshot's Postgres config.
:::

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
    volume: "/etc/dblab/certs:/certs:ro"

databaseConfigs: &db_configs
  configs:
    ssl: "on"
    ssl_cert_file: "/certs/server.crt"
    ssl_key_file: "/certs/server.key"
    ssl_ca_file: "/certs/teleport-ca.crt"

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

### Custom resource labels (DBLab Engine 4.2+)

Every resource the sidecar registers carries the labels `dblab: "true"`, `dblab_instance: <environment-id>`, `environment: <environment-id>` and, for clones, `clone_id`. Add your own with the repeatable `--label key=value` flag (or the `TELEPORT_LABELS` environment variable) so DBLab clones fit the same access rules as your other databases:

```bash
dblab teleport serve ... --label environment=staging --label service=dblab
```

An operator-supplied `environment` label replaces the default. The reserved labels `dblab`, `dblab_instance`, `clone_id` and `dblab_user` cannot be overridden; the sidecar refuses to start if one is passed.

Clone IDs containing characters Teleport rejects in resource names are mapped to hyphens when the resource is created (4.2+); earlier versions failed to register such clones silently.

## Per-user clone access

By default, every Teleport user who holds a role granting access to DBLab resources can connect to **any** clone. Since DBLab Engine 4.2 the engine can label each clone with the identity of the user who created it, so that a Teleport role can limit each engineer to their own clones.

Enable clone binding in `server.yml`:

```yaml
platform:
  enablePersonalTokens: true   # required: the identity comes from the personal token
  bindClonesToUser: true
```

When `bindClonesToUser` is enabled, a clone created with a **personal token** is labeled `dblab_user: <email>`, the authenticated user's full email address, matching Teleport's `external.email`. The label is derived from the authenticated identity, not from any clone-create parameter, so a personal-token caller cannot label a clone as someone else. The clone's Postgres username is not changed, so existing connection strings, Joe and CI automation keep working.

Clones created with the shared `verificationToken` (for example CI pipelines or Joe) carry **no** `dblab_user` label by default. They are created normally, but are not reachable through a per-user role that matches on `dblab_user`; grant such callers access through a broader role.

A proxy that authenticates with the shared `verificationToken` on behalf of a known user (for example the PostgresAI Platform serving Console requests) can assert the acting user by sending the `X-Forwarded-User-Email` header; the engine then labels the clone as if that user had used a personal token. The header is ignored on personal-token requests and when authorization is disabled.

:::caution The label is only as trustworthy as the shared token
The engine accepts `X-Forwarded-User-Email` from **any** caller that presents the shared `verificationToken`; it cannot tell a trusted proxy from another token holder. Anyone holding that token (CI, Joe, the sidecar's own `--dblab-token`) can therefore create a clone attributed to any user. Keep the shared token on trusted proxies and automation you control, give people personal tokens, and do not treat `dblab_user` as an audit record of who created a clone unless every shared-token holder is trusted.
:::

Then give users a role that matches their own email:

```yaml
kind: role
version: v7
metadata:
  name: dblab-self-access
spec:
  allow:
    db_labels:
      dblab: ['true']
      dblab_user: ['{{external.email}}']
    db_names: ['*']
    db_users: ['*']
```

Users holding only this role see and connect to their own clones; the broader `dblab-user` role from the prerequisites keeps giving access to every clone, including unlabeled ones.

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
| Cert files disappear from the host after a clone is deleted | Certs mounted under `/var/lib/postgresql/...`, a Docker volume on PG 18+ images | Mount to a neutral path such as `/certs` (see step 7), update `ssl_*` paths, run a data refresh |
| Clone has no `dblab_user` label | Created with the shared token, or `bindClonesToUser` / `enablePersonalTokens` off | Use a personal token and enable both options in `platform` |
