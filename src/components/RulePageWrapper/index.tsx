import React from 'react';
import RuleTemplate from '@site/src/components/RuleTemplate';
import { getRuleConfig } from '@site/src/config/rules';

interface RulePageWrapperProps {
  slug: string;
  children: React.ReactNode;
}

export default function RulePageWrapper({ slug, children }: RulePageWrapperProps): JSX.Element {
  const config = getRuleConfig(slug);
  
  if (!config) {
    return (
      <div>
        <h1>Rule not found</h1>
        <p>The rule "{slug}" does not exist.</p>
      </div>
    );
  }
  
  return (
    <RuleTemplate
      title={config.title}
      description={config.description}
      markdownPath={`/content/rules/${slug}.md`}
      editUrl={`https://gitlab.com/postgres-ai/docs/-/edit/master/src/content/rules/${slug}.md`}
      rawMarkdownUrl={`/rules/${slug}.md`}
    >
      {children}
    </RuleTemplate>
  );
} 