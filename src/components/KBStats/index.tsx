import React, { useMemo } from 'react'
import { useKBStats } from '@site/src/components/KBStats/hooks'

export const KBStats = () => {
  const { data, loading, error } = useKBStats();

  const containerClassName = "container py-3 w-100"
  const containerCustomStyles = { fontSize: 14, marginTop: 100 }

  const { totalSum, lastUpdate } = useMemo(() => {
    if (!data?.length) {
      return { totalSum: 0, lastUpdate: '' };
    }

    const categoryTotals = new Map<string, number>();
    let latestDate = data[0].last_document_date;

    data.forEach(({ category, total_count, last_document_date }) => {
      categoryTotals.set(category, total_count);
      if (new Date(last_document_date) > new Date(latestDate)) {
        latestDate = last_document_date;
      }
    });

    const date = new Date(latestDate);
    const formatedDate = date.toISOString().replace('T', ' ').split('.')[0];

    const totalSum = Array.from(categoryTotals.values()).reduce((sum, count) => sum + count, 0);
    return { totalSum, lastUpdate: formatedDate };
  }, [data]);

  if (error || loading || !data?.length) {
    return <div className={containerClassName} style={{ ...containerCustomStyles, height: 101 }}></div>;
  }

  return (
    <div className={containerClassName} style={containerCustomStyles}>
      Knowledge base contains {totalSum.toLocaleString(navigator.language)} documents. <br />
      Last updated: {lastUpdate}. <br />
      <a
        href="/docs/reference-guides/postgres-ai-bot-reference#tool-rag_search"
        target="_blank"
        style={{
          color: 'var(--ifm-link-color)',
        }}
      >
        Details
      </a>
    </div>
  );
}