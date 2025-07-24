const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

// Find all markdown files
const files = glob.sync(path.join(__dirname, '../docs/postgres-howtos/**/*.md'));

files.forEach(file => {
  // Skip index files
  if (file.endsWith('index.md')) return;
  
  const content = fs.readFileSync(file, 'utf8');
  const { data, content: markdownContent } = matter(content);
  
  // Remove the slug field
  if (data.slug) {
    delete data.slug;
    
    // Rebuild the file
    const newContent = matter.stringify(markdownContent, data);
    fs.writeFileSync(file, newContent);
    
    console.log(`Removed slug from: ${file}`);
  }
});

console.log('✅ Removed all custom slugs');