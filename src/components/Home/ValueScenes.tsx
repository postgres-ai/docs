import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useMedia } from './motion'
import ControlUniverse from './ControlUniverse'
import styles from './styles.module.css'

const ShaderLayer = lazy(() => import('./ShaderLayer'))

class EffectBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

function Backdrop({ paused, hero = false }: { paused: boolean; hero?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useMedia('(prefers-reduced-motion: reduce)')
  const wide = useMedia('(min-width: 768px)')
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const unavailable = useCallback(() => setFailed(true), [])
  const active = visible && (!hero || wide === true) && reduce === false && !paused && !failed && typeof navigator !== 'undefined' && 'gpu' in navigator
  return (
    <div ref={ref} className={`${styles.shaderBackdrop} ${hero ? styles.universeBackdrop : ''}`} aria-hidden="true" data-effect={active ? 'gpu' : 'static'}>
      {active && <EffectBoundary><Suspense fallback={null}><ShaderLayer onUnavailable={unavailable} hero={hero} /></Suspense></EffectBoundary>}
    </div>
  )
}

export function Stage({ label, children, hero = false, quiet = false }: { label: string; hero?: boolean; quiet?: boolean; children: React.ReactNode | ((paused: boolean) => React.ReactNode) }) {
  const [paused, setPaused] = useState(false)
  const reduce = useMedia('(prefers-reduced-motion: reduce)')
  return (
    <div className={`${styles.valueStage} ${hero ? styles.universeStage : ''} ${quiet ? styles.evidenceStage : ''}`} data-paused={paused || reduce !== false}>
      {!quiet && <Backdrop paused={paused} hero={hero} />}
      <div className={styles.stageToolbar}>
        <span>{label}</span>
        {reduce === false && <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>
          {paused ? 'Enable effects' : 'Pause effects'}
        </button>}
      </div>
      <div className={styles.stageContent}>{typeof children === 'function' ? children(paused || reduce === true) : children}</div>
    </div>
  )
}

const CONTROL_STEPS = [
  { label: 'Monitor', title: 'Signals, continuously checked.', detail: 'Track query performance, indexes, settings and database risks over time.', status: 'MONITORING', name: 'Observe' },
  { label: 'Diagnose', title: 'Problems become a worklist.', detail: 'Prioritize findings by severity, with evidence and a recommended next step.', status: 'PRIORITIZING', name: 'Diagnose' },
  { label: 'Test', title: 'Create. Experiment. Dispose. Repeat.', detail: 'Try changes on full-size DBLab clones. Discard them when you’re done; production stays untouched.', status: 'VALIDATING', name: 'Validate' },
  { label: 'Review', title: 'Your team stays in control.', detail: 'Review the evidence and decide which changes to apply. Production changes stay deliberate.', status: 'REVIEW', name: 'Decide' },
]

function ControlFlow({ paused }: { paused: boolean }) {
  const [step, setStep] = useState(0)
  const [tour, setTour] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useMedia('(prefers-reduced-motion: reduce)')
  const cycling = tour && !paused && reduce === false && visible && pageVisible && !hovered && !focused
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    // isIntersecting is true for any visible pixel; the tour cycles only while a quarter is in view.
    // A batch can hold several entries for this element; the last one is current.
    const observer = new IntersectionObserver(entries => setVisible(entries[entries.length - 1].intersectionRatio >= .25), { threshold: .25 })
    observer.observe(element)
    const visibility = () => setPageVisible(!document.hidden)
    visibility()
    document.addEventListener('visibilitychange', visibility)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  useEffect(() => {
    if (!cycling) return undefined
    const timer = window.setTimeout(() => setStep(s => (s + 1) % CONTROL_STEPS.length), 8000)
    return () => window.clearTimeout(timer)
  }, [cycling, step])
  const current = CONTROL_STEPS[step]
  return <div ref={ref} data-cycling={cycling} onPointerEnter={e => { if (e.pointerType === 'mouse') setHovered(true) }} onPointerLeave={() => setHovered(false)}>
      <ControlUniverse step={step} paused={paused} />
      <div className={styles.controlSteps} aria-label="Explore the database control workflow">
        {CONTROL_STEPS.map((item, i) => <button key={item.label} type="button" aria-pressed={step === i} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onClick={() => { setTour(false); setStep(i) }}><span>0{i + 1}</span>{item.label}</button>)}
      </div>
      <div className={styles.controlExplanation}><strong aria-hidden={!tour}>{current.title}</strong><p aria-hidden={!tour}>{current.detail}</p>
        {/* The live region stays mounted so screen readers announce manual choices; the auto tour stays
            silent. In manual mode it carries the text, so the visible copy is hidden from them. */}
        <span className={styles.srOnly} aria-live="polite">{tour ? '' : `${current.label}: ${current.title} ${current.detail}`}</span>
        {reduce === false && <div className={styles.controlTour}><span>{tour ? 'Auto tour · choose a mode to explore' : 'You’re exploring this mode'}</span><button type="button" onClick={() => setTour(!tour)}>{tour ? 'Pause tour' : 'Resume tour'}</button></div>}
      </div>
    </div>
}

export function ControlScene() {
  return (
    <Stage hero label="DATABASE HEALTH CONTROL / INTERACTIVE ILLUSTRATION">
      {(paused) => <ControlFlow paused={paused} />}
    </Stage>
  )
}
