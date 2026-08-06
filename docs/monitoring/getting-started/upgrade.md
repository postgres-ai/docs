---
title: Upgrading the monitoring stack
sidebar_label: Upgrading
sidebar_position: 7
keywords:
  - "PostgresAI monitoring upgrade"
  - "mon update"
  - "mon update-config"
  - "VM_AUTH upgrade"
  - "monitoring .env migration"
---

# Upgrading the monitoring stack

This page covers upgrading an existing self-hosted monitoring stack to a newer PostgresAI
release (for example, from 0.14.x to 0.15.0). New installs should follow the
[CLI](/docs/monitoring/getting-started/installation-cli) or
[Docker Compose](/docs/monitoring/getting-started/installation-docker) guides instead.

:::danger Breaking change in 0.15.0: bundled PostgreSQL 15 → 17
0.15.0 upgrades the bundled PostgreSQL images from **15 to 17** for the stack's own
databases (`sink-postgres`, and on the demo `target-db` / `target-standby`). PostgreSQL's
on-disk format is **not** compatible across major versions, so the new images **refuse to
start** on a PostgreSQL 15 data directory (the entrypoint exits with a clear message instead
of crash-looping). **Your data is not deleted** — the guard refuses to touch it — but the
stack will not come up until you migrate the data. **Do the
[PostgreSQL 15 → 17 migration](#postgresql-15--17-major-version-migration) below *before* the
bring-up step** (`docker compose up -d`) in either upgrade path. This affects every
self-hosted deployment; your externally-monitored databases are **not** touched.
:::

## PostgreSQL 15 → 17 major-version migration

**Read this before bringing the stack up.** 0.15.0 bumps the stack's bundled PostgreSQL from
15 to 17. PostgreSQL stores data in a major-version-specific on-disk format, so PostgreSQL 17
cannot read a PostgreSQL 15 data directory. To make this safe and obvious, the 0.15.0 entrypoint
checks the on-disk `PG_VERSION` against the image version and, on a mismatch, **refuses to start**
with an actionable message (exit code 3) instead of crash-looping with a buried
"database files are incompatible with server" error.

**Your historical data is not lost** by the upgrade itself — the guard never writes to the old
data directory. You migrate it (or deliberately reset it) with the steps below.

### Who is affected

| Database (Docker container) | Role | Present in | Action |
|---|---|---|---|
| `sink-postgres` | pgwatch **measurements** DB — stores historical PostgreSQL metrics | **Every** self-hosted deploy | Migrate **or** reset (your choice — see below) |
| `target-db` | Bundled **sample** database being monitored | Demo only (`--demo`) | Migrate or reset (same procedure) |
| `target-standby` | Streaming **replica** of `target-db` | Demo only | **Do not migrate the replica** — re-clone it (see [Standbys](#standbys-target-standby)) |

Your **own monitored databases are external and are *not* touched** by this upgrade — PostgresAI
connects to them over the network and never alters their on-disk format. This migration is only
about the stack's *own* bundled PostgreSQL containers.

### Choose: preserve history, or reset

For `sink-postgres` you have two options. Pick one before you start:

- **(a) Preserve historical measurements (dump/restore).** Keeps all of your accumulated pgwatch
  measurements across the upgrade. Use this if historical trends matter to you. Follow
  [Option A](#option-a-preserve-history-dumprestore).
- **(b) Accept a reset of the measurements DB (simpler).** Discard the historical pgwatch
  measurements and start PostgreSQL 17 with a **fresh, empty** `sink-postgres`. Live monitoring
  resumes immediately and history re-accumulates from now on; only past measurements are lost.
  Choose this if you do not need the history or want the fastest path. Follow
  [Option B](#option-b-accept-a-reset-no-dump).

Either way, **VictoriaMetrics metrics** (the `sink-prometheus` time-series, used by most Grafana
dashboards) live in a **separate** volume and are **not** affected by the PostgreSQL major-version
change. This choice only concerns the PostgreSQL-format `sink-postgres` measurements DB.

:::danger Data-safety rules (apply to every option)
- **Never delete or overwrite the PostgreSQL 15 data volume until the PostgreSQL 17 restore is
  verified.** Keep the old volume as your rollback.
- **Rename / keep the old volume**, do not reuse it in place: restore into a **fresh** volume so
  the original PostgreSQL 15 data stays intact until you have confirmed the new one works.
- **Verify before cleanup:** check `pg_isready`, expected databases exist, and row counts /
  table counts look sane on PostgreSQL 17, and that Grafana/app health is green — *then* remove
  the old volume.
- Take the dump and run the migration **while the stack is stopped**, so nothing writes to the
  measurements DB mid-migration.
:::

### Find your volume names first

The migration commands below operate on Docker **volumes** and **containers** by name. Container
names are stable (`sink-postgres`, `target-db`, `target-standby`). Volume names are
**prefixed with your Compose project name**, which is the **basename of your monitoring
directory** — for the default npx / global install (`~/.config/postgresai/monitoring`) the
prefix is `monitoring_`, giving `monitoring_sink_postgres_data`. **Do not assume the prefix** —
list your actual volumes and use those exact names:

```bash
# From your monitoring directory. List the stack's PostgreSQL data volumes:
docker volume ls --format '{{.Name}}' | grep -E 'sink_postgres_data|target_db_data|target_standby_data'
# Example output (default install):
#   monitoring_sink_postgres_data
#   monitoring_target_db_data
#   monitoring_target_standby_data
```

Throughout this section, substitute **`<sink-vol>`** with your actual `*_sink_postgres_data`
volume name (and `<target-db-vol>` / `<target-standby-vol>` on the demo).

### Stop the stack

```bash
# From your monitoring directory
docker compose down            # stops containers; named volumes are preserved
```

### Option A: preserve history (dump/restore)

This runs the **previous PostgreSQL 15 image** against your existing data volume to take a logical
dump, then restores it into a **fresh PostgreSQL 17 volume**. The old volume is never modified.

```bash
# 0. Substitute your real sink volume name (see "Find your volume names first").
SINK_VOL=<sink-vol>                 # e.g. monitoring_sink_postgres_data
DUMP_DIR="$(pwd)/pg15-migration"    # dump lands on the host, outside any volume
mkdir -p "$DUMP_DIR"

# 1. Dump the PG15 data using the OLD image, read-only against the EXISTING volume.
#    pg_dumpall captures ALL databases + global roles (the pgwatch 'measurements'
#    DB, the 'pgwatch' role, etc.). The volume is mounted but never written to.
docker run --rm \
  -v "${SINK_VOL}:/var/lib/postgresql/data:ro" \
  -v "${DUMP_DIR}:/dump" \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  --entrypoint bash \
  postgres:15 -c '
    set -e
    # Start PG15 transiently from the existing data dir, dump, then stop.
    chown -R postgres:postgres /var/lib/postgresql/data
    su postgres -c "pg_ctl -D /var/lib/postgresql/data -w start"
    su postgres -c "pg_dumpall -U postgres" > /dump/all.sql
    su postgres -c "pg_ctl -D /var/lib/postgresql/data -w stop"
  '
# Sanity-check the dump is non-empty and contains your DB:
ls -lh "$DUMP_DIR/all.sql"
grep -c 'CREATE DATABASE' "$DUMP_DIR/all.sql" || true
```

:::note Read-only mount keeps PostgreSQL 15 intact
The old volume is mounted `:ro` here so the dump physically cannot modify your PostgreSQL 15
data. If your platform rejects starting PostgreSQL on a read-only mount, drop `:ro` — but then
**do not** run any other PostgreSQL 15 step against it, and keep the volume untouched as your
rollback.
:::

```bash
# 2. Create a FRESH PG17 volume (do NOT reuse the PG15 volume).
NEW_SINK_VOL="${SINK_VOL}-pg17"
docker volume create "$NEW_SINK_VOL"

# 3. Initialize + restore into the fresh PG17 volume using the PG17 image.
docker run --rm \
  -v "${NEW_SINK_VOL}:/var/lib/postgresql/data" \
  -v "${DUMP_DIR}:/dump:ro" \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  --entrypoint bash \
  postgres:17 -c '
    set -e
    su postgres -c "initdb -D /var/lib/postgresql/data"
    su postgres -c "pg_ctl -D /var/lib/postgresql/data -w start"
    su postgres -c "psql -U postgres -f /dump/all.sql"
    su postgres -c "pg_ctl -D /var/lib/postgresql/data -w stop"
  '
```

```bash
# 4. Swap the stack onto the new volume WITHOUT destroying the old one.
#    Rename the old PG15 volume aside (rollback), then give the new PG17 data
#    the name the stack expects. Docker has no native rename, so re-create the
#    target volume from the PG17 data via a copy.
docker volume create "${SINK_VOL}-pg15-backup"
# Copy PG15 data into the *-pg15-backup volume (preserves your rollback under a safe name)…
docker run --rm -v "${SINK_VOL}:/from:ro" -v "${SINK_VOL}-pg15-backup:/to" \
  alpine sh -c 'cp -a /from/. /to/'
# …then overwrite the canonical volume with the PG17 data:
docker run --rm -v "${NEW_SINK_VOL}:/from:ro" -v "${SINK_VOL}:/to" \
  alpine sh -c 'rm -rf /to/* /to/..?* /to/.[!.]* 2>/dev/null; cp -a /from/. /to/'
```

:::tip Simpler alternative to step 4
If you would rather not copy volumes, you can instead tell Compose to use the new volume by name.
But the copy approach above keeps the canonical volume name the stack already references, which
avoids editing `docker-compose.yml`. Whichever you choose, the original PostgreSQL 15 data must
survive under a clearly-named backup volume (`*-pg15-backup`) until you have verified PostgreSQL 17.
:::

Now continue to **[Bring the stack up and verify](#bring-up-and-verify)**.

### Option B: accept a reset (no dump)

This discards the historical pgwatch measurements and lets PostgreSQL 17 initialize a brand-new,
empty `sink-postgres`. Live monitoring resumes immediately; only past measurements are lost.
**Still keep the old volume as a backup** until you have confirmed the fresh stack is healthy —
do not delete it yet.

```bash
SINK_VOL=<sink-vol>                 # e.g. monitoring_sink_postgres_data

# Preserve the PG15 data under a backup name (rollback), THEN clear the canonical
# volume so PG17 initializes fresh into it.
docker volume create "${SINK_VOL}-pg15-backup"
docker run --rm -v "${SINK_VOL}:/from:ro" -v "${SINK_VOL}-pg15-backup:/to" \
  alpine sh -c 'cp -a /from/. /to/'
docker run --rm -v "${SINK_VOL}:/to" \
  alpine sh -c 'rm -rf /to/* /to/..?* /to/.[!.]* 2>/dev/null || true'
```

On the next bring-up, `sink-postgres` (PostgreSQL 17) sees an empty data directory and runs a
fresh `initdb`; pgwatch recreates the `measurements` database and starts collecting again.
Continue to **[Bring the stack up and verify](#bring-up-and-verify)**.

### Demo sample DB (`target-db`)

On a `--demo` deployment, `target-db` is the bundled sample database and follows the **same
pattern** as `sink-postgres`. It usually holds only throwaway sample data, so most operators just
**reset** it (Option B applied to `<target-db-vol>`). If you want to keep its contents, apply
Option A to `<target-db-vol>` instead. Real users' monitored databases are external and need no
action.

### Standbys (`target-standby`)

**Do not migrate the replica.** A standby's data directory is a physical copy of its primary and
cannot be independently `pg_upgrade`d or dump/restored. Instead:

1. Upgrade/initialize the **primary** (`target-db`) first, per the steps above.
2. **Re-clone the standby** from the upgraded primary via `pg_basebackup`.

The bundled demo does this automatically: the `target-standby` service re-clones itself with
`pg_basebackup` whenever its data directory is empty. So the correct action is simply to **clear
the standby's volume** and let it rebuild on bring-up:

```bash
STANDBY_VOL=<target-standby-vol>    # e.g. monitoring_target_standby_data
# Keep a backup name for safety, then clear so the demo re-clones from the new primary.
docker volume create "${STANDBY_VOL}-pg15-backup"
docker run --rm -v "${STANDBY_VOL}:/from:ro" -v "${STANDBY_VOL}-pg15-backup:/to" \
  alpine sh -c 'cp -a /from/. /to/'
docker run --rm -v "${STANDBY_VOL}:/to" \
  alpine sh -c 'rm -rf /to/* /to/..?* /to/.[!.]* 2>/dev/null || true'
```

On bring-up, `target-standby` waits for the upgraded `target-db` and re-streams a fresh
PostgreSQL 17 base backup. (No dump/restore is possible or needed for a replica.)

### Bring up and verify

After migrating/resetting the volumes above, proceed with the normal bring-up of your upgrade
path (continue to [Upgrade with the CLI](#upgrade-with-the-cli-recommended) or
[Upgrade with Docker Compose](#upgrade-with-docker-compose-manual)). Then verify:

```bash
# Containers are up and PG17 is actually serving:
docker compose ps
docker exec sink-postgres postgres --version          # expect: postgres (PostgreSQL) 17.x
docker exec sink-postgres pg_isready -U postgres       # expect: accepting connections

# (Option A only) confirm the measurements DB and its contents survived:
docker exec sink-postgres psql -U postgres -c '\l'     # 'measurements' DB present
docker exec sink-postgres psql -U postgres -d measurements -c \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema');"
# Compare this table count (and, for key tables, row counts) against the PG15 dump
# before you trust the migration. Spot-check a metrics table row count if you can.
```

Then open Grafana and confirm dashboards render data, and run the stack health check:

```bash
npx postgresai@latest mon health
```

### Post-migration: restore query-text collection on the fresh `sink-postgres`

After a dump/restore migration ([Option A](#option-a-preserve-history-dumprestore)) — or any
path that lands the `measurements` database on a **freshly initialized PostgreSQL 17** data
directory — query-text collection breaks **silently** even though metrics keep flowing. The new
data directory is bootstrapped from scratch, so two things the stack normally configures only on
**first init** are missing. This affects **all dump/restore upgraders**. Apply both fixes below.

**Symptom (how to recognize it).** Metrics graphs still draw, but **query texts vanish**:

- Dashboard 02 — the **"Query text" column is blank**.
- Dashboard 03 (per-query) — **"No data"**.
- Graph legends show the **raw label JSON** (e.g. `{queryid="…", …}`) instead of the actual
  query text.

There are **two independent root causes**, both on the fresh `sink-postgres`. Fix both.

#### Cause 1 — pg_hba.conf does not allow the monitoring services over the Docker IPv6 network

A fresh PG17 data directory ships a default `pg_hba.conf` that does **not** include the
Docker **IPv6 ULA** network the monitoring stack uses. The Flask backend
(`monitoring_flask_backend`) and `pgwatch-postgres` resolve `sink-postgres` to its IPv6
address first (per RFC 6724) and are rejected, so **0 query texts** are written. You'll see
this in the `sink-postgres` / Flask logs:

```text
FATAL:  no pg_hba.conf entry for host "<ipv6-addr>", user "...", database "measurements", no encryption
```

**Discover the real IPv6 range** for your deployment (do **not** copy a value from this page —
ranges differ per host). Either read the rejected host straight from the logs:

```bash
docker logs sink-postgres 2>&1 | grep "no pg_hba.conf entry"
docker logs monitoring_flask_backend 2>&1 | grep -i "pg_hba\|no encryption"
```

…or inspect the monitoring Docker network's IPv6 subnet directly:

```bash
# Replace <monitoring-network> with your compose network (see: docker network ls)
docker network inspect <monitoring-network> \
  --format '{{range .IPAM.Config}}{{.Subnet}} {{end}}'
```

Add a matching IPv6 ULA entry to the fresh `sink-postgres` `pg_hba.conf` and reload (no
restart needed). Use the **range you discovered** above:

```bash
# Use the IPv6 ULA subnet from the step above (example shape only — substitute yours):
IPV6_ULA='fdXX:XXXX:XXXX::/48'

docker exec -i sink-postgres bash -lc \
  "echo \"host all all ${IPV6_ULA} trust\" >> \"\$PGDATA/pg_hba.conf\""

# Reload so the new rule takes effect without a restart
docker exec -i sink-postgres psql -U postgres -d measurements -c "select pg_reload_conf()"
```

#### Cause 2 — `init.sql` schema bootstrap was not re-applied (dedup function missing)

The fresh `measurements` database lacks the partition-safe dedup function/trigger and
supporting schema that `config/sink-postgres/init.sql` installs (it only runs automatically on
the very first init of a volume). Without it, the Flask backend refuses to export query texts
and logs:

```text
WARNING: Sink dedup function public.enforce_queryid_uniqueness ... missing ...
         Re-run config/sink-postgres/init.sql as the bootstrap role.
...
Exported 0 active queryids for metrics
```

Re-run the schema bootstrap as the **bootstrap/superuser role** (`postgres`). The script is
idempotent (`create … if not exists` / `create or replace`), so it is safe to re-apply:

```bash
# From the monitoring project directory (where config/sink-postgres/init.sql lives)
docker exec -i sink-postgres psql -U postgres -d measurements < config/sink-postgres/init.sql
```

#### Restart the collectors and verify

After **both** fixes, restart the two services that write query texts:

```bash
docker compose restart pgwatch-postgres monitoring_flask_backend
```

Confirm the Flask backend now exports query texts (allow **one query-info scrape cycle,
~5 minutes**):

```bash
# Expect a non-zero count, not "Exported 0 active queryids":
docker logs --since 6m monitoring_flask_backend 2>&1 | grep "active queryids for metrics"
```

Then reload Grafana: Dashboard 02's **"Query text"** column populates, Dashboard 03 shows
data, and graph legends render real query text instead of raw label JSON.

### Rollback

If anything looks wrong, you have **not** lost the PostgreSQL 15 data — it is in the
`*-pg15-backup` volume(s):

```bash
docker compose down
SINK_VOL=<sink-vol>
# Restore the PG15 data back into the canonical volume…
docker run --rm -v "${SINK_VOL}-pg15-backup:/from:ro" -v "${SINK_VOL}:/to" \
  alpine sh -c 'rm -rf /to/* /to/..?* /to/.[!.]* 2>/dev/null; cp -a /from/. /to/'
# …then temporarily pin the affected service back to postgres:15 (edit docker-compose.yml)
# and bring the stack up on the old image while you investigate.
```

### Clean up (only after verification)

Once PostgreSQL 17 is verified healthy and you no longer need the rollback, reclaim space:

```bash
docker volume rm "${SINK_VOL}-pg15-backup"
docker volume rm "${SINK_VOL}-pg17" 2>/dev/null || true   # the scratch restore volume (Option A)
rm -rf ./pg15-migration                                    # the host-side dump (Option A)
# (demo) docker volume rm "${TARGET_DB_VOL}-pg15-backup" "${STANDBY_VOL}-pg15-backup"
```

:::tip An automated `pg-upgrade` command is planned
A built-in command to automate this major-version migration (in-place `pg_upgrade`) is in
progress (draft MR
[!145](https://gitlab.com/postgres-ai/postgresai/-/merge_requests/145)). It is **not** part of
0.15.0 — on 0.15.0 use the manual dump/restore procedure above.
:::

## Upgrade with the CLI (recommended)

If you installed with `postgresai mon local-install`, upgrade with the CLI. `mon update` pulls the
new images and migrates your `.env` file; `mon update-config` regenerates the pgwatch sources.
Neither command restarts or recreates the running services, so after pulling you **must** recreate
the containers with the new images — preserving your existing values. Because the stack is already
running, recreate it with `docker compose up -d` directly: `up -d` recreates any container whose
image changed. A plain `postgresai mon restart` only runs `docker compose restart` and restarts the
**existing** containers on the **old** image, so it does not apply a pulled image — and a bare
`postgresai mon start` is a **no-op** on a running stack (it sees the running containers, prints
`Monitoring services are already running`, and exits without running `docker compose up -d`). If you
prefer the CLI, run `mon stop` first so the next `mon start` sees no running containers and actually
performs `up -d`.

```bash
# From the monitoring directory (~/.config/postgresai/monitoring by default for npx/global installs)
$EDITOR .env                              # set PGAI_TAG=0.15.0 FIRST — see note below
npx postgresai@latest mon update          # migrate .env + pull new images (does NOT restart)
npx postgresai@latest mon update-config   # regenerate pgwatch sources.yml
# ⚠️ 0.15.0 only: complete the PostgreSQL 15 → 17 migration BEFORE this bring-up.
#    See "PostgreSQL 15 → 17 major-version migration" above.
docker compose up -d                      # recreate containers to apply the pulled images
# (CLI alternative: `npx postgresai@latest mon stop && npx postgresai@latest mon start`)
```

> **Set `PGAI_TAG=0.15.0` in `.env` first.** All stack images are pinned to `${PGAI_TAG}`, and
> `mon update` / `mon update-config` do **not** change `PGAI_TAG` (only `mon local-install` rewrites
> it). If you leave a stale `PGAI_TAG=0.14.x`, the commands above just re-pull and recreate the
> **old** images — not an upgrade. Edit `.env` and set `PGAI_TAG=0.15.0` before running `mon update`.

> `mon update` prints a hint to run `postgres-ai mon restart` afterward, but `docker compose restart`
> restarts containers in place and does **not** pull in a newly-fetched image. A bare `mon start`
> also will not help on a running stack — it short-circuits with `Monitoring services are already
> running`. Recreate the running stack with `docker compose up -d` (or `mon stop` then `mon start`),
> which recreates the containers on the new image.

| Command | What it does |
|---------|--------------|
| `$EDITOR .env` → `PGAI_TAG=0.15.0` | **Do this first.** Pins the stack images to the new tag. `mon update` / `mon update-config` do **not** change `PGAI_TAG` (only `mon local-install` rewrites it), and every image is pinned to `${PGAI_TAG}` — so without this step the commands below just re-pull the **old** tag. |
| `mon update` | Migrates `.env` (additively) and pulls the pinned images for the tag in `.env` (set `PGAI_TAG=0.15.0` first — `mon update` does **not** advance it). It does **not** restart or recreate the services — run `docker compose up -d` afterward to recreate the containers and apply the new images. (A bare `postgresai mon start` will not do this on a running stack; it no-ops with `Monitoring services are already running`. Use `docker compose up -d`, or `mon stop` then `mon start`.) |
| `mon update-config` | Migrates `.env` and regenerates the pgwatch `sources.yml` files (via the `sources-generator`). It does not regenerate the Grafana datasources, does not restart the collectors, and does not reseed the config volume. |

### Additive, value-preserving `.env` migration (`mon update` / `mon update-config`)

`mon update` and `mon update-config` migrate `.env` **additively**: new keys required by the
release are appended with safe defaults, and every existing value (passwords, retention, resource
limits, OAuth, `GF_SERVER_ROOT_URL`, …) is preserved. These two commands never overwrite a value
you have already set, so they are the recommended way to upgrade an existing, tuned deployment.

:::warning `local-install` rewrites `.env` — it does not migrate additively
`postgresai mon local-install -y` does **not** preserve arbitrary keys. It rewrites `.env` from
scratch, carrying forward only your **credentials and registry** — `PGAI_REGISTRY`,
`GF_SECURITY_ADMIN_PASSWORD`, `REPLICATOR_PASSWORD`, `VM_AUTH_USERNAME`, `VM_AUTH_PASSWORD` — and
it always resets `PGAI_TAG` to the CLI's own version. Any other key you had set is **dropped**,
including retention (`VM_RETENTION_PERIOD`, `QUERYID_RETENTION_HOURS`), resource-limit overrides
(`*_CPUS` / `*_MEM`, e.g. `SINK_PROMETHEUS_MEM`), and `GF_SERVER_ROOT_URL` / `BIND_HOST`. To
upgrade a tuned deployment, prefer `mon update` / `mon update-config` above; if you do run
`local-install`, re-apply those settings to `.env` afterward and run `docker compose up -d` so the
affected containers are recreated with the restored values (`mon restart` would not pick up changed
container env vars — those are read only when a container is recreated — and a bare `postgresai mon
start` is a no-op on a running stack, so it would not recreate them either; use `docker compose up -d`,
or `mon stop` then `mon start`).
:::

:::tip Node.js 18+ required
0.15 requires Node.js 18+ (or Bun 1.0+). Older Node versions now fail early with a clear error.
See [System requirements](/docs/monitoring/getting-started/requirements#cli-runtime).
:::

### Bundled `docker-compose.yml` refresh for non-git (npx) installs

If you installed via `npx postgresai@latest` or a global npm install, your project directory is **not**
a git checkout, so `git pull` cannot bring in the new compose file. `docker-compose.yml` is a
version-coupled asset — for example, 0.15 wires `VM_AUTH_*` into the VictoriaMetrics service and
the Grafana datasource — and a stale compose would leave that wiring missing and blank all
dashboards.

To handle this, `mon local-install -y`, `mon update`, and `mon update-config` automatically
refresh the bundled `docker-compose.yml` for non-git installs when it is stale relative to the
target version. The refresh:

- Is a **no-op for git checkouts** (those upgrade via `git pull`) and a no-op when the deployed
  compose already matches the target.
- **Backs up** the previous compose before overwriting it, to a uniquely named file
  `docker-compose.yml.bak-<old-tag>-<hash>` (the backup is never clobbered on repeated runs, so
  your original compose is always preserved).
- **Validates** the fetched compose before replacing anything. If it cannot retrieve a valid
  compose (for example, no network), it keeps the existing file, writes no backup, warns, and
  the upgrade still proceeds.
- Touches **only** `docker-compose.yml` — never `.env`, `instances.yml`, or `.pgwatch-config`.

When it refreshes, the CLI prints a confirmation such as
`✓ Refreshed docker-compose.yml to 0.15.0 (backup: docker-compose.yml.bak-0.14.0-<hash>)`.

## Required new keys in 0.15: VictoriaMetrics basic auth

0.15 protects the VictoriaMetrics endpoint with HTTP basic auth, so two keys are now required:

```bash
VM_AUTH_USERNAME=vmauth
VM_AUTH_PASSWORD=<non-empty secret>
```

The CLI generates and preserves these automatically during `local-install`, `update`, and
`update-config`. `VM_AUTH_USERNAME` defaults to `vmauth` when absent, and a random
`VM_AUTH_PASSWORD` is generated when missing.

:::warning Manual Docker Compose users: add these before upgrading
If you run `docker compose` directly instead of through the CLI, you **must** add
`VM_AUTH_USERNAME=vmauth` and a non-empty `VM_AUTH_PASSWORD` to `.env` before running
`docker compose up -d`. Grafana datasource provisioning depends on these credentials; without
them, Grafana cannot query VictoriaMetrics and dashboards show no data. The shipped
`.env.example` includes empty placeholders that intentionally make Docker Compose fail fast
until you set a value.

```bash
# Generate a password
VM_AUTH_PASSWORD="$(openssl rand -base64 18)"
```
:::

See [Authentication and security](/docs/monitoring/configuration/prometheus-config#authentication-and-security)
for what these credentials protect and how to rotate them.

## Upgrade with Docker Compose (manual)

If you manage the stack with `docker compose` directly:

```bash
# 1. Pull the latest repository state (new compose / config templates)
git pull

# 2. Pin the new image tag and add any newly required keys
#    Required in 0.15:
#      PGAI_TAG=0.15.0
#      VM_AUTH_USERNAME=vmauth
#      VM_AUTH_PASSWORD=<non-empty secret>
$EDITOR .env

# 3. Pull images and restart
docker compose pull
# ⚠️ 0.15.0 only: complete the PostgreSQL 15 → 17 migration BEFORE this bring-up.
#    See "PostgreSQL 15 → 17 major-version migration" above.
docker compose up -d
```

All stack images are version-pinned (no `:latest`) for reproducible upgrades — see
[Image tags](/docs/monitoring/getting-started/installation-docker#image-tags-and-supply-chain).

## Other 0.15 upgrade notes

- **Retention is now plan-parameterizable.** `VM_RETENTION_PERIOD` (metrics) and
  `QUERYID_RETENTION_HOURS` (query-id mapping) can be tuned per deployment. `mon update` /
  `mon update-config` preserve any values you have set; `mon local-install -y` does **not** (it
  rewrites `.env` and drops these keys — see the warning above), so re-apply them afterward if you
  upgrade via `local-install`. See
  [Retention](/docs/monitoring/configuration/prometheus-config#retention).
- **Restart policies.** Critical services ship with `restart: unless-stopped` and survive host
  reboots without a manual systemd unit. See
  [Reliability and restart behavior](/docs/monitoring/getting-started/installation-docker#reliability-and-restart-behavior).
- **Idempotent config seeding.** Generated config is seeded once and guarded by a version
  marker, so operator edits persist across restarts; `mon update-config` regenerates the pgwatch
  `sources.yml` files after a version bump.

## Verify the upgrade

```bash
npx postgresai@latest mon health
npx postgresai@latest mon status
```

Then open Grafana and confirm dashboards render data. If panels are empty after the upgrade,
check that `VM_AUTH_USERNAME` / `VM_AUTH_PASSWORD` are set and that you recreated the stack with
`docker compose up -d` so the containers are rebuilt on the pulled images and re-read the updated
VM_AUTH credentials. (A plain `postgresai mon restart` restarts the existing containers in place and
would pick up neither the new image nor changed env values; a bare `postgresai mon start` no-ops on
an already-running stack and does not recreate anything — recreate via `docker compose up -d`, or
`mon stop` then `mon start`.) The
Grafana datasource is static (provisioned from `config/grafana` into the config volume) and only
re-reads those credentials when Grafana restarts — it is not regenerated by `mon update-config`.
