import React, { ReactNode, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import useBaseUrl from '@docusaurus/useBaseUrl'
import figure from '@site/src/components/BlogFigure/styles.module.css'

import {
  DWELL,
  Frame,
  Idle,
  MEASURED,
  PER_MARK,
  PRESETS,
  SCALE,
  SECOND_RUN,
  SLOW,
  STEPS,
  TARGET,
  WRITERS,
  createScale,
  frameAt,
  stillFrame,
} from './model'
import Ring from './Ring'
import styles from './styles.module.css'

type Props = {
  /** Figure number shown in the label ("Fig. 2") */
  n: number
  /**
   * The still for readers with no JavaScript: the wide image, e.g.
   * /assets/blog/post-f2.svg. It must also exist as <name>-narrow. There is
   * no dark one: with no JavaScript the site is in its light theme.
   */
  src: string
  /** Text alternative for the still */
  alt: string
  /** Caption: a bold first sentence, then the details */
  children?: ReactNode
}

const variant = (src: string, suffix: string) =>
  src.replace(/(\.[a-z]+)$/, `${suffix}$1`)

// Phones get the narrow drawing, as in BlogFigure.
const NARROW = '(max-width: 600px)'

/* ---------- the measured numbers of step 5 ---------- */

const ROWS: {
  label: ReactNode
  sub: string
  value: (n: Idle) => number
  max: number
  unit: string
  bar: string
}[] = [
  {
    label: 'Temp-table TPS',
    sub: `total; target: ${TARGET}`,
    value: (n) => MEASURED[n].tps,
    max: MEASURED[0].tps,
    unit: '',
    bar: styles.barInk,
  },
  {
    // may break after the colon
    label: 'LWLock:\u200bSInvalWrite',
    sub: "of the writers' active time",
    value: (n) => MEASURED[n].wait,
    max: 100,
    unit: '%',
    bar: styles.barLock,
  },
  {
    label: 'Full cache resets',
    sub: 'per second',
    value: (n) => MEASURED[n].resets,
    max: MEASURED[5000].resets,
    unit: '',
    bar: styles.barReset,
  },
]

/**
 * The four measured runs. The columns are also the setting of step 5: `pick`
 * makes the head cells buttons. Rows and cells are not <table> elements,
 * because the blog styles every table of a post as a framed block.
 */
const Measured = React.memo(function Measured({
  idle,
  pick,
}: {
  /** the run that the drawing shows now, if it shows one */
  idle: Idle | null
  pick?: (n: Idle) => void
}) {
  return (
    <div
      className={styles.table}
      role="table"
      aria-label={`Measured on Postgres 18.6, 16 vCPU, at a target of ${TARGET} temp-table transactions per second, one run for each idle count`}
    >
      <div className={styles.row} role="row">
        <span className={styles.rowLabel} role="columnheader">
          Idle sessions
        </span>
        {PRESETS.map((n) => (
          <span
            key={n}
            role="columnheader"
            className={clsx(styles.cell, n === idle && styles.on)}
          >
            {pick ? (
              <button
                type="button"
                className={styles.pick}
                aria-pressed={n === idle}
                aria-label={`${n} idle sessions`}
                onClick={() => pick(n)}
              >
                {n}
              </button>
            ) : (
              <b>{n}</b>
            )}
          </span>
        ))}
      </div>
      {ROWS.map((row, i) => (
        <div className={styles.row} role="row" key={i}>
          <span className={styles.rowLabel} role="rowheader">
            {row.label}
            <small>{row.sub}</small>
          </span>
          {PRESETS.map((n) => (
            <span
              key={n}
              role="cell"
              className={clsx(styles.cell, n === idle && styles.on)}
            >
              <span className={styles.value}>
                {row.value(n)}
                {row.unit}
              </span>
              <span
                className={clsx(styles.bar, row.bar)}
                style={{
                  width: `${Math.max(1.5, (100 * row.value(n)) / row.max)}%`,
                }}
                aria-hidden="true"
              />
            </span>
          ))}
        </div>
      ))}
    </div>
  )
})

/* ---------- the key ---------- */

const Glyph = ({ children }: { children: ReactNode }) => (
  <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true">
    {children}
  </svg>
)

/**
 * `show`: the marks of steps 1 to 4, those of step 5, or all of them (the
 * board of still frames, which shows every step at once).
 */
const Key = React.memo(function Key({
  show,
}: {
  show: 'steps' | 'scale' | 'all'
}) {
  const steps = show !== 'scale'
  const scale = show !== 'steps'
  const all = show === 'all'
  return (
    <div className={styles.key} role="list" aria-label="Key">
      <span role="listitem">
        <Glyph>
          <rect className={styles.arcFill} x="1" y="5" width="14" height="6" />
        </Glyph>
        invalidation messages not yet read by all sessions
      </span>
      <span role="listitem">
        <Glyph>
          <rect className={styles.freeFill} x="1" y="5" width="14" height="6" />
        </Glyph>
        free slots: read by all sessions, or never used
      </span>
      <span role="listitem">
        <Glyph>
          <path className={styles.writer} d="M8 13L2 3h12Z" />
        </Glyph>
        writer: a session that runs temp-table DDL
      </span>
      <span role="listitem">
        <Glyph>
          <path className={styles.waiting} d="M8 13L2.5 3.5h11Z" />
        </Glyph>
        writer that waits for the lock SInvalWrite
      </span>
      {scale && (
        <span role="listitem">
          <Glyph>
            <path className={styles.signal} d="M0.5 8h5" />
            <path className={styles.signalHead} d="M4.5 4.6l5 3.4l-5 3.4Z" />
            <circle className={styles.woken} cx="13" cy="8" r="2.2" />
          </Glyph>
          catch-up signal: the session that holds the lock passes it to the one
          that is furthest behind
        </span>
      )}
      {steps && (
        <span role="listitem">
          <Glyph>
            <circle className={styles.active} cx="8" cy="8" r="4.6" />
          </Glyph>
          active session, at its read position
        </span>
      )}
      <span role="listitem">
        <Glyph>
          <circle className={styles.idle} cx="8" cy="8" r="4" />
        </Glyph>
        {steps
          ? 'session that does not read: idle, or in a long statement'
          : `${PER_MARK} idle sessions, read position`}
      </span>
      <span role="listitem">
        <Glyph>
          <path className={styles.cross} d="M3.5 3.5l9 9m0 -9l-9 9" />
        </Glyph>
        {steps
          ? 'lapped: a full cache reset at its next read'
          : `${PER_MARK} idle sessions, lapped`}
      </span>
      {all && (
        <span role="listitem">
          <Glyph>
            <circle className={styles.idle} cx="4.2" cy="8" r="3" />
            <path
              className={styles.crossSmall}
              d="M9.6 5.3l5.4 5.4m0 -5.4l-5.4 5.4"
            />
          </Glyph>
          in step 5, one mark is {PER_MARK} idle sessions
        </span>
      )}
      {scale && (
        <span role="listitem">
          <Glyph>
            <circle className={styles.flash} cx="8" cy="8" r="6" />
            <path
              className={styles.crossSmall}
              d="M5.3 5.3l5.4 5.4m0 -5.4l-5.4 5.4"
            />
          </Glyph>
          one of them resets its caches
        </span>
      )}
    </div>
  )
})

/** The measured table under its heading: in every step, and in print. */
const Numbers = ({
  idle,
  pick,
}: {
  idle: Idle | null
  pick?: (n: Idle) => void
}) => (
  <div className={styles.measured}>
    <div className={styles.measuredHead}>
      Measured on Postgres 18.6, {WRITERS} writers (step 5 draws one):
    </div>
    <Measured idle={idle} pick={pick} />
    <div className={styles.measuredFoot}>
      One run for each idle count. A second run with 5000 idle sessions, on
      another server: {SECOND_RUN} TPS. TPS cannot pass the target, so at 1000
      idle the lock waits do not lower it yet.
    </div>
  </div>
)

/* ---------- the words of a step ---------- */

/**
 * The words of every step, not shown: they lie under the words of the current
 * step and give the column the height of its longest step, so the page under
 * the figure does not move from step to step. Wide screens only.
 */
const Sizer = React.memo(function Sizer() {
  return (
    <>
      {STEPS.map((x) => (
        <div className={styles.ghost} aria-hidden="true" key={x.tab}>
          <div className={styles.head}>
            <div className={styles.count}>Step</div>
            <div className={styles.title}>{x.title}</div>
          </div>
          <div className={styles.more}>
            <div className={styles.detail}>{x.detail}</div>
          </div>
        </div>
      ))}
    </>
  )
})

/* ---------- all five steps, still: print. The still SVG is drawn from it. ---------- */

const Board = React.memo(function Board() {
  return (
    <div className={styles.board} data-qf-board role="list">
      {STEPS.map((s, i) => (
        <div className={styles.panel} role="listitem" key={s.tab}>
          <Ring frame={stillFrame(i)} />
          <div>
            <div className={styles.title}>
              {i + 1}. {s.title}
            </div>
            <div className={styles.detail}>{s.detail}</div>
            {i === SCALE && <Numbers idle={5000} />}
          </div>
        </div>
      ))}
      <Key show="all" />
      <div className={styles.note}>
        Mechanism: <span className={styles.mono}>sinvaladt.c</span>. Counts in
        steps 1 to 4: Postgres 18.6, table{' '}
        <span className={styles.mono}>(id int, v text)</span>. In step 5 the
        number of lapped marks is a sketch, not a measurement. A lapped session
        reads again at its next query (one every 30 s in this test), or when a
        signal that was already sent reaches it.
      </div>
    </div>
  )
})

/* ---------- the player ---------- */

type Player = {
  go: (step: number) => void
  toggle: () => void
  pick: (n: Idle) => void
  stop: () => void
}

/**
 * Runs the steps. On the first view it plays all of them once, then stays on
 * step 5. A click on a step plays that step once. With reduced motion nothing
 * moves until "Play", and a step shows the frame that stands for it.
 */
function createPlayer(
  el: HTMLElement,
  out: {
    frame: (f: Frame) => void
    step: (s: number) => void
    idle: (n: Idle) => void
    running: (r: boolean) => void
  },
): Player {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  const scale = createScale()
  let step = 0
  let t = STEPS[0].still
  let idle: Idle = 5000
  let playing = false // the reader has not paused
  let tour = false // go on to the next step, and through the idle counts
  let ramp = 0 // seconds of step 5 in the tour
  let seen = false
  let visible = false
  let raf = 0
  let last = 0

  const moving = () =>
    playing && (step === SCALE || tour || t < STEPS[step].duration)
  const paint = () => {
    out.frame(step === SCALE ? scale.frame() : frameAt(step, t))
    out.running(moving())
  }

  const setIdle = (n: Idle, settled: boolean) => {
    idle = n
    scale.setIdle(n, settled)
    out.idle(n)
  }

  const enter = (s: number) => {
    step = s
    out.step(s)
    if (s === SCALE) {
      ramp = 0
      // the tour starts with no idle sessions and adds them
      if (tour) {
        setIdle(0, false)
      } else setIdle(5000, true)
    } else t = playing ? 0 : STEPS[s].still
  }

  const tick = (now: number) => {
    raf = 0
    // paused after this frame was asked for: the picture stays as it is
    if (!moving()) return
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
    last = now
    if (step === SCALE) {
      scale.advance(dt)
      if (tour) {
        ramp += dt
        const k = Math.min(PRESETS.length - 1, Math.floor(ramp / DWELL))
        if (PRESETS[k] !== idle) setIdle(PRESETS[k], false)
        if (k === PRESETS.length - 1) tour = false
      }
    } else {
      const s = STEPS[step]
      t += dt
      if (tour && t >= s.duration + s.hold) enter(step + 1)
      else if (!tour && t > s.duration) t = s.duration
    }
    paint()
    run()
  }

  const run = () => {
    if (!raf && visible && !document.hidden && moving())
      raf = requestAnimationFrame(tick)
  }
  const kick = () => {
    last = performance.now()
    run()
  }

  const views = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1]
      visible = entry.isIntersecting
      // the first time a good part of the figure is on the screen
      if (entry.intersectionRatio >= 0.35 && !seen && !reduce.matches) {
        seen = true
        playing = true
        tour = true
        enter(0)
        paint()
      }
      if (visible) kick()
    },
    { threshold: [0, 0.35] },
  )
  views.observe(el)
  const onVisibility = () => kick()
  document.addEventListener('visibilitychange', onVisibility)
  const onReduce = () => {
    if (!reduce.matches) return
    playing = false
    tour = false
    paint()
  }
  reduce.addEventListener('change', onReduce)

  return {
    go(s) {
      seen = true
      tour = false
      playing = !reduce.matches
      enter(Math.max(0, Math.min(SCALE, s)))
      paint()
      kick()
    },
    toggle() {
      seen = true
      if (moving()) {
        playing = false
      } else {
        playing = true
        if (step !== SCALE) {
          tour = true
          // a step that has played to its end goes on to the next one
          if (t >= STEPS[step].duration) enter(step + 1)
        }
      }
      paint()
      kick()
    },
    pick(n) {
      seen = true
      tour = false
      // from an earlier step, the table leads to step 5
      if (step !== SCALE) {
        step = SCALE
        ramp = 0
        out.step(SCALE)
      }
      setIdle(n, !playing)
      paint()
      kick()
    },
    stop() {
      if (raf) cancelAnimationFrame(raf)
      views.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      reduce.removeEventListener('change', onReduce)
    },
  }
}

