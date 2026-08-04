---
title: How to visualize a query plan
sidebar_label: Visualize a query plan
description: Visualize a Postgres query plan with Joe bot using Explain Depesz, PEV2, or FlameGraph, from SQL optimization history or the Plan visualization page.
---

## SQL optimization history

:::info
Enable the "History" feature using the configuration options [`HISTORY_ENABLED`](/docs/reference-guides/joe-bot-configuration-reference#joe_platform_history_enabled) and [`PLATFORM_URL`](/docs/reference-guides/joe-bot-configuration-reference#joe_platform_url).
:::

- Run any [`explain`](/docs/reference-guides/joe-bot-commands-reference#explain) query and click **Permalink** at the end of the response
- Or open the **Command** page by clicking the command card in the **SQL optimization history**

Learn more about how you can discover commands in SQL optimization history [here](/docs/dblab-howtos/joe-bot/sql-optimization-history).

Click on one of the plan visualization methods you want to use:
- **Explain Depesz** - classic Postgres plan visualization made by [depesz](https://explain.depesz.com/)
- **Explain PEV2** - another popular visualizer, initially made by [AlexTatiyants](https://github.com/AlexTatiyants) and improved by the [Dalibo team](https://github.com/dalibo/pev2)
- **Explain FlameGraph** - plan visualization inspired by [Brendan Gregg's flame graphs](http://www.brendangregg.com/flamegraphs.html)

All visualizers are securely deployed in our infrastructure.

## Plan visualization page
1. Paste the **Plan with execution** in JSON format into the **Plan** field on the **Plan visualization** page.
1. Click on the button related to the visualization method you want to use.
