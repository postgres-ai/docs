---
title: How to install MCP for AI coding tools
sidebar_label: Install MCP
description: Install MCP integration for Cursor, Claude Code, Windsurf, and Codex.
keywords:
  - "postgresai mcp"
  - "mcp integration"
  - "cursor"
  - "claude code"
  - "windsurf"
  - "codex"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to install MCP for AI coding tools

MCP (Model Context Protocol) allows AI coding tools to interact with PostgresAI services. This guide shows how to install MCP integration for supported tools.

## Supported tools

- Cursor
- Claude Code
- Windsurf
- Codex

## Prerequisites

1. Authenticated with PostgresAI (see below)

## Authenticate

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

## Install MCP

Run the following command to install MCP for your AI coding tool:

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai mcp install
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai mcp install
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai mcp install
```

</TabItem>
</Tabs>

Without arguments, `mcp install` prints a numbered menu and asks you to pick a tool:

```
Available AI coding tools:
  1. Cursor
  2. Claude Code
  3. Windsurf
  4. Codex
Select your AI coding tool (1-4):
```

To skip the prompt, pass the client name as an argument: `postgresai mcp install <client>`, where `<client>` is one of `cursor`, `claude-code`, `windsurf`, or `codex`.

:::note

`mcp install` pins the absolute path of the `pgai` binary it was invoked from into the client config. If you ran the command via `npx` or `bunx`, the pinned path points into a per-version package cache that may be garbage-collected. For a stable install, prefer `npm install -g postgresai` (or `brew install postgresai`) before running `mcp install`, or re-run `mcp install` after each CLI upgrade.

:::

## Verify installation

After installation, restart your AI coding tool. The PostgresAI MCP server exposes 15 tools (see the [`mcp` section of the CLI reference](/docs/reference-guides/postgresai-cli-reference#command-mcp) for full details):

- **Issues:** `list_issues`, `view_issue`, `create_issue`, `update_issue` — browse and manage issues in the PostgresAI Console.
- **Issue comments:** `post_issue_comment`, `update_issue_comment` — comment on issues.
- **Action items:** `list_action_items`, `view_action_item`, `create_action_item`, `update_action_item` — manage action items on an issue (including the approval workflow).
- **Reports:** `list_reports`, `list_report_files`, `get_report_data` — list and read checkup reports stored in the Console.
- **Files:** `upload_file`, `download_file` — upload local files to PostgresAI storage and download them back.

To check the install landed, inspect the client config file. For Cursor:

```bash
cat ~/.cursor/mcp.json
```

You should see a `postgresai` entry under `mcpServers` with `command` pointing at the `pgai` binary and `args: ["mcp", "start"]`.

## Manual configuration

If you prefer to wire up MCP by hand, edit the client config and add a `postgresai` entry under `mcpServers`. See the [`mcp install` section of the CLI reference](/docs/reference-guides/postgresai-cli-reference#mcp-install) for the exact JSON shape.

## Next steps

- [How to work with issues](/docs/postgresai-howtos/how-to-work-with-issues) - Learn how to manage issue reports in AI coding tools
