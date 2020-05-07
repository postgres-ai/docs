---
title: Overview of postgres-checkup
---

## General

Postgres Checkup ([postgres-checkup](https://gitlab.com/postgres-ai-team/postgres-checkup)) is a diagnostics tool for a deep analysis of a Postgres database health. It detects current and potential issues with database performance, scalability, and security. It also produces recommendations on how to resolve or prevent them.
postgres-checkup also reveals sneaking up, deeper problems, that may hit you in the future. It helps to solve many known database administration problems and common pitfalls. It aims to detect issues at a very early stage and to suggest the best ways to prevent them. 

It makes sense to run this tool on a regular basis — weekly, monthly, and quarterly. Additionally, it is recommended using postgres-checkup during major database changes, right before and right after making the change, for the sake of regression control.

Do you know how big was your database 1, 6, 12 months ago? What are the growth trends for each table and index, how fast the bloat grows in database objects after repacking? Depending on how much details your monitoring system has, and what its retention policies are, these questions might be very tricky to answer in a longer term. This is why it is recommended to store the resulting reports as long as possible, it will enable trend analysis for your database. If you are going to use postgres-checkup with Postgres.ai Platform, uploading reports to the Platform's storage will automatically help you achieve this.

## Reports

At the moment, postgres-checkup generates 28 reports organized in 7 groups.

* А. General / Infrastructural
    - A001 System information
    - A002 Version information
    - A003 Postgres settings
    - A004 Cluster information
    - A005 Extensions
    - A006 Postgres setting deviations
    - A007 Altered settings
    - A008 Disk usage and file system type

* D. Monitoring / Troubleshooting
    - D002 Useful Linux tools
    - D004 pg_stat_statements and pg_stat_kcache settings

* F. Autovacuum, Bloat
    - F001 Autovacuum: current settings
    - F002 Autovacuum: transaction ID wraparound check
    - F003 Autovacuum: dead tuples
    - F004 Autovacuum: heap bloat (estimated)
    - F005 Autovacuum: index bloat (estimated)
    - F008 Autovacuum: resource usage

* G. Performance / Connections / Memory-related Settings
    - G001 Memory-related settings
    - G002 Connections and current activity
    - G003 Timeouts, locks, deadlocks

* H. Index Analysis
    - H001 Invalid indexes
    - H002 Unused indexes
    - H003 Non-indexed foreign keys
    - H004 Redundant indexes

* K. SQL query Analysis
    - K001 Globally aggregated query metrics
    - K002 Workload Type ("The First Word" Analysis)
    - K003 Top-50 queries by total_time

* L. DB Schema Analysis
    - L001 (was: H003) Table sizes
    - L003 Integer (int2, int4) out-of-range risks in PKs // calculate capacity remained; optional: predict when capacity will be fully used) https://gitlab.com/postgres-ai-team/postgres-checkup/issues/237

About 30 reports in 11 groups are planned to be implemented in the future.

Each report consists of two parts:

* JSON report (\*.json file) — can be consumed by any program or service, or stores in some database.
* Markdown report (\*.md file) — the main format for humans, may contain lists, tables, pictures. Being of native format for GitLab and GitHub, such reports are ready to be used, for instance, in their issue trackers, simplifying workflow. Markdown reports are derived from JSON reports.

All separated reports can be compiled to the large ones, which can be converted to different formats such as HTML or PDF.

Each human-readable report consists of three sections:

1. "Observations": automatically collected data. This is to be consumed by an expert DBA.
1. "Conclusions": what we conclude from the Observations, stated in plain English in the form that is convenient for engineers who are not DBA experts.
1. "Recommendations": action items, what to do to fix the discovered issues.

Both "Conclusions" and "Recommendations" are to be consumed by engineers who will make decisions what, how and when to optimize.

## Options

Usage:
  checkup OPTION [OPTION] ...
  checkup help

Postgres checkup can separately collect, process and upload data to server. You can set the working mode with --mode option.
Available values for mode: 'collect', 'process', 'upload', 'run'.
Mode 'run' executes collecting and processing at once, it is a default mode.  
  
General options:  

| Short option | Long option | Description |
|---|---|---|
| -m | --mode | Working mode |
| -e | --epoch | Epoch (integer) |
|  | --project | Project name |
| -f | --file | Collect or process data for only the specified report |
| -c | --config | Path to a configuration YAML file |


'collect' options:  

| <nobr>Short&nbsp;option</nobr> | <nobr>Long&nbsp;option</nobr> | Description |
|---|---|---|
| -h | <nobr>--hostname</nobr> | Connect to the specified host via SSH and then use 'psql' installed on that server or the local 'psql' will be used to work via Postgres connection to the specified host |
| -p | <nobr>--port</nobr> | PostgreSQL database server port (default: 5432) or SSH port (default: 22) |
| | <nobr>--ssh-hostname</nobr> | Connect to the specified host via SSH and then use 'psql' installed on that server |
| | <nobr>--ssh-port</nobr> | SSH port (default: 22) |
| | <nobr>--pg-hostname</nobr> | Connect to the specified host via 'psql'. Local 'psql' will be used to work via Postgres connection to the specified host |
| | <nobr>--pg-port</nobr> | PostgreSQL database server port (default: 5432) |
| -d | <nobr>--dbname</nobr> | Database name to connect to (default: "postgres") |
| | <nobr>--ss-dbname</nobr> | Database name with enabled 'pg_stat_statements' extension (for detailed query analysis) |
| -U | <nobr>--username</nobr> | Database user name (default: psql's default if not given) |
| -s | <nobr>--pg-socket-dir</nobr> | PostgreSQL domain socket directory (default: psql's default) |
| | <nobr>--psql-binary</nobr> | Path to 'psql' (default: determined by '$PATH') |
| -S | <nobr>--statement-timeout</nobr> | Statement timeout for all SQL queries (default: 30 seconds) |
| -t | <nobr>--connection-timeout</nobr> | |

'proccess' options:

| <nobr>Short&nbsp;option</nobr> | <nobr>Long&nbsp;option</nobr> | Description |
|---|---|---|
| -l | --list-limit | How many items will be displayed in the lists (tables) (default: 50) |
| | --html | Generate HTML report |
| | --pdf | Generate PDF report (HTML report will be also generated) |

'upload' options:

| <nobr>Short&nbsp;option</nobr> | <nobr>Long&nbsp;option</nobr> | Description |
|---|---|---|
| -t | --upload-api-token | Access token to upload reports to remote server |
| -u | --upload-api-url | API URL to upload reports (Postgres.ai Platform API compatible) |
| -? | --help | this help |

Example:
```
PGPASSWORD=mypasswd ./checkup collect -h [ssh_user]@host_to_connect_via_ssh \
    --username dmius --dbname postgres \
    --project dummy -e %EPOCH_NUMBER%
```

## Installation and configuration

### Usage postgres-checkup with docker run
The best way to use Postgres Checkup is by using of docker image of the tool.
The docker container will run, execute all checks and stop itself. The check result can be found inside the `artifacts` folder in current directory (pwd).

#### Requirements
In case of usage postgres-checkup with docker run, the only requirement is docker-engine installed.
You can install docker-engine as described in official Docker documentation: https://docs.docker.com/install/

#### Usage

Use the postgres-checkup in this case as follow:

```
# Create config file
cat <<EOF > proj_config.yml
- project: %project_name%
  dbname: %database_name%
  username: %db_username%
  epoch: 1
  pg-port 5432
EOF

# Start check health of Postgres databases
docker run \
  -v $(pwd)/proj_config.yml:/proj_config.yml \
  -v $(pwd)/artifacts:/artifacts \
  -e CHECKUP_CONFIG_PATH="./proj_config.yml" \
  -e SSH_CHECKUP_HOSTS="db1.vpn.local db2.vpn.local" \
  -e CHECKUP_SNAPSHOT_DISTANCE_SECONDS=600 \
  -e PGPASSWORD="${DB_PWD}" \
  registry.gitlab.com/postgres-ai/postgres-checkup:latest \
  bash run_checkup.sh
```

So, firstly you need to fill the configuration file. The next step is running docker with image `registry.gitlab.com/postgres-ai/postgres-checkup:latest`.

We recommend that you name the configuration file like the project name. Сonfiguration file can be filled once and just be used every time you run postgres-checkup docker image.

Please be careful and run the docker image as one command, like in the example. It means that command `bash run_checkup.sh` should be started inside the docker container.

In case of usage command above some checks (those requiring SSH connection) will be skipped.  
If you want to have all supported checks, you have to use SSH access to the target machine with Postgres database.  
If SSH connection to the Postgres server is available, it is possible to pass SSH keys to the docker container, so postgres-checkup will switch to working via remote SSH calls, generating all reports (this approach is known to have issues on Windows, but should work well on Linux and MacOS machines):

```
docker run \
  -v $(pwd)/proj_config.yml:/proj_config.yml \
  -v $(pwd)/artifacts:/artifacts \
  -v "$(echo ~)/.ssh/id_rsa:/root/.ssh/id_rsa:ro" \
  -e CHECKUP_CONFIG_PATH="./proj_config.yml" \
  -e SSH_CHECKUP_HOSTS="db1.vpn.local db2.vpn.local" \
  -e CHECKUP_SNAPSHOT_DISTANCE_SECONDS=600 \
  -e PGPASSWORD="${DB_PWD}" \
  registry.gitlab.com/postgres-ai/postgres-checkup:latest \
  bash run_checkup.sh
```

If you try to check the local instance of Postgres on your host from a container, you cannot use the `localhost` in `-h` parameter. You have to use a bridge between the host OS and Docker Engine. By default, host IP is `172.17.0.1` in `docker0` network, but it varies depending on the configuration. More information [here](https://nickjanetakis.com/blog/docker-tip-65-get-your-docker-hosts-ip-address-from-in-a-container).


### Usage postgres-checkup from sources

#### Requirements

The second way to use postgres-checkup run it from sources. In this case, requirements follow.

The following OS are supported:

* Linux (modern RHEL/CentOS or Debian/Ubuntu; others should work as well, but are not yet tested);
* MacOS.

There are known cases when postgres-checkup was successfully used on Windows, although with some limitations.

The following programs must be installed on the operator machine:

* bash
* psql
* coreutils
* jq >= 1.5
* golang >= 1.8 (no binaries are shipped at the moment)
* awk
* sed
* pandoc \*
* wkhtmltopdf >= 0.12.4 \*

\* pandoc and wkhtmltopdf are optional, they are needed for generating HTML and PDF versions of the report (options `--html`, `--pdf`).

Nothing special has to be installed on the observed machines. However, they must run Linux (again: modern RHEL/CentOS or Debian/Ubuntu; others should work as well, but are not yet tested).

#### How to install
##### 1. Install required programs

Ubuntu/Debian:

```shell
sudo apt-get update -y
sudo apt-get install -y git postgresql coreutils jq golang

# Optional (to generate PDF/HTML reports)
sudo apt-get install -y pandoc
wget https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.4/wkhtmltox-0.12.4_linux-generic-amd64.tar.xz
tar xvf wkhtmltox-0.12.4_linux-generic-amd64.tar.xz
sudo mv wkhtmltox/bin/wkhtmlto* /usr/local/bin
sudo apt-get install -y openssl libssl-dev libxrender-dev libx11-dev libxext-dev libfontconfig1-dev libfreetype6-dev fontconfig
```

CentOS/RHEL:

```shell
sudo yum install -y git postgresql coreutils jq golang

# Optional (to generate PDF/HTML reports)
sudo yum install -y pandoc
wget https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.4/wkhtmltox-0.12.4_linux-generic-amd64.tar.xz
tar xvf wkhtmltox-0.12.4_linux-generic-amd64.tar.xz
sudo mv wkhtmltox/bin/wkhtmlto* /usr/local/bin
sudo yum install -y libpng libjpeg openssl icu libX11 libXext libXrender xorg-x11-fonts-Type1 xorg-x11-fonts-75dpi
```

MacOS (assuming that [Homebrew](https://brew.sh/) is installed):

```shell
brew install postgresql coreutils jq golang git

# Optional (to generate PDF/HTML reports)
brew install pandoc Caskroom/cask/wkhtmltopdf
```

##### 2. Clone this repo

```shell
git clone https://gitlab.com/postgres-ai/postgres-checkup.git
# Use --branch to use specific release version. For example, to use version 1.1:
#   git clone --branch 1.1 https://gitlab.com/postgres-ai/postgres-checkup.git
cd postgres-checkup
```

#### Usage
Let's make a report for a project named `prod1`. Assume that we have two servers, `db1.vpn.local` and `db2.vpn.local`.

Postgres-checkup automatically detects which one is a master:

```shell
./checkup -h db1.vpn.local -p 5432 --username postgres --dbname postgres --project prod1 -e 1
```

```shell
./checkup -h db2.vpn.local -p 5432 --username postgres --dbname postgres --project prod1 -e 1
```

Which literally means: connect to the server with given credentials, save data into `prod1` project directory, as epoch of check `1`. Epoch is a numerical (**integer**) sign of current iteration. For example: in half a year we can switch to "epoch number `2`".

`-h db2.vpn.local` means: try to connect to host via SSH and then use remote `psql` command to perform checks. If SSH is not available the local 'psql' will be used (non-psql reports will be skipped).

Also, you can define a specific way to connect: SSH or `psql`:

`--ssh-hostname db2.vpn.local` - SSH will be used for the connection. SSH port can be defined as well with option `--ssh-port`.

`--pg-hostname db2.vpn.local` - `psql` will be used for the connection. The port where PostgreSQL accepts connections can be defined with the option `--pg-port`.

In case when `--pg-port` or `--ssh-port` are not defined but `--port` is defined, value of `--port` option will be used instead of `--pg-port` or `--ssh-port` depending on the current connection type.

For comprehensive analysis, it is recommended to run the tool on the master and all its replicas – postgres-checkup is able to combine all the information from multiple nodes to a single report.

Some reports (such as K003) require two snapshots, to calculate "deltas" of metrics. So, for better results, use the following example, executing it during peak working hours, with `$DISTANCE` values from 10 min to a few hours:

```shell
$DISTANCE="1800" # 30 minutes

# Assuming that db2 is the master, db3 and db4 are its replicas
for host in db2.vpn.local db3.vpn.local db4.vpn.local; do
  ./checkup \
    -h "$host" \
    -p 5432 \
    --username postgres \
    --dbname postgres \
    --project prod1 \
    -e 1 \
    --file resources/checks/K000_query_analysis.sh # the first snapshot is needed only for reports K***
done

sleep "$DISTANCE"

for host in db2.vpn.local db3.vpn.local db4.vpn.local; do
  ./checkup \
    -h "$host" \
    -p 5432 \
    --username postgres \
    --dbname postgres \
    --project prod1 \
    -e 1
done
```

As a result of execution, two directories containing .json and .md files will be created:

```shell
./artifacts/prod1/json_reports/1_2018_12_06T14_12_36_+0300/
./artifacts/prod1/md_reports/1_2018_12_06T14_12_36_+0300/
```

Each of generated files contains information about "what we check" and collected data for all instances of the postgres cluster `prod1`.

A human-readable report can be found at:

```shell
./artifacts/prod1/md_reports/1_2018_12_06T14_12_36_+0300/Full_report.md
```

Open it with your favorite Markdown files viewer or just upload to a service such as gist.github.com.

You can collect and process data separately by specifying working mode name in CLI option `--mode %mode%` or using it as a "command" (`checkup %mode%`).  
Available working modes as described above:  
    - `collect` - collect data;  
    - `process` - generate MD (and, optionally, HTML, PDF) reports with conclusions and recommendations;  
    - `upload` - upload generated reports to Postgres.ai platform;  
    - `run` - collect and process data at once. This is the default mode, it is used when no other mode is specified. Note, that upload is not included.
