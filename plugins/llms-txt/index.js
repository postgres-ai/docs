// Generates /llms.txt and /llms-full.txt (https://llmstxt.org) at build time.
//
// llms.txt is an index: curated product links, then every listed doc grouped
// by section, then an "Optional" section. llms-full.txt concatenates the raw
// markdown of every listed doc, each headed by its absolute page URL.
//
// Every doc entry links its HTML page first and its raw markdown twin under
// /raw/docs/ second, so agents can fetch plain text directly.
//
// Titles and descriptions come from the loaded docs/blog content (frontmatter,
// or the excerpt Docusaurus derives when `description` is missing). The
// curated entries below use the canonical one-liners from the live pages.

const fs = require('fs')
const path = require('path')

const { SITE_NAME } = require('../../src/config/site.json')

const SITE_SUMMARY =
  'Zero drama Postgres. We fix Postgres trouble and keep it fixed. Every change, upgrades included, is rehearsed on a full copy of your data with evidence before it lands.'

const MONITORING_LINE =
  'AI-native PostgreSQL observability: monitoring, health checks, and root cause analysis, built for humans and AI agents.'

const DBLAB_LINE =
  'Instant, thin database branching and cloning for any Postgres database, with fixed storage and compute costs for development, testing, and CI/CD.'

const HOWTOS_LINE =
  'How-to guides for PostgreSQL database management, optimization, and best practices.'

const CLI_NOTE =
  'CLI: `npx postgresai@0.17.0` (check the current version with `npm view postgresai version`; `pgai` is the short alias).'

// Curated product and company pages. `doc` takes the title/description from
// that doc; `page` entries carry text quoted from the page itself.
const PRODUCTS = [
  {
    doc: 'monitoring/index',
    title: 'PostgresAI monitoring',
    description: `${MONITORING_LINE} ${CLI_NOTE}`,
  },
  {
    page: '/postgres-check',
    title: 'Free Postgres health check',
    description:
      'Find hidden issues in your Postgres database. Free health check in 60 seconds. No setup. No credit card. Just answers.',
  },
  { doc: 'checkup/index', title: 'postgres-checkup' },
  {
    href: 'https://pgtrue.postgres.ai/',
    title: 'pgTrue',
    description:
      'Postgres articles, fact-checked claim by claim against the PostgreSQL source code. Every finding cites the source line or the test that settles it.',
  },
  {
    page: '/products/dblab_engine/',
    title: 'DBLab Engine',
    description: DBLAB_LINE,
  },
  { doc: 'database-lab/index', title: 'DBLab Engine documentation' },
  {
    href: 'https://github.com/postgres-ai/database-lab-engine',
    title: 'DBLab Engine source code',
    description: 'Open-source DBLab Engine repository on GitHub.',
  },
  {
    doc: 'postgres-howtos/index',
    title: 'Postgres how-tos',
    description: HOWTOS_LINE,
  },
  {
    page: '/products/postgres-ai-zdu',
    title: 'Zero-downtime Postgres major upgrades',
    description:
      'Physical-to-logical replication technique for zero-downtime, reversible, zero-data-loss Postgres major version upgrades, proven on multi-terabyte production clusters.',
  },
  {
    page: '/products/joe',
    title: 'Joe Bot',
    description: 'Joe Bot, a virtual DBA for SQL optimization.',
  },
]

const COMPANY = [
  {
    page: '/pricing',
    title: 'Pricing',
    description: 'Plans (Hobby, Express, Scale, Enterprise) and the DBLab Engine add-on.',
  },
  {
    page: '/consulting',
    title: 'Postgres consulting',
    description:
      'PostgresAI team help for fast-growing companies hitting Postgres bottlenecks (managed or self-managed). Contact: consulting@postgres.ai.',
  },
  {
    page: '/security',
    title: 'Security and compliance',
    description:
      'The PostgresAI Platform has completed a SOC 2 Type 2 examination for the Security and Availability Trust Services Criteria.',
  },
  { page: '/contact', title: 'Contact PostgresAI', description: 'How to reach the PostgresAI team.' },
]

const OPTIONAL_LINKS = [
  { page: '/resources/', title: 'Case studies', description: 'Customer case studies.' },
  { href: 'https://pgtrue.postgres.ai/llms.txt', title: 'pgTrue llms.txt', description: 'Index of pgTrue fact-check reports.' },
  { href: 'https://postgres.fm', title: 'Postgres FM', description: 'A weekly podcast about all things PostgreSQL.' },
  { href: 'https://www.youtube.com/PostgresTV', title: 'Postgres.TV', description: 'YouTube channel.' },
  { page: '/tos/', title: 'Terms of service', description: 'Terms of service.' },
  { page: '/privacy/', title: 'Privacy policy', description: 'Privacy policy.' },
]

