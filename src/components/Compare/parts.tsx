import React from 'react'
import Link from '@docusaurus/Link'

import styles from './styles.module.css'
import type { Source, TryItView, Verdict } from './types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "2026-11-17" -> "17 Nov 2026", without a Date object, so the server and the
// browser print the same text in every time zone.
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return `${day} ${MONTHS[month - 1]} ${year}`
}

// The short answer in front of a cell: a word, never colour alone.
export function VerdictMark({
  v,
  text,
  full,
  about,
}: {
  v?: Verdict
  text: Record<Verdict, string>
  full?: Record<Verdict, string>
  about?: string
}): JSX.Element | null {
  if (!v) return null
  // The tooltip spells out a short label, or says what the answer is about.
  const long = about ? `${about}: ${text[v]}` : full && full[v] !== text[v] ? full[v] : undefined
  return (
    <span className={`${styles.verdict} ${styles[`verdict_${v}`]}`} title={long} aria-label={long}>
      {text[v]}
    </span>
  )
}

// Numbered links to the page's source list.
export function Refs({ nums, id }: { nums?: number[]; id: (n: number) => string }): JSX.Element | null {
  if (!nums || !nums.length) return null
  return (
    <>
      {' '}
      {nums.map((n) => (
        <a key={n} href={`#${id(n)}`} className={styles.ref} aria-label={`Source ${n}`}>
          {n}
        </a>
      ))}
    </>
  )
}

// Links to our own documentation behind a statement about our product.
export function OurRefs({ sources }: { sources: Source[] }): JSX.Element {
  return (
    <>
      {' '}
      {sources.map((s, i) => (
        <Link key={s.url} to={s.url} className={styles.ref} title={s.title}>
          {i === 0 ? 'docs' : `docs ${i + 1}`}
        </Link>
      ))}
    </>
  )
}

type CtaItem = { label: string; href: string; primary?: boolean }

const isExternal = (href: string) => /^https?:\/\//.test(href)

// The first action is a button, the second an outlined button, the rest links.
export function Cta({ items }: { items: CtaItem[] }): JSX.Element {
  const rest = items.filter((item) => !item.primary)
  const className = (item: CtaItem) =>
    item.primary ? styles.ctaPrimary : item === rest[0] ? styles.ctaSecondary : styles.ctaLink
  return (
    <p className={styles.cta}>
      {items.map((item) =>
        isExternal(item.href) ? (
          <a key={item.href} href={item.href} className={className(item)} rel="noopener noreferrer">
            {item.label}
          </a>
        ) : (
          <Link key={item.href} to={item.href} className={className(item)}>
            {item.label}
          </Link>
        )
      )}
    </p>
  )
}

// What a reader can run to check our claims without talking to us.
export function TryIt({ tryIt }: { tryIt: TryItView }): JSX.Element {
  return (
    <aside className={styles.tryIt} aria-label={tryIt.title}>
      <p className={styles.tryItTitle}>{tryIt.title}</p>
      {tryIt.terminal && (
        <pre className={styles.terminal}>
          {tryIt.terminal.map((line, i) => (
            <span key={i} className={styles[`term_${line.kind}`]}>
              {line.text}
              {'\n'}
            </span>
          ))}
        </pre>
      )}
      <p className={styles.tryItText}>{tryIt.text}</p>
      {tryIt.links && tryIt.links.length > 0 && (
        <p className={styles.tryItLinks}>
          {tryIt.links.map((l) =>
            isExternal(l.href) ? (
              <a key={l.href} href={l.href} rel="noopener noreferrer" className={styles.ctaLink}>
                {l.label}
              </a>
            ) : (
              <Link key={l.href} to={l.href} className={styles.ctaLink}>
                {l.label}
              </Link>
            )
          )}
        </p>
      )}
    </aside>
  )
}
