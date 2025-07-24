#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

function fixImagePaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix image paths - change "files/" to absolute path
  const newContent = content.replace(/<img src="files\//g, '<img src="/img/postgres-howtos/');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    modified = true;
  }
  
  return modified;
}

async function fixAllImagePaths() {
  console.log('Fixing image paths in all PostgreSQL how-to files...\n');
  
  const pattern = path.join(HOWTOS_DIR, '**/*.md');
  const files = glob.sync(pattern);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixImagePaths(file)) {
      console.log(`✓ Fixed: ${path.relative(HOWTOS_DIR, file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files with image paths`);
}

if (require.main === module) {
  fixAllImagePaths().catch(console.error);
}