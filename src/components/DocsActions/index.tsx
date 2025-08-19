import React, { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ContentActions from '@site/src/components/ContentActions';

export default function DocsActions(): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const [pathname, setPathname] = useState<string>('');

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  // Compute values unconditionally to keep hooks order stable
  const isDocsPage = pathname.startsWith('/docs/') && pathname !== '/docs/' && !pathname.includes('/index');

  const relativePath = pathname.replace('/docs/', '');
  const editUrl = `https://gitlab.com/postgres-ai/docs/-/edit/master/docs/${relativePath}.md`;
  const rawUrl = `/raw/docs/${relativePath}.md`;

  if (!isDocsPage) {
    return null;
  }

  return <ContentActions rawUrl={rawUrl} editUrl={editUrl} />;
} 