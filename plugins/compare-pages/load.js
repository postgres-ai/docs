// Loads and validates the comparison pages in src/data/compare.
//
// One JSON file per page (src/data/compare/pages/<slug>.json) holds what we
// say about the other product, with a source for every row. What we say about
// our own products lives once, in src/data/compare/postgresai.json, so a claim
// about PostgresAI is reviewed in one place and reads the same on every page.
//
// The rules below are the claims policy in executable form; the prose version
// is src/data/compare/README.md. A page that breaks a rule fails the build.

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.resolve(__dirname, '../../src/data/compare')

// How a row answers its question, for the matrix on /compare.
//   yes      documented and generally available
//   partial  documented, with a stated limit that matters for this row
//   preview  documented as preview, beta or early access
//   no       the vendor's own documentation says it is not offered
//   nd       not documented in the sources we reviewed (not a claim of absence)
//   na       the question does not apply to this kind of product
const VERDICTS = ['yes', 'partial', 'preview', 'no', 'nd', 'na']

const STATUSES = ['active', 'discontinued', 'acquired']

const LIMITS = {
  title: [30, 75],
  description: [90, 170],
  summary: [200, 750],
  choose: [2, 5],
  chooseItem: [20, 240],
  proofs: [3, 4],
  proofText: [20, 320],
  proofTitle: [10, 60],
  rowText: [10, 460],
  faq: [3, 6],
  faqAnswer: [40, 700],
  sources: [4, 40],
  disclosure: [30, 300],
}

// Words that describe our opinion instead of a fact a reader can check.
const BANNED = [
  /\bbest[- ]in[- ]class\b/i,
  /\bworld[- ]class\b/i,
  /\bindustry[- ]leading\b/i,
  /\bmarket[- ]leading\b/i,
  /\brevolutionary\b/i,
  /\bgame[- ]chang/i,
  /\bcutting[- ]edge\b/i,
  /\bstate[- ]of[- ]the[- ]art\b/i,
  /\bseamless(ly)?\b/i,
  /\bblazing(ly)?\b/i,
  /\bunmatched\b/i,
  /\bunrivall?ed\b/i,
  /\bsuperior\b/i,
  /\binferior\b/i,
  /\bjust dashboards\b/i,
  /\bonly dashboards\b/i,
  /\bself[- ]driving\b/i,
  /\bguarantee[sd]?\b/i,
]

// These pages compare what products do for PostgreSQL. Other engines and the
// rest of the stack are out of scope, on our side and on theirs.
const OUT_OF_SCOPE = [
  /\b(MySQL|MariaDB|SQL Server|MSSQL|MongoDB|Db2|Cassandra|DynamoDB|DocumentDB|SQLite|Oracle|Redis|Vitess|Elasticsearch|OpenSearch)\b/i,
  /\bother (database )?engines?\b/i,
  /\bnon[- ]Postgres/i,
  /\bmulti[- ]?(engine|database)\b/i,
  /\b(full|whole|entire)[- ]stack\b/i,
  /\binfrastructure monitoring\b/i,
]

// A reason to pick us has to say what the other product does, not only what
// we could not find.
const ABSENCE_FIRST = /^(the sources we reviewed|we (found|could find) no|no .{0,60} is documented|not documented)/i

// Private repositories must never be linked or named on a public page.
const PRIVATE_LINK = /gitlab\.com\/postgres-ai\/(growth|internal|platform-all|infra)\b/i

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    throw new Error(`compare: cannot parse ${path.relative(process.cwd(), file)}: ${e.message}`)
  }
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
}

function inRange(n, [min, max]) {
  return n >= min && n <= max
}

// Every string a visitor can read, with where it sits, for the wording checks.
function proseOf(page) {
  const out = []
  const add = (where, text) => typeof text === 'string' && out.push([where, text])
  add('title', page.title)
  add('description', page.description)
  add('summary', page.summary)
  add('together', page.together)
  add('pricingNote', page.pricingNote)
  add('disclosure', page.disclosure)
  add('competitor.statusNote', page.competitor?.statusNote)
  ;(page.chooseThem || []).forEach((t, i) => add(`chooseThem[${i}]`, t))
  ;(page.proofs || []).forEach((p) => add(`proofs.${p.key}.them`, p.them))
  ;(page.rows || []).forEach((r) => add(`rows.${r.key}.them`, r.them))
  ;(page.pricing || []).forEach((p, i) => {
    add(`pricing[${i}].plan`, p.plan)
    add(`pricing[${i}].price`, p.price)
    add(`pricing[${i}].notes`, p.notes)
  })
  ;(page.faq || []).forEach((f, i) => {
    add(`faq[${i}].q`, f.q)
    add(`faq[${i}].a`, f.a)
  })
  return out
}

