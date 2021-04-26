---
title: Database Lab Client CLI reference (dblab)
sidebar_label: Client CLI reference
keywords:
  - "Database Lab Client CLI"
  - "dblab cli"
  - "postgres.ai cli"
  - "use database lab in console"
  - "clone postgres in console"
---

## Description
The Database Lab Command Line Interface (`dblab`) is a tool that allows working with Database Lab instances in the console. This tool is also used to enable working with thin clones in CI/CD pipelines, to run automated tests on full-size database copies.


## Getting started
Before you run any commands, install Database Lab CLI and initialize configuration. For more information, see [Install and initialize Database Lab CLI](/docs/guides/cli/cli-install-init).


## Synopsis
```bash
dblab [global options] command [command options] [arguments...]
```

Use Database Lab CLI command `help` for information on a specific command. The synopsis for each command shows its parameters and their usage. Optional parameters are shown in square brackets.

To list available commands, either run `dblab` with no parameters or with flag `dblab --help`


## Global options
- `--url` (string) - URL (with protocol and port, if needed) of Database Lab instance's API. 

    The environment variable `DBLAB_INSTANCE_URL` can be used as well. The flag `--url` overrides config/env settings.

- `--token` (string) - verification token of Database Lab instance. 

    The environment variable `DBLAB_VERIFICATION_TOKEN` can be used as well. The flag `--token` overrides config/env settings.

- `--insecure`, `-k` (boolean, default: false) - allow insecure server connections when using SSL. 

    The environment variable `DBLAB_INSECURE_SKIP_VERIFY` can be used as well. The flags `--insecure` and `-k` override config/env settings.

- `--request-timeout` (string, default: "") - allow changing requests timeout.

  The environment variable `DBLAB_REQUEST_TIMEOUT` can be used as well. The flag `--request-timeout` overrides config/env settings.

- `--forwarding-server-url` (string, default: "") - forwarding server URL of Database Lab instance.

    The environment variable `DBLAB_CLI_FORWARDING_SERVER_URL` can be used as well. The flag `--forwarding-server-url` overrides config/env settings.

- `--forwarding-local-port` (string, default: "") - local port for forwarding to the Database Lab instance.

    The environment variable `DBLAB_CLI_FORWARDING_LOCAL_PORT` can be used as well. The flag `--forwarding-local-port` overrides config/env settings.

- `--identity-file` (string, default: "") - select a file from which the identity (private key) for public key authentication is read".

    The environment variable `DBLAB_CLI_IDENTITY_FILE` can be used as well. The flag `--identity-file` overrides config/env settings.

- `--debug` (boolean, default: false) - run CLI in the debug mode.

    The environment variable `DBLAB_CLI_DEBUG` can be used as well.

- `--help`, `-h` (boolean, default: false) - show help.

- `--version`, `-v` (boolean, default: false) - print the version.

**Examples**
```bash
dblab --url "127.0.0.1:2345" --token "SECRET_TOKEN" --insecure clone list
```

```bash
DBLAB_INSTANCE_URL="example.com" DBLAB_VERIFICATION_TOKEN="SECRET_TOKEN" dblab clone list
```

