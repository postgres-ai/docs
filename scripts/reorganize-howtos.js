#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Better categorization based on article titles and content
const ARTICLE_CATEGORIES = {
  // Performance & Query Optimization
  'performance-optimization/query-tuning': [
    '0001-explain-analyze-buffers.md',
    '0010-flamegraphs-for-postgres.md',
    '0012-from-pgss-to-explain--how-to-find-query-examples.md',
    '0014-how-to-decide-if-query-too-slow.md',
    '0056-how-to-imitate-production-planner.md',
    '0063-how-to-help-others.md',
    '0089-rough-oltp-configuration-tuning.md',
    '0092-how-to-tune-work-mem.md'
  ],
  'performance-optimization/indexing': [
    '0015-how-to-monitor-index-operations.md',
    '0018-over-indexing.md',
    '0053-index-maintenance.md',
    '0075-how-to-find-unused-indexes.md',
    '0076-how-to-find-redundent-indexes.md',
    '0079-rebuild-indexes-without-deadlocks.md'
  ],
  'performance-optimization/statistics': [
    '0093-how-to-troubleshoot-streaming-replication-lag.md',
    '0094-how-to-run-analyze.md',
    '0011-ad-hoc-monitoring.md',
    '0044-how-to-monitor-transaction-id-wraparound-risks.md',
    '0045-how-to-monitor-xmin-horizon.md'
  ],
  
  // Database Administration
  'database-administration/maintenance': [
    '0046-how-to-deal-with-bloat.md',
    '0067-autovacuum-queue-and-progress.md',
    '0030-how-to-deal-with-long-running-transactions-oltp.md',
    '0035-how-to-use-subtransactions-in-postgres.md'
  ],
  'database-administration/backup-recovery': [
    '0008-how-to-speed-up-pg-dump.md',
    '0020-how-to-use-pg-restore.md',
    '0032-how-to-speed-up-bulk-load.md',
    '0037-how-to-enable-data-checksums-without-downtime.md'
  ],
  'database-administration/configuration': [
    '0034-how-to-perform-postgres-tuning.md',
    '0088-how-to-tune-linux-parameters-for-oltp-postgres.md',
    '0002-how-to-troubleshoot-and-speedup-postgres-restarts.md',
    '0003-how-to-troubleshoot-long-startup.md'
  ],
  
  // Monitoring & Troubleshooting
  'monitoring-troubleshooting/system-monitoring': [
    '0017-how-to-determine-the-replication-lag.md',
    '0031-how-to-troubleshoot-a-growing-pg-wal-directory.md',
    '0052-how-to-reduce-wal-generation-rates.md'
  ],
  'monitoring-troubleshooting/lock-analysis': [
    '0071-how-to-understand-what-is-blocking-ddl.md'
  ],
  'monitoring-troubleshooting/troubleshooting': [
    '0038-how-to-not-get-screwed-as-a-dba.md',
    '0074-how-to-flush-caches.md'
  ],
  
  // Schema Design & DDL Operations
  'schema-design/ddl-operations': [
    '0033-how-to-redefine-a-PK-without-downtime.md',
    '0055-how-to-drop-a-column.md',
    '0060-how-to-add-a-column.md',
    '0069-howd-tod-addd-ad-checkd-constraintd-withoutd-downtime.md'
  ],
  'schema-design/data-types': [
    '0064-how-to-use-uuid.md',
    '0065-uuid-v7-and-partitioning-timescaledb.md',
    '0083-how-to-quickly-check-data-type-and-storage-size-of-a-value.md',
    '0085-how-to-quickly-check-data-type-and-storage-size-of-a-value.md'
  ],
  'schema-design/constraints': [
    '0070-how-to-add-a-foreign-key.md',
    '0072-how-to-remove-a-foreign-key.md',
    '0080-how-to-find-int4-pks-with-out-of-range-risks.md'
  ],
  
  // Development Tools & Techniques
  'development-tools/psql': [
    '0049-how-to-use-variables-in-psql-scripts.md',
    '0051-learn-about-schema-metadata-via-psql.md',
    '0059-psql-tuning.md',
    '0068-psql-shortcuts.md',
    '0081-how-to-plot-graphs-right-in-psql-on-macos-iterm2.md',
    '0086-how-to-make-e-work-in-psql.md',
    '0091-how-to-format-text-output-in-psql-scripts.md'
  ],
  'development-tools/sql-techniques': [
    '0019-how-to-import-csv-to-postgres.md',
    '0036-find-or-insert-using-a-single-query.md',
    '0043-how-to-format-sql.md',
    '0048-how-to-generate-fake-data.md',
    '0090-how-to-use-lib-pgquery-in-shell.md'
  ],
  'development-tools/client-tools': [
    '0021-how-to-set-application-name-without-extra-queries.md',
    '0058-how-to-use-docker-to-run-postgres.md',
    '0087-how-to-change-ownership-of-all-objects-in-a-database.md'
  ],
  
  // Advanced Topics
  'advanced-topics/internals': [
    '0004-tuple-sparsenes.md',
    '0009-lsn-values-and-wal-filenames.md',
    '0066-how-many-tuples-can-be-inserted-in-a-page.md',
    '0078-estimate-yoy-table-growth.md',
    '0084-how-to-find-the-best-order-of-columns-to-save-on-storage.md'
  ],
  'advanced-topics/extensions': [
    '0023-how-to-use-openai-apis-in-postgres.md',
    '0047-how-to-install-postgres-16-with-plpython3u.md'
  ],
  'advanced-topics/replication': [
    '0057-how-to-convert-a-physical-replica-to-logical.md',
    '0077-zero-downtime-major-upgrade.md'
  ]
};

