import React, { useState, useEffect } from 'react';
import { translate } from '@docusaurus/Translate';
import RulesPage from '@site/src/components/RulesPage';

interface RuleTemplateProps {
  title: string;
  description: string;
  markdownPath: string;
  editUrl: string;
  rawMarkdownUrl: string;
  children: React.ReactNode;
}

export default function RuleTemplate({ title, description, markdownPath, editUrl, rawMarkdownUrl, children }: RuleTemplateProps): JSX.Element {
  const [markdownContent, setMarkdownContent] = useState<string>('');

  useEffect(() => {
    // Fetch the raw markdown content for the copy functionality
    fetch(markdownPath)
      .then(response => response.text())
      .then(text => setMarkdownContent(text))
      .catch(err => console.error('Failed to load markdown:', err));
  }, [markdownPath]);

  return (
    <RulesPage
      title={title}
      description={description}
      markdownContent={markdownContent}
      editUrl={editUrl}
      rawMarkdownUrl={rawMarkdownUrl}
    >
      {children}
    </RulesPage>
  );
} 