:::tip
If you register a Database Lab instance on the Postgres.ai Platform through the Platform server tunnel, it means that to use Database Lab API and CLI, your users need to be able to reach your infrastructure somehow. Consider use of VPN or custom SSH [port forwarding](https://en.wikipedia.org/wiki/Port_forwarding).
:::

## Command Overview
```
COMMANDS:
   init          initialize Database Lab CLI.
   port-forward  start port forwarding to the Database Lab instance.
   clone         manages clones.
   instance      displays instance info.
   snapshot      manage snapshots.
   config        configure CLI environments.
   help, h       shows a list of commands or help for one command.
```


## Command: `init`
Initialize a working directory containing Database Lab configuration files. This is the first command that should be run before managing clones or changing the Database Lab configuration.

It is safe to run this command multiple times.

**Usage**
```bash
dblab init [command options] [arguments...]
```
**Options**
   - `--environment-id` (string, required) - an arbitrary environment ID of Database Lab instance's API
   - `--url` (string, required) - URL of Database Lab instance's API
   - `--token` (string, required) - verification token of Database Lab instance
   - `--insecure` (boolean, optional, default: false) - allow insecure server connections when using SSL
   - `--request-timeout` (string, optional, default: "") - change requests timeout
   - `--forwarding-server-url` (string, optional) - forwarding server URL of Database Lab instance. For example: `ssh://user@remote.host:22`
   - `--forwarding-local-port` (string, optional) - local port for forwarding to the Database Lab instance
   - `--identity-file` (string, optional) - select a file from which the identity (private key) for public key authentication is read"

**Example**
```bash
dblab init --environment-id dev --url "http://127.0.0.1:2345" --token "SECRET_TOKEN" --insecure
```


## Command: `port-forward`
Start port forwarding to the Database Lab instance.

**Usage**
```bash
dblab [global options] port-forward
```
**Global options**
- `--forwarding-server-url` (string, optional) - forwarding server URL of Database Lab instance. For example: `ssh://user@remote.host:22`
- `--forwarding-local-port` (string, optional) - local port for forwarding to the Database Lab instance
- `--identity-file` (string, optional) - a path to a file from which the identity (private key) for public key authentication is read

**Example**
```bash
dblab --forwarding-server-url "ssh://user@remote.host:22" --forwarding-local-port 8888 port-forward
```


## Command: `clone`
Manage Database Lab clones. 

**Usage**
```bash
dblab clone command [command options] [arguments...]
```

**Subcommands**
- `list` - list all existing clones
- `status` - display clone's information
- `create` - create new clone
- `update` - update existing clone
- `reset` - reset clone's state
- `destroy` - destroy clone
- `port-forward` - start port forwarding
- `help` , `h` -  shows a list of commands or help for one command

---
### Subcommand `list`
List all existing clones.

**Usage**
```bash
dblab clone list
```

---
### Subcommand `status`
Display the clone's information.

**Usage**
```bash
dblab clone status CLONE_ID
```

**Arguments**
- `CLONE_ID` (string, required) - an ID of the Database Lab clone to display information

---
### Subcommand `create`
Create a new clone.
**Usage**
```bash
dblab clone create [command options]
```

**Options**
- `--username` (string, required) - database username
- `--password` (string, required) - database password
- `--id` (string, optional) - clone ID
- `--snapshot-id` (string, optional) - snapshot ID
- `--protected` , `-p` (boolean, default: false) - mark instance as protected from deletion
- `--restricted` (boolean, default: false) - use database user with restricted permissions (not a superuser, DML and DDL allowed, `CREATE EXTENSION` is not allowed)
- `--async` , `-a` (boolean, default: false) - run the command asynchronously
- `--extra-config` (string, optional)  set an extra database configuration for the clone. An example: statement_timeout='1s'
- `--help` , `-h` (boolean, default: false) - show help

**Example**
```bash
dblab clone create --username someuser --password somepassword
```

---
### Subcommand `update`
Update the specified clone.

**Usage**
```bash
dblab clone update [command options] CLONE_ID
```
**Arguments**
- `CLONE_ID` (string, required) - an ID of the Database Lab clone to update parameters

**Options**
- `--protected` , `-p` (boolean, optional) - mark instance as protected from deletion
- `--help` , `-h` (boolean, default: false) - show help

**Example**
```bash
dblab clone update --name newName --protected TestCloneID
```

---
### Subcommand `reset`
Reset the clone's state.

**Usage**
```bash
dblab clone reset [command options] CLONE_ID
```
**Arguments**
- `CLONE_ID` (string, required) - an ID of the Database Lab clone to reset state

**Options**
- `--async` , `-a` (boolean, default: false) - run the command asynchronously
- `--help` , `-h` (boolean, default: false) - show help

**Example**
```bash
dblab clone reset TestCloneID
```

---
### Subcommand `destroy`
Destroy the specified clone.

**Usage**
```bash
dblab clone destroy [command options] CLONE_ID
```
**Arguments**
- `CLONE_ID` (string, required) - an ID of the Database Lab clone to destroy.

**Options**
- `--async` , `-a` (boolean, default: false) - run the command asynchronously.
- `--help` , `-h` (boolean, default: false) - show help.

**Example**
```bash
dblab clone destroy TestCloneID
```

---
### Subcommand `start-observation`

:::note 🚧 Experimental
This is an experimental feature (its working title: "CI Observer"). If you have questions, suggestions, or bug reports, please open an issue in the [Database Lab Engine issue tracker](https://gitlab.com/postgres-ai/database-lab/-/issues) and/or raise a discussion in one of [the Database Lab Community channels](https://postgres.ai/docs/database-lab#more).
:::

Start clone state monitoring.
The command runs the clone observation session and estimates results by defined criteria such as lock duration and whole session duration.
To get results, it is necessary to stop the observation session using the `stop-observation` command.

**Usage**
```bash
dblab clone start-observation [command options] CLONE_ID
```
**Arguments**
- `CLONE_ID` (string, required) - an ID of the Database Lab clone to destroy.

**Options**
- `--observation-interval` (integer, default: 0) - interval of metric gathering and output (in seconds). The environment variable `DBLAB_OBSERVATION_INTERVAL`.
- `--max-lock-duration` (integer, default: 0) - maximum allowed duration for locks (in seconds). The environment variable `DBLAB_MAX_LOCK_DURATION`.
- `--max-duration` (integer, default: 0) - maximum allowed duration for observation (in seconds). The environment variable `DBLAB_MAX_DURATION`.
- `--tags` (string, optional) - set tags for the observation session. An example: branch=patch-1.
- `--help` , `-h` (boolean, default: false) - show help.

**Example**
```bash
dblab clone start-observation \
  --observation-interval 60 \
  --max-lock-duration 600 \
  --max-duration 10000 \
  --tags branch=patch1 \
  --tags revision=commit-hash \
  TestCloneID
```

---
### Subcommand `stop-observation`
🚧 Experimental
Summarize clone monitoring session and check results.

**Usage**
```bash
dblab clone stop-observation [command options] CLONE_ID
```
**Arguments**
- `CLONE_ID` (string, required) - an ID of the Database Lab clone to destroy.

**Options**
- `--help` , `-h` (boolean, default: false) - show help.

**Example**
```bash
dblab clone stop-observation TestCloneID
```

---
### Subcommand `port-forward`
Start port forwarding to clone.

**Usage**
```bash
dblab [global options] clone port-forward CLONE_ID
```
**Arguments**
- `CLONE_ID` (string, required) - an ID of the Database Lab clone for port forwarding.

**Global options**
- `--forwarding-server-url` (string, optional) - forwarding server URL of Database Lab instance. For example: `ssh://user@remote.host:22`
- `--forwarding-local-port` (string, optional) - local port for forwarding to the Database Lab instance
- `--identity-file` (string, optional) - a path to a file from which the identity (private key) for public key authentication is read

**Example**
```bash
dblab \
  --forwarding-server-url "ssh://user@remote.host:22" \
  --forwarding-local-port 8888 \
  clone port-forward TestCloneID
```

---
### Subcommand `help` , `h`
Show help for the specified command.

**Usage**
```bash
dblab clone help
```


## Command: `instance`
Display the instance information.

**Usage**
```bash
dblab instance command [command options] [arguments...]
```

**Subcommands**
- `status` - display instance's status
- `version` - display instance's version
- `help` , `h` -  shows a list of commands or help for one command

---
### Subcommand `status`
Get the status of the instance we are working with.

**Usage**
```bash
dblab instance status
```

---
### Subcommand `version`
Get the version of the instance we are working with.

**Usage**
```bash
dblab instance version
```

---
### Subcommand `help` , `h`
Show help for the command.

**Usage**
```bash
dblab instance help
```


## Command: `snapshot`
Manage snapshots.

**Usage**
```bash
dblab snapshot command [command options] [arguments...]
```

**Subcommands**
- `list` - list all existing snapshots.
- `help` , `h` -  shows a list of commands or help for one command.

---
### Subcommand `list`
Get the list of snapshots.

**Usage**
```bash
dblab snapshot list
```

---
### Subcommand `help` , `h`
Show help for the command.

**Usage**
```bash
dblab snapshot help
```


## Command: `config`
Configure CLI environments.

**Usage**
```bash
dblab config command [command options] [arguments...]
```

**Subcommands**
- `create` - create new CLI environment
- `update` - update an existing CLI environment
- `view` - view status of CLI environment
- `list` - display list of all available CLI environments
- `switch` - switch to another CLI environment
- `remove` - remove CLI environment
- `help` , `h` -  shows a list of commands or help for one command

---
### Subcommand `create`
Create a new CLI environment.

**Usage**
```bash
dblab config create [command options] ENVIRONMENT_ID
```
**Arguments**
- `ENVIRONMENT_ID` (string, required) - an ID of the Database Lab CLI environment to create.

**Options**
- `--url` (string, required) - URL of Database Lab instance's API
- `--token` (string, required) - verification token of Database Lab instance
- `--insecure` (boolean, optional) - allow insecure server connections when using SSL
- `--request-timeout` (string, optional) - change requests timeout
- `--forwarding-server-url` (string, optional) - forwarding server URL of Database Lab instance. For example, `ssh://user@remote.host:22`
- `--forwarding-local-port` (string, optional) - local port for forwarding to the Database Lab instance
- `--identity-file` (string, optional) - a path to a file from which the identity (private key) for public key authentication is read

**Example**
```bash
dblab config create --url "http://127.0.0.1:2345" --token SECRET_TOKEN --insecure=true dev
```

---
### Subcommand `update`
Update an existing CLI environment.

**Usage**
```bash
dblab config update [command options] ENVIRONMENT_ID
```
**Arguments**
- `ENVIRONMENT_ID` (string, required) - an ID of the Database Lab CLI environment to update

**Options**
- `--url` (string) - URL of Database Lab instance's API
- `--token` (string) - verification token of Database Lab instance
- `--insecure` (boolean, optional) - allow insecure server connections when using SSL
- `--request-timeout` (string, optional) - change requests timeout
- `--forwarding-server-url` (string, optional) - forwarding server URL of Database Lab instance. For example, `ssh://user@remote.host:22`
- `--forwarding-local-port` (string, optional) - local port for forwarding to the Database Lab instance
- `--identity-file` (string, optional) - a path to a file from which the identity (private key) for public key authentication is read

**Example**
```bash
dblab config update --url "http://127.0.0.1:2345" --token SECRET_TOKEN --insecure=true dev
```

---
### Subcommand `view`
Display status of CLI environment.

**Usage**
```bash
dblab config view [ENVIRONMENT_ID]
```
**Arguments**
- `ENVIRONMENT_ID` (string) - an ID of the Database Lab CLI environment to view. By default, the current environment will be shown


---
### Subcommand `list`
Display list of all available CLI environments.

**Usage**
```bash
dblab config list
```

---
### Subcommand `switch`
Switch to another CLI environment.

**Usage**
```bash
dblab config switch ENVIRONMENT_ID
```
**Arguments**
- `ENVIRONMENT_ID` (string, required) - an ID of the Database Lab CLI environment to switch

---
### Subcommand `remove`
Remove CLI environment.

**Usage**
```bash
dblab config remove ENVIRONMENT_ID
```
**Arguments**
- `ENVIRONMENT_ID` (string, required) - an ID of the Database Lab CLI environment to remove

---
### Subcommand `help` , `h`
Show help for the command.

**Usage**
```bash
dblab config help
```

## Command: `help`
Show help for the Client CLI subcommands.

**Usage**
```bash
dblab help command [command options] [arguments...]
```

**Subcommands**
- `init` -          initialize Database Lab CLI
- `port-forward` -  start port forwarding to the Database Lab instance
- `clone` -         manage clones
- `instance` -      display instance info
- `snapshot` -      manage snapshots
- `config` -        configure CLI environments
- `help` , `h` -    show a list of commands or help for one command
