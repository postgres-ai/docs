import React, { useState } from 'react'
import Link from '@docusaurus/Link'
import { Stage } from './ValueScenes'
import { LINKS } from './content'
import styles from './styles.module.css'

const SIGNALS = [
  { name: 'Unused index', value: '0 scans', observation: 'An index has no recorded scans in the observed period.', impact: 'Every write still maintains it.', action: 'Check statistics history, workload and constraints before deciding whether to remove it.', code: 'H002', path: 'INDEX ACTIVITY', severity: 'Needs investigation' },
  { name: 'Index bloat', value: '41%', observation: 'Estimated index bloat has crossed the 40% threshold.', impact: 'Extra pages can add storage and I/O overhead.', action: 'Confirm the estimate. Review maintenance options, lock impact and available disk space.', code: 'F005', path: 'STORAGE HYGIENE', severity: 'Needs attention' },
  { name: 'Slow query', value: '4,210 ms', observation: 'An example query scans many pages to return a few rows.', impact: 'A user waits while the database does more work.', action: 'Compare plans and buffer counts. Test an index or query rewrite on a clone.', code: 'M001', path: 'QUERY LATENCY', severity: 'Needs investigation' },
]

export function DiagnosisScene({ consoleUrl }: { consoleUrl: string }) {
  const [selected, setSelected] = useState(0)
  const finding = SIGNALS[selected]
  return (
    <Stage quiet label="MONITOR → DIAGNOSE / ILLUSTRATIVE FINDINGS">
      <div className={styles.diagnosisScene} data-selected={selected}>
        <div className={styles.signalList} aria-label="Explore example database findings">
          {SIGNALS.map((item, row) => <button type="button" key={item.code} aria-pressed={selected === row} onClick={() => setSelected(row)}>
            <span className={styles.signalRowHead}><strong>{item.name}</strong><span>{item.value}</span></span>
            <span className={styles.signalDots} aria-hidden="true">{Array.from({ length: 32 }, (_, cell) => <i key={cell} className={cell > 21 && (row === selected || cell % 3 === 0) ? styles.signalHot : undefined} style={{ '--cell': cell } as React.CSSProperties} />)}</span>
            <small>{item.path}</small>
          </button>)}
        </div>
        <svg className={styles.evidenceBridge} viewBox="0 0 60 450" preserveAspectRatio="none" aria-hidden="true">
          {[75, 225, 375].map((y, row) => <g key={y} data-selected={row === selected}>
            <path d={`M0 ${y} C30 ${y} 25 225 60 225`} />
            {row === selected && <path className={styles.evidencePulse} d={`M0 ${y} C30 ${y} 25 225 60 225`} />}
          </g>)}
        </svg>
        {/* The live region stays mounted; only the keyed finding remounts to replay its reveal. */}
        <article className={styles.evidencePanel} aria-live="polite">
          <div key={finding.code} className={styles.evidenceBody}>
            <div className={styles.evidenceHeading}><code>{finding.code}</code><span>{finding.severity}</span></div>
            <h3>{finding.name}</h3>
            <dl><dt>What we observed</dt><dd>{finding.observation}</dd><dt>Why it matters</dt><dd>{finding.impact}</dd><dt>What to try next</dt><dd>{finding.action}</dd></dl>
          </div>
          <a href={consoleUrl} className={styles.evidenceNext}>See your database findings →</a>
        </article>
      </div>
      <div className={styles.sceneBottom}><span>Example data. Select a signal to follow the evidence.</span><Link to={LINKS.checkupDocs}>Explore health checks →</Link></div>
    </Stage>
  )
}
