---
title: PostgresAI CLI reference
sidebar_label: PostgresAI CLI
keywords:
  - "postgresai cli"
  - "postgres_ai cli"
  - "postgres_ai monitoring cli"
  - "mcp"
  - "issues"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Description

PostgresAI Command Line Interface (`postgresai`) is a tool for working with postgres_ai monitoring, including authentication, MCP integration, and issue management.

## Getting started

To install and authenticate, see [PostgresAI CLI](/docs/postgresai-howtos/postgresai-cli).

## Synopsis

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai [global options] <command> [command options] [arguments...]
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai [global options] <command> [command options] [arguments...]
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai [global options] <command> [command options] [arguments...]
```

</TabItem>
</Tabs>

Run `postgresai --help` to list available commands and global options. For command-specific help, run `postgresai <command> --help`.

## Command overview

```
COMMANDS:
  auth        authenticate via browser and store API key locally
  init        create a monitoring role, required view(s), and grant permissions
  mon         manage monitoring services
  issues      manage issue reports in PostgresAI Console
  mcp         MCP server integration for AI coding tools
  add-key     store API key locally
  show-key    show the current API key (masked)
  remove-key  remove the stored API key
```

## Command: `auth`

Authenticate via browser and store the API key locally.

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai auth
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai auth
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai auth
```

</TabItem>
</Tabs>

**Notes**

- Configuration is stored in `~/.config/postgresai/config.json`.

## Command: `init`

Create or update the monitoring role, required view(s), and grant required permissions (idempotent).

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai init <conn>
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai init <conn>
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai init <conn>
```

</TabItem>
</Tabs>

**Examples**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai init postgresql://admin@host:5432/dbname
postgresai init "dbname=dbname host=host user=admin"
postgresai init -h host -p 5432 -U admin -d dbname
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai init postgresql://admin@host:5432/dbname
npx postgresai init "dbname=dbname host=host user=admin"
npx postgresai init -h host -p 5432 -U admin -d dbname
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai init postgresql://admin@host:5432/dbname
bunx postgresai init "dbname=dbname host=host user=admin"
bunx postgresai init -h host -p 5432 -U admin -d dbname
```

</TabItem>
</Tabs>

**Common options**

- `--verify`: verify that monitoring role/permissions are in place (no changes).
- `--reset-password`: reset monitoring role password only.
- `--print-sql`: print SQL plan and exit (no changes applied).
- `--skip-optional-permissions`: skip optional permissions (managed and self-managed extras).

## Command: `mon`

Manage monitoring services.

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai mon <subcommand> [options]
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai mon <subcommand> [options]
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai mon <subcommand> [options]
```

</TabItem>
</Tabs>

**Subcommands**

- `quickstart`: complete setup (generate config and start services).
- `start`: start monitoring services.
- `stop`: stop monitoring services.
- `restart [service]`: restart all services or a specific service.
- `status`: show services status.
- `health`: check that services are up and healthy.
- `targets`: manage databases to monitor.
- `logs [service]`: show logs for all or a specific service.
- `config`: show monitoring configuration.
- `update-config`: apply configuration changes (generate sources).
- `update`: update monitoring stack.
- `reset [service]`: reset all or a specific service data.
- `clean`: cleanup artifacts.
- `check`: system readiness check.
- `shell <service>`: open a shell in a monitoring service container.
- `generate-grafana-password`: generate a new Grafana password.
- `show-grafana-credentials`: show Grafana credentials.

### Subcommand: `quickstart`

Complete setup (generate config and start monitoring services).

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai mon quickstart [--demo] [--api-key <key>] [--db-url <url>] [-y]
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai mon quickstart [--demo] [--api-key <key>] [--db-url <url>] [-y]
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai mon quickstart [--demo] [--api-key <key>] [--db-url <url>] [-y]
```

</TabItem>
</Tabs>

### Subcommand group: `targets`

Manage databases to monitor.

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai mon targets <subcommand> [args]
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai mon targets <subcommand> [args]
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai mon targets <subcommand> [args]
```

</TabItem>
</Tabs>

**Subcommands**

- `list`: list configured monitoring targets.
- `add <conn-string> [name]`: add a Postgres instance to monitor.
- `remove <name>`: remove a monitoring target.
- `test <name>`: test connectivity to a configured target.

## Command: `issues`

Manage issue reports in PostgresAI Console.

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai issues <subcommand> [options]
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai issues <subcommand> [options]
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai issues <subcommand> [options]
```

</TabItem>
</Tabs>

**Subcommands**

- `list`: list issues.
- `view <issue_id>`: view issue details (and comments).
- `post_comment <issue_id> <content>`: post a comment to an issue.

**Examples**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai issues list
postgresai issues view <issue_id>
postgresai issues post_comment <issue_id> "comment"
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai issues list
npx postgresai issues view <issue_id>
npx postgresai issues post_comment <issue_id> "comment"
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai issues list
bunx postgresai issues view <issue_id>
bunx postgresai issues post_comment <issue_id> "comment"
```

</TabItem>
</Tabs>

## Command: `mcp`

MCP server integration for AI coding tools.

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai mcp <subcommand> [options]
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai mcp <subcommand> [options]
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai mcp <subcommand> [options]
```

</TabItem>
</Tabs>

**Subcommands**

- `start`: start the MCP server in stdio mode.
- `install [client]`: install MCP client configuration for a supported tool.

## Command: `add-key`

Store an API key locally.

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai add-key <key>
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai add-key <key>
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai add-key <key>
```

</TabItem>
</Tabs>

## Command: `show-key`

Show the currently configured API key (masked).

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai show-key
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai show-key
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai show-key
```

</TabItem>
</Tabs>

## Command: `remove-key`

Remove the stored API key.

**Usage**

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai remove-key
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai remove-key
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai remove-key
```

</TabItem>
</Tabs>
