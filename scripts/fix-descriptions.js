#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

function fixDescriptions(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix description that contains the daily posting message
  let newContent = content.replace(
    /description:\s*">\s*I post a new PostgreSQL[^"]*"/gi,
    'description: ""'
  );
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    modified = true;
  }
  
  return modified;
}

async function fixAllDescriptions() {
  console.log('Fixing descriptions in all PostgreSQL how-to files...\n');
  
  const pattern = path.join(HOWTOS_DIR, '**/*.md');
  const files = glob.sync(pattern).filter(f => !f.includes('/index.md'));
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixDescriptions(file)) {
      console.log(`✓ Fixed: ${path.relative(HOWTOS_DIR, file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files`);
}

if (require.main === module) {
  fixAllDescriptions().catch(console.error);
}