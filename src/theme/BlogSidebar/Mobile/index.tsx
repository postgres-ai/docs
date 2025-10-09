import React from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {NavbarSecondaryMenuFiller} from '@docusaurus/theme-common';
import clsx from 'clsx';
import type {Props} from '@theme/BlogSidebar/Mobile';

const BLOG_CATEGORIES = [
  {name: 'All posts', permalink: '/blog'},
  {name: 'Product announcements', permalink: '/blog/tags/product-announcements'},
  {name: 'Postgres insights', permalink: '/blog/tags/postgres-insights'},
  {name: 'Guides & best practices', permalink: '/blog/tags/guides-best-practices'},
  {name: 'Launch Week', permalink: '/blog/tags/launch-week'},
];

function BlogSidebarMobileSecondaryMenu({sidebar}: Props): JSX.Element {
  const location = useLocation();
  
  return (
    <ul className="menu__list">
      {BLOG_CATEGORIES.map((category) => {
        const isActive = location.pathname === category.permalink || location.pathname.startsWith(category.permalink + '/');
        
        return (
          <li key={category.permalink} className="menu__list-item">
            <Link
              to={category.permalink}
              className={clsx('menu__link', {
                'menu__link--active': isActive,
              })}>
              {category.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function BlogSidebarMobile(props: Props): JSX.Element {
  return (
    <NavbarSecondaryMenuFiller
      component={BlogSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}
