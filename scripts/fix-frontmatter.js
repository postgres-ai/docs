#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const HOWTOS_DIR = path.join(__dirname, '../docs/postgres-howtos');

function escapeYamlString(str) {
  // If string contains special characters, quotes, or newlines, properly escape it
  if (str.includes('"') || str.includes(':') || str.includes('|') || str.includes('>') || str.includes('\n') || str.includes('#')) {
    // Escape double quotes
    str = str.replace(/"/g, '\\"');
    // Return with quotes
    return `"${str}"`;
  }
  return str;
}

function fixFrontmatter(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.log(`⚠️  No frontmatter found in ${filePath}`);
    return false;
  }
  
  const frontmatter = frontmatterMatch[1];
  const afterFrontmatter = content.substring(frontmatterMatch[0].length);
  
  // Parse frontmatter line by line
  const lines = frontmatter.split('\n');
  const fixedLines = [];
  
  for (const line of lines) {
    if (line.includes(':')) {
      const colonIndex = line.indexOf(':');
      const key = line.substring(0, colonIndex);
      let value = line.substring(colonIndex + 1).trim();
      
      // Special handling for different fields
      if (key === 'title' || key === 'sidebar_label' || key === 'description') {
        // Remove existing quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        // Properly escape and quote
        value = escapeYamlString(value);
        fixedLines.push(`${key}: ${value}`);
      } else if (key === 'keywords' || key === 'tags') {
        // Keep arrays as is
        fixedLines.push(line);
      } else {
        // For other fields, escape if needed
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        value = escapeYamlString(value);
        fixedLines.push(`${key}: ${value}`);
      }
    } else {
      fixedLines.push(line);
    }
  }
  
  // Reconstruct the file
  const newContent = `---\n${fixedLines.join('\n')}\n---${afterFrontmatter}`;
  
  // Write back
  fs.writeFileSync(filePath, newContent);
  return true;
}

async function fixAllFrontmatters() {
  console.log('Fixing frontmatter in all PostgreSQL how-to files...\n');
  
  const pattern = path.join(HOWTOS_DIR, '**/*.md');
  const files = glob.sync(pattern);
  
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    try {
      if (fixFrontmatter(file)) {
        console.log(`✓ Fixed: ${path.relative(HOWTOS_DIR, file)}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`✗ Error fixing ${file}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} errors encountered`);
  }
}

if (require.main === module) {
  fixAllFrontmatters().catch(console.error);
}