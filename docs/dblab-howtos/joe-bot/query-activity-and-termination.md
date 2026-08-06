---
title: How to get a list of active queries in a Joe session and stop long-running queries
sidebar_label: Get a list of active queries and stop long-running queries
description: Use Joe bot's activity command to list active Postgres queries in a session and the terminate command to stop long-running queries by PID.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

1. Run a long query. For example, it could be an index creation or a SELECT from a large table. For demo purposes, we use `explain select pg_select(20)`.

<Tabs
  groupId="joe-mode"
  defaultValue="web"
  values={[
    {label: 'Web UI', value: 'web'},
    {label: 'Slack', value: 'slack'},
  ]
}>
<TabItem value="web">

![Execute long-running query / Web UI](/assets/guides/activity-and-termination-web-1.png)

</TabItem>
<TabItem value="slack">

![Execute long-running query / Slack](/assets/guides/activity-and-termination-slack-1.png)

</TabItem>
</Tabs>

2. Run the [`activity`](/docs/reference-guides/joe-bot-commands-reference#activity) command to get a list of currently running sessions in Postgres.

<Tabs
  groupId="joe-mode"
  defaultValue="web"
  values={[
    {label: 'Web UI', value: 'web'},
    {label: 'Slack', value: 'slack'},
  ]
}>
<TabItem value="web">

![Activity / Active queries / Web UI](/assets/guides/activity-and-termination-web-2.png)

</TabItem>
<TabItem value="slack">

![Activity / Active queries / Slack](/assets/guides/activity-and-termination-slack-2.png)

</TabItem>
</Tabs>

3. To stop the execution of a long-running query, run the [`terminate`](/docs/reference-guides/joe-bot-commands-reference#terminate-pid) command with the query's `PID` from the [`activity`](/docs/reference-guides/joe-bot-commands-reference#activity) list.

<Tabs
  groupId="joe-mode"
  defaultValue="web"
  values={[
    {label: 'Web UI', value: 'web'},
    {label: 'Slack', value: 'slack'},
  ]
}>
<TabItem value="web">

![Terminate / Stop execution of long-running query / Web UI](/assets/guides/activity-and-termination-web-3.png)

</TabItem>
<TabItem value="slack">

![Terminate / Stop execution of long-running query / Slack](/assets/guides/activity-and-termination-slack-3.png)

</TabItem>
</Tabs>

4. Check that the query was stopped. You can run the [`activity`](/docs/reference-guides/joe-bot-commands-reference#activity) command again or scroll to the query execution message; it should now have the `terminating connection due to administrator command` status.

<Tabs
  groupId="joe-mode"
  defaultValue="web"
  values={[
    {label: 'Web UI', value: 'web'},
    {label: 'Slack', value: 'slack'},
  ]
}>
<TabItem value="web">

![Activity / No active queries / Web](/assets/guides/activity-and-termination-web-4.png)
![Query / Failed due to administrator command / Web UI](/assets/guides/activity-and-termination-web-5.png)

</TabItem>
<TabItem value="slack">

![Activity / No active queries / Slack](/assets/guides/activity-and-termination-slack-4.png)
![Query / Failed due to administrator command / Slack](/assets/guides/activity-and-termination-slack-5.png)

</TabItem>
</Tabs>
