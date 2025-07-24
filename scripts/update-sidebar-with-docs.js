const fs = require('fs');
const path = require('path');

// Read the sidebars.js file
const sidebarPath = path.join(__dirname, '..', 'sidebars.js');
const content = fs.readFileSync(sidebarPath, 'utf8');

// Updated sidebar structure with doc references instead of links
const updatedSidebar = `    "Postgres how-tos": [
      "postgres-howtos/index",
      {
        type: "category",
        label: "Performance & optimization",
        link: {
          type: "doc",
          id: "postgres-howtos/performance-optimization/index",
        },
        items: [
          "postgres-howtos/performance-optimization/query-tuning/index",
          "postgres-howtos/performance-optimization/indexing/index",
          "postgres-howtos/performance-optimization/statistics/index",
        ],
      },
      {
        type: "category",
        label: "Database administration",
        link: {
          type: "doc",
          id: "postgres-howtos/database-administration/index",
        },
        items: [
          "postgres-howtos/database-administration/backup-recovery/index",
          "postgres-howtos/database-administration/configuration/index",
          "postgres-howtos/database-administration/maintenance/index",
        ],
      },
      {
        type: "category",
        label: "Monitoring & troubleshooting",
        link: {
          type: "doc",
          id: "postgres-howtos/monitoring-troubleshooting/index",
        },
        items: [
          "postgres-howtos/monitoring-troubleshooting/system-monitoring/index",
          "postgres-howtos/monitoring-troubleshooting/lock-analysis/index",
          "postgres-howtos/monitoring-troubleshooting/troubleshooting/index",
        ],
      },
      {
        type: "category",
        label: "Schema design",
        link: {
          type: "doc",
          id: "postgres-howtos/schema-design/index",
        },
        items: [
          "postgres-howtos/schema-design/ddl-operations/index",
          "postgres-howtos/schema-design/data-types/index",
          "postgres-howtos/schema-design/constraints/index",
        ],
      },
      {
        type: "category",
        label: "Development tools",
        link: {
          type: "doc",
          id: "postgres-howtos/development-tools/index",
        },
        items: [
          "postgres-howtos/development-tools/psql/index",
          "postgres-howtos/development-tools/sql-techniques/index",
          "postgres-howtos/development-tools/client-tools/index",
        ],
      },
      {
        type: "category",
        label: "Advanced topics",
        link: {
          type: "doc",
          id: "postgres-howtos/advanced-topics/index",
        },
        items: [
          "postgres-howtos/advanced-topics/internals/index",
          "postgres-howtos/advanced-topics/extensions/index",
          "postgres-howtos/advanced-topics/replication/index",
        ],
      },
      {
        type: "category",
        label: "Miscellaneous",
        link: {
          type: "doc",
          id: "postgres-howtos/miscellaneous/index",
        },
        items: [],
      },
    ],`;

console.log('Updating sidebar to use doc references...');

// Find the start and end of the Postgres how-tos section
const startMarker = '"Postgres how-tos": [';
const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
  console.error('Could not find Postgres how-tos section');
  process.exit(1);
}

// Find the end of the section by counting brackets
let bracketCount = 0;
let inString = false;
let endIndex = startIndex + startMarker.length;

for (let i = endIndex; i < content.length; i++) {
  const char = content[i];
  const prevChar = i > 0 ? content[i - 1] : '';
  
  if (char === '"' && prevChar !== '\\') {
    inString = !inString;
  }
  
  if (!inString) {
    if (char === '[' || char === '{') {
      bracketCount++;
    } else if (char === ']' || char === '}') {
      bracketCount--;
      if (bracketCount === -1) {
        endIndex = i + 1;
        break;
      }
    }
  }
}

// Replace the section
const newContent = content.slice(0, startIndex) + updatedSidebar + content.slice(endIndex);

// Write back
fs.writeFileSync(sidebarPath, newContent);

console.log('Sidebar updated successfully!');