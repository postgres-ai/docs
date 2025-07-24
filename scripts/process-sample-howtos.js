#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Process just a few sample articles to test
const SAMPLE_ARTICLES = [
  '0001_explain_analyze_buffers.md',
  '0002_query_to_get_table_sizes.md',
  '0003_find_redundant_indexes.md',
  '0005_pg_stat_statements_part_1.md',
  '0022_how_to_analyze_heavyweight_locks_part_1.md'
];

// Load main processing script
const processScript = path.join(__dirname, 'process-postgres-howtos.js');
delete require.cache[require.resolve(processScript)];
const { processArticle } = require(processScript);

const HOWTOS_SOURCE = path.join(__dirname, '../../postgres-howtos');
const HOWTOS_DEST = path.join(__dirname, '../docs/postgres-howtos');

console.log('Processing sample articles...\n');

for (const filename of SAMPLE_ARTICLES) {
  try {
    const result = processArticle(filename, HOWTOS_SOURCE, HOWTOS_DEST);
    console.log(`✓ ${filename} -> ${result.mainCat}/${result.subCat}/${result.filename}`);
  } catch (error) {
    console.error(`✗ ${filename}: ${error.message}`);
  }
}

console.log('\nSample processing complete!');
console.log('Check the docs/postgres-howtos directory to see the results.');