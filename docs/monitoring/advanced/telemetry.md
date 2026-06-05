---
title: Monitoring telemetry
sidebar_label: Telemetry
sidebar_position: 4
keywords:
  - "PostgresAI monitoring telemetry"
  - "telemetry reporter"
  - "monitoring instance telemetry"
---

# Monitoring telemetry

New in 0.15. Self-hosted monitoring instances include an optional **telemetry reporter** that
periodically sends a small operational health snapshot of the monitoring host to the PostgresAI
Console. This helps surface monitoring-stack health (for example, an out-of-memory event or a
container in a crash loop) without requiring access to the host.

This is separate from the metrics collected about your PostgreSQL databases, which always stay
in your own VictoriaMetrics instance.

## What it sends

Each report contains a small, fixed set of host-level operational signals:

| Field | Description |
|-------|-------------|
| OOM count (last 24h) | Number of kernel out-of-memory events observed |
| Faulty containers | Names of monitoring-stack containers that are unhealthy or restarting |
| Free RAM | Free memory on the monitoring host, in bytes |
| Free disk | Free disk space on the monitored path (default `/`), in bytes |
| Collected-at timestamp | When the snapshot was taken |

The reporter identifies the monitoring instance by its UUID. It does **not** send PostgreSQL
data, query text, or table contents.

## Enabling and disabling

The reporter is driven entirely by environment variables. It only runs when the required
variables are present, so it is effectively **off by default** unless your installation
configures it (for example, an installation registered with an API key).

**Required** (the reporter does nothing unless all three are set):

| Variable | Description |
|----------|-------------|
| `PGAI_PLATFORM_API_URL` | Console API base URL (e.g. `https://postgres.ai/api/v1`) |
| `PGAI_API_TOKEN` | API token for the monitoring instance |
| `PGAI_MONITORING_INSTANCE_ID` | UUID of this monitoring instance |

To **disable** telemetry, unset these variables (or remove them from `.env`) and restart the
stack. With the required variables absent, the reporter does not start.

**Optional tuning:**

| Variable | Default | Description |
|----------|---------|-------------|
| `PGAI_TELEMETRY_INTERVAL_SEC` | `3600` | Report interval in seconds (minimum 60) |
| `PGAI_TELEMETRY_DISK_PATH` | `/` | Path checked for free disk space |
| `PGAI_TELEMETRY_MEMINFO_PATH` | `/proc/meminfo` | Source for free-RAM readings |
| `PGAI_TELEMETRY_OOM_LOOKBACK` | `24 hours ago` | How far back to scan for OOM events |

## Privacy

- Reports are scoped to the monitoring host and the monitoring instance, not to any monitored
  database.
- No database contents, credentials, or query parameter values are transmitted.
- Data is sent only to the configured `PGAI_PLATFORM_API_URL` using the instance API token.

## Related

- [DBLab Engine telemetry](/docs/database-lab/telemetry) — telemetry for the Database Lab Engine
- [Architecture](/docs/monitoring/advanced/architecture) — monitoring stack components
