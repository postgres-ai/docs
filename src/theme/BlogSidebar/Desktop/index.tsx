import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import type {Props} from '@theme/BlogSidebar/Desktop';

import styles from './styles.module.css';

const BLOG_CATEGORIES = [
  {name: 'All posts', permalink: '/blog'},
  {name: 'Product announcements', permalink: '/blog/tags/product-announcements'},
  {name: 'Postgres insights', permalink: '/blog/tags/postgres-insights'},
  {name: 'Guides and best practices', permalink: '/blog/tags/guides-and-best-practices'},
  {name: '#PostgresMarathon', permalink: '/blog/tags/postgres-marathon'},
  {name: 'Launch Week', permalink: '/blog/tags/launch-week'},
];

// Same links as the site footer (docusaurus.config.js)
const FOLLOW = [
  {name: 'RSS feed', href: '/blog/rss.xml'},
  {name: 'X @postgres_ai', href: 'https://twitter.com/postgres_ai'},
  {name: 'LinkedIn', href: 'https://www.linkedin.com/company/postgres-ai'},
];

// Number of recent posts listed; blogSidebarCount in docusaurus.config.js must be at least this
const LATEST = 5;

const shortDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'});

export default function BlogSidebarDesktop({sidebar}: Props): JSX.Element {
  const location = useLocation();
  const latest = sidebar.items.filter((item) => !item.unlisted).slice(0, LATEST);

  return (
    <aside className="col col--3 p-0" style={{'--ifm-col-width': '240px'} as React.CSSProperties}>
      <nav className={clsx(styles.sidebar, 'thin-scrollbar')} aria-label="Blog">
        <p className={styles.sectionLabel}>Topics</p>
        <ul className={clsx(styles.sidebarItemList, 'clean-list')}>
          {BLOG_CATEGORIES.map((category) => {
            const isActive = location.pathname === category.permalink ||
                            location.pathname.startsWith(category.permalink + '/');

            return (
              <li key={category.permalink} className={styles.sidebarItem}>
                <Link
                  to={category.permalink}
                  className={clsx(styles.sidebarItemLink, {
                    [styles.sidebarItemLinkActive]: isActive,
                  })}>
                  {category.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {latest.length > 0 && (
          <>
            <p className={styles.sectionLabel}>Latest</p>
            <ul className={clsx(styles.latestList, 'clean-list')}>
              {latest.map((item) => (
                <li key={item.permalink} className={styles.latestItem}>
                  <Link to={item.permalink} className={styles.latestLink}>
                    {item.title}
                  </Link>
                  <span className={styles.latestDate}>{shortDate(item.date)}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className={styles.sectionLabel}>Listen</p>
        <div className={styles.card}>
          <Link href="https://postgres.fm" className={styles.cardTitle}>Postgres.FM</Link>
          <p className={styles.cardText}>The podcast about Postgres. Some posts here are companions to an episode.</p>
          <div className={styles.cardLinks}>
            <Link href="https://postgres.fm">Episodes</Link>
            <Link href="https://www.youtube.com/PostgresTV">YouTube</Link>
          </div>
        </div>

        <p className={styles.sectionLabel}>Follow</p>
        <ul className={clsx(styles.sidebarItemList, 'clean-list')}>
          {FOLLOW.map((f) => (
            <li key={f.href} className={styles.sidebarItem}>
              <Link href={f.href} className={styles.sidebarItemLink}>{f.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
