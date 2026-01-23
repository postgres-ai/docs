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

The CLI will detect supported AI coding tools and configure MCP integration automatically.

## Verify installation

After installation, your AI coding tool will have access to PostgresAI features:

- View and manage issues
- Access database monitoring data
- Get AI-assisted recommendations for database optimization

## Manual configuration

If automatic installation doesn't work, you can configure MCP manually. See [PostgresAI CLI reference](/docs/reference-guides/postgresai-cli-reference) for the `mcp` command options.

## Next steps

- [How to work with issues](/docs/postgresai-howtos/how-to-work-with-issues) - Learn how to manage issue reports in AI coding tools
