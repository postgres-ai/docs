---
title: Joe Bot Configuration
---

There are two ways to define Joe Bot options:
- configuration file,
- environment variables.

Use both of them to get the best experience.

> ⚠ Note that environment variables have a higher priority.


## Joe Bot configuration file

```yml
app:
  # HTTP server IP address or host. 
  # Default: "127.0.0.1" (only local connections).
  # Use empty string to listen all network interfaces.
  host: "127.0.0.1"

  # HTTP server port. Default: 2400.
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

  # Postgres.ai Platform project to which user sessions are to be assigned.
  project: "demo"

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

  # Available communication types ("webui", "slack", etc.)
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

    # Communication type: Slack.
    slack:
      # Workspace name. Feel free to choose any name, it is just an alias.
      - name: Workspace

        credentials:
          # Bot User OAuth Access.
          # See https://api.slack.com/authentication/token-types
          accessToken: xoxb-XXXX

          # Slack App Signing Secret.
          # See https://api.slack.com/authentication/verifying-requests-from-slack
          signingSecret: signing_secret

        channels:
          # Slack channel ID. In Slack app, right-click on the channel name,
          # and choose "Additional options > Copy link". From that link, we
          # need the last part consisting of 9 letters starting with "C".
          - channelID: CXXXXXXXX

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

```

## General environment variables

### `SERVER_HOST`
- (string, default: `127.0.0.1`), host that Joe bot API accepts HTTP connections from. It can be defined either as an IP address or domain name. By default, it accepts only local connections. Use an empty string to accept all connections.

### `SERVER_PORT`
- (integer, default: `2400`), HTTP server port used to serve requests to Joe bot API.

### `MIN_NOTIFY_DURATION`
- (string, default: `60s`), if the processing of command takes longer than the specified value, a notification will be issued to the user.

### `PLATFORM_URL`
- (string, default: `https://postgres.ai/api/general`), Postgres.ai Platform API base URL.

### `PLATFORM_TOKEN`
- (string), Postgres.ai Platform API Token.

### `PLATFORM_PROJECT`
- (string), Postgres.ai Platform project to assign user sessions.

### `HISTORY_ENABLED`
- (boolean, default: `true`), enable sending command history to Postgres.ai Platform for collaboration and visualization. Requires setting proper `PLATFORM_TOKEN`. See the [Joe Bot Tutorial](https://postgres.ai/docs/joe-bot/tutorial#step-2a-set-up-joe-in-postgresai-console-web-ui) for the token.

### `JOE_DEBUG` 
- (boolean, default: `false`), enable debug mode.

--- 

## Enterprise environment variables
Changing these options you confirm that you have active subscription to [Postgres.ai Platform](https://postgres.ai/console/) Enterprise Edition).

### `EE_QUOTA_LIMIT`
- (integer, default: `10`), limits request rates, works in pair with `EE_QUOTA_INTERVAL`.

### `EE_QUOTA_INTERVAL`
- (integer, default: `60`), time interval (in seconds) to apply `EE_QUOTA_LIMIT`.

### `EE_AUDIT_ENABLED` 
- (boolean, default: `false`), enable command logging for audit purposes.

### `EE_DBLAB_INSTANCE_LIMIT` 
- (integer, default: `1`), limit the number of Database Lab instances. Joe Bot CE supports working with only 1 Database Lab instance.
