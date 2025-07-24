const fs = require('fs');
const path = require('path');

// Read the current sidebars.js
const sidebarPath = path.join(__dirname, '../sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Function to check if a file exists in docs directory
function fileExists(docId) {
  const filePath = path.join(__dirname, `../docs/${docId}.md`);
  return fs.existsSync(filePath);
}

// Function to find the correct file name
function findCorrectFileName(basePath, fileName) {
  const dir = path.join(__dirname, '../docs', basePath);
  if (!fs.existsSync(dir)) return null;
  
  const files = fs.readdirSync(dir);
  
  // First try exact match
  if (files.includes(fileName + '.md')) {
    return fileName;
  }
  
  // Try with numeric prefix
  const matchingFile = files.find(file => {
    return file.endsWith(fileName + '.md') || 
           file.includes(fileName) ||
           file.endsWith('.md') && file.includes(fileName.replace(/-/g, '_'));
  });
  
  if (matchingFile) {
    return matchingFile.replace('.md', '');
  }
  
  return null;
}

// Fix the sidebar entries
sidebarContent = sidebarContent.replace(/"postgres-howtos\/[^"]+"/g, (match) => {
  const docId = match.slice(1, -1); // Remove quotes
  
  // If it's an index file, keep as is
  if (docId.endsWith('/index')) {
    return match;
  }
  
  // Check if file exists
  if (fileExists(docId)) {
    return match;
  }
  
  // Try to find the correct file
  const parts = docId.split('/');
  const fileName = parts[parts.length - 1];
  const basePath = parts.slice(0, -1).join('/');
  
  const correctFileName = findCorrectFileName(basePath, fileName);
  if (correctFileName) {
    const newDocId = `${basePath}/${correctFileName}`;
    console.log(`Fixed: ${docId} -> ${newDocId}`);
    return `"${newDocId}"`;
  }
  
  console.log(`Could not fix: ${docId}`);
  return match;
});

// Write the updated sidebar
fs.writeFileSync(sidebarPath, sidebarContent);

console.log('✅ Fixed sidebar document IDs');