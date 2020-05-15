---
title: Joe Bot Tutorial
---

>Please support the project giving a GitLab star (it's on [the main page of the project repository](https://gitlab.com/postgres-ai/joe),
>at the upper right corner):
>
>![Add a star](assets/star.gif)

## Step 1. Requirements:
- Set up [Database Lab](./../database-lab/1_tutorial) (e.g., running by address https://dblab.domain.com) before configuring Joe Bot.
  > ⚠ Make sure the address used in `accessHost` is accessible from where you are going to run Joe Bot.
- Prepare any Linux machine with Docker. See the official documentation on [how to install Docker on Linux](https://docs.docker.com/engine/install/).

## Step 2. Configure communication channels

There are two available types of communication with Joe:
- Web UI powered by [Postgres.ai Console](https://postgres.ai/console/),
- Slack.

You can use both of them in parallel. If you can develop in Go language, feel free to implement more types of communication: see [communication channels issues](https://gitlab.com/postgres-ai/joe/-/issues?label_name%5B%5D=Communication+channel).

We need to define where to store the configuration file. We will use `~/.dblab/configs/joe_config.yml`.

Configuration example:

```bash
mkdir -p ~/.dblab/configs

cat <<'JOE_CONFIG' > ~/.dblab/configs/joe_config.yml
app:
  # HTTP server port. By default: 2400.
  port: 2400

  # Time interval to notify a user about the finish of a long query. By default: 60s.
  minNotifyDuration: 60s

  # Enable debug mode. By default: false.
  debug: false

platform:
  # Postgres.ai Platform API base URL. By default: https://postgres.ai/api/general.
  url: "https://postgres.ai/api/general"

  # The Postgres.ai Platform API token.
  token: "platfrom_secret_token"

  # Postgres.ai Platform project to assign user sessions.
  project: "demo"

  # Enable sending command and queries history to the Postgres.ai Platform 
  # for collaboration and visualization. By default: true.
  historyEnabled: true

# Channel Mapping section.
# Feel free to choose any name for Database Lab instances from the `dblabServers` section,
# those names are just aliases.
channelMapping:
  # Available communication types (Web UI, Slack, etc.)
  communicationTypes:
    # Web UI communication type configuration.
    webui:
        # Web UI name. Feel free to choose any name.
      - name: WebUI
        credentials:
          # Web UI signing secret. The secret verifies that each request comes
          # from the configured Web UI instance.
          signingSecret: secret_signing

        channels:
            # Web UI channel ID. Feel free to choose any name. This is what 
            # users will see in the GUI.
          - channelID: ProductionDB

            # Database Lab alias from the dblabServers section.
            dblabServer: prod1

            # Postgres connection parameters used to connect to a clone.
            # The password is not needed, it will be randomly generated 
            # each time a new clone is created.
            dblabParams:
              dbname: test
              sslmode: prefer

#    # Slack communication type configuration.
#    slack:
#        # Workspace name. Feel free to choose any name.
#      - name: Workspace
#
#        credentials:
#          # Bot User OAuth Access Token ("xoxb-TOKEN").
#          accessToken: access_token
#          
#          # Slack App Signing Secret. 
#          # See more: https://api.slack.com/authentication/verifying-requests-from-slack
#          signingSecret: secret_signing
#
#        channels:
#            # Slack channel ID. In Slack app, right-click on the channel name,
#            # and choose "Additional options > Copy link". From that link, we
#            # need the last part consisting of 9 letters starting with "C".
#          - channelID: CXXXXXXXX
#
#            # Database Lab alias from the dblabServers section.
#            dblabServer: prod1
#
#            # Postgres connection parameters used to connect to a clone.
#            # The password is not needed, it will be randomly generated 
#            # each time a new clone is created.
#            dblabParams:
#              dbname: test
#              sslmode: prefer

  # Running Database Lab instances.
  dblabServers:
    # Database Lab instance alias and parameters to connect to the API
    prod1:
      url: "https://dblab.domain.com"
      token: "secret_token"

# Enterprise options (changing these options you confirm that you have active
# subscription to Postgres.ai Platform Enterprise Edition https://postgres.ai).
enterprise:
  quota:
    # Limit request rates. By default: 10.
    limit: 10

    # Time interval (in seconds) to apply a quota limit. By default: 60.
    interval: 60

  audit:
    # Enable logging of received commands. By default: false.
    enabled: false

  dblab:
    # Limit available Database Lab instances. By default: 1.
    instanceLimit: 1

JOE_CONFIG
```

Then, configure ways of communication with Joe.

### Step 2a. Set up Joe in Postgres.ai Console ("Web UI")
If you don't need Web UI and prefer working with Joe only in messengers (such as Slack), comment out `channelMapping: communicationTypes: webui` subsection in Jog config, and proceed to the next step.

Before configuring Web UI make sure you have a Postgres.ai account.

If you don't have a Postgres.ai account yet, see the guide on how to start working with [Postgres.ai Console](https://postgres.ai/docs/get-started#how-to-start).

To configure Web UI:

1. First, get your `PLATFORM_TOKEN`. This token lets Joe Bot talk to Postgres.ai Platform to enable Web UI chat window, save the history of commands, and visualize query plans. In [Postgres.ai Console](https://postgres.ai/console/), switch to proper organization and open the `Access Tokens` page. Save it to Joe config (`platform: token`).
1. Then, go to the `Joe instances` page in the `SQL Optimization` sidebar section.
1. Choose a project from the dropdown menu and press the `Add instance` button.
1. Generate `Signing secret`. Put it in the configuration file (`channelMapping: webui: <your channel name>: credentials: signingSecret`). We will add and verify the URL on the last step, so do not close the page.

    ![WebUI - Generate a signing token](assets/joe/tutorial-webui-signing-secret.png)


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

    ![Slack App - Bot Token Scopes](assets/joe/tutorial-oauth-bot-token-scopes.png)

1. Go to the "App Home" page and edit "App Display Name".
    * Use "Joe Bot" as Display Name and "joe-bot" as the default username.

1. Enable Incoming Webhooks Feature.
    * Go to the "OAuth & Permissions" page and press "Install App to Workspace".
        ![Slack App - OAuth & permissions](assets/joe/tutorial-oauth-permissions.png)

    * Allow access to your Workspace with requested permissions.
        ![Slack App - Permissions request](assets/joe/tutorial-permissions-request.png)

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
        --volume ~/.dblab/configs/joe_config.yml:/home/config/config.yml \
        --detach \
    postgresai/joe:latest
    ``` 

    To observe Joe logs use:

    ```bash
    sudo docker logs -f joe_bot
    ```
    
    Need you to reconfigure or upgrade, you can stop and remove the container any time using `sudo docker stop joe_bot` and `sudo docker rm joe_bot` and then launching it again as described above.

1. Make a publicly accessible HTTP(S) server port specified in the configuration to receive requests from communication channels Request URL (e.g., http://35.200.200.200:2400, https://joe.dev.domain.com).

Instead of working using insecure HTTP, you can set up NGINX with SSL enabled and open port 443, similarly as it was described in [Database Lab tutorial](./../database-lab/1_tutorial#step-5-configure-secure-access-to-database-lab-api-optional). 

See also (it might be helpful): https://nginxconfig.io/

## Step 4. Verify the configuration

### Step 4a. Finish the Web UI configuration

1. Return to the page of Joe configuration in the Console, enter the URL with the specific path `/webui/`. For example, `https://joe.dev.domain.com/webui/`.
1. Press the `Verify` button to check connection and `Add` the instance after the verification is passed.
1. Choose the created instance and send a command.

    ![Run command](assets/joe/tutorial-webui-example-command.png)

### Step 4b. Finish the Slack configuration
1. Enable Event Subscriptions Feature.
    * Go to the "Event Subscriptions" page.
    * Specify Request URL adding the specific path, `/slack/` (for example, `https://joe.dev.domain.com/slack/`). URL will be verified by Slack API.
    * In the "Subscribe to Bot Events" dropdown-tab add `message.channels`.
    * Press "Save Changes".
    ![Slack App - Event Subscriptions](assets/joe/tutorial-event-subscriptions.png)

1. Invite "Joe Bot" to "#db-lab" channel.

1. Send a command to the #db-lab channel. For example, `help`.

    ![Run command](assets/joe/tutorial-example-help.png)


See available configuration options [here](./configuration-options).
