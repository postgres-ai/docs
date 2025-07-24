const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const docsDir = path.join(__dirname, '..', 'docs', 'postgres-howtos');

// Function to process all markdown files recursively
function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.md')) {
      processFile(fullPath);
    }
  });
}

// Function to process a single file
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: markdown } = matter(content);
  
  // Check if description contains an image tag
  if (data.description && data.description.includes('<img')) {
    console.log(`Cleaning description in: ${filePath}`);
    
    // Remove the image tag from description
    data.description = data.description.replace(/<img[^>]*>/g, '').trim();
    
    // If description is now empty, remove it
    if (!data.description) {
      delete data.description;
    }
    
    // Rebuild the file
    const newContent = matter.stringify(markdown, data);
    fs.writeFileSync(filePath, newContent);
  }
}

console.log('Cleaning image tags from descriptions...');
processDirectory(docsDir);
console.log('Done!');