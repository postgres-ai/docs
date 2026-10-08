import React, { useId, useState } from 'react'

import { useInView, useMedia } from './motion'
import Link from '@docusaurus/Link'

import { COPY_PER_MONTH, DBLAB_PER_MONTH, LINKS } from './content'
import styles from './styles.module.css'

const MAX_N = 100
const PRESETS = [1, 10, 50, 100]

const usd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`
// Both readouts round down so they never overstate, and keep changing across the whole slider:
// whole percents stall at "99%" from ~63 clones (100 clones is 99.06%), the multiple keeps growing (10.6× → 106×).
const timesCheaper = (copies: number) => {
  const k = copies / DBLAB_PER_MONTH
  return k < 20 ? `${(Math.floor(k * 10) / 10).toFixed(1)}×` : `${Math.floor(k)}×`
}
const pctLess = (saved: number) => `${(Math.floor(saved * 1000) / 10).toFixed(1)}%`

// Chart geometry (SVG user units). One scale places the lines, ticks and labels. Phones get a
// smaller canvas in the same units, so the type renders at a readable size there. The right
// padding leaves room for the centred "100" tick at 15px.
function geometry(compact: boolean) {
  const W = compact ? 360 : 640
  const H = compact ? 250 : 280
  const PAD = compact ? { l: 50, r: 16, t: 14, b: 40 } : { l: 64, r: 16, t: 16, b: 40 }
  const Y_MAX = 90000
  const yTicks = compact ? [0, 45000, 90000] : [0, 30000, 60000, 90000]
  const xTicks = compact ? [1, 50, 100] : [1, 25, 50, 75, 100]
  const x = (n: number) => PAD.l + ((n - 1) / (MAX_N - 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => H - PAD.b - (v / Y_MAX) * (H - PAD.t - PAD.b)
  return { W, H, PAD, yTicks, xTicks, x, y, labelAt: compact ? 96 : 88 }
}

// "N clones" slider: full copies cost N × one copy; DBLab clones share one instance and one
// copy of the data, so the monthly cost stays flat. Numbers from the DBLab 4.0 post.
export default function CloneEconomics() {
  const [n, setN] = useState(10)
  // the two cost lines draw in when the chart scrolls into view
  const [chartRef, drawn] = useInView<HTMLElement>()
  const inputId = useId()
  const compact = useMedia('(max-width: 600px)') === true
  const { W, H, PAD, yTicks, xTicks, x, y, labelAt } = geometry(compact)
  const copies = n * COPY_PER_MONTH
  const saved = Math.max(0, 1 - DBLAB_PER_MONTH / copies)

  return (
    <div className={styles.econ}>
      <div className={styles.econControl}>
        <label htmlFor={inputId} className={styles.econLabel}>
          Agents with their own database branches (1 TiB example):{' '}
          <output htmlFor={inputId} className={styles.econN}>
            {n}
          </output>
        </label>
        <input
          id={inputId}
          className={styles.econRange}
          type="range"
          min={1}
          max={MAX_N}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
        />
        <div className={styles.econPresets} role="group" aria-label="Quick picks">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={p === n ? `${styles.preset} ${styles.presetActive}` : styles.preset}
              aria-pressed={p === n}
              onClick={() => setN(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.econCompare}>
        <div className={styles.econCol}>
          <p className={styles.econHead}>Full copies</p>
          <p className={styles.econCost}>
            {usd(copies)}
            <span>/month</span>
          </p>
          <dl className={styles.econFacts}>
            <dt>Storage</dt>
            <dd>{n} TiB</dd>
            <dt>Servers</dt>
            <dd>{n}</dd>
            <dt>Copy ready in</dt>
            <dd>hours, per copy</dd>
          </dl>
        </div>
        <div className={`${styles.econCol} ${styles.econColUs}`}>
          <p className={styles.econHead}>DBLab branches</p>
          <p className={styles.econCost}>
            {usd(DBLAB_PER_MONTH)}
            <span>/month</span>
          </p>
          <dl className={styles.econFacts}>
            <dt>Storage</dt>
            <dd>~1 TiB + changes</dd>
            <dt>Servers</dt>
            <dd>1, shared</dd>
            <dt>Branch ready in</dt>
            <dd>under 2 seconds</dd>
          </dl>
        </div>
        <p className={styles.econSaved} aria-live="polite">
          {n === 1 ? (
            'Already cheaper with one branch.'
          ) : (
            <>
              <span className={styles.econSavedNum}>{timesCheaper(copies)}</span> cheaper, every month ({pctLess(saved)} less).
            </>
          )}
        </p>
      </div>

      <figure ref={chartRef} className={drawn ? `${styles.econChart} ${styles.econChartDrawn}` : styles.econChart}>
        <span className={styles.figLabel} aria-hidden="true">
          FIG · COST OF N COPIES · O(N) VS O(1)
        </span>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Monthly cost for ${n} copies: full copies ${usd(copies)}, DBLab ${usd(DBLAB_PER_MONTH)}`}>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className={styles.chartGrid} />
              <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" className={styles.chartTick}>
                {v === 0 ? '$0' : `$${v / 1000}k`}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={x(t)} y={H - PAD.b + 22} textAnchor="middle" className={styles.chartTick}>
              {t}
            </text>
          ))}
          <text x={W - PAD.r} y={H - 4} textAnchor="end" className={styles.chartTick}>
            {compact ? 'copies →' : 'copies needed →'}
          </text>
          <line x1={x(1)} y1={y(COPY_PER_MONTH)} x2={x(MAX_N)} y2={y(MAX_N * COPY_PER_MONTH)} className={styles.chartCopies} pathLength={1} />
          <line x1={x(1)} y1={y(DBLAB_PER_MONTH)} x2={x(MAX_N)} y2={y(DBLAB_PER_MONTH)} className={styles.chartUs} pathLength={1} />
          <line x1={x(n)} x2={x(n)} y1={PAD.t} y2={H - PAD.b} className={styles.chartCursor} />
          <circle cx={x(n)} cy={y(copies)} r={5} className={styles.chartDotCopies} />
          <circle cx={x(n)} cy={y(DBLAB_PER_MONTH)} r={5} className={styles.chartDotUs} />
          <text x={x(labelAt)} y={y(labelAt * COPY_PER_MONTH) - 10} textAnchor="end" className={styles.chartLabel}>
            {compact ? 'copies: O(N)' : 'full copies: O(N)'}
          </text>
          <text x={x(labelAt)} y={y(DBLAB_PER_MONTH) - 10} textAnchor="end" className={`${styles.chartLabel} ${styles.chartLabelUs}`}>
            DBLab: O(1)
          </text>
        </svg>
        <figcaption className={styles.footnote}>
          Monthly AWS prices as of 2025, from the <Link to={LINKS.dblabPost}>DBLab 4.0 announcement</Link>: a full copy is an RDS
          db.r7i.2xlarge ($730) plus 1 TiB of gp2 storage ($117.76). DBLab is DBLab SE on one r7i.2xlarge ($386) with the SE licence ($331) plus 1 TiB
          of gp3 ($81.92), shared by all branches. O(N): the cost grows with every full copy. O(1): the shared base costs the same
          however many branches use it. Assumes one instance serves every branch and ignores the storage and compute each
          branch's own changes need; a single mid-size machine typically runs dozens of branches, so real limits depend on
          workload. Aurora is left out.
        </figcaption>
      </figure>
    </div>
  )
}
