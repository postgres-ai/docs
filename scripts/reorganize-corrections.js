const fs = require('fs');
const path = require('path');

// File moves to implement
const moves = [
  // 1. FlameGraphs to Monitoring & troubleshooting
  {
    from: 'docs/postgres-howtos/performance-optimization/query-tuning/flamegraphs-for-postgres.md',
    to: 'docs/postgres-howtos/monitoring-troubleshooting/system-monitoring/flamegraphs-for-postgres.md'
  },
  // 2. How to help others to Advanced/misc
  {
    from: 'docs/postgres-howtos/performance-optimization/query-tuning/how-to-help-others.md',
    to: 'docs/postgres-howtos/advanced-topics/misc/how-to-help-others.md'
  },
  // 3. Rough configuration tuning to Database administration/Configuration
  {
    from: 'docs/postgres-howtos/performance-optimization/query-tuning/rough-oltp-configuration-tuning.md',
    to: 'docs/postgres-howtos/database-administration/configuration/rough-oltp-configuration-tuning.md'
  },
  // 4. work_mem to Database administration/Configuration
  {
    from: 'docs/postgres-howtos/performance-optimization/query-tuning/how-to-tune-work-mem.md',
    to: 'docs/postgres-howtos/database-administration/configuration/how-to-tune-work-mem.md'
  },
  // 5. pg_stat_statements part 1 to Performance/Monitoring
  {
    from: 'docs/postgres-howtos/performance-optimization/indexing/pg-stat-statements-part-1.md',
    to: 'docs/postgres-howtos/performance-optimization/monitoring/pg-stat-statements-part-1.md'
  },
  // 6. benchmark to new Benchmarks subcategory
  {
    from: 'docs/postgres-howtos/performance-optimization/indexing/how-to-benchmark.md',
    to: 'docs/postgres-howtos/performance-optimization/benchmarks/how-to-benchmark.md'
  },
  // 7. heavyweight locks to Performance/Monitoring
  {
    from: 'docs/postgres-howtos/performance-optimization/indexing/how-to-analyze-heavyweight-locks-part-1.md',
    to: 'docs/postgres-howtos/performance-optimization/monitoring/how-to-analyze-heavyweight-locks-part-1.md'
  },
  // 8. metadata to misc
  {
    from: 'docs/postgres-howtos/performance-optimization/indexing/how-to-work-with-metadata.md',
    to: 'docs/postgres-howtos/advanced-topics/misc/how-to-work-with-metadata.md'
  },
  // compile postgres to misc
  {
    from: 'docs/postgres-howtos/performance-optimization/indexing/how-to-compile-postgres-on-ubuntu-22.04.md',
    to: 'docs/postgres-howtos/advanced-topics/misc/how-to-compile-postgres-on-ubuntu-22.04.md'
  },
  // pre-post benchmark to Benchmarks
  {
    from: 'docs/postgres-howtos/performance-optimization/indexing/pre-and-post-steps-for-benchmark-iterations.md',
    to: 'docs/postgres-howtos/performance-optimization/benchmarks/pre-and-post-steps-for-benchmark-iterations.md'
  },
  // 9. streaming replication lag to Advanced/Replication
  {
    from: 'docs/postgres-howtos/performance-optimization/statistics/how-to-troubleshoot-streaming-replication-lag.md',
    to: 'docs/postgres-howtos/advanced-topics/replication/how-to-troubleshoot-streaming-replication-lag.md'
  },
  // 10. ANALYZE to Database administration/Maintenance
  {
    from: 'docs/postgres-howtos/performance-optimization/statistics/how-to-run-analyze.md',
    to: 'docs/postgres-howtos/database-administration/maintenance/how-to-run-analyze.md'
  },
  // Move existing monitoring files to new monitoring directory
  {
    from: 'docs/postgres-howtos/performance-optimization/statistics/ad-hoc-monitoring.md',
    to: 'docs/postgres-howtos/performance-optimization/monitoring/ad-hoc-monitoring.md'
  },
  {
    from: 'docs/postgres-howtos/performance-optimization/statistics/how-to-monitor-transaction-id-wraparound-risks.md',
    to: 'docs/postgres-howtos/performance-optimization/monitoring/how-to-monitor-transaction-id-wraparound-risks.md'
  },
  {
    from: 'docs/postgres-howtos/performance-optimization/statistics/how-to-monitor-xmin-horizon.md',
    to: 'docs/postgres-howtos/performance-optimization/monitoring/how-to-monitor-xmin-horizon.md'
  }
];

// Create directories if needed
const dirsToCreate = [
  'docs/postgres-howtos/performance-optimization/monitoring',
  'docs/postgres-howtos/performance-optimization/benchmarks'
];

dirsToCreate.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Move files
let movedCount = 0;
let notFoundCount = 0;

moves.forEach(move => {
  const fromPath = path.join(__dirname, '..', move.from);
  const toPath = path.join(__dirname, '..', move.to);
  
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`✓ Moved: ${move.from} -> ${move.to}`);
    movedCount++;
  } else {
    console.log(`⚠️  File not found: ${move.from}`);
    notFoundCount++;
  }
});

// Rename statistics directory to monitoring
const oldStatsIndex = path.join(__dirname, '../docs/postgres-howtos/performance-optimization/statistics/index.md');
const newMonitoringIndex = path.join(__dirname, '../docs/postgres-howtos/performance-optimization/monitoring/index.md');

if (fs.existsSync(oldStatsIndex) && !fs.existsSync(newMonitoringIndex)) {
  fs.renameSync(oldStatsIndex, newMonitoringIndex);
  console.log('✓ Moved statistics index to monitoring index');
}

// Update the monitoring index content
const monitoringIndexPath = path.join(__dirname, '../docs/postgres-howtos/performance-optimization/monitoring/index.md');
if (fs.existsSync(monitoringIndexPath)) {
  let content = fs.readFileSync(monitoringIndexPath, 'utf8');
  content = content.replace(/Monitoring & statistics/g, 'Monitoring');
  content = content.replace(/monitoring and statistics/gi, 'monitoring');
  fs.writeFileSync(monitoringIndexPath, content);
  console.log('✓ Updated monitoring index title');
}

// Create benchmarks index
const benchmarksIndexContent = `---
title: "Benchmarks"
description: "Techniques and tools for benchmarking PostgreSQL performance"
---

# Benchmarks

Learn how to properly benchmark PostgreSQL performance to make data-driven optimization decisions.

## Articles in this section

- [How to benchmark](how-to-benchmark) - Comprehensive guide to PostgreSQL benchmarking
- [Pre- and post-steps for benchmark iterations](pre-and-post-steps-for-benchmark-iterations) - Essential steps for reliable benchmark results
`;

const benchmarksIndexPath = path.join(__dirname, '../docs/postgres-howtos/performance-optimization/benchmarks/index.md');
fs.writeFileSync(benchmarksIndexPath, benchmarksIndexContent);
console.log('✓ Created benchmarks index');

// Look for pg_stat_statements parts 2 and 3
console.log('\nSearching for pg_stat_statements parts 2 and 3...');
const pgssPatterns = ['*pg-stat-statements*', '*pg_stat_statements*'];
const pgssFiles = [];

pgssPatterns.forEach(pattern => {
  const findCmd = `find ${path.join(__dirname, '../docs/postgres-howtos')} -name "${pattern}" -type f`;
  try {
    const results = require('child_process')
      .execSync(findCmd, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(f => f);
    pgssFiles.push(...results);
  } catch (e) {
    // Ignore errors
  }
});

if (pgssFiles.length > 0) {
  console.log('Found pg_stat_statements files:');
  pgssFiles.forEach(file => {
    console.log(`  - ${file}`);
    // Move parts 2 and 3 if found
    if (file.includes('part-2') || file.includes('part-3')) {
      const filename = path.basename(file);
      const targetPath = path.join(__dirname, '../docs/postgres-howtos/performance-optimization/monitoring', filename);
      if (!fs.existsSync(targetPath)) {
        fs.renameSync(file, targetPath);
        console.log(`  ✓ Moved to monitoring: ${filename}`);
      }
    }
  });
}

console.log(`\n✅ Reorganization complete!`);
console.log(`   - Files moved: ${movedCount}`);
console.log(`   - Files not found: ${notFoundCount}`);