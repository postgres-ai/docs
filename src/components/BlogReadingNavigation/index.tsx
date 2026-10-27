import React, {useEffect, useState} from 'react';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import {blogPostContainerID} from '@docusaurus/utils-common';
import TOCItems from '@theme/TOCItems';
import styles from './styles.module.css';
import MobileNavigation from './MobileNavigation';

/** Blog-only navigation; the bar measures reading progress, not loading. */
export default function BlogReadingNavigation({mobile = false}: {mobile?: boolean}) {
  const {metadata, toc} = useBlogPost();
  const [progress, setProgress] = useState(0);
  const {frontMatter, readingTime, title, permalink} = metadata;

  useEffect(() => {
    const article = document.getElementById(blogPostContainerID);
    if (!article) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = article.getBoundingClientRect();
      const navbar = document.querySelector('.navbar')?.getBoundingClientRect().bottom ?? 0;
      const distance = rect.height - (window.innerHeight - navbar);
      setProgress(Math.round(100 * Math.min(1, Math.max(0,
        distance > 0 ? (navbar - rect.top) / distance : rect.bottom <= window.innerHeight ? 1 : 0,
      ))));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(article);
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [permalink]);

  if (frontMatter.hide_table_of_contents || !toc.length) return null;
  const filled = Math.round(progress / 5);
  const content = (
    <>
      {!mobile && <div className={styles.title}>{title}</div>}
      <div className={styles.label} aria-hidden="true">ToC</div>
      <TOCItems
        toc={toc}
        minHeadingLevel={frontMatter.toc_min_heading_level}
        maxHeadingLevel={frontMatter.toc_max_heading_level ?? 3}
        className={styles.tree}
        linkClassName={`table-of-contents__link blog-tree-${mobile ? 'mobile' : 'desktop'}`}
        linkActiveClassName="table-of-contents__link--active"
      />
      <div className={styles.progress} role="progressbar" aria-label="Reading progress"
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <span aria-hidden="true"><span className={styles.filled}>{'▓'.repeat(filled)}</span>{'░'.repeat(20 - filled)}</span>
        <span aria-hidden="true">{progress}%</span>
      </div>
      {readingTime != null && <div className={styles.label}>{Math.ceil(readingTime)} MIN READ</div>}
    </>
  );
  return mobile ? (
    <MobileNavigation progress={progress} permalink={permalink}>{content}</MobileNavigation>
  ) : <nav className={styles.desktop} aria-label="Article contents">{content}</nav>;
}
