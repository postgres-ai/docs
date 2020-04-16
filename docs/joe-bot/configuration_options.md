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
  # HTTP server port. By default: 3001.
  port: 3001

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
  # for collaboration and visualization. By default: false.
  historyEnabled: false

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
              dbname: postgres
              sslmode: disable

    # Slack communication type configuration.
    slack:
        # Workspace name. Feel free to choose any name.
      - name: Workspace

        credentials:
          # Bot User OAuth Access Token ("xoxb-TOKEN").
          accessToken: access_token
          
          # Slack App Signing Secret.
          signingSecret: secret_signing

        channels:
            # Slack channel ID. In Slack app, right-click on the channel name,
            # and choose "Additional options < Copy link". From that link, we
            # need the last part consisting of 9 letters starting with "C".
          - channelID: CXXXXXXXX

            # Database Lab alias from the dblabServers section.
            dblabServer: prod1

            # Postgres connection parameters used to connect to a clone.
            # The password is not needed, it will be randomly generated 
            # each time a new clone is created.
            dblabParams:
              dbname: postgres
              sslmode: disable

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

```

## General environment variables

### `SERVER_PORT`
- (integer, default: `3001`), HTTP server port used to serve requests to Joe bot API.

### `MIN_NOTIFY_DURATION`
- (string, default: `60s`), if the processing of command takes longer than the specified value, a notification will be issued to the user.

### `PLATFORM_URL`
- (string, default: `https://postgres.ai/api/general`), Postgres.ai Platform API base URL.

### `PLATFORM_TOKEN`
- (string), Postgres.ai Platform API Token.

### `PLATFORM_PROJECT`
- (string), Postgres.ai Platform project to assign user sessions.

### `HISTORY_ENABLED`
- (boolean, default: `false`), enable sending command history to Postgres.ai Platform for collaboration and visualization.

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
- (integer, default: `1`), limit the number of Database Lab instances. Joe bot CE supports working with only 1 Database Lab instance.