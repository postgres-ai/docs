#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

const categoryInfo = {
  'performance-optimization': {
    title: 'Performance & Optimization',
    description: 'Master PostgreSQL performance optimization with practical guides covering query tuning, indexing strategies, and system optimization.',
    subcategories: {
      'query-tuning': {
        title: 'Query Tuning',
        description: 'Learn how to analyze and optimize slow queries using EXPLAIN, pg_stat_statements, and other powerful tools.'
      },
      'indexing': {
        title: 'Indexing',
        description: 'Discover best practices for creating and maintaining efficient indexes, including B-tree, GiST, and other index types.'
      },
      'statistics': {
        title: 'Monitoring & Statistics',
        description: 'Understand how to monitor system performance and use database statistics for optimal query planning.'
      }
    }
  },
  'database-administration': {
    title: 'Database Administration',
    description: 'Essential guides for PostgreSQL database administrators covering maintenance, backups, and configuration.',
    subcategories: {
      'maintenance': {
        title: 'Maintenance',
        description: 'Learn vacuum strategies, bloat management, and routine maintenance tasks.'
      },
      'backup-recovery': {
        title: 'Backup & Recovery',
        description: 'Master backup strategies, disaster recovery, and data protection techniques.'
      },
      'configuration': {
        title: 'Configuration',
        description: 'Optimize PostgreSQL settings for your workload and hardware.'
      }
    }
  },
  'monitoring-troubleshooting': {
    title: 'Monitoring & Troubleshooting',
    description: 'Tools and techniques for monitoring PostgreSQL and solving common problems.',
    subcategories: {
      'system-monitoring': {
        title: 'System Monitoring',
        description: 'Track database health, performance metrics, and resource usage.'
      },
      'lock-analysis': {
        title: 'Lock Analysis',
        description: 'Understand and resolve locking issues and deadlocks.'
      },
      'troubleshooting': {
        title: 'Troubleshooting',
        description: 'Diagnose and fix common PostgreSQL problems.'
      }
    }
  },
  'schema-design': {
    title: 'Schema Design',
    description: 'Best practices for designing efficient PostgreSQL schemas and managing database objects.',
    subcategories: {
      'ddl-operations': {
        title: 'DDL Operations',
        description: 'Safely perform schema changes with minimal downtime.'
      },
      'data-types': {
        title: 'Data Types',
        description: 'Choose the right data types and understand their performance implications.'
      },
      'constraints': {
        title: 'Constraints',
        description: 'Implement and manage database constraints effectively.'
      }
    }
  },
  'development-tools': {
    title: 'Development Tools',
    description: 'Essential tools and techniques for PostgreSQL developers.',
    subcategories: {
      'psql': {
        title: 'psql',
        description: 'Master the PostgreSQL command-line interface.'
      },
      'sql-techniques': {
        title: 'SQL Techniques',
        description: 'Advanced SQL patterns and best practices.'
      },
      'client-tools': {
        title: 'Client Tools',
        description: 'Work effectively with PostgreSQL client applications.'
      }
    }
  },
  'advanced-topics': {
    title: 'Advanced Topics',
    description: 'Deep dives into PostgreSQL internals, extensions, and advanced features.',
    subcategories: {
      'internals': {
        title: 'Internals',
        description: 'Understand how PostgreSQL works under the hood.'
      },
      'extensions': {
        title: 'Extensions',
        description: 'Extend PostgreSQL functionality with powerful extensions.'
      },
      'replication': {
        title: 'Replication',
        description: 'Set up and manage PostgreSQL replication.'
      }
    }
  }
};

function getArticleInfo(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const titleMatch = content.match(/^title:\s*"?([^"\n]+)"?$/m);
  const descriptionMatch = content.match(/^description:\s*"?([^"\n]+)"?$/m);
  const slugMatch = content.match(/^slug:\s*(.+)$/m);
  const difficultyMatch = content.match(/^difficulty:\s*(.+)$/m);
  const timeMatch = content.match(/^estimated_time:\s*(.+)$/m);
  
  const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md');
  const description = descriptionMatch ? descriptionMatch[1].trim() : '';
  const slug = slugMatch ? slugMatch[1].trim() : path.basename(filePath, '.md');
  const difficulty = difficultyMatch ? difficultyMatch[1].trim() : 'intermediate';
  const time = timeMatch ? timeMatch[1].trim() : '';
  
  return { title, description, slug, difficulty, time };
}

function generateCategoryPage(category, categoryPath) {
  const info = categoryInfo[category];
  if (!info) return;
  
  let content = `---
title: ${info.title}
sidebar_label: ${info.title}
description: ${info.description}
---

# ${info.title}

${info.description}

## Guides by Category

`;

  // Process each subcategory
  for (const [subcat, subcatInfo] of Object.entries(info.subcategories)) {
    const subcatPath = path.join(categoryPath, subcat);
    if (!fs.existsSync(subcatPath)) continue;
    
    // Update subcategory name in sidebars if it's statistics
    if (subcat === 'statistics' && category === 'performance-optimization') {
      // This will be handled in the sidebar update
    }
    
    const articles = glob.sync(path.join(subcatPath, '*.md'))
      .filter(f => !f.endsWith('index.md'));
    
    if (articles.length === 0) continue;
    
    content += `### ${subcatInfo.title}

${subcatInfo.description}

`;
    
    articles.forEach(articlePath => {
      const articleInfo = getArticleInfo(articlePath);
      // Use the actual slug from the file, not the filename
      const relativePath = `${category}/${subcat}/${articleInfo.slug}`;
      
      content += `- [${articleInfo.title}](/docs/postgres-howtos/${relativePath})`;
      if (articleInfo.time) {
        content += ` - ${articleInfo.time}`;
      }
      if (articleInfo.difficulty && articleInfo.difficulty !== 'intermediate') {
        content += ` *(${articleInfo.difficulty})*`;
      }
      content += '\n';
    });
    
    content += '\n';
  }
  
  const indexPath = path.join(categoryPath, 'index.md');
  fs.writeFileSync(indexPath, content);
  console.log(`✓ Updated ${category}/index.md`);
}

// Update all category pages
Object.keys(categoryInfo).forEach(category => {
  const categoryPath = path.join(HOWTOS_DIR, category);
  if (fs.existsSync(categoryPath)) {
    generateCategoryPage(category, categoryPath);
  }
});

// Also update the subcategory index for statistics
const statsIndexPath = path.join(HOWTOS_DIR, 'performance-optimization/statistics/index.md');
if (fs.existsSync(statsIndexPath)) {
  const statsContent = `---
title: Monitoring & Statistics
sidebar_label: Monitoring & Statistics
description: Understand how to monitor system performance and use database statistics for optimal query planning
---

# Monitoring & Statistics

Learn how to monitor PostgreSQL performance metrics, track system statistics, and use this data to optimize your database.

## Available Guides

`;

  const statsArticles = glob.sync(path.join(HOWTOS_DIR, 'performance-optimization/statistics/*.md'))
    .filter(f => !f.endsWith('index.md'));
  
  statsArticles.forEach(articlePath => {
    const articleInfo = getArticleInfo(articlePath);
    statsContent += `- [${articleInfo.title}](/docs/postgres-howtos/performance-optimization/statistics/${articleInfo.slug})`;
    if (articleInfo.time) {
      statsContent += ` - ${articleInfo.time}`;
    }
    statsContent += '\n';
  });
  
  fs.writeFileSync(statsIndexPath, statsContent);
  console.log('✓ Updated statistics subcategory to "Monitoring & Statistics"');
}

console.log('\n✅ Category pages updated successfully');