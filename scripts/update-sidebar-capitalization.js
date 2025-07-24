const fs = require('fs');
const path = require('path');

// Read the sidebars.js file
const sidebarPath = path.join(__dirname, '..', 'sidebars.js');
const content = fs.readFileSync(sidebarPath, 'utf8');

// Updated sidebar structure with proper capitalization and 3-level nesting
const updatedSidebar = `    "Postgres how-tos": [
      "postgres-howtos/index",
      {
        type: "category",
        label: "Performance & optimization",
        link: {
          type: "doc",
          id: "postgres-howtos/performance-optimization/index",
        },
        items: [
          "postgres-howtos/performance-optimization/query-tuning/explain-analyze-buffers",
          "postgres-howtos/performance-optimization/query-tuning/flamegraphs-for-postgres",
          "postgres-howtos/performance-optimization/query-tuning/from-pgss-to-explain--how-to-find-query-examples",
          "postgres-howtos/performance-optimization/query-tuning/how-to-decide-if-query-too-slow",
          "postgres-howtos/performance-optimization/query-tuning/how-to-imitate-production-planner",
          "postgres-howtos/performance-optimization/query-tuning/how-to-help-others",
          "postgres-howtos/performance-optimization/query-tuning/rough-oltp-configuration-tuning",
          "postgres-howtos/performance-optimization/query-tuning/how-to-tune-work-mem",
          "postgres-howtos/performance-optimization/indexing/pg-stat-statements-part-1",
          "postgres-howtos/performance-optimization/indexing/how-to-benchmark",
          "postgres-howtos/performance-optimization/indexing/how-to-monitor-index-operations",
          "postgres-howtos/performance-optimization/indexing/over-indexing",
          "postgres-howtos/performance-optimization/indexing/how-to-analyze-heavyweight-locks-part-1",
          "postgres-howtos/performance-optimization/indexing/how-to-work-with-metadata",
          "postgres-howtos/performance-optimization/indexing/how-to-compile-postgres-on-ubuntu-22.04",
          "postgres-howtos/performance-optimization/indexing/pre-and-post-steps-for-benchmark-iterations",
          "postgres-howtos/performance-optimization/indexing/index-maintenance",
          "postgres-howtos/performance-optimization/indexing/how-to-find-unused-indexes",
          "postgres-howtos/performance-optimization/indexing/how-to-find-redundent-indexes",
          "postgres-howtos/performance-optimization/indexing/rebuild-indexes-without-deadlocks",
          "postgres-howtos/performance-optimization/statistics/ad-hoc-monitoring",
          "postgres-howtos/performance-optimization/statistics/how-to-monitor-transaction-id-wraparound-risks",
          "postgres-howtos/performance-optimization/statistics/how-to-monitor-xmin-horizon",
          "postgres-howtos/performance-optimization/statistics/how-to-troubleshoot-streaming-replication-lag",
          "postgres-howtos/performance-optimization/statistics/how-to-run-analyze",
        ],
      },
      {
        type: "category",
        label: "Database administration",
        link: {
          type: "doc",
          id: "postgres-howtos/database-administration/index",
        },
        items: [
          "postgres-howtos/database-administration/backup-recovery/how-to-speed-up-pg-dump",
          "postgres-howtos/database-administration/backup-recovery/how-to-use-pg-restore",
          "postgres-howtos/database-administration/backup-recovery/how-to-speed-up-bulk-load",
          "postgres-howtos/database-administration/backup-recovery/how-to-enable-data-checksums-without-downtime",
          "postgres-howtos/database-administration/configuration/how-to-troubleshoot-and-speedup-postgres-restarts",
          "postgres-howtos/database-administration/configuration/how-to-troubleshoot-long-startup",
          "postgres-howtos/database-administration/configuration/how-to-perform-postgres-tuning",
          "postgres-howtos/database-administration/configuration/how-to-tune-linux-parameters-for-oltp-postgres",
          "postgres-howtos/database-administration/maintenance/how-to-deal-with-long-running-transactions-oltp",
          "postgres-howtos/database-administration/maintenance/how-to-use-subtransactions-in-postgres",
          "postgres-howtos/database-administration/maintenance/how-to-deal-with-bloat",
          "postgres-howtos/database-administration/maintenance/autovacuum-queue-and-progress",
        ],
      },
      {
        type: "category",
        label: "Monitoring & troubleshooting",
        link: {
          type: "doc",
          id: "postgres-howtos/monitoring-troubleshooting/index",
        },
        items: [
          "postgres-howtos/monitoring-troubleshooting/system-monitoring/how-to-determine-the-replication-lag",
          "postgres-howtos/monitoring-troubleshooting/system-monitoring/how-to-troubleshoot-a-growing-pg-wal-directory",
          "postgres-howtos/monitoring-troubleshooting/system-monitoring/how-to-reduce-wal-generation-rates",
          "postgres-howtos/monitoring-troubleshooting/lock-analysis/how-to-understand-what-is-blocking-ddl",
          "postgres-howtos/monitoring-troubleshooting/troubleshooting/how-to-not-get-screwed-as-a-dba",
          "postgres-howtos/monitoring-troubleshooting/troubleshooting/how-to-flush-caches",
        ],
      },
      {
        type: "category",
        label: "Schema design",
        link: {
          type: "doc",
          id: "postgres-howtos/schema-design/index",
        },
        items: [
          "postgres-howtos/schema-design/ddl-operations/how-to-redefine-a-PK-without-downtime",
          "postgres-howtos/schema-design/ddl-operations/how-to-drop-a-column",
          "postgres-howtos/schema-design/ddl-operations/how-to-add-a-column",
          "postgres-howtos/schema-design/ddl-operations/how-to-add-a-check-constraint-without-downtime",
          "postgres-howtos/schema-design/data-types/how-to-use-uuid",
          "postgres-howtos/schema-design/data-types/uuid-v7-and-partitioning-timescaledb",
          "postgres-howtos/schema-design/data-types/how-to-change-postgres-parameter",
          "postgres-howtos/schema-design/data-types/how-to-quickly-check-data-type-and-storage-size-of-a-value",
          "postgres-howtos/schema-design/constraints/how-to-add-a-foreign-key",
          "postgres-howtos/schema-design/constraints/how-to-remove-a-foreign-key",
          "postgres-howtos/schema-design/constraints/how-to-find-int4-pks-with-out-of-range-risks",
        ],
      },
      {
        type: "category",
        label: "Development tools",
        link: {
          type: "doc",
          id: "postgres-howtos/development-tools/index",
        },
        items: [
          "postgres-howtos/development-tools/psql/how-to-use-variables-in-psql-scripts",
          "postgres-howtos/development-tools/psql/learn-about-schema-metadata-via-psql",
          "postgres-howtos/development-tools/psql/psql-tuning",
          "postgres-howtos/development-tools/psql/psql-shortcuts",
          "postgres-howtos/development-tools/psql/how-to-plot-graphs-right-in-psql-on-macos-iterm2",
          "postgres-howtos/development-tools/psql/how-to-make-e-work-in-psql",
          "postgres-howtos/development-tools/psql/how-to-format-text-output-in-psql-scripts",
          "postgres-howtos/development-tools/sql-techniques/how-to-import-csv-to-postgres",
          "postgres-howtos/development-tools/sql-techniques/find-or-insert-using-a-single-query",
          "postgres-howtos/development-tools/sql-techniques/how-to-format-sql",
          "postgres-howtos/development-tools/sql-techniques/how-to-generate-fake-data",
          "postgres-howtos/development-tools/sql-techniques/how-to-use-lib-pgquery-in-shell",
          "postgres-howtos/development-tools/client-tools/how-to-set-application-name-without-extra-queries",
          "postgres-howtos/development-tools/client-tools/how-to-use-docker-to-run-postgres",
          "postgres-howtos/development-tools/client-tools/how-to-change-ownership-of-all-objects-in-a-database",
        ],
      },
      {
        type: "category",
        label: "Advanced topics",
        link: {
          type: "doc",
          id: "postgres-howtos/advanced-topics/index",
        },
        items: [
          "postgres-howtos/advanced-topics/internals/tuple-sparsenes",
          "postgres-howtos/advanced-topics/internals/lsn-values-and-wal-filenames",
          "postgres-howtos/advanced-topics/internals/how-many-tuples-can-be-inserted-in-a-page",
          "postgres-howtos/advanced-topics/internals/estimate-yoy-table-growth",
          "postgres-howtos/advanced-topics/internals/how-to-find-the-best-order-of-columns-to-save-on-storage",
          "postgres-howtos/advanced-topics/extensions/how-to-use-openai-apis-in-postgres",
          "postgres-howtos/advanced-topics/extensions/how-to-install-postgres-16-with-plpython3u",
          "postgres-howtos/advanced-topics/replication/how-to-convert-a-physical-replica-to-logical",
          "postgres-howtos/advanced-topics/replication/zero-downtime-major-upgrade",
        ],
      },
      {
        type: "category",
        label: "Miscellaneous",
        link: {
          type: "doc",
          id: "postgres-howtos/miscellaneous/index",
        },
        items: [
          "postgres-howtos/miscellaneous/how-to-get-into-trouble-using-some-postgres-features",
        ],
      },
    ],`;

console.log('Updating sidebar structure and capitalization...');

// Find the start and end of the Postgres how-tos section
const startMarker = '"Postgres how-tos": [';
const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
  console.error('Could not find Postgres how-tos section');
  process.exit(1);
}

// Find the end of the section by counting brackets
let bracketCount = 0;
let inString = false;
let endIndex = startIndex + startMarker.length;

for (let i = endIndex; i < content.length; i++) {
  const char = content[i];
  const prevChar = i > 0 ? content[i - 1] : '';
  
  if (char === '"' && prevChar !== '\\') {
    inString = !inString;
  }
  
  if (!inString) {
    if (char === '[' || char === '{') {
      bracketCount++;
    } else if (char === ']' || char === '}') {
      bracketCount--;
      if (bracketCount === -1) {
        endIndex = i + 1;
        break;
      }
    }
  }
}

// Replace the section
const newContent = content.slice(0, startIndex) + updatedSidebar + content.slice(endIndex);

// Write back
fs.writeFileSync(sidebarPath, newContent);

console.log('Sidebar updated successfully!');