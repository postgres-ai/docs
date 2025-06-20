---
title: Telemetry
sidebar_label: Telemetry
description: Telemetry collected by DBLab Engine and how to control it
keywords:
  - "telemetry"
  - "statistics"
---

By default, the DBLab Engine (DLE) collects non-personally identifiable telemetry data (applicable to the DLE versions 3.0.0 and later). This information helps the development team understand how the product is used and what to focus on next.

Fundamental principles of our telemetry implementation:
- For DLE Community Edition (DLE CE, open-source version), the data collected is minimal and non-personally identifiable. Particularly, the DLE instance ID is randomly generated and contains no identifying information. For DLE Standard Edition and DLE Enterprise Edition (DLE SE and DLE EE, respectively – paid versions installed from cloud Marketplaces or from the Postgres.ai Console), the DLE instance ID is stored in the Postgres AI SaaS database in the context of the customer's organization and, upon request, may be used for support purposes.
- See the sections below to find out [what exactly is collected](#collected-data-points). Users are also encouraged to check [the DLE source code](https://gitlab.com/postgres-ai/database-lab/-/tree/master/internal/telemetry) to inspect how exactly the collection is implemented.
- The raw telemetry data is never sent or processed by third parties outside Postgres.ai's infrastructure (Google Cloud, USA regions). In an aggregated form, the usage statistics can be published periodically to help our growing community of users and contributors understand how DLE is used and what to develop next.
- For DLE CE, telemetry is optional and can be [disabled](#disabling-telemetry). However, as a growing community, we greatly appreciate the usage data users send to us, as it is very valuable in helping us make the DBLab Engine a better product for everyone!
- For DLE SE, telemetry cannot be disabled because it is used for linking to the customer's organization in Postgres AI Console, for billing and support purposes.

## Collected data points
Whenever a significant event happens, DBLab Engine collects some information and sends it to the Postgres.ai infrastructure making an HTTPS request. Each request contains four parts:
- randomly generated "instance ID" (for example, `instance_id: c6fgs68hmvj3sm2pbphg`)
- event timestamp (`event_time`)
- event type (for example, `event_type: engine_starged`)
- data relevant for particular event type (`event_data`)

Below you can find what data is collected and sent for each type of event.

### Engine started 
```json
{
  "engine_version": "v3.0.0-20211220-1923",
  "db_engine": "postgres",
  "db_version": "11",
  "pools": {
    "fs_type": "zfs",
    "number": 1,
    "total_size": 369044992,
    "total_used": 49280000
  },
  "restore": {
    "mode": "logical",
    "refreshing": "0 */6 * * *",
    "jobs": [
      "logicalDump",
      "logicalRestore",
      "logicalSnapshot"
    ]
  },
  "system": {
    "cpu": 16,
    "totalMemory": 14503538688
  }
}
```

### Engine stopped
```json
{
  "uptime": 46063
}
```

### Snapshot created
`event_data` is empty for this event type.

### Clone created
```json
{
  "id": "2b887d9ff18be11c707f121218fc83dbdabae700",
  "cloning_time": 0
}
```

### Clone reset
```json
{
  "id": "2b887d9ff18be11c707f121218fc83dbdabae700",
  "cloning_time": 0.848746942
}

```

### Clone destroyed
```json
{
  "id": "2b887d9ff18be11c707f121218fc83dbdabae700"
}
```

### Alert
```json
{
  "level": "refresh_skipped",
  "message": "Pool to perform full refresh not found. Skip refreshing"
}
```

## Disabling telemetry
We will be very grateful if you allow us to collect statistics and help us keep improving our product.

We would greatly appreciate it if you would consider keeping telemetry enabled. The DBLab Engine is an open-source product, and the anonymous telemetry data has a lot of value for the product development. Enabled telemetry is your contribution to the DLE development!

Nevertheless, if telemetry must be disabled in your case, change the flag `global.telemetry.enabled` to `false` in the DLE configuration file:
```yml
global:
  telemetry:
    enabled: false
  ...
```

If the change is done when DLE is running, follow the [DLE reconfiguration guide](/docs/how-to-guides/administration/engine-manage#reconfigure-database-lab-engine) to apply the change without restart.

## Enabling telemetry
If telemetry was disabled earlier, you can enable it again changing the flag `global.telemetry.enabled` to `true`.
```yml
global:
  telemetry:
    enabled: true
  ...
```

If the change is done when DLE is running, follow the [DLE reconfiguration guide](/docs/how-to-guides/administration/engine-manage#reconfigure-database-lab-engine) to apply the change without restart.
