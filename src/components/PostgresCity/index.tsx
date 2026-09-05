/**
 * PostgresCity — an animated, simplified PostgreSQL cluster for the front page.
 *
 * Derived from PGSimCity (github.com/NikolayS/PGSimCity, Apache-2.0), which is
 * the same city in three dimensions. This one keeps that project's plan, its
 * semantic palette and its rule that a drawing is a claim, and drops the
 * renderer: it is plain canvas 2D with no runtime dependency, so it costs the
 * front page a few kilobytes rather than a WebGL engine.
 *
 * Behaviour the page depends on:
 *   - It never animates off-screen, in a hidden tab, or under
 *     `prefers-reduced-motion`. A reader in that last case still gets the
 *     composed city, and an explicit control to start it.
 *   - It follows the site's light and dark themes through `data-theme`, using
 *     two separately tuned palettes rather than one dimmed set.
 *   - Every district is reachable by keyboard and readable by a screen reader,
 *     and the full description exists as text whether or not canvas renders.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DISTRICTS, type DistrictId, type Pt } from './plan'
import { paletteFor } from './palette'
import { anchorAt, buildScene, draw, fitView, type Scene, type View } from './render'
import { createCity, type City } from './sim'
import styles from './styles.module.css'

const PGSIMCITY_URL = 'https://nikolays.github.io/PGSimCity/'

/** Wall-clock seconds a single animation step advances the model. */
const STEP = 1 / 60
/** Never let a backgrounded tab's catch-up run the model for minutes. */
const MAX_CATCHUP = 0.25

type ThemeMode = 'light' | 'dark'

