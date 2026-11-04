// Fallback meta description for docs without a `description` in frontmatter.
//
// Docusaurus's own excerpt takes the first non-empty line, so a hard-wrapped
// paragraph yields a description that stops mid-sentence, and a doc that
// opens with "## Heading" yields the heading. This takes the first prose
// paragraph instead, joins its lines, and keeps whole sentences up to
// MAX_LENGTH characters. Wired in via `markdown.parseFrontMatter`.

const MAX_LENGTH = 160
// Paragraphs shorter than this ("Show help message.") are skipped in favour of
// a later one; a sentence prefix shorter than this is not a useful summary.
const MIN_USEFUL = 40

// Lines that are not prose and never start a paragraph.
const NON_PROSE = [
  /^#{1,6}\s/, // heading
  /^(import|export)\s/, // MDX module line
  /^:::/, // admonition fence
  /^</, // HTML / JSX
  /^!\[/, // image
  /^\|/, // table
  /^>/, // blockquote
  /^([-*_])\1{2,}\s*$/, // horizontal rule
  /^([-*+]|\d+[.)])\s/, // list item
  /^\{/, // MDX expression
  /^\[[^\]]+\]:\s/, // link reference definition
  /^\/\//, // "// I post a new howto every day" boilerplate
]

function stripInline(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[\^[^\]]+\]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(^|[\s(])[*_](\S.*?\S|\S)[*_](?=[\s).,;:!?]|$)/g, '$1$2')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/\\([\\`*_{}[\]()#+\-.!<>])/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

// Prose paragraphs in document order, each joined into one line.
function paragraphs(content) {
  const lines = content.split(/\r?\n/)
  const out = []
  let fence = null
  let inModule = false
  let para = []
  const flush = () => {
    const text = stripInline(para.join(' '))
    if (text) out.push(text)
    para = []
  }
  for (const raw of lines) {
    const line = raw.trim()
    const fenceMatch = line.match(/^(`{3,}|~{3,})/)
    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = null
      continue
    }
    if (fenceMatch) {
      if (para.length) flush()
      fence = fenceMatch[1]
      continue
    }
    if (!line) {
      inModule = false
      if (para.length) flush()
      continue
    }
    if (inModule) continue
    if (/^(import|export)\s/.test(line)) {
      inModule = true
      continue
    }
    if (NON_PROSE.some((re) => re.test(line))) {
      if (para.length) flush()
      continue
    }
    para.push(line)
  }
  if (para.length) flush()
  return out
}

function firstParagraph(content) {
  const all = paragraphs(content)
  return all.find((p) => p.length >= MIN_USEFUL) || all[0] || ''
}

function cutAtSentence(text, max = MAX_LENGTH) {
  if (text.length <= max) return text
  // A sentence ends at . ! or ? followed by a space and a capital, digit or quote.
  const ends = [...text.matchAll(/[.!?](?=\s+["'(A-Z0-9])/g)].map((m) => m.index + 1)
  const fit = ends.filter((i) => i <= max).pop()
  if (fit && fit >= MIN_USEFUL) return text.slice(0, fit)
  const cut = text.slice(0, max - 1).replace(/\s+\S*$/, '').replace(/[\s,;:–—-]+$/, '')
  return cut + '…'
}

function descriptionFromContent(content) {
  const para = firstParagraph(content)
  return para ? cutAtSentence(para) : undefined
}

function makeParseFrontMatter({ docsDir }) {
  const prefix = docsDir.endsWith('/') ? docsDir : docsDir + '/'
  return async function parseFrontMatter(params) {
    const result = await params.defaultParseFrontMatter(params)
    const { frontMatter, content } = result
    if (params.filePath.startsWith(prefix) && frontMatter.description == null) {
      const description = descriptionFromContent(content)
      if (description) frontMatter.description = description
    }
    return result
  }
}

module.exports = { descriptionFromContent, firstParagraph, cutAtSentence, makeParseFrontMatter, MAX_LENGTH }
