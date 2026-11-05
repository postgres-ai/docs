import React from 'react'
import styles from './styles.module.css'

const KINDS = {
  held: { icon: '✓', text: 'held' },
  falsified: { icon: '✗', text: 'falsified' },
  'not met': { icon: '≈', text: 'not met' },
  'not tested': { icon: '○', text: 'not tested' },
} as const

type Kind = keyof typeof KINDS

/**
 * A small label for the outcome of a preregistered prediction: icon and word, never color alone.
 *
 * @example
 * ```mdx
 * - <Verdict kind="falsified" /> **H10.** ...
 * ```
 */
export const Verdict = ({ kind }: { kind: Kind }) => {
  const k = KINDS[kind]
  return (
    <span className={`${styles.verdict} ${styles[kind.replace(' ', '')]}`}>
      <span aria-hidden="true">{k.icon}</span> {k.text}
    </span>
  )
}
