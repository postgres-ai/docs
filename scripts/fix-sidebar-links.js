const fs = require('fs');
const path = require('path');

// Read the current sidebars.js
const sidebarPath = path.join(__dirname, '../sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Fix link format - should be object with type and id
// Pattern: "link": "some-path" should become "link": { "type": "doc", "id": "some-path" }
sidebarContent = sidebarContent.replace(/"link":\s*"([^"]+)"/g, '"link": { "type": "doc", "id": "$1" }');

// Write the updated sidebar
fs.writeFileSync(sidebarPath, sidebarContent);

console.log('✅ Fixed sidebar link format to use objects');