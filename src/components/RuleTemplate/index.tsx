import React from 'react';
import RulesPage from '@site/src/components/RulesPage';

interface RuleTemplateProps {
  title: string;
  description: string;
  editUrl: string;
  rawMarkdownUrl: string;
  children: React.ReactNode;
}

export default function RuleTemplate({ title, description, editUrl, rawMarkdownUrl, children }: RuleTemplateProps): JSX.Element {
  return (
    <RulesPage
      title={title}
      description={description}
      editUrl={editUrl}
      rawMarkdownUrl={rawMarkdownUrl}
    >
      {children}
    </RulesPage>
  );
} 