function readTheme(): ThemeMode {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

interface HitTarget {
  id: DistrictId
  x: number
  y: number
}

export interface PostgresCityProps {
  /** Rendered above the scene. Omit for a bare figure. */
  title?: string
  className?: string
}

export default function PostgresCity({ title, className }: PostgresCityProps): JSX.Element {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const cityRef = useRef<City | null>(null)
  const viewRef = useRef<View | null>(null)
  const activeRef = useRef<DistrictId | null>(null)
  const rafRef = useRef<number>(0)
  const accRef = useRef<number>(0)
  const lastRef = useRef<number>(0)

  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [active, setActive] = useState<DistrictId | null>(null)
  const [reduced, setReduced] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [targets, setTargets] = useState<HitTarget[]>([])
  const [onScreen, setOnScreen] = useState(true)
  const [tabActive, setTabActive] = useState(true)
  const visible = onScreen && tabActive

  activeRef.current = active

  /* ---- one-time construction ------------------------------------------ */
  if (sceneRef.current === null) sceneRef.current = buildScene()
  if (cityRef.current === null) cityRef.current = createCity()

  /* ---- theme ------------------------------------------------------------ */
  useEffect(() => {
    setTheme(readTheme())
    const obs = new MutationObserver(() => setTheme(readTheme()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  /* ---- reduced motion --------------------------------------------------- */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = (): void => {
      setReduced(mq.matches)
      setPlaying(!mq.matches)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  /* ---- size ------------------------------------------------------------- */
  const resize = useCallback((): void => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const scene = sceneRef.current
    if (!wrap || !canvas || !scene) return
    const rect = wrap.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    const view = fitView(scene, rect.width, rect.height, dpr)
    viewRef.current = view

    const p: Pt = { x: 0, y: 0 }
    setTargets(
      DISTRICTS.map((d, i) => {
        anchorAt(scene, view, i, p)
        return { id: d.id, x: p.x / dpr, y: p.y / dpr }
      }),
    )
  }, [])

  useEffect(() => {
    resize()
    const wrap = wrapRef.current
    if (!wrap) return
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [resize])

  /* ---- pause when nobody is looking -------------------------------------
   *
   * Two independent conditions, tracked separately: whether the figure is on
   * screen and whether the tab is in front. Folding them into one flag lets a
   * tab regaining focus restart an animation that is scrolled far out of
   * view — which is exactly the case a front page cannot afford. */
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const io = new IntersectionObserver((entries) => setOnScreen(entries[0]?.isIntersecting ?? true), {
      threshold: 0.01,
    })
    io.observe(wrap)
    const onVis = (): void => setTabActive(!document.hidden)
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  /* ---- the loop --------------------------------------------------------- */
  const paint = useCallback((): void => {
    const canvas = canvasRef.current
    const scene = sceneRef.current
    const city = cityRef.current
    const view = viewRef.current
    if (!canvas || !scene || !city || !view) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    draw(ctx, {
      scene,
      view,
      pal: paletteFor(theme),
      city,
      active: activeRef.current,
    })
  }, [theme])

  useEffect(() => {
    if (!(playing && visible)) {
      /* Compose one frame anyway, so a paused or reduced-motion reader is
       * looking at the city rather than at nothing. */
      paint()
      return
    }

    lastRef.current = performance.now()
    const frame = (now: number): void => {
      const city = cityRef.current
      if (!city) return
      const dt = Math.min(MAX_CATCHUP, (now - lastRef.current) / 1000)
      lastRef.current = now
      accRef.current += dt
      let guard = 0
      while (accRef.current >= STEP && guard < 16) {
        city.step(STEP)
        accRef.current -= STEP
        guard++
      }
      paint()
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing, visible, paint])

  /* Repaint on theme change or hover even while paused. */
  useEffect(() => {
    if (!playing || !visible) paint()
  }, [theme, active, targets, playing, visible, paint])

  const describedBy = active ? `pgcity-blurb-${active}` : undefined
  const current = DISTRICTS.find((d) => d.id === active) ?? null

  return (
    <figure className={[styles.figure, className].filter(Boolean).join(' ')}>
      {title ? <figcaption className={styles.title}>{title}</figcaption> : null}

      <div className={styles.stage} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label="A simplified PostgreSQL cluster drawn as a city: clients and the postmaster to the north, a row of backend processes, the shared buffer pool at the centre over the data directory, the write-ahead log to the east, maintenance processes to the west, and a streaming standby to the south."
          aria-describedby={describedBy}
        />

        {/* Real focusable controls, positioned over the scene. Hover and
            keyboard focus drive the same highlight, so the mouse and the Tab
            key see identical behaviour. */}
        <div className={styles.hits}>
          {targets.map((t) => {
            const d = DISTRICTS.find((x) => x.id === t.id)
            if (!d) return null
            return (
              <button
                key={t.id}
                type="button"
                className={[styles.hit, active === t.id ? styles.hitOn : ''].join(' ')}
                style={{ left: `${t.x}px`, top: `${t.y}px` }}
                onMouseEnter={() => setActive(t.id)}
                onMouseLeave={() => setActive((cur) => (cur === t.id ? null : cur))}
                onFocus={() => setActive(t.id)}
                onBlur={() => setActive((cur) => (cur === t.id ? null : cur))}
                onClick={() => setActive((cur) => (cur === t.id ? null : t.id))}
                aria-pressed={active === t.id}
              >
                <span className={styles.srOnly}>
                  {d.label} — {d.sub}. {d.blurb}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className={styles.motionToggle}
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause the animation' : 'Start the animation'}
        >
          {playing ? '❙❙ pause' : '▶ play'}
        </button>

        <div className={styles.blurbSlot} aria-live="polite">
          {current ? (
            <p className={styles.blurb} id={`pgcity-blurb-${current.id}`}>
              <strong>{current.label}</strong>
              <span className={styles.blurbSub}> {current.sub}</span>
              <br />
              {current.blurb}
            </p>
          ) : (
            <p className={styles.blurbHint}>
              {reduced && !playing
                ? 'Motion is off, matching your system setting. Press play to run the cluster.'
                : 'Hover or tab through a district to see what it does.'}
            </p>
          )}
        </div>
      </div>

      <div className={styles.legend}>
        <span className={styles.key} data-c="wal">
          write-ahead log
        </span>
        <span className={styles.key} data-c="dirty">
          dirty page
        </span>
        <span className={styles.key} data-c="clean">
          clean page
        </span>
        <span className={styles.key} data-c="checkpoint">
          checkpoint
        </span>
        <span className={styles.key} data-c="bgwriter">
          background writer
        </span>
        <span className={styles.key} data-c="vacuum">
          autovacuum
        </span>
        <span className={styles.key} data-c="replication">
          replication
        </span>
        <span className={styles.key} data-c="storage">
          storage
        </span>
      </div>

      {/* Load-bearing, not chrome: this qualification stays at every width.
          If the viewport cannot hold both the picture and this sentence, the
          picture is what goes. */}
      <p className={styles.disclosure}>
        A model, not a monitor. This runs a scaled simulation of PostgreSQL in your browser — it is
        not live data from any database. Twelve backends stand in for a full connection set, 48
        frames for the whole buffer pool, and the rates are slowed so the mechanisms are watchable.{' '}
        <a href={PGSIMCITY_URL} target="_blank" rel="noopener noreferrer">
          Explore the full 3D city
        </a>
        .
      </p>

      {/* The city as text. Present for screen readers and for anyone whose
          browser never draws the canvas at all. */}
      <details className={styles.textAlt}>
        <summary>Read this as text</summary>
        <ul>
          {DISTRICTS.map((d) => (
            <li key={d.id}>
              <strong>{d.label}</strong> ({d.sub}) — {d.blurb}
            </li>
          ))}
        </ul>
        <p>
          A statement travels client → backend → buffer pool. A change is made to a page in shared
          memory and its WAL record is written; the transaction commits only once that record is
          flushed to durable storage. The changed page itself is still in memory at that point, and
          reaches the data directory later — at a checkpoint, through the background writer, or
          because another backend needed its frame. The standby receives the log, not the pages.
        </p>
      </details>
    </figure>
  )
}
