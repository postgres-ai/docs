---
title: Performance & optimization
sidebar_label: Performance & optimization
description: Master PostgreSQL performance optimization with practical guides covering query tuning, indexing strategies, and system optimization.
---

# Performance & optimization

Master PostgreSQL performance optimization with practical guides covering query tuning, indexing strategies, and system optimization.

## Guides by Category

### Query Tuning

Learn how to analyze and optimize slow queries using EXPLAIN, pg_stat_statements, and other powerful tools.

- [EXPLAIN ANALYZE or EXPLAIN (ANALYZE, BUFFERS)?](/docs/postgres-howtos/performance-optimization/query-tuning/explain-analyze-buffers) - 5 min *(intermediate)*
- [How to find query examples for problematic pg_stat_statements records](/docs/postgres-howtos/performance-optimization/query-tuning/from-pgss-to-explain--how-to-find-query-examples) - 6 min *(beginner)*
- [How to decide when a query is too slow and needs optimization](/docs/postgres-howtos/performance-optimization/query-tuning/how-to-decide-if-query-too-slow) - 5 min *(intermediate)*
- [How to make the non-production Postgres planner behave like in production](/docs/postgres-howtos/performance-optimization/query-tuning/how-to-imitate-production-planner) - 5 min *(intermediate)*

### Indexing

Discover best practices for creating and maintaining efficient indexes, including B-tree, GiST, and other index types.

- [How to monitor CREATE INDEX / REINDEX progress in Postgres 12+](/docs/postgres-howtos/performance-optimization/indexing/how-to-monitor-index-operations) - 5 min *(advanced)*
- [Over-indexing](/docs/postgres-howtos/performance-optimization/indexing/over-indexing) - 5 min *(beginner)*
- [Index maintenance](/docs/postgres-howtos/performance-optimization/indexing/index-maintenance) - 5 min *(beginner)*
- [How to find unused indexes](/docs/postgres-howtos/performance-optimization/indexing/how-to-find-unused-indexes) - 7 min *(beginner)*
- [How to find redundant indexes](/docs/postgres-howtos/performance-optimization/indexing/how-to-find-redundent-indexes) - 6 min *(beginner)*
- [How to rebuild many indexes using many backends avoiding deadlocks](/docs/postgres-howtos/performance-optimization/indexing/rebuild-indexes-without-deadlocks) - 5 min *(intermediate)*

### Monitoring

Understand how to monitor system performance and use database statistics for optimal query planning.

- [How to work with pg_stat_statements, part 1](/docs/postgres-howtos/performance-optimization/monitoring/pg-stat-statements-part-1) - 8 min *(beginner)*
- [Ad-hoc monitoring](/docs/postgres-howtos/performance-optimization/monitoring/ad-hoc-monitoring) - 7 min *(beginner)*
- [How to monitor transaction ID wraparound risks](/docs/postgres-howtos/performance-optimization/monitoring/how-to-monitor-transaction-id-wraparound-risks) - 5 min *(advanced)*
- [How to monitor xmin horizon to prevent XID/MultiXID wraparound and high bloat](/docs/postgres-howtos/performance-optimization/monitoring/how-to-monitor-xmin-horizon) - 6 min *(intermediate)*
- [How to analyze heavyweight locks, part 1](/docs/postgres-howtos/performance-optimization/monitoring/how-to-analyze-heavyweight-locks-part-1) - 5 min *(beginner)*
- [How to reduce WAL generation rates](/docs/postgres-howtos/performance-optimization/monitoring/how-to-reduce-wal-generation-rates) - 5 min *(intermediate)*

### Benchmarks

Learn how to properly benchmark PostgreSQL performance.

- [How to benchmark](/docs/postgres-howtos/performance-optimization/benchmarks/how-to-benchmark) - 7 min *(beginner)*
- [Pre- and post-steps for benchmark iterations](/docs/postgres-howtos/performance-optimization/benchmarks/pre-and-post-steps-for-benchmark-iterations) - 5 min *(intermediate)*

