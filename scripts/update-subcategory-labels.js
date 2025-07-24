const fs = require('fs');
const path = require('path');

// Define subcategories with their proper labels
const subcategories = [
  { path: 'performance-optimization/query-tuning', label: 'Query tuning' },
  { path: 'performance-optimization/indexing', label: 'Indexing' },
  { path: 'performance-optimization/statistics', label: 'Monitoring & statistics' },
  { path: 'database-administration/backup-recovery', label: 'Backup & recovery' },
  { path: 'database-administration/configuration', label: 'Configuration' },
  { path: 'database-administration/maintenance', label: 'Maintenance' },
  { path: 'monitoring-troubleshooting/system-monitoring', label: 'System monitoring' },
  { path: 'monitoring-troubleshooting/lock-analysis', label: 'Lock analysis' },
  { path: 'monitoring-troubleshooting/troubleshooting', label: 'Troubleshooting' },
  { path: 'schema-design/ddl-operations', label: 'DDL operations' },
  { path: 'schema-design/data-types', label: 'Data types' },
  { path: 'schema-design/constraints', label: 'Constraints' },
  { path: 'development-tools/psql', label: 'psql' },
  { path: 'development-tools/sql-techniques', label: 'SQL techniques' },
  { path: 'development-tools/client-tools', label: 'Client tools' },
  { path: 'advanced-topics/internals', label: 'Internals' },
  { path: 'advanced-topics/extensions', label: 'Extensions' },
  { path: 'advanced-topics/replication', label: 'Replication' }
];

const docsDir = path.join(__dirname, '..', 'docs', 'postgres-howtos');

// Update each subcategory index file to add proper sidebar_label
subcategories.forEach(subcat => {
  const indexPath = path.join(docsDir, subcat.path, 'index.md');
  
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Update the frontmatter to ensure sidebar_label matches
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      let frontmatter = frontmatterMatch[1];
      
      // Update or add sidebar_label
      if (frontmatter.includes('sidebar_label:')) {
        frontmatter = frontmatter.replace(/sidebar_label:.*$/m, `sidebar_label: ${subcat.label}`);
      } else {
        // Add after title
        frontmatter = frontmatter.replace(/title:.*$/m, `$&\nsidebar_label: ${subcat.label}`);
      }
      
      content = content.replace(frontmatterMatch[0], `---\n${frontmatter}\n---`);
      fs.writeFileSync(indexPath, content);
      console.log(`Updated ${subcat.path}/index.md`);
    }
  }
});

// Now update the main sidebars.js to ensure proper structure
const sidebarPath = path.join(__dirname, '..', 'sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Fix the double comma issue
sidebarContent = sidebarContent.replace(/\],\s*,+/g, '],');

// Write back the fixed content
fs.writeFileSync(sidebarPath, sidebarContent);

console.log('All updates completed!');