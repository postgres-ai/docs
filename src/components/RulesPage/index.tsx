import React from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import ContentActions from '@site/src/components/ContentActions';

interface RulesPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
  editUrl: string;
  rawMarkdownUrl: string;
}

export default function RulesPage({ title, description, children, editUrl, rawMarkdownUrl }: RulesPageProps): JSX.Element {
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
            <ContentActions rawUrl={rawMarkdownUrl} editUrl={editUrl} />
          </div>
        </div>
        
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </Layout>
  );
} 