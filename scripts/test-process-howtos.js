#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateFrontmatter, determineCategory } = require('./process-postgres-howtos');

// Test with a sample article
const SAMPLE_FILE = '0001_explain_analyze_buffers.md';
const HOWTOS_SOURCE = path.join(__dirname, '../../postgres-howtos');

console.log('Testing howto processing with:', SAMPLE_FILE);

// Read sample file
const sourcePath = path.join(HOWTOS_SOURCE, SAMPLE_FILE);
if (!fs.existsSync(sourcePath)) {
  console.error('Sample file not found:', sourcePath);
  process.exit(1);
}

const content = fs.readFileSync(sourcePath, 'utf8');
console.log('\\n--- Original Content Preview ---');
console.log(content.substring(0, 500) + '...');

// Generate frontmatter
const frontmatter = generateFrontmatter(SAMPLE_FILE, content);
console.log('\\n--- Generated Frontmatter ---');
console.log(frontmatter);

// Determine category
const category = determineCategory(SAMPLE_FILE, content);
console.log('\\n--- Determined Category ---');
console.log(`Main Category: ${category.mainCat}`);
console.log(`Sub Category: ${category.subCat}`);

// Show where file would be placed
const cleanName = SAMPLE_FILE
  .replace(/^\\d+_/, '')
  .replace(/_/g, '-');
console.log(`\\nFile would be saved as: ${category.mainCat}/${category.subCat}/${cleanName}`);