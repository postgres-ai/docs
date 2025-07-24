const fs = require('fs');
const path = require('path');

// Source and destination directories
const sourceDir = path.join(__dirname, '..', 'docs', 'postgres-howtos');
const destDir = path.join(__dirname, '..', 'static', 'postgres-howtos');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Function to copy markdown files recursively
function copyMarkdownFiles(src, dest) {
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      // Create subdirectory if it doesn't exist
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      // Recursively copy files from subdirectory
      copyMarkdownFiles(srcPath, destPath);
    } else if (item.endsWith('.md')) {
      // Copy markdown file
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  });
}

// Start copying
console.log('Copying Postgres how-tos to static directory...');
copyMarkdownFiles(sourceDir, destDir);
console.log('Done!');