// Docs sections, keyed by the first segment of the doc id, in output order.
const DOC_SECTIONS = [
  ['', 'Docs: overview'],
  ['postgresai-howtos', 'Docs: PostgresAI how-tos'],
  ['monitoring', 'Docs: PostgresAI monitoring'],
  ['checkup', 'Docs: checkup'],
  ['platform', 'Docs: PostgresAI platform'],
  ['database-lab', 'Docs: DBLab Engine'],
  ['dblab-howtos', 'Docs: DBLab how-tos'],
  ['tutorials', 'Docs: tutorials'],
  ['data-access', 'Docs: data access'],
  ['data-recovery', 'Docs: data recovery'],
  ['joe-bot', 'Docs: Joe Bot'],
  ['reference-guides', 'Docs: reference guides'],
  ['postgres-howtos', 'Postgres how-tos'],
]

// Docs that belong in "Optional" rather than their section.
const OPTIONAL_DOC_IDS = new Set(['roadmap'])

// Recent posts shown in the main Blog section; the rest go to Optional.
const RECENT_POSTS = 10

function oneLine(text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function escapeTitle(title) {
  return oneLine(title).replace(/([[\]])/g, '\\$1')
}

// Keep one line per entry short: cut long descriptions at a sentence end.
const MAX_DESCRIPTION = 240

function shorten(text) {
  const t = oneLine(text)
  if (t.length <= MAX_DESCRIPTION) return t
  const cut = t.slice(0, MAX_DESCRIPTION).match(/^.*[.!?](?=\s)/)
  return cut ? cut[0] : t.slice(0, MAX_DESCRIPTION).replace(/\s+\S*$/, '') + '…'
}


// `- [Title](url): description [Markdown](raw-url)`; the first link is the
// entry, the markdown twin rides in the notes.
function link({ title, url, description, markdown }) {
  const notes = [shorten(description), markdown && `[Markdown](${markdown})`]
    .filter(Boolean)
    .join(' ')
  return `- [${escapeTitle(title)}](${url})${notes ? `: ${notes}` : ''}`
}

function stripFrontMatter(source) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
}

