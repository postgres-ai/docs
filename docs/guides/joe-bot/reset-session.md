---
title: How to reset Joe session
sidebar_label: Reset a session
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## GUI
1. With Joe chatbot sessions (based Database Lab clones) you can perform any changes and not be afraid to damage the data. For example, connect to your clone and drop any table.

<Tabs
  groupId="joe-mode"
  defaultValue="web"
  values={[
    {label: 'Web UI', value: 'web'},
    {label: 'Slack', value: 'slack'},
  ]
}>
<TabItem value="web">

![Joe bot / Change data / Web UI](/assets/guides/reset-clone-web-1.png)

</TabItem>
<TabItem value="slack">

![Joe bot / Change data / Slack](/assets/guides/reset-clone-slack-1.png)

</TabItem>
</Tabs>

2. Execute [reset](/docs/joe-bot/commands-reference#reset) command.

<Tabs
  groupId="joe-mode"
  defaultValue="web"
  values={[
    {label: 'Web UI', value: 'web'},
    {label: 'Slack', value: 'slack'},
  ]
}>
<TabItem value="web">

![Joe bot / Reset the state / Web UI](/assets/guides/reset-clone-web-2.png)

</TabItem>
<TabItem value="slack">

![Joe bot / Reset the state / Slack](/assets/guides/reset-clone-slack-2.png)

</TabItem>
</Tabs>

3. Wait for ✅ **OK** status. The data will be recovered to the initial state.

<Tabs
  groupId="joe-mode"
  defaultValue="web"
  values={[
    {label: 'Web UI', value: 'web'},
    {label: 'Slack', value: 'slack'},
  ]
}>
<TabItem value="web">

![Joe bot / Status OK / Web UI](/assets/guides/reset-clone-web-3.png)

</TabItem>
<TabItem value="slack">

![Joe bot / Status OK / Slack](/assets/guides/reset-clone-slack-3.png)

</TabItem>
</Tabs>


## Reference
- Command [`reset`](/docs/joe-bot/commands-reference#reset)
