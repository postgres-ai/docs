---
title: Client CLI Reference
---

## Description

The Database Lab Command Line Interface is a tool to manage your Database Lab instance.


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

- `--debug` (boolean, default: false) - run CLI in the debug mode.

    The environment variable `DBLAB_CLI_DEBUG` can be used as well.

- `--help`, `-h` (boolean, default: false) - show help.

- `--version`, `-v` (boolean, default: false) - print the version.

**Examples**
```bash
dblab --url "127.0.0.1:3000" --token "SECRET_TOKEN" --insecure clone list
```
```bash
DBLAB_INSTANCE_URL="example.com" DBLAB_VERIFICATION_TOKEN="SECRET_TOKEN" dblab clone list
```


## Command Overview
```
COMMANDS:
   init      initialize Database Lab CLI.
   clone     manages clones.
   instance  displays instance info.
   snapshot  manage snapshots.
   config    configure CLI environments.
   help, h   Shows a list of commands or help for one command.
```


## Command: `init`
Initialize a working directory containing Database Lab configuration files. This is the first command that should be run before managing clones or changing the Database Lab configuration.

It is safe to run this command multiple times.

**Usage**
```bash
dblab init [command options] [arguments...]
```
**Options**
   - `--environment_id` (string, required) - an arbitrary environment ID of Database Lab instance's API.
   - `--url` (string, required) - URL of Database Lab instance's API.
   - `--token` (string, required) - verification token of Database Lab instance.
   - `--insecure` (boolean, optional, default: false) - allow insecure server connections when using SSL.

**Example**
```bash
dblab init --environment_id dev --url "http://127.0.0.1:3000" --token "SECRET_TOKEN" --insecure
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
dblab clone update --name newName --protected true TestCloneID
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

**Example**
```bash
dblab config create --url "http://127.0.0.1:3001" --token SECRET_TOKEN --insecure=true dev
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

**Example**
```bash
dblab config update --url "http://127.0.0.1:3001" --token SECRET_TOKEN --insecure=true dev
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
- `init` -       initialize Database Lab CLI.
- `clone` -      manage clones.
- `instance` -   display instance info.
- `snapshot` -   manage snapshots.
- `config` -     configure CLI environments.
- `help` , `h` - show a list of commands or help for one command.
