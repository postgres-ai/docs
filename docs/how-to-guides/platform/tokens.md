---
title: Create and use Database Lab Platform access tokens
sidebar_label: Create and use tokens
---

By default Database Lab Engine uses a single [verification token](/docs/reference-guides/database-lab-engine-configuration-reference#section-global-global-parameters) for authorization of request to its API. For security purposes and more granular control, we recommend enabling access tokens support in Database Lab Engine configuration. In this case, all Database Lab users will have personal tokens which can be revoked individually not affecting others.

# Token types

### Engine tokens
- **Verification tokens** - used for basic authorization of requests to Database Lab Engine API. Can be used for initial setup, but it's not recommended to use in the daily practice

### Access tokens
Access tokens can be used to interact both with Database Lab Engine and Database Lab Platform. To work with the Database Lab CLI/API, generate a new token and use it in the `Verification-Token` header of each individual API request. Alternatively, you can if it with the `--token` flag during CLI initialization; in this case, `Verification-Token` is not needed.

Access tokens allow calling the following functions on the Platform: `checkup_report_create`, `checkup_report_file_post`, `dblab_token_check`, `joe_message_artifact_post`, `joe_message_post`, `joe_session_command_post`, `joe_session_create`.

- **Administrative tokens** - used to organize infrastructure
- **Personal tokens** - used by individuals to work with API and CLI

:::tip Token context
Tokens of both types work in the context of a particular organization. Administrators can manage personal tokens, as well as administrative (impersonal) ones. Users can manage only their own personal tokens.
:::

## Create a token
1. On the **Access tokens** page, in the **Add token** section:
    - specify the token name (any string)
    - set the expiration date (1 year by default)
    - choose access token type using the **Personal token** checkbox (only for administrators, uncheck to create **Administrative** token)
2. Click the **Add token** button
    ![Access tokens page / Add token](/assets/guides/tokens-1.png)
3. Save the token, it will not be shown again. You can use the **Copy** button
    ![Access tokens page / Copy token](/assets/guides/tokens-2.png)

## Enable personal tokens support
1. Follow [**Create a token**](#create-a-token) guide to create an administrative access token for the Database Lab Engine to connect to the Platform.
2. Add the `platform` section to the Database Lab Engine configuration. For example:
    ```yaml
    platform:
      # Platform API URL. To work with Postgres.ai SaaS, keep it default
      # ("https://postgres.ai/api/general").
      url: "https://postgres.ai/api/general"

      # Token for authorization in Platform API. This token can be obtained on
      # the Postgres.ai Console: https://postgres.ai/console/YOUR_ORG_NAME/tokens
      # This token needs to be kept in secret, known only to the administrator.
      accessToken: "platform_access_token"

      # Enable authorization with personal tokens of the organization's members.
      # If false: all users must use "accessToken" value for any API request
      # If true: "accessToken" is known only to admin, users use their tokens,
      # and any token can be revoked not affecting others.
      enablePersonalTokens: true
    ```
