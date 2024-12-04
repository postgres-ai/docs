import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { KBStats, useKBStats } from '@site/src/components/KBStats/hooks';

const srcStaticItems = [
  {
    link: 'https://github.com/postgres/postgres',
    name: 'Postgres versions 13-17',
  },
  { link: 'https://github.com/pgbackrest/pgbackrest', name: 'pgBackRest' },
  { link: 'https://github.com/pgbouncer/pgbouncer', name: 'PgBouncer' },
  { link: 'https://github.com/pgvector/pgvector', name: 'pgvector' },
  { link: 'https://github.com/HypoPG/hypopg', name: 'HypoPG' },
  {
    link: 'https://github.com/powa-team/pg_stat_kcache',
    name: 'pg_stat_kcache (PoWA)',
  },
  {
    link: 'https://github.com/lfittl/libpg_query',
    name: 'libpg_query',
  },
];

const categoriesDescriptions = {
  docs: 'documentation',
  articles: 'how-to articles, blog posts',
  src: 'source code',
  mbox: 'mailing list archives',
};

type ProcessedItem = {
  link: string;
  date: string | null;
  count: number;
}

type ProcessedCategory = {
  latestDate: string | null;
  totalCount: number | null;
  items: ProcessedItem[];
}

const processData = (data: KBStats[]) => {
  return data.reduce((acc: { [key: string]: ProcessedCategory }, item) => {
    const { category, domain, last_document_date, count, total_count } = item;
    const link = domain.startsWith('http') ? domain : `https://${domain}`;

    if (!acc[category]) {
      acc[category] = {
        latestDate: last_document_date,
        totalCount: total_count,
        items: [],
      };
    }

    if (
      last_document_date &&
      (!acc[category].latestDate || last_document_date > acc[category].latestDate)
    ) {
      acc[category].latestDate = last_document_date;
    }

    acc[category].items.push({
      link,
      date: last_document_date,
      count: count || 0,
    });

    return acc;
  }, {});
};

const generateMarkdownContent = (data: KBStats[]) => {
  const categoriesData = processData(data);

  const markdownParts = Object.entries(categoriesDescriptions)
    .map(([category, description]) => {
      const categoryData = categoriesData[category];
      const header = `- \`${category}\` – ${description}, documents count: ${categoryData?.totalCount?.toLocaleString(navigator.language)}${
        categoryData?.latestDate ? `; as of ${new Date(categoryData?.latestDate).toISOString().replace('T', ' ').split('.')[0]}` : ''
      }:\n`;

      let itemsMarkdown = '';

      if (category === 'src') {
        itemsMarkdown = srcStaticItems
          .map((item) => `  - [${item.name}](${item.link})`)
          .join('\n');
      } else if (categoryData?.items.length) {
        const sortedItems = categoryData.items.slice().sort((a, b) => b.count - a.count);

        itemsMarkdown = sortedItems
          .map((item) => {
            let itemLine = `  - [${item.link}](${item.link})`;
            if (category !== 'mbox') {
              itemLine += ` ${item.count.toLocaleString(navigator.language)} documents`;
            }
            if (item.date) {
              itemLine += ` (${new Date(item.date).toISOString().replace('T', ' ').split('.')[0]})`;
            }
            return itemLine;
          })
          .join('\n');
      }

      return itemsMarkdown ? `${header}${itemsMarkdown}` : '';
    })
    .filter(Boolean);

  const totalDocuments = Object.values(categoriesData).reduce(
    (sum, category) => sum + (category.totalCount || 0),
    0
  );

  const totalDocumentsLine = `\n**Total documents across all categories:** ${totalDocuments.toLocaleString(navigator.language)}`;

  return [...markdownParts, totalDocumentsLine].join('\n\n');
};

export const KBStatsMarkdown = () => {
  const { data, loading, error } = useKBStats();

  const markdownContent = useMemo(() => {
    if (data && data.length > 0) {
      return generateMarkdownContent(data);
    }
    return '';
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error}</p>;
  if (!data || data.length === 0) return <p>No data available</p>;

  return (
    <ReactMarkdown
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {markdownContent}
    </ReactMarkdown>
  );
};