function validateOurSide(us) {
  const errors = []
  if (!isIsoDate(us.checkedOn)) errors.push('postgresai.json: checkedOn must be YYYY-MM-DD')
  if (!Array.isArray(us.limits) || !us.limits.length) errors.push('postgresai.json: limits is empty')
  if (!Array.isArray(us.facts)) errors.push('postgresai.json: facts must be a list')
  else {
    us.facts.forEach((fact, i) => {
      const ok = fact && typeof fact.text === 'string' && fact.text.length > 20 && typeof fact.url === 'string'
      if (!ok || !(fact.url.startsWith('/') || isHttpsUrl(fact.url))) {
        errors.push(`postgresai.json: facts[${i}] needs a text and a url to our docs`)
      }
    })
  }
  for (const [kind, def] of Object.entries(us.kinds || {})) {
    const at = `postgresai.json: kinds.${kind}`
    for (const field of ['product', 'productUrl', 'prefix', 'label', 'intro', 'pricingUrl']) {
      if (!def[field]) errors.push(`${at}.${field} is missing`)
    }
    if (!Array.isArray(def.groups) || !def.groups.length) errors.push(`${at}.groups is empty`)
    for (const g of def.groups || []) {
      if (!g.key || !g.label) errors.push(`${at}.groups entries need key and label`)
    }
    const keys = new Set()
    for (const row of def.rows || []) {
      const rowAt = `${at}.rows.${row.key}`
      if (!row.key || !row.label || !row.us) errors.push(`${rowAt}: key, label and us are required`)
      if (keys.has(row.key)) errors.push(`${rowAt}: duplicate key`)
      keys.add(row.key)
      if (!Array.isArray(row.usSources) || !row.usSources.length) {
        errors.push(`${rowAt}: usSources needs at least one link`)
      }
      for (const s of row.usSources || []) {
        if (!s.title || !(isHttpsUrl(s.url) || String(s.url).startsWith('/'))) {
          errors.push(`${rowAt}: usSources entries need a title and an https or site-relative url`)
        }
      }
      if (row.matrix && !VERDICTS.includes(row.usV)) errors.push(`${rowAt}: matrix rows need usV`)
      if (row.matrixOrder !== undefined && !(row.matrix && Number.isInteger(row.matrixOrder))) {
        errors.push(`${rowAt}: matrixOrder is a whole number on a matrix row`)
      }
      if (BANNED.some((re) => re.test(row.us))) errors.push(`${rowAt}: opinion wording in "us"`)
      if (OUT_OF_SCOPE.some((re) => re.test(`${row.label} ${row.us}`))) errors.push(`${rowAt}: outside PostgreSQL`)
    }
    if (!keys.size) errors.push(`${at}.rows is empty`)
    // Proofs: the reasons to pick our product that a page may use. Each is a
    // fact with a link to our docs; a page adds what the other vendor documents.
    const proofKeys = new Set()
    for (const proof of def.proofs || []) {
      const proofAt = `${at}.proofs.${proof.key}`
      if (!proof.key || !proof.us) errors.push(`${proofAt}: key and us are required`)
      if (typeof proof.title !== 'string' || !inRange(proof.title.length, LIMITS.proofTitle)) {
        errors.push(`${proofAt}: title must be ${LIMITS.proofTitle.join('-')} chars`)
      }
      if (proofKeys.has(proof.key)) errors.push(`${proofAt}: duplicate key`)
      proofKeys.add(proof.key)
      if (!Array.isArray(proof.usSources) || !proof.usSources.length) {
        errors.push(`${proofAt}: usSources needs at least one link`)
      }
      for (const s of proof.usSources || []) {
        if (!s.title || !(isHttpsUrl(s.url) || String(s.url).startsWith('/'))) {
          errors.push(`${proofAt}: usSources entries need a title and an https or site-relative url`)
        }
      }
      if (BANNED.some((re) => re.test(`${proof.title} ${proof.us}`))) errors.push(`${proofAt}: opinion wording`)
      if (OUT_OF_SCOPE.some((re) => re.test(`${proof.title} ${proof.us}`))) errors.push(`${proofAt}: outside PostgreSQL`)
    }
    if (proofKeys.size < LIMITS.proofs[0]) errors.push(`${at}.proofs needs at least ${LIMITS.proofs[0]} entries`)

    const isLink = (url) => typeof url === 'string' && (isHttpsUrl(url) || url.startsWith('/'))
    // What a reader can run or open to check us: optional, shown on every page of the kind.
    if (def.tryIt !== undefined) {
      const t = def.tryIt
      if (!t.title || !t.text) errors.push(`${at}.tryIt needs a title and a text`)
      for (const line of t.terminal || []) {
        if (!['cmd', 'out', 'dim'].includes(line.kind) || typeof line.text !== 'string') {
          errors.push(`${at}.tryIt.terminal lines need kind (cmd, out or dim) and text`)
        }
      }
      for (const link of t.links || []) {
        if (!link.label || !isLink(link.href)) errors.push(`${at}.tryIt.links entries need a label and a link`)
      }
      if (BANNED.some((re) => re.test(`${t.title} ${t.text}`))) errors.push(`${at}.tryIt: opinion wording`)
    }
    // One screenshot of the product: optional. The alt text says what it shows.
    if (def.figure !== undefined) {
      const fig = def.figure
      if (typeof fig.src !== 'string' || !fig.src.startsWith('/')) errors.push(`${at}.figure.src must be a site path`)
      if (!fig.alt || fig.alt.length < 40) errors.push(`${at}.figure.alt must describe the picture`)
      if (!fig.caption) errors.push(`${at}.figure.caption is missing`)
      if (!Number.isInteger(fig.width) || !Number.isInteger(fig.height)) {
        errors.push(`${at}.figure needs width and height in pixels`)
      }
      if (fig.href !== undefined && !isLink(fig.href)) errors.push(`${at}.figure.href must be a link`)
    }
    if (!Array.isArray(def.pricing) || !def.pricing.length) errors.push(`${at}.pricing is empty`)
    if (!Array.isArray(def.cta) || !def.cta.length) errors.push(`${at}.cta is empty`)
  }
  if (!Object.keys(us.kinds || {}).length) errors.push('postgresai.json: no kinds defined')
  return errors
}

