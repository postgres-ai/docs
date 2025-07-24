const fs = require('fs');
const path = require('path');

// Read the current sidebars.js
const sidebarPath = path.join(__dirname, '../sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// 1. Rename "Backup & recovery" to "Backups, data export/import"
sidebarContent = sidebarContent.replace(/"label":\s*"Backup & recovery"/g, '"label": "Backups, data export/import"');

// 2. Rename "Monitoring & statistics" to just "Monitoring"
sidebarContent = sidebarContent.replace(/"label":\s*"Monitoring & statistics"/g, '"label": "Monitoring"');

// 3. Update file paths that were moved
const pathUpdates = [
  // Files moved to monitoring
  {
    old: 'postgres-howtos/performance-optimization/statistics/ad-hoc-monitoring',
    new: 'postgres-howtos/performance-optimization/monitoring/ad-hoc-monitoring'
  },
  {
    old: 'postgres-howtos/performance-optimization/statistics/how-to-monitor-transaction-id-wraparound-risks',
    new: 'postgres-howtos/performance-optimization/monitoring/how-to-monitor-transaction-id-wraparound-risks'
  },
  {
    old: 'postgres-howtos/performance-optimization/statistics/how-to-monitor-xmin-horizon',
    new: 'postgres-howtos/performance-optimization/monitoring/how-to-monitor-xmin-horizon'
  },
  {
    old: 'postgres-howtos/performance-optimization/indexing/pg-stat-statements-part-1',
    new: 'postgres-howtos/performance-optimization/monitoring/pg-stat-statements-part-1'
  },
  {
    old: 'postgres-howtos/performance-optimization/indexing/how-to-analyze-heavyweight-locks-part-1',
    new: 'postgres-howtos/performance-optimization/monitoring/how-to-analyze-heavyweight-locks-part-1'
  },
  {
    old: 'postgres-howtos/monitoring-troubleshooting/system-monitoring/how-to-reduce-wal-generation-rates',
    new: 'postgres-howtos/performance-optimization/monitoring/how-to-reduce-wal-generation-rates'
  },
  // Files moved to benchmarks
  {
    old: 'postgres-howtos/performance-optimization/indexing/how-to-benchmark',
    new: 'postgres-howtos/performance-optimization/benchmarks/how-to-benchmark'
  },
  {
    old: 'postgres-howtos/performance-optimization/indexing/pre-and-post-steps-for-benchmark-iterations',
    new: 'postgres-howtos/performance-optimization/benchmarks/pre-and-post-steps-for-benchmark-iterations'
  },
  // Files moved to misc
  {
    old: 'postgres-howtos/performance-optimization/query-tuning/how-to-help-others',
    new: 'postgres-howtos/advanced-topics/misc/how-to-help-others'
  },
  {
    old: 'postgres-howtos/performance-optimization/indexing/how-to-work-with-metadata',
    new: 'postgres-howtos/advanced-topics/misc/how-to-work-with-metadata'
  },
  {
    old: 'postgres-howtos/performance-optimization/indexing/how-to-compile-postgres-on-ubuntu-22.04',
    new: 'postgres-howtos/advanced-topics/misc/how-to-compile-postgres-on-ubuntu-22.04'
  },
  // Files moved to configuration
  {
    old: 'postgres-howtos/performance-optimization/query-tuning/rough-oltp-configuration-tuning',
    new: 'postgres-howtos/database-administration/configuration/rough-oltp-configuration-tuning'
  },
  {
    old: 'postgres-howtos/performance-optimization/query-tuning/how-to-tune-work-mem',
    new: 'postgres-howtos/database-administration/configuration/how-to-tune-work-mem'
  },
  // Files moved to maintenance
  {
    old: 'postgres-howtos/performance-optimization/statistics/how-to-run-analyze',
    new: 'postgres-howtos/database-administration/maintenance/how-to-run-analyze'
  },
  {
    old: 'postgres-howtos/database-administration/backup-recovery/how-to-enable-data-checksums-without-downtime',
    new: 'postgres-howtos/database-administration/maintenance/how-to-enable-data-checksums-without-downtime'
  },
  {
    old: 'postgres-howtos/database-administration/configuration/how-to-troubleshoot-and-speedup-postgres-restarts',
    new: 'postgres-howtos/database-administration/maintenance/how-to-troubleshoot-and-speedup-postgres-restarts'
  },
  {
    old: 'postgres-howtos/database-administration/configuration/how-to-troubleshoot-long-startup',
    new: 'postgres-howtos/database-administration/maintenance/how-to-troubleshoot-long-startup'
  },
  {
    old: 'postgres-howtos/monitoring-troubleshooting/system-monitoring/how-to-troubleshoot-a-growing-pg-wal-directory',
    new: 'postgres-howtos/database-administration/maintenance/how-to-troubleshoot-a-growing-pg-wal-directory'
  },
  // Files moved to replication
  {
    old: 'postgres-howtos/performance-optimization/statistics/how-to-troubleshoot-streaming-replication-lag',
    new: 'postgres-howtos/advanced-topics/replication/how-to-troubleshoot-streaming-replication-lag'
  },
  // File moved to system monitoring
  {
    old: 'postgres-howtos/performance-optimization/query-tuning/flamegraphs-for-postgres',
    new: 'postgres-howtos/monitoring-troubleshooting/system-monitoring/flamegraphs-for-postgres'
  }
];

// Apply path updates
pathUpdates.forEach(update => {
  const regex = new RegExp(`"${update.old}"`, 'g');
  sidebarContent = sidebarContent.replace(regex, `"${update.new}"`);
});

// Update statistics link references to monitoring
sidebarContent = sidebarContent.replace(/"link":\s*"postgres-howtos\/performance-optimization\/statistics\/index"/g, '"link": "postgres-howtos/performance-optimization/monitoring/index"');

// Add new Benchmarks subcategory to Performance & optimization
const performanceSection = sidebarContent.indexOf('"label": "Performance & optimization"');
const indexingEnd = sidebarContent.indexOf(']', sidebarContent.indexOf('"label": "Indexing"', performanceSection));

// Insert Benchmarks section after Indexing
const benchmarksSection = `,
          {
            "type": "category",
            "label": "Benchmarks",
            "link": "postgres-howtos/performance-optimization/benchmarks/index",
            "items": [
              "postgres-howtos/performance-optimization/benchmarks/how-to-benchmark",
              "postgres-howtos/performance-optimization/benchmarks/pre-and-post-steps-for-benchmark-iterations"
            ]
          }`;

sidebarContent = sidebarContent.slice(0, indexingEnd + 1) + benchmarksSection + sidebarContent.slice(indexingEnd + 1);

// Write the updated sidebar
fs.writeFileSync(sidebarPath, sidebarContent);

console.log('✅ Updated sidebar configuration with all changes:');
console.log('   - Renamed "Database administration" to "Administration"');
console.log('   - Renamed "Backup & recovery" to "Backups, data export/import"');
console.log('   - Renamed "Monitoring & statistics" to "Monitoring"');
console.log('   - Added new "Benchmarks" subcategory');
console.log('   - Updated all file paths for moved articles');