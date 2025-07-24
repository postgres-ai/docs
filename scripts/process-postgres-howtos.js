#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const HOWTOS_SOURCE = path.join(__dirname, '../../postgres-howtos');
const HOWTOS_DEST = path.join(__dirname, '../docs/postgres-howtos');
const IMAGES_SOURCE = path.join(HOWTOS_SOURCE, 'files');
const IMAGES_DEST = path.join(__dirname, '../static/img/postgres-howtos');

// Articles to exclude
const EXCLUDE_ARTICLES = [
  '0025_how_to_quit_from_psql.md',
  '0082_how_to_draw_frost_patterns_using_sql.md'
];

// Article series to merge (will be handled separately)
const ARTICLE_SERIES = {
  'pg_stat_statements': [
    '0005_pg_stat_statements_part_1.md',
    '0006_pg_stat_statements_part_2.md',
    '0007_pg_stat_statements_part_3.md'
  ],
  'heavyweight_locks': [
    '0022_how_to_analyze_heavyweight_locks_part_1.md',
    '0042_how_to_analyze_heavyweight_locks_part_2.md',
    '0073_how_to_analyze_heavyweight_locks_part_3_persistent_monitoring.md'
  ],
  'arrays': [
    '0028_how_to_work_with_arrays_part_1.md',
    '0029_how_to_work_with_arrays_part_2.md'
  ],
  'break_database': [
    '0039_how_to_break_a_database_part_1_how_to_corrupt.md',
    '0040_how_to_break_a_database_part_2_simulate_xid_wraparound.md',
    '0041_harmful_workloads.md'
  ],
  'index_creation': [
    '0061_how_to_create_an_index_part_1.md',
    '0062_how_to_create_an_index_part_2.md'
  ],
  'btree_checking': [
    '0026_how_to_check_btree_indexes_for_corruption.md',
    '0054_how_to_check_btree_indexes_for_corruption.md'
  ]
};

// Category mapping based on article content
const CATEGORY_MAPPING = {
  'performance-optimization': {
    'query-tuning': [
      'explain_analyze',
      'query_optimization',
      'planner',
      'execution_plan'
    ],
    'indexing': [
      'index',
      'btree',
      'gist',
      'gin',
      'brin'
    ],
    'statistics': [
      'pg_stat',
      'statistics',
      'analyze',
      'vacuum'
    ]
  },
  'database-administration': {
    'maintenance': [
      'vacuum',
      'autovacuum',
      'maintenance',
      'cleanup'
    ],
    'backup-recovery': [
      'backup',
      'restore',
      'recovery',
      'pg_dump'
    ],
    'configuration': [
      'postgresql.conf',
      'configuration',
      'settings',
      'tuning'
    ]
  },
  'monitoring-troubleshooting': {
    'system-monitoring': [
      'monitoring',
      'metrics',
      'performance_monitoring'
    ],
    'lock-analysis': [
      'lock',
      'deadlock',
      'blocking'
    ],
    'troubleshooting': [
      'troubleshoot',
      'debug',
      'problem',
      'issue'
    ]
  },
  'schema-design': {
    'ddl-operations': [
      'alter_table',
      'create_table',
      'ddl',
      'schema_change'
    ],
    'data-types': [
      'data_type',
      'array',
      'json',
      'text',
      'numeric'
    ],
    'constraints': [
      'constraint',
      'foreign_key',
      'check',
      'unique'
    ]
  },
  'development-tools': {
    'psql': [
      'psql',
      'client',
      'command_line'
    ],
    'sql-techniques': [
      'sql',
      'query',
      'cte',
      'window_function'
    ],
    'client-tools': [
      'pgadmin',
      'client_tool',
      'connection'
    ]
  },
  'advanced-topics': {
    'internals': [
      'internal',
      'mvcc',
      'wal',
      'storage'
    ],
    'extensions': [
      'extension',
      'contrib',
      'module'
    ],
    'replication': [
      'replication',
      'streaming',
      'logical_replication'
    ]
  }
};

