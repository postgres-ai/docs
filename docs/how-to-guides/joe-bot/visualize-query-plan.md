---
title: How to visualize a query plan
sidebar_label: Visualize a query plan
---

## SQL optimization history

:::info
Enable the "History" feature using the configuration options [`HISTORY_ENABLED`](/docs/reference-guides/joe-bot-configuration-reference#history_enabled) and [`PLATFORM_`](/docs/reference-guides/joe-bot-configuration-reference#platform_url).
:::

- Execute any [`explain`](/docs/reference-guides/joe-bot-commands-reference#explain) query and click the **Permalink** at the end of the response
- Or open the **Command** page by clicking the command card on the **SQL optimization history**

Learn more about how you can discover command in SQL optimization history [here](/docs/how-to-guides/joe-bot/sql-optimization-history).

Click on one of the plan visualization methods you want to use:
- **Explain Depesz** - classic PostgreSQL plan visualization made by [depesz](https://explain.depesz.com/)
- **Explain PEV2** - another famous visualizator, initially made by [AlexTatiyants](https://github.com/AlexTatiyants) and improved by the [Dalibo team](https://github.com/dalibo/pev2)
- **Explain FlameGraph** - plan visualization inspired by [Brendan Gregg's flamegraphs](http://www.brendangregg.com/flamegraphs.html)

All visualizators are securely deployed in our infrastructure.

## Plan visualization page
1. Paste **Plan with execution** in JSON format to the **Plan** field on the **Plan visualization** page.
1. Click on the button related to the visualization method you want to use.
