const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Read the current sidebars.js
const sidebarPath = path.join(__dirname, '../sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Get all postgres-howtos files in docs directory
const allFiles = glob.sync(path.join(__dirname, '../docs/postgres-howtos/**/*.md'))
  .map(file => file.replace(/^.*\/docs\//, '').replace(/\.md$/, ''))
  .filter(file => !file.endsWith('/index'));

console.log(`Found ${allFiles.length} howto files in docs directory`);

// Create a map of wrong IDs to correct IDs
const idMap = {};

// Extract all postgres-howtos references from sidebar
const sidebarIds = sidebarContent.match(/"postgres-howtos\/[^"]+"/g) || [];

sidebarIds.forEach(match => {
  const id = match.slice(1, -1); // Remove quotes
  
  // Skip index files
  if (id.endsWith('/index')) return;
  
  // Check if the file exists
  if (!allFiles.includes(id)) {
    // Try to find a matching file
    const parts = id.split('/');
    const fileName = parts[parts.length - 1];
    
    // Look for files with similar names in the same directory
    const dir = parts.slice(0, -1).join('/');
    const candidates = allFiles.filter(file => {
      return file.startsWith(dir + '/') && 
             (file.includes(fileName.replace(/^0\d+-/, '')) || 
              file.endsWith('/' + fileName));
    });
    
    if (candidates.length === 1) {
      idMap[id] = candidates[0];
      console.log(`Mapping: ${id} -> ${candidates[0]}`);
    } else if (candidates.length > 1) {
      console.log(`Multiple candidates for ${id}:`, candidates);
    } else {
      console.log(`No match found for: ${id}`);
    }
  }
});

// Apply the mappings
Object.entries(idMap).forEach(([oldId, newId]) => {
  const oldPattern = `"${oldId}"`;
  const newPattern = `"${newId}"`;
  sidebarContent = sidebarContent.replace(oldPattern, newPattern);
});

// Write the updated sidebar
fs.writeFileSync(sidebarPath, sidebarContent);

console.log(`✅ Fixed ${Object.keys(idMap).length} sidebar document IDs`);