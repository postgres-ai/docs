const fs = require('fs');
const path = require('path');

// Define which articles have been moved and where
const movedArticles = {
  // From query-tuning
  'flamegraphs-for-postgres': {
    from: 'performance-optimization/query-tuning',
    to: 'monitoring-troubleshooting/system-monitoring'
  },
  'how-to-help-others': {
    from: 'performance-optimization/query-tuning',
    to: 'advanced-topics/misc'
  },
  'rough-oltp-configuration-tuning': {
    from: 'performance-optimization/query-tuning',
    to: 'database-administration/configuration'
  },
  'how-to-tune-work-mem': {
    from: 'performance-optimization/query-tuning',
    to: 'database-administration/configuration'
  },
  // From indexing
  'pg-stat-statements-part-1': {
    from: 'performance-optimization/indexing',
    to: 'performance-optimization/monitoring'
  },
  'how-to-benchmark': {
    from: 'performance-optimization/indexing',
    to: 'performance-optimization/benchmarks'
  },
  'how-to-analyze-heavyweight-locks-part-1': {
    from: 'performance-optimization/indexing',
    to: 'performance-optimization/monitoring'
  },
  'how-to-work-with-metadata': {
    from: 'performance-optimization/indexing',
    to: 'advanced-topics/misc'
  },
  'how-to-compile-postgres-on-ubuntu-22.04': {
    from: 'performance-optimization/indexing',
    to: 'advanced-topics/misc'
  },
  'pre-and-post-steps-for-benchmark-iterations': {
    from: 'performance-optimization/indexing',
    to: 'performance-optimization/benchmarks'
  },
  // From statistics
  'how-to-troubleshoot-streaming-replication-lag': {
    from: 'performance-optimization/statistics',
    to: 'advanced-topics/replication'
  },
  'how-to-run-analyze': {
    from: 'performance-optimization/statistics',
    to: 'database-administration/maintenance'
  },
  // From backup-recovery
  'how-to-enable-data-checksums-without-downtime': {
    from: 'database-administration/backup-recovery',
    to: 'database-administration/maintenance'
  },
  // From configuration
  'how-to-troubleshoot-and-speedup-postgres-restarts': {
    from: 'database-administration/configuration',
    to: 'database-administration/maintenance'
  },
  'how-to-troubleshoot-long-startup': {
    from: 'database-administration/configuration',
    to: 'database-administration/maintenance'
  },
  // From system-monitoring
  'how-to-troubleshoot-a-growing-pg-wal-directory': {
    from: 'monitoring-troubleshooting/system-monitoring',
    to: 'database-administration/maintenance'
  },
  'how-to-reduce-wal-generation-rates': {
    from: 'monitoring-troubleshooting/system-monitoring',
    to: 'performance-optimization/monitoring'
  },
  // From data-types
  'how-to-change-postgres-parameter': {
    from: 'schema-design/data-types',
    to: 'database-administration/configuration'
  }
};

