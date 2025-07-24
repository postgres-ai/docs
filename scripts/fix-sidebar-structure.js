const fs = require('fs');
const path = require('path');

// Read the current sidebars.js
const sidebarPath = path.join(__dirname, '../sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// The sidebar has structural issues - let's rebuild the postgres-howtos section properly
// First, let's find the postgres-howtos section
const startMarker = '"Postgres how-tos": [';
const startIndex = sidebarContent.indexOf(startMarker);

if (startIndex === -1) {
  console.error('Could not find Postgres how-tos section');
  process.exit(1);
}

// Find the end of the postgres-howtos section
let depth = 0;
let endIndex = startIndex + startMarker.length;
let inString = false;
let escapeNext = false;

for (let i = endIndex; i < sidebarContent.length; i++) {
  const char = sidebarContent[i];
  
  if (escapeNext) {
    escapeNext = false;
    continue;
  }
  
  if (char === '\\') {
    escapeNext = true;
    continue;
  }
  
  if (char === '"' && !inString) {
    inString = true;
  } else if (char === '"' && inString) {
    inString = false;
  }
  
  if (!inString) {
    if (char === '[' || char === '{') {
      depth++;
    } else if (char === ']' || char === '}') {
      depth--;
      if (depth === -1) {
        endIndex = i + 1;
        break;
      }
    }
  }
}

// Build the new postgres-howtos section
const newPostgresHowtos = `"Postgres how-tos": [
      "postgres-howtos/index",
      {
        "type": "category",
        "label": "Performance & optimization",
        "link": "postgres-howtos/performance-optimization/index",
        "items": [
          {
            "type": "category",
            "label": "Query tuning",
            "link": "postgres-howtos/performance-optimization/query-tuning/index",
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
            "link": "postgres-howtos/performance-optimization/indexing/index",
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
            "link": "postgres-howtos/performance-optimization/monitoring/index",
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
            "link": "postgres-howtos/performance-optimization/benchmarks/index",
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
        "link": "postgres-howtos/database-administration/index",
        "items": [
          {
            "type": "category",
            "label": "Backups, data export/import",
            "link": "postgres-howtos/database-administration/backup-recovery/index",
            "items": [
              "postgres-howtos/database-administration/backup-recovery/how-to-speed-up-pg-dump",
              "postgres-howtos/database-administration/backup-recovery/how-to-use-pg-restore",
              "postgres-howtos/database-administration/backup-recovery/how-to-speed-up-bulk-load"
            ]
          },
          {
            "type": "category",
            "label": "Configuration",
            "link": "postgres-howtos/database-administration/configuration/index",
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
            "link": "postgres-howtos/database-administration/maintenance/index",
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
        "link": "postgres-howtos/monitoring-troubleshooting/index",
        "items": [
          {
            "type": "category",
            "label": "System monitoring",
            "link": "postgres-howtos/monitoring-troubleshooting/system-monitoring/index",
            "items": [
              "postgres-howtos/monitoring-troubleshooting/system-monitoring/flamegraphs-for-postgres",
              "postgres-howtos/monitoring-troubleshooting/system-monitoring/how-to-determine-the-replication-lag"
            ]
          },
          {
            "type": "category",
            "label": "Lock analysis",
            "link": "postgres-howtos/monitoring-troubleshooting/lock-analysis/index",
            "items": [
              "postgres-howtos/monitoring-troubleshooting/lock-analysis/how-to-understand-what-is-blocking-ddl"
            ]
          },
          {
            "type": "category",
            "label": "Troubleshooting",
            "link": "postgres-howtos/monitoring-troubleshooting/troubleshooting/index",
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
        "link": "postgres-howtos/schema-design/index",
        "items": [
          {
            "type": "category",
            "label": "DDL operations",
            "link": "postgres-howtos/schema-design/ddl-operations/index",
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
            "link": "postgres-howtos/schema-design/data-types/index",
            "items": [
              "postgres-howtos/schema-design/data-types/how-to-use-uuid",
              "postgres-howtos/schema-design/data-types/uuid-v7-and-partitioning-timescaledb",
              "postgres-howtos/schema-design/data-types/how-to-quickly-check-data-type-and-storage-size-of-a-value"
            ]
          },
          {
            "type": "category",
            "label": "Constraints",
            "link": "postgres-howtos/schema-design/constraints/index",
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
        "link": "postgres-howtos/development-tools/index",
        "items": [
          {
            "type": "category",
            "label": "psql",
            "link": "postgres-howtos/development-tools/psql/index",
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
            "link": "postgres-howtos/development-tools/sql-techniques/index",
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
            "link": "postgres-howtos/development-tools/client-tools/index",
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
        "link": "postgres-howtos/advanced-topics/index",
        "items": [
          {
            "type": "category",
            "label": "Misc",
            "link": "postgres-howtos/advanced-topics/misc/index",
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
            "link": "postgres-howtos/advanced-topics/replication/index",
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
        "link": "postgres-howtos/miscellaneous/index",
        "items": [
          "postgres-howtos/miscellaneous/how-to-get-into-trouble-using-some-postgres-features"
        ]
      }
    ]`;

// Replace the postgres-howtos section
const newSidebarContent = sidebarContent.substring(0, startIndex) + 
                          newPostgresHowtos + 
                          sidebarContent.substring(endIndex);

// Write the updated sidebar
fs.writeFileSync(sidebarPath, newSidebarContent);

console.log('✅ Fixed sidebar structure with all reorganized articles');