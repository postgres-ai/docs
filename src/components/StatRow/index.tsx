import React from 'react'
import styles from './styles.module.css'

/**
 * One headline number with what it measures.
 */
type Stat = {
  /** The number, as it should read, e.g. "0.62–0.69×" */
  value: string;
  /** What it is, in a few words */
  label: string;
  /** Optional condition under which it was measured */
  note?: string;
}

/**
 * A row of headline numbers for the top of a blog post.
 * Stacks into one column on phones.
 *
 * @example
 * ```mdx
 * <StatRow stats={[{ value: '1.5–1.9×', label: 'UUIDv4 WAL per row', note: 'same server, 100M rows' }]} />
 * ```
 */
export const StatRow = ({ stats }: { stats: Stat[] }) => (
  <div className={styles.row}>
    {stats.map((s) => (
      <div key={s.label} className={styles.tile}>
        <div className={styles.value}>{s.value}</div>
        <div className={styles.label}>{s.label}</div>
        {s.note && <div className={styles.note}>{s.note}</div>}
      </div>
    ))}
  </div>
)
