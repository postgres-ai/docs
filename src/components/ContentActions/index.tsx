import React, { useState } from 'react';
import styles from '@site/src/components/DocsActions/styles.module.css';

interface ContentActionsProps {
  rawUrl: string;
  editUrl: string;
  copyLabel?: string;
}

export default function ContentActions({ rawUrl, editUrl, copyLabel = 'Copy for LLM' }: ContentActionsProps): JSX.Element {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle');

  const handleCopy = async () => {
    setCopyStatus('copying');
    try {
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const markdownText = await response.text();
      await navigator.clipboard.writeText(markdownText);
      setCopyStatus('copied');
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy markdown:', error);
      setCopyStatus('idle');
    }
  };

  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'copying':
        return 'Copying...';
      case 'copied':
        return 'Copied!';
      default:
        return copyLabel;
    }
  };

  return (
    <div className={styles.docsActions}>
      <button 
        className={`${styles.docsActionButton} ${
          copyStatus === 'copying' ? styles.copying : 
          copyStatus === 'copied' ? styles.success : ''
        }`}
        onClick={handleCopy}
        disabled={copyStatus === 'copying'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        {getCopyButtonText()}
      </button>
      <a 
        href={rawUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.docsActionButton}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
        View raw
      </a>
      <a 
        href={editUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.docsActionButton}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Edit
      </a>
    </div>
  );
}


