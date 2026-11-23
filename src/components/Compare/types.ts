// Shapes produced by plugins/compare-pages/view.js.

export type Verdict = 'yes' | 'partial' | 'preview' | 'no' | 'nd' | 'na'

export type Source = { title: string; url: string }

export type Card = {
  path: string
  name: string
  title: string
  angle: string
  description: string
  status: 'active' | 'discontinued' | 'acquired'
}

// A reason to pick our product: our fact with our docs, and what the other
// vendor documents on the same point.
export type Proof = {
  key: string
  title: string
  us: string
  usSources: Source[]
  them: string
  sources: number[]
}

// What a reader can run or open to check our claims.
export type TryItView = {
  title: string
  text: string
  terminal?: { kind: 'cmd' | 'out' | 'dim'; text: string }[]
  links?: { label: string; href: string }[]
}

export type Row = {
  key: string
  label: string
  us: string
  usSources: Source[]
  usV?: Verdict
  verdictAbout?: string
  them: string
  sources: number[]
  v?: Verdict
}

export type Price = { plan: string; price: string; notes?: string; sources?: number[] }

export type PageView = {
  slug: string
  path: string
  markdownPath: string
  indexPath: string
  kind: string
  product: string
  productUrl: string
  groupLabel: string
  competitor: {
    name: string
    vendor: string
    url: string
    category: string
    group: string
    status: 'active' | 'discontinued' | 'acquired'
    statusNote?: string
    statusSources?: number[]
  }
  checkedOn: string
  title: string
  heading: string
  angle: string
  description: string
  summary: string
  chooseThem: string[]
  proofs: Proof[]
  complement: boolean
  tryIt?: TryItView
  figure?: { src: string; width: number; height: number; alt: string; caption: string; href?: string }
  rows: Row[]
  pricing: { us: Price[]; usUrl: string; them: Price[]; note?: string }
  together?: string
  disclosure?: string
  faq: { q: string; a: string; sources?: number[] }[]
  sources: Source[]
  cta: { label: string; href: string; primary?: boolean }[]
  related: Card[]
  method: string
  verdictText: Record<Verdict, string>
}

export type IndexView = {
  path: string
  checkedOn: string
  limits: string[]
  total: number
  method: string
  verdictText: Record<Verdict, string>
  verdictShort: Record<Verdict, string>
  tryIt?: TryItView
  cta?: { label: string; href: string; primary?: boolean }[]
  kinds: {
    key: string
    product: string
    productUrl: string
    label: string
    intro: string
    count: number
    groups: { key: string; label: string; pages: Card[] }[]
    matrix: {
      columns: { key: string; label: string }[]
      us: Verdict[]
      rows: { name: string; path: string; cells: Verdict[] }[]
      // Counted from the cells: products that answer Yes per column, the
      // products that answer Yes wherever we do, and our rarest columns.
      tally: number[]
      ourYes: number
      matchAll: string[]
      rarest: { label: string; yes: number }[]
    }
  }[]
}
