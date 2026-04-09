---
title: Teleport Integration
sidebar_label: Teleport Integration
---

Integrate DBLab Engine with [Gravitational Teleport](https://goteleport.com) to provide secure, audited access to database clones. When a clone is created or destroyed, the DBLab Teleport sidecar automatically registers or deregisters it in your Teleport cluster — no manual resource management required.

:::note
Teleport integration is available in **Standard** and **Enterprise** editions of DBLab Engine only.
:::

## Overview

The `dblab teleport serve` sidecar runs alongside DBLab Engine and performs two functions:

1. **Webhook handler** — Listens for clone lifecycle events (`clone_create`, `clone_delete`) from DBLab Engine and creates/removes corresponding Teleport database resources via `tctl`.
2. **Reconciliation loop** — Periodically (every 5 minutes) queries DBLab Engine for active clones and ensures Teleport resources are in sync, catching any missed webhook events.

The sidecar also registers the DBLab Engine API itself as a Teleport App resource, giving administrators access to the DBLab UI through Teleport.

The sidecar does **not** proxy database connections. A separate Teleport agent with `db_service` enabled handles the actual proxying.

## Prerequisites

Before setting up the integration, ensure:

- **DBLab Engine** (Standard or Enterprise edition) is installed and running
- **Teleport cluster** (v14+) with the database service enabled
- **Teleport Database Agent** running on the DBLab host with `db_service` enabled (see [Step 1](#step-1-configure-the-teleport-database-agent))
- **`dblab` CLI** — required to run the Teleport sidecar (`dblab teleport serve`). See [Install and initialize Database Lab CLI](/docs/dblab-howtos/cli/cli-install-init).
- **`tctl` binary** available on the DBLab Engine host
- **Teleport identity file** — a bot identity file with permissions to create/delete `db`, `db_server`, `app`, and `app_server` resources (see [Step 2](#step-2-create-the-bot-role-and-generate-a-teleport-identity-file))
- **PostgreSQL SSL** enabled on clones — Teleport's database service requires SSL even with `tls: mode: insecure` (it skips certificate *verification*, not TLS itself) (see [Step 3](#step-3-enable-ssl-on-postgresql-clones))

## Step 1: Configure the Teleport Database Agent

The sidecar only registers DB resources via `tctl` — it does **not** proxy connections. A Teleport agent must run on the DBLab host with `db_service` enabled and dynamic resource matching.

If you don't have a Teleport agent running on the DBLab host yet, follow the [Teleport Database Access guide](https://goteleport.com/docs/enroll-resources/database-access/getting-started/) to install and join the agent to your cluster.

Once the agent is joined, add the following `db_service` section to your existing `/etc/teleport.yaml` (do not replace the entire file — keep the `proxy_server` and other settings generated during agent setup):

```yaml
db_service:
  enabled: true
  resources:
  - labels:
      dblab: "true"
```

This tells the agent to proxy connections for any DB resource with the `dblab: "true"` label (which the sidecar sets automatically).

:::note
For **Teleport Cloud**, ensure `auth_service` and `proxy_service` are disabled in your `/etc/teleport.yaml`, since these are provided by the cloud cluster:

```yaml
auth_service:
  enabled: false

proxy_service:
  enabled: false
```
:::

Restart the agent after changing the config (`systemctl restart teleport`).

## Step 2: Create the bot role and generate a Teleport identity file

The bot role must be created **before** generating the bot identity, because the identity captures the role's permissions at generation time.

### Create the bot role

Save the following as `dblab-bot-role.yaml`:

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

If you're using Teleport Cloud or running `tctl` from a machine without a local auth service, log in first with `tsh login --proxy=yourcluster.teleport.sh:443`.

Apply with `tctl create -f dblab-bot-role.yaml`.

### Generate the identity

:::caution
The role from the previous step must already exist before generating the identity. If the role is created or updated after the identity is generated, regenerate the identity to pick up the new permissions.
:::

**Self-hosted Teleport:**

```bash
tctl bots add dblab-sidecar --roles=dblab-bot
tctl auth sign --format=tls --user=bot-dblab-sidecar -o /etc/dblab/teleport-identity-dir/identity
```

**Teleport Cloud** (`tctl auth sign` is not available):

```bash
tctl bots add dblab-sidecar --roles=dblab-bot
```

`<TOKEN>` in the commands below is the join token printed by `tctl bots add`. If you no longer have it, generate a new one with `tctl bots instances add dblab-sidecar`.

**For testing only** — generate a one-time identity (expires in ~1 hour):

```bash
# Use the token from the output above
tbot start --oneshot \
  --token=<TOKEN> \
  --proxy-server=yourcluster.teleport.sh:443 \
  --join-method=token \
  --data-dir=/etc/teleport/bot-data \
  --destination-dir=/etc/dblab/teleport-identity-dir
# The identity file is at /etc/dblab/teleport-identity-dir/identity
```

:::caution
`tbot --oneshot` generates credentials valid for approximately 1 hour. After expiry, the sidecar silently fails (returns HTTP 500 to webhooks) and can no longer register or deregister clones. For production, run `tbot` as a persistent service — see below.
:::

**For production** — run `tbot` as a systemd service so it continuously renews credentials:

Create `/etc/tbot.yaml`:

```yaml
version: v2
proxy_server: yourcluster.teleport.sh:443
onboarding:
  join_method: token
  token: <TOKEN>
storage:
  type: directory
  path: /var/lib/tbot
outputs:
  - type: identity
    destination:
      type: directory
      path: /etc/dblab/teleport-identity-dir
```

Then start `tbot` as a service. If `tbot` was installed via the Teleport install script or `teleport-update`, the systemd unit is created automatically. Otherwise, create one manually. In daemon mode, `tbot` renews the identity before it expires — the sidecar always reads fresh credentials from the output directory.

See the [Teleport Machine ID deployment guide](https://goteleport.com/docs/machine-workload-identity/deployment/linux/) for detailed instructions.

The identity file for the sidecar is at `/etc/dblab/teleport-identity-dir/identity`.

## Step 3: Enable SSL on PostgreSQL clones

DBLab clones must have SSL enabled for Teleport to connect.

### Generate self-signed certificates

```bash
mkdir -p /etc/dblab/certs
openssl req -new -x509 -days 3650 -nodes \
  -out /etc/dblab/certs/server.crt \
  -keyout /etc/dblab/certs/server.key \
  -subj "/CN=dblab-clone"

# Certs must be owned by postgres user (uid 999 inside the container)
chown 999:999 /etc/dblab/certs/server.crt /etc/dblab/certs/server.key
chmod 600 /etc/dblab/certs/server.key
# Directory must be traversable by the postgres user
chmod 755 /etc/dblab/certs
```

### Export the Teleport DB CA certificate

PostgreSQL needs the Teleport CA certificate to verify client certificates presented by the Teleport DB agent. Without `ssl_ca_file`, the `cert` auth method in `pg_hba.conf` fails with "root certificate store not available".

```bash
tctl auth export --type=db-client > /etc/dblab/certs/teleport-ca.crt
chown 999:999 /etc/dblab/certs/teleport-ca.crt
```

### Add SSL settings to server.yml

```yaml
databaseConfigs: &db_configs
  configs:
    ssl: "on"
    ssl_cert_file: "/var/lib/postgresql/cert/server.crt"
    ssl_key_file: "/var/lib/postgresql/cert/server.key"
    ssl_ca_file: "/var/lib/postgresql/cert/teleport-ca.crt"
```

:::note
These settings are applied during snapshot creation (with promotion enabled) and baked into `postgresql.dblab.snapshot.conf`. Existing snapshots are not affected — a new snapshot must be created after changing `databaseConfigs`.
:::

:::caution
The `promotion` section in your `retrieval` config must have `enabled: true` for `databaseConfigs` to take effect. With promotion disabled, snapshots are taken without starting PostgreSQL, so `databaseConfigs` (including SSL settings) are never applied.
:::

### Mount certificates into clone containers

Clone containers only inherit DLE container volumes whose source is under `poolManager.mountDir`. For SSL certs stored outside the pool, use `containerConfig`:

```yaml
databaseContainer: &db_container
  dockerImage: "postgresai/extended-postgres:16"
  containerConfig:
    "shm-size": 1gb
    volume: "/etc/dblab/certs:/var/lib/postgresql/cert:ro"
```

:::caution
Cert files on the host must have uid 999 ownership *before* DLE starts, because the postgres user inside the container runs as uid 999.
:::

### pg_hba.conf — Certificate Authentication

Starting with DLE 4.1.0, the default `pg_hba.conf` includes a `hostssl ... cert` rule that enables Teleport certificate authentication out of the box:

```
local all all trust
hostssl all all 0.0.0.0/0 cert
host all all 0.0.0.0/0 md5
```

No custom `pg_hba.conf` or volume mount is required for Teleport.

**How rule evaluation works:**
- PostgreSQL evaluates `pg_hba.conf` top to bottom and uses the first matching rule.
- `hostssl ... cert` matches SSL connections and requires a client certificate. Teleport always connects over SSL with a client certificate, so this rule handles Teleport connections.
- `host ... md5` matches both SSL and non-SSL connections. Non-SSL password connections (e.g., `sslmode=disable`) skip the `hostssl` rule and match here.

:::note
SSL connections *without* a client certificate (e.g., `sslmode=require` with password auth only) will be matched by the `hostssl ... cert` rule and rejected. Clients that do not use Teleport should connect with `sslmode=disable` or `sslmode=prefer` (which falls back to non-SSL when cert auth fails).
:::

## Step 4: Start the Teleport sidecar

Run the sidecar using the `dblab` CLI:

```bash
dblab teleport serve \
  --environment-id prod \
  --teleport-proxy teleport.example.com:443 \
  --teleport-identity /etc/dblab/teleport-identity-dir/identity \
  --dblab-url http://localhost:2345 \
  --dblab-token "$DBLAB_TOKEN" \
  --webhook-secret "$WEBHOOK_SECRET" \
  --listen-addr 0.0.0.0:9876
```

### Configuration flags

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--environment-id` | Yes | — | Identifier for this DBLab environment (used in Teleport resource names) |
| `--teleport-proxy` | Yes | — | Teleport proxy address (e.g., `teleport.example.com:443`) |
| `--teleport-identity` | Yes | — | Path to the `tctl` identity file |
| `--dblab-url` | No | `http://localhost:2345` | DBLab Engine API URL |
| `--dblab-token` | Yes | — | DBLab Engine verification token (env: `DBLAB_TOKEN`) |
| `--tctl-path` | No | `tctl` | Path to the `tctl` binary |
| `--webhook-secret` | Yes | — | Shared secret that DBLab Engine sends in the `DBLab-Webhook-Token` header (env: `WEBHOOK_SECRET`) |
| `--listen-addr` | No | `localhost:9876` | HTTP listen address for webhook endpoint |

### Running as a systemd service

For production deployments, create a systemd unit.

First, create the environment file with secrets:

```bash
sudo mkdir -p /etc/dblab-teleport
cat <<EOF | sudo tee /etc/dblab-teleport/env
DBLAB_TOKEN=your-dblab-verification-token
WEBHOOK_SECRET=your-webhook-secret
EOF
sudo chmod 600 /etc/dblab-teleport/env
```

:::caution
Never put secrets directly in `ExecStart` arguments — they are visible to all users via `/proc` and `ps aux`. Use `EnvironmentFile=` as shown below.
:::

Then save the following as `/etc/systemd/system/dblab-teleport-sidecar.service`:

```ini
[Unit]
Description=DBLab Teleport Sidecar
After=network.target dblab.service

[Service]
Type=simple
EnvironmentFile=/etc/dblab-teleport/env
ExecStart=/usr/local/bin/dblab teleport serve \
  --environment-id prod \
  --teleport-proxy teleport.example.com:443 \
  --teleport-identity /etc/dblab/teleport-identity-dir/identity \
  --dblab-url http://localhost:2345 \
  --dblab-token ${DBLAB_TOKEN} \
  --webhook-secret ${WEBHOOK_SECRET} \
  --listen-addr 0.0.0.0:9876
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now dblab-teleport-sidecar
```

## Step 5: Configure DBLab Engine webhooks

Configure DBLab Engine to send webhook notifications to the sidecar for real-time clone sync. Add to your `server.yml`:

```yaml
webhooks:
  hooks:
    - url: "http://172.17.0.1:9876/teleport-sync"
      secret: "YOUR_WEBHOOK_SECRET"
      trigger:
        - clone_create
        - clone_delete
```

:::note
DBLab Engine runs inside Docker, so `localhost:9876` from within the Engine container resolves to the container itself, not the host. Use the Docker bridge gateway IP (`172.17.0.1` by default) or `host.docker.internal:9876`. Note that `host.docker.internal` only resolves automatically on Docker Desktop (macOS/Windows); on Linux, you must either use the bridge IP or launch the DLE container with `--add-host=host.docker.internal:host-gateway`. The sidecar should listen on `0.0.0.0:9876` (not `localhost:9876`) if containers need to reach it.
:::

Without webhooks, the sidecar still works — it will pick up new/deleted clones during the next reconciliation cycle (within 5 minutes).

## Step 6: Verify the setup

### Create a test clone

```bash
dblab clone create \
  --username testuser \
  --dbname postgres \
  --id test-clone
```

### Check Teleport resources

After the clone is created (immediately with webhooks, or within 5 minutes via reconciliation):

```bash
tctl get db --format=text
```

You should see a database resource named `dblab-clone-<environment-id>-<clone-id>-<port>`.

### Check the DBLab API app

The sidecar also registers the DBLab Engine API as a Teleport application:

```bash
tctl get app --format=text
```

You should see an app named `dblab-api-<environment-id>`.

## User guide: Connecting to clones via Teleport

Give this section to your users so they can connect to DBLab clones through Teleport.

### Prerequisites for users

- [Teleport client (`tsh`)](https://goteleport.com/docs/installation/) installed
- Teleport credentials (login to your cluster)
- Database access permissions in Teleport RBAC

### 1. Log in to Teleport

```bash
tsh login --proxy=teleport.example.com:443
```

### 2. List available DBLab clones

```bash
tsh db ls
```

Example output:

```
Name                                    Description Labels
--------------------------------------- ----------- ---------------------------------
dblab-clone-prod-my-clone-6000                      clone_id=my-clone, dblab=true
dblab-clone-prod-test-clone-6001                    clone_id=test-clone, dblab=true
```

### 3. Connect to a clone

```bash
# Connect directly
tsh db connect dblab-clone-prod-my-clone-6000 --db-user postgres --db-name postgres

# Or use a local tunnel (works with any psql client)
tsh proxy db --tunnel dblab-clone-prod-my-clone-6000
# Then connect to the tunnel endpoint shown in the output
```

:::caution
Use `127.0.0.1` instead of `localhost` in connection strings. Using `localhost` may resolve to IPv6 (`::1`), which can cause connection failures.
:::

### 4. Clean up

When done, destroy the clone through the DBLab API or CLI:

```bash
dblab clone destroy --id my-clone
```

The sidecar will automatically deregister the Teleport database resource.

## Teleport resource labels

Each registered clone includes the following Teleport labels for RBAC and filtering:

| Label | Description |
|-------|-------------|
| `dblab` | Always `"true"` — use for Teleport role matching |
| `environment` | The `--environment-id` value |
| `clone_id` | The DBLab clone ID |
| `dblab_user` | The database user configured for the clone |

### Create a Teleport role for DBLab users

Users need a Teleport role that grants access to DBLab clone databases. Create a file `dblab-user-role.yaml`:

```yaml
kind: role
version: v7
metadata:
  name: dblab-user
spec:
  allow:
    db_labels:
      dblab: "true"
    db_names: ["*"]
    db_users: ["*"]
    app_labels:
      dblab: "true"
```

Apply the role and assign it to users:

```bash
tctl create -f dblab-user-role.yaml

# Assign to users who need clone access:
tctl users update alice@example.com --set-roles=access,dblab-user
```

:::note
Users must log out and back in (`tsh logout && tsh login`) to pick up newly assigned roles.
:::

## Full server.yml example (Teleport-relevant sections)

:::caution
SSL settings must be part of the **same** `databaseConfigs` and `databaseContainer` anchor definitions used by `retrieval` and `provision`. If you define these anchors twice (e.g., once without SSL at the top and once with SSL at the bottom), YAML resolves `<<: *db_configs` to the first definition — the SSL settings are silently ignored.
:::

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
    - url: "http://172.17.0.1:9876/teleport-sync"
      secret: "your-webhook-secret"
      trigger:
        - clone_create
        - clone_delete
```

## Troubleshooting

### Sidecar refuses to start with "requires Standard or Enterprise edition"

The Teleport integration is only available for Standard and Enterprise editions. If you are running Community edition, you need to register your instance with the [PostgresAI platform](https://console.postgres.ai).

### Clones not appearing in Teleport

1. Check sidecar logs for errors (e.g., `tctl create failed`)
2. Verify the identity file has correct permissions: `tctl get db` should work manually
3. Confirm the DBLab API is reachable: `curl http://localhost:2345/status`
4. Wait up to 5 minutes for reconciliation if webhooks are not configured

### Connection refused when using `tsh proxy db`

- Ensure PostgreSQL SSL is enabled on clones (see Step 3)
- Use `127.0.0.1` instead of `localhost` in connection strings
- Check that the Teleport database service agent can reach the clone port on `localhost`

### TLS handshake failure

Clone doesn't have SSL enabled. Add `ssl: "on"` + cert paths to `databaseConfigs.configs` (see Step 3).

### "no pg_hba.conf entry"

Missing `hostssl ... cert` entry. Upgrade to DLE 4.1.0+ which includes this rule by default (see Step 3).

### "root certificate store not available"

Missing `ssl_ca_file`. Export the Teleport DB CA with `tctl auth export --type=db-client` and set `ssl_ca_file` in `databaseConfigs` (see Step 3).

### SSL settings not applied to new clones

Snapshot was created before SSL config was added. Trigger a data refresh to create a new snapshot with the updated `databaseConfigs`.

### Webhook not received by sidecar

Docker networking issue. DBLab Engine runs inside Docker, so use `host.docker.internal` or the Docker bridge IP for the webhook URL instead of `localhost` (see Step 5).

### "access to app denied" from sidecar

Bot identity was generated before the role was created or updated. Regenerate the bot identity after ensuring the role exists (see Step 2).

### Permission denied on cert files

Wrong file ownership or directory permissions. Run `chown 999:999` on cert files **and** `chmod 755` on the cert directory so the postgres user inside the container can traverse the directory and read the files.

### Sidecar returns HTTP 500 / "credentials have expired"

The bot identity file has expired (~1 hour with `tbot --oneshot`). Regenerate the identity by running `tbot` again, or switch to running `tbot` as a persistent service for automatic renewal (see Step 2).