function validatePage(page, file, us) {
  const errors = []
  const err = (msg) => errors.push(`${file}: ${msg}`)
  const kind = us.kinds[page.kind]

  if (!kind) {
    err(`kind "${page.kind}" is not one of: ${Object.keys(us.kinds).join(', ')}`)
    return errors
  }
  if (`${page.slug}.json` !== file) err(`slug "${page.slug}" does not match the file name`)
  if (!/^[a-z0-9-]+$/.test(page.slug || '')) err('slug may contain only a-z, 0-9 and "-"')
  if (!String(page.slug).startsWith(kind.prefix)) err(`slug must start with "${kind.prefix}" for kind "${page.kind}"`)

  const c = page.competitor || {}
  if (!c.name) err('competitor.name is missing')
  if (!c.vendor) err('competitor.vendor is missing')
  if (!c.category) err('competitor.category is missing')
  if (!kind.groups.some((g) => g.key === c.group)) {
    err(`competitor.group must be one of: ${kind.groups.map((g) => g.key).join(', ')}`)
  }
  if (!isHttpsUrl(c.url)) err('competitor.url must be an https URL')
  if (!STATUSES.includes(c.status)) err(`competitor.status must be one of: ${STATUSES.join(', ')}`)
  if (c.status !== 'active' && !c.statusNote) err('competitor.statusNote is required unless status is "active"')

  if (!isIsoDate(page.checkedOn)) err('checkedOn must be YYYY-MM-DD')
  if (page.disclosure !== undefined && !(typeof page.disclosure === 'string' && inRange(page.disclosure.length, LIMITS.disclosure))) {
    err(`disclosure must be a sentence of ${LIMITS.disclosure.join('-')} chars`)
  }

  const title = page.title || ''
  if (!title.startsWith(`${kind.product} vs `)) err(`title must start with "${kind.product} vs "`)
  if (!inRange(title.length, LIMITS.title)) err(`title is ${title.length} chars; want ${LIMITS.title.join('-')}`)
  const description = page.description || ''
  if (!inRange(description.length, LIMITS.description)) {
    err(`description is ${description.length} chars; want ${LIMITS.description.join('-')}`)
  }
  const summary = page.summary || ''
  if (!inRange(summary.length, LIMITS.summary)) err(`summary is ${summary.length} chars; want ${LIMITS.summary.join('-')}`)

  const chooseThem = page.chooseThem
  if (!Array.isArray(chooseThem) || !inRange(chooseThem.length, LIMITS.choose)) {
    err(`chooseThem needs ${LIMITS.choose.join('-')} items`)
  } else {
    chooseThem.forEach((t, i) => {
      if (typeof t !== 'string' || !inRange(t.length, LIMITS.chooseItem)) {
        err(`chooseThem[${i}] must be ${LIMITS.chooseItem.join('-')} chars`)
      }
    })
  }
  if (page.chooseUs !== undefined) err('chooseUs is no longer used; write proofs instead')

  // Sources: numbered from 1 in file order; rows, proofs, prices and answers cite them.
  const sources = Array.isArray(page.sources) ? page.sources : []
  if (!inRange(sources.length, LIMITS.sources)) err(`sources needs ${LIMITS.sources.join('-')} entries`)
  const urls = new Set()
  sources.forEach((s, i) => {
    if (!s.title) err(`sources[${i + 1}] has no title`)
    if (!isHttpsUrl(s.url)) err(`sources[${i + 1}] url must be https`)
    if (urls.has(s.url)) err(`sources[${i + 1}] repeats a url`)
    urls.add(s.url)
  })
  const cited = new Set()
  const cite = (where, refs, required) => {
    if (refs === undefined && !required) return
    if (!Array.isArray(refs) || (required && !refs.length)) {
      err(`${where} needs at least one source number`)
      return
    }
    for (const n of refs) {
      if (!Number.isInteger(n) || n < 1 || n > sources.length) err(`${where} cites source ${n}, which does not exist`)
      else cited.add(n)
    }
  }

  // Rows: exactly the questions defined for this kind, in any order.
  const wanted = new Map(kind.rows.map((r) => [r.key, r]))
  const seen = new Set()
  for (const row of Array.isArray(page.rows) ? page.rows : []) {
    const def = wanted.get(row.key)
    if (!def) {
      err(`rows: unknown key "${row.key}" for kind "${page.kind}"`)
      continue
    }
    if (seen.has(row.key)) err(`rows.${row.key} appears twice`)
    seen.add(row.key)
    if (typeof row.them !== 'string' || !inRange(row.them.length, LIMITS.rowText)) {
      err(`rows.${row.key}.them must be ${LIMITS.rowText.join('-')} chars`)
    }
    cite(`rows.${row.key}`, row.sources, true)
    if (def.matrix) {
      if (!VERDICTS.includes(row.v)) err(`rows.${row.key}.v must be one of: ${VERDICTS.join(', ')}`)
    } else if (row.v !== undefined) {
      err(`rows.${row.key}.v is set, but this row is not in the matrix`)
    }
  }
  for (const key of wanted.keys()) if (!seen.has(key)) err(`rows.${key} is missing`)

  // Proofs: reasons to pick our product. Our half comes from postgresai.json;
  // the page says what the other vendor documents on the same point, with sources.
  const proofDefs = new Map((kind.proofs || []).map((p) => [p.key, p]))
  const proofs = Array.isArray(page.proofs) ? page.proofs : []
  if (!inRange(proofs.length, LIMITS.proofs)) err(`proofs needs ${LIMITS.proofs.join('-')} entries`)
  const proofSeen = new Set()
  for (const proof of proofs) {
    if (!proofDefs.has(proof.key)) {
      err(`proofs: unknown key "${proof.key}"; use one of: ${[...proofDefs.keys()].join(', ')}`)
      continue
    }
    if (proofSeen.has(proof.key)) err(`proofs.${proof.key} appears twice`)
    proofSeen.add(proof.key)
    if (typeof proof.them !== 'string' || !inRange(proof.them.length, LIMITS.proofText)) {
      err(`proofs.${proof.key}.them must be ${LIMITS.proofText.join('-')} chars`)
    }
    if (typeof proof.them === 'string' && ABSENCE_FIRST.test(proof.them)) {
      err(`proofs.${proof.key}.them: start with what ${c.name || 'the product'} does, then say what is not documented`)
    }
    cite(`proofs.${proof.key}`, proof.sources, true)
  }

  if (!Array.isArray(page.pricing) || !page.pricing.length) err('pricing needs at least one entry')
  ;(page.pricing || []).forEach((p, i) => {
    if (!p.plan || !p.price) err(`pricing[${i}] needs plan and price`)
    cite(`pricing[${i}]`, p.sources, true)
  })

  if (!Array.isArray(page.faq) || !inRange(page.faq.length, LIMITS.faq)) err(`faq needs ${LIMITS.faq.join('-')} entries`)
  ;(page.faq || []).forEach((f, i) => {
    if (!f.q || !f.q.trim().endsWith('?')) err(`faq[${i}].q must be a question`)
    if (typeof f.a !== 'string' || !inRange(f.a.length, LIMITS.faqAnswer)) {
      err(`faq[${i}].a must be ${LIMITS.faqAnswer.join('-')} chars`)
    }
    cite(`faq[${i}]`, f.sources, false)
  })
  cite('competitor.statusSources', c.statusSources, c.status !== 'active')

  sources.forEach((s, i) => {
    if (!cited.has(i + 1)) err(`sources[${i + 1}] (${s.url}) is never cited`)
  })

  for (const [where, text] of proseOf(page)) {
    const hit = BANNED.find((re) => re.test(text))
    if (hit) err(`${where}: opinion wording (${hit.source}); state the fact instead`)
    // A plan can be called "Infrastructure Monitoring"; that is its name.
    const outside = /^pricing\[\d+\]\.plan$/.test(where) ? null : OUT_OF_SCOPE.find((re) => re.test(text))
    if (outside) err(`${where}: outside PostgreSQL ("${text.match(outside)[0]}"); these pages are PostgreSQL only`)
    if (PRIVATE_LINK.test(text)) err(`${where}: names a private repository`)
    if (/\s{2,}|^\s|\s$/.test(text)) err(`${where}: stray whitespace`)
  }
  for (const s of sources) if (PRIVATE_LINK.test(s.url)) err(`sources: ${s.url} is a private repository`)

  return errors
}

