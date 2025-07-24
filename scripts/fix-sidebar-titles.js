const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

// Read the current sidebars.js
const sidebarPath = path.join(__dirname, '../sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Get all markdown files
const files = glob.sync(path.join(__dirname, '../docs/postgres-howtos/**/*.md'))
  .filter(file => !file.endsWith('/index.md'));

// Create a map of file paths to their titles
const titleMap = {};
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const { data } = matter(content);
  const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
  if (data.title) {
    titleMap[docId] = data.title;
  }
});

// Replace labels in sidebar with full titles
Object.entries(titleMap).forEach(([docId, title]) => {
  // Find and replace the label for this doc ID
  const regex = new RegExp(`"id":\\s*"${docId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",[^}]*"label":\\s*"[^"]*"`, 'g');
  sidebarContent = sidebarContent.replace(regex, (match) => {
    // Replace the label part with the full title
    return match.replace(/"label":\s*"[^"]*"/, `"label": "${title.replace(/"/g, '\\"')}"`);
  });
});

// Write the updated sidebar
fs.writeFileSync(sidebarPath, sidebarContent);

console.log('✅ Updated sidebar with full titles from frontmatter');