const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const docsDir = path.join(__dirname, '..', 'docs', 'postgres-howtos');

// Define subcategories
const subcategories = [
  'performance-optimization/query-tuning',
  'performance-optimization/indexing',
  'performance-optimization/statistics',
  'database-administration/backup-recovery',
  'database-administration/configuration',
  'database-administration/maintenance',
  'monitoring-troubleshooting/system-monitoring',
  'monitoring-troubleshooting/lock-analysis',
  'monitoring-troubleshooting/troubleshooting',
  'schema-design/ddl-operations',
  'schema-design/data-types',
  'schema-design/constraints',
  'development-tools/psql',
  'development-tools/sql-techniques',
  'development-tools/client-tools',
  'advanced-topics/internals',
  'advanced-topics/extensions',
  'advanced-topics/replication'
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

// Update each subcategory index
subcategories.forEach(subcat => {
  const dirPath = path.join(docsDir, subcat);
  const indexPath = path.join(dirPath, 'index.md');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`Skipping ${subcat} - index.md not found`);
    return;
  }
  
  // Read the existing index file to preserve frontmatter
  const existingContent = fs.readFileSync(indexPath, 'utf8');
  const { data: frontmatter } = matter(existingContent);
  
  // Get all how-tos in this subcategory
  const howtos = getMarkdownFiles(dirPath);
  
  // Generate the new content
  let content = `---
title: ${frontmatter.title}
sidebar_label: ${frontmatter.sidebar_label}
description: ${frontmatter.description}
---

# ${frontmatter.title}

${frontmatter.description}

## How-to guides

`;

  // Add each how-to as a list item
  howtos.forEach(howto => {
    const link = `/docs/postgres-howtos/${subcat}/${howto.slug}`;
    let item = `### [${howto.title}](${link})\n`;
    if (howto.description) {
      item += `${howto.description}\n`;
    }
    if (howto.difficulty || howto.estimated_time) {
      item += '\n*';
      if (howto.difficulty) item += `Difficulty: ${howto.difficulty}`;
      if (howto.difficulty && howto.estimated_time) item += ' • ';
      if (howto.estimated_time) item += `Time: ${howto.estimated_time}`;
      item += '*\n';
    }
    item += '\n';
    content += item;
  });

  // Write the updated file
  fs.writeFileSync(indexPath, content);
  console.log(`Updated ${subcat}/index.md`);
});

console.log('All subcategory index pages updated!');