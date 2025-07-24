#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

// Read article frontmatter to get title
function getArticleTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const titleMatch = content.match(/^title:\s*"(.+)"/m);
  return titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
}

// Generate sidebar entries for a directory
function generateSidebarEntries(dir, baseId) {
  const files = fs.readdirSync(dir).sort();
  const entries = [];
  
  for (const file of files) {
    if (!file.endsWith('.md') || file === 'index.md') continue;
    
    const filePath = path.join(dir, file);
    const fileId = path.join(baseId, file.replace('.md', ''));
    
    // Get article title from frontmatter
    const title = getArticleTitle(filePath);
    
    entries.push(`            "${fileId}",`);
  }
  
  return entries;
}

function generateSidebarConfig() {
  console.log('Generating sidebar configuration for PostgreSQL how-tos...\n');
  
  const categories = [
    {
      label: 'Performance & Optimization',
      id: 'performance-optimization',
      subcategories: [
        { label: 'Query Tuning', id: 'query-tuning' },
        { label: 'Indexing', id: 'indexing' },
        { label: 'Statistics', id: 'statistics' }
      ]
    },
    {
      label: 'Database Administration',
      id: 'database-administration',
      subcategories: [
        { label: 'Maintenance', id: 'maintenance' },
        { label: 'Backup & Recovery', id: 'backup-recovery' },
        { label: 'Configuration', id: 'configuration' }
      ]
    },
    {
      label: 'Monitoring & Troubleshooting',
      id: 'monitoring-troubleshooting',
      subcategories: [
        { label: 'System Monitoring', id: 'system-monitoring' },
        { label: 'Lock Analysis', id: 'lock-analysis' },
        { label: 'Troubleshooting', id: 'troubleshooting' }
      ]
    },
    {
      label: 'Schema Design & DDL',
      id: 'schema-design',
      subcategories: [
        { label: 'DDL Operations', id: 'ddl-operations' },
        { label: 'Data Types', id: 'data-types' },
        { label: 'Constraints', id: 'constraints' }
      ]
    },
    {
      label: 'Development Tools',
      id: 'development-tools',
      subcategories: [
        { label: 'psql', id: 'psql' },
        { label: 'SQL Techniques', id: 'sql-techniques' },
        { label: 'Client Tools', id: 'client-tools' }
      ]
    },
    {
      label: 'Advanced Topics',
      id: 'advanced-topics',
      subcategories: [
        { label: 'Internals', id: 'internals' },
        { label: 'Extensions', id: 'extensions' },
        { label: 'Replication', id: 'replication' }
      ]
    }
  ];
  
  let output = '    "PostgreSQL how-tos": [\n';
  output += '      "postgres-howtos/index",\n';
  
  for (const category of categories) {
    output += '      {\n';
    output += '        type: "category",\n';
    output += `        label: "${category.label}",\n`;
    output += '        link: {\n';
    output += '          type: "doc",\n';
    output += `          id: "postgres-howtos/${category.id}/index",\n`;
    output += '        },\n';
    output += '        items: [\n';
    
    for (const subcat of category.subcategories) {
      const subcatDir = path.join(HOWTOS_DIR, category.id, subcat.id);
      const entries = generateSidebarEntries(subcatDir, `postgres-howtos/${category.id}/${subcat.id}`);
      
      if (entries.length > 0) {
        output += '          {\n';
        output += '            type: "category",\n';
        output += `            label: "${subcat.label}",\n`;
        output += '            items: [\n';
        output += entries.join('\n') + '\n';
        output += '            ],\n';
        output += '          },\n';
      }
    }
    
    output += '        ],\n';
    output += '      },\n';
  }
  
  output += '    ],';
  
  console.log(output);
  
  // Save to file
  const outputFile = path.join(__dirname, 'sidebar-postgres-howtos.js');
  fs.writeFileSync(outputFile, output);
  console.log(`\n✅ Sidebar configuration saved to: ${outputFile}`);
  console.log('\nCopy the contents above to replace the "PostgreSQL how-tos" section in sidebars.js');
}

if (require.main === module) {
  generateSidebarConfig();
}