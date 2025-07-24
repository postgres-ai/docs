import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

interface RulesPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
  markdownContent: string;
  editUrl: string;
  rawMarkdownUrl: string;
}

export default function RulesPage({ title, description, children, markdownContent, editUrl, rawMarkdownUrl }: RulesPageProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Layout title={title} description={description}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link to="/rules" className={styles.backLink}>
            ← Back to AI rules
          </Link>
        </div>
        
        <div className={styles.header}>
          <h1>{title}</h1>
          <div className={styles.actions}>
            <span 
              onClick={copyToClipboard}
              className={styles.textLink}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && copyToClipboard()}
            >
              {copied ? 'Copied!' : 'Copy for LLM'}
            </span>
            <span className={styles.separator}> | </span>
            <a
              href={rawMarkdownUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.textLink}
            >
              View raw
            </a>
            <span className={styles.separator}> | </span>
            <a
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.textLink}
            >
              Edit
            </a>
          </div>
        </div>
        
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </Layout>
  );
} 