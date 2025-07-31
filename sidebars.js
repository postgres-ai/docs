module.exports = {
  baseSidebar: {
    Overview: ['get-started', 'questions-and-answers', 'roadmap'],
    Tutorials: [
      'tutorials/database-lab-tutorial',
      'tutorials/database-lab-tutorial-amazon-rds',
      'tutorials/joe-setup',
    ],
    "DBLab": [
      "database-lab/index",
      "database-lab/supported-databases",
      "database-lab/user-interface",
      "database-lab/masking",
      "database-lab/db-migration-checker",
      "database-lab/telemetry",
      {
        type: "category",
        label: "Joe bot",
        items: [
          "joe-bot/index",
          "joe-bot/example",
        ]},
      {
        type: "category",
        label: "Platform (SaaS)",
        items: [
          "platform/index",
          "platform/security",
        ]},
    ],

    "DBLab how-tos": [
      "dblab-howtos/index",
      {
        "Administration": [
          "dblab-howtos/administration/index",
          "dblab-howtos/administration/install-dle-from-postgres-ai",
          "dblab-howtos/administration/install-dle-from-aws-marketplace",
          "dblab-howtos/administration/install-dle-manually",
          "dblab-howtos/administration/run-database-lab-on-mac",
          "dblab-howtos/administration/postgresql-configuration",
          "dblab-howtos/administration/engine-manage",
          "dblab-howtos/administration/joe-manage",
          "dblab-howtos/administration/engine-secure",
          "dblab-howtos/administration/logical-full-refresh",
          "dblab-howtos/administration/ci-observer-postgres-log-masking",
          "dblab-howtos/administration/add-disk-space-to-zfs-pool",
          {
            "Data sources": [
              "dblab-howtos/administration/data/index",
              "dblab-howtos/administration/data/rds",
              "dblab-howtos/administration/data/dump",
              "dblab-howtos/administration/data/wal-g",
              "dblab-howtos/administration/data/pgbackrest",
              "dblab-howtos/administration/data/pg_basebackup",
              "dblab-howtos/administration/data/custom",
            ]},
        ]},
      {
        "CLI": [
          "dblab-howtos/cli/index",
          "dblab-howtos/cli/cli-install-init",
        ]},
      {
        "Cloning": [
          "dblab-howtos/cloning/index",
          "dblab-howtos/cloning/create-clone",
          "dblab-howtos/cloning/connect-clone",
          "dblab-howtos/cloning/reset-clone",
          "dblab-howtos/cloning/destroy-clone",
          "dblab-howtos/cloning/clone-protection",
          "dblab-howtos/cloning/clone-upgrade",
        ]},
      {
        "Branching": [
          "dblab-howtos/branching/index",
          "dblab-howtos/branching/create-branch",
          "dblab-howtos/branching/delete-branch",
          "dblab-howtos/branching/preview-environments-with-dblab-and-coolify",
        ],
      },
      {
        "Snapshots": [
          "dblab-howtos/snapshots/index",
          "dblab-howtos/snapshots/create-snapshot",
          "dblab-howtos/snapshots/delete-snapshot",
        ]},
      {
        "SQL optimization chatbot (Joe bot)": [
          "dblab-howtos/joe-bot/index",
          "dblab-howtos/joe-bot/get-query-plan",
          "dblab-howtos/joe-bot/create-index",
          "dblab-howtos/joe-bot/reset-session",
          "dblab-howtos/joe-bot/query-activity-and-termination",
          "dblab-howtos/joe-bot/visualize-query-plan",
          "dblab-howtos/joe-bot/sql-optimization-history",
          "dblab-howtos/joe-bot/count-rows",
          "dblab-howtos/joe-bot/get-database-table-index-size",
        ]},
      {
        "Platform": [
          "dblab-howtos/platform/index",
          "dblab-howtos/platform/start-using-platform",
          "dblab-howtos/platform/tokens",
          "dblab-howtos/platform/onboarding",
          "dblab-howtos/platform/audit-logs",
        ]},
    ],
                "Postgres how-tos": [
      "postgres-howtos/index",
      {
        "type": "category",
        "label": "Performance & optimization",
        "link": { "type": "doc", "id": "postgres-howtos/performance-optimization/index" },
        "items": [
          {
            "type": "category",
            "label": "Query tuning",
            "link": { "type": "doc", "id": "postgres-howtos/performance-optimization/query-tuning/index" },
            "items": [
              "postgres-howtos/performance-optimization/query-tuning/explain-analyze-buffers",
              "postgres-howtos/performance-optimization/query-tuning/from-pgss-to-explain--how-to-find-query-examples",
              "postgres-howtos/performance-optimization/query-tuning/how-to-decide-if-query-too-slow",
              "postgres-howtos/performance-optimization/query-tuning/how-to-imitate-production-planner"
            ]
          },
          {
            "type": "category",
            "label": "Indexing",
            "link": { "type": "doc", "id": "postgres-howtos/performance-optimization/indexing/index" },
            "items": [
              "postgres-howtos/performance-optimization/indexing/how-to-monitor-index-operations",
              "postgres-howtos/performance-optimization/indexing/over-indexing",
              "postgres-howtos/performance-optimization/indexing/index-maintenance",
              "postgres-howtos/performance-optimization/indexing/how-to-find-unused-indexes",
              "postgres-howtos/performance-optimization/indexing/how-to-find-redundent-indexes",
              "postgres-howtos/performance-optimization/indexing/rebuild-indexes-without-deadlocks"
            ]
          },
          {
            "type": "category",
            "label": "Monitoring",
            "link": { "type": "doc", "id": "postgres-howtos/performance-optimization/monitoring/index" },
            "items": [
              "postgres-howtos/performance-optimization/monitoring/pg-stat-statements-part-1",
              "postgres-howtos/performance-optimization/monitoring/ad-hoc-monitoring",
              "postgres-howtos/performance-optimization/monitoring/how-to-monitor-transaction-id-wraparound-risks",
              "postgres-howtos/performance-optimization/monitoring/how-to-monitor-xmin-horizon",
              "postgres-howtos/performance-optimization/monitoring/how-to-analyze-heavyweight-locks-part-1",
              "postgres-howtos/performance-optimization/monitoring/how-to-reduce-wal-generation-rates"
            ]
          },
          {
            "type": "category",
            "label": "Benchmarks",
            "link": { "type": "doc", "id": "postgres-howtos/performance-optimization/benchmarks/index" },
            "items": [
              "postgres-howtos/performance-optimization/benchmarks/how-to-benchmark",
              "postgres-howtos/performance-optimization/benchmarks/pre-and-post-steps-for-benchmark-iterations"
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Administration",
        "link": { "type": "doc", "id": "postgres-howtos/database-administration/index" },
        "items": [
          {
            "type": "category",
            "label": "Backups, data export/import",
            "link": { "type": "doc", "id": "postgres-howtos/database-administration/backup-recovery/index" },
            "items": [
              "postgres-howtos/database-administration/backup-recovery/how-to-speed-up-pg-dump",
              "postgres-howtos/database-administration/backup-recovery/how-to-use-pg-restore",
              "postgres-howtos/database-administration/backup-recovery/how-to-speed-up-bulk-load"
            ]
          },
          {
            "type": "category",
            "label": "Configuration",
            "link": { "type": "doc", "id": "postgres-howtos/database-administration/configuration/index" },
            "items": [
              "postgres-howtos/database-administration/configuration/rough-oltp-configuration-tuning",
              "postgres-howtos/database-administration/configuration/how-to-tune-work-mem",
              "postgres-howtos/database-administration/configuration/how-to-perform-postgres-tuning",
              "postgres-howtos/database-administration/configuration/how-to-tune-linux-parameters-for-oltp-postgres",
              "postgres-howtos/database-administration/configuration/how-to-change-postgres-parameter"
            ]
          },
          {
            "type": "category",
            "label": "Maintenance",
            "link": { "type": "doc", "id": "postgres-howtos/database-administration/maintenance/index" },
            "items": [
              "postgres-howtos/database-administration/maintenance/how-to-deal-with-long-running-transactions-oltp",
              "postgres-howtos/database-administration/maintenance/how-to-use-subtransactions-in-postgres",
              "postgres-howtos/database-administration/maintenance/how-to-deal-with-bloat",
              "postgres-howtos/database-administration/maintenance/autovacuum-queue-and-progress",
              "postgres-howtos/database-administration/maintenance/how-to-run-analyze",
              "postgres-howtos/database-administration/maintenance/how-to-enable-data-checksums-without-downtime",
              "postgres-howtos/database-administration/maintenance/how-to-troubleshoot-and-speedup-postgres-restarts",
              "postgres-howtos/database-administration/maintenance/how-to-troubleshoot-long-startup",
              "postgres-howtos/database-administration/maintenance/how-to-troubleshoot-a-growing-pg-wal-directory"
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Monitoring & troubleshooting",
        "link": { "type": "doc", "id": "postgres-howtos/monitoring-troubleshooting/index" },
        "items": [
          {
            "type": "category",
            "label": "System monitoring",
            "link": { "type": "doc", "id": "postgres-howtos/monitoring-troubleshooting/system-monitoring/index" },
            "items": [
              "postgres-howtos/monitoring-troubleshooting/system-monitoring/flamegraphs-for-postgres",
              "postgres-howtos/monitoring-troubleshooting/system-monitoring/how-to-determine-the-replication-lag"
            ]
          },
          {
            "type": "category",
            "label": "Lock analysis",
            "link": { "type": "doc", "id": "postgres-howtos/monitoring-troubleshooting/lock-analysis/index" },
            "items": [
              "postgres-howtos/monitoring-troubleshooting/lock-analysis/how-to-understand-what-is-blocking-ddl"
            ]
          },
          {
            "type": "category",
            "label": "Troubleshooting",
            "link": { "type": "doc", "id": "postgres-howtos/monitoring-troubleshooting/troubleshooting/index" },
            "items": [
              "postgres-howtos/monitoring-troubleshooting/troubleshooting/how-to-not-get-screwed-as-a-dba",
              "postgres-howtos/monitoring-troubleshooting/troubleshooting/how-to-flush-caches"
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Schema design",
        "link": { "type": "doc", "id": "postgres-howtos/schema-design/index" },
        "items": [
          {
            "type": "category",
            "label": "DDL operations",
            "link": { "type": "doc", "id": "postgres-howtos/schema-design/ddl-operations/index" },
            "items": [
              "postgres-howtos/schema-design/ddl-operations/how-to-redefine-a-PK-without-downtime",
              "postgres-howtos/schema-design/ddl-operations/how-to-drop-a-column",
              "postgres-howtos/schema-design/ddl-operations/how-to-add-a-column",
              "postgres-howtos/schema-design/ddl-operations/how-to-add-a-check-constraint-without-downtime"
            ]
          },
          {
            "type": "category",
            "label": "Data types",
            "link": { "type": "doc", "id": "postgres-howtos/schema-design/data-types/index" },
            "items": [
              "postgres-howtos/schema-design/data-types/how-to-use-uuid",
              "postgres-howtos/schema-design/data-types/uuid-v7-and-partitioning-timescaledb",
              "postgres-howtos/schema-design/data-types/how-to-quickly-check-data-type-and-storage-size-of-a-value"
            ]
          },
          {
            "type": "category",
            "label": "Constraints",
            "link": { "type": "doc", "id": "postgres-howtos/schema-design/constraints/index" },
            "items": [
              "postgres-howtos/schema-design/constraints/how-to-add-a-foreign-key",
              "postgres-howtos/schema-design/constraints/how-to-remove-a-foreign-key",
              "postgres-howtos/schema-design/constraints/how-to-find-int4-pks-with-out-of-range-risks"
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Development tools",
        "link": { "type": "doc", "id": "postgres-howtos/development-tools/index" },
        "items": [
          {
            "type": "category",
            "label": "psql",
            "link": { "type": "doc", "id": "postgres-howtos/development-tools/psql/index" },
            "items": [
              "postgres-howtos/development-tools/psql/how-to-use-variables-in-psql-scripts",
              "postgres-howtos/development-tools/psql/learn-about-schema-metadata-via-psql",
              "postgres-howtos/development-tools/psql/psql-tuning",
              "postgres-howtos/development-tools/psql/psql-shortcuts",
              "postgres-howtos/development-tools/psql/how-to-plot-graphs-right-in-psql-on-macos-iterm2",
              "postgres-howtos/development-tools/psql/how-to-make-e-work-in-psql",
              "postgres-howtos/development-tools/psql/how-to-format-text-output-in-psql-scripts"
            ]
          },
          {
            "type": "category",
            "label": "SQL techniques",
            "link": { "type": "doc", "id": "postgres-howtos/development-tools/sql-techniques/index" },
            "items": [
              "postgres-howtos/development-tools/sql-techniques/how-to-import-csv-to-postgres",
              "postgres-howtos/development-tools/sql-techniques/find-or-insert-using-a-single-query",
              "postgres-howtos/development-tools/sql-techniques/how-to-format-sql",
              "postgres-howtos/development-tools/sql-techniques/how-to-generate-fake-data",
              "postgres-howtos/development-tools/sql-techniques/how-to-use-lib-pgquery-in-shell"
            ]
          },
          {
            "type": "category",
            "label": "Client tools",
            "link": { "type": "doc", "id": "postgres-howtos/development-tools/client-tools/index" },
            "items": [
              "postgres-howtos/development-tools/client-tools/how-to-set-application-name-without-extra-queries",
              "postgres-howtos/development-tools/client-tools/how-to-use-docker-to-run-postgres",
              "postgres-howtos/development-tools/client-tools/how-to-change-ownership-of-all-objects-in-a-database"
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Advanced topics",
        "link": { "type": "doc", "id": "postgres-howtos/advanced-topics/index" },
        "items": [
          {
            "type": "category",
            "label": "Misc",
            "link": { "type": "doc", "id": "postgres-howtos/advanced-topics/misc/index" },
            "items": [
              "postgres-howtos/advanced-topics/misc/tuple-sparsity",
              "postgres-howtos/advanced-topics/misc/lsn-values-and-wal-filenames",
              "postgres-howtos/advanced-topics/misc/how-to-use-openai-apis-in-postgres",
              "postgres-howtos/advanced-topics/misc/how-to-install-postgres-16-with-plpython3u",
              "postgres-howtos/advanced-topics/misc/how-many-tuples-can-be-inserted-in-a-page",
              "postgres-howtos/advanced-topics/misc/estimate-yoy-table-growth",
              "postgres-howtos/advanced-topics/misc/how-to-find-the-best-order-of-columns-to-save-on-storage",
              "postgres-howtos/advanced-topics/misc/how-to-help-others",
              "postgres-howtos/advanced-topics/misc/how-to-work-with-metadata",
              "postgres-howtos/advanced-topics/misc/how-to-compile-postgres-on-ubuntu-22.04"
            ]
          },
          {
            "type": "category",
            "label": "Replication",
            "link": { "type": "doc", "id": "postgres-howtos/advanced-topics/replication/index" },
            "items": [
              "postgres-howtos/advanced-topics/replication/how-to-convert-a-physical-replica-to-logical",
              "postgres-howtos/advanced-topics/replication/zero-downtime-major-upgrade",
              "postgres-howtos/advanced-topics/replication/how-to-troubleshoot-streaming-replication-lag"
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Miscellaneous",
        "link": { "type": "doc", "id": "postgres-howtos/miscellaneous/index" },
        "items": [
          "postgres-howtos/miscellaneous/how-to-get-into-trouble-using-some-postgres-features"
        ]
      }
    ],
    "Reference guides": [
      "reference-guides/index",
      "reference-guides/postgres-ai-bot-reference",
      "reference-guides/database-lab-engine-components",
      "reference-guides/database-lab-engine-api-reference",
      "reference-guides/dblab-client-cli-reference",
      "reference-guides/database-lab-engine-configuration-reference",
      "reference-guides/db-migration-checker-configuration-reference",
      "reference-guides/joe-bot-configuration-reference",
      "reference-guides/joe-bot-commands-reference",
    ],
  },
}
