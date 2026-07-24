---
title: Run Joe from the CLI (pgai joe)
sidebar_label: Joe from the CLI
description: Use pgai joe to get query plans, real EXPLAIN ANALYZE results, and test index ideas on ephemeral DBLab clones — right from your terminal.
keywords:
  - "pgai joe"
  - "postgresai cli"
  - "joe bot"
  - "explain analyze"
  - "query optimization"
  - "hypopg"
---

[Joe](/docs/joe-bot) is the PostgresAI SQL optimization assistant: it runs your
`EXPLAIN` / `EXPLAIN ANALYZE` requests on an ephemeral [DBLab](/docs/database-lab)
thin clone of your database, so you can analyze and optimize queries with
production-identical plans without touching production. `pgai joe` brings Joe to
the terminal (and to scripts and AI agents): plan a query, get the real
execution plan, build real or hypothetical indexes, and iterate — every result
also lands in the Joe history in the PostgresAI Console.

:::caution dev channel
`pgai joe` and `pgai projects` ship in CLI 0.16, which is currently published
under the **`dev`** npm dist-tag — that's why the examples below run
`npx pgai@dev …` rather than plain `npx pgai`. Once 0.16 reaches `latest`, the
`@dev` suffix will no longer be needed.
:::

## Reference

- [PostgresAI CLI reference — `joe` command](/docs/reference-guides/postgresai-cli-reference#command-joe)
- [PostgresAI CLI reference — `projects` command](/docs/reference-guides/postgresai-cli-reference#command-projects)

## Prerequisites

- **Node.js 18+** (or Bun 1.0+) to run the CLI.
- A project in your organization with a **registered, active Joe instance**
  (see [Joe setup](/docs/tutorials/joe-setup)).
- Your user must hold the **AllFeaturesUser** or **Admin** role in the
  organization — Joe CLI commands are rejected with `403 Forbidden` otherwise.

The CLI is published as two equivalent npm packages: `postgresai` (canonical)
and `pgai` (short wrapper). `npm install -g postgresai@dev` installs both the
`postgresai` and `pgai` binaries; `npx pgai@dev …` runs without installing.

## Authenticate

```bash
npx pgai@dev login
```

This opens your browser (OAuth with PKCE), asks you to pick an organization,
and stores the resulting API key in `~/.config/postgresai/config.json`. All
`joe` commands authenticate with this key. See the
[auth reference](/docs/reference-guides/postgresai-cli-reference#command-auth)
for storing a key directly (`--set-key`), useful in CI.

## Find a project with Joe ready

```bash
npx pgai@dev projects
```

```
PROJECT_ID  ALIAS      PROJECT        JOE    TUNNEL
12          main-db    Main DB        ready  yes
15          analytics  Analytics      no     no
```

A `ready` value in the `JOE` column means the project has an active Joe
instance — those projects can be targeted with `--project <id|alias>` below.
For projects without one, register a Joe instance first, or target a Joe
instance directly with `--instance-id <id>`.

:::note
Examples below use the short `pgai joe …` form for brevity; while 0.16 is on
the dev channel, run them as `npx pgai@dev joe …` (or install globally with
`npm install -g postgresai@dev`).
:::

## Get a query plan (no execution)

`plan` returns the `EXPLAIN` plan **without executing the query** — the fast,
safe default:

```bash
pgai joe plan "select * from users where email = 'alice@example.com'" \
  --project main-db
```

```
command 3521 · ok
plan:
Seq Scan on users  (cost=0.00..1877.10 rows=1 width=142)
  Filter: ((email)::text = 'alice@example.com'::text)
⚑ client-side: Seq Scan on users — no index serves this predicate; consider adding one.
```

The `⚑` line is a lightweight client-side hint derived from the structured
plan; the full result (plan, statistics, recommendations) is also saved to the
Joe history in the Console.

## Get the real execution plan

`explain` runs `EXPLAIN` **and** `EXPLAIN ANALYZE` — the query actually
executes, on the DBLab clone (never on your production database):

```bash
pgai joe explain "select * from users where email = 'alice@example.com'" \
  --project main-db
```

```
command 3522 · ok
plan:
Seq Scan on users  (cost=0.00..1877.10 rows=1 width=142)
  Filter: ((email)::text = 'alice@example.com'::text)

execution plan (EXPLAIN ANALYZE):
Seq Scan on users  (cost=0.00..1877.10 rows=1 width=142) (actual time=8.912..8.914 rows=1 loops=1)
  Filter: ((email)::text = 'alice@example.com'::text)
  Rows Removed by Filter: 99999
Planning Time: 0.176 ms
Execution Time: 8.987 ms
…
```

(Sample output abridged — Joe also returns buffer/timing statistics and
optimization recommendations when available.) Because the clone shares the
production data and planner configuration, plan structure and buffer numbers
match production; timing may differ due to cache state — see
[Joe bot](/docs/joe-bot) for details.

## Test an index idea

Clones are writable: build a real index with `exec`, then re-check the plan.

```bash
pgai joe exec "create index i_users_email on users (email)" --project main-db
pgai joe explain "select * from users where email = 'alice@example.com'" \
  --project main-db
```

Or use [HypoPG](https://github.com/HYPOPG/hypopg) hypothetical indexes — no
actual index build, instant even on huge tables (affects `plan` cost estimates
only, not real execution):

```bash
pgai joe hypo "create index on users (email)" --project main-db
pgai joe plan "select * from users where email = 'alice@example.com'" --project main-db
pgai joe hypo reset --project main-db
```

(Every `joe` command except `result` needs a target: pass
`--project <id|alias>` or `--instance-id <id>` — or set a default project
once with `pgai set-default-project <project>` and omit both.)

To start over from a pristine clone:

```bash
pgai joe reset --project main-db
```

## Inspect and manage clone activity

```bash
# pg_stat_activity snapshot on the clone
pgai joe activity --project main-db

# terminate a runaway backend on the clone
pgai joe terminate 12345 --project main-db

# \d-family metadata: tables, indexes, sizes
pgai joe describe users --project main-db
pgai joe describe users --variant '\d+' --project main-db
```

## Long-running commands

Commands are synchronous: the CLI submits the command and polls for the result
for up to 25 seconds (configurable with `--budget <seconds>`). If the result
isn't ready in time — e.g. a long `EXPLAIN ANALYZE`, or a cold clone being
provisioned — the CLI exits successfully with a resume handle:

```
started 3523 · pending · budget 25s reached — resume:  pgai joe result 3523
```

Fetch the result later by command id:

```bash
pgai joe result 3523
```

## Scripting and agents

Every `joe` subcommand (and `projects`) accepts `--json` for machine-readable
output, and `--debug` to trace API calls:

```bash
pgai joe plan "select 1" --project main-db --json | jq '.plan_json'
```

Exit codes are script-friendly: `0` for a successful result (and for a
budget-expired one-shot — resume by id), `1` for a failed command or any error.

## Troubleshooting

- **`Project not found for id/alias/name '…'`** — run `pgai projects` to see
  available projects; the match is case-insensitive on id, alias, and name.
- **`Project '…' has no Joe instance`** — `--project` requires the project to
  have a registered, active Joe instance. Register one, or target a Joe
  instance directly with `--instance-id <id>`.
- **`403 Forbidden` / "Joe API v2 requires the All Features role"** — ask an
  org admin to grant your user the **AllFeaturesUser** (or **Admin**) role.
- **`401`** — your stored API key is missing or expired; re-run `pgai login`.
- **Environments behind Cloudflare Access** (previews, some staging setups) —
  the CLI's plain HTTPS calls may be blocked by the access layer; you may need
  extra setup (e.g. a service token) or to run from an allowed network. For
  non-production API endpoints, see
  [environment variables](/docs/reference-guides/postgresai-cli-reference#environment-variables)
  (`PGAI_API_BASE_URL`).
