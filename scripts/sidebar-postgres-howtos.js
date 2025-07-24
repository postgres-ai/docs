    "PostgreSQL how-tos": [
      "postgres-howtos/index",
      {
        type: "category",
        label: "Performance & Optimization",
        link: {
          type: "doc",
          id: "postgres-howtos/performance-optimization/index",
        },
        items: [
          {
            type: "category",
            label: "Query Tuning",
            items: [
            "postgres-howtos/performance-optimization/query-tuning/0001-explain-analyze-buffers",
            "postgres-howtos/performance-optimization/query-tuning/0010-flamegraphs-for-postgres",
            "postgres-howtos/performance-optimization/query-tuning/0012-from-pgss-to-explain--how-to-find-query-examples",
            "postgres-howtos/performance-optimization/query-tuning/0014-how-to-decide-if-query-too-slow",
            "postgres-howtos/performance-optimization/query-tuning/0056-how-to-imitate-production-planner",
            "postgres-howtos/performance-optimization/query-tuning/0063-how-to-help-others",
            "postgres-howtos/performance-optimization/query-tuning/0089-rough-oltp-configuration-tuning",
            "postgres-howtos/performance-optimization/query-tuning/0092-how-to-tune-work-mem",
            ],
          },
          {
            type: "category",
            label: "Indexing",
            items: [
            "postgres-howtos/performance-optimization/indexing/0005-pg-stat-statements-part-1",
            "postgres-howtos/performance-optimization/indexing/0013-how-to-benchmark",
            "postgres-howtos/performance-optimization/indexing/0015-how-to-monitor-index-operations",
            "postgres-howtos/performance-optimization/indexing/0016-how-to-get-into-trouble-using-some-postgres-features",
            "postgres-howtos/performance-optimization/indexing/0018-over-indexing",
            "postgres-howtos/performance-optimization/indexing/0022-how-to-analyze-heavyweight-locks-part-1",
            "postgres-howtos/performance-optimization/indexing/0024-how-to-work-with-metadata",
            "postgres-howtos/performance-optimization/indexing/0027-how-to-compile-postgres-on-ubuntu-22.04",
            "postgres-howtos/performance-optimization/indexing/0050-pre-and-post-steps-for-benchmark-iterations",
            "postgres-howtos/performance-optimization/indexing/0053-index-maintenance",
            "postgres-howtos/performance-optimization/indexing/0075-how-to-find-unused-indexes",
            "postgres-howtos/performance-optimization/indexing/0076-how-to-find-redundent-indexes",
            "postgres-howtos/performance-optimization/indexing/0079-rebuild-indexes-without-deadlocks",
            ],
          },
          {
            type: "category",
            label: "Statistics",
            items: [
            "postgres-howtos/performance-optimization/statistics/0011-ad-hoc-monitoring",
            "postgres-howtos/performance-optimization/statistics/0044-how-to-monitor-transaction-id-wraparound-risks",
            "postgres-howtos/performance-optimization/statistics/0045-how-to-monitor-xmin-horizon",
            "postgres-howtos/performance-optimization/statistics/0093-how-to-troubleshoot-streaming-replication-lag",
            "postgres-howtos/performance-optimization/statistics/0094-how-to-run-analyze",
            ],
          },
        ],
      },
      {
        type: "category",
        label: "Database Administration",
        link: {
          type: "doc",
          id: "postgres-howtos/database-administration/index",
        },
        items: [
          {
            type: "category",
            label: "Maintenance",
            items: [
            "postgres-howtos/database-administration/maintenance/0030-how-to-deal-with-long-running-transactions-oltp",
            "postgres-howtos/database-administration/maintenance/0035-how-to-use-subtransactions-in-postgres",
            "postgres-howtos/database-administration/maintenance/0046-how-to-deal-with-bloat",
            "postgres-howtos/database-administration/maintenance/0067-autovacuum-queue-and-progress",
            ],
          },
          {
            type: "category",
            label: "Backup & Recovery",
            items: [
            "postgres-howtos/database-administration/backup-recovery/0008-how-to-speed-up-pg-dump",
            "postgres-howtos/database-administration/backup-recovery/0020-how-to-use-pg-restore",
            "postgres-howtos/database-administration/backup-recovery/0032-how-to-speed-up-bulk-load",
            "postgres-howtos/database-administration/backup-recovery/0037-how-to-enable-data-checksums-without-downtime",
            ],
          },
          {
            type: "category",
            label: "Configuration",
            items: [
            "postgres-howtos/database-administration/configuration/0002-how-to-troubleshoot-and-speedup-postgres-restarts",
            "postgres-howtos/database-administration/configuration/0003-how-to-troubleshoot-long-startup",
            "postgres-howtos/database-administration/configuration/0034-how-to-perform-postgres-tuning",
            "postgres-howtos/database-administration/configuration/0088-how-to-tune-linux-parameters-for-oltp-postgres",
            ],
          },
        ],
      },
      {
        type: "category",
        label: "Monitoring & Troubleshooting",
        link: {
          type: "doc",
          id: "postgres-howtos/monitoring-troubleshooting/index",
        },
        items: [
          {
            type: "category",
            label: "System Monitoring",
            items: [
            "postgres-howtos/monitoring-troubleshooting/system-monitoring/0017-how-to-determine-the-replication-lag",
            "postgres-howtos/monitoring-troubleshooting/system-monitoring/0031-how-to-troubleshoot-a-growing-pg-wal-directory",
            "postgres-howtos/monitoring-troubleshooting/system-monitoring/0052-how-to-reduce-wal-generation-rates",
            ],
          },
          {
            type: "category",
            label: "Lock Analysis",
            items: [
            "postgres-howtos/monitoring-troubleshooting/lock-analysis/0071-how-to-understand-what-is-blocking-ddl",
            ],
          },
          {
            type: "category",
            label: "Troubleshooting",
            items: [
            "postgres-howtos/monitoring-troubleshooting/troubleshooting/0038-how-to-not-get-screwed-as-a-dba",
            "postgres-howtos/monitoring-troubleshooting/troubleshooting/0074-how-to-flush-caches",
            ],
          },
        ],
      },
      {
        type: "category",
        label: "Schema Design & DDL",
        link: {
          type: "doc",
          id: "postgres-howtos/schema-design/index",
        },
        items: [
          {
            type: "category",
            label: "DDL Operations",
            items: [
            "postgres-howtos/schema-design/ddl-operations/0033-how-to-redefine-a-PK-without-downtime",
            "postgres-howtos/schema-design/ddl-operations/0055-how-to-drop-a-column",
            "postgres-howtos/schema-design/ddl-operations/0060-how-to-add-a-column",
            "postgres-howtos/schema-design/ddl-operations/0069-howd-tod-addd-ad-checkd-constraintd-withoutd-downtime",
            ],
          },
          {
            type: "category",
            label: "Data Types",
            items: [
            "postgres-howtos/schema-design/data-types/0064-how-to-use-uuid",
            "postgres-howtos/schema-design/data-types/0065-uuid-v7-and-partitioning-timescaledb",
            "postgres-howtos/schema-design/data-types/0083-how-to-quickly-check-data-type-and-storage-size-of-a-value",
            "postgres-howtos/schema-design/data-types/0085-how-to-quickly-check-data-type-and-storage-size-of-a-value",
            ],
          },
          {
            type: "category",
            label: "Constraints",
            items: [
            "postgres-howtos/schema-design/constraints/0070-how-to-add-a-foreign-key",
            "postgres-howtos/schema-design/constraints/0072-how-to-remove-a-foreign-key",
            "postgres-howtos/schema-design/constraints/0080-how-to-find-int4-pks-with-out-of-range-risks",
            ],
          },
        ],
      },
      {
        type: "category",
        label: "Development Tools",
        link: {
          type: "doc",
          id: "postgres-howtos/development-tools/index",
        },
        items: [
          {
            type: "category",
            label: "psql",
            items: [
            "postgres-howtos/development-tools/psql/0049-how-to-use-variables-in-psql-scripts",
            "postgres-howtos/development-tools/psql/0051-learn-about-schema-metadata-via-psql",
            "postgres-howtos/development-tools/psql/0059-psql-tuning",
            "postgres-howtos/development-tools/psql/0068-psql-shortcuts",
            "postgres-howtos/development-tools/psql/0081-how-to-plot-graphs-right-in-psql-on-macos-iterm2",
            "postgres-howtos/development-tools/psql/0086-how-to-make-e-work-in-psql",
            "postgres-howtos/development-tools/psql/0091-how-to-format-text-output-in-psql-scripts",
            ],
          },
          {
            type: "category",
            label: "SQL Techniques",
            items: [
            "postgres-howtos/development-tools/sql-techniques/0019-how-to-import-csv-to-postgres",
            "postgres-howtos/development-tools/sql-techniques/0036-find-or-insert-using-a-single-query",
            "postgres-howtos/development-tools/sql-techniques/0043-how-to-format-sql",
            "postgres-howtos/development-tools/sql-techniques/0048-how-to-generate-fake-data",
            "postgres-howtos/development-tools/sql-techniques/0090-how-to-use-lib-pgquery-in-shell",
            ],
          },
          {
            type: "category",
            label: "Client Tools",
            items: [
            "postgres-howtos/development-tools/client-tools/0021-how-to-set-application-name-without-extra-queries",
            "postgres-howtos/development-tools/client-tools/0058-how-to-use-docker-to-run-postgres",
            "postgres-howtos/development-tools/client-tools/0087-how-to-change-ownership-of-all-objects-in-a-database",
            ],
          },
        ],
      },
      {
        type: "category",
        label: "Advanced Topics",
        link: {
          type: "doc",
          id: "postgres-howtos/advanced-topics/index",
        },
        items: [
          {
            type: "category",
            label: "Internals",
            items: [
            "postgres-howtos/advanced-topics/internals/0004-tuple-sparsenes",
            "postgres-howtos/advanced-topics/internals/0009-lsn-values-and-wal-filenames",
            "postgres-howtos/advanced-topics/internals/0066-how-many-tuples-can-be-inserted-in-a-page",
            "postgres-howtos/advanced-topics/internals/0078-estimate-yoy-table-growth",
            "postgres-howtos/advanced-topics/internals/0084-how-to-find-the-best-order-of-columns-to-save-on-storage",
            ],
          },
          {
            type: "category",
            label: "Extensions",
            items: [
            "postgres-howtos/advanced-topics/extensions/0023-how-to-use-openai-apis-in-postgres",
            "postgres-howtos/advanced-topics/extensions/0047-how-to-install-postgres-16-with-plpython3u",
            ],
          },
          {
            type: "category",
            label: "Replication",
            items: [
            "postgres-howtos/advanced-topics/replication/0057-how-to-convert-a-physical-replica-to-logical",
            "postgres-howtos/advanced-topics/replication/0077-zero-downtime-major-upgrade",
            ],
          },
        ],
      },
    ],