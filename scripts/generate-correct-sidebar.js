const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

// Function to get all markdown files in a directory
function getMarkdownFiles(dir) {
  const docsDir = dir.replace(/^.*\/static\//, '/docs/');
  return glob.sync(path.join(__dirname, '..', docsDir, '*.md'))
    .filter(file => !file.endsWith('/index.md'))
    .sort()
    .map(file => {
      const docId = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '');
      const content = fs.readFileSync(file, 'utf8');
      const { data } = matter(content);
      return {
        docId,
        title: data.title || path.basename(file, '.md').replace(/-/g, ' ')
      };
    });
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
        items: getMarkdownFiles('/static/postgres-howtos/performance-optimization/query-tuning')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Indexing",
        link: {
          type: "doc",
          id: "postgres-howtos/performance-optimization/indexing/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/performance-optimization/indexing')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Monitoring & statistics",
        link: {
          type: "doc",
          id: "postgres-howtos/performance-optimization/statistics/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/performance-optimization/statistics')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
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
        items: getMarkdownFiles('/static/postgres-howtos/database-administration/backup-recovery')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Configuration",
        link: {
          type: "doc",
          id: "postgres-howtos/database-administration/configuration/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/database-administration/configuration')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Maintenance",
        link: {
          type: "doc",
          id: "postgres-howtos/database-administration/maintenance/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/database-administration/maintenance')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
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
        items: getMarkdownFiles('/static/postgres-howtos/monitoring-troubleshooting/system-monitoring')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Lock analysis",
        link: {
          type: "doc",
          id: "postgres-howtos/monitoring-troubleshooting/lock-analysis/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/monitoring-troubleshooting/lock-analysis')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Troubleshooting",
        link: {
          type: "doc",
          id: "postgres-howtos/monitoring-troubleshooting/troubleshooting/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/monitoring-troubleshooting/troubleshooting')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
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
        items: getMarkdownFiles('/static/postgres-howtos/schema-design/ddl-operations')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Data types",
        link: {
          type: "doc",
          id: "postgres-howtos/schema-design/data-types/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/schema-design/data-types')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Constraints",
        link: {
          type: "doc",
          id: "postgres-howtos/schema-design/constraints/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/schema-design/constraints')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
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
        items: getMarkdownFiles('/static/postgres-howtos/development-tools/psql')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "SQL techniques",
        link: {
          type: "doc",
          id: "postgres-howtos/development-tools/sql-techniques/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/development-tools/sql-techniques')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Client tools",
        link: {
          type: "doc",
          id: "postgres-howtos/development-tools/client-tools/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/development-tools/client-tools')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
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
        items: getMarkdownFiles('/static/postgres-howtos/advanced-topics/internals')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Extensions",
        link: {
          type: "doc",
          id: "postgres-howtos/advanced-topics/extensions/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/advanced-topics/extensions')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
      },
      {
        type: "category",
        label: "Replication",
        link: {
          type: "doc",
          id: "postgres-howtos/advanced-topics/replication/index",
        },
        items: getMarkdownFiles('/static/postgres-howtos/advanced-topics/replication')
          .map(item => ({
            type: "doc",
            id: item.docId,
            label: item.title
          })),
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
    items: getMarkdownFiles('/static/postgres-howtos/miscellaneous')
      .map(item => ({
        type: "doc",
        id: item.docId,
        label: item.title
      })),
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

console.log('✅ Generated sidebar with correct document IDs and original titles');