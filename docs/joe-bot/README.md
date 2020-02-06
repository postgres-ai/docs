---
title: Joe Bot
---

## Tutorial. Get Started in a Few Minutes

### Step 1. Requirements:
- [Database Lab](./database-lab/) (e.g., running by address https://dblab.domain.com)
- any machine with Docker.

### Step 2. Configure a new Slack App
Configure a new Slack App in order to use Joe in Slack and add the app to your
team Workspace. Joe Bot should be available with public URL calls from Slack.
1. Create "#db-lab" channel in your Slack Workspace (You can use another channel name).
1. [Create a new Slack App](https://api.slack.com/apps?new_app=1).
    * Use "Joe Bot" as App Name and select a proper team Workspace.
1. Add Bot User.
    * Use "Joe Bot" as Display Name and "joe-bot" as the default username.
1. Run Joe Bot with `Bot User OAuth Access Token ("xoxb-TOKEN")` from "OAuth & Permissions" Feature and `Verification Token` from "Basic Information" page (See **Run** below).
1. Enable Incoming Webhooks Feature.
    * Press "Add New Webhook to Workspace" and select a previously created channel to post token.
1. Enable Event Subscriptions Feature.
    * Specify Request URL (URL will be verified by Slack API) (e.g. http://35.200.200.200:3000, https://joe.dev.domain.com). You would need to run Joe with proper settings before you could verify Request URL.
    * Add `app_mention` and `message.channels` to "Subscribe to Bot Events".
1. Invite "Joe Bot" to "#db-lab" channel.


### Step 3. Run
1. Run the Joe docker image to connect with the Database Lab server according to the previous configurations. 

Example:

```bash
docker run \
  --env DBLAB_URL="https://dblab.domain.com" \
  --env DBLAB_TOKEN="DBLAB_SECRET_TOKEN" \
  --env CHAT_TOKEN="YOUR_SLACK_CHAT_TOKEN" \
  --env CHAT_VERIFICATION_TOKEN="YOUR_SLACK_VERIFICATION_TOKEN" \
  --env SERVER_PORT=3000 \
  -p 3000:3000 \
  postgresai/joe:latest
```

The Joe instance will be running by port 3000 of the current machine. It must be specified as the Request URL on the configuration Slack App stage.
1. Make a publicly accessible HTTP(S) server port specified in the configuration for Slack Events Request URL.
1. Send a command to the #db-lab channel. For example, `\d`


## Command list
- `explain` — analyze your query (SELECT, INSERT, DELETE, UPDATE or WITH) and generate recommendations.
- `exec` — execute any query (for example, CREATE INDEX).
- `reset` — revert the database to the initial state (usually takes less than a minute, all changes will be lost).
- `\d`, `\d+`, `\dt`, `\dt+`, `\di`, `\di+`, `\l`, `\l+`, `\dv`, `\dv+`, `\dm`, `\dm+` — psql meta information commands.
- `help` — show help message.


## Detailed intro
- Sessions are independent. You will have your own full-sized copy of the database.
- Feel free to change anything: build and drop indexes, change schema, etc.
- At any time, use `reset` to re-initialize the database. This will cancel the ongoing queries in your session. Say `help` to see the full list of commands.
- Responses will mark with `Session: N`, where `N` is the session number (you will get your number once your session is initialized).
- The session will be destroyed after specified amount of minutes of inactivity (configurable on the Database Lab). The corresponding DB clone will be deleted.
- EXPLAIN plans here are expected to be identical to production plans.
- The actual timing values may differ from production because actual caches in the Database Lab are smaller. However, the number of bytes and pages/buffers in plans are identical to production.


## Community 
Bug reports, ideas, and merge requests are welcome: https://gitlab.com/postgres-ai/joe

To discuss Joe Bot, join our Slack:  https://database-lab-team-slack-invite.herokuapp.com/