const KEYS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
  Home: -STEPS.length,
  End: STEPS.length,
}

/**
 * Fig. 2 of the temp-tables post: the shared invalidation queue as a ring,
 * explained in five steps (model.ts, Ring.tsx), in the frame of a BlogFigure.
 *
 * The server renders the first step, so the page does not move when the
 * figure starts. Print gets all five steps, still, with their text (Board).
 * Readers with no JavaScript get the still SVG and its alt text, as BlogFigure
 * does with `variants`: the same five steps as one image.
 *
 * @example
 * ```mdx
 * <QueueFigure n={2} src="/assets/blog/post-f2.svg" alt="Five steps ...">
 *
 * **Every session must read every message, and idle ones read late.** ...
 *
 * </QueueFigure>
 * ```
 */
export default function QueueFigure({ n, src, alt, children }: Props) {
  const wide = useBaseUrl(src)
  const narrow = useBaseUrl(variant(src, '-narrow'))
  const root = useRef<HTMLDivElement>(null)
  const player = useRef<Player | null>(null)
  const steps = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [frame, setFrame] = useState<Frame>(() => stillFrame(0))
  const [idle, setIdle] = useState<Idle>(5000)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return undefined
    const p = createPlayer(el, {
      frame: setFrame,
      step: setStep,
      idle: setIdle,
      running: setRunning,
    })
    player.current = p
    return () => {
      player.current = null
      p.stop()
    }
  }, [])

  const go = (s: number) => player.current?.go(s)
  const pick = React.useCallback((k: Idle) => player.current?.pick(k), [])
  const onKeys = (e: React.KeyboardEvent) => {
    const d = KEYS[e.key]
    if (!d) return
    e.preventDefault()
    const s = Math.max(0, Math.min(SCALE, step + d))
    go(s)
    steps.current?.querySelectorAll('button')[s]?.focus()
  }
  const s = STEPS[step]

  return (
    <figure className={figure.figure} id={`fig-${n}`}>
      <div className={figure.media}>
        <div className={styles.root} ref={root} data-qf-live>
          <div className={styles.player} data-qf-player>
            <div className={styles.controls}>
              <div
                className={styles.steps}
                ref={steps}
                role="group"
                aria-label="Steps of the figure"
                onKeyDown={onKeys}
              >
                {STEPS.map((x, i) => (
                  <button
                    key={x.tab}
                    type="button"
                    className={styles.button}
                    aria-current={i === step ? 'step' : undefined}
                    aria-label={`Step ${i + 1} of ${STEPS.length}: ${x.tab}`}
                    onClick={() => go(i)}
                  >
                    <b>{i + 1}</b>
                    <span>{x.tab}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.button}
                disabled={step === 0}
                onClick={() => go(step - 1)}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.button}
                disabled={step === SCALE}
                onClick={() => go(step + 1)}
              >
                Next
              </button>
              <button
                type="button"
                className={clsx(styles.button, styles.play)}
                aria-label={
                  running ? 'Pause the animation' : 'Play the animation'
                }
                onClick={() => player.current?.toggle()}
              >
                {running ? 'Pause' : 'Play'}
              </button>
            </div>

            <div className={styles.stage}>
              <Ring frame={frame} />
            </div>

            <div className={styles.text}>
              <div className={styles.now}>
                <div
                  className={styles.head}
                  aria-live={running ? 'off' : 'polite'}
                >
                  <div className={styles.count}>
                    Step {step + 1} of {STEPS.length}: {s.tab}
                  </div>
                  <div className={styles.title}>{s.title}</div>
                </div>
                <div className={styles.more}>
                  <div className={styles.detail}>{s.detail}</div>
                </div>
              </div>
              <Sizer />
            </div>
            <Numbers idle={step === SCALE ? idle : null} pick={pick} />

            <Key show={step === SCALE ? 'scale' : 'steps'} />
            <div className={styles.note}>
              Mechanism: <span className={styles.mono}>sinvaladt.c</span>.
              Counts in steps 1 to 4: Postgres 18.6, table{' '}
              <span className={styles.mono}>(id int, v text)</span>. Step 5 is
              drawn {SLOW} times slower than the server ran: the writer's speed,
              its waits and the reset flashes are the measured rates, and the
              number of lapped marks is a sketch. A lapped session reads again
              at its next query (one every 30 s in this test), or when a signal
              that was already sent reaches it.
            </div>
          </div>

          <Board />
        </div>
        <noscript>
          <style>{`[data-qf-live]{display:none!important}`}</style>
          <picture className={figure.picture}>
            <source media={NARROW} srcSet={narrow} />
            <img src={wide} alt={alt} loading="lazy" decoding="async" />
          </picture>
        </noscript>
      </div>
      <figcaption className={figure.caption}>
        <span className={figure.label}>Fig. {n}</span>
        <div className={figure.captionText}>{children}</div>
      </figcaption>
    </figure>
  )
}
