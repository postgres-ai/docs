// Print-only link references for blog posts.
//
// When a post is printed or saved as PDF, a link's URL is lost. This remark
// plugin numbers the links of the post body in order of first appearance
// (the same URL reuses its number), puts a "[n]" marker after each link, and
// appends a "Links" list (number, link text, full absolute URL) at the
// end of the post content, as in pgsql-hackers emails and papers.
//
// It runs at build time, so the markers and the list are in the static HTML
// and need no JavaScript. On screen both are display:none; the print rules are
// in src/css/print-link-refs.css.
//
// Skipped: same-page "#..." links (the post's own navigation), links that wrap
// only an image, javascript: links, and code (code blocks and inline code hold
// no link nodes). Heading anchors, footnote back-references, tag links and the
// post navigation are not in the Markdown tree at this stage, so they are
// never numbered. Relative site links become absolute (siteUrl + path).
//
// No dependencies: the unist utilities are ESM-only and this file is required
// from the CommonJS docusaurus.config.js.

const DEFAULT_SITE_URL = 'https://postgres.ai'
const DEFAULT_BASE_PATH = '/blog/'

const MARKER_CLASS = 'pgai-print-ref'
const LIST_CLASS = 'pgai-print-refs'

// Subtrees that never hold body links worth numbering.
const SKIP_TYPES = new Set([
  'code',
  'inlineCode',
  'html',
  'mdxjsEsm',
  'mdxFlowExpression',
  'mdxTextExpression',
  'yaml',
  'toml',
])

const IMAGE_TYPES = new Set(['image', 'imageReference'])

function isJsx(node) {
  return node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement'
}

function jsxAttr(node, name) {
  const attr = (node.attributes || []).find(
    (a) => a.type === 'mdxJsxAttribute' && a.name === name,
  )
  // Only literal string values; an expression (href={x}) is not known here.
  return attr && typeof attr.value === 'string' ? attr.value : undefined
}

function isImage(node) {
  return IMAGE_TYPES.has(node.type) || (isJsx(node) && node.name === 'img')
}

// True if the node holds nothing but images (and whitespace).
function onlyImages(children) {
  let image = false
  for (const child of children || []) {
    if (isImage(child)) image = true
    else if (child.type === 'text' && !child.value.trim()) continue
    else if (child.children && onlyImages(child.children)) image = true
    else return false
  }
  return image
}

function toText(node) {
  if (typeof node.value === 'string' && !SKIP_TYPES.has(node.type)) return node.value
  if (node.type === 'inlineCode') return node.value
  if (IMAGE_TYPES.has(node.type)) return node.alt || ''
  return (node.children || []).map(toText).join('')
}

function collectDefinitions(tree) {
  const defs = new Map()
  const walk = (node) => {
    if (node.type === 'definition') {
      const id = String(node.identifier || node.label || '').toLowerCase()
      if (!defs.has(id)) defs.set(id, node.url)
    }
    for (const child of node.children || []) walk(child)
  }
  walk(tree)
  return defs
}

// href -> absolute URL string, or null when the link is skipped.
function absoluteUrl(href, {siteUrl, basePath, selfPath}) {
  if (typeof href !== 'string') return null
  let h = href.trim()
  if (!h || h.startsWith('#')) return null
  if (/^javascript:/i.test(h)) return null
  if (h.startsWith('pathname://')) h = h.slice('pathname://'.length)
  let url
  try {
    url = new URL(h, siteUrl.replace(/\/+$/, '') + basePath)
  } catch {
    return null
  }
  // A link to this very post with a fragment is same-page navigation.
  const site = new URL(siteUrl)
  if (
    selfPath &&
    url.origin === site.origin &&
    url.pathname.replace(/\/+$/, '') === selfPath.replace(/\/+$/, '')
  ) {
    return null
  }
  return url.href
}

function marker(n) {
  return {
    type: 'printLinkRef',
    data: {
      hName: 'sup',
      hProperties: {className: [MARKER_CLASS]},
      hChildren: [{type: 'text', value: `[${n}]`}],
    },
  }
}

function el(tagName, className, children, extra = {}) {
  return {
    type: 'element',
    tagName,
    properties: {...(className ? {className: [className]} : {}), ...extra},
    children,
  }
}

function referencesNode(refs, title) {
  const items = refs.map((ref) => {
    const body = []
    if (ref.text && ref.text !== ref.url) {
      body.push(el('span', `${LIST_CLASS}__text`, [{type: 'text', value: ref.text}]))
      body.push({type: 'text', value: ' '})
    }
    body.push(el('a', `${LIST_CLASS}__url`, [{type: 'text', value: ref.url}], {href: ref.url}))
    return el('li', null, [
      el('span', `${LIST_CLASS}__num`, [{type: 'text', value: `[${ref.n}]`}]),
      {type: 'text', value: ' '},
      el('span', `${LIST_CLASS}__body`, body),
    ])
  })
  return {
    type: 'printLinkRefs',
    data: {
      hName: 'section',
      hProperties: {className: [LIST_CLASS]},
      hChildren: [
        el('h2', `${LIST_CLASS}__title`, [{type: 'text', value: title}]),
        el('ol', `${LIST_CLASS}__list`, items),
      ],
    },
  }
}

function printLinkRefs(options = {}) {
  const siteUrl = options.siteUrl || DEFAULT_SITE_URL
  const basePath = options.basePath || DEFAULT_BASE_PATH
  const title = options.title || 'Links'

  return (tree, file) => {
    const defs = collectDefinitions(tree)
    const fm = (file && file.data && file.data.frontMatter) || {}
    const selfPath = typeof fm.slug === 'string' ? basePath.replace(/\/+$/, '') + '/' + fm.slug.replace(/^\/+/, '') : null
    const ctx = {siteUrl, basePath, selfPath}

    const byUrl = new Map()
    const refs = []

    const hrefOf = (node) => {
      if (node.type === 'link') return node.url
      if (node.type === 'linkReference') {
        return defs.get(String(node.identifier || node.label || '').toLowerCase())
      }
      if (isJsx(node) && node.name === 'a') return jsxAttr(node, 'href')
      return undefined
    }

    const walk = (parent) => {
      const children = parent.children
      if (!children) return
      for (let i = 0; i < children.length; i++) {
        const node = children[i]
        if (SKIP_TYPES.has(node.type) || node.type === 'definition') continue
        const href = hrefOf(node)
        if (href === undefined) {
          walk(node)
          continue
        }
        // Links do not nest, so the link's own children are not walked.
        if (onlyImages(node.children)) continue
        const url = absoluteUrl(href, ctx)
        if (!url) continue
        let n = byUrl.get(url)
        if (n === undefined) {
          n = refs.length + 1
          byUrl.set(url, n)
          refs.push({n, url, text: toText(node).replace(/\s+/g, ' ').trim()})
        }
        children.splice(i + 1, 0, marker(n))
        i++
      }
    }

    walk(tree)
    if (refs.length) tree.children.push(referencesNode(refs, title))
  }
}

module.exports = printLinkRefs
module.exports.absoluteUrl = absoluteUrl
module.exports.MARKER_CLASS = MARKER_CLASS
module.exports.LIST_CLASS = LIST_CLASS
