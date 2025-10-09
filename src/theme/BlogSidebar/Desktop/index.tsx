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
  {name: 'Guides & best practices', permalink: '/blog/tags/guides-best-practices'},
  {name: 'Launch Week', permalink: '/blog/tags/launch-week'},
];

export default function BlogSidebarDesktop({sidebar}: Props): JSX.Element {
  const location = useLocation();
  
  return (
    <aside className="col col--3 p-0" style={{'--ifm-col-width': '240px'} as React.CSSProperties}>
      <nav className={clsx(styles.sidebar, 'thin-scrollbar')}>
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
      </nav>
    </aside>
  );
}
