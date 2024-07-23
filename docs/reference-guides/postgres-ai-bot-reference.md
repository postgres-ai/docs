---
title: Postgres.AI Bot (beta) tools
sidebar_label: Postgres.AI Bot tools
---

## Overview
This reference describes tools (functions) that are available to the Postgres.AI Bot Beta, including RAG KB semantic search, running benchmarks, executing SQL, and more. It aims to provide a comprehensive overview of the bot's capabilities and how to interact with it effectively.

Under normal circumstances, users are not expected to mention concrete tools when communicating with the bot. However, in certain situations, it might be useful to understand what is possible. In such cases, use this reference and discuss concrete functions and parameters with the bot, as this can help you achieve more predictable results.

## Tool `rag_search`
Using semantic search (pgvector), find relevant pieces of knowledge in the RAG KB (Retrieval Augmented Generation Knowledge Base).

Categories of data in the RAG KB:
- `docs` – documentation; as of July 2024:
    - Postgres versions 9.6–16 (including all contib modules)
    - Patroni
    - PoWA
    - Postgres.AI DBLab Engine
    - PgBouncer
    - StackGres
    - pgBackRest
    - WAL-G
    - PostgREST
    - HypoPG
- `articles` – how-to articles, blog posts; as of July 2024:
    - [Cybertec blog](https://www.cybertec-postgresql.com/en/blog/)
    - [Postgres.AI blog](https://postgres.ai/blog)
    - [OnGres blog](https://www.ongres.com/blog/)
    - [Postgrs HowTos (Postgres.AI)](https://gitlab.com/postgres-ai/postgresql-consulting/postgres-howtos)
    - [Franck Pachot's blog](https://dev.to/franckpachot)
    - [Haki Benita's blog](https://hakibenita.com/)
    - [Jeremy Schneider's blog](https://ardentperf.com/)
    - [Postgres Wiki](https://wiki.postgresql.org/)
- `src` – source code; as of July 2024:
    - Postgres
    - pgBackRest
    - PgBouncer
    - pgvector
    - HypoPG
    - pg_stat_kcache (PoWA)
    - libpg_query
- `mbox` – mailing list archives; as of July 2024:
    - gsql-admin
    - pgsql-bugs
    - pgsql-general
    - pgsql-hackers
    - pgsql-performance
    - pgsql-sql

By default, the search is limited to `docs` and `articles`.

### Input parameters
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **input** (required) | `string`  | Search query string used to find relevant content. | N/A | `"Postgres installation guide"` |
| **categories** | `json` | JSON array listing all categories to be used in search | `["docs", "articles"]` | `["src"]` |
| **match_count**      | `integer` | Maximum number of records to return. If not specified, the default value is used. | `10` | `25` |

## Tool `make_a_plot`
Visualize some data such as benchmark results. This function uses QuickChart; see [QuickChart docs](https://quickchart.io/documentation/) to learn more about its capabilities.

### Input parameters
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **type** (required) | `string` | The type of chart to create. (e.g., "bar" or "line"). | N/A         | `"bar"`             |
| **data**            | `object` | The data to be plotted.                               | N/A         | See structure below. |

**Data Object Structure:**

| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **labels** | `array` | List containing labels for the x-axis. | N/A | `["January", "February"]` |
| **datasets** | `array` | Data to be visualized. Each dataset must have `label` and `data` (an array of numbers). | N/A | See structure below. |

**Dataset Object Structure:**

| **Parameter** | **Type** | **Description** | **Default** | **Example** |
|---|---|----|---|---|
| **label** | `string`  | The label for the dataset. | N/A  | `"My Dataset"` |
| **data**  | `array`   | Array of numbers representing the data points. | N/A | `[10, 20, 30, 40]` |

## Tool `fetch_whole_web_page`
Fetch the content of a web page. As of July 2024, this feature is limited to these domains:
- `github.com`
- `gitlab.com`
- `postgresql.org`
- `postgres.ai`
- `wiki.postgresql.org`

### Input parameters
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **url** (required) | `string` | The URL of the page to fetch. | N/A | `https://www.postgresql.org/docs/17/release-17.html` |


## Tool `run_db_experiment_dedicated_env`
Database experiment in dedicated environment: creates a PostgreSQL cluster in Google Cloud and executes a series of 
experiment runs on it using a GitLab CI pipeline.

When started, provides pipeline URL. Once experiment is finished, either succesfully or with errors, 
the user is informed of the results.

JSON configuration example:
```json
{
  "ref":"master",
  "SERVER_TYPE":"n2-standard-2",
  "VOLUME_SIZE":"100",
  "POSTGRES_VERSION":"16",
  "MODE": "dedicated",
  "PGBENCH_INIT_COMMAND": "pgbench -i -s 100 -q",
  "TEST_RUNS": {
    "w/o wal_compression": {
      "pre_configs": [
        "wal_compression=off"
      ],
      "workload_pgbench": "pgbench -h localhost -p 5432 -U postgres -c4 -j4 -nr -P10 -T600 postgres"
    },
    "with wal_compression": {
      "pre_configs": [
        "wal_compression=on"
      ],
      "workload_pgbench": "pgbench -h localhost -p 5432 -U postgres -c4 -j4 -nr -P10 -T600 postgres"
    }
  }
}
```

### Input parameters
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **SERVER_TYPE** (required)      | `string`  | Type of server to deploy. Supported values: various configurations with specific vCPUs and RAM. | `"n2-standard-4"`                                       | `"n2-standard-4"`                               |
| **SERVER_LOCATION**             | `string`  | GCP region or region+zone for server deployment. If not specified, an available zone will be selected. | `""`                                                    | `"us-central1"`                                 |
| **SERVER_SPOT**                 | `string`  | Defines whether the GCP compute instance is preemptible (spot).                                 | `"true"`                                                | `"true"`                                        |
| **SERVERS_COUNT**               | `string`  | Number of Postgres VMs in cluster.                                                              | `"1"`                                                   | `"2"`                                           |
| **SERVER_IMAGE**                | `string`  | OS and Postgres versions available on the server image.                                         | `"ubuntu-2204-postgres-17beta1-163-157-1412-1315-1219"` | `"ubuntu-2204-postgres-162-156-1411-1314-1218"` |
| **SERVER_FSTYPE**               | `string`  | File system type.                                                                           | `"ext4"`                                                | `"xfs"`                                         |
| **FLUSH_CACHES**                | `boolean` | Flush the page cache and restart Postgres before each run of test experiments.                  | `false`                                                 | `true`                                          |
| **VOLUME_SIZE** (required)      | `string`  | Disk size, in GiB.                                                                              | `"100"`                                                 | `"200"`                                         |
| **VOLUME_TYPE**                 | `string`  | Volume type.                                                                                | `"pd-ssd"`                                              | `"pd-extreme"`                                  |
| **CLEANUP_AFTER_SECONDS**       | `string`  | How long (in seconds) the server stays up after the test finishes.                              | `"1"`                                                   | `"60"`                                          |
| **PGBENCH_INIT_COMMAND**        | `string`  | pgbench initialization command.                                                                 | `"pgbench -i -q -s 100"`                                | `"pgbench -i -q -s 500"`                        |
| **PGBOUNCER**                   | `string`  | Use PgBouncer or not.                                                                           | `"false"`                                               | `"true"`                                        |
| **PGBOUNCER_COUNT**             | `string`  | Number of PgBouncers to be installed (with `SO_REUSEPORT`).                                       | `"1"`                                                   | `"2"`                                           |
| **HAPROXY**                     | `string`  | Use HAProxy or not.                                                                             | `"false"`                                               | `"true"`                                        |
| **POSTGRES_VERSION** (required) | `string`  | Postgres major version. Options: `10`, `11`, `12`, `13`, `14`, `15`, `16`, `17`.                | `"16"`                                                  | `"15"`                                          |
| **TEST_RUNS** (required)        | `object`  | JSON object containing test series description.                                                 | N/A                                                     | See below.                                       |

#### `TEST_RUNS` (JSON object)
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **pre_configs**                 | `array`  | Optional array of configuration settings specific to this scenario.                                                                                                                                                                                                                               | N/A         | `["wal_compression=off"]`                                                       |
| **pre_shell**                   | `string` | Optional bash snippet to execute prior to workload.                                                                                                                                                                                                                                               | N/A         | `"echo '[some sql]' > /tmp/part1.sql && echo '[another sql]' > /tmp/part2.sql"` |
| **pre_sql**                     | `string` | Optional SQL commands to be executed prior to workload.                                                                                                                                                                                                                                           | N/A         | `"SET work_mem = '64MB';"`                                                      |
| **workload_sql**                | `string` | Workload SQL queries to be executed in this scenario.                                                                                                                                                                                                                                             | N/A         | `"SELECT pg_sleep(1);"`                                                         |
| **workload_pgbench** | `string` | Workload command to be executed in this scenario. Unless specified otherwise, always use options `-P10` and `-r`. Values for `-c` and `-j` should be the same (e.g., `-c 4 -j 4`), unless specified otherwise. If no `-c`/`-j` values are provided, use a half of vCPU count (e.g., for 32-vCPU machine: `-c 16 -j 16`). | N/A         | `pgbench -c 10 -j 10 -T 600 postgres`                                         |

## Tool `get_experiment_results`
Access and analyze experiment's results, or get pipeline's job statuses if the experiment is still running.

### Input parameters
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **pipeline_id** (required) | `string` | Pipeline ID. | N/A         | `12345`   |

## Tool `sql_execute`
Connects to Postgres database and executes SQL query. If database credentials are provided, they are used to establish Postgres connection. Otherwise, a new DBLab clone is created using `create_dblab_clone` and then clone's credentials are used.

### Input parameters
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **SQL** (required) | `string` | SQL query.                        | N/A         | `SELECT * FROM users` |
| **DB** (required)  | `object` | DB connection credentials. | N/A         | See below.               |

#### `DB` (JSON object)
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **db_name** (required)  | `string` | DB name.                           | N/A         | `my_database` |
| **user** (required)     | `string` | DB user name. | N/A         | `admin`       |
| **password** (required) | `string` | DB password.  | N/A         | `password`    |
| **host** (required)     | `string` | DB connection hostname or IP address.                   | N/A         | `localhost`   |
| **port** (required)     | `string` | DB connection port number.                      | N/A         | `5432`        |


## Tool `create_dblab_clone`
Create a new DBLab clone for a specific Postgres major version (`16` by default). This function is called when user wants to execute a SQL query but hasn't provided DB connection information.

### Input parameters
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **POSTGRES_VERSION** (required)       | `string` | Postgres major version. Options: `12`, `13`, `14`, `15`, `16`. Default: `16`          | `16`      | `13`      |

## Tool `reset_dblab_clone`
Reset DBLab clone to its original state.

### Input parameters
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **CLONE_ID** (required) | `string` | ID of existing DBLab clone. | N/A         | `clone123` |

## Tool `sql_plan_analysis_helper`
Get EXPLAIN plan optimization insights from [pgMustard](https://pgMustard.com/).

### Input parameters
| **Parameter** | **Type**  | **Description**   | **Default** | **Example** |
|---|---|----|---|---|
| **plan** (required) | `string` | Postgres query plan in string format. | N/A         | `Seq Scan on users (cost=0.00..34.50 rows=2450 width=12) (actual time=0.012..0.045 rows=2450 loops=1)\nExecution Time: 0.067 ms` |