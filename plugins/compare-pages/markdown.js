// Markdown twins of the comparison pages, served under /raw/compare/, so an
// agent can read a page as plain text. Built from the same view as the HTML.

const { VERDICT_TEXT } = require('./view')

// A table cell: one line, pipes escaped.
function cell(text) {
  return String(text ?? '').replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim()
}

const refs = (nums) => (nums && nums.length ? ' ' + nums.map((n) => `[${n}]`).join('') : '')

function absolute(siteUrl, url) {
  return url.startsWith('/') ? siteUrl + url : url
}

function renderPage(view, siteUrl) {
  const abs = (url) => absolute(siteUrl, url)
  const { competitor: c, product } = view
  const out = []

  out.push(`# ${view.title}`, '')
  out.push(`> ${view.description}`, '')
  out.push(`Checked on ${view.checkedOn}. Page: ${abs(view.path)}. All comparisons: ${abs(view.indexPath)}.`, '')
  if (c.status !== 'active') out.push(`Status of ${c.name}: ${c.statusNote}${refs(c.statusSources)}`, '')
  if (view.disclosure) out.push(`Disclosure: ${view.disclosure}`, '')

  out.push('## Short answer', '', view.summary, '')

  // The same headings as the HTML page.
  const gone = c.status === 'discontinued'
  const proofsTitle = view.complement
    ? `What ${product} adds to ${c.name}`
    : gone
      ? `What ${product} offers in its place`
      : `Where ${product} is ahead of ${c.name}`
  const fairTitle = view.complement
    ? `What ${c.name} does that ${product} does not`
    : gone
      ? `What ${c.name} was chosen for`
      : `When ${c.name} is the better choice`

  const ourLinks = (sources) => sources.map((s) => `[${s.title}](${abs(s.url)})`).join(', ')
  out.push(`## ${proofsTitle}`, '')
  view.proofs.forEach((p, i) => {
    out.push(`${i + 1}. **${p.title}.**`)
    out.push(`   - ${product}: ${p.us} (${ourLinks(p.usSources)})`)
    out.push(`   - ${c.name}: ${p.them}${refs(p.sources)}`)
  })
  out.push('')

  if (view.tryIt) {
    out.push(`## ${view.tryIt.title}`, '')
    const commands = (view.tryIt.terminal || []).filter((line) => line.kind === 'cmd')
    if (commands.length) out.push('```', ...commands.map((line) => line.text), '```', '')
    out.push(view.tryIt.text, '')
    for (const l of view.tryIt.links || []) out.push(`- [${l.label}](${abs(l.href)})`)
    if ((view.tryIt.links || []).length) out.push('')
  }

  out.push('## Side by side', '')
  out.push(`| | ${product} | ${cell(c.name)} |`, '|---|---|---|')
  for (const row of view.rows) {
    // "Self-hosted option: yes." when the answer is narrower than the question, else "Yes."
    const say = (v) =>
      !v ? '' : row.verdictAbout ? `${row.verdictAbout}: ${VERDICT_TEXT[v].toLowerCase()}. ` : `${VERDICT_TEXT[v]}. `
    // The text of an undocumented row already opens with those words.
    const said = (v, text) => (v === 'nd' && /^not documented/i.test(text) ? '' : say(v))
    const ours = say(row.usV) + row.us
    const theirs = said(row.v, row.them) + row.them + refs(row.sources)
    out.push(`| ${cell(row.label)} | ${cell(ours)} | ${cell(theirs)} |`)
  }
  out.push('')

  out.push(`## ${fairTitle}`, '', ...view.chooseThem.map((t) => `- ${t}`), '')

  out.push('## Pricing', '')
  out.push('| Product | Plan | List price | Notes |', '|---|---|---|---|')
  for (const p of view.pricing.us) out.push(`| ${product} | ${cell(p.plan)} | ${cell(p.price)} | ${cell(p.notes)} |`)
  for (const p of view.pricing.them) {
    out.push(`| ${cell(c.name)} | ${cell(p.plan)} | ${cell(p.price)} | ${cell((p.notes || '') + refs(p.sources))} |`)
  }
  out.push('')
  out.push(`${product} prices: ${abs(view.pricing.usUrl)}.${view.pricing.note ? ' ' + view.pricing.note : ''}`, '')

  if (view.together) out.push('## Using both', '', view.together, '')

  out.push('## Questions', '')
  for (const f of view.faq) out.push(`### ${f.q}`, '', f.a + refs(f.sources), '')

  out.push(`## Sources for ${product}`, '')
  const seen = new Set()
  for (const item of [...view.proofs, ...view.rows]) {
    for (const s of item.usSources) {
      if (seen.has(s.url)) continue
      seen.add(s.url)
      out.push(`- [${s.title}](${abs(s.url)})`)
    }
  }
  out.push('')
  out.push(`## Sources for ${c.name}`, '')
  view.sources.forEach((s, i) => out.push(`${i + 1}. [${s.title}](${s.url})`))
  out.push('')
  out.push('## How we compare', '', view.method, '')

  return out.join('\n')
}

module.exports = { renderPage }
