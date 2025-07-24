const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

// Function to get all markdown files in a directory
function getMarkdownFiles(dir) {
  return glob.sync(path.join(dir, '*.md'))
    .filter(file => !file.endsWith('/index.md'))
    .sort();
}

// Function to get title from frontmatter
function getTitleFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);
    return data.title || path.basename(filePath, '.md').replace(/-/g, ' ');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return path.basename(filePath, '.md').replace(/-/g, ' ');
  }
}

// Build the postgres-howtos section with 4 levels
const postgresHowtosSection = [
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
        type: "category",
        label: "Query tuning",
        link: {
          type: "doc",
          id: "postgres-howtos/performance-optimization/query-tuning/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/performance-optimization/query-tuning'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Indexing",
        link: {
          type: "doc",
          id: "postgres-howtos/performance-optimization/indexing/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/performance-optimization/indexing'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Monitoring & statistics",
        link: {
          type: "doc",
          id: "postgres-howtos/performance-optimization/statistics/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/performance-optimization/statistics'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
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
        type: "category",
        label: "Backup & recovery",
        link: {
          type: "doc",
          id: "postgres-howtos/database-administration/backup-recovery/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/database-administration/backup-recovery'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Configuration",
        link: {
          type: "doc",
          id: "postgres-howtos/database-administration/configuration/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/database-administration/configuration'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Maintenance",
        link: {
          type: "doc",
          id: "postgres-howtos/database-administration/maintenance/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/database-administration/maintenance'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
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
        type: "category",
        label: "System monitoring",
        link: {
          type: "doc",
          id: "postgres-howtos/monitoring-troubleshooting/system-monitoring/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/monitoring-troubleshooting/system-monitoring'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Lock analysis",
        link: {
          type: "doc",
          id: "postgres-howtos/monitoring-troubleshooting/lock-analysis/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/monitoring-troubleshooting/lock-analysis'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Troubleshooting",
        link: {
          type: "doc",
          id: "postgres-howtos/monitoring-troubleshooting/troubleshooting/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/monitoring-troubleshooting/troubleshooting'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
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
        type: "category",
        label: "DDL operations",
        link: {
          type: "doc",
          id: "postgres-howtos/schema-design/ddl-operations/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/schema-design/ddl-operations'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Data types",
        link: {
          type: "doc",
          id: "postgres-howtos/schema-design/data-types/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/schema-design/data-types'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Constraints",
        link: {
          type: "doc",
          id: "postgres-howtos/schema-design/constraints/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/schema-design/constraints'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
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
        type: "category",
        label: "psql",
        link: {
          type: "doc",
          id: "postgres-howtos/development-tools/psql/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/development-tools/psql'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "SQL techniques",
        link: {
          type: "doc",
          id: "postgres-howtos/development-tools/sql-techniques/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/development-tools/sql-techniques'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Client tools",
        link: {
          type: "doc",
          id: "postgres-howtos/development-tools/client-tools/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/development-tools/client-tools'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
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
        type: "category",
        label: "Internals",
        link: {
          type: "doc",
          id: "postgres-howtos/advanced-topics/internals/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/advanced-topics/internals'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Extensions",
        link: {
          type: "doc",
          id: "postgres-howtos/advanced-topics/extensions/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/advanced-topics/extensions'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
      },
      {
        type: "category",
        label: "Replication",
        link: {
          type: "doc",
          id: "postgres-howtos/advanced-topics/replication/index",
        },
        items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/advanced-topics/replication'))
          .map(file => {
            const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
            return docId;
          }),
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
    items: getMarkdownFiles(path.join(__dirname, '../docs/postgres-howtos/miscellaneous'))
      .map(file => {
        const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
        return docId;
      }),
  },
];

// Read the current sidebars.js
const sidebarPath = path.join(__dirname, '../sidebars.js');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Update the Postgres how-tos section
const updatedContent = sidebarContent.replace(
  /"Postgres how-tos": \[[\s\S]*?\],\s*"Reference guides":/,
  `"Postgres how-tos": ${JSON.stringify(postgresHowtosSection, null, 2).replace(/\n/g, '\n    ')},
    "Reference guides":`
);

// Write the updated sidebar
fs.writeFileSync(sidebarPath, updatedContent);

console.log('✅ Updated sidebars.js with 4-level navigation showing all article titles');