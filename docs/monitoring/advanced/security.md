---
title: Monitoring security
sidebar_label: Security
sidebar_position: 3
keywords:
  - "PostgresAI monitoring security"
  - "VictoriaMetrics basic auth"
  - "credential rotation"
  - "monitoring at rest encryption"
---

# Monitoring security

Security model and hardening options for the self-hosted monitoring stack. Several of these
were added or made required in 0.15.

## Monitoring database access

The monitoring role created by `prepare-db` has **read-only access to metadata only** — system
statistics, normalized query text, and object sizes. It never reads table data or query
parameter values. To review the exact SQL before running it:

```bash
npx postgresai@latest prepare-db --print-sql
```

See [Permissions](/docs/monitoring/troubleshooting/permissions) and
[System requirements](/docs/monitoring/getting-started/requirements#permissions) for the full
permission breakdown, and
[Rotate monitoring database credentials](/docs/monitoring/troubleshooting/permissions#rotate-monitoring-database-credentials)
for rotating the monitored-database role's password.

## VictoriaMetrics basic auth

New in 0.15, the VictoriaMetrics endpoint is protected with HTTP basic auth. Two `.env` keys
are required:

```bash
VM_AUTH_USERNAME=vmauth
VM_AUTH_PASSWORD=<non-empty secret>
```

These credentials guard the metrics endpoint and are also used by Grafana's provisioned
datasource — if they are missing, Grafana cannot query VictoriaMetrics. The CLI generates and
preserves them automatically; manual Docker Compose users must set them before
`docker compose up -d`.

Full details, including what they protect and why they are required, are in
[Authentication and security](/docs/monitoring/configuration/prometheus-config#authentication-and-security).

### Rotating VictoriaMetrics credentials

```bash
# From the monitoring directory
VM_AUTH_PASSWORD="$(openssl rand -base64 18)" ./scripts/rotate-vm-auth.sh
```

This regenerates the VictoriaMetrics basic-auth credentials and re-applies the Grafana
datasource so the new password takes effect. See
[Rotating VictoriaMetrics credentials](/docs/monitoring/configuration/prometheus-config#rotating-victoriametrics-credentials).

## Grafana

- Change the default Grafana admin password immediately after first login (default user
  `monitor`; the default password is intended for demo use only).
- Put Grafana behind a TLS-terminating reverse proxy for any internet-facing deployment — see
  [Network requirements](/docs/monitoring/getting-started/requirements#self-managed-installation).
- The bundled-version update-check banner is disabled by default in 0.15 (no phone-home on a
  pinned-version stack).

See [Grafana configuration](/docs/monitoring/configuration/grafana-config) for authentication
options (anonymous access, LDAP, OAuth/OIDC).

## Supply-chain hardening

All stack images are version-pinned (no `:latest`) for reproducible, auditable deployments.
See [Image tags](/docs/monitoring/getting-started/installation-docker#image-tags-and-supply-chain).

## Encryption at rest

For self-hosted deployments, encryption at rest is provided by the underlying storage you run
the stack on (for example, an encrypted volume / filesystem for the Docker volumes that hold
VictoriaMetrics and Grafana data). PostgresAI's own hosted infrastructure uses
KMS-backed encrypted storage validated by infrastructure checks in CI.

## Related

- [Authentication and security (VictoriaMetrics)](/docs/monitoring/configuration/prometheus-config#authentication-and-security)
- [Telemetry](/docs/monitoring/advanced/telemetry) — what the monitoring telemetry reporter sends
- [Architecture](/docs/monitoring/advanced/architecture) — component and credential overview
