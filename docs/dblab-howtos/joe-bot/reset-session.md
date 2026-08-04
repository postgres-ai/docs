---
title: How to reset a Joe session
sidebar_label: Reset a session
description: Reset a Joe chatbot session to its initial state with the reset command, restoring the underlying DBLab clone and discarding all changes you made.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## GUI
1. With Joe chatbot sessions (based on DBLab clones), you can make any changes without worrying about damaging the data. For example, connect to your clone and drop a table.

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

2. Run the [reset](/docs/reference-guides/joe-bot-commands-reference#reset) command.

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

3. Wait for the ✅ **OK** status. The data is restored to its initial state.

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
- Command [`reset`](/docs/reference-guides/joe-bot-commands-reference#reset)
