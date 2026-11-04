import React from 'react'
import Head from '@docusaurus/Head'

// Schema.org JSON-LD for search engines and AI answer engines.
// Values must be facts already stated on the page or elsewhere on the site.

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': 'https://postgres.ai/#organization',
  name: 'PostgresAI',
  url: 'https://postgres.ai/',
  description:
    'Zero drama Postgres. We fix Postgres trouble and keep it fixed. Every change, upgrades included, is rehearsed on a full copy of your data with evidence before it lands.',
  logo: 'https://postgres.ai/web-app-manifest-512x512.png',
  email: 'consulting@postgres.ai',
  sameAs: [
    'https://github.com/postgres-ai',
    'https://gitlab.com/postgres-ai',
    'https://www.linkedin.com/company/postgres-ai',
    'https://twitter.com/postgres_ai',
    'https://www.youtube.com/PostgresTV',
  ],
}

// Product docs pages that get a SoftwareApplication block, keyed by doc id.
// Kept here rather than in the markdown so /raw/docs/ stays clean.
export const DOC_JSON_LD: Record<string, Record<string, unknown>> = {
  'monitoring/index': {
    '@type': 'SoftwareApplication',
    name: 'PostgresAI monitoring',
    url: 'https://postgres.ai/docs/monitoring',
    description:
      'AI-native PostgreSQL observability: monitoring, health checks, and root cause analysis, built for humans and AI agents.',
    applicationCategory: 'DeveloperApplication',
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
    sameAs: ['https://gitlab.com/postgres-ai/postgresai'],
    publisher: ORGANIZATION,
  },
}

type Props = { data: Record<string, unknown> }

export default function JsonLd({ data }: Props): JSX.Element {
  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify({ '@context': 'https://schema.org', ...data })}
      </script>
    </Head>
  )
}
