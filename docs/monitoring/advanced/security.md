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

## VictoriaMetrics admin endpoints

New in 0.17. Grafana's datasource proxy forwards GET requests, so before 0.17 any Grafana Viewer
could reach VictoriaMetrics' administrative endpoints — including series deletion — with the
datasource's own credentials. Four groups of them (series deletion, snapshots, forced merge, and
pprof) now each require a separate key, generated per install and stored in `.env`:

```bash
VM_DELETE_AUTH_KEY=<hex secret>        # /api/v1/admin/tsdb/delete_series, /tags/delSeries
VM_SNAPSHOT_AUTH_KEY=<hex secret>      # /snapshot/*
VM_FORCE_MERGE_AUTH_KEY=<hex secret>   # /internal/force_merge
VM_PPROF_AUTH_KEY=<hex secret>         # /debug/pprof/*
```

- The CLI generates them on `mon local-install`, `mon update`, and `mon update-config`. Only
  `mon update` and `mon update-config` apply them to a running `sink-prometheus`; on a running
  stack, `local-install` writes them to `.env` and leaves the container as it is. Nothing that
  reads metrics receives them.
- All VictoriaMetrics secrets, including the basic-auth password, are passed as `file://` paths, so
  they do not show up in the process table or in `/debug/pprof/cmdline`. They remain container
  environment variables, so anyone with access to the Docker socket can read them.
- A key replaces basic auth on its endpoints: treat each one as a separate secret.
- Other endpoints still accept basic auth alone (for example `/internal/resetRollupResultCache` and
  `/-/reload`), so Grafana access is still access to the metrics store.

**Scope:** the Docker Compose stack and the Terraform AWS deployment. The Helm chart does not set
these keys, and its VictoriaMetrics basic auth is off by default. On Kubernetes, add the keys
through `victoriaMetrics.extraArgs`, restrict who can reach VictoriaMetrics with a NetworkPolicy,
and limit who can use Grafana — see
[VictoriaMetrics admin endpoints](/docs/monitoring/getting-started/installation-helm#victoriametrics-admin-endpoints).

Usage and rotation:
[Admin-endpoint keys](/docs/monitoring/configuration/prometheus-config#admin-endpoint-keys). Upgrade
notes: [What changes in 0.17](/docs/monitoring/getting-started/upgrade#what-changes-in-017).

## Credentials on the monitoring host

- The CLI creates `.env` (stack secrets) and `instances.yml` (monitored-database connection
  strings, including passwords) owner-only (`0600`). Since 0.17, `mon targets add` /
  `mon targets remove` also tighten an existing, looser `instances.yml` on every write. If you
  manage these files by hand, keep them `0600`.
- `.pgwatch-config` holds the PostgresAI API key given to `mon local-install --api-key`, and the
  CLI writes it owner-only (`0600`). It must be a per-organization token: the stack cannot use a
  global one beyond registration. `mon local-install` also saves the key in the CLI configuration
  file (`~/.config/postgresai/config.json`, also `0600`), so replace it in both places when you
  rotate it.
- The optional [`instance-jobs`](/docs/monitoring/advanced/architecture#instance-jobs--outbound-collection-channel-optional)
  container makes only outbound connections, runs with a read-only root filesystem, no Linux
  capabilities, and `no-new-privileges`, and mounts only `.pgwatch-config`, read-only. Enabling it
  lets any API token of the instance's organization run PromQL against this stack's VictoriaMetrics
  with [`postgresai promql`](/docs/reference-guides/postgresai-cli-reference#command-promql), with
  no role check. Results can include database, table, and index names and `pg_stat_statements`
  query texts (up to 500 characters), and the platform stores each result.

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
