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
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Description

PostgresAI Command Line Interface is a tool for working with PostgresAI:
preparing databases for monitoring, running local monitoring stacks,
generating health-check reports, browsing and managing issues in the
PostgresAI Console, and exposing PostgresAI tools to AI coding clients
over MCP.

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

## Command overview

```
COMMANDS:
  prepare-db            prepare a database for monitoring (idempotent)
  unprepare-db          remove monitoring setup from a database
  checkup               generate health-check reports directly from PostgreSQL
  mon                   manage the local monitoring stack
  auth                  authenticate and manage the local API key
  issues                manage issues, comments, and action items in PostgresAI Console
  reports               list and download checkup reports stored in PostgresAI Console
  mcp                   MCP server integration for AI coding tools
  set-default-project   store the default project for checkup uploads
  set-storage-url       store the storage base URL for file uploads
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
- `--project <project>` — project name or ID for the upload (used with `--upload`). Defaults to the value stored by [`set-default-project`](#command-set-default-project); a project is auto-generated on first run if needed.
- `--json` — print JSON to stdout.
- `--markdown` — print Markdown to stdout.

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
(I/O) groups — there are no K (query) checks in the express-mode CLI. In addition to the index
(`H00x`) checks, 0.15 ships the estimated bloat checks:

| Check | Finds |
|-------|-------|
| `F004` | Autovacuum: heap bloat (estimated) |
| `F005` | Autovacuum: index bloat (estimated) |

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
- `start` — start monitoring services. Runs `docker compose up -d` **only when the stack is not already running**: if any Grafana/pgwatch container is already up, it prints `Monitoring services are already running` and exits **without** running `up -d` (suggesting `mon restart`). When it does run, `up -d` creates or recreates containers as needed, so it applies a newly pulled image and triggers a `config-init` reseed when the image version no longer matches the config-volume marker. It uses plain `docker compose up -d` (not `--force-recreate`). A full-stack `up -d --force-recreate` is used by `mon local-install`; `mon targets add`/`remove` also force-recreate, but only the two pgwatch collector containers (`pgwatch-prometheus`, `pgwatch-postgres`). On an **already-running** stack a bare `mon start` is therefore a no-op — to apply a pulled image or recreate `config-init` on a live stack, run `docker compose up -d` directly, or `mon stop` then `mon start`.
- `stop` — stop monitoring services.
- `restart [service]` — restart all services or a specific one (`docker compose restart [service]`). Restarts the **existing** containers in place: it does **not** recreate them, does **not** apply a newly pulled image, and does **not** trigger a `config-init` reseed. To apply a new image or changed container env vars on a running stack, recreate the containers with `docker compose up -d` (a bare `mon start` no-ops while the stack is running, since it short-circuits with `Monitoring services are already running`).
- `status` — show services status.
- `health` — check that services are up and healthy.
- `logs [service]` — show logs for all services or a specific one.
- `config` — show monitoring configuration.
- `update-config` — apply configuration changes after editing `.env`: migrates `.env` additively (preserving existing values), refreshes the CLI-owned `docker-compose.yml` for non-git installs, and regenerates the pgwatch `sources.yml` (`docker compose run --rm sources-generator`). It does **not** regenerate the Grafana datasources, reseed the config volume, or restart any service.
- `update` — update the monitoring stack: migrates `.env` additively (preserving existing values), refreshes the repo/compose, and pulls the pinned images for the current tag (`docker compose pull`). It does **not** restart, recreate, or `up` any service — afterward you must recreate the containers to apply the new images. On a running stack do this with `docker compose up -d` directly (or `mon stop` then `mon start`, or re-run `mon local-install`, which uses `up -d --force-recreate`). The command prints a hint to run `mon restart`, but `docker compose restart` restarts containers in place on the old image and does not apply a pulled image; and a bare `mon start` is a **no-op** while the stack is running (it short-circuits with `Monitoring services are already running`), so it will not apply the new image on its own either. See [Upgrading the monitoring stack](/docs/monitoring/getting-started/upgrade) for the full upgrade flow (including the required `VM_AUTH_*` keys in 0.15).
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
- `--api-key <key>` — PostgresAI API key for automated report uploads.
- `--db-url <url>` — PostgreSQL connection URL to monitor (form: `postgresql://user:pass@host:port/db`).
- `--tag <tag>` — Docker image tag to use (e.g. `0.15.0`, `0.15.0-dev.33`).
- `--project <name>` — project name. Used as the Docker Compose project name (default: `postgres_ai`). When an `--api-key` is supplied (non-demo install), it is **also** used as the project name when registering this monitoring instance with the PostgresAI Console; the registration default is `postgres-ai-monitoring`.
- `-y, --yes` — accept all defaults and skip interactive prompts.

`local-install` writes `.env` in the monitoring directory, preserving
existing `REPLICATOR_PASSWORD` and `VM_AUTH_*` values or generating new
random ones when missing. `VM_AUTH_USERNAME` defaults to `vmauth` when
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
- `show-key` — show the current API key, masked.
- `remove-key` — remove the stored API key.

### Subcommand: `auth login`

```bash
postgresai auth                              # OAuth via browser
postgresai auth --set-key <key>              # store an API key directly
postgresai auth login --port 7777 --debug    # explicit form
```

**Options**

- `--set-key <key>` — store an API key directly without going through the OAuth flow.
- `--port <port>` — local callback server port (default: random).
- `--debug` — enable debug output.

The browser flow opens your default browser, prompts for organization
selection, and writes the resulting API key to
`~/.config/postgresai/config.json`.

## Command: `issues`

Manage issues, comments, and action items in the PostgresAI Console.

**Usage**

```bash
postgresai issues <subcommand> [options]
```

All `issues` subcommands accept `--debug` (enable debug output) and
`--json` (force raw JSON output instead of the default human-friendly
YAML). When stdout is not a TTY (e.g. piped or redirected), JSON is
selected automatically.

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

- `--status <status>` — filter by status: `open`, `closed`, or `all` (default: `all`).
- `--limit <n>` — maximum number of issues to return (default: `20`).
- `--offset <n>` — number of issues to skip (default: `0`).

### `issues view`

```bash
postgresai issues view <issueId>
```

### `issues create`

```bash
postgresai issues create <title> [options]
```

- `--org-id <id>` — organization ID (defaults to the configured `orgId`).
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

## Configuration

The CLI stores configuration in `~/.config/postgresai/config.json`,
including:

- API key
- API / UI / storage base URLs
- Organization ID
- Default project

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
- `PGAI_API_BASE_URL` — API endpoint for backend RPC (default: `https://postgres.ai/api/general/`).
- `PGAI_UI_BASE_URL` — UI endpoint for browser routes (default: `https://console.postgres.ai`).
- `PGAI_STORAGE_BASE_URL` — storage endpoint for file uploads.
- `PGAI_MON_PASSWORD` — default password for the monitoring role created by `prepare-db`.
- `PGPASSWORD` — admin password used by `prepare-db` / `unprepare-db` when `--admin-password` is not given.
- `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` — credentials for `prepare-db --supabase`.

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
