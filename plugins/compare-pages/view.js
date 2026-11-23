// Turns the validated data into what a page needs to render: our side and
// their side joined row by row, plus links to neighbouring pages.

const INDEX_PATH = '/compare'

// How a row answers its question; see VERDICTS in ./load.js.
const VERDICT_TEXT = {
  yes: 'Yes',
  partial: 'Partly',
  preview: 'Preview',
  no: 'No',
  nd: 'Not documented',
  na: 'Does not apply',
}

// The matrix has many columns, so the two long answers are abbreviated there
// and spelled out in the note under it.
const VERDICT_SHORT = { ...VERDICT_TEXT, nd: 'n/d', na: 'n/a' }

// Shown on every page and in every markdown twin.
const METHOD =
  'These pages compare what each product does for PostgreSQL; other databases and the rest of the stack are out ' +
  'of scope. What we say about the other product comes from its own documentation, pricing page, changelog or ' +
  'source repository, read on the date shown; each row cites its source. "Not documented" means we did not find ' +
  'it in those sources, not that the product cannot do it. Prices are list prices and the billing units differ, ' +
  'so they are not a total-cost comparison. Product names are trademarks of their owners.'

const pagePath = (page) => `${INDEX_PATH}/${page.slug}`
const markdownPath = (page) => `/raw/compare/${page.slug}.md`

// "PostgresAI vs X: checkups vs plan analysis" -> "checkups vs plan analysis".
// The page shows the two names as its heading and this as the line under it.
function angleOf(title) {
  const at = title.indexOf(': ')
  return at === -1 ? '' : title.slice(at + 2)
}

const byName = (a, b) => a.competitor.name.localeCompare(b.competitor.name, 'en', { sensitivity: 'base' })

function card(page) {
  return {
    path: pagePath(page),
    name: page.competitor.name,
    title: page.title,
    angle: angleOf(page.title),
    description: page.description,
    status: page.competitor.status,
  }
}

function buildPageView(page, us, pages) {
  const kind = us.kinds[page.kind]
  const theirs = new Map(page.rows.map((r) => [r.key, r]))
  const group = kind.groups.find((g) => g.key === page.competitor.group)
  const proofDefs = new Map((kind.proofs || []).map((p) => [p.key, p]))

  // Neighbours: the same group first, then the rest of the kind.
  const others = pages.filter((p) => p.kind === page.kind && p.slug !== page.slug).sort(byName)
  const related = [
    ...others.filter((p) => p.competitor.group === page.competitor.group),
    ...others.filter((p) => p.competitor.group !== page.competitor.group),
  ]
    .slice(0, 8)
    .map(card)

  return {
    slug: page.slug,
    path: pagePath(page),
    markdownPath: markdownPath(page),
    indexPath: INDEX_PATH,
    kind: page.kind,
    product: kind.product,
    productUrl: kind.productUrl,
    groupLabel: group.label,
    competitor: page.competitor,
    checkedOn: page.checkedOn,
    title: page.title,
    heading: `${kind.product} vs ${page.competitor.name}`,
    angle: angleOf(page.title),
    description: page.description,
    summary: page.summary,
    chooseThem: page.chooseThem,
    // Reasons to pick our product: our fact with our docs, their documented
    // state with their sources.
    proofs: (page.proofs || []).map((p) => {
      const def = proofDefs.get(p.key)
      return { key: p.key, title: def.title, us: def.us, usSources: def.usSources, them: p.them, sources: p.sources }
    }),
    complement: Boolean(kind.complement),
    tryIt: kind.tryIt,
    figure: kind.figure,
    rows: kind.rows.map((def) => {
      const row = theirs.get(def.key)
      return {
        key: def.key,
        label: def.label,
        us: def.us,
        usSources: def.usSources,
        usV: def.usV,
        // What the one-word answer is about, when it is narrower than the row's question.
        verdictAbout:
          def.matrix && def.matrixLabel && def.matrixLabel.toLowerCase() !== def.label.toLowerCase()
            ? def.matrixLabel
            : undefined,
        them: row.them,
        sources: row.sources,
        v: row.v,
      }
    }),
    pricing: { us: kind.pricing, usUrl: kind.pricingUrl, them: page.pricing, note: page.pricingNote },
    together: page.together,
    disclosure: page.disclosure,
    faq: page.faq,
    sources: page.sources,
    cta: kind.cta,
    related,
    method: METHOD,
    verdictText: VERDICT_TEXT,
  }
}

function buildIndexView(us, pages) {
  return {
    path: INDEX_PATH,
    checkedOn: us.checkedOn,
    limits: us.limits,
    total: pages.length,
    method: METHOD,
    verdictText: VERDICT_TEXT,
    verdictShort: VERDICT_SHORT,
    // The index offers the same way to check us as the monitoring pages do.
    tryIt: us.kinds.monitoring.tryIt,
    cta: us.kinds.monitoring.cta,
    kinds: Object.entries(us.kinds)
      .map(([key, kind]) => {
        const mine = pages.filter((p) => p.kind === key).sort(byName)
        // Rows keep their page order unless a row asks for another place in the matrix.
        const columns = kind.rows
          .filter((r) => r.matrix)
          .map((r, i) => ({ r, i }))
          .sort((a, b) => (a.r.matrixOrder || 0) - (b.r.matrixOrder || 0) || a.i - b.i)
          .map((x) => x.r)
        // A product that is no longer offered has a page, not a matrix row.
        const rows = mine
          .filter((p) => p.competitor.status !== 'discontinued')
          .map((p) => {
            const theirs = new Map(p.rows.map((r) => [r.key, r.v]))
            return { name: p.competitor.name, path: pagePath(p), cells: columns.map((r) => theirs.get(r.key)) }
          })
        // What the matrix adds up to, counted from the cells and nothing else:
        // how many products answer Yes in each column, and how many do in
        // every column where we do.
        const tally = columns.map((_, i) => rows.filter((row) => row.cells[i] === 'yes').length)
        const ourYes = columns.map((r, i) => (r.usV === 'yes' ? i : -1)).filter((i) => i >= 0)
        const matchAll = rows.filter((row) => ourYes.every((i) => row.cells[i] === 'yes')).map((row) => row.name)
        const rarest = ourYes
          .map((i) => ({ label: columns[i].matrixLabel || columns[i].label, yes: tally[i] }))
          .filter((c) => rows.length && c.yes / rows.length <= 0.25)
          .sort((x, y) => x.yes - y.yes)
          .slice(0, 3)
        return {
          key,
          product: kind.product,
          productUrl: kind.productUrl,
          label: kind.label,
          intro: kind.intro,
          count: mine.length,
          groups: kind.groups
            .map((g) => ({
              key: g.key,
              label: g.label,
              pages: mine.filter((p) => p.competitor.group === g.key).map(card),
            }))
            .filter((g) => g.pages.length),
          matrix: {
            columns: columns.map((r) => ({ key: r.key, label: r.matrixLabel || r.label })),
            us: columns.map((r) => r.usV),
            rows,
            tally,
            ourYes: ourYes.length,
            matchAll,
            rarest,
          },
        }
      })
      .filter((k) => k.groups.length),
  }
}

// Every page in the order of /compare: kind, then group, then name.
function orderedPages(us, pages) {
  const out = []
  for (const [key, kind] of Object.entries(us.kinds)) {
    for (const group of kind.groups) {
      out.push(...pages.filter((p) => p.kind === key && p.competitor.group === group.key).sort(byName))
    }
  }
  return out
}

module.exports = { orderedPages, INDEX_PATH, VERDICT_TEXT, METHOD, pagePath, markdownPath, buildPageView, buildIndexView }
