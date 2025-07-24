const fs = require('fs');
const path = require('path');

// Read the sidebars.js file
const sidebarPath = path.join(__dirname, '..', 'sidebars.js');
const content = fs.readFileSync(sidebarPath, 'utf8');

// Updated sidebar structure with only 3 levels - categories and subcategories only
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
          {
            type: "link",
            label: "Query tuning",
            href: "/docs/postgres-howtos/performance-optimization/query-tuning",
          },
          {
            type: "link",
            label: "Indexing",
            href: "/docs/postgres-howtos/performance-optimization/indexing",
          },
          {
            type: "link",
            label: "Monitoring & statistics",
            href: "/docs/postgres-howtos/performance-optimization/statistics",
          },
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
          {
            type: "link",
            label: "Backup & recovery",
            href: "/docs/postgres-howtos/database-administration/backup-recovery",
          },
          {
            type: "link",
            label: "Configuration",
            href: "/docs/postgres-howtos/database-administration/configuration",
          },
          {
            type: "link",
            label: "Maintenance",
            href: "/docs/postgres-howtos/database-administration/maintenance",
          },
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
          {
            type: "link",
            label: "System monitoring",
            href: "/docs/postgres-howtos/monitoring-troubleshooting/system-monitoring",
          },
          {
            type: "link",
            label: "Lock analysis",
            href: "/docs/postgres-howtos/monitoring-troubleshooting/lock-analysis",
          },
          {
            type: "link",
            label: "Troubleshooting",
            href: "/docs/postgres-howtos/monitoring-troubleshooting/troubleshooting",
          },
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
          {
            type: "link",
            label: "DDL operations",
            href: "/docs/postgres-howtos/schema-design/ddl-operations",
          },
          {
            type: "link",
            label: "Data types",
            href: "/docs/postgres-howtos/schema-design/data-types",
          },
          {
            type: "link",
            label: "Constraints",
            href: "/docs/postgres-howtos/schema-design/constraints",
          },
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
          {
            type: "link",
            label: "psql",
            href: "/docs/postgres-howtos/development-tools/psql",
          },
          {
            type: "link",
            label: "SQL techniques",
            href: "/docs/postgres-howtos/development-tools/sql-techniques",
          },
          {
            type: "link",
            label: "Client tools",
            href: "/docs/postgres-howtos/development-tools/client-tools",
          },
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
          {
            type: "link",
            label: "Internals",
            href: "/docs/postgres-howtos/advanced-topics/internals",
          },
          {
            type: "link",
            label: "Extensions",
            href: "/docs/postgres-howtos/advanced-topics/extensions",
          },
          {
            type: "link",
            label: "Replication",
            href: "/docs/postgres-howtos/advanced-topics/replication",
          },
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

console.log('Updating sidebar to 3-level structure...');

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