// Returns { us, pages } or throws one error listing every problem found.
function loadCompare(dataDir = DATA_DIR) {
  const us = readJson(path.join(dataDir, 'postgresai.json'))
  const errors = validateOurSide(us)

  const pagesDir = path.join(dataDir, 'pages')
  const files = fs.existsSync(pagesDir)
    ? fs.readdirSync(pagesDir).filter((f) => f.endsWith('.json')).sort()
    : []
  const pages = []
  for (const file of files) {
    const page = readJson(path.join(pagesDir, file))
    errors.push(...validatePage(page, file, us))
    pages.push(page)
  }

  const names = new Map()
  for (const page of pages) {
    const key = `${page.kind}:${String(page.competitor?.name).toLowerCase()}`
    if (names.has(key)) errors.push(`${page.slug}.json: same product as ${names.get(key)}.json`)
    names.set(key, page.slug)
  }

  if (errors.length) {
    throw new Error(`compare: ${errors.length} problem(s)\n  - ${errors.join('\n  - ')}`)
  }
  return { us, pages }
}

module.exports = { loadCompare, validatePage, validateOurSide, VERDICTS, LIMITS, DATA_DIR }

// `node plugins/compare-pages/load.js` checks all the data without a site
// build; with file paths as arguments it checks only those pages.
if (require.main === module) {
  const only = process.argv.slice(2)
  try {
    if (!only.length) {
      const { pages } = loadCompare()
      console.log(`compare: ${pages.length} page(s) valid`)
    } else {
      const us = readJson(path.join(DATA_DIR, 'postgresai.json'))
      const errors = validateOurSide(us)
      for (const file of only) errors.push(...validatePage(readJson(file), path.basename(file), us))
      if (errors.length) throw new Error(`compare: ${errors.length} problem(s)\n  - ${errors.join('\n  - ')}`)
      console.log(`compare: ${only.length} page(s) valid`)
    }
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}
