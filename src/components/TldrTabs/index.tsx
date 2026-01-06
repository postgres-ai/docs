import React, { useState } from 'react'
import styles from './styles.module.css'
import { SimpleChat } from './SimpleChat'

/**
 * Content structure for each audience tab.
 */
type TldrContent = {
  /** Header text describing the key takeaway for this audience */
  title: string;
  /** List of bullet points with specific details */
  points: string[];
}

/**
 * Props for the TldrTabs component.
 */
type TldrTabsProps = {
  /** Content tailored for founders/executives */
  founders: TldrContent;
  /** Content tailored for developers */
  developers: TldrContent;
  /** Content tailored for DBAs */
  dbas: TldrContent;
  /** Content tailored for managers */
  managers: TldrContent;
  /** System context passed to the AI chat (for "Ask AI" tab) */
  aiContext?: string;
  /** Call-to-action button text */
  ctaText?: string;
  /** Call-to-action button link */
  ctaLink?: string;
}

const tabs = ['Founders', 'Developers', 'DBAs', 'Managers', 'Ask AI'] as const;
type TabType = typeof tabs[number];

/**
 * A tabbed TL;DR component that displays content tailored to different audiences.
 * Includes tabs for Founders, Developers, DBAs, Managers, and an AI chat tab.
 * Used in blog posts to provide quick summaries for different reader personas.
 *
 * @example
 * ```tsx
 * <TldrTabs
 *   founders={{ title: "Key for founders:", points: ["Point 1", "Point 2"] }}
 *   developers={{ title: "Key for devs:", points: ["Technical point"] }}
 *   dbas={{ title: "Key for DBAs:", points: ["DBA-specific point"] }}
 *   managers={{ title: "Key for managers:", points: ["Management point"] }}
 *   aiContext="Context for AI responses about this article"
 *   ctaText="Try it free"
 *   ctaLink="https://console.postgres.ai"
 * />
 * ```
 */
export const TldrTabs = (props: TldrTabsProps) => {
  const { founders, developers, dbas, managers, aiContext, ctaText, ctaLink } = props;
  const [activeTab, setActiveTab] = useState<TabType>('Founders');

  const getContent = (tab: TabType): TldrContent | null => {
    switch (tab) {
      case 'Founders': return founders;
      case 'Developers': return developers;
      case 'DBAs': return dbas;
      case 'Managers': return managers;
      default: return null;
    }
  };

  const content = getContent(activeTab);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.tldrLabel}>TL;DR</span>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        {activeTab === 'Ask AI' ? (
          <SimpleChat aiContext={aiContext} />
        ) : content && (
          <>
            <p className={styles.title}>{content.title}</p>
            <ul className={styles.points}>
              {content.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </>
        )}
      </div>
      {ctaText && ctaLink && (
        <div className={styles.cta}>
          <a href={ctaLink} target="_blank" rel="noopener noreferrer">
            {ctaText} →
          </a>
        </div>
      )}
    </div>
  );
};
