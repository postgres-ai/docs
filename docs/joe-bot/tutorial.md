---
title: Joe Tutorial
---

>Please support the project giving a GitLab star (it's on [the main page of the project repository](https://gitlab.com/postgres-ai/joe),
>at the upper right corner):
>
>![Add a star](assets/star.gif)

### Step 1. Requirements:
- Install and setup [Database Lab](./../database-lab/1_tutorial) (e.g., running by address https://dblab.domain.com)
- Prepare any machine with Docker. If needed, you can find the detailed
installation guide [for Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

### Step 2. Configure a new Slack App
Configure a new Slack App in order to use Joe in Slack and add the app to your team Workspace. Joe Bot should be available with public URL calls from Slack.

1. Create "#db-lab" channel in your Slack Workspace (You can use another channel name).

1. [Create a new Slack App](https://api.slack.com/apps?new_app=1).
    * Use "Joe Bot" as App Name and select a proper team Workspace.

1. Grant permissions on the "OAuth & Permissions" page for the following "Scopes/Bot Token Scopes":
    * `channels:history`
    * `chat:write`
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

    * You will get `Bot User OAuth Access Token` which is required to run the Joe app (use as `CHAT_TOKEN`).

    * Go to the "Basic Information" page to get `Signing Secret` from the "App Credentials" section (use as `CHAT_SIGNING_SECRET`).

Now we have all tokens and ready to run Joe Bot.

### Step 3. Run
1. Go to the prepared machine with Docker and run the Joe Docker image to connect with the Database Lab server.
    * Pass environment variables according to the Database Lab configurations.
    * Use Slack tokens obtained in the previous step.

    ```bash
    sudo docker run \
        --name joe_bot \
        --publish 3001:3001 \
        --restart=on-failure \
        --env DBLAB_URL="https://dblab.domain.com" \
        --env DBLAB_TOKEN="DBLAB_SECRET_TOKEN" \
        --env DBLAB_DBNAME="DBLAB_DBNAME" \
        --env CHAT_TOKEN="YOUR_SLACK_CHAT_TOKEN" \
        --env CHAT_SIGNING_SECRET="YOUR_SLACK_SIGNING_SECRET" \
        --env SERVER_PORT=3001 \
        --detach \
    postgresai/joe:latest
    ``` 
    The Joe instance will be running by port 3001 of the current machine. It must be specified as the Request URL on the configuration Slack App stage.

1. Make a publicly accessible HTTP(S) server port specified in the configuration for Slack Events Request URL (e.g., http://35.200.200.200:3001, https://joe.dev.domain.com).

You can make it in any convenient way. 

If you followed the Database Lab tutorial and installed Joe on the same machine, update the NGINX configuration.

```bash
cat <<CONFIG > default
server {
  listen 443 ssl;

  ssl on;
  ssl_certificate /etc/nginx/ssl/server.crt;
  ssl_certificate_key /etc/nginx/ssl/server.key;

  server_name ${IP_OR_HOSTNAME};
  access_log /var/log/nginx/database_lab.access.log;
  error_log /var/log/nginx/database_lab.error.log;

  location /dblab {
    proxy_set_header   X-Forwarded-For $remote_addr;
    proxy_set_header   Host $http_host;
    rewrite ^/dblab(/.*) $1 break;
    proxy_pass         "http://127.0.0.1:3000";
  }

  location /joe {
    proxy_set_header   X-Forwarded-For $remote_addr;
    proxy_set_header   Host $http_host;
    rewrite ^/joe(/.*) $1 break;
    proxy_pass         "http://127.0.0.1:3001";
  }
}
CONFIG

sudo cp default /etc/nginx/sites-available/default

sudo systemctl restart nginx

# See also (though here it was not used, it might be helpful):
# https://nginxconfig.io/
```

### Step 4. Finish the Slack App configuration
1. Enable Event Subscriptions Feature.
    * Go to the "Event Subscriptions" page.
    * Specify Request URL (URL will be verified by Slack API). You would need to run Joe with proper settings before you could verify Request URL.
    * In the "Subscribe to Bot Events" dropdown-tab add `message.channels`.
    * Press "Save Changes".
    ![Slack App - Event Subscriptions](assets/joe/tutorial-event-subscriptions.png)

1. Invite "Joe Bot" to "#db-lab" channel.

1. Send a command to the #db-lab channel. For example, `help`.

    ![Run command](assets/joe/tutorial-example-help.png)
