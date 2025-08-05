---
title: "Tutorial: Start using Joe Bot for PostgreSQL query optimization"
sidebar_label: Start using Joe Bot
keywords:
  - "SQL optimization PostgreSQL"
  - "EXPLAIN ANALYZE on thin PostgreSQL clones"
  - "Joe bot - optimize PostgreSQL queries"
  - "Optimize SQL using thin clones"
  - "PostgreSQL EXPLAIN"
  - "Verify PostgreSQL index ideas"
  - "Joe bot tutorial"
  - "PostgresAI Joe bot"
  - "sql optimization chatbot"
description: Learn how to use Joe bot to build a swift workflow of PostgreSQL query optimization running EXPLAIN commands on ultra-fast thin clones.
---

[↵ Back to Guides](/docs/guides/)

## Step 1. Requirements
- Set up [DBLab Engine](/docs/tutorials/database-lab-tutorial) (e.g., running on address https://dblab.domain.com) before configuring Joe Bot
:::note
Make sure the address used in `accessHost` is accessible from where you are going to run Joe Bot.
:::
- Prepare any Linux machine with Docker. See the official documentation on [how to install Docker on Linux](https://docs.docker.com/engine/install/)

## Step 2. Configure communication channels
There are two available types of communication with Joe:
- Web UI powered by [PostgresAI Console](https://postgres.ai/console/)
- Slack

You can use both of them in parallel. If you can develop in Go language, feel free to implement more types of communication: see [communication channels issues](https://gitlab.com/postgres-ai/joe/-/issues?label_name%5B%5D=Communication+channel).

We need to define where to store the configuration file. We will use `~/.dblab/joe/configs/joe.yml`.

Configuration example:
```bash
mkdir -p ~/.dblab/joe/configs

curl -fsSL https://gitlab.com/postgres-ai/joe/-/raw/0.10.0/configs/config.example.yml \
  --output ~/.dblab/joe/configs/joe.yml
```

Then, configure ways of communication with Joe.

### Step 2a. Set up Joe in PostgresAI Console ("Web UI")
If you don't need Web UI and prefer working with Joe only in messengers (such as Slack), comment out `channelMapping: communicationTypes: webui` subsection in Jog config, and proceed to the next step.

Before configuring Web UI make sure you have a PostgresAI account.

If you don't have a PostgresAI account yet, see the guide on how to start working with [PostgresAI Console](/docs/platform).

To configure Web UI:
1. First, get your `JOE_PLATFORM_TOKEN`. This token lets Joe Bot talk to PostgresAI Platform to enable Web UI chat window, save the history of commands, and visualize query plans. In [PostgresAI Console](https://postgres.ai/console/), switch to proper organization and open the `Access Tokens` page. Save it to Joe config (`platform: token`).
1. Then, go to the `Joe instances` page in the `SQL Optimization` sidebar section.
1. Choose a project from the dropdown menu and press the `Add instance` button.
1. Generate `Signing secret`. Put it in the configuration file (`channelMapping: webui: <your channel name>: credentials: signingSecret`). We will add and verify the URL on the last step, so do not close the page.

    ![WebUI - Generate a signing token](/assets/joe/tutorial-webui-signing-secret.png)


### Step 2b. Set up Joe bot in Slack
If you need to work with Joe bot in Slack, uncomment `channelMapping: communicationTypes: slacksm` subsection in Joe config, and follow these instructions.

Configure a new Slack App in order to use Joe in Slack and add the app to your team Workspace. 

1. Create `#db-lab` channel in your Slack Workspace (You can use another channel name).

1. [Create a new Slack App](https://api.slack.com/apps?new_app=1).
   * Choose *From an app manifest* option in popup.
     ![Slack App - create app from app manifest](/assets/joe/tutorial-slack-create-app.png)

   * Paste next yaml.
```yaml
_metadata:
  major_version: 1
  minor_version: 1
display_information:
  name: Joe Bot
  description: PostgreSQL query optimization assistent
  background_color: "#2b2c30"
features:
  app_home:
    home_tab_enabled: false
    messages_tab_enabled: false
    messages_tab_read_only_enabled: false
  bot_user:
    display_name: Joe Bot
    always_online: false  
oauth_config:
  scopes:
    bot:
      - chat:write
      - files:read
      - files:write
      - users:read
      - users.profile:read
      - channels:history
      - incoming-webhook
      - reactions:write
      - app_mentions:read
settings:
  event_subscriptions:
    bot_events:
      - app_mention
      - message.channels
  interactivity:
    is_enabled: true
  org_deploy_enabled: false
  socket_mode_enabled: true
  token_rotation_enabled: false
```

1. Press "Install App to Workspace".
   * Choose `#db-lab` channel.
      ![Slack App - Install App](/assets/joe/tutorial-permissions-request.png)
   
   * You will get "Bot User OAuth Access Token" which is required to run the Joe app.

1. Generate App Level token.
    * Go to the "Basic Settings" page and scroll down to "App-Level Tokens" section. Press "Generate Token and Scopes".
      ![Slack App - Generate App Level Token](/assets/joe/tutorial-slacksm-app-level-token-1.png)

    * Fill in token name (e.g. "joe socket mode") and add scope `connections:write`
      ![Slack App - App Level Token and Scopes](/assets/joe/tutorial-slacksm-app-level-token-2.png)

    * You will get "App Level Token" which is required to run the Joe app in Slack SocketMode.

Now we have all tokens. Fill in "Bot User OAuth Access Token" and "App Level Token" in slacksm config section,
and we are ready to run Joe Bot. 

## Step 3. Run Joe Bot container
1. Launch Joe Bot container which immediately connects to the Database Lab instance(s) you've specified in the config file.

    ```bash
    sudo docker run \
        --name joe_bot \
        --publish 2400:2400 \
        --restart=on-failure \
        --volume ~/.dblab/joe/configs:/home/configs \
        --volume ~/.dblab/joe/meta:/home/meta \
        --detach \
    postgresai/joe:latest
    ```

    To observe Joe logs use:

    ```bash
    sudo docker logs -f joe_bot
    ```

    Need you to reconfigure or upgrade, you can stop and remove the container any time using `sudo docker stop joe_bot` and `sudo docker rm joe_bot` and then launching it again as described above.

1. Make a publicly accessible HTTP(S) server port specified in the configuration to receive requests from communication channels Request URL (e.g., http://35.200.200.200:2400, https://joe.dev.domain.com).

Instead of working using insecure HTTP, you can set up NGINX with SSL enabled and open port 443, similarly as described in ["Secure DBLab Engine"](/docs/dblab-howtos/administration/engine-secure).

## Step 4. Verify the configuration
### Step 4a. Finish the Web UI configuration
1. Return to the page of Joe configuration in the Console, enter the URL with the specific path `/webui/`. For example, `https://joe.dev.domain.com/webui/`.
1. Press the `Verify` button to check connection and `Add` the instance after the verification is passed.
1. Choose the created instance and send a command.

    ![Run command](/assets/joe/tutorial-webui-example-command.png)

### Step 4b. Finish the Slack configuration
1. Invite "Joe Bot" to "#db-lab" channel.

1. Send a command to the #db-lab channel. For example, `help`.

    ![Run command](/assets/joe/tutorial-example-help.png)

See available configuration options [here](/docs/reference-guides/joe-bot-configuration-reference).

:::info Have questions?
Reach out to our team [here](https://postgres.ai/contact/), we'll be happy to help!
:::
