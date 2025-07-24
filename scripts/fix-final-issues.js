#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

function fixArticleIssues(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Remove the "I post a new PostgreSQL howto article every day" section
  const dailyPostPattern = />\s*I post a new PostgreSQL[^>]+journey[^>]+share!\s*/gi;
  let newContent = content.replace(dailyPostPattern, '');
  
  // Remove duplicate title - the title after "---" if it matches the frontmatter title
  const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (titleMatch) {
    const title = titleMatch[1].replace(/^["']|["']$/g, '');
    // Look for the duplicate title after the frontmatter
    const duplicateTitlePattern = new RegExp(`\\n---\\n\\n(?:Originally from:.*\\n\\n)?(?:---\\n\\n)?#\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n`, 'i');
    newContent = newContent.replace(duplicateTitlePattern, '\n---\n\n');
  }
  
  // Remove empty "Originally from:" lines with broken links
  newContent = newContent.replace(/Originally from:.*LinkedIn post \(link not available\)\.?\s*\n\n---\s*\n/g, '');
  
  // Clean up multiple consecutive newlines
  newContent = newContent.replace(/\n{4,}/g, '\n\n\n');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    modified = true;
  }
  
  return modified;
}

async function fixAllArticles() {
  console.log('Fixing final issues in all PostgreSQL how-to files...\n');
  
  const pattern = path.join(HOWTOS_DIR, '**/*.md');
  const files = glob.sync(pattern).filter(f => !f.includes('/index.md'));
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixArticleIssues(file)) {
      console.log(`✓ Fixed: ${path.relative(HOWTOS_DIR, file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files`);
}

if (require.main === module) {
  fixAllArticles().catch(console.error);
}