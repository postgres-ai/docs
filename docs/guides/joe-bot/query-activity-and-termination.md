---
title: How to get a list of active queries in a Joe session and stop long-running queries
---

[↵ Back to **How to work with Joe chatbot** guides](/docs/guides/joe-bot)

1. Run a long query, for example, it could be index creation or select from a big table. For demo purposes, we will use `explain select pg_select(20)`.
<!--DOCUSAURUS_CODE_TABS-->
<!--Web UI-->
![Execute long-running query / Web UI](/docs/assets/guides/activity-and-termination-web-1.png)
<!--Slack-->
![Execute long-running query / Slack](/docs/assets/guides/activity-and-termination-slack-1.png)
<!--END_DOCUSAURUS_CODE_TABS-->
2. Run the [`activity`](/docs/joe-bot/commands-reference#activity) command to get a list of currently running sessions in Postgres.
<!--DOCUSAURUS_CODE_TABS-->
<!--Web UI-->
![Activity / Active queries / Web UI](/docs/assets/guides/activity-and-termination-web-2.png)
<!--Slack-->
![Activity / Active queries / Slack](/docs/assets/guides/activity-and-termination-slack-2.png)
<!--END_DOCUSAURUS_CODE_TABS-->
3. If you want to stop the execution of a long-running query, run the [`terminate`](/docs/joe-bot/commands-reference#terminate) command with query's `PID` from the [`activity`](/docs/joe-bot/commands-reference#activity) list.
<!--DOCUSAURUS_CODE_TABS-->
<!--Web UI-->
![Terminate / Stop execution of long-running query / Web UI](/docs/assets/guides/activity-and-termination-web-3.png)
<!--Slack-->
![Terminate / Stop execution of long-running query / Slack](/docs/assets/guides/activity-and-termination-slack-3.png)
<!--END_DOCUSAURUS_CODE_TABS-->
4. Check that query was stopped. You can run the [`activity`](/docs/joe-bot/commands-reference#activity) command again or scroll to the query execution message, it should have `terminating connection due to administrator command` status now.
<!--DOCUSAURUS_CODE_TABS-->
<!--Web UI-->
![Activity / No active queries / Web](/docs/assets/guides/activity-and-termination-web-4.png)
![Query / Failed due to administrator command / Web UI](/docs/assets/guides/activity-and-termination-web-5.png)
<!--Slack-->
![Activity / No active queries / Slack](/docs/assets/guides/activity-and-termination-slack-4.png)
![Query / Failed due to administrator command / Slack](/docs/assets/guides/activity-and-termination-slack-5.png)
<!--END_DOCUSAURUS_CODE_TABS-->

[↵ Back to **How to work with Joe chatbot** guides](/docs/guides/joe-bot)
