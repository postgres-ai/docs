#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

function fixDescriptions(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix any description that contains remnants of the daily posting message
  let newContent = content.replace(
    /description:\s*"[^"]*howto[^"]*article every day[^"]*"/gi,
    'description: ""'
  );
  
  // Also fix the specific remnant pattern
  newContent = newContent.replace(
    /description:\s*""howto\\"[^"]*"/gi,
    'description: ""'
  );
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    modified = true;
  }
  
  return modified;
}

async function fixAllDescriptions() {
  console.log('Fixing remaining description issues in PostgreSQL how-to files...\n');
  
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