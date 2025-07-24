const fs = require('fs');
const path = require('path');

// Read the current sidebars.js
const sidebarPath = path.join(__dirname, '../sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// For the postgres-howtos section, convert all entries to simple string format
// This will make Docusaurus use the title from the frontmatter
sidebarContent = sidebarContent.replace(
  /\{\s*"type":\s*"doc",\s*"id":\s*"(postgres-howtos\/[^"]+)"[^}]*\}/g,
  '"$1"'
);

// Clean up any remaining malformed labels
sidebarContent = sidebarContent.replace(/("label":\s*"[^"]*)"[^",}]*/g, '$1"');

// Write the updated sidebar
fs.writeFileSync(sidebarPath, sidebarContent);

console.log('✅ Cleaned up sidebar - using simple string format for doc references');