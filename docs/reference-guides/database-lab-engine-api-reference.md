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
- [DBLab API Reference (latest)](https://dblab.readme.io/)
- [DBLab 4.0.x API Reference](https://dblab.readme.io/v4.0.0/)
- [DLE 3.5.x API Reference](https://dblab.readme.io/v3.5.0/)

The references are published using the comprehensive ReadMe service, equipped with a developer dashboard and providing code snippets in numerous languages.

Most of the endpoints added in 4.1 and 4.2 (listed below; `POST /admin/probe-source` is not in the spec yet) are described in the OpenAPI specification shipped with the engine source: [`engine/api/swagger-spec/dblab_openapi.yaml` at v4.2.0](https://gitlab.com/postgres-ai/database-lab/-/blob/v4.2.0/engine/api/swagger-spec/dblab_openapi.yaml). Every engine also serves its own Swagger UI on the API port.

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
| POST | `/clone/{id}/upgrade` | Upgrade a clone to a newer Postgres major (DBLab 4.2+) |

### Snapshots

| Method | Path | Description |
|--------|------|-------------|
| GET | `/snapshots` | List all snapshots |
| GET | `/snapshot/{id}` | Retrieve a snapshot (DLE 4.0+) |
| POST | `/snapshot` | Create a snapshot (DLE 4.0+) |
| POST | `/snapshot/clone` | Create a snapshot from a clone (DLE 4.0+) |
| DELETE | `/snapshot/{id}` | Delete a snapshot (DLE 4.0+) |
| PATCH | `/snapshot/{id}` | Update snapshot deletion protection (DBLab 4.2+) |
| GET | `/branch/snapshot/{id}` | Retrieve a branch snapshot (DLE 4.0+) |
| POST | `/branch/snapshot` | Create a branch snapshot from clone (DLE 4.0+) |

### Branches (DLE 4.0+)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/branches` | List all branches |
| POST | `/branch` | Create a branch |
| DELETE | `/branch/{branchName}` | Delete a branch |
| PATCH | `/branch/{branchName}` | Update branch deletion protection (DBLab 4.2+) |
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
| GET | `/admin/config` | Get config (JSON projection) |
| POST | `/admin/config` | Set config |
| GET | `/admin/config.yaml` | Get full config (YAML) |
| POST | `/admin/test-db-source` | Test source database connection |
| POST | `/admin/probe-source` | Probe a source database and propose a logical retrieval configuration (DBLab 4.2+) |
| GET | `/admin/ws-auth` | WebSocket authentication |

## New in DBLab Engine 4.2

- **`POST /clone/{id}/upgrade`**: upgrade a clone to the Postgres major the instance is configured for (`provision.pgUpgradeImage`). The optional body field `dockerImage` overrides the image the upgraded clone runs. The response is the plan the engine derived (`targetVersion`, `dockerImage`); the clone enters the `UPGRADING` state and the result is visible on `GET /clone/{id}` (`status`, `dbVersion`). `GET /status` reports the instance-wide target as `cloneUpgrade.targetVersion`. See [Upgrade Postgres in a clone](/docs/dblab-howtos/cloning/clone-upgrade).
- **`PATCH /branch/{branchName}` and `PATCH /snapshot/{id}`**: deletion protection for branches and snapshots, with the same body as clone protection (`protected`, `protectionDurationMinutes`). Protected entities are skipped by the [retention sweep](/docs/reference-guides/database-lab-engine-configuration-reference#section-retention-automatic-deletion-of-unused-branches-and-snapshots) and cannot be deleted manually.
- **`POST /admin/probe-source`**: connects to a source database and returns a proposed configuration (provider, Postgres version and image, databases, `shared_buffers`, preload libraries). Used by the UI Simple mode and by [`dblab local-install`](/docs/reference-guides/dblab-client-cli-reference#command-local-install).
- **`clone_upgrade` webhook**: sent when a clone upgrade succeeds. See [Webhook configuration](/docs/reference-guides/database-lab-engine-configuration-reference#section-webhooks-webhook-configuration).
- **`ownerUser` on clones**: when `platform.bindClonesToUser` is enabled, a clone created with a personal token carries the creator's email in `db.ownerUser` (and `owner_user` in the `clone_create` webhook payload). See [Per-user clone access](/docs/dblab-howtos/administration/teleport-integration#per-user-clone-access).

## New in DBLab Engine 4.1

- **`/metrics` endpoint**: Prometheus metrics for monitoring (no authentication required). See [Prometheus monitoring](/docs/database-lab/prometheus-monitoring).
- **Protection leases**: The `CreateClone` and `UpdateClone` requests now accept a `protectionDurationMinutes` field for time-limited clone protection. The `Clone` response includes `protectedTill` showing when protection expires. See [Clone protection](/docs/dblab-howtos/cloning/clone-protection).
- **`clone_delete` webhook**: A new webhook trigger type for clone deletion events. See [Webhook configuration](/docs/reference-guides/database-lab-engine-configuration-reference#section-webhooks-webhook-configuration).
