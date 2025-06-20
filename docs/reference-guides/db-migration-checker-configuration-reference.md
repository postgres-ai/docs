---
title: DB Migration Checker configuration reference
sidebar_label: DB Migration Checker configuration
---

## Overview
DB Migration Checker is a component of DBLab Engine (DLE). Its behavior is controlled using a separate configuration YAML file. This reference describes available configuration options.

Example config files can be found here: https://gitlab.com/postgres-ai/database-lab/-/blob/master/engine/configs/config.example.ci_checker.yml.

It is possible to store configuration files where it is more convenient. The recommended location of configuration files for DB Migration Checker  is `~/.dblab/ci_checker/configs`.

:::info
Make sure that the file name is `ci_checker.yml` and its directory is mounted to `/home/dblab/configs` inside the DB Migration Checker container.
:::

## The list of configuration sections
Here is how the configuration file is structured:

| Section | Description |
| --- | --- |
| `app` | DB Migration Checker API server |
| `dle` | DBLab Engine API integration |
| `platform` | Postgres.ai Platform integration (provides GUI, advanced features such as user management, user access) |
| `source` | Source code extraction  |
| `runner` | How execution of DB migrations is organized  |

## Section `app`: DB Migration Checker API server
- `host` (string, optional, default: `""`) - the host to which the DB Migration Checker server accepts HTTP connections
- `port` (string, required) - HTTP server port
- `verificationToken` (string, required) - token that is used to work with DB Migration Checker API
- `debug` - allows seeing more in the DBLab Engine logs; WARNING: in this mode, sensitive data (such as passwords) can be printed to logs

## Section `dle`: DBLab Engine API integration
- `url` (string, required) - the URL to which the Database Lab server receives HTTP requests
- `verificationToken` (string, required) - the token that is used to work with Database Lab API

## Section `platform`: Postgres.ai Platform integration
- `url` (string, optional, default: `"https://postgres.ai/api/general"`) - Platform API URL
- `accessToken` (string, required) - the token for authorization in Platform API. This token can be obtained in the Postgres.ai Console
- `enablePersonalTokens` (boolean, optional, default: false) - enables authorization with personal tokens of the organization's members

## Section `source`: Source code extraction
- `type` (string, optional, default: `"github"`) - Git platform where the source code is located (e.g., GitHub)
- `token` (string, required) - access token for getting source code from the version control system

## Section `runner`: How execution of DB migrations is organized
- `image` (string, required) - Docker image containing tools for executing database migration commands. For example, `postgresai/migration-tools:sqitch`
