// Homepage content. Every figure here is either sourced (comment says where) or shown on the
// page as an example.

// DBLab 4.0 post, "The O(1) revolution" (blog/20250721-dblab-engine-4-0-released.md):
// RDS db.r7i.2xlarge $730/month + 1 TiB gp2 $117.76/month per full copy;
// DBLab SE on one r7i.2xlarge $386 + $331 SE licence + 1 TiB gp3 $81.92 = $798.92/month.
export const COPY_PER_MONTH = 730 + 117.76
export const DBLAB_PER_MONTH = 386 + 331 + 81.92

// Platforms named by the monitoring product page and the DBLab docs
// (src/pages/products/postgres-ai-monitoring.md, docs/database-lab/index.md), plus ClickHouse
// Postgres, ClickHouse's managed Postgres (the strategy brief, 2026-10-01; `pgai connect`
// detects *.clickhouse.cloud).
export const WORKS_WITH = [
  { name: 'Amazon RDS', logo: 'amazonrds.png' },
  { name: 'Aurora', logo: 'amazonaurora.png' },
  { name: 'Google Cloud SQL', logo: 'googlecloudsql.png' },
  { name: 'Azure Database', logo: 'azure.png' },
  { name: 'Supabase', logo: 'supabase.png' },
  { name: 'ClickHouse Postgres', logo: 'clickhouse.png', dark: true },
  { name: 'Kubernetes', logo: 'kubernetes.svg' },
  { name: 'Self-managed', logo: 'postgresql.svg' },
]

export const LINKS = {
  checkupDocs: '/docs/checkup',
  dblabPost: '/blog/20250721-dblab-engine-4-0-released',
}
