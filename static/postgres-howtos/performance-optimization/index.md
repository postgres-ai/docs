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

- [How to tune work_mem](/docs/postgres-howtos/performance-optimization/query-tuning/how-to-tune-work-mem) - 5 min
- [Rough configuration tuning (80/20 rule; OLTP)](/docs/postgres-howtos/performance-optimization/query-tuning/rough-oltp-configuration-tuning) - 5 min *(beginner)*
- [How to help others](/docs/postgres-howtos/performance-optimization/query-tuning/how-to-help-others) - 5 min *(beginner)*
- [How to make the non-production Postgres planner behave like in production](/docs/postgres-howtos/performance-optimization/query-tuning/how-to-imitate-production-planner) - 5 min
- [How to decide when a query is too slow and needs optimization](/docs/postgres-howtos/performance-optimization/query-tuning/how-to-decide-if-query-too-slow) - 5 min
- [How to find query examples for problematic pg_stat_statements records](/docs/postgres-howtos/performance-optimization/query-tuning/from-pgss-to-explain--how-to-find-query-examples) - 6 min *(beginner)*
- [How to troubleshoot Postgres performance using FlameGraphs and eBPF (or perf)](/docs/postgres-howtos/performance-optimization/query-tuning/flamegraphs-for-postgres) - 6 min *(beginner)*
- [EXPLAIN ANALYZE or EXPLAIN (ANALYZE, BUFFERS)?](/docs/postgres-howtos/performance-optimization/query-tuning/explain-analyze-buffers) - 5 min

### Indexing

Discover best practices for creating and maintaining efficient indexes, including B-tree, GiST, and other index types.

- [How to rebuild many indexes using many backends avoiding deadlocks](/docs/postgres-howtos/performance-optimization/indexing/rebuild-indexes-without-deadlocks) - 5 min
- [How to find redundant indexes](/docs/postgres-howtos/performance-optimization/indexing/how-to-find-redundent-indexes) - 6 min *(beginner)*
- [How to find unused indexes](/docs/postgres-howtos/performance-optimization/indexing/how-to-find-unused-indexes) - 7 min *(beginner)*
- [Index maintenance](/docs/postgres-howtos/performance-optimization/indexing/index-maintenance) - 5 min *(beginner)*
- [Pre- and post-steps for benchmark iterations](/docs/postgres-howtos/performance-optimization/indexing/pre-and-post-steps-for-benchmark-iterations) - 5 min
- [How to compile Postgres on Ubuntu 22.04](/docs/postgres-howtos/performance-optimization/indexing/how-to-compile-postgres-on-ubuntu-22.04) - 5 min *(beginner)*
- [How to work with metadata](/docs/postgres-howtos/performance-optimization/indexing/how-to-work-with-metadata) - 5 min *(beginner)*
- [How to analyze heavyweight locks, part 1](/docs/postgres-howtos/performance-optimization/indexing/how-to-analyze-heavyweight-locks-part-1) - 5 min *(beginner)*
- [Over-indexing](/docs/postgres-howtos/performance-optimization/indexing/over-indexing) - 5 min *(beginner)*
- [How to monitor CREATE INDEX / REINDEX progress in Postgres 12+](/docs/postgres-howtos/performance-optimization/indexing/how-to-monitor-index-operations) - 5 min *(advanced)*
- [How to benchmark](/docs/postgres-howtos/performance-optimization/indexing/how-to-benchmark) - 7 min *(beginner)*
- [How to work with pg_stat_statements, part 1](/docs/postgres-howtos/performance-optimization/indexing/pg-stat-statements-part-1) - 8 min *(beginner)*

### Monitoring & Statistics

Understand how to monitor system performance and use database statistics for optimal query planning.

- [How to run ANALYZE (to collect statistics)](/docs/postgres-howtos/performance-optimization/statistics/how-to-run-analyze) - 5 min
- [How to troubleshoot streaming replication lag](/docs/postgres-howtos/performance-optimization/statistics/how-to-troubleshoot-streaming-replication-lag) - 5 min
- [How to monitor xmin horizon to prevent XID/MultiXID wraparound and high bloat](/docs/postgres-howtos/performance-optimization/statistics/how-to-monitor-xmin-horizon) - 6 min
- [How to monitor transaction ID wraparound risks](/docs/postgres-howtos/performance-optimization/statistics/how-to-monitor-transaction-id-wraparound-risks) - 5 min *(advanced)*
- [Ad-hoc monitoring](/docs/postgres-howtos/performance-optimization/statistics/ad-hoc-monitoring) - 7 min *(beginner)*

