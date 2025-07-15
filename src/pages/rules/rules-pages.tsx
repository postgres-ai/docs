import React from 'react';
import RulePageWrapper from '@site/src/components/RulePageWrapper';
import { ruleConfigs } from '@site/src/config/rules';

// Import all rule content
import SqlStyleContent from '@site/src/content/rules/sql-style.md';
import PostgresHackingContent from '@site/src/content/rules/postgres-hacking.md';
import DbDesignContent from '@site/src/content/rules/db-design.md';

// Map slugs to their content components
const contentComponents = {
  'sql-style': SqlStyleContent,
  'postgres-hacking': PostgresHackingContent,
  'db-design': DbDesignContent,
};

// Factory function to create rule page components
function createRulePage(slug: string) {
  const ContentComponent = contentComponents[slug];
  
  if (!ContentComponent) {
    throw new Error(`No content component found for rule: ${slug}`);
  }
  
  return function RulePage(): JSX.Element {
    return (
      <RulePageWrapper slug={slug}>
        <ContentComponent />
      </RulePageWrapper>
    );
  };
}

// Export all rule page components
export const SqlStylePage = createRulePage('sql-style');
export const PostgresHackingPage = createRulePage('postgres-hacking');
export const DbDesignPage = createRulePage('db-design');

// Export default (not used but keeps TypeScript happy)
export default SqlStylePage; 