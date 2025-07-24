const fs = require('fs');
const path = require('path');

// Read the current sidebars.js
const sidebarPath = path.join(__dirname, '../sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Replace all IDs that have numeric prefixes
sidebarContent = sidebarContent.replace(/"postgres-howtos\/[^"]+\/\d{4}-([^"]+)"/g, '"postgres-howtos/$1"');

// Fix the paths by adding the correct directory structure back
sidebarContent = sidebarContent.replace(/"postgres-howtos\/(.+?)"/g, (match, path) => {
  // Skip if it's already a full path or an index
  if (path.includes('/') || path === 'index') {
    return match;
  }
  
  // Determine the category based on the file
  let category = '';
  
  // Performance & optimization files
  if (['explain-analyze-buffers', 'flamegraphs-for-postgres', 'from-pgss-to-explain--how-to-find-query-examples', 
       'how-to-decide-if-query-too-slow', 'how-to-imitate-production-planner', 'how-to-help-others',
       'rough-oltp-configuration-tuning', 'how-to-tune-work-mem'].includes(path)) {
    category = 'performance-optimization/query-tuning/';
  } else if (['pg-stat-statements-part-1', 'how-to-benchmark', 'how-to-monitor-index-operations',
              'over-indexing', 'how-to-analyze-heavyweight-locks-part-1', 'how-to-work-with-metadata',
              'how-to-compile-postgres-on-ubuntu-22.04', 'pre-and-post-steps-for-benchmark-iterations',
              'index-maintenance', 'how-to-find-unused-indexes', 'how-to-find-redundent-indexes',
              'rebuild-indexes-without-deadlocks'].includes(path)) {
    category = 'performance-optimization/indexing/';
  } else if (['ad-hoc-monitoring', 'how-to-monitor-transaction-id-wraparound-risks',
              'how-to-monitor-xmin-horizon', 'how-to-troubleshoot-streaming-replication-lag',
              'how-to-run-analyze'].includes(path)) {
    category = 'performance-optimization/statistics/';
  }
  // Database administration files
  else if (['how-to-speed-up-pg-dump', 'how-to-use-pg-restore', 'how-to-speed-up-bulk-load',
            'how-to-enable-data-checksums-without-downtime'].includes(path)) {
    category = 'database-administration/backup-recovery/';
  } else if (['how-to-troubleshoot-and-speedup-postgres-restarts', 'how-to-troubleshoot-long-startup',
              'how-to-perform-postgres-tuning', 'how-to-tune-linux-parameters-for-oltp-postgres'].includes(path)) {
    category = 'database-administration/configuration/';
  } else if (['how-to-deal-with-long-running-transactions-oltp', 'how-to-use-subtransactions-in-postgres',
              'how-to-deal-with-bloat', 'autovacuum-queue-and-progress'].includes(path)) {
    category = 'database-administration/maintenance/';
  }
  // Monitoring & troubleshooting files
  else if (['how-to-determine-the-replication-lag', 'how-to-troubleshoot-a-growing-pg-wal-directory',
            'how-to-reduce-wal-generation-rates'].includes(path)) {
    category = 'monitoring-troubleshooting/system-monitoring/';
  } else if (['how-to-understand-what-is-blocking-ddl'].includes(path)) {
    category = 'monitoring-troubleshooting/lock-analysis/';
  } else if (['how-to-not-get-screwed-as-a-dba', 'how-to-flush-caches'].includes(path)) {
    category = 'monitoring-troubleshooting/troubleshooting/';
  }
  // Schema design files
  else if (['how-to-redefine-a-PK-without-downtime', 'how-to-drop-a-column', 'how-to-add-a-column',
            'how-to-add-a-check-constraint-without-downtime'].includes(path)) {
    category = 'schema-design/ddl-operations/';
  } else if (['how-to-use-uuid', 'uuid-v7-and-partitioning-timescaledb', 'how-to-change-postgres-parameter',
              'how-to-quickly-check-data-type-and-storage-size-of-a-value'].includes(path)) {
    category = 'schema-design/data-types/';
  } else if (['how-to-add-a-foreign-key', 'how-to-remove-a-foreign-key',
              'how-to-find-int4-pks-with-out-of-range-risks'].includes(path)) {
    category = 'schema-design/constraints/';
  }
  // Development tools files
  else if (['how-to-use-variables-in-psql-scripts', 'learn-about-schema-metadata-via-psql',
            'psql-tuning', 'psql-shortcuts', 'how-to-plot-graphs-right-in-psql-on-macos-iterm2',
            'how-to-make-e-work-in-psql', 'how-to-format-text-output-in-psql-scripts'].includes(path)) {
    category = 'development-tools/psql/';
  } else if (['how-to-import-csv-to-postgres', 'find-or-insert-using-a-single-query',
              'how-to-format-sql', 'how-to-generate-fake-data', 'how-to-use-lib-pgquery-in-shell'].includes(path)) {
    category = 'development-tools/sql-techniques/';
  } else if (['how-to-set-application-name-without-extra-queries', 'how-to-use-docker-to-run-postgres',
              'how-to-change-ownership-of-all-objects-in-a-database'].includes(path)) {
    category = 'development-tools/client-tools/';
  }
  // Advanced topics files
  else if (['tuple-sparsity', 'lsn-values-and-wal-filenames', 'how-to-use-openai-apis-in-postgres',
            'how-to-install-postgres-16-with-plpython3u', 'how-many-tuples-can-be-inserted-in-a-page',
            'estimate-yoy-table-growth', 'how-to-find-the-best-order-of-columns-to-save-on-storage'].includes(path)) {
    category = 'advanced-topics/misc/';
  } else if (['how-to-convert-a-physical-replica-to-logical', 'zero-downtime-major-upgrade'].includes(path)) {
    category = 'advanced-topics/replication/';
  }
  // Miscellaneous files
  else if (['how-to-get-into-trouble-using-some-postgres-features'].includes(path)) {
    category = 'miscellaneous/';
  }
  
  return `"postgres-howtos/${category}${path}"`;
});

// Write the updated sidebar
fs.writeFileSync(sidebarPath, sidebarContent);

console.log('✅ Updated sidebar to remove numeric prefixes');