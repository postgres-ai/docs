const fs = require('fs');
const path = require('path');

function copyMarkdownFiles(sourceDir, targetDir) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  function copyRecursive(src, dest) {
    const items = fs.readdirSync(src);
    
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        // Create directory and copy its contents
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else if (item.endsWith('.md')) {
        // Copy markdown file
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    });
  }

  copyRecursive(sourceDir, targetDir);
}

// Copy docs to static/raw/docs
const docsDir = path.resolve(__dirname, '../docs');
const rawDocsDir = path.resolve(__dirname, '../static/raw/docs');

console.log('Copying markdown files...');
copyMarkdownFiles(docsDir, rawDocsDir);
console.log('Done!'); 