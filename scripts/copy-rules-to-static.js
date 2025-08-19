const fs = require('fs');
const path = require('path');

// Rule configurations with titles
const ruleConfigs = {
  'sql-style': {
    title: 'SQL style guide',
    description: 'Best practices for writing SQL queries and database interactions'
  },
  'postgres-hacking': {
    title: 'Postgres hacking',
    description: 'Development environment setup and best practices for PostgreSQL core development'
  },
  'db-design': {
    title: 'DB schema design guide',
    description: 'Database design principles and best practices for PostgreSQL schema design'
  }
};

function copyRulesFiles(sourceDir, targetDir) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Read all files in the source directory
  const items = fs.readdirSync(sourceDir);
  
  items.forEach(item => {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(targetDir, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isFile() && item.endsWith('.md')) {
      // Read source file content
      const sourceContent = fs.readFileSync(srcPath, 'utf8');
      
      // Get the slug from filename (remove .md extension)
      const slug = item.replace('.md', '');
      const config = ruleConfigs[slug];
      
      if (config) {
        // Add title header and content
        const contentWithTitle = `# ${config.title}\n\n${sourceContent}`;
        fs.writeFileSync(destPath, contentWithTitle, 'utf8');
        console.log(`Copied with title: ${srcPath} -> ${destPath}`);
      } else {
        // Fallback: copy as-is if no config found
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied as-is: ${srcPath} -> ${destPath}`);
      }
    }
  });
}

// Copy rules from src/content/rules to static/rules
const rulesSourceDir = path.resolve(__dirname, '../src/content/rules');
const rulesTargetDir = path.resolve(__dirname, '../static/rules');

console.log('Copying rules markdown files...');
copyRulesFiles(rulesSourceDir, rulesTargetDir);
console.log('Rules copy complete!');