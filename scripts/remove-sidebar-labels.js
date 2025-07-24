const fs = require('fs');
const path = require('path');

// Read the current sidebars.js
const sidebarPath = path.join(__dirname, '../sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Remove all label fields from document entries in the postgres-howtos section
// This will make Docusaurus use the title from the frontmatter
sidebarContent = sidebarContent.replace(
  /"label":\s*"[^"\\]*(?:\\.[^"\\]*)*",?\s*(?=\})/g,
  (match) => {
    // Remove the label and its comma if it's not the last property
    return '';
  }
);

// Clean up any double commas or trailing commas before closing braces
sidebarContent = sidebarContent.replace(/,\s*,/g, ',');
sidebarContent = sidebarContent.replace(/,\s*\}/g, '}');

// Write the updated sidebar
fs.writeFileSync(sidebarPath, sidebarContent);

console.log('✅ Removed all label fields from sidebar - will use frontmatter titles');