const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all markdown files
const files = glob.sync(path.join(__dirname, '../docs/postgres-howtos/**/*.md'));

files.forEach(file => {
  // Skip index files
  if (file.endsWith('index.md')) return;
  
  const dir = path.dirname(file);
  const basename = path.basename(file);
  
  // Check if filename starts with numeric prefix
  if (/^\d{4}-/.test(basename)) {
    // Remove the numeric prefix
    const newBasename = basename.replace(/^\d{4}-/, '');
    const newPath = path.join(dir, newBasename);
    
    // Rename the file
    fs.renameSync(file, newPath);
    console.log(`Renamed: ${basename} -> ${newBasename}`);
  }
});

console.log('✅ Removed all numeric prefixes from filenames');