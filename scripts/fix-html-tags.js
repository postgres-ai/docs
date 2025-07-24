#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

function fixHtmlTags(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace <pre> tags with markdown code blocks
  let newContent = content.replace(/<pre>\n?([^<]+)<\/pre>/g, '```\n$1\n```');
  
  // Replace <u> tags with markdown emphasis
  newContent = newContent.replace(/<u[^>]*>([^<]+)<\/u>/g, '**$1**');
  
  // Replace any remaining inline style attributes
  newContent = newContent.replace(/ style="[^"]*"/g, '');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    modified = true;
  }
  
  return modified;
}

async function fixAllHtmlTags() {
  console.log('Fixing HTML tags in all PostgreSQL how-to files...\n');
  
  const pattern = path.join(HOWTOS_DIR, '**/*.md');
  const files = glob.sync(pattern);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixHtmlTags(file)) {
      console.log(`✓ Fixed: ${path.relative(HOWTOS_DIR, file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files with HTML tags`);
}

if (require.main === module) {
  fixAllHtmlTags().catch(console.error);
}