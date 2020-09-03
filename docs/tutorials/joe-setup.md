---
title: Start using Joe Bot
sidebar_label: Start using Joe Bot
---

[↵ Back to Guides](/docs/guides/)

>Please support the project giving a GitLab star (it's on [the main page of the project repository](https://gitlab.com/postgres-ai/joe),
>at the upper right corner):
>
>![Add a star](/docs/assets/star.gif)

## Step 1. Requirements:
- Set up [Database Lab Engine](/docs/tutorials/engine-setup) (e.g., running by address https://dblab.domain.com) before configuring Joe Bot.
  > ⚠ Make sure the address used in `accessHost` is accessible from where you are going to run Joe Bot.
- Prepare any Linux machine with Docker. See the official documentation on [how to install Docker on Linux](https://docs.docker.com/engine/install/).

## Step 2. Configure communication channels

There are two available types of communication with Joe:
- Web UI powered by [Postgres.ai Console](https://postgres.ai/console/),
- Slack.

You can use both of them in parallel. If you can develop in Go language, feel free to implement more types of communication: see [communication channels issues](https://gitlab.com/postgres-ai/joe/-/issues?label_name%5B%5D=Communication+channel).

We need to define where to store the configuration file. We will use `~/.dblab/joe.yml`.

Configuration example:

```bash
mkdir -p ~/.dblab

cat <<'JOE_CONFIG' > ~/.dblab/joe.yml
app:
  # HTTP server IP address or host.
  # Used only for Web UI and Slack Events API communication types.
  # Default: "127.0.0.1" (only local connections).
  # Use empty string to listen all network interfaces.
  host: "127.0.0.1"

  # HTTP server port. Used only for Web UI and Slack Events API communication types.
  # Default: 2400.
  port: 2400

  # Minimal duration of long query processing used for notifications.
  # When query processing is finished, a notification will be issued if duration
  # has exceeded this value. Default: 60s.
  minNotifyDuration: 60s

  # Debug mode. Default: false.
  debug: false

# Integration with Postgres.ai Platform instance. It may be either
# SaaS (https://postgres.ai) of self-managed instance (usually located inside
# private infrastructure).
platform:
  # Postgres.ai Platform API base URL. Default: https://postgres.ai/api/general.
  url: "https://postgres.ai/api/general"

  # Postgres.ai Platform API secret token.
  token: "platform_secret_token"

  # Enable command history in Postgres.ai Platform for collaboration and
  # visualization. Default: true.
  historyEnabled: true

# Channel Mapping is used to allow working with more than one database in
# one Database Lab instance. This is useful when your PostgreSQL master node
# has more than one application databases and you want to organize optimization
# processes for all of them. Thanks to Channel Mapping you can use a single Joe
# Bot instance.
channelMapping:
  # Active Database Lab instances that are used by this Joe Bot instance.
  dblabServers:
    # Alias for this Database Lab instance (internal, used only in this config)
    prod1:
      # URL of Database Lab API server
      url: "https://dblab.domain.com"
      # Secret token used to communicate with Database Lab API
      token: "secret_token"

  # Available communication types ("webui", "slack", "slackrtm", etc.)
  communicationTypes:
    # Communication type: Web UI (part of Postgres.ai Platform).
    webui:
      # Web UI name. Feel free to choose any name, it is just an alias.
      - name: WebUI
        credentials:
          # Web UI signing secret. This secret verifies each request to ensure
          # that it came from one of configured Web UI instances.
          signingSecret: secret_signing

        channels:
          # Web UI channel ID. Feel free to choose any name, it is just an alias.
          # This is what users see in browser.
          - channelID: ProductionDB

            # Postgres.ai Platform project to which user sessions are to be assigned.
            project: "demo"

            # Database Lab alias from the "dblabServers" section.
            dblabServer: prod1

            # PostgreSQL connection parameters used to connect to a clone.
            # The username/password are not needed; they will be randomly
            # generated each time a new clone is created.
            dblabParams:
              # It is recommended to leave "postgres" here, because this DB
              # usually exists in any PostgreSQL setup.
              dbname: postgres
              # It is NOT recommended to work without SSL. This value will be
              # used in a clone's pg_hba.conf. 
              # See https://www.postgresql.org/docs/current/libpq-ssl.html#LIBPQ-SSL-SSLMODE-STATEMENTS
              sslmode: prefer

    # Communication type: Slack Events API.
#    slack:
#      # Workspace name. Feel free to choose any name, it is just an alias.
#      - name: Workspace
#
#        credentials:
#          # Bot User OAuth Access.
#          # See https://api.slack.com/authentication/token-types
#          accessToken: xoxb-XXXX
#
#          # Slack App Signing Secret.
#          # See https://api.slack.com/authentication/verifying-requests-from-slack
#          signingSecret: signing_secret
#
#        channels:
#          # Slack channel ID. In Slack app, right-click on the channel name,
#          # and choose "Additional options > Copy link". From that link, we
#          # need the last part consisting of 9 letters starting with "C".
#          - channelID: CXXXXXXXX
#
#            # Postgres.ai Platform project to which user sessions are to be assigned.
#            project: "demo"
#
#            # Database Lab alias from the "dblabServers" section.
#            dblabServer: prod1
#
#            # PostgreSQL connection parameters used to connect to a clone.
#            # The username/password are not needed; they will be randomly
#            # generated each time a new clone is created.
#            dblabParams:
#              # It is recommended to leave "postgres" here, because this DB
#              # usually exists in any PostgreSQL setup.
#              dbname: postgres
#              # It is NOT recommended to work without SSL. This value will be
#              # used in a clone's pg_hba.conf. 
#              # See https://www.postgresql.org/docs/current/libpq-ssl.html#LIBPQ-SSL-SSLMODE-STATEMENTS
#              sslmode: prefer

#    # Communication type: Slack RTM.
#    slackrtm:
#      # Workspace name. Feel free to choose any name, it is just an alias.
#      - name: Workspace
#
#        credentials:
#          # Bot User OAuth Access.
#          # See https://api.slack.com/authentication/token-types
#          accessToken: xoxb-XXXX
#
#        channels:
#          # Slack channel ID. In Slack app, right-click on the channel name,
#          # and choose "Additional options > Copy link". From that link, we
#          # need the last part consisting of 9 letters starting with "C".
#          - channelID: CXXXXXXXX
#
#            # Postgres.ai Platform project to which user sessions are to be assigned.
#            project: "demo"
#
#            # Database Lab alias from the "dblabServers" section.
#            dblabServer: prod1
#
#            # PostgreSQL connection parameters used to connect to a clone.
#            # The username/password are not needed; they will be randomly
#            # generated each time a new clone is created.
#            dblabParams:
#              # It is recommended to leave "postgres" here, because this DB
#              # usually exists in any PostgreSQL setup.
#              dbname: postgres
#              # It is NOT recommended to work without SSL. This value will be
#              # used in a clone's pg_hba.conf. 
#              # See https://www.postgresql.org/docs/current/libpq-ssl.html#LIBPQ-SSL-SSLMODE-STATEMENTS
#              sslmode: prefer

# Enterprise Edition options – only to use with active Postgres.ai Platform EE
# subscription. Changing these options you confirm that you have active
# subscription to Postgres.ai Platform Enterprise Edition.
# See more: https://postgres.ai/docs/platform/postgres-ai-platform-overview
enterprise:
  quota:
    # Limit request rates. Works in pair with "interval" value. Default: 10.
    limit: 10

    # Time interval (in seconds) to apply quota limit. Default: 60.
    interval: 60

  audit:
    # Enable command logging. Default: false.
    enabled: false

  dblab:
    # Limit the number of available Database Lab instances. Default: 1.
    instanceLimit: 1

JOE_CONFIG
```

Then, configure ways of communication with Joe.

### Step 2a. Set up Joe in Postgres.ai Console ("Web UI")
If you don't need Web UI and prefer working with Joe only in messengers (such as Slack), comment out `channelMapping: communicationTypes: webui` subsection in Jog config, and proceed to the next step.

Before configuring Web UI make sure you have a Postgres.ai account.

If you don't have a Postgres.ai account yet, see the guide on how to start working with [Postgres.ai Console](/docs/platform/how-to-start).

To configure Web UI:

1. First, get your `PLATFORM_TOKEN`. This token lets Joe Bot talk to Postgres.ai Platform to enable Web UI chat window, save the history of commands, and visualize query plans. In [Postgres.ai Console](https://postgres.ai/console/), switch to proper organization and open the `Access Tokens` page. Save it to Joe config (`platform: token`).
1. Then, go to the `Joe instances` page in the `SQL Optimization` sidebar section.
1. Choose a project from the dropdown menu and press the `Add instance` button.
1. Generate `Signing secret`. Put it in the configuration file (`channelMapping: webui: <your channel name>: credentials: signingSecret`). We will add and verify the URL on the last step, so do not close the page.

    ![WebUI - Generate a signing token](/docs/assets/joe/tutorial-webui-signing-secret.png)


### Step 2b. Set up Joe bot in Slack
If you need to work with Joe bot in Slack, uncomment `channelMapping: communicationTypes: slack` subsection in Joe config, and follow these instructions.

Configure a new Slack App in order to use Joe in Slack and add the app to your team Workspace. Joe Bot should be available with public URL calls from Slack.

1. Create "#db-lab" channel in your Slack Workspace (You can use another channel name).

1. [Create a new Slack App](https://api.slack.com/apps?new_app=1).
    * Use "Joe Bot" as App Name and select a proper team Workspace.

1. Grant permissions on the "OAuth & Permissions" page for the following "Scopes/Bot Token Scopes":
    * `channels:history`
    * `chat:write`
    * `files:read`
    * `files:write`
    * `incoming-webhook`
    * `reactions:write`
    * `users.profile:read`
    * `users:read`

    ![Slack App - Bot Token Scopes](/docs/assets/joe/tutorial-oauth-bot-token-scopes.png)

1. Go to the "App Home" page and edit "App Display Name".
    * Use "Joe Bot" as Display Name and "joe-bot" as the default username.

1. Enable Incoming Webhooks Feature.
    * Go to the "OAuth & Permissions" page and press "Install App to Workspace".
        ![Slack App - OAuth & permissions](/docs/assets/joe/tutorial-oauth-permissions.png)

    * Allow access to your Workspace with requested permissions.
        ![Slack App - Permissions request](/docs/assets/joe/tutorial-permissions-request.png)

    * You will get `Bot User OAuth Access Token` which is required to run the Joe app (use as `SLACK_CHAT_TOKEN`).

    * Go to the "Basic Information" page to get `Signing Secret` from the "App Credentials" section (use as `SLACK_SIGNING_SECRET`).

Now we have all tokens and ready to run Joe Bot.


## Step 3. Run Joe Bot container

1. Launch Joe Bot container which immediately connects to the Database Lab instance(s) you've specified in the config file.

    ```bash
    sudo docker run \
        --name joe_bot \
        --publish 2400:2400 \
        --restart=on-failure \
        --volume ~/.dblab/joe.yml:/home/config/config.yml \
        --detach \
    postgresai/joe:latest
    ``` 

    To observe Joe logs use:

    ```bash
    sudo docker logs -f joe_bot
    ```
    
    Need you to reconfigure or upgrade, you can stop and remove the container any time using `sudo docker stop joe_bot` and `sudo docker rm joe_bot` and then launching it again as described above.

1. Make a publicly accessible HTTP(S) server port specified in the configuration to receive requests from communication channels Request URL (e.g., http://35.200.200.200:2400, https://joe.dev.domain.com).

Instead of working using insecure HTTP, you can set up NGINX with SSL enabled and open port 443, similarly as it was described in [Database Lab tutorial](/docs/database-lab/tutorial#step-5-configure-secure-access-to-database-lab-api-optional). 

See also (it might be helpful): https://nginxconfig.io/

## Step 4. Verify the configuration

### Step 4a. Finish the Web UI configuration

1. Return to the page of Joe configuration in the Console, enter the URL with the specific path `/webui/`. For example, `https://joe.dev.domain.com/webui/`.
1. Press the `Verify` button to check connection and `Add` the instance after the verification is passed.
1. Choose the created instance and send a command.

    ![Run command](/docs/assets/joe/tutorial-webui-example-command.png)

### Step 4b. Finish the Slack configuration
1. Enable Event Subscriptions Feature.
    * Go to the "Event Subscriptions" page.
    * Specify Request URL adding the specific path, `/slack/` (for example, `https://joe.dev.domain.com/slack/`). URL will be verified by Slack API.
    * In the "Subscribe to Bot Events" dropdown-tab add `message.channels`.
    * Press "Save Changes".
    ![Slack App - Event Subscriptions](/docs/assets/joe/tutorial-event-subscriptions.png)

1. Invite "Joe Bot" to "#db-lab" channel.

1. Send a command to the #db-lab channel. For example, `help`.

    ![Run command](/docs/assets/joe/tutorial-example-help.png)


See available configuration options [here](/docs/joe-bot/config-reference).
