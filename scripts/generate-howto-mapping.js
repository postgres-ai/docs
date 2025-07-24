const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const howtoDir = path.join(__dirname, '..', 'docs', 'postgres-howtos');
const outputFile = path.join(__dirname, '..', 'src', 'data', 'howtoMapping.json');

const mapping = {};

function processDirectory(dir, basePath = '') {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath, path.join(basePath, item));
    } else if (item.endsWith('.md') && item !== 'index.md') {
      const content = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(content);
      
      if (data.slug) {
        const relativePath = path.join(basePath, item).replace(/\\/g, '/');
        mapping[data.slug] = relativePath;
      }
    }
  });
}

// Generate mapping
processDirectory(howtoDir);

// Write mapping file
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(mapping, null, 2));

console.log(`Generated mapping for ${Object.keys(mapping).length} howtos`);
console.log(`Mapping saved to ${outputFile}`);