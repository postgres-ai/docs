# PostgreSQL How-to Guides Implementation Plan

## Overview
Implementation plan for integrating 94 PostgreSQL how-to articles from the postgres-howtos repository into postgres.ai/docs/postgres-howtos.

## Current Status
- ✅ postgres-howtos directory already exists in docs/
- ✅ Sidebar configuration exists but is commented out
- ✅ 94 articles ready in postgres-howtos repository
- ✅ Categorization strategy already developed
- ✅ 79 articles successfully integrated (94 minus 2 excluded, 13 in series to be merged later)
- ✅ All build errors resolved
- ✅ UI fixes completed (duplicate titles, daily posting comments, descriptions)

## Phase 1: Infrastructure Setup (Week 1)

### 1.1 Activate postgres-howtos Section
- [ ] Uncomment postgres-howtos configuration in sidebars.js
- [ ] Add to navbar dropdown in docusaurus.config.js
- [ ] Create base directory structure matching proposed_structure.md

### 1.2 Create Processing Pipeline
- [ ] Script to copy articles from postgres-howtos repo
- [ ] Add frontmatter generation (title, description, keywords)
- [ ] Handle image assets from files/ directory
- [ ] Exclude frost patterns and quit psql articles

### 1.3 Setup Category Structure
```
docs/postgres-howtos/
├── index.md (landing page)
├── performance-optimization/
│   ├── index.md
│   ├── query-tuning/
│   ├── indexing/
│   └── statistics/
├── database-administration/
│   ├── index.md
│   ├── maintenance/
│   ├── backup-recovery/
│   └── configuration/
├── monitoring-troubleshooting/
│   ├── index.md
│   ├── system-monitoring/
│   ├── lock-analysis/
│   └── troubleshooting/
├── schema-design/
│   ├── index.md
│   ├── ddl-operations/
│   ├── data-types/
│   └── constraints/
├── development-tools/
│   ├── index.md
│   ├── psql/
│   ├── sql-techniques/
│   └── client-tools/
└── advanced-topics/
    ├── index.md
    ├── internals/
    ├── extensions/
    └── replication/
```

## Phase 2: Content Processing (Week 2)

### 2.1 Merge Article Series
Merge the 6 identified multi-part series:
1. pg_stat_statements (3 parts) → comprehensive guide
2. Heavyweight locks (3 parts) → unified lock analysis guide
3. Arrays (2 parts) → complete arrays guide
4. How to break a database (3 parts) → database corruption guide
5. Index creation (2 parts) → index creation best practices
6. Resolve btree checking duplicate

### 2.2 Process Individual Articles
- [ ] Add frontmatter to all articles:
  ```yaml
  ---
  title: "How to Analyze Query Performance"
  sidebar_label: "Query Performance Analysis"
  description: "Learn how to use EXPLAIN ANALYZE BUFFERS for query optimization"
  keywords: [postgresql, performance, explain, analyze, query optimization]
  tags: [performance, intermediate]
  difficulty: intermediate
  estimated_time: "10 min"
  postgresql_version: "12+"
  ---
  ```

### 2.3 Update Internal Links
- [ ] Convert file references to proper documentation links
- [ ] Ensure image paths work with Docusaurus asset system
- [ ] Add cross-references between related articles

## Phase 3: Navigation & Discovery (Week 3)

### 3.1 Create Landing Pages
- [ ] Main postgres-howtos index with overview
- [ ] Category index pages with article listings
- [ ] Add breadcrumb navigation

### 3.2 Implement Special Collections
Create curated collections for common use cases:
- [ ] "Quick Wins" - Performance improvements < 30 min
- [ ] "Production Emergency" - Critical troubleshooting guides
- [ ] "Migration Paths" - Version upgrade guides
- [ ] "New DBA Essentials" - Must-know basics

### 3.3 Add Metadata & Filtering
- [ ] Difficulty indicators (beginner/intermediate/advanced)
- [ ] Time estimates for each guide
- [ ] PostgreSQL version requirements
- [ ] Tag-based filtering system

## Phase 4: Integration & Enhancement (Week 4)

### 4.1 Search Integration
- [ ] Ensure all howtos are indexed by Docusaurus search
- [ ] Add search keywords to frontmatter
- [ ] Create search-friendly titles and descriptions

### 4.2 Cross-linking with Existing Docs
- [ ] Link from platform docs to relevant howtos
- [ ] Add "Related How-tos" sections
- [ ] Update main documentation navigation

### 4.3 Quality Assurance
- [ ] Validate all links and images
- [ ] Test navigation on mobile/desktop
- [ ] Ensure consistent formatting
- [ ] Check code syntax highlighting

## Technical Implementation Details

### Content Processing Script (pseudo-code)
```javascript
// 1. Read article from postgres-howtos
// 2. Extract title from first # heading
// 3. Generate frontmatter
// 4. Copy images to static/img/postgres-howtos/
// 5. Update image paths in content
// 6. Write to appropriate category directory
// 7. Update sidebars.js configuration
```

### Sidebar Configuration Structure
```javascript
{
  type: 'category',
  label: 'PostgreSQL How-to Guides',
  link: {
    type: 'doc',
    id: 'postgres-howtos/index',
  },
  items: [
    {
      type: 'category',
      label: 'Performance & Optimization',
      items: [
        'postgres-howtos/performance-optimization/query-tuning/explain-analyze',
        // ... more items
      ]
    },
    // ... more categories
  ]
}
```

## Success Metrics
- All 92 articles (94 minus 2 excluded) successfully integrated
- Clear navigation structure with 6 main categories
- Search functionality working across all howtos
- Mobile-responsive design
- Fast page load times
- Positive user feedback on organization

## Timeline
- **Week 1**: Infrastructure setup and activation
- **Week 2**: Content processing and migration
- **Week 3**: Navigation and discovery features
- **Week 4**: Integration, testing, and launch

## Next Steps
1. Review and approve this plan
2. Set up development branch
3. Begin Phase 1 implementation
4. Create automated tests for validation