---
title: Writing Binary Units Standards
description: PostgresAI rule - Writing Binary Units Standards
---

---
alwaysApply: true
description: "Binary units usage standards for PostgreSQL reports and documentation"
---

# Binary units usage standards

## General rule: Use binary units everywhere

Always use binary units (base-2) instead of decimal units (base-1000) for memory, storage, and data sizes:

- **Use**: KiB, MiB, GiB, TiB, PiB (1024-based)
- **Don't use**: KB, MB, GB, TB, PB (1000-based)

### Examples:
✅ Correct:
- "32 GiB of shared buffers"
- "1.5 TiB of temporary files"
- "256 MiB work memory"
- "64 KiB page size"

❌ Incorrect:
- "32 GB of shared buffers"
- "1.5 TB of temporary files" 
- "256 MB work memory"

## Exception: PostgreSQL configuration values

When referencing actual PostgreSQL configuration parameters, use the exact format that PostgreSQL uses:

✅ Correct PostgreSQL config references:
- `shared_buffers = '32GB'`
- `work_mem = '64MB'`
- `max_wal_size = '16GB'`
- `maintenance_work_mem = '2GB'`

This exception applies to:
- Configuration parameter examples in reports
- Actual postgresql.conf snippets
- SQL ALTER SYSTEM commands
- Parameter value displays from pg_settings

## Context for usage

This rule ensures:
1. **Accuracy**: Binary units reflect actual memory/storage calculations
2. **Consistency**: All documentation uses the same unit system
3. **Clarity**: Readers understand exact byte calculations
4. **PostgreSQL compatibility**: Config examples work as-is in PostgreSQL

## Implementation in reports

- **Report text**: Always use binary units (GiB, MiB, etc.)
- **Config examples**: Use PostgreSQL's expected format (GB, MB, etc.)
- **Data analysis**: Convert and present in binary units
- **Recommendations**: Use binary units for sizing guidance