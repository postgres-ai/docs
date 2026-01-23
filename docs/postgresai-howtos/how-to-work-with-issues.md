---
title: How to work with Issues
sidebar_label: Work with Issues
description: View, manage, and resolve issue reports in PostgresAI Console.
keywords:
  - "postgresai issues"
  - "issue reports"
  - "resolve in cursor"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to work with Issues

PostgresAI generates daily issue reports with detected problems and recommended actions for your Postgres databases. This guide shows how to view, manage, and resolve issues.

## Prerequisites

- A PostgresAI account with an active monitoring instance

## View issues in PostgresAI Console

Open [PostgresAI Console](https://console.postgres.ai/) and click **Issues** in the left sidebar to see all issue reports.

[![PostgresAI Console: Issues list with generated issue reports](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-10.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-10.png)

## Manage an issue

Click an issue to open its details page. You can:

- **Assignees**: assign the issue to a team member.
- **Status & labels**: update status and labels as needed.
- **Resolve in Cursor**: open the issue in Cursor to work through the recommended steps in your AI-assisted workflow.

[![PostgresAI Console: Issue details page with assignees, status, and the Resolve in Cursor action](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-11.png)](/assets/install-postgres-ai-monitoring-from-postgresai-console/install-postgres-ai-monitoring-from-postgresai-console-11.png)

## Work with issues via CLI

You can also manage issues using the PostgresAI CLI:

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

```bash
# List all issues
postgresai issues list

# View a specific issue
postgresai issues view <issue_id>

# Post a comment
postgresai issues post_comment <issue_id> "comment"
```

</TabItem>
<TabItem value="npx" label="npx">

```bash
# List all issues
npx postgresai issues list

# View a specific issue
npx postgresai issues view <issue_id>

# Post a comment
npx postgresai issues post_comment <issue_id> "comment"
```

</TabItem>
<TabItem value="bunx" label="bunx">

```bash
# List all issues
bunx postgresai issues list

# View a specific issue
bunx postgresai issues view <issue_id>

# Post a comment
bunx postgresai issues post_comment <issue_id> "comment"
```

</TabItem>
</Tabs>

See [PostgresAI CLI reference](/docs/reference-guides/postgresai-cli-reference) for all available commands.

## Integrate with AI coding tools

Issues can be resolved directly in AI coding tools that support MCP integration:

<Tabs groupId="cli-runner" queryString>
<TabItem value="cli" label="Installed CLI" default>

1. Install MCP: `postgresai mcp install`
2. Open the issue in your AI coding tool (Cursor, Claude Code, Windsurf, or Codex)
3. Follow the AI-guided steps to resolve the issue

</TabItem>
<TabItem value="npx" label="npx">

1. Install MCP: `npx postgresai mcp install`
2. Open the issue in your AI coding tool (Cursor, Claude Code, Windsurf, or Codex)
3. Follow the AI-guided steps to resolve the issue

</TabItem>
<TabItem value="bunx" label="bunx">

1. Install MCP: `bunx postgresai mcp install`
2. Open the issue in your AI coding tool (Cursor, Claude Code, Windsurf, or Codex)
3. Follow the AI-guided steps to resolve the issue

</TabItem>
</Tabs>

See [How to install MCP](/docs/postgresai-howtos/how-to-install-mcp) for setup instructions.
