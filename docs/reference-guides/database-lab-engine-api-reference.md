---
title: DBLab API reference
sidebar_label: DBLab API
description: "API reference for DBLab Engine – Swagger, OpenAPI"
keywords:
  - "database lab API"
  - "dblab engine API"
  - "DBLab API"
  - "postgres cloning API"
  - "database branching API"
---

DBLab API (DLE API) is a REST API. It can be used in multiple ways:
- directly, using a common tool (e.g., [curl](https:/curl.se/), [HTTPie](https://httpie.io/)) or code (Python, Go, Ruby, PHP, NodeJS, and virtually any language or framework that supports work with REST APIs)
- indirectly, in command-line environment: [DLE CLI](https://postgres.ai/docs/reference-guides/dblab-client-cli-reference) operates on top of the DLE API
- indirectly, in browser: [DBLab UI](https://postgres.ai/docs/database-lab/user-interface), being a React application, speaks to the DLE API as well

DBLab API reference documentation is available at the following locations:
- [DBLab 4.1.x API Reference](https://dblab.readme.io/v4.1.0/)
- [DBLab 4.0.x API Reference](https://dblab.readme.io/v4.0.0/)
- [DLE 3.5.x API Reference](https://dblab.readme.io/v3.5.0/)

The references are published using the comprehensive ReadMe service, equipped with a developer dashboard and provides code snippets in numerous languages.

## Authentication

All API endpoints (except `/healthz` and `/metrics`) require the `Verification-Token` header:

```bash
curl -H "Verification-Token: YOUR_TOKEN" http://localhost:2345/status
```

## Endpoint summary

### Instance

| Method | Path | Description |
|--------|------|-------------|
| GET | `/status` | Instance status, info, and list of clones |
| GET | `/healthz` | Health check (no auth required) |
| GET | `/metrics` | Prometheus metrics (no auth required, DLE 4.1+) |
| GET | `/instance/retrieval` | Data refresh status |
| POST | `/full-refresh` | Trigger full data refresh (DLE 4.0+) |

### Clones

| Method | Path | Description |
|--------|------|-------------|
| GET | `/clones` | List all clones (DLE 4.0+) |
| POST | `/clone` | Create a clone |
| GET | `/clone/{id}` | Retrieve a clone |
| PATCH | `/clone/{id}` | Update a clone (protection status) |
| DELETE | `/clone/{id}` | Delete a clone |
| POST | `/clone/{id}/reset` | Reset a clone to a snapshot |

### Snapshots

| Method | Path | Description |
|--------|------|-------------|
| GET | `/snapshots` | List all snapshots |
| POST | `/snapshot` | Create a snapshot (DLE 4.0+) |
| DELETE | `/snapshot/{id}` | Delete a snapshot (DLE 4.0+) |
| GET | `/branch/snapshot/{id}` | Retrieve a snapshot (DLE 4.0+) |
| POST | `/branch/snapshot` | Create a snapshot from clone (DLE 4.0+) |

### Branches (DLE 4.0+)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/branches` | List all branches |
| POST | `/branch` | Create a branch |
| DELETE | `/branch/{branchName}` | Delete a branch |
| GET | `/branch/{branchName}/log` | Retrieve branch log (snapshot history) |

### Observation (experimental)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/observation/start` | Start observation session |
| POST | `/observation/stop` | Stop observation session |
| GET | `/observation/summary/{clone_id}/{session_id}` | Get observation summary |
| GET | `/observation/download` | Download observation artifact |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/config` | Get config (JSON) |
| POST | `/admin/config` | Set config |
| GET | `/admin/config.yaml` | Get full config (YAML) |
| POST | `/admin/test-db-source` | Test source database connection |
| POST | `/admin/ws-auth` | WebSocket authentication |

## New in DBLab Engine 4.1

- **`/metrics` endpoint**: Prometheus metrics for monitoring (no authentication required). See [Prometheus monitoring](/docs/database-lab/prometheus-monitoring).
- **Protection leases**: The `CreateClone` and `UpdateClone` requests now accept a `protectionDurationMinutes` field for time-limited clone protection. The `Clone` response includes `protectedTill` showing when protection expires. See [Clone protection](/docs/dblab-howtos/cloning/clone-protection).
- **`clone_delete` webhook**: A new webhook trigger type for clone deletion events. See [Webhook configuration](/docs/reference-guides/database-lab-engine-configuration-reference#section-webhooks-webhook-configuration).
