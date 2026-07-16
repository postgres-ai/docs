---
title: PostgresAI CLI
sidebar_label: PostgresAI CLI
description: Install and use postgresai CLI for authentication, MCP integration, and issues management.
keywords:
  - "postgresai cli"
  - "postgresai monitoring cli"
  - "mcp"
  - "cursor"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Reference

- [PostgresAI CLI reference (postgresai)](/docs/reference-guides/postgresai-cli-reference)

## Install (optional)

You can run `postgresai` commands without installing, using `npx` or `bunx`. If you prefer to install it globally:

<Tabs groupId="cli-runner">
<TabItem value="npm" label="npm">

```bash
npm install -g postgresai
```

</TabItem>
<TabItem value="homebrew" label="Homebrew (macOS)">

```bash
brew tap postgres-ai/tap https://gitlab.com/postgres-ai/homebrew-tap.git
brew install postgresai
```

</TabItem>
</Tabs>

## Authenticate

Authenticate via browser and store the API key locally:

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai login
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai@latest login
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai@latest login
```

</TabItem>
</Tabs>

## Install MCP (Cursor, Claude Code, Windsurf, Codex)

Install MCP integration for your AI coding tool:

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai mcp install
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai@latest mcp install
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai@latest mcp install
```

</TabItem>
</Tabs>

## Work with issues

List issues:

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai issues list
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai@latest issues list
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai@latest issues list
```

</TabItem>
</Tabs>

View a specific issue:

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai issues view <issue_id>
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai@latest issues view <issue_id>
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai@latest issues view <issue_id>
```

</TabItem>
</Tabs>

Post a comment:

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
postgresai issues post-comment <issue_id> "<comment>"
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
npx postgresai@latest issues post-comment <issue_id> "<comment>"
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
bunx postgresai@latest issues post-comment <issue_id> "<comment>"
```

</TabItem>
</Tabs>