// Files to skip (not articles)
const SKIP_FILES = [
  'README.md',
  'all.md',
  'final-recommendations.md',
  'grouping-strategy.md',
  'proposed-structure.md'
];

function reorganizeArticles() {
  console.log('Reorganizing PostgreSQL how-to articles...\n');
  
  const sourceBase = path.join(__dirname, '../docs/postgres-howtos');
  let movedCount = 0;
  let errorCount = 0;
  
  // Process each category mapping
  for (const [targetPath, articles] of Object.entries(ARTICLE_CATEGORIES)) {
    const targetDir = path.join(sourceBase, targetPath);
    
    for (const article of articles) {
      // Find current location
      const findCmd = `find ${sourceBase} -name "${article}" -type f 2>/dev/null`;
      const currentPath = require('child_process')
        .execSync(findCmd, { encoding: 'utf8' })
        .trim();
      
      if (!currentPath) {
        console.log(`⚠️  Not found: ${article}`);
        errorCount++;
        continue;
      }
      
      const targetFile = path.join(targetDir, article);
      
      // Skip if already in correct location
      if (currentPath === targetFile) {
        console.log(`✓ Already correct: ${article}`);
        continue;
      }
      
      try {
        // Move file
        fs.renameSync(currentPath, targetFile);
        console.log(`✓ Moved: ${article} -> ${targetPath}`);
        movedCount++;
      } catch (error) {
        console.error(`✗ Error moving ${article}: ${error.message}`);
        errorCount++;
      }
    }
  }
  
  // Clean up skip files
  console.log('\nCleaning up non-article files...');
  for (const skipFile of SKIP_FILES) {
    const findCmd = `find ${sourceBase} -name "${skipFile}" -type f 2>/dev/null`;
    const files = require('child_process')
      .execSync(findCmd, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(f => f);
    
    for (const file of files) {
      try {
        fs.unlinkSync(file);
        console.log(`✓ Removed: ${skipFile}`);
      } catch (error) {
        console.error(`✗ Error removing ${file}: ${error.message}`);
      }
    }
  }
  
  console.log(`\n✅ Reorganization complete!`);
  console.log(`   - Articles moved: ${movedCount}`);
  console.log(`   - Errors: ${errorCount}`);
  
  // Show final distribution
  console.log('\nFinal distribution:');
  const distribution = require('child_process')
    .execSync(`find ${sourceBase} -name "*.md" -type f | grep -v "/index.md" | cut -d'/' -f3-4 | sort | uniq -c | sort -nr`, { encoding: 'utf8' })
    .trim();
  console.log(distribution);
}

if (require.main === module) {
  reorganizeArticles();
}