// Function to update index pages for destination categories
function updateDestinationIndexes() {
  // Group moved articles by their destination
  const articlesByDestination = {};
  
  for (const [filename, move] of Object.entries(movedArticles)) {
    if (!articlesByDestination[move.to]) {
      articlesByDestination[move.to] = [];
    }
    articlesByDestination[move.to].push(filename);
  }
  
  // Update monitoring index to include new articles
  const monitoringIndexPath = path.join(__dirname, '../docs/postgres-howtos/performance-optimization/monitoring/index.md');
  if (fs.existsSync(monitoringIndexPath)) {
    let content = fs.readFileSync(monitoringIndexPath, 'utf8');
    
    // Add articles if not already present
    const articlesToAdd = [
      {
        file: 'pg-stat-statements-part-1',
        title: 'How to work with pg_stat_statements, part 1',
        difficulty: 'beginner',
        time: '8 min'
      },
      {
        file: 'how-to-analyze-heavyweight-locks-part-1',
        title: 'How to analyze heavyweight locks, part 1',
        difficulty: 'beginner',
        time: '5 min'
      },
      {
        file: 'how-to-reduce-wal-generation-rates',
        title: 'How to reduce WAL generation rates',
        difficulty: 'intermediate',
        time: '5 min'
      }
    ];
    
    // Find where to insert (after ## How-to guides)
    const insertPoint = content.indexOf('## How-to guides') + '## How-to guides'.length;
    let insertText = '';
    
    articlesToAdd.forEach(article => {
      if (!content.includes(article.file)) {
        insertText += `\n\n### [${article.title}](/docs/postgres-howtos/performance-optimization/monitoring/${article.file})\n\n*Difficulty: ${article.difficulty} • Time: ${article.time}*`;
      }
    });
    
    if (insertText) {
      content = content.slice(0, insertPoint) + insertText + content.slice(insertPoint);
      fs.writeFileSync(monitoringIndexPath, content);
      console.log('✓ Updated monitoring index');
    }
  }
  
  // Update benchmarks index (already created in previous script)
  
  // Update misc index
  const miscIndexPath = path.join(__dirname, '../docs/postgres-howtos/advanced-topics/misc/index.md');
  if (fs.existsSync(miscIndexPath)) {
    let content = fs.readFileSync(miscIndexPath, 'utf8');
    
    const articlesToAdd = [
      {
        file: 'how-to-help-others',
        title: 'How to help others',
        difficulty: 'beginner',
        time: '5 min'
      },
      {
        file: 'how-to-work-with-metadata',
        title: 'How to work with metadata',
        difficulty: 'beginner',
        time: '5 min'
      },
      {
        file: 'how-to-compile-postgres-on-ubuntu-22.04',
        title: 'How to compile Postgres on Ubuntu 22.04',
        difficulty: 'beginner',
        time: '5 min'
      }
    ];
    
    const insertPoint = content.lastIndexOf('\n');
    let insertText = '';
    
    articlesToAdd.forEach(article => {
      if (!content.includes(article.file)) {
        insertText += `\n### [${article.title}](/docs/postgres-howtos/advanced-topics/misc/${article.file})\n\n*Difficulty: ${article.difficulty} • Time: ${article.time}*\n`;
      }
    });
    
    if (insertText) {
      content = content.slice(0, insertPoint) + insertText + content.slice(insertPoint);
      fs.writeFileSync(miscIndexPath, content);
      console.log('✓ Updated misc index');
    }
  }
  
  // Update configuration index
  const configIndexPath = path.join(__dirname, '../docs/postgres-howtos/database-administration/configuration/index.md');
  if (fs.existsSync(configIndexPath)) {
    let content = fs.readFileSync(configIndexPath, 'utf8');
    
    const articlesToAdd = [
      {
        file: 'rough-oltp-configuration-tuning',
        title: 'Rough configuration tuning (80/20 rule; OLTP)',
        difficulty: 'beginner',
        time: '5 min'
      },
      {
        file: 'how-to-tune-work-mem',
        title: 'How to tune work_mem',
        difficulty: 'intermediate',
        time: '5 min'
      },
      {
        file: 'how-to-change-postgres-parameter',
        title: 'How to change Postgres parameters',
        difficulty: 'beginner',
        time: '5 min'
      }
    ];
    
    const insertPoint = content.lastIndexOf('\n');
    let insertText = '';
    
    articlesToAdd.forEach(article => {
      if (!content.includes(article.file)) {
        insertText += `\n### [${article.title}](/docs/postgres-howtos/database-administration/configuration/${article.file})\n\n*Difficulty: ${article.difficulty} • Time: ${article.time}*\n`;
      }
    });
    
    if (insertText) {
      content = content.slice(0, insertPoint) + insertText + content.slice(insertPoint);
      fs.writeFileSync(configIndexPath, content);
      console.log('✓ Updated configuration index');
    }
  }
  
  // Update maintenance index
  const maintenanceIndexPath = path.join(__dirname, '../docs/postgres-howtos/database-administration/maintenance/index.md');
  if (fs.existsSync(maintenanceIndexPath)) {
    let content = fs.readFileSync(maintenanceIndexPath, 'utf8');
    
    const articlesToAdd = [
      {
        file: 'how-to-run-analyze',
        title: 'How to run ANALYZE (to collect statistics)',
        difficulty: 'beginner',
        time: '5 min'
      },
      {
        file: 'how-to-enable-data-checksums-without-downtime',
        title: 'How to enable data checksums without downtime',
        difficulty: 'advanced',
        time: '7 min'
      },
      {
        file: 'how-to-troubleshoot-and-speedup-postgres-restarts',
        title: 'How to troubleshoot and speed up Postgres stop and restart attempts',
        difficulty: 'intermediate',
        time: '5 min'
      },
      {
        file: 'how-to-troubleshoot-long-startup',
        title: 'How to troubleshoot long Postgres startup',
        difficulty: 'intermediate',
        time: '5 min'
      },
      {
        file: 'how-to-troubleshoot-a-growing-pg-wal-directory',
        title: 'How to troubleshoot a growing pg_wal directory',
        difficulty: 'intermediate',
        time: '6 min'
      }
    ];
    
    const insertPoint = content.lastIndexOf('\n');
    let insertText = '';
    
    articlesToAdd.forEach(article => {
      if (!content.includes(article.file)) {
        insertText += `\n### [${article.title}](/docs/postgres-howtos/database-administration/maintenance/${article.file})\n\n*Difficulty: ${article.difficulty} • Time: ${article.time}*\n`;
      }
    });
    
    if (insertText) {
      content = content.slice(0, insertPoint) + insertText + content.slice(insertPoint);
      fs.writeFileSync(maintenanceIndexPath, content);
      console.log('✓ Updated maintenance index');
    }
  }
  
  // Update replication index
  const replicationIndexPath = path.join(__dirname, '../docs/postgres-howtos/advanced-topics/replication/index.md');
  if (fs.existsSync(replicationIndexPath)) {
    let content = fs.readFileSync(replicationIndexPath, 'utf8');
    
    const articlesToAdd = [
      {
        file: 'how-to-troubleshoot-streaming-replication-lag',
        title: 'How to troubleshoot streaming replication lag',
        difficulty: 'intermediate',
        time: '5 min'
      }
    ];
    
    const insertPoint = content.lastIndexOf('\n');
    let insertText = '';
    
    articlesToAdd.forEach(article => {
      if (!content.includes(article.file)) {
        insertText += `\n### [${article.title}](/docs/postgres-howtos/advanced-topics/replication/${article.file})\n\n*Difficulty: ${article.difficulty} • Time: ${article.time}*\n`;
      }
    });
    
    if (insertText) {
      content = content.slice(0, insertPoint) + insertText + content.slice(insertPoint);
      fs.writeFileSync(replicationIndexPath, content);
      console.log('✓ Updated replication index');
    }
  }
  
  // Update system-monitoring index
  const sysMonIndexPath = path.join(__dirname, '../docs/postgres-howtos/monitoring-troubleshooting/system-monitoring/index.md');
  if (fs.existsSync(sysMonIndexPath)) {
    let content = fs.readFileSync(sysMonIndexPath, 'utf8');
    
    const articlesToAdd = [
      {
        file: 'flamegraphs-for-postgres',
        title: 'How to troubleshoot Postgres performance using FlameGraphs and eBPF (or perf)',
        difficulty: 'beginner',
        time: '6 min'
      }
    ];
    
    const insertPoint = content.indexOf('## How-to guides') + '## How-to guides'.length;
    let insertText = '';
    
    articlesToAdd.forEach(article => {
      if (!content.includes(article.file)) {
        insertText += `\n\n### [${article.title}](/docs/postgres-howtos/monitoring-troubleshooting/system-monitoring/${article.file})\n\n*Difficulty: ${article.difficulty} • Time: ${article.time}*`;
      }
    });
    
    if (insertText) {
      content = content.slice(0, insertPoint) + insertText + content.slice(insertPoint);
      fs.writeFileSync(sysMonIndexPath, content);
      console.log('✓ Updated system-monitoring index');
    }
  }
}

// Run the updates
updateDestinationIndexes();

console.log('\n✅ Category index updates complete!');