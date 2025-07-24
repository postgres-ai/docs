const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Map of files that need descriptions
const missingDescriptions = {
  'database-administration/maintenance/0067-autovacuum-queue-and-progress.md': 
    'Monitor and manage autovacuum queue, understand worker activity and vacuum progress',
  'database-administration/maintenance/0030-how-to-deal-with-long-running-transactions-oltp.md':
    'Identify and handle long-running transactions that can impact OLTP system performance',
  'database-administration/maintenance/0035-how-to-use-subtransactions-in-postgres.md':
    'Understand subtransactions, savepoints, and their impact on database performance',
  'database-administration/maintenance/0046-how-to-deal-with-bloat.md':
    'Detect, measure, and eliminate table and index bloat to maintain database health'
};

const docsDir = path.join(__dirname, '..', 'docs', 'postgres-howtos');

Object.entries(missingDescriptions).forEach(([relativePath, description]) => {
  const filePath = path.join(docsDir, relativePath);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: markdown } = matter(content);
    
    // Add or update description
    if (!data.description || data.description === '""' || data.description === '') {
      console.log(`Adding description to: ${relativePath}`);
      data.description = description;
      
      const newContent = matter.stringify(markdown, data);
      fs.writeFileSync(filePath, newContent);
    }
  }
});

console.log('Done adding descriptions!');