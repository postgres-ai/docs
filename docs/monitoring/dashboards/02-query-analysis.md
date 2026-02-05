---
title: "02. Query performance analysis (top-N)"
sidebar_label: "02. Query analysis (top-N)"
sidebar_position: 3
keywords:
  - "PostgreSQL query analysis"
  - "pg_stat_statements"
  - "slow query analysis"
  - "query performance"
  - "top queries"
---

# 02. Query performance analysis (top-N)

Comprehensive query performance dashboard showing top queries by various metrics.

![02. Query analysis dashboard](/img/monitoring/dashboards/02-query-analysis.png)

## Purpose

Identify the most resource-intensive queries across multiple dimensions:
- Call frequency
- Execution time
- Planning time
- Rows processed
- Shared buffer usage

## When to use

- Regular query performance reviews
- Investigating slow application responses
- Finding optimization candidates
- Before/after index changes

## Key panels

### Top 10 statements by calls per second

**What it shows:**
- Most frequently executed queries
- Rate of calls over time

**Interpretation:**
- High-frequency queries are prime optimization targets
- Even small improvements have large cumulative impact
- Sudden spikes may indicate application issues

### Top 10 statements by execution time per second

**What it shows:**
- Queries consuming the most total execution time
- Combines frequency × duration

**This is often the most important panel** — queries here have the highest overall impact on database load.

![Execution time per second panel](/img/monitoring/dashboards/02-query-analysis-exec-time-panel.png)

**Interpretation:**
- A query appearing here but not in "calls/sec" = slow but infrequent
- A query appearing here and in "calls/sec" = high priority for optimization

### Top 10 statements by execution time per call

**What it shows:**
- Average duration per query execution
- Identifies slow individual queries

**Healthy range:**
- OLTP queries: < 100ms
- Reporting queries: < 5s (depends on complexity)

**Warning signs:**
- Queries over 1s in OLTP workloads
- Increasing trend over time (regression)

### Top 10 statements by planning time

**What it shows:**
- Time spent in query planning
- High values indicate complex query structures

**When planning time matters:**
- Very short-lived queries (OLTP)
- Queries with many JOINs
- Dynamic SQL with different parameters

### Top 10 statements by rows

**What it shows:**
- Queries processing the most rows
- Rows returned vs rows scanned

**Warning signs:**
- Large gap between rows scanned and returned = missing indexes
- Very high row counts = potential full table scans

### Top 10 statements by shared buffers

**What it shows:**
- Buffer cache hits and reads
- Memory pressure indicators

**Healthy state:**
- High hit ratio (> 99%)
- Reads should be minimal for hot data

## Variables

| Variable | Purpose | Options |
|----------|---------|---------|
| `cluster_name` | Cluster filter | Your clusters |
| `node_name` | Node filter | Specific nodes |
| `db_name` | Database filter | Filter by database |
| `top_n` | Number of queries | 5, 10, 20, 50 |
| `legend_label` | Query display format | See below |

### Legend label options

| Value | Shows | Example |
|-------|-------|---------|
| `queryid` | Numeric ID | `-4021163671685...` |
| `displayname` | Smart truncation | `update pgbench_ac...` |
| `displayname_long` | Full context | `update pgbench_accounts set abalance = abalance + $1 where aid = $2` |

:::tip
Use `displayname_long` during debugging to see complete query context.
:::

## Detailed table view

Expand the **Detailed table view** section for a tabular breakdown including:
- queryid
- Query text
- Calls
- Total time
- Mean time
- Rows
- Hit ratio

![Detailed table view](/img/monitoring/dashboards/02-query-analysis-table-view.png)

Click any row to drill down to [03. Single query](/docs/monitoring/dashboards/single-query).

## Query text integration

The dashboard shows actual query text (not just queryid) by:
1. Joining metrics with `pg_stat_statements` via the Flask backend
2. Smart truncation for readability
3. Full text available in tooltips and detail view

## Related dashboards

- **Single query deep-dive** — [03. Single query](/docs/monitoring/dashboards/single-query)
- **Wait events for specific query** — [04. Wait events](/docs/monitoring/dashboards/wait-events)
- **Table statistics** — [08. Table stats](/docs/monitoring/dashboards/table-stats)

## Troubleshooting

### Query texts show as "unknown" or queryid only

1. Check Flask backend is running:
   ```bash
   curl http://localhost:8000/health
   ```

2. Verify pg_stat_statements has data:
   ```sql
   select count(*) from pg_stat_statements;
   ```

3. Check backend logs:
   ```bash
   docker compose logs monitoring_flask_backend
   ```

### Metrics don't match pg_stat_statements directly

Dashboard shows **rates** (per second), not cumulative totals. For raw totals:
```sql
select query, calls, total_exec_time
from pg_stat_statements
order by total_exec_time desc
limit 10;
```

### New queries not appearing

`pg_stat_statements` may need time to accumulate data for new queries. Check:
```sql
select pg_stat_statements_reset();  -- caution: resets all stats
```

Or wait for the next scrape interval (default: 60s).
