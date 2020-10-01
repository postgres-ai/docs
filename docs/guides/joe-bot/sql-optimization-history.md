---
title: How to work with SQL optimization history
sidebar_label: Work with SQL optimizatino history
---

>Enable History functionality with [`HISTORY_ENABLED`](https://postgres.ai/docs/joe-bot/config-reference#history_enabled) and [`PLATFORM_`](https://postgres.ai/docs/joe-bot/config-reference#platform_url) configuration options.

## Open the Command page from the Joe chat
Execute any [`explain`] query and click the **Permalink** at the end of the response.

## Open the Command page from the Platform
1. When in an organization, click the **History** menu item under **SQL optimization**.
1. You will see the latest commands run with Joe in your organization. Click the **Your commands** button to filter commands made by you or type related text to the search field and press **Enter**, it could be PostgreSQL commands, tables names, etc.
1. Click on the command card to open the **Command** page.

## Search through optimization history
- Project name: click the **project** tag or use the `project:` label;
- Joe command type: click the **command** tag or use the `command:` label;
- Session ID: click the **session** tag or use the `session:` label;
- Author: click the **author** tag or use the `author:` label;
- Similar queries: click the **find similar** button or use the `fingerprint:` label;
- Favorites: click the **Favorites** button on the top of the page or use the `is:favorite` label;
- The **search field** allows using part of a query for searching.

## Select similar queries
You can easily select all queries from history that have the same structure, but different parameter values. All queries in Database Lab has a **fingerprint** assigned, it works like a hash for a query and doesn't take parameters values assigned. Click on the **find similar** button on a command card or use `fingerprint:` label in a **search field** if you already know the fingerprint.

## Share query
>Anyone on the internet with the special link can view query, plan, and all parameters. Check that there is no sensitive data.

1. To share a query with a people outside of your organization on the **Command** page click the **Share** button.
2. Choose **Anyone with a special link and members of the organization can view** option.
3. Copy the public link and click the **Save changes** button.
4. Now the command page is shared with anyone on the internet who has a link.

Select the **Only members of the organization can view** option to make the command page private again.

## Favorites
You can save queries to discover them faster in the future.
1. On the **SQL optimization history** page with a list of commands, click the **Bookmark** button to add the command to the favorites list.
1. Click the **Favorites** button on the top of the page or use the `is:favorite` label to see your favorites list.
