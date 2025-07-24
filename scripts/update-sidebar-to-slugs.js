#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SIDEBAR_FILE = path.join(__dirname, '../sidebars.js');

function updateSidebarToSlugs() {
  console.log('Updating sidebar to use slug values...\n');
  
  let content = fs.readFileSync(SIDEBAR_FILE, 'utf8');
  
  // Pattern to match postgres-howtos paths with number prefixes
  const pattern = /"postgres-howtos\/([^\/]+)\/([^\/]+)\/\d{4}-(.+)"/g;
  
  let updatedContent = content.replace(pattern, '"postgres-howtos/$1/$2/$3"');
  
  // Count replacements
  const matches = content.match(pattern);
  const replacementCount = matches ? matches.length : 0;
  
  fs.writeFileSync(SIDEBAR_FILE, updatedContent);
  
  console.log(`✅ Updated ${replacementCount} sidebar entries to use slugs`);
}

if (require.main === module) {
  updateSidebarToSlugs();
}