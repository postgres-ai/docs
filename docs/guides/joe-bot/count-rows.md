---
title: How to get row counts for arbitrary SELECTs
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[↵ Back to **How to work with Joe chatbot** guides](/docs/guides/joe-bot)

One of the good side-effects of using Joe bot is the ability that any EXPLAIN plan with actual execution provides: one can get row counts for any SELECT without having direct access to the data.

This can be useful when you develop or troubleshoot something and need to learn how many rows a query would return in real life (on production). Of course, it makes sense only if your Database Lab Engine is set up to work with production-like data.

To get exact row counts, use the `Actual rows` parameter of the query execution plan which satisfies the specified condition.

In the following steps let's assume that we need to answer the question: "How many rows in the table `table1` have `col1 = 1`?" So, our SELECT would be `select * from table1 where col1`.

1. Execute `explain select * from table1 where col1 = 1` command to get the query execution plan. The session will start automatically, and a new clone will be created in a few seconds by the Database Lab Engine. 

>Notice that using `count(*)` is not really needed – `select * from table1` (or even `select from table1`) is absolutely enough.

>Keep in mind that the clone you are working with might be, depending on the settings and the state of Database Lab Engine, somewhat outdated. In the very beginning, Joe reports the timestamp to help you understand the version of data you are working with: `Snapshot data state at: 2020-01-02 03:04:05 UTC.`

<Tabs
  groupId="joe-mode"
  defaultValue="web"
  values={[
    {label: 'Web UI', value: 'web'},
    {label: 'Slack', value: 'slack'},
  ]
}>
<TabItem value="web">

![Run command / Automatic session creation / Web UI](/assets/guides/explain-count-rows-web-1.png)

</TabItem>
<TabItem value="slack">

![Run command / Automatic session creation / Slack](/assets/guides/explain-count-rows-slack-1.png)

</TabItem>
</Tabs>

2. Open the **full execution plan**. You can get the rows number from the first line. For example, if you see `(actual ... rows=1000)`, it means that 1000 rows match the specified criteria.

This recipe may be very useful for quite complex queries. You can benefit from one of the key features of Database Lab Engine and Joe bot: your session is fully independent, your work doesn't affect the production performance of your colleague's work, even if the query your use is suboptimal and runs many hours.

<Tabs
  groupId="joe-mode"
  defaultValue="web"
  values={[
    {label: 'Web UI', value: 'web'},
    {label: 'Slack', value: 'slack'},
  ]
}>
<TabItem value="web">

![Query plan with execution / Web UI](/assets/guides/explain-count-rows-web-2.png)

</TabItem>
<TabItem value="slack">

![Query plan with execution / Slack](/assets/guides/explain-count-rows-slack-2.png)

</TabItem>
</Tabs>

[↵ Back to **How to work with Joe chatbot** guides](/docs/guides/joe-bot)
