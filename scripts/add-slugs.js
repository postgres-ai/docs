#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

function addSlugToFrontmatter(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract filename without extension
  const filename = path.basename(filePath, '.md');
  
  // Generate slug by removing number prefix
  const slug = filename.replace(/^\d+[-_]/, '');
  
  // Check if slug already exists
  if (content.includes('\nslug:')) {
    return false;
  }
  
  // Add slug after title in frontmatter
  content = content.replace(/^(---\ntitle:.*\n)/m, `$1slug: ${slug}\n`);
  
  fs.writeFileSync(filePath, content);
  return true;
}

async function addAllSlugs() {
  console.log('Adding slugs to all PostgreSQL how-to files...\n');
  
  const pattern = path.join(HOWTOS_DIR, '**/*.md');
  const files = glob.sync(pattern).filter(f => !f.includes('/index.md'));
  
  let addedCount = 0;
  
  for (const file of files) {
    if (addSlugToFrontmatter(file)) {
      console.log(`✓ Added slug: ${path.relative(HOWTOS_DIR, file)}`);
      addedCount++;
    }
  }
  
  console.log(`\n✅ Added slugs to ${addedCount} files`);
}

if (require.main === module) {
  addAllSlugs().catch(console.error);
}