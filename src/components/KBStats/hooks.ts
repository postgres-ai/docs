import { useEffect, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export type KBStats = {
  category: 'articles' | 'docs' | 'src' | 'mbox',
  domain: string,
  total_count: number,
  count: number,
  last_document_date: string
}

type UseKBStats = {
  data: KBStats[] | null,
  error: string | null,
  loading: boolean
}

export const useKBStats = (): UseKBStats => {
  const { siteConfig } = useDocusaurusContext();
  const [data, setData] = useState<KBStats[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${siteConfig.customFields.apiUrlPrefix}/kb_category_domain_counts`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch(console.error);
  }, []);

  return { data, loading, error };
};