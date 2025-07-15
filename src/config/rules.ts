export interface RuleConfig {
  title: string;
  description: string;
  slug: string;
}

export const ruleConfigs: Record<string, RuleConfig> = {
  'sql-style': {
    title: 'SQL style guide',
    description: 'Best practices for writing SQL queries and database interactions',
    slug: 'sql-style'
  },
  'postgres-hacking': {
    title: 'Postgres hacking', 
    description: 'Development environment setup and best practices for PostgreSQL core development',
    slug: 'postgres-hacking'
  },
  'db-design': {
    title: 'DB design principles',
    description: 'Database design principles and best practices for PostgreSQL schema design',
    slug: 'db-design'
  }
};

export function getRuleConfig(slug: string): RuleConfig | undefined {
  return ruleConfigs[slug];
} 