// Returns a per-line check: true for a ``` or ~~~ fence line and every line
// inside a fenced block.
function fenceTracker() {
  let fence = null
  return (line) => {
    const fenceMatch = line.trim().match(/^(`{3,}|~{3,})/)
    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = null
      return true
    }
    if (fenceMatch) fence = fenceMatch[1]
    return Boolean(fenceMatch)
  }
}

// Drop top-level MDX import/export lines; they carry no prose. Lines inside
// ``` or ~~~ fences are code (e.g. shell `export VAR=`) and stay.
function stripMdxModuleLines(source) {
  const inCode = fenceTracker()
  return source
    .split('\n')
    .filter((line) => inCode(line) || !/^(import|export)\s/.test(line))
    .join('\n')
}

// Inline code span: a run of backticks closed by a run of the same length.
const INLINE_CODE = /(?<!`)(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g

// Site-relative links become absolute so they work outside the site. Code
// (fenced blocks and inline spans) stays as the docs show it.
function absolutizeLinks(source, siteUrl) {
  const rewrite = (text) =>
    text
      .replace(/\]\(\//g, `](${siteUrl}/`)
      .replace(/(href|src)=(['"])\//g, `$1=$2${siteUrl}/`)
  const inCode = fenceTracker()
  return source
    .split('\n')
    .map((line) => {
      if (inCode(line)) return line
      let out = ''
      let last = 0
      for (const m of line.matchAll(INLINE_CODE)) {
        out += rewrite(line.slice(last, m.index)) + m[0]
        last = m.index + m[0].length
      }
      return out + rewrite(line.slice(last))
    })
    .join('\n')
}

module.exports = function llmsTxtPlugin(context) {
  const { siteDir, siteConfig } = context
  const siteUrl = siteConfig.url.replace(/\/+$/, '')
  const abs = (p) => siteUrl + p
  let docs = []
  let posts = []

  return {
    name: 'llms-txt',

    async allContentLoaded({ allContent }) {
      const docsContent = allContent['docusaurus-plugin-content-docs']?.default
      const version = docsContent?.loadedVersions?.[0]
      docs = (version?.docs || []).filter((d) => !d.unlisted && !d.draft)

      const blogContent = allContent['docusaurus-plugin-content-blog']?.default
      posts = (blogContent?.blogPosts || [])
        .map((p) => p.metadata)
        .filter((m) => !m.unlisted)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    },

    async postBuild({ outDir }) {
      const byId = new Map(docs.map((d) => [d.id, d]))
      const docsDir = path.join(siteDir, 'docs')
      const sourceOf = (d) => path.join(siteDir, d.source.replace(/^@site\//, ''))
      const rawUrl = (d) =>
        abs('/raw/docs/' + path.relative(docsDir, sourceOf(d)).split(path.sep).join('/'))
      const docLink = (d) =>
        link({ title: d.title, url: abs(d.permalink), description: d.description, markdown: rawUrl(d) })

      const resolve = (entry) => {
        if (entry.doc) {
          const d = byId.get(entry.doc)
          if (!d) throw new Error(`llms-txt: unknown doc id "${entry.doc}"`)
          return {
            title: entry.title || d.title,
            url: abs(d.permalink),
            description: entry.description || d.description,
            markdown: rawUrl(d),
          }
        }
        return { title: entry.title, url: entry.href || abs(entry.page), description: entry.description }
      }

      const out = []
      out.push(`# ${SITE_NAME}`, '')
      out.push(`> ${SITE_SUMMARY}`, '')
      out.push(
        `Raw markdown of every docs page is served under ${abs('/raw/docs/')} ` +
          `(the source path of the page). The full docs as one file: ${abs('/llms-full.txt')}.`,
        ''
      )

      out.push('## Products', '', ...PRODUCTS.map((e) => link(resolve(e))), '')
      out.push('## Company', '', ...COMPANY.map((e) => link(resolve(e))), '')

      const sectionOf = (d) => (d.id.includes('/') ? d.id.split('/')[0] : '')
      const known = new Set(DOC_SECTIONS.map(([key]) => key))
      for (const d of docs) {
        if (!known.has(sectionOf(d))) {
          throw new Error(`llms-txt: doc "${d.id}" has no section; add it to DOC_SECTIONS`)
        }
      }
      for (const [key, label] of DOC_SECTIONS) {
        const items = docs
          .filter((d) => sectionOf(d) === key && !OPTIONAL_DOC_IDS.has(d.id))
          .sort((a, b) => a.permalink.localeCompare(b.permalink))
        if (!items.length) continue
        out.push(`## ${label}`, '')
        if (key === 'postgres-howtos') out.push(HOWTOS_LINE, '')
        out.push(...items.map(docLink))
        out.push('')
      }

      const postLink = (p) => link({ title: p.title, url: abs(p.permalink), description: p.description })
      out.push('## Blog', '')
      out.push(link({ title: 'PostgresAI blog', url: abs('/blog'), description: 'All posts, newest first.' }))
      out.push(...posts.slice(0, RECENT_POSTS).map(postLink), '')

      out.push('## Optional', '')
      out.push(
        ...docs
          .filter((d) => OPTIONAL_DOC_IDS.has(d.id))
          .map(docLink)
      )
      out.push(...OPTIONAL_LINKS.map((e) => link(resolve(e))))
      out.push(...posts.slice(RECENT_POSTS).map(postLink), '')

      fs.writeFileSync(path.join(outDir, 'llms.txt'), out.join('\n'))

      // llms-full.txt: every listed doc, section order, raw markdown.
      const full = [
        `# ${SITE_NAME} documentation`,
        '',
        `> ${SITE_SUMMARY}`,
        '',
        `Index: ${abs('/llms.txt')}`,
        '',
      ]
      const order = new Map(DOC_SECTIONS.map(([key], i) => [key, i]))
      const sorted = [...docs].sort(
        (a, b) =>
          order.get(sectionOf(a)) - order.get(sectionOf(b)) ||
          a.permalink.localeCompare(b.permalink)
      )
      for (const d of sorted) {
        const sourcePath = sourceOf(d)
        const body = absolutizeLinks(
          stripMdxModuleLines(stripFrontMatter(fs.readFileSync(sourcePath, 'utf8'))).trim(),
          siteUrl
        )
        // Most docs open with their own H1; add one only when missing.
        const heading = /^#\s/.test(body) ? [] : [`# ${oneLine(d.title)}`, '']
        full.push(
          '---',
          '',
          ...heading,
          `URL: ${abs(d.permalink)}`,
          `Markdown: ${rawUrl(d)}`,
          '',
          body,
          ''
        )
      }
      fs.writeFileSync(path.join(outDir, 'llms-full.txt'), full.join('\n'))
    },
  }
}
