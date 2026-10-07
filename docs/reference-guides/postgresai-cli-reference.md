---
title: PostgresAI CLI reference
sidebar_label: PostgresAI CLI
keywords:
  - "postgresai cli"
  - "pgai cli"
  - "postgres_ai cli"
  - "postgres_ai monitoring cli"
  - "mcp"
  - "issues"
  - "checkup"
  - "prepare-db"
  - "pgai joe"
  - "joe bot"
  - "pgai dblab"
  - "promql"
  - "global token"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Description

PostgresAI Command Line Interface is a tool for working with PostgresAI:
preparing databases for monitoring, running local monitoring stacks,
generating health-check reports, browsing and managing issues in the
PostgresAI Console, running [Joe](/docs/joe-bot) SQL optimization commands
on ephemeral DBLab clones, managing DBLab clones, branches, and snapshots,
running PromQL queries against a monitoring instance, and exposing
PostgresAI tools to AI coding clients over MCP.

The CLI is published as the `postgresai` npm package and ships two
equivalent binaries: `postgresai` (canonical) and `pgai` (short alias).
Both names accept exactly the same commands and options; this page uses
`postgresai` throughout.

## Requirements

The CLI requires **Node.js 18+ (or Bun 1.0+)**. Older Node versions fail fast with a clear
error rather than breaking partway through a command.

## Getting started

To install and authenticate, see the [PostgresAI CLI how-to](/docs/postgresai-howtos/postgresai-cli).

## Synopsis

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai [global options] <command> [command options] [arguments...]
# or, equivalently:
pgai [global options] <command> [command options] [arguments...]
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai@latest [global options] <command> [command options] [arguments...]
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai@latest [global options] <command> [command options] [arguments...]
```

</TabItem>
</Tabs>

Run `postgresai --help` to list available commands and global options.
For command-specific help, run `postgresai <command> --help` (works for
nested subcommands too, e.g. `postgresai mon targets --help`).

## Global options

These options apply to every command and override the corresponding
environment variables and configuration file values:

- `--api-key <key>` — API key (overrides `PGAI_API_KEY`).
- `--api-base-url <url>` — API base URL for backend RPC (overrides `PGAI_API_BASE_URL`; default `https://postgres.ai/api/general/`).
- `--ui-base-url <url>` — UI base URL for browser routes (overrides `PGAI_UI_BASE_URL`; default `https://console.postgres.ai`).
- `--storage-base-url <url>` — Storage base URL for file uploads (overrides `PGAI_STORAGE_BASE_URL`).

Configuration is stored in `~/.config/postgresai/config.json`.