// Generate frontmatter from article content
function generateFrontmatter(filename, content) {
  // Extract title from first # heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  let title = titleMatch ? titleMatch[1] : filename.replace(/_/g, ' ').replace('.md', '');
  
  // Clean up title if it's the raw filename
  if (title.match(/^\d+\s+/)) {
    title = title.replace(/^\d+\s+/, '').replace(/_/g, ' ');
    // Capitalize words
    title = title.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
  
  // Generate sidebar label (shorter version)
  const sidebarLabel = title.replace(/How to /i, '').replace(/PostgreSQL|Postgres/gi, 'PG');
  
  // Extract description from first paragraph after title
  const descMatch = content.match(/^#.*\n\n([^\n]+)/m);
  const description = descMatch ? descMatch[1].substring(0, 160).replace(/\*|_/g, '') : `Learn how to ${title.toLowerCase()}`;
  
  // Determine difficulty based on content
  let difficulty = 'intermediate';
  if (content.toLowerCase().includes('basic') || content.toLowerCase().includes('simple')) {
    difficulty = 'beginner';
  } else if (content.toLowerCase().includes('advanced') || content.toLowerCase().includes('internal')) {
    difficulty = 'advanced';
  }
  
  // Estimate reading time (roughly 200 words per minute)
  const wordCount = content.split(/\s+/).length;
  const estimatedTime = Math.max(5, Math.ceil(wordCount / 200)) + ' min';
  
  // Generate keywords
  const keywords = [
    'postgresql',
    ...title.toLowerCase().split(/\s+/).filter(w => w.length > 3),
    difficulty
  ];
  
  return `---
title: "${title}"
sidebar_label: "${sidebarLabel}"
description: "${description}"
keywords: ${JSON.stringify(keywords)}
tags: ["${difficulty}"]
difficulty: ${difficulty}
estimated_time: "${estimatedTime}"
---

`;
}

// Determine category for an article
function determineCategory(filename, content) {
  const lowerContent = content.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  
  for (const [mainCat, subCats] of Object.entries(CATEGORY_MAPPING)) {
    for (const [subCat, keywords] of Object.entries(subCats)) {
      for (const keyword of keywords) {
        if (lowerFilename.includes(keyword) || lowerContent.includes(keyword)) {
          return { mainCat, subCat };
        }
      }
    }
  }
  
  // Default category
  return { mainCat: 'advanced-topics', subCat: 'internals' };
}

// Process individual article
function processArticle(filename, sourceDir, destDir) {
  const sourcePath = path.join(sourceDir, filename);
  let content = fs.readFileSync(sourcePath, 'utf8');
  
  // Remove social media links section
  content = content.replace(/\[.*twitter\.com.*\]\(.*\)\s*\n\s*\[.*linkedin\.com.*\]\(.*\)\s*\n---\n/i, '');
  
  // Update image paths
  content = content.replace(/!\[([^\]]*)\]\(files\/([^)]+)\)/g, '![$1](/img/postgres-howtos/$2)');
  
  // Add frontmatter
  const frontmatter = generateFrontmatter(filename, content);
  content = frontmatter + content;
  
  // Determine category
  const { mainCat, subCat } = determineCategory(filename, content);
  const categoryDir = path.join(destDir, mainCat, subCat);
  
  // Ensure directory exists
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
  
  // Generate clean filename
  const cleanName = filename
    .replace(/^\\d+_/, '') // Remove number prefix
    .replace(/_/g, '-'); // Replace underscores with hyphens
  
  const destPath = path.join(categoryDir, cleanName);
  fs.writeFileSync(destPath, content);
  
  return { mainCat, subCat, filename: cleanName };
}

// Main processing function
async function processHowtos() {
  console.log('Starting PostgreSQL how-tos processing...');
  
  // Ensure destination directories exist
  if (!fs.existsSync(IMAGES_DEST)) {
    fs.mkdirSync(IMAGES_DEST, { recursive: true });
  }
  
  // Copy images
  if (fs.existsSync(IMAGES_SOURCE)) {
    console.log('Copying images...');
    const images = fs.readdirSync(IMAGES_SOURCE);
    for (const image of images) {
      fs.copyFileSync(
        path.join(IMAGES_SOURCE, image),
        path.join(IMAGES_DEST, image)
      );
    }
    console.log(`Copied ${images.length} images`);
  }
  
  // Get all markdown files
  const allFiles = fs.readdirSync(HOWTOS_SOURCE)
    .filter(f => f.endsWith('.md'))
    .filter(f => !EXCLUDE_ARTICLES.includes(f));
  
  // Separate series articles from individual articles
  const seriesFiles = new Set();
  Object.values(ARTICLE_SERIES).forEach(series => {
    series.forEach(file => seriesFiles.add(file));
  });
  
  const individualFiles = allFiles.filter(f => !seriesFiles.has(f));
  
  // Process individual articles
  console.log(`\\nProcessing ${individualFiles.length} individual articles...`);
  const processedArticles = [];
  
  for (const file of individualFiles) {
    try {
      const result = processArticle(file, HOWTOS_SOURCE, HOWTOS_DEST);
      processedArticles.push(result);
      console.log(`✓ Processed: ${file} -> ${result.mainCat}/${result.subCat}/${result.filename}`);
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }
  
  // TODO: Process article series (merge them)
  console.log(`\\n⚠️  Article series merging not yet implemented. ${Object.keys(ARTICLE_SERIES).length} series need manual processing.`);
  
  // Generate summary
  console.log(`\\n✅ Processing complete!`);
  console.log(`   - Individual articles processed: ${processedArticles.length}`);
  console.log(`   - Articles excluded: ${EXCLUDE_ARTICLES.length}`);
  console.log(`   - Series to merge: ${Object.keys(ARTICLE_SERIES).length}`);
  
  // Update sidebar configuration
  console.log(`\\n📝 Don't forget to update sidebars.js with the processed articles!`);
}

// Run the script
if (require.main === module) {
  processHowtos().catch(console.error);
}

module.exports = { processHowtos, generateFrontmatter, determineCategory, processArticle };