const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all markdown files
const files = glob.sync(path.join(__dirname, '../docs/postgres-howtos/**/*.md'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix empty LinkedIn links
  if (content.includes('[LinkedIn post]()')) {
    content = content.replace(/\[LinkedIn post\]\(\)/g, 'LinkedIn post (link not available)');
    fs.writeFileSync(file, content);
    console.log(`Fixed empty LinkedIn link in: ${file}`);
  }
});

console.log('✅ Fixed all empty LinkedIn links');