import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useThemeConfig} from '@docusaurus/theme-common';
import Logo from '@theme/Logo';
import styles from './styles.module.css';

const START = Date.UTC(2026, 9, 19);
const END = Date.UTC(2026, 10, 1);

export default function NavbarLogo() {
  // Match server output during hydration; never bake seasonal art into static HTML.
  const [seasonal, setSeasonal] = useState(false);
  const {navbar: {title, logo}} = useThemeConfig();
  const {siteConfig} = useDocusaurusContext();
  const href = useBaseUrl(logo?.href || '/');
  const image = useBaseUrl('/img/logo-halloween-2026.svg');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      const now = Date.now();
      setSeasonal(now >= START && now < END);
      const boundary = now < START ? START : END;
      if (now < boundary) timer = setTimeout(refresh, Math.min(boundary - now, 86400000));
    };
    refresh();
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  if (!seasonal || !logo) return <Logo className="navbar__brand" imageClassName="navbar__logo" titleClassName="navbar__title text--truncate" />;

  return <Link to={href} target={logo.target} className={`navbar__brand ${styles.seasonal}`} data-seasonal-logo="halloween-2026">
    <div className="navbar__logo">
      <img src={image} alt={logo.alt ?? (title ? '' : siteConfig.title)} width={logo.width} height={logo.height} className={logo.className} style={logo.style} />
    </div>
    {title != null && <b className="navbar__title text--truncate">{title}</b>}
  </Link>;
}
