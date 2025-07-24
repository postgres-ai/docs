const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const docsDir = path.join(__dirname, '..', 'docs', 'postgres-howtos');

// Define subcategories and their metadata
const subcategories = [
  {
    path: 'performance-optimization/query-tuning',
    title: 'Query tuning',
    description: 'Optimize query performance with EXPLAIN ANALYZE, execution plans, and performance tuning techniques'
  },
  {
    path: 'performance-optimization/indexing',
    title: 'Indexing',
    description: 'Index creation, maintenance, monitoring, and optimization strategies'
  },
  {
    path: 'performance-optimization/statistics',
    title: 'Monitoring & statistics',
    description: 'Monitor database performance, analyze statistics, and track system metrics'
  },
  {
    path: 'database-administration/backup-recovery',
    title: 'Backup & recovery',
    description: 'Backup strategies, recovery procedures, and data migration techniques'
  },
  {
    path: 'database-administration/configuration',
    title: 'Configuration',
    description: 'PostgreSQL and system configuration for optimal performance'
  },
  {
    path: 'database-administration/maintenance',
    title: 'Maintenance',
    description: 'Database maintenance tasks, vacuum strategies, and bloat management'
  },
  {
    path: 'monitoring-troubleshooting/system-monitoring',
    title: 'System monitoring',
    description: 'Monitor replication, WAL generation, and system health'
  },
  {
    path: 'monitoring-troubleshooting/lock-analysis',
    title: 'Lock analysis',
    description: 'Analyze and resolve locking issues and deadlocks'
  },
  {
    path: 'monitoring-troubleshooting/troubleshooting',
    title: 'Troubleshooting',
    description: 'Troubleshoot common issues and performance problems'
  },
  {
    path: 'schema-design/ddl-operations',
    title: 'DDL operations',
    description: 'Safe schema changes, column management, and zero-downtime migrations'
  },
  {
    path: 'schema-design/data-types',
    title: 'Data types',
    description: 'Choose and optimize data types for your use case'
  },
  {
    path: 'schema-design/constraints',
    title: 'Constraints',
    description: 'Foreign keys, check constraints, and data integrity'
  },
  {
    path: 'development-tools/psql',
    title: 'psql',
    description: 'Master the PostgreSQL command-line interface'
  },
  {
    path: 'development-tools/sql-techniques',
    title: 'SQL techniques',
    description: 'Advanced SQL patterns and query techniques'
  },
  {
    path: 'development-tools/client-tools',
    title: 'Client tools',
    description: 'PostgreSQL client tools and utilities'
  },
  {
    path: 'advanced-topics/internals',
    title: 'Internals',
    description: 'PostgreSQL internals, storage, and low-level optimizations'
  },
  {
    path: 'advanced-topics/extensions',
    title: 'Extensions',
    description: 'PostgreSQL extensions and advanced features'
  },
  {
    path: 'advanced-topics/replication',
    title: 'Replication',
    description: 'Replication setup, monitoring, and troubleshooting'
  }
];

// Function to get all markdown files in a directory
function getMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  return files
    .filter(file => file.endsWith('.md') && file !== 'index.md')
    .map(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data } = matter(content);
      return {
        file,
        title: data.title || file.replace('.md', '').replace(/-/g, ' '),
        slug: data.slug || file.replace('.md', ''),
        description: data.description || '',
        difficulty: data.difficulty || 'intermediate',
        estimated_time: data.estimated_time || ''
      };
    })
    .sort((a, b) => a.file.localeCompare(b.file));
}

// Create index page for each subcategory
subcategories.forEach(subcat => {
  const dirPath = path.join(docsDir, subcat.path);
  const indexPath = path.join(dirPath, 'index.md');
  
  // Get all how-tos in this subcategory
  const howtos = getMarkdownFiles(dirPath);
  
  // Generate the index content
  let content = `---
title: ${subcat.title}
sidebar_label: ${subcat.title}
description: ${subcat.description}
---

# ${subcat.title}

${subcat.description}

## How-to guides

`;

  // Add each how-to as a list item
  howtos.forEach(howto => {
    const link = `/docs/postgres-howtos/${subcat.path}/${howto.slug}`;
    let item = `### [${howto.title}](${link})\n`;
    if (howto.description) {
      item += `${howto.description}\n`;
    }
    if (howto.difficulty || howto.estimated_time) {
      item += `<small>`;
      if (howto.difficulty) item += `**Difficulty**: ${howto.difficulty}`;
      if (howto.difficulty && howto.estimated_time) item += ' • ';
      if (howto.estimated_time) item += `**Time**: ${howto.estimated_time}`;
      item += `</small>\n`;
    }
    item += '\n';
    content += item;
  });

  // Write the index file
  fs.writeFileSync(indexPath, content);
  console.log(`Created index for ${subcat.path} with ${howtos.length} how-tos`);
});

console.log('All subcategory index pages created!');