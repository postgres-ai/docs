#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

function fixEmptyLinks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix empty LinkedIn links - remove the entire link if URL is empty
  const newContent = content.replace(/\[LinkedIn post\]\(\)/g, 'LinkedIn post (link not available)');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    modified = true;
  }
  
  return modified;
}

async function fixAllEmptyLinks() {
  console.log('Fixing empty links in all PostgreSQL how-to files...\n');
  
  const pattern = path.join(HOWTOS_DIR, '**/*.md');
  const files = glob.sync(pattern);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixEmptyLinks(file)) {
      console.log(`✓ Fixed: ${path.relative(HOWTOS_DIR, file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files with empty links`);
}

if (require.main === module) {
  fixAllEmptyLinks().catch(console.error);
}