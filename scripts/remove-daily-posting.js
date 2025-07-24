#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

function removeDailyPosting(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Remove the daily posting message paragraph
  const dailyPostPattern = /^>\s*I post a new PostgreSQL[^]*?provide feedback, share!\s*$/gm;
  let newContent = content.replace(dailyPostPattern, '');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    modified = true;
  }
  
  return modified;
}

async function removeFromAllFiles() {
  console.log('Removing daily posting message from all PostgreSQL how-to files...\n');
  
  const pattern = path.join(HOWTOS_DIR, '**/*.md');
  const files = glob.sync(pattern);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (removeDailyPosting(file)) {
      console.log(`✓ Fixed: ${path.relative(HOWTOS_DIR, file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Removed daily posting message from ${fixedCount} files`);
}

if (require.main === module) {
  removeFromAllFiles().catch(console.error);
}