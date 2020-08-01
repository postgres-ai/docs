---
title: Database Lab Client CLI Reference (dblab)
---

## Description

The Database Lab Command Line Interface, `dblab`, is a tool that allows to work with Database Lab instances in console. This tool is also used to enable working with thin clones in CI/CD pipelines, to run automated tests on full-size databases copies.

## Installation

```bash
curl https://gitlab.com/postgres-ai/database-lab/-/raw/master/scripts/cli_install.sh | bash
```

### Supported platforms
- Linux (including Ubuntu, Debian, CentOS, RHEL)
- MacOS
- Windows
- FreeBSD


## Getting started

### Overview

This section shows you how to initialize and start using the Database Lab CLI.

Once you have Database Lab CLI installed, initialize it: `dblab init`. What it does:
1. Creates a configuration file, the default location: `~/.dblab/config`.
1. Sets up a new configuration environment and sets a base set of properties.

### Initialize Database Lab

To initialize Database Lab run the command with required flags:
```bash
dblab init --environment-id ENV_ID --url "https://127.0.0.1:2345" --token "SECRET_TOKEN"
```
- `--environment-id` - an arbitrary environment ID of Database Lab instance's API.
- `--url` - URL of Database Lab instance's API.
- `--token` - verification token of the Database Lab instance to send API requests.

> You can also run [`dblab config`](#command-config) at any time to change your settings or create a new configuration.

Check that Database Lab CLI is properly configured by getting the Database Lab instance state:

```bash
dblab instance status
```

If you see a response, Database Lab CLI is correctly configured to access the Database Lab instance.

### Port forwarding

A Database Lab instance might be running behind firewalls when making exclusions for specific ports is impossible or prohibited.

Use port forwarding to connect to such instances. Set up an SSH server URL: 

```bash
dblab config update --forwarding-server-url "ssh://user@remote.host:22" ENV_ID
```
Run `dblab port-forward` to make the remote Database Lab instance available on the local machine upon running instance control commands.

To change a local port use the `--forwarding-server-url` configuration option. See the [port-forward](#command-port-forward) section.


### How to connect to clones

First, [create a new clone](#subcommand-create):
```bash
dblab clone create --username someuser --password somepassword
```

After a few seconds, you will see that the clone is ready to be used. It should look like this:
```json
{
    "id": "botcmi54uvgmo17htcl0",
    "snapshot": {
        "id": "dblab_pool@initdb",
        "createdAt": "2020-06-15 23:20:04 UTC",
        "dataStateAt": "2020-06-15 23:20:04 UTC"
    },
    "protected": false,
    "deleteAt": "",
    "createdAt": "2020-06-17 14:03:52 UTC",
    "status": {
        "code": "OK",
        "message": "Clone is ready to accept Postgres connections."
    },
    "db": {
        "connStr": "host=111.222.000.123 port=6000 user=someuser dbname=postgres",
        "host": "111.222.000.123",
        "port": "6000",
        "username": "someuser",
        "password": ""
    },
    "metadata": {
        "cloneDiffSize": 479232,
        "cloningTime": 1.892935211,
        "maxIdleMinutes": 120
    },
    "project": ""
}
```

Use the password from the creation command to connect.
 
You can work with this clone using any PostgreSQL client, for example, psql:

```bash
PGPASSWORD=somepassword \
  psql "host=111.222.000.123 port=6000 user=someuser dbname=postgres"
```

If the Database Lab instance is running behind firewalls and clones are not available, use [port forwarding for clones](#subcommand-port-forward).


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

> ⚠ If you register a Database Lab instance on the Postgres.ai Platform through the Platform server tunnel, it means that to use Database Lab API and CLI, your users need to be able to reach your infrastructure somehow. Consider use of VPN or custom SSH [port forwarding](https://en.wikipedia.org/wiki/Port_forwarding).

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
   - `--environment-id` (string, required) - an arbitrary environment ID of Database Lab instance's API.
   - `--url` (string, required) - URL of Database Lab instance's API.
   - `--token` (string, required) - verification token of Database Lab instance.
   - `--insecure` (boolean, optional, default: false) - allow insecure server connections when using SSL.
   - `--forwarding-server-url` (string, optional) - forwarding server URL of Database Lab instance. For example: `ssh://user@remote.host:22`.
   - `--forwarding-local-port` (string, optional) - local port for forwarding to the Database Lab instance.
   - `--identity-file` (string, optional) - select a file from which the identity (private key) for public key authentication is read".

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
- `--forwarding-server-url` (string, optional) - forwarding server URL of Database Lab instance. For example: `ssh://user@remote.host:22`.
- `--forwarding-local-port` (string, optional) - local port for forwarding to the Database Lab instance.
- `--identity-file` (string, optional) - a path to a file from which the identity (private key) for public key authentication is read.

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
- `list` - list all existing clones.
- `status` - display clone's information.
- `create` - create new clone.
- `update` - update existing clone.
- `reset` - reset clone's state.
- `destroy` - destroy clone.
- `port-forward` - start port forwarding.
- `help` , `h` -  shows a list of commands or help for one command.

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
- `CLONE_ID` (string, required) - an ID of the Database Lab clone to display information.

---
### Subcommand `create`
Create a new clone.
**Usage**
```bash
dblab clone create [command options]
```

**Options**
- `--username` (string, required) - database username.
- `--password` (string, required) - database password.
- `--id` (string, optional) - clone ID.
- `--snapshot-id` (string, optional) - snapshot ID.
- `--project` (string, default: "") - project name.
- `--protected` , `-p` (boolean, default: false) - mark instance as protected from deletion.
- `--async` , `-a` (boolean, default: false) - run the command asynchronously.
- `--help` , `-h` (boolean, default: false) - show help.

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
- `CLONE_ID` (string, required) - an ID of the Database Lab clone to update parameters.

**Options**
- `--protected` , `-p` (boolean, optional) - mark instance as protected from deletion.
- `--help` , `-h` (boolean, default: false) - show help.

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
- `CLONE_ID` (string, required) - an ID of the Database Lab clone to reset state.

**Options**
- `--async` , `-a` (boolean, default: false) - run the command asynchronously.
- `--help` , `-h` (boolean, default: false) - show help.

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
### Subcommand `port-forward`
Start port forwarding to clone.

**Usage**
```bash
dblab [global options] clone port-forward CLONE_ID
```
**Arguments**
- `CLONE_ID` (string, required) - an ID of the Database Lab clone for port forwarding.

**Global options**
- `--forwarding-server-url` (string, optional) - forwarding server URL of Database Lab instance. For example: `ssh://user@remote.host:22`.
- `--forwarding-local-port` (string, optional) - local port for forwarding to the Database Lab instance.
- `--identity-file` (string, optional) - a path to a file from which the identity (private key) for public key authentication is read.

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
- `status` - display instance's status.
- `help` , `h` -  shows a list of commands or help for one command.

---
### Subcommand `status`
Get the status of the instance we are working with.

**Usage**
```bash
dblab instance status
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
- `create` - create new CLI environment.
- `update` - update an existing CLI environment.
- `view` - view status of CLI environment.
- `list` - display list of all available CLI environments.
- `switch` - switch to another CLI environment.
- `remove` - remove CLI environment.
- `help` , `h` -  shows a list of commands or help for one command.

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
- `--url` (string, required) - URL of Database Lab instance's API.
- `--token` (string, required) - verification token of Database Lab instance.
- `--insecure` (boolean, optional) - allow insecure server connections when using SSL.
- `--forwarding-server-url` (string, optional) - forwarding server URL of Database Lab instance. For example, `ssh://user@remote.host:22`.
- `--forwarding-local-port` (string, optional) - local port for forwarding to the Database Lab instance.
- `--identity-file` (string, optional) - a path to a file from which the identity (private key) for public key authentication is read.

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
- `ENVIRONMENT_ID` (string, required) - an ID of the Database Lab CLI environment to update.

**Options**
- `--url` (string) - URL of Database Lab instance's API.
- `--token` (string) - verification token of Database Lab instance.
- `--insecure` (boolean, optional) - allow insecure server connections when using SSL.
- `--forwarding-server-url` (string, optional) - forwarding server URL of Database Lab instance. For example, `ssh://user@remote.host:22`.
- `--forwarding-local-port` (string, optional) - local port for forwarding to the Database Lab instance.
- `--identity-file` (string, optional) - a path to a file from which the identity (private key) for public key authentication is read.

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
- `ENVIRONMENT_ID` (string) - an ID of the Database Lab CLI environment to view. By default, the current environment will be shown.


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
- `ENVIRONMENT_ID` (string, required) - an ID of the Database Lab CLI environment to switch.

---
### Subcommand `remove`
Remove CLI environment.

**Usage**
```bash
dblab config remove ENVIRONMENT_ID
```
**Arguments**
- `ENVIRONMENT_ID` (string, required) - an ID of the Database Lab CLI environment to remove.

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
- `init` -          initialize Database Lab CLI.
- `port-forward` -  start port forwarding to the Database Lab instance.
- `clone` -         manage clones.
- `instance` -      display instance info.
- `snapshot` -      manage snapshots.
- `config` -        configure CLI environments.
- `help` , `h` -    show a list of commands or help for one command.