Organization selection (`--org` / `--org-id`) is **not** a global option:
it is registered on each organization-scoped command and goes after the
subcommand. See [Organization selection](#organization-selection).

## Organization selection

An API key is either a **per-organization token** (reaches one
organization) or, since CLI 0.17, a **global token** (bound to you, reaches
every organization you belong to; the key starts with `pai_global_`). To
get a global token, pick **All my organizations** in the organization
picker during [`login`](#command-login). Per-organization tokens work as
before and need no extra options.

A global token cannot guess which organization a command means, so every
organization-scoped command takes:

- `--org <alias>` — organization alias (or the `PGAI_ORG` environment variable).
- `--org-id <id>` — numeric organization id (or the `PGAI_ORG_ID` environment variable).

With a global token, one of them is **required**; without it the command
exits with code `1` before making any request and suggests running
[`orgs`](#command-orgs). With a per-organization token they are optional:
the token carries its own organization.

Rules:

- `--org` always means an alias and `--org-id` always a numeric id (an all-digit alias is legal, so a single option could not tell them apart).
- Any flag beats the environment variables. Passing both flags, or setting both `PGAI_ORG` and `PGAI_ORG_ID`, is an error rather than a silent precedence win. An empty flag value (e.g. `--org "$ORG"` with `$ORG` unset) is also an error; it does not fall back to the environment.
- Place the options after the subcommand: `postgresai projects --org acme` works, `postgresai --org acme projects` is rejected.
- Nothing is stored: there is no "current organization" setting. Logging in with a global token removes any stored organization ID and default project from the configuration file.

Commands that accept the options: `checkup`, `promql`, `projects`, and
every subcommand of `issues`, `reports`, `joe`, and `dblab`.
`mon local-install` accepts them too, but needs them only to register the
monitoring instance with a global token; the running stack needs a
per-organization token. Under a global token, `checkup`
requires a selection even with `--no-upload`.

```bash
postgresai orgs                                   # which organizations can this token reach?
postgresai issues list --org acme                 # by alias
postgresai reports list --org-id 5225             # by numeric id
PGAI_ORG=acme postgresai joe plan "select 1" --project main-db   # scripts and agents
```

:::tip Per-organization tokens for servers, CI, and agents
A global token reaches every organization you belong to. On servers, in CI, and for agents, prefer
a per-organization token, so a leaked key exposes one organization.

A monitoring host needs one: `mon local-install --api-key` saves the key in `.pgwatch-config`,
and the stack's report uploader and `instance-jobs` container send no organization selector. A
global token there works for the registration step (with `--org`) and nothing after it: report
uploads fall back to local-only, and `instance-jobs` cannot poll for work.
:::

## Command overview

```
COMMANDS:
  prepare-db            prepare a database for monitoring (idempotent)
  unprepare-db          remove monitoring setup from a database
  checkup               generate health-check reports directly from PostgreSQL
  mon                   manage the local monitoring stack
  promql                run a PromQL query on a monitoring instance's metric store
  login                 top-level alias for `auth login`
  auth                  authenticate and manage the local API key
  orgs                  list organizations the current credential can reach
  joe                   Joe — plan/EXPLAIN/exec queries on ephemeral DBLab clones
  projects              list the org's projects (shows which have Joe ready)
  dblab                 manage DBLab thin clones, branches, and snapshots
  issues                manage issues, comments, and action items in PostgresAI Console
  reports               list and download checkup reports stored in PostgresAI Console
  mcp                   MCP server integration for AI coding tools
  set-default-project   store the default project for checkup uploads
  set-storage-url       store the storage base URL for file uploads
  feedback              share ideas or feedback about the CLI
  help                  show help
```

## Command: `prepare-db`

Prepare a database for monitoring: create the monitoring user, the
required view(s), and grant permissions. The command is idempotent.

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai prepare-db [conn] [options]
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai@latest prepare-db [conn] [options]
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai@latest prepare-db [conn] [options]
```

</TabItem>
</Tabs>

`[conn]` is an optional positional admin connection string. Both URL
form (`postgresql://admin@host:5432/dbname`) and libpq key/value form
(`"dbname=dbname host=host user=admin"`) are accepted; psql-like
options (`-h`, `-p`, `-U`, `-d`) are also supported.

**Examples**

```bash
postgresai prepare-db postgresql://admin@host:5432/dbname
postgresai prepare-db "dbname=dbname host=host user=admin"
postgresai prepare-db -h host -p 5432 -U admin -d dbname

# Verify only (no changes)
postgresai prepare-db postgresql://admin@host:5432/dbname --verify

# Dry run: print SQL plan
postgresai prepare-db postgresql://admin@host:5432/dbname --print-sql

# Reset only the monitoring role password
postgresai prepare-db postgresql://admin@host:5432/dbname \
  --reset-password --password 'new_password'

# Supabase mode (uses Management API instead of direct connection)
SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... \
  postgresai prepare-db --supabase
```

**Connection options**

- `-h, --host <host>` — PostgreSQL host (psql-like).
- `-p, --port <port>` — PostgreSQL port (psql-like).
- `-U, --username <username>` — PostgreSQL admin user (psql-like).
- `-d, --dbname <dbname>` — PostgreSQL database name (psql-like).
- `--admin-password <password>` — admin password (otherwise uses `PGPASSWORD` if set).
- `--db-url <url>` — admin connection URL (deprecated; pass it as the positional `[conn]` argument).

**Monitoring role options**

- `--monitoring-user <name>` — monitoring role name to create or update (default: `postgres_ai_mon`).
- `--password <password>` — monitoring role password (overrides `PGAI_MON_PASSWORD`). If neither is provided, a strong password is generated.
- `--print-password` — print the generated monitoring password (dangerous in CI logs).
- `--skip-optional-permissions` — skip optional permissions (RDS / self-managed extras).
- `--provider <provider>` — database provider (e.g. `supabase`); affects which steps run.

**Modes**

- `--verify` — verify that the monitoring role and permissions are in place; make no changes.
- `--reset-password` — reset only the monitoring role password.
- `--print-sql` — print the SQL plan and exit; apply no changes.
- `--json` — output the result as machine-readable JSON.

**Supabase mode**

- `--supabase` — use the Supabase Management API instead of a direct PostgreSQL connection.
- `--supabase-access-token <token>` — Supabase Management API token (or `SUPABASE_ACCESS_TOKEN` env var). Tokens can be created on the [Supabase access tokens page](https://supabase.com/dashboard/account/tokens).
- `--supabase-project-ref <ref>` — Supabase project reference (or `SUPABASE_PROJECT_REF` env var). Auto-detected from a Supabase database URL when one is supplied as `[conn]`.

## Command: `unprepare-db`

Reverse `prepare-db`: drop the monitoring user, views, schema, and
revoke permissions.

**Usage**

```bash
postgresai unprepare-db [conn] [options]
```

**Options**

- `-h, --host`, `-p, --port`, `-U, --username`, `-d, --dbname`,
  `--admin-password`, `--db-url <url>` (deprecated) — admin connection
  parameters, same as `prepare-db`.
- `--monitoring-user <name>` — monitoring role to remove (default: `postgres_ai_mon`).
- `--keep-role` — keep the monitoring role; only revoke permissions and drop objects.
- `--provider <provider>` — database provider (affects which steps run).
- `--print-sql` — print the SQL plan and exit; apply no changes.
- `--force` — skip the confirmation prompt.
- `--json` — output the result as machine-readable JSON.

## Command: `checkup`

Generate health-check reports directly from PostgreSQL ("express mode")
and optionally upload them to the PostgresAI Console.

Express mode supports PostgreSQL 14 through PostgreSQL 19. For PostgreSQL 19
beta releases, it preserves version labels such as `19beta2` while using
`server_version_num` (`190000`) for version-aware metric selection. PostgreSQL
19 remains a pre-release; use it for compatibility testing rather than
production workloads until general availability.

**Usage**

```bash
# Run all checks
postgresai checkup <conn>

# Run a specific check (CHECK_ID matches /^[A-Z]\d{3}$/i — case-insensitive, e.g. H002 or h002)
postgresai checkup <CHECK_ID> <conn>
```

`<conn>` accepts the same URL / libpq / psql-like forms as
`prepare-db`.

**Options**

- `--check-id <id>` — specific check to run (or `ALL`). Equivalent to passing the check ID as the first positional argument.
- `--node-name <name>` — node name embedded in reports (default: `node-01`).
- `--output <path>` — write per-check JSON results to this directory. Only the report payload is written; progress and error messages go to stderr, so the output files stay clean.
- `--upload` / `--no-upload` — upload JSON results to PostgresAI Console (requires API key). Default depends on whether an API key is configured.
- `--project <project>` — project name or ID for the upload (used with `--upload`). Defaults to the value stored by [`set-default-project`](#command-set-default-project); a project is auto-generated on first run if needed. With a global token the stored default is ignored and a generated name is not saved, so pass `--project` to upload to a stable project.
- `--json` — print JSON to stdout.
- `--markdown` — print Markdown to stdout. The conversion runs on the PostgresAI API, so the full report JSON is sent there; `--markdown` cannot be combined with `--json` or `--no-upload`.
- `--org <alias>` / `--org-id <id>` — organization; required with a global token. See [Organization selection](#organization-selection).

:::tip stdout vs stderr
Progress and error messages are written to **stderr**; **stdout** carries only the report
payload. This means `--json` / `--markdown` can be piped safely, for example:

```bash
postgresai checkup <conn> --json | jq '.checks[] | select(.id == "H002")'
```
:::

**Available checks**

Run `postgresai checkup --help` to see the full list of check IDs and titles bundled with your
CLI version. The express-mode checks span the A (general / version / cluster), D (logging and
`pg_stat_statements` settings), F (autovacuum / bloat), G (memory and timeouts), H (index), and I
(I/O) groups — there are no K (query) checks in the express-mode CLI. Autovacuum and bloat checks
worth knowing about:

| Check | Finds |
|-------|-------|
| `F001` | Autovacuum settings, plus configuration linting: effective values, rule-based findings, the effective throughput budget, and scale-factor overrides on the largest tables (0.17+) |
| `F003` | Autovacuum dead tuples, plus trigger analysis (which tables are over their vacuum trigger) and worker/queue saturation (0.17+) |
| `F004` | Autovacuum: heap bloat (estimated) |
| `F005` | Autovacuum: index bloat (estimated) |

Since 0.17, the index checks `H001` (invalid), `H002` (unused), and `H004` (redundant) no longer
report system-catalog indexes (`pg_catalog`, `information_schema`, `pg_toast`, temp schemas), which
cannot be dropped. Expect a one-off drop in unused/redundant index counts after upgrading.

```bash
# Run a single bloat check
postgresai checkup F004 <conn>
```

:::note Bloat checks need the monitoring role
The bloat estimation checks read catalog-level statistics that require the monitoring role
created by [`prepare-db`](#command-prepare-db). When the connection lacks the required
privileges, the check prints a hint:

```
Hint: Run "postgresai prepare-db <connection>" to create required objects.
```

Run `prepare-db` (or connect with a sufficiently privileged role) and re-run the check.

`checkup` still runs on a database that was never prepared (no `postgres_ai` schema): since 0.17
the permission pre-flight no longer aborts there, and `F004` / `F005` report a degraded status with
a warning instead of an empty "healthy" result.
:::

## Command: `mon`

Manage the local monitoring stack (Docker Compose-based: collectors,
VictoriaMetrics, Grafana, …).

**Usage**

```bash
postgresai mon <subcommand> [options]
```

**Subcommands**

- `local-install` — install the local monitoring stack: generate `.env`, configure services, and start them.
- `start` — start monitoring services. Runs `docker compose up -d` **only when the stack is not already running**: if any Grafana/pgwatch container is already up, it prints `Monitoring services are already running` and exits **without** running `up -d` (suggesting `mon restart`). When it does run, `up -d` creates or recreates containers as needed, so it applies a newly pulled image and triggers a `config-init` reseed when the image version no longer matches the config-volume marker. It uses plain `docker compose up -d` (not `--force-recreate`). A full-stack `up -d --force-recreate` is used by `mon local-install` (on a stopped stack only); `mon targets add`/`remove` also force-recreate, but only the two pgwatch collector containers (`pgwatch-prometheus`, `pgwatch-postgres`). On an **already-running** stack a bare `mon start` is therefore a no-op — to apply a pulled image or recreate `config-init` on a live stack, run `docker compose up -d` directly, or `mon stop` then `mon start`.
- `stop` — stop monitoring services.
- `restart [service]` — restart all services or a specific one (`docker compose restart [service]`). Restarts the **existing** containers in place: it does **not** recreate them, does **not** apply a newly pulled image, and does **not** trigger a `config-init` reseed. To apply a new image or changed container env vars on a running stack, recreate the containers with `docker compose up -d` (a bare `mon start` no-ops while the stack is running, since it short-circuits with `Monitoring services are already running`).
- `status` — show services status.
- `health` — check that services are up and healthy.
- `logs [service]` — show logs for all services or a specific one.
- `config` — show monitoring configuration.
- `update-config` — apply configuration changes after editing `.env`: migrates `.env` additively (preserving existing values), refreshes the CLI-owned `docker-compose.yml` for non-git installs, and regenerates the pgwatch `sources.yml` (`docker compose run --rm sources-generator`). Since 0.17, if `sink-prometheus` is running, it is then brought in line with `.env` and the compose file (`docker compose up -d --no-deps sink-prometheus`, which recreates it only if that configuration changed), so the VictoriaMetrics admin-endpoint keys and `VM_*` settings take effect. It does not reload a re-seeded `prometheus.yml`; use `docker compose restart sink-prometheus` for that. It does **not** regenerate the Grafana datasources or restart any other service. Because `sources-generator` depends on `config-init`, a run after a `PGAI_TAG` change also re-seeds the config volume with the new version's files.
- `update` — update the monitoring stack: migrates `.env` additively (preserving existing values), refreshes the repo/compose, and pulls the pinned images for the current tag (`docker compose pull`). Since 0.17 it then recreates `sink-prometheus` if it is running (to apply the VictoriaMetrics admin-endpoint keys) and, when the instance-jobs profile is enabled and the stack is running, starts `instance-jobs` with a scoped `up -d --no-deps`. It does **not** recreate any other service — afterward you must recreate the containers to apply the new images. On a running stack do this with `docker compose up -d` directly (or `mon stop` then `mon start`). Re-running `mon local-install` does not apply them: on a running stack it exits early (see [`mon local-install`](#subcommand-mon-local-install)). The command prints a hint to run `mon restart`, but `docker compose restart` restarts containers in place on the old image and does not apply a pulled image; and a bare `mon start` is a **no-op** while the stack is running (it short-circuits with `Monitoring services are already running`), so it will not apply the new image on its own either. See [Upgrading the monitoring stack](/docs/monitoring/getting-started/upgrade) for the full upgrade flow (including the required `VM_AUTH_*` keys in 0.15).
- `reset [service]` — reset all services or a specific one (removes data).
- `clean` — clean up monitoring artifacts (stops services and removes volumes).
- `check` — system readiness check.
- `shell <service>` — open an interactive shell in a monitoring service container.
- `targets` — manage databases to monitor (see below).
- `generate-grafana-password` — generate a new Grafana password.
- `show-grafana-credentials` — show Grafana credentials.

### Subcommand: `mon local-install`

Install (or re-install) the local monitoring stack. Replaces the older
`mon quickstart` name.

```bash
postgresai mon local-install [options]
```

**Options**

- `--demo` — demo mode with a sample database (for testing; cannot be combined with `--api-key`).
- `--api-key <key>` — PostgresAI API key for automated report uploads. Saved in `.pgwatch-config` in the monitoring directory (owner-only, `0600`) and in the CLI configuration file. It must be a per-organization token: the stack's report uploader and `instance-jobs` send no organization selector, so a global token registers the instance (with `--org`) but cannot upload reports or poll for jobs.
- `--org <alias>` / `--org-id <id>` — organization to register the monitoring instance in (or `PGAI_ORG` / `PGAI_ORG_ID`). Needed only to register with a global token, which the stack itself cannot use (see `--api-key`); not needed for `--demo` or an install without an API key. See [Organization selection](#organization-selection).
- `--db-url <url>` — PostgreSQL connection URL to monitor (form: `postgresql://user:pass@host:port/db`).
- `--tag <tag>` — Docker image tag to use (e.g. `0.17.0`, `0.17.0-dev.3`).
- `--project <name>` — the PostgresAI Console project, saved as `project_name` in `.pgwatch-config`, where the report uploader reads it. Despite the `--help` text, it is not the Docker Compose project name: the CLI does not set one, so Compose uses the monitoring directory's name. When an `--api-key` is supplied (non-demo install) without `--instance-id`, it is also the project this monitoring instance self-registers in, and it is required for that: there is no default (the former `postgres-ai-monitoring` default was removed), so without `--project` the stack is installed but registration fails and the command exits with code `1`.
- `--instance-id <uuid>` — adopt a monitoring instance already provisioned in the Console instead of self-registering a new one (or `PGAI_INSTANCE_ID`). Set automatically by the Console provisioning flow.
- `--vcpus <n>` — vCPU count of the source database, used for Average Active Sessions (AAS) zone thresholds (or `PGAI_VCPUS`). Used only together with `--instance-id`; a self-registering install ignores it. Omitted or `0` means unknown: the platform keeps the value it recorded at provisioning time. An explicit non-zero value overwrites the stored one; changing it re-arms the AAS backfill.
- `--instance-jobs` / `--no-instance-jobs` — enable or disable the `instance-jobs` container, the outbound job channel the platform uses to send work (such as [`promql`](#command-promql) queries) to this instance (or `PGAI_INSTANCE_JOBS=true|false`; `1/0`, `yes/no`, `on/off` also work, anything else is an error). Enabling writes `COMPOSE_PROFILES=instance-jobs` to `.env`, so later `mon start` / `stop` / `update` cover the container; disabling also removes the container. Passing neither keeps the current setting, so a re-install or upgrade never turns the channel on or off.
- `-y, --yes` — accept all defaults and skip interactive prompts.

:::caution Re-running `local-install`
If the stack is running (any Grafana or pgwatch container is up), `local-install` writes `.env`
(plus `--project` to `.pgwatch-config` and, on a non-git install, the CLI-owned
`docker-compose.yml`), starts or removes `instance-jobs` per `--instance-jobs` /
`--no-instance-jobs`, prints `Monitoring services are already running`, and exits. It does not
touch `instances.yml`, save an `--api-key`, register the instance, or recreate other containers,
so it applies no pulled image and no new admin-endpoint key.

On a stopped stack it runs the full install. Outside `--demo`, that rewrites `instances.yml` with
only the `--db-url` target: pass `--db-url` and re-add any other targets with
[`mon targets add`](#subcommand-group-mon-targets) afterwards.
:::

`local-install` writes `.env` in the monitoring directory, preserving
existing `REPLICATOR_PASSWORD`, `VM_AUTH_*`, and (since 0.17) the
VictoriaMetrics admin-endpoint keys `VM_DELETE_AUTH_KEY`,
`VM_SNAPSHOT_AUTH_KEY`, `VM_FORCE_MERGE_AUTH_KEY`, and `VM_PPROF_AUTH_KEY`,
or generating new random ones when missing. Keys that `local-install`
does not manage (for example a retention setting you added by hand) are
kept on rewrite. `VM_AUTH_USERNAME` defaults to `vmauth` when
absent. The replication password is used by the demo PostgreSQL standby,
and the VM auth credentials are required before Docker Compose can
provision Grafana datasources. To rotate VM auth credentials manually,
run `VM_AUTH_PASSWORD="$(openssl rand -base64 18)" ./scripts/rotate-vm-auth.sh`
from the monitoring directory.

### Subcommand: `mon health`

```bash
postgresai mon health [--wait <seconds>]
```

- `--wait <seconds>` — wait up to `<seconds>` for services to become healthy (default: `0`, i.e. check once and return).

When the instance-jobs profile is enabled (see `mon local-install --instance-jobs`), a missing
`instance-jobs` container is reported as a fault (`enabled but not running`); with the profile
off, it is skipped.

### Subcommand: `mon logs`

```bash
postgresai mon logs [service] [options]
```

- `-f, --follow` — follow logs.
- `--tail <lines>` — number of trailing lines (default: `all`).

### Subcommand: `mon clean`

```bash
postgresai mon clean [--keep-volumes]
```

- `--keep-volumes` — keep data volumes (only stop and remove containers).

### Subcommand group: `mon targets`

Manage databases monitored by the local stack.

```bash
postgresai mon targets <subcommand> [args]
```

**Subcommands**

- `list` — list configured monitoring targets.
- `add [conn-string] [name]` — add a Postgres instance to monitor. Both arguments are optional; missing values are prompted for interactively.
- `remove <name>` — remove a monitoring target.
- `test <name>` — test connectivity to a configured target.

`add` and `remove` keep `instances.yml` (which holds connection strings with passwords)
owner-only (`0600`), tightening an existing file with looser permissions.

## Command: `promql`

Run a PromQL query against a monitoring instance's own metric store,
through the PostgresAI platform (CLI 0.17+). The platform never connects
to the instance: it queues the query as a job, the instance picks it up on
its next poll of its outbound job channel, runs it locally, and posts the
answer back.

**Prerequisites**

- The monitoring instance is registered with the PostgresAI Console and
  runs the `instance-jobs` container. On a self-managed stack, enable it
  with [`mon local-install --instance-jobs`](#subcommand-mon-local-install)
  and confirm with `mon health`. Job delivery must also be enabled on the
  PostgresAI platform side; until it is, the platform refuses every query
  with `403` (`Instance queries are not available on this platform.`). A
  query that stays `queued` means the instance is not polling.
- Expect latency: the first answer cannot arrive before the instance's
  next poll, which by default happens roughly every 10 minutes (jittered).
- Access: any API token that reaches the instance's organization can run
  queries — a per-organization token, or a global token with `--org` —
  with no role check. A query can return any series stored in the
  instance's VictoriaMetrics: label values such as database, table, and
  index names, query ids, and the `pg_stat_statements` query texts
  (truncated to 500 characters) that `pgwatch_query_info` carries as
  labels. The platform stores each result.

**Usage**

```bash
postgresai promql <expr> [options]
```

**Examples**

```bash
# Instant query on the monitoring host itself (instance id read from .pgwatch-config)
postgresai promql 'up'

# Instant query against a project's monitoring instance, at a given time
postgresai promql 'up' --project main-db --at 2026-10-01T12:00:00Z

# Range query
postgresai promql 'sum(rate(pgwatch_db_stats_xact_commit[5m]))' \
  --instance <instance-uuid> \
  --range --start 2026-10-01T00:00:00Z --end 2026-10-01T01:00:00Z --step 60s
```

**Options**

- `--instance <uuid>` — monitoring instance id. Defaults to the `instance_id` in the local monitoring stack's `.pgwatch-config` (written by `mon local-install`). Cannot be combined with `--project`.
- `--project <id|alias>` — use the project's monitoring instance, by project id, alias, or name (case-insensitive). Refused when the project has no or several active monitoring instances, or when the name matches several projects; pass `--instance` (or the numeric project id) instead.
- `--at <rfc3339>` — evaluate an instant query at this time (default: now; ignored with `--range`).
- `--range` — run a range query; requires `--start`, `--end`, and `--step`.
- `--start <rfc3339>`, `--end <rfc3339>` — range bounds.
- `--step <duration>` — range step, e.g. `60s`, `5m`, `1h` (a bare number means seconds).
- `--timeout <duration>` — how long to wait for the answer. Default: sized from the instance's poll pacing as reported by the platform (between 1 and 30 minutes); `11m` if the platform does not report it.
- `--json` — print the raw result payload (every point).
- `--org <alias>` / `--org-id <id>` — see [Organization selection](#organization-selection).

**Output**

An instant query prints a `SERIES` / `VALUE` table; a range query prints
`SERIES` / `POINTS` / `FIRST` / `LAST` (first and last sample per series —
use `--json` for every point), followed by a series and point count. A
result too large to return whole is trimmed and flagged `TRUNCATED`: raise
`--step`, narrow the time range, or select fewer series. The `Queued as job
…` progress line goes to stderr, so `--json` output stays machine-readable.

Exit code `0` means a result was printed. A timeout exits `1` and says
whether the job is still `queued` (nothing picked it up — check that
`instance-jobs` is running on the instance) or `running` (wait, or re-run
with a longer `--timeout`); a failed query exits `1` with the instance's
error text.

## Command: `login`

Authenticate via browser (OAuth) or store an API key directly. This is
the shortest form of `postgresai auth login`; both commands use the same
options and behavior.

**Usage**

```bash
postgresai login                            # OAuth via browser
postgresai login --set-key <key>            # store an API key directly
postgresai login --port 7777 --debug        # use a fixed callback port with debug output
```

**Options**

- `--set-key <key>` — store an API key directly without going through the OAuth flow.
- `--port <port>` — local callback server port (default: random).
- `--debug` — enable debug output.

The browser flow opens your default browser, prompts for organization
selection, and writes the resulting API key to
`~/.config/postgresai/config.json`. Pick a single organization for a
per-organization token, or **All my organizations** for a global token
(see [Organization selection](#organization-selection)). With a global
token — from the browser flow or `--set-key pai_global_…` — any stored
organization ID and default project are removed, and the command prints
`Scope: all organizations you belong to (global token)`.

## Command: `auth`

Authentication and API-key management. `auth` is a command group; the
default subcommand is `login`, so plain `postgresai auth` triggers an
OAuth flow.

**Usage**

```bash
postgresai auth [subcommand] [options]
```

**Subcommands**

- `login` (default) — authenticate via browser (OAuth) or store an API key directly.
- `show-key` — show the current API key, masked, with its scope (the stored organization ID, or "all organizations" for a global token).
- `remove-key` — remove the stored API key.

### Subcommand: `auth login`

```bash
postgresai auth                              # OAuth via browser
postgresai auth --set-key <key>              # store an API key directly
postgresai auth login --port 7777 --debug    # explicit form
```

For a shorter equivalent, use the top-level [`login`](#command-login)
command.

**Options**

- `--set-key <key>` — store an API key directly without going through the OAuth flow.
- `--port <port>` — local callback server port (default: random).
- `--debug` — enable debug output.

The browser flow opens your default browser (OAuth with PKCE), prompts
for organization selection, and writes the resulting API key to
`~/.config/postgresai/config.json`.

`postgresai login` is also available as a top-level alias for
`postgresai auth login` (same options).

## Command: `orgs`

List the organizations the current credential can reach (CLI 0.17+): each
row has `org_id`, `alias`, `name`, and `is_active`. Use the values with
`--org <alias>` or `--org-id <id>` (see
[Organization selection](#organization-selection)). A per-organization
token lists only its own organization. `orgs` takes no `--org` itself and
exits `1` if the credential reaches no organization.

```bash
postgresai orgs [--json] [--debug]
```

Output is YAML on a terminal and JSON when piped or with `--json`.

## Command: `joe`

Run [Joe](/docs/joe-bot) SQL optimization commands on ephemeral
[DBLab](/docs/database-lab) thin clones. See the
[Joe from the CLI how-to](/docs/postgresai-howtos/joe-cli) for a
task-oriented walkthrough.

:::note
The `joe` and `projects` commands require CLI 0.16 or later.
:::

**Usage**

```bash
postgresai joe <subcommand> [arguments] [options]
```

**How it works**

Every `joe` subcommand is synchronous: the CLI submits one raw Joe
command (the same text you could type at Joe in the Console or in chat),
then polls for the result until it is ready or the one-shot poll budget
(default 25 seconds) is exhausted. On budget expiry the CLI exits `0` and
prints a resume handle — fetch the result later with
`postgresai joe result <commandId>`. Each invocation starts a fresh
Joe command; the command and its full result (plans, statistics,
recommendations) are stored in the Joe history in the PostgresAI
Console. For a Joe instance that receives commands over the outbound job
channel (it has no inbound URL for the platform to call), the default
wait is sized from the platform's reply (at least 10 minutes, at most 1
hour) instead of 25 seconds; `--budget` still overrides it.

Running Joe commands requires the token owner to hold the
**AllFeaturesUser** or **Admin** role in the organization; other roles
receive `403 Forbidden`.

**Targeting.** Every `joe` subcommand (except `result`) needs a target.
Provide it in one of three ways: pass `--instance-id`, pass `--project`,
or configure a default project once with
[`set-default-project <project>`](#command-set-default-project) and omit
both flags. Resolution order is `--instance-id`, then `--project`, then
the stored default project — an explicit flag always wins. With no flag
**and** no default project configured, the command errors and prompts you
to supply `--instance-id` (or `--project`).

**Shared options** (every subcommand except `result`)

- `--instance-id <id>` — target the Joe instance id directly (skips `--project` resolution). Takes precedence over `--project` and the default project.
- `--project <id|alias>` — target a project by numeric id OR alias/name (case-insensitive; resolved via the projects API — see [`projects`](#command-projects)). Requires the project to have a registered, active Joe instance. When omitted, falls back to the default project set by [`set-default-project`](#command-set-default-project).
- `--budget <seconds>` — one-shot poll budget in seconds (default: `25`).
- `--org <alias>` / `--org-id <id>` — organization; required with a global token (also accepted by `joe result`). See [Organization selection](#organization-selection).
- `--debug` — enable debug output.
- `--json` — output the full result row as raw JSON (includes `plan_text`, structured `plan_json`, `plan_execution_text`, `plan_execution_json`, `stats`, `recommendations`, `queryid`).

### `joe plan`

`plan <sql>` — plan a query (`EXPLAIN`, plan-only — **no execution**; the fast/safe default).

```bash
postgresai joe plan "select * from users where email = 'x@y.com'" --project main-db
```

### `joe explain`

`explain <sql>` — `EXPLAIN` + `EXPLAIN ANALYZE` a query (**executes** on the DBLab clone).

```bash
postgresai joe explain "select * from users where email = 'x@y.com'" --project 12
```

### `joe exec`

`exec <sql>` — run arbitrary DDL/DML on the clone (e.g. `create index`, `analyze`, `set` planner parameters).

```bash
postgresai joe exec "create index i_users_email on users (email)" --instance-id 34
```

### `joe hypo`

`hypo <args>` — [HypoPG](https://github.com/HYPOPG/hypopg) hypothetical indexes (e.g. `hypo "create index on users (email)"`, `hypo desc`, `hypo reset`).

### `joe activity`

`activity` — running-activity snapshot (`pg_stat_activity`) on the clone.

### `joe terminate`

`terminate <pid>` — `pg_terminate_backend(pid)` on the clone. The pid must be a bare positive integer; anything else is rejected client-side before any API call.

### `joe reset`

`reset` — reset/recreate the session's thin clone.

### `joe describe`

`describe <object>` — `\d`-family schema/relation/index metadata. Takes
`--variant <variant>` to select the `\d`-family form (default `\d`).
Supported variants: `\d`, `\d+`, `\dt`, `\dt+`, `\di`, `\di+`, `\l`,
`\l+`, `\dv`, `\dv+`, `\dm`, `\dm+`.

```bash
postgresai joe describe users --variant '\d+' --project main-db
```

### `joe result`

`result <commandId>` — fetch a Joe command's output by id (resume a
budget-expired one-shot; accepts only `--debug` / `--json` and the
organization options).

```bash
postgresai joe result 3523
```

### Output and exit codes for `joe`

Human-readable output prints `command <id> · ok` followed by whichever
sections the result contains: the response text, `plan:`, client-side
plan flags (`⚑ …`, e.g. flagging a Seq Scan), `execution plan (EXPLAIN
ANALYZE):`, `stats:`, `recommendations:`, and the `queryid`.

Exit codes:

- `0` — terminal `ok` result, or budget expired (resume by id).
- `1` — terminal `error` result, `result` on a still-pending command, or any other failure.

## Command: `projects`

List the organization's projects, showing which ones have Joe ready.
This is org-level discovery (not a Joe endpoint): it powers
`--project <id|alias>` resolution for [`joe`](#command-joe) commands.

**Usage**

```bash
postgresai projects [--json] [--debug] [--org <alias> | --org-id <id>]
```

**Output columns**

- `PROJECT_ID` — numeric project id (usable as `--project <id>`).
- `ALIAS` — project alias (usable as `--project <alias>`; `-` if not set).
- `PROJECT` — human-readable project name.
- `JOE` — `ready` when the project has an active Joe instance targetable by `joe` commands; `no` otherwise.
- `TUNNEL` — whether the project's DBLab tunnel is connected.

With `--json`, each row also includes `instance_id` (the Joe instance id
that `joe` commands target — usable as `--instance-id`) and
`dblab_instance_id` (the project's active DBLab instance, not used by
`joe` commands).

```
PROJECT_ID  ALIAS      PROJECT        JOE    TUNNEL
12          main-db    Main DB        ready  yes
15          analytics  Analytics      no     no
```

## Command: `dblab`

Manage [DBLab](/docs/database-lab) thin clones, branches, and snapshots
of a project's DBLab instance (CLI 0.16+). The commands proxy the same
Platform DBLab API the Console uses: the CLI resolves the project's active
DBLab instance through the projects listing (see
[`projects`](#command-projects)), then forwards the call.

**Usage**

```bash
postgresai dblab <clone|branch|snapshot> <subcommand> [arguments] --project <id|alias> [options]
```

**Shared options** (every subcommand)

- `--project <id|alias>` — **required**. Project by numeric id, or by alias or name (case-insensitive). The project must have an active DBLab instance registered in the Console.
- `--org <alias>` / `--org-id <id>` — organization; required with a global token. See [Organization selection](#organization-selection).
- `--json` — output raw JSON. Without it, output is YAML on a terminal and JSON when piped.
- `--debug` — enable debug output (clone passwords are redacted).

**Permissions.** Listing, viewing, creating, and `clone reset` work for
any valid token for the organization. The destructive commands — `clone
destroy`, `branch delete`, and `snapshot destroy` — require the token
owner to hold the **Admin** or **AllFeaturesUser** role; other roles
receive HTTP `403`.

**Lost replies.** If a call times out or its reply is lost, the CLI does
not re-send it, because it may still complete on the instance. Check the
current state (for example `dblab clone list`) before running the command
again.

### `dblab clone`

- `create` — create a thin clone of the project's database.
  - `--branch <branch>` — branch to clone from.
  - `--snapshot <id>` — snapshot to clone from.
  - `--id <id>` — clone id (DBLab generates one when omitted).
  - `--db-user <user>` — database user for the clone. Its password is read from the `PGAI_CLONE_DB_PASSWORD` environment variable; set both or neither.
  - `--protected` — protect the clone from auto-deletion.
- `list` — list the project's clones.
- `status <cloneId>` — show a clone's status. Like `create`, the reply can include connection details, so treat the output as sensitive.
- `reset <cloneId>` — reset a clone: `--snapshot <id>` to reset to a specific snapshot, or `--latest` (the default when no snapshot is given).
- `destroy <cloneId>` — destroy a clone (Admin or AllFeaturesUser).

### `dblab branch`

- `list` — list the project's branches.
- `create <name>` — create a branch; `--snapshot <id>` to base it on a snapshot, `--base-branch <branch>` to fork from a parent branch.
- `delete <name>` — delete a branch (Admin or AllFeaturesUser).
- `log <name>` — show a branch's snapshot log.

### `dblab snapshot`

- `list` — list the project's snapshots; filter with `--branch <branch>` or `--dataset <dataset>`.
- `create` — create a snapshot from a clone: `--clone <id>` (required), optional `--message <message>`.
- `destroy <snapshotId>` — destroy a snapshot (Admin or AllFeaturesUser); `--force` deletes it even when dependent clones exist.

**Examples**

```bash
read -rs PGAI_CLONE_DB_PASSWORD && export PGAI_CLONE_DB_PASSWORD   # type the password; not echoed
postgresai dblab clone create --project main-db --db-user dev --protected
postgresai dblab clone list --project main-db
postgresai dblab snapshot create --project main-db --clone <clone-id> --message "after migration"
postgresai dblab branch create feature-x --project main-db --snapshot <snapshot-id>
postgresai dblab clone destroy <clone-id> --project main-db
```

## Command: `issues`

Manage issues, comments, and action items in the PostgresAI Console.

**Usage**

```bash
postgresai issues <subcommand> [options]
```

All `issues` subcommands accept `--debug` (enable debug output) and
`--json` (force raw JSON output instead of the default human-friendly
YAML). When stdout is not a TTY (e.g. piped or redirected), JSON is
selected automatically. All of them also accept `--org <alias>` /
`--org-id <id>`, required with a global token (see
[Organization selection](#organization-selection)).

**Subcommands**

- `list` — list issues.
- `view <issueId>` — view issue details and comments.
- `create <title> [options]` — create a new issue.
- `update <issueId> [options]` — update an existing issue.
- `post-comment <issueId> <content> [options]` — post a comment.
- `update-comment <commentId> <content> [options]` — update an existing comment.
- `files upload <path>` — upload a file to storage and print a markdown link.
- `files download <url> [-o <path>]` — download a file from storage.
- `action-items <issueId>` — list action items for an issue.
- `view-action-item <id> [<id> ...]` — view one or more action items in detail.
- `create-action-item <issueId> <title> [options]` — create an action item.
- `update-action-item <actionItemId> [options]` — update an action item.

### `issues list`

```bash
postgresai issues list [--status <status>] [--limit <n>] [--offset <n>]
```

- `--status <status>` — filter by status: `open` (default), `closed`, or `all`. Any other value is rejected.
- `--limit <n>` — maximum number of issues to return (default: `20`).
- `--offset <n>` — number of issues to skip (default: `0`).

:::note Changed in 0.17
`issues list` shows only **open** issues unless you pass `--status closed`
or `--status all` (before 0.17 the default was `all`). `issues list` and
`issues view` print `status` as `open` / `closed` instead of `0` / `1`,
including in JSON output — update scripts that compare `.status == 0`
to `.status == "open"`.
:::

### `issues view`

```bash
postgresai issues view <issueId>
```

### `issues create`

```bash
postgresai issues create <title> [options]
```

- `--org <alias>` / `--org-id <id>` — organization to create the issue in. Optional with a per-organization token (defaults to the stored organization ID); required with a global token.
- `--project-id <id>` — project ID.
- `--description <text>` — issue description (use `\n` for newlines).
- `--label <label>` — issue label; repeat to add multiple.
- `--attach <path>` — attach a local file (uploads to storage and appends a markdown link to the description); repeatable.

### `issues update`

```bash
postgresai issues update <issueId> [options]
```

- `--title <text>` — new title (use `\n` for newlines).
- `--description <text>` — new description (use `\n` for newlines).
- `--status <value>` — `open`, `closed`, `0`, or `1`.
- `--label <label>` — set labels; repeatable. If provided, replaces existing labels.
- `--clear-labels` — set labels to an empty list.
- `--attach <path>` — attach a file; appends a markdown link to `--description`. If `--description` is omitted, the existing description is fetched and the link appended to it.

### `issues post-comment`

```bash
postgresai issues post-comment <issueId> <content> [options]
```

- `--parent <uuid>` — parent comment ID (for threaded replies).
- `--attach <path>` — attach a file; appends a markdown link to the comment body. Repeatable.

### `issues update-comment`

```bash
postgresai issues update-comment <commentId> <content> [options]
```

- `--attach <path>` — attach a file; appends a markdown link to `<content>`. Repeatable.

### `issues files`

```bash
# Upload a local file; prints the storage URL and a ready-to-paste markdown link.
postgresai issues files upload <path>

# Download a file from storage; without -o, derives the filename from the URL.
postgresai issues files download <url> [-o <output_path>]
```

#### Attaching files to issues and comments (`--attach`)

`create`, `update`, `post-comment`, and `update-comment` accept a
repeatable `--attach <path>` flag. Each file is uploaded to PostgresAI
storage and a markdown link is appended to the comment body or issue
description. Image extensions (`.png`, `.jpg`, `.jpeg`, `.gif`,
`.webp`, `.svg`, `.bmp`, `.ico`) render inline as `![](url)`; other
files render as `[](url)`. Multiple `--attach` flags preserve order;
each link goes on its own line.

```bash
# Attach a screenshot to a new comment
postgresai issues post-comment <issueId> "Saw this in prod" --attach screenshot.png

# Attach multiple files to a new issue
postgresai issues create "Slow query" --org-id 4 \
  --description "Plan attached" --attach plan.txt --attach flame.svg

# Attach a file to an existing issue without changing the description
postgresai issues update <issueId> --attach trace.log
```

### `issues action-items`

```bash
postgresai issues action-items <issueId>
postgresai issues view-action-item <actionItemId> [<actionItemId> ...]
```

### `issues create-action-item`

```bash
postgresai issues create-action-item <issueId> <title> [options]
```

- `--description <text>` — detailed description (use `\n` for newlines).
- `--sql-action <sql>` — SQL command to execute.
- `--config <json>` — config change as JSON, e.g. `'{"parameter":"work_mem","value":"64MB"}'`. Repeatable.

### `issues update-action-item`

```bash
postgresai issues update-action-item <actionItemId> [options]
```

- `--title <text>`, `--description <text>` — update title or description.
- `--done` / `--not-done` — mark as done or not done.
- `--status <value>` — `waiting_for_approval`, `approved`, or `rejected`.
- `--status-reason <text>` — reason for the status change.
- `--sql-action <sql>` — update the SQL command (use `""` to clear).
- `--config <json>` — replace config changes; repeatable.
- `--clear-configs` — remove all config changes.

### Output format for `issues` commands

By default, `issues` commands print human-friendly YAML to a terminal.
For scripting:

- Pass `--json` to force JSON output:

  ```bash
  postgresai issues list --json | jq '.[] | {id, title}'
  ```

- Or rely on auto-detection: when stdout is not a TTY, output is JSON
  automatically:

  ```bash
  postgresai issues view <issueId> > issue.json
  ```

## Command: `reports`

List and download checkup reports stored in the PostgresAI Console.

**Usage**

```bash
postgresai reports <subcommand> [options]
```

**Subcommands**

- `list [options]` — list checkup reports.
- `files [reportId] [options]` — list files (metadata only) of a checkup report.
- `data [reportId] [options]` — fetch report file contents (markdown / JSON).

All `reports` subcommands accept `--org <alias>` / `--org-id <id>`,
required with a global token (see
[Organization selection](#organization-selection)).

### `reports list`

```bash
postgresai reports list [options]
```

- `--project-id <id>` — filter by project ID.
- `--limit <n>` — maximum number of reports to return (default: `20`, max: `100`).
- `--before <date>` — show reports created before this date (`YYYY-MM-DD`, `DD.MM.YYYY`, etc.).
- `--all` — fetch all reports (paginated automatically). Mutually exclusive with `--before`.
- `--json` — output raw JSON.

### `reports files`

```bash
postgresai reports files [reportId] [options]
```

Either `reportId` or `--check-id` is required.

- `--type <type>` — filter by file type: `json` or `md`.
- `--check-id <id>` — filter by check ID (e.g. `H002`).
- `--json` — output raw JSON.

### `reports data`

```bash
postgresai reports data [reportId] [options]
```

- `--type <type>` — filter by file type: `json` or `md`.
- `--check-id <id>` — filter by check ID (e.g. `H002`).
- `--formatted` — render markdown with ANSI styling (experimental).
- `-o, --output <dir>` — save files to a directory (using their original filenames).
- `--json` — output raw JSON.

## Command: `mcp`

MCP (Model Context Protocol) server integration for AI coding tools.

**Usage**

```bash
postgresai mcp <subcommand> [options]
```

**Subcommands**

- `start` — start the MCP stdio server, exposing PostgresAI tools.
- `install [client]` — install MCP client configuration for a supported AI coding tool.

### `mcp start`

```bash
postgresai mcp start [--debug]
```

Starts an MCP server over stdio. Intended to be launched by an MCP
client (e.g. Cursor, Claude Code) rather than invoked directly.

### `mcp install`

```bash
postgresai mcp install [client]
```

Installs an `mcpServers.postgresai` entry pointing at the **absolute
path of the `pgai` binary that invoked `mcp install`**, with `mcp
start` as its arguments.

`client` may be one of:

- `cursor` — writes to `~/.cursor/mcp.json`.
- `claude-code` — runs `claude mcp add -s user postgresai <pgai> mcp start`.
- `windsurf` — writes to `~/.windsurf/mcp.json`.
- `codex` — writes to `~/.codex/mcp.json`.

If `client` is omitted, you are prompted to choose interactively
(1=Cursor, 2=Claude Code, 3=Windsurf, 4=Codex).

:::note

The pinned `command` path is the absolute path resolved at install
time. When `mcp install` is run via `npx` or `bunx`, that path points
into the package cache and may be garbage-collected. For a stable
install, run `mcp install` from a globally installed CLI
(`npm install -g postgresai` or `brew install postgresai`), or re-run
`mcp install` after each CLI upgrade.

:::

A typical Cursor entry written by `mcp install` looks like:

```json
{
  "mcpServers": {
    "postgresai": {
      "command": "<absolute-path-to-pgai>",
      "args": ["mcp", "start"]
    }
  }
}
```

The `command` value is the absolute path resolved by `mcp install` at
install time. Typical values:

- `/opt/homebrew/bin/pgai` — Homebrew on Apple Silicon macOS
- `/usr/local/bin/pgai` — Homebrew on Intel macOS or `npm install -g` on Linux/macOS
- `~/.nvm/versions/node/<version>/bin/pgai` — `npm install -g` under nvm
- `~/.npm/_npx/<hash>/node_modules/.bin/pgai` — invoked via `npx` (ephemeral; see the note above)

To point the server at a non-production endpoint, add an `env` block
manually:

```json
"env": {
  "PGAI_API_BASE_URL": "https://v2.postgres.ai/api/general/",
  "PGAI_UI_BASE_URL": "https://console-dev.postgres.ai"
}
```

**MCP tools exposed**

The 0.15 MCP server registers 15 tools in four groups.

*Issues:*

- `list_issues` — same JSON as `postgresai issues list`.
- `view_issue` — view a single issue with its comments.
- `create_issue` — create a new issue.
- `update_issue` — update title / description / status / labels.
- `post_issue_comment` — post a comment.
- `update_issue_comment` — update an existing comment.

*Action items:*

- `list_action_items` — list action items for an issue.
- `view_action_item` — view one or more action items with full detail.
- `create_action_item` — create an action item (title, description, optional `sql_action` and config changes) for an issue.
- `update_action_item` — mark done / not done, approve / reject, or edit an action item.

*Reports:* (new in 0.15 — the only place the reports capability is exposed to AI agents)

- `list_reports` — list checkup reports (metadata: id, project, status, timestamps; supports `before_date` filtering).
- `list_report_files` — list files in a report (per-check `json` / `md` files; filter by `report_id`, `type`, or `check_id`).
- `get_report_data` — fetch report file content (`type=md` for analysis, `type=json` for raw check data).

*Files:*

- `upload_file` — upload a local file and return the storage URL plus a ready-to-paste markdown link.
- `download_file` — download a file from storage.

**Organization (`org_id`).** Every tool takes an optional numeric `org_id`
argument. With a per-organization token it falls back to the stored
organization ID; with a **global token it is required** — the server does not
assume an organization. Run [`postgresai orgs`](#command-orgs) to find the
ids. As in the CLI, `list_issues` and `view_issue` return `status` as
`open` / `closed`; unlike the CLI, `list_issues` without `status` returns
both open and closed issues (pass `status: "open"` to match the CLI
default).

The issue / comment tools accept an optional `attachments: string[]` of
local file paths. Each file is uploaded to PostgresAI storage and the
resulting markdown link is appended to the comment body or issue
description, using the same image-extension rules as the `--attach`
CLI flag.

For `post_issue_comment` and `update_issue_comment`, either `content` or
`attachments` must be non-empty (attachments alone are allowed). For
`update_issue` with `attachments` but no `description`, the existing
description is fetched first and the new links are appended to it.

#### MCP threat model

The MCP server runs in your local user account with your PostgresAI API
key. It treats the connected MCP client (the LLM agent) as **trusted** —
the same way the CLI treats you when you type a command. In particular:

- `upload_file` and the `attachments: string[]` parameter on the issue /
  comment tools read **any local file the CLI process can read**,
  including secrets like `~/.ssh/id_rsa`, `~/.aws/credentials`, or
  `~/.config/postgresai/config.json` (which contains your own API
  key). The file's bytes are uploaded to PostgresAI storage and the
  resulting URL becomes visible to anyone with read access to the
  issue or comment it ends up in.
- `download_file` writes to **any path the CLI process can write to**
  when `output_path` is supplied (`~/.ssh/authorized_keys`,
  `~/.bashrc`, etc. are all fair game). When `output_path` is omitted,
  downloads are restricted to the current working directory.

This is fine when the agent and the upstream context the agent is
reading are trusted. It is **not** safe to run this MCP server against
an agent that is processing untrusted text (issue bodies, comments, web
pages, third-party docs) without additional sandboxing — a
prompt-injection in any input the agent reads could be used to
exfiltrate local secrets or write arbitrary files. If you need to
expose this MCP server to such an agent, run the agent (and this
server) in a container or restricted user account that has no access
to anything sensitive.

## Command: `set-default-project`

Store the default project used for `checkup` uploads and other
project-scoped operations.

```bash
postgresai set-default-project <project>
```

## Command: `set-storage-url`

Store the storage base URL used for file uploads. Equivalent to setting
`PGAI_STORAGE_BASE_URL` permanently in the configuration file.

```bash
postgresai set-storage-url <url>
```

## Command: `feedback`

Print where to share ideas or feedback about the CLI.

```bash
postgresai feedback [--open] [--json]
```

- `--open` — also open the feedback page in your browser.
- `--json` — print the feedback URL as JSON.

## Configuration

The CLI stores configuration in `~/.config/postgresai/config.json`,
including:

- API key
- API / UI / storage base URLs
- Organization ID (per-organization tokens only)
- Default project (per-organization tokens only)

The file is kept owner-only (`0600`), since it holds the API key.

### Configuration priority

API key resolution order:

1. Command-line option (`--api-key`).
2. Environment variable (`PGAI_API_KEY`).
3. User config file (`~/.config/postgresai/config.json`).
4. Legacy project config (`.pgwatch-config`).

Base URL resolution order:

- API base URL (`apiBaseUrl`):
  1. Command-line option (`--api-base-url`).
  2. Environment variable (`PGAI_API_BASE_URL`).
  3. User config file (`baseUrl` in `~/.config/postgresai/config.json`).
  4. Default: `https://postgres.ai/api/general/`.
- UI base URL (`uiBaseUrl`):
  1. Command-line option (`--ui-base-url`).
  2. Environment variable (`PGAI_UI_BASE_URL`).
  3. Default: `https://console.postgres.ai`.
- Storage base URL (`storageBaseUrl`):
  1. Command-line option (`--storage-base-url`).
  2. Environment variable (`PGAI_STORAGE_BASE_URL`).
  3. Value stored by `postgresai set-storage-url`.
  4. Default: `https://postgres.ai/storage`.

A single trailing `/` is stripped from URL values to ensure consistent
path joining.

### Environment variables

- `PGAI_API_KEY` — API key for PostgresAI services.
- `PGAI_ORG` — organization alias for organization-scoped commands (equivalent to `--org`; see [Organization selection](#organization-selection)).
- `PGAI_ORG_ID` — numeric organization id (equivalent to `--org-id`). Setting both `PGAI_ORG` and `PGAI_ORG_ID` is an error.
- `PGAI_API_BASE_URL` — API endpoint for backend RPC (default: `https://postgres.ai/api/general/`).
- `PGAI_UI_BASE_URL` — UI endpoint for browser routes (default: `https://console.postgres.ai`).
- `PGAI_STORAGE_BASE_URL` — storage endpoint for file uploads.
- `PGAI_MON_PASSWORD` — default password for the monitoring role created by `prepare-db`.
- `PGPASSWORD` — admin password used by `prepare-db` / `unprepare-db` when `--admin-password` is not given.
- `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` — credentials for `prepare-db --supabase`.
- `PGAI_INSTANCE_ID`, `PGAI_VCPUS`, `PGAI_INSTANCE_JOBS` — equivalents of `mon local-install --instance-id`, `--vcpus`, and `--instance-jobs` / `--no-instance-jobs`.
- `PGAI_CLONE_DB_PASSWORD` — password for the clone user given with `dblab clone create --db-user`.

### Examples

For production (uses default URLs):

```bash
postgresai auth --debug
```

For staging / development environments:

```bash
# Linux / macOS (bash, zsh)
export PGAI_API_BASE_URL=https://v2.postgres.ai/api/general/
export PGAI_UI_BASE_URL=https://console-dev.postgres.ai
postgresai auth --debug
```

```powershell
# Windows PowerShell
$env:PGAI_API_BASE_URL = "https://v2.postgres.ai/api/general/"
$env:PGAI_UI_BASE_URL = "https://console-dev.postgres.ai"
postgresai auth --debug
```

Via CLI options (overrides environment variables):

```bash
postgresai auth --debug \
  --api-base-url https://v2.postgres.ai/api/general/ \
  --ui-base-url https://console-dev.postgres.ai
```
