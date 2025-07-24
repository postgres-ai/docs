const fs = require('fs');
const path = require('path');

// File moves to implement
const moves = [
  // 1. data checksums to Administration/Maintenance
  {
    from: 'docs/postgres-howtos/database-administration/backup-recovery/how-to-enable-data-checksums-without-downtime.md',
    to: 'docs/postgres-howtos/database-administration/maintenance/how-to-enable-data-checksums-without-downtime.md'
  },
  // 3. troubleshoot restarts to Administration/Maintenance
  {
    from: 'docs/postgres-howtos/database-administration/configuration/how-to-troubleshoot-and-speedup-postgres-restarts.md',
    to: 'docs/postgres-howtos/database-administration/maintenance/how-to-troubleshoot-and-speedup-postgres-restarts.md'
  },
  // 4. troubleshoot long startup to Administration/Maintenance
  {
    from: 'docs/postgres-howtos/database-administration/configuration/how-to-troubleshoot-long-startup.md',
    to: 'docs/postgres-howtos/database-administration/maintenance/how-to-troubleshoot-long-startup.md'
  },
  // 5. growing pg_wal to Admin/Maintenance
  {
    from: 'docs/postgres-howtos/monitoring-troubleshooting/system-monitoring/how-to-troubleshoot-a-growing-pg-wal-directory.md',
    to: 'docs/postgres-howtos/database-administration/maintenance/how-to-troubleshoot-a-growing-pg-wal-directory.md'
  },
  // 6. WAL generation rates - best in Performance/Monitoring as it's about monitoring and optimizing performance
  {
    from: 'docs/postgres-howtos/monitoring-troubleshooting/system-monitoring/how-to-reduce-wal-generation-rates.md',
    to: 'docs/postgres-howtos/performance-optimization/monitoring/how-to-reduce-wal-generation-rates.md'
  }
];

// Move files
let movedCount = 0;
let notFoundCount = 0;

moves.forEach(move => {
  const fromPath = path.join(__dirname, '..', move.from);
  const toPath = path.join(__dirname, '..', move.to);
  
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`✓ Moved: ${path.basename(move.from)} -> ${move.to.split('/').slice(-2).join('/')}`);
    movedCount++;
  } else {
    console.log(`⚠️  File not found: ${move.from}`);
    notFoundCount++;
  }
});

// Update backup-recovery index to reflect new name
const backupIndexPath = path.join(__dirname, '../docs/postgres-howtos/database-administration/backup-recovery/index.md');
if (fs.existsSync(backupIndexPath)) {
  let content = fs.readFileSync(backupIndexPath, 'utf8');
  content = content.replace(/Backup & recovery/g, 'Backups, data export/import');
  content = content.replace(/Backup and recovery/gi, 'Backups, data export/import');
  content = content.replace(/Learn essential backup and recovery/g, 'Learn essential backup, recovery, and data transfer');
  fs.writeFileSync(backupIndexPath, content);
  console.log('✓ Updated backup-recovery index title');
}

// Update all database-administration references to just administration in sidebars and content
console.log('\nUpdating sidebar to rename Database administration to Administration...');
const sidebarPath = path.join(__dirname, '../sidebars.js');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Update the label
sidebarContent = sidebarContent.replace(/"label":\s*"Database administration"/g, '"label": "Administration"');

// Update the link references for categories that have them
sidebarContent = sidebarContent.replace(/"link":\s*"postgres-howtos\/database-administration\//g, '"link": "postgres-howtos/database-administration/');

// Write updated sidebar
fs.writeFileSync(sidebarPath, sidebarContent);
console.log('✓ Updated sidebar labels');

// Update the main administration index
const adminIndexPath = path.join(__dirname, '../docs/postgres-howtos/database-administration/index.md');
if (fs.existsSync(adminIndexPath)) {
  let content = fs.readFileSync(adminIndexPath, 'utf8');
  content = content.replace(/Database administration/g, 'Administration');
  content = content.replace(/# Database administration/g, '# Administration');
  fs.writeFileSync(adminIndexPath, content);
  console.log('✓ Updated administration index');
}

console.log(`\n✅ Adjustments complete!`);
console.log(`   - Files moved: ${movedCount}`);
console.log(`   - Files not found: ${notFoundCount}`);