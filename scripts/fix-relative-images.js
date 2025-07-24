#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

function fixRelativeImages(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix relative image paths in markdown - change "./files/" or "files/" to absolute path
  let newContent = content.replace(/!\[([^\]]*)\]\(\.?\/files\//g, '![$1](/img/postgres-howtos/');
  
  // Also fix img tags with relative paths
  newContent = newContent.replace(/<img([^>]*) src="\.?\/files\//g, '<img$1 src="/img/postgres-howtos/');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    modified = true;
  }
  
  return modified;
}

async function fixAllRelativeImages() {
  console.log('Fixing relative image paths in all PostgreSQL how-to files...\n');
  
  const pattern = path.join(HOWTOS_DIR, '**/*.md');
  const files = glob.sync(pattern);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixRelativeImages(file)) {
      console.log(`✓ Fixed: ${path.relative(HOWTOS_DIR, file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files with relative image paths`);
}

if (require.main === module) {
  fixAllRelativeImages().catch(console.error);
}