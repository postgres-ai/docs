import React, { ReactNode, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import figure from '@site/src/components/BlogFigure/styles.module.css'
import styles from './styles.module.css'

/*
 * The AAA architecture (Analyst, Auditor, Actor) as a small 3D scene, in the
 * same three tiers as the 2D diagram:
 *
 *   top      Analyst (left) and Auditor (right): AI roles, no direct DB access
 *   middle   Actor: a wide glass slab, the deterministic execution barrier;
 *            only write/execution actions pass down through it
 *   bottom   Clones (left: 2-node cluster) and Production Postgres (right:
 *            fortified 3-node HA cluster: 1 primary + 2 standbys), each with
 *            a read-only telemetry brick broadcasting signals that Analyst,
 *            Auditor, and Actor can safely consume at any time
 *
 * Phase 1 (blue): the Analyst rehearses a change against the Clones cluster
 * through the Actor, and the Clones telemetry brick radiates live signals.
 * Review (violet): the change request goes to the Auditor, which can send it
 * back for iteration, reject it, or approve it. Phase 2 (emerald): only an
 * approved change goes down through the Actor into the 3-node Production
 * Postgres cluster, whose telemetry brick radiates post-change signals.
 *
 * A canvas draws the wireframe; the labels are HTML, placed every frame at
 * projected 3D anchors, so text stays sharp and readable by screen readers.
 * No dependencies: one perspective camera, projected by hand. Every browser
 * API is touched inside effects only, so the server render is safe.
 */

type Vec3 = readonly [number, number, number]
type FlowId = 'rehearse' | 'telemetry' | 'review' | 'apply' | 'feedback'
type Focus = FlowId | null
type LabelId =
  | 'analyst'
  | 'auditor'
  | 'actor'
  | 'clones'
  | 'prod'
  | 'rehearse'
  | 'telemetry'
  | 'feedback'
  | 'review'
  | 'sendback'
  | 'apply'
  | 'reject'

type Props = {
  /** Figure number shown in the label ("Fig. 3"); without it, bare hero art */
  n?: number
  /** Caption: a bold first sentence, then the details */
  children?: ReactNode
}

/* ---------- the scene, in world units: x left to right, y up ---------- */

const AN_X = -1.68 // Analyst & Clones cluster center
const AU_X = 1.68 // Auditor & Production cluster center
const CW = 1.24 // card width
const CY0 = 2.58 // card bottom
const CY1 = 3.38 // card top

// Actor glass slab: deterministic barrier, sole write path
const SLAB = { x0: -2.68, x1: 2.68, z0: -0.82, z1: 0.82, y0: 1.48, y1: 1.58 }
const SLAB_Y = (SLAB.y0 + SLAB.y1) / 2

// Execution lanes (downward ONLY, through Actor ports)
const X_REHEARSE = AN_X
const X_APPLY = AU_X
const X_REJECT = AU_X + 0.43
const Y_REJECT = 2.32
const Y_REVIEW = 3.16
const Y_BACK = 2.82

// Clones cluster (left: 2-node primary + standby inside a light cluster frame)
const CLONE_CYL = { r: 0.21, h: 0.44 }
const CLONE_BOX = { x0: AN_X - 0.72, x1: AN_X + 0.72, z: 0.46, h: 0.64 }
const CLONE_NODES: readonly { x: number; z: number; role: 'primary' | 'standby' }[] = [
  { x: AN_X - 0.34, z: 0.06, role: 'primary' },
  { x: AN_X + 0.34, z: -0.06, role: 'standby' },
]

// Production Postgres (right: classic 3-node HA cluster inside a fortified vault)
const PROD = { x0: AU_X - 0.88, x1: AU_X + 0.88, z: 0.6, h: 0.76, inset: 0.08 }
const PROD_CYL = { r: 0.17, hPrimary: 0.47, hStandby: 0.41 }
const PROD_NODES: readonly { x: number; z: number; h: number; primary: boolean }[] = [
  { x: AU_X - 0.49, z: 0.2, h: PROD_CYL.hPrimary, primary: true },
  { x: AU_X + 0.09, z: -0.26, h: PROD_CYL.hStandby, primary: false },
  { x: AU_X + 0.49, z: 0.22, h: PROD_CYL.hStandby, primary: false },
]

// Read-only telemetry bricks attached to Clones and Production (emit safe signals consumable by all)
const TEL_BRICK = { w: 0.24, h: 0.24, z: 0.14 }
const TEL_CLONE: Vec3 = [CLONE_BOX.x0 - TEL_BRICK.w / 2 - 0.02, 0, 0]
const TEL_PROD: Vec3 = [PROD.x1 + TEL_BRICK.w / 2 + 0.02, 0, 0]

// Post-change feedback loop: Production telemetry -> Auditor & Analyst (improve over time)
const X_FB_R = 3.08
const Y_FB_TOP = 3.74
const P_FB_TO_AN: Vec3[] = [
  [TEL_PROD[0], TEL_BRICK.h + 0.06, 0],
  [X_FB_R, TEL_BRICK.h + 0.06, 0],
  [X_FB_R, Y_FB_TOP, 0],
  [AN_X, Y_FB_TOP, 0],
  [AN_X, CY1, 0],
]
const P_FB_TO_AU: Vec3[] = [
  [TEL_PROD[0], TEL_BRICK.h + 0.06, 0],
  [X_FB_R, TEL_BRICK.h + 0.06, 0],
  [X_FB_R, Y_FB_TOP, 0],
  [AU_X, Y_FB_TOP, 0],
  [AU_X, CY1, 0],
]

// Execution paths (vertical through Actor)
const P_REHEARSE: [Vec3, Vec3] = [
  [X_REHEARSE, CY0, 0],
  [X_REHEARSE, CLONE_BOX.h, 0],
]
const P_APPLY: [Vec3, Vec3] = [
  [X_APPLY, CY0, 0],
  [X_APPLY, PROD.h, 0],
]

// Review paths (top tier)
const P_REVIEW: [Vec3, Vec3] = [
  [AN_X + CW / 2, Y_REVIEW, 0],
  [AU_X - CW / 2, Y_REVIEW, 0],
]
const P_BACK: [Vec3, Vec3] = [
  [AU_X - CW / 2, Y_BACK, 0],
  [AN_X + CW / 2, Y_BACK, 0],
]
const P_REJECT: [Vec3, Vec3] = [
  [X_REJECT, CY0, 0],
  [X_REJECT, Y_REJECT, 0],
]

const lerp3 = (a: Vec3, b: Vec3, k: number): Vec3 => [
  a[0] + (b[0] - a[0]) * k,
  a[1] + (b[1] - a[1]) * k,
  a[2] + (b[2] - a[2]) * k,
]

const dist3 = (a: Vec3, b: Vec3) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])

const samplePolyline = (pts: Vec3[], k: number): Vec3 => {
  const segs: number[] = []
  let total = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const d = dist3(pts[i], pts[i + 1])
    segs.push(d)
    total += d
  }
  const target = Math.max(0, Math.min(1, k)) * total
  let acc = 0
  for (let i = 0; i < segs.length; i++) {
    if (acc + segs[i] >= target || i === segs.length - 1) {
      const local = segs[i] > 0 ? (target - acc) / segs[i] : 0
      return lerp3(pts[i], pts[i + 1], local)
    }
    acc += segs[i]
  }
  return pts[pts.length - 1]
}

const slicePolyline = (pts: Vec3[], k0: number, k1: number): Vec3[] => {
  const a = Math.max(0, Math.min(1, k0))
  const b = Math.max(a, Math.min(1, k1))
  const segs: number[] = []
  let total = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const d = dist3(pts[i], pts[i + 1])
    segs.push(d)
    total += d
  }
  if (total <= 0) return [pts[0]]
  const t0 = a * total
  const t1 = b * total
  const out: Vec3[] = [samplePolyline(pts, a)]
  let acc = 0
  for (let i = 0; i < segs.length; i++) {
    acc += segs[i]
    if (acc > t0 && acc < t1) out.push(pts[i + 1])
  }
  out.push(samplePolyline(pts, b))
  return out
}

/* ---------- words ---------- */

const NODES: { id: LabelId; text: string; hint?: [string, string] }[] = [
  { id: 'analyst', text: 'Analyst' },
  { id: 'auditor', text: 'Auditor' },
  { id: 'actor', text: 'Actor', hint: ['deterministic · ', 'sole write path'] },
  { id: 'clones', text: 'Clones' },
  { id: 'prod', text: 'Production Postgres' },
]

const PILLS: { id: LabelId; flow: FlowId; text: string; sub?: string; shortText?: string; dashed?: boolean }[] = [
  { id: 'rehearse', flow: 'rehearse', text: 'rehearse', sub: '(DB experiments)' },
  { id: 'telemetry', flow: 'telemetry', text: 'telemetry', dashed: true },
  { id: 'feedback', flow: 'feedback', text: 'feedback · improve over time', shortText: 'feedback', dashed: true },
  { id: 'review', flow: 'review', text: 'change request', shortText: 'CR' },
  { id: 'sendback', flow: 'review', text: 'send back', dashed: true },
  { id: 'apply', flow: 'apply', text: 'approve → apply', shortText: 'apply' },
]

/* ---------- layouts: camera and label places, wide and narrow ---------- */

type Place = { at: Vec3; dx: number; dy: number; ax: number; ay: number }
type Layout = {
  compact: boolean
  yaw: number // degrees, camera around y; 0 looks along -z
  pitch: number // degrees, camera above the target
  dist: number
  focal: number // × width
  target: Vec3
  ox: number // where the target lands, × width
  oy: number // × height
  place: Record<LabelId, Place>
}

const CARD_TL_AN: Vec3 = [AN_X - CW / 2, CY1, 0]
const CARD_TL_AU: Vec3 = [AU_X - CW / 2, CY1, 0]
const ACTOR_AT: Vec3 = [-0.04, SLAB.y1, 0.28]
const CLONES_AT: Vec3 = [AN_X, 0, CLONE_BOX.z + 0.08]
const PROD_AT: Vec3 = [AU_X, 0, PROD.z + 0.08]

const WIDE: Layout = {
  compact: false,
  yaw: -8,
  pitch: 13,
  dist: 10.4,
  focal: 0.99,
  target: [0.05, 1.84, 0],
  ox: 0.5,
  oy: 0.51,
  place: {
    analyst: { at: CARD_TL_AN, dx: 8, dy: 7, ax: 0, ay: 0 },
    auditor: { at: CARD_TL_AU, dx: 8, dy: 7, ax: 0, ay: 0 },
    actor: { at: ACTOR_AT, dx: 0, dy: 0, ax: 0.5, ay: 0.5 },
    clones: { at: CLONES_AT, dx: 0, dy: 21, ax: 0.5, ay: 0 },
    prod: { at: PROD_AT, dx: 0, dy: 21, ax: 0.5, ay: 0 },
    rehearse: { at: [X_REHEARSE, 1.06, 0], dx: 10, dy: 0, ax: 0, ay: 0.5 },
    telemetry: { at: [TEL_CLONE[0] - 0.14, 0.55, 0], dx: -10, dy: 0, ax: 1, ay: 0.5 },
    feedback: { at: [0, Y_FB_TOP, 0], dx: 0, dy: -5, ax: 0.5, ay: 1 },
    review: { at: [0, Y_REVIEW, 0], dx: 0, dy: -5, ax: 0.5, ay: 1 },
    sendback: { at: [0, Y_BACK, 0], dx: 0, dy: 5, ax: 0.5, ay: 0 },
    apply: { at: [X_APPLY, 2.08, 0], dx: -10, dy: 0, ax: 1, ay: 0.5 },
    reject: { at: [X_REJECT, Y_REJECT, 0], dx: 15, dy: 0, ax: 0, ay: 0.5 },
  },
}

const NARROW: Layout = {
  compact: true,
  yaw: -7,
  pitch: 14,
  dist: 10.4,
  focal: 1.32,
  target: [0.05, 1.84, 0],
  ox: 0.5,
  oy: 0.51,
  place: {
    analyst: { at: CARD_TL_AN, dx: 5, dy: 4, ax: 0, ay: 0 },
    auditor: { at: CARD_TL_AU, dx: 5, dy: 4, ax: 0, ay: 0 },
    actor: { at: [0, SLAB.y1, 0.28], dx: 0, dy: 0, ax: 0.5, ay: 0.5 },
    clones: { at: CLONES_AT, dx: 0, dy: 7, ax: 0.5, ay: 0 },
    prod: { at: PROD_AT, dx: 0, dy: 7, ax: 0.5, ay: 0 },
    rehearse: { at: [X_REHEARSE, 1.06, 0], dx: 7, dy: 0, ax: 0, ay: 0.5 },
    telemetry: { at: [0, 0.36, 0], dx: 0, dy: 0, ax: 0.5, ay: 0.5 },
    feedback: { at: [0, Y_FB_TOP, 0], dx: 0, dy: -4, ax: 0.5, ay: 1 },
    review: { at: [0, Y_REVIEW, 0], dx: 0, dy: -4, ax: 0.5, ay: 1 },
    sendback: { at: [0, Y_BACK, 0], dx: 0, dy: 4, ax: 0.5, ay: 0 },
    apply: { at: [X_APPLY, 1.06, 0], dx: 7, dy: 0, ax: 0, ay: 0.5 },
    reject: { at: [X_REJECT, Y_REJECT, 0], dx: 0, dy: 5, ax: 0.5, ay: 0 },
  },
}

const COMPACT_BELOW = 560
const layoutFor = (w: number) => (w < COMPACT_BELOW ? NARROW : WIDE)
const heightFor = (w: number) =>
  Math.round(w < COMPACT_BELOW ? Math.min(340, Math.max(246, w * 0.76)) : Math.min(435, Math.max(375, w * 0.48)))

// Labels are placed in this order; a later one moves out of an earlier one's way.
const LABEL_ORDER: LabelId[] = [
  'analyst',
  'auditor',
  'actor',
  'clones',
  'prod',
  'feedback',
  'telemetry',
  'review',
  'sendback',
  'apply',
  'reject',
  'rehearse',
]

/* ---------- colours of the canvas (the labels take theirs from CSS) ---------- */

type Rgb = readonly [number, number, number]
type Palette = {
  grid: Rgb
  gridMajor: number
  gridMinor: number
  fill: string
  fillBack: string
  glass: string
  glassSide: string
  edge: string
  soft: string
  faint: string
  muted: string
  bg: Rgb
  flow: Record<FlowId | 'reject', Rgb>
}

const LIGHT: Palette = {
  grid: [24, 24, 27],
  gridMajor: 0.17,
  gridMinor: 0.06,
  fill: 'rgba(246, 246, 243, 0.84)',
  fillBack: 'rgba(240, 240, 236, 0.5)',
  glass: 'rgba(214, 222, 236, 0.28)',
  glassSide: 'rgba(196, 204, 220, 0.34)',
  edge: 'rgba(26, 26, 30, 0.52)',
  soft: 'rgba(26, 26, 30, 0.22)',
  faint: 'rgba(26, 26, 30, 0.1)',
  muted: 'rgba(26, 26, 30, 0.48)',
  bg: [255, 255, 255],
  flow: {
    rehearse: [44, 96, 208],
    telemetry: [14, 116, 144],
    feedback: [14, 116, 144],
    review: [116, 72, 204],
    apply: [10, 138, 94],
    reject: [204, 52, 44],
  },
}

const DARK: Palette = {
  grid: [255, 255, 255],
  gridMajor: 0.13,
  gridMinor: 0.045,
  fill: 'rgba(38, 40, 45, 0.84)',
  fillBack: 'rgba(38, 40, 45, 0.45)',
  glass: 'rgba(120, 140, 180, 0.13)',
  glassSide: 'rgba(120, 140, 180, 0.2)',
  edge: 'rgba(236, 236, 230, 0.48)',
  soft: 'rgba(236, 236, 230, 0.2)',
  faint: 'rgba(236, 236, 230, 0.09)',
  muted: 'rgba(236, 236, 230, 0.5)',
  bg: [27, 27, 29],
  flow: {
    rehearse: [124, 163, 248],
    telemetry: [56, 189, 248],
    feedback: [56, 189, 248],
    review: [178, 146, 250],
    apply: [62, 199, 145],
    reject: [242, 124, 113],
  },
}

const rgba = (c: Rgb, a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`

/* ---------- motion: one cycle of the story ---------- */

const DEG = Math.PI / 180
const T = 9.0 // seconds per cycle
const OUTCOMES = ['apply', 'back', 'apply', 'reject'] as const
const easeIO = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3)
const span = (u: number, a: number, b: number) => (u < a || u > b ? -1 : (u - a) / (b - a))

type P2 = { x: number; y: number; z: number }

/* ---------- the theme of the site, also after hydration ---------- */

const useDarkTheme = () => {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const el = document.documentElement
    const read = () => setDark(el.getAttribute('data-theme') === 'dark')
    read()
    const mo = new MutationObserver(read)
    mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])
  return dark
}

/**
 * The AAA architecture as an animated 3D scene: Analyst and Auditor above,
 * the Actor slab in the middle (sole write path), Clones and a 3-node
 * Production Postgres cluster on the floor, each with an always-on read-only
 * telemetry brick broadcasting signals that any role can safely consume.
 * Without `n` it is bare hero art on a transparent canvas.
 *
 * @example
 * ```mdx
 * <div className="pgai-hero-art">
 * <AaaPipeline3D />
 * </div>
 * ```
 */
export const AaaPipeline3D = ({ n, children }: Props) => {
  const dark = useDarkTheme()
  const [focus, setFocus] = useState<Focus>(null)
  const [compact, setCompact] = useState(false)
  const [paused, setPaused] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labels = useRef<Partial<Record<LabelId, HTMLDivElement | null>>>({})
  const darkRef = useRef(dark)
  const focusRef = useRef<Focus>(focus)
  const pausedRef = useRef(paused)
  const kickRef = useRef<() => void>(() => {})

  useEffect(() => {
    darkRef.current = dark
    focusRef.current = focus
    pausedRef.current = paused
    kickRef.current()
  }, [dark, focus, paused])

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!stage || !canvas || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sizes = new Map<LabelId, { w: number; h: number }>()
    let w = 0
    let h = 0
    let L: Layout = WIDE
    let raf = 0
    let visible = true
    let last = 0
    let simTime = 0.9 // the first frame: already in flight

    // camera state: spring-damped drag, eased pointer tilt
    const cam = { dyaw: 0, dpitch: 0, vyaw: 0, vpitch: 0, px: 0, py: 0, tpx: 0, tpy: 0 }
    const drag = { on: false, id: -1, x: 0, y: 0, yaw: 0, pitch: 0 }
    // how lit each flow is: the one in motion glows, a hovered pill isolates its flow
    const lit: Record<FlowId, number> = { rehearse: 1, telemetry: 1, feedback: 1, review: 1, apply: 1 }
    const vis: Record<FlowId, number> = { rehearse: 1, telemetry: 1, feedback: 1, review: 1, apply: 1 }

    /* --- projection --- */
    let C: Vec3 = [0, 0, 0]
    let R: Vec3 = [1, 0, 0]
    let U: Vec3 = [0, 1, 0]
    let F: Vec3 = [0, 0, -1]
    let focal = 1
    let ox = 0
    let oy = 0

    const setCamera = (yaw: number, pitch: number) => {
      const [tx, ty, tz] = L.target
      const cp = Math.cos(pitch)
      C = [tx + L.dist * cp * Math.sin(yaw), ty + L.dist * Math.sin(pitch), tz + L.dist * cp * Math.cos(yaw)]
      let fx = tx - C[0]
      let fy = ty - C[1]
      let fz = tz - C[2]
      const fl = Math.hypot(fx, fy, fz)
      fx /= fl
      fy /= fl
      fz /= fl
      F = [fx, fy, fz]
      const rl = Math.hypot(fz, fx)
      R = [-fz / rl, 0, fx / rl]
      U = [R[1] * fz - R[2] * fy, R[2] * fx - R[0] * fz, R[0] * fy - R[1] * fx]
      focal = L.focal * w
      ox = L.ox * w
      oy = L.oy * h
    }

    const project = (p: Vec3): P2 => {
      const dx = p[0] - C[0]
      const dy = p[1] - C[1]
      const dz = p[2] - C[2]
      const zc = dx * F[0] + dy * F[1] + dz * F[2]
      const s = focal / Math.max(zc, 0.05)
      return {
        x: ox + (dx * R[0] + dy * R[1] + dz * R[2]) * s,
        y: oy - (dx * U[0] + dy * U[1] + dz * U[2]) * s,
        z: zc,
      }
    }

    /* --- drawing helpers --- */
    const poly = (pts: Vec3[], fill: string | null, stroke: string | null, lw = 1) => {
      ctx.beginPath()
      pts.forEach((p, i) => {
        const q = project(p)
        if (i) ctx.lineTo(q.x, q.y)
        else ctx.moveTo(q.x, q.y)
      })
      ctx.closePath()
      if (fill) {
        ctx.fillStyle = fill
        ctx.fill()
      }
      if (stroke) {
        ctx.lineWidth = lw
        ctx.strokeStyle = stroke
        ctx.stroke()
      }
    }

    const polyline = (pts: Vec3[], stroke: string, lw = 1.2, dash: number[] | null = null) => {
      if (pts.length < 2) return
      ctx.beginPath()
      pts.forEach((p, i) => {
        const q = project(p)
        if (i) ctx.lineTo(q.x, q.y)
        else ctx.moveTo(q.x, q.y)
      })
      ctx.strokeStyle = stroke
      ctx.lineWidth = lw
      if (dash) ctx.setLineDash(dash)
      ctx.stroke()
      if (dash) ctx.setLineDash([])
    }

    const line = (a: Vec3, b: Vec3, stroke: string | CanvasGradient, lw = 1, dash: number[] | null = null) => {
      const p = project(a)
      const q = project(b)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(q.x, q.y)
      ctx.strokeStyle = stroke
      ctx.lineWidth = lw
      if (dash) ctx.setLineDash(dash)
      ctx.stroke()
      if (dash) ctx.setLineDash([])
    }

    const rectZ = (z: number, x0: number, x1: number, y0: number, y1: number): Vec3[] => [
      [x0, y0, z],
      [x1, y0, z],
      [x1, y1, z],
      [x0, y1, z],
    ]
    const rectY = (y: number, x0: number, x1: number, z0: number, z1: number): Vec3[] => [
      [x0, y, z0],
      [x1, y, z0],
      [x1, y, z1],
      [x0, y, z1],
    ]

    const square = (q: { x: number; y: number }, size: number, fill: string | null, stroke: string | null, lw = 1) => {
      const s = size / 2
      if (fill) {
        ctx.fillStyle = fill
        ctx.fillRect(q.x - s, q.y - s, size, size)
      }
      if (stroke) {
        ctx.lineWidth = lw
        ctx.strokeStyle = stroke
        ctx.strokeRect(q.x - s, q.y - s, size, size)
      }
    }

    const arrow = (a: Vec3, b: Vec3, color: string, size = 5) => {
      const p = project(a)
      const q = project(b)
      const dx = q.x - p.x
      const dy = q.y - p.y
      const l = Math.hypot(dx, dy) || 1
      const ux = dx / l
      const uy = dy / l
      ctx.beginPath()
      ctx.moveTo(q.x, q.y)
      ctx.lineTo(q.x - ux * size * 1.5 - uy * size * 0.75, q.y - uy * size * 1.5 + ux * size * 0.75)
      ctx.lineTo(q.x - ux * size * 1.5 + uy * size * 0.75, q.y - uy * size * 1.5 - ux * size * 0.75)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    }

    const tinyText = (text: string, p: Vec3, color: string, align: CanvasTextAlign = 'left') => {
      const q = project(p)
      ctx.font = '500 9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
      ctx.fillStyle = color
      ctx.textAlign = align
      ctx.textBaseline = 'middle'
      ctx.fillText(text, q.x, q.y)
    }

    /* --- the floor grid, fading out from the middle of the scene --- */
    const GX0 = -6.5
    const GX1 = 6.5
    const GZ0 = -4
    const GZ1 = 4
    const GS = 0.25
    const NX = Math.round((GX1 - GX0) / GS)
    const NZ = Math.round((GZ1 - GZ0) / GS)
    const BUCKETS = 10
    const fade = (x: number, z: number) => {
      const a = x / 5.6
      const b = (z + 0.4) / 3.4
      const r = Math.sqrt(a * a + b * b)
      return r >= 1 ? 0 : (1 - r) * (1 - r) * (3 - 2 * (1 - r))
    }
    const gridPts: P2[] = new Array((NX + 1) * (NZ + 1))

    const drawGrid = (P: Palette) => {
      for (let i = 0; i <= NX; i++)
        for (let j = 0; j <= NZ; j++) gridPts[i * (NZ + 1) + j] = project([GX0 + i * GS, 0, GZ0 + j * GS])
      const paths: Path2D[][] = [[], []]
      for (let m = 0; m < 2; m++) for (let b = 0; b <= BUCKETS; b++) paths[m][b] = new Path2D()
      const seg = (i0: number, j0: number, i1: number, j1: number, major: boolean) => {
        const a = gridPts[i0 * (NZ + 1) + j0]
        const b = gridPts[i1 * (NZ + 1) + j1]
        if (a.z < 0.4 || b.z < 0.4) return
        const f = fade(GX0 + ((i0 + i1) / 2) * GS, GZ0 + ((j0 + j1) / 2) * GS)
        const k = Math.round(f * BUCKETS)
        if (!k) return
        const p = paths[major ? 1 : 0][k]
        p.moveTo(a.x, a.y)
        p.lineTo(b.x, b.y)
      }
      for (let i = 0; i <= NX; i++) {
        const major = (i - 2) % 4 === 0
        for (let j = 0; j < NZ; j++) seg(i, j, i, j + 1, major)
      }
      for (let j = 0; j <= NZ; j++) {
        const major = j % 4 === 0
        for (let i = 0; i < NX; i++) seg(i, j, i + 1, j, major)
      }
      ctx.lineWidth = 1
      for (let m = 0; m < 2; m++)
        for (let b = 1; b <= BUCKETS; b++) {
          ctx.strokeStyle = rgba(P.grid, (b / BUCKETS) * (m ? P.gridMajor : P.gridMinor))
          ctx.stroke(paths[m][b])
        }
    }

    /* --- a wireframe Postgres cylinder standing at (cx, 0, cz) --- */
    const cylinder = (cx: number, cz: number, r: number, hh: number, P: Palette, stroke: string, lw = 1) => {
      const thR = Math.atan2(R[2], R[0])
      const front = Math.cos(thR + Math.PI / 2) * -F[0] + Math.sin(thR + Math.PI / 2) * -F[2] > 0 ? 1 : -1
      const rim = (y: number, th: number): Vec3 => [cx + r * Math.cos(th), y, cz + r * Math.sin(th)]
      const N = 24
      const arc = (y: number, dir: number) => {
        const pts: Vec3[] = []
        for (let i = 0; i <= N; i++) pts.push(rim(y, thR + dir * (Math.PI * i) / N))
        return pts
      }
      const frontBottom = arc(0, front)
      const backTop = arc(hh, -front)
      ctx.beginPath()
      frontBottom.forEach((p, i) => {
        const q = project(p)
        if (i) ctx.lineTo(q.x, q.y)
        else ctx.moveTo(q.x, q.y)
      })
      for (let i = N; i >= 0; i--) {
        const q = project(backTop[N - i])
        ctx.lineTo(q.x, q.y)
      }
      ctx.closePath()
      ctx.fillStyle = P.fill
      ctx.fill()
      ctx.beginPath()
      arc(0, -front).forEach((p, i) => {
        const q = project(p)
        if (i) ctx.lineTo(q.x, q.y)
        else ctx.moveTo(q.x, q.y)
      })
      ctx.strokeStyle = P.faint
      ctx.lineWidth = 1
      ctx.stroke()
      const stroke1 = (pts: Vec3[], s: string, w1 = lw) => {
        ctx.beginPath()
        pts.forEach((p, i) => {
          const q = project(p)
          if (i) ctx.lineTo(q.x, q.y)
          else ctx.moveTo(q.x, q.y)
        })
        ctx.strokeStyle = s
        ctx.lineWidth = w1
        ctx.stroke()
      }
      stroke1(frontBottom, stroke)
      stroke1(arc(hh * 0.5, front), P.soft, 1)
      line(rim(0, thR), rim(hh, thR), stroke, lw)
      line(rim(0, thR + Math.PI), rim(hh, thR + Math.PI), stroke, lw)
      const top: Vec3[] = []
      for (let i = 0; i < N * 2; i++) top.push(rim(hh, (Math.PI * i) / N))
      poly(top, P.fill, stroke, lw)
    }

    const edgesOfBox = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, stroke: string, lw = 1) => {
      ctx.beginPath()
      const e: [Vec3, Vec3][] = [
        [[x0, y0, z0], [x1, y0, z0]],
        [[x0, y1, z0], [x1, y1, z0]],
        [[x0, y0, z1], [x1, y0, z1]],
        [[x0, y1, z1], [x1, y1, z1]],
        [[x0, y0, z0], [x0, y0, z1]],
        [[x1, y0, z0], [x1, y0, z1]],
        [[x0, y1, z0], [x0, y1, z1]],
        [[x1, y1, z0], [x1, y1, z1]],
        [[x0, y0, z0], [x0, y1, z0]],
        [[x1, y0, z0], [x1, y1, z0]],
        [[x0, y0, z1], [x0, y1, z1]],
        [[x1, y0, z1], [x1, y1, z1]],
      ]
      for (const [a, b] of e) {
        const p = project(a)
        const q = project(b)
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(q.x, q.y)
      }
      ctx.strokeStyle = stroke
      ctx.lineWidth = lw
      ctx.stroke()
    }

    /* --- telemetry sensor brick + broadcast signal arcs (safe for all roles to consume) --- */
    const drawTelemetryBrick = (center: Vec3, dirX: -1 | 1, t: number, boost: number, motion: boolean, P: Palette) => {
      const [cx, , cz] = center
      const x0 = cx - TEL_BRICK.w / 2
      const x1 = cx + TEL_BRICK.w / 2
      const y0 = 0
      const y1 = TEL_BRICK.h
      const z0 = cz - TEL_BRICK.z
      const z1 = cz + TEL_BRICK.z
      const c = P.flow.telemetry
      const alpha = vis.telemetry * (0.55 + 0.45 * Math.max(lit.telemetry, boost))

      // brick faces
      poly(rectY(y0, x0, x1, z0, z1), rgba(c, 0.08 * alpha), null)
      poly(rectZ(z1, x0, x1, y0, y1), rgba(c, 0.14 * alpha), null)
      const side = C[0] < x0 ? x0 : x1
      poly([[side, y0, z0], [side, y0, z1], [side, y1, z1], [side, y1, z0]], rgba(c, 0.18 * alpha), null)
      poly(rectY(y1, x0, x1, z0, z1), rgba(c, 0.16 * alpha), null)
      edgesOfBox(x0, x1, y0, y1, z0, z1, rgba(c, 0.85 * alpha), 1.1)

      // small beacon on top of brick
      const beacon: Vec3 = [cx, y1 + 0.06, cz]
      line([cx, y1, cz], beacon, rgba(c, 0.9 * alpha), 1.2)
      const bq = project(beacon)
      ctx.fillStyle = rgba(c, (0.2 + 0.2 * boost) * alpha)
      ctx.beginPath()
      ctx.arc(bq.x, bq.y, 5.5 + 2 * boost, 0, Math.PI * 2)
      ctx.fill()
      square(bq, 4.5, rgba(c, alpha), rgba(P.bg, 1), 0.9)

      // radiating broadcast signal arcs (upward + outward fan)
      const baseAngle = dirX < 0 ? -Math.PI * 0.68 : -Math.PI * 0.32
      const spread = 0.62
      for (let i = 0; i < 3; i++) {
        const phase = motion ? (t * 0.65 + i / 3) % 1 : 0.25 + i * 0.3
        const rad = 10 + phase * (24 + 8 * boost)
        const fadeWave = Math.sin(Math.PI * phase) * (0.45 + 0.55 * boost) * alpha
        if (fadeWave <= 0.02) continue
        ctx.beginPath()
        ctx.arc(bq.x, bq.y, rad, baseAngle - spread, baseAngle + spread)
        ctx.strokeStyle = rgba(c, fadeWave)
        ctx.lineWidth = 1.35
        ctx.stroke()
      }
    }

    /* --- bottom tier: Clones (2-node cluster) and Production (3-node HA cluster) --- */
    const drawClonesBack = (P: Palette) => {
      const { x0, x1, z } = CLONE_BOX
      poly(rectY(0, x0, x1, -z, z), P.fillBack, P.soft, 1)
      const [cn0, cn1] = CLONE_NODES
      line([cn0.x, CLONE_CYL.h * 0.5, cn0.z], [cn1.x, CLONE_CYL.h * 0.5, cn1.z], P.muted, 1, [2, 2])
      const ordered = [...CLONE_NODES].sort((a, b) => project([b.x, 0, b.z]).z - project([a.x, 0, a.z]).z)
      for (const nd of ordered) {
        cylinder(nd.x, nd.z, CLONE_CYL.r, CLONE_CYL.h, P, P.edge, nd.role === 'primary' ? 1.15 : 1)
      }
    }

    const drawClonesFront = (P: Palette, glow: number) => {
      const { x0, x1, z, h: ch } = CLONE_BOX
      edgesOfBox(x0, x1, 0, ch, -z, z, P.soft, 1)
      if (glow > 0.01) edgesOfBox(x0, x1, 0, ch, -z, z, rgba(P.flow.rehearse, glow), 1.4)
      if (!L.compact) {
        tinyText('primary · standby', [AN_X, -0.02, z + 0.22], P.muted, 'center')
      }
    }

    const drawProdBack = (P: Palette) => {
      const { x0, x1, z, h: ph, inset: i } = PROD
      poly(rectY(0, x0, x1, -z, z), P.fillBack, null)
      edgesOfBox(x0 + i, x1 - i, 0, ph - i, -z + i, z - i, P.soft)
      const [pNode, s1, s2] = PROD_NODES
      line([pNode.x, pNode.h * 0.45, pNode.z], [s1.x, s1.h * 0.45, s1.z], P.muted, 1, [2, 2])
      line([pNode.x, pNode.h * 0.45, pNode.z], [s2.x, s2.h * 0.45, s2.z], P.muted, 1, [2, 2])
      const ordered = [...PROD_NODES].sort((a, b) => project([b.x, 0, b.z]).z - project([a.x, 0, a.z]).z)
      for (const nd of ordered) {
        cylinder(nd.x, nd.z, PROD_CYL.r, nd.h, P, P.edge, nd.primary ? 1.2 : 1)
      }
    }

    const drawProdFront = (P: Palette, glow: number) => {
      const { x0, x1, z, h: ph } = PROD
      const side = C[0] < x0 ? x0 : x1
      poly([[side, 0, -z], [side, 0, z], [side, ph, z], [side, ph, -z]], P.glassSide, null)
      poly(rectZ(z, x0, x1, 0, ph), P.glass, null)
      poly(rectY(ph, x0, x1, -z, z), P.glass, null)
      edgesOfBox(x0, x1, 0, ph, -z, z, P.edge, 1.2)
      if (glow > 0.01) edgesOfBox(x0, x1, 0, ph, -z, z, rgba(P.flow.apply, glow), 1.6)
      if (!L.compact) {
        tinyText('1 primary · 2 standbys', [AU_X, -0.02, z + 0.22], P.muted, 'center')
      }
    }

    /* --- the middle tier: the Actor slab (write/execution ports ONLY) --- */
    const PORTS: { x: number; flow: FlowId }[] = [
      { x: X_REHEARSE, flow: 'rehearse' },
      { x: X_APPLY, flow: 'apply' },
    ]

    const drawSlab = (P: Palette, flashes: { x: number; flow: FlowId; k: number }[]) => {
      const { x0, x1, z0, z1, y0, y1 } = SLAB
      for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]] as const) line([x, y0, z], [x, 0, z], P.faint, 1, [2, 4])
      poly(rectY(y0, x0, x1, z0, z1), P.glass, P.faint)
      poly(rectZ(z1, x0, x1, y0, y1), P.glassSide, null)
      const side = C[0] < x0 ? x0 : x1
      poly([[side, y0, z0], [side, y0, z1], [side, y1, z1], [side, y1, z0]], P.glassSide, null)
      poly(rectY(y1, x0, x1, z0, z1), P.glass, null)
      edgesOfBox(x0, x1, y0, y1, z0, z1, P.edge, 1)
      poly(rectY(y1, x0 + 0.1, x1 - 0.1, z0 + 0.1, z1 - 0.1), null, P.faint)
      ctx.beginPath()
      for (let x = x0 + 0.5; x < x1 - 0.2; x += 0.5) {
        const a = project([x, y1, z0 + 0.1])
        const b = project([x, y1, z1 - 0.1])
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
      }
      ctx.strokeStyle = P.faint
      ctx.lineWidth = 0.75
      ctx.stroke()
      for (const p of PORTS) {
        const c = P.flow[p.flow]
        const a = vis[p.flow] * (0.45 + 0.55 * lit[p.flow])
        poly(rectY(y1, p.x - 0.09, p.x + 0.09, -0.09, 0.09), rgba(P.bg, 0.9), rgba(c, a), 1.2)
      }
      for (const fl of flashes) {
        const s = 0.1 + 0.32 * easeOut(fl.k)
        poly(rectY(y1, fl.x - s, fl.x + s, -s, s), null, rgba(P.flow[fl.flow], (1 - fl.k) * 0.9 * vis[fl.flow]), 1.2)
      }
    }

    /* --- the top tier: the AI roles, as frosted cards --- */
    const drawCard = (cx: number, P: Palette) => {
      const x0 = cx - CW / 2
      const x1 = cx + CW / 2
      poly(rectZ(-0.3, x0 + 0.1, x1 + 0.1, CY0 + 0.09, CY1 + 0.09), P.fillBack, P.faint)
      poly(rectZ(0, x0, x1, CY0, CY1), P.fill, P.edge)
      poly(rectZ(0, x0 + 0.05, x1 - 0.05, CY0 + 0.05, CY1 - 0.05), null, P.faint)
      if (!L.compact) tinyText('no write access', [x0 + 0.13, CY0 + 0.39, 0], P.muted)
      for (const [y, len] of [
        [CY0 + 0.25, 0.62],
        [CY0 + 0.15, 0.4],
      ] as const)
        line([x0 + 0.13, y, 0], [x0 + 0.13 + len, y, 0], P.soft)
    }

    /* --- the flows --- */
    const flowAlpha = (fl: FlowId) => vis[fl] * (0.38 + 0.62 * lit[fl])

    const vlane = (pts: [Vec3, Vec3], fl: FlowId, part: 'below' | 'above', P: Palette) => {
      const [a, b] = pts
      const c = rgba(P.flow[fl], flowAlpha(fl))
      const lo = a[1] < b[1] ? a : b
      const hi = a[1] < b[1] ? b : a
      if (part === 'below') {
        line(lo, [lo[0], SLAB.y0, lo[2]], c, 1.5)
        arrow([lo[0], lo[1] + 0.2, lo[2]], lo, c)
      } else {
        line([hi[0], SLAB.y1, hi[2]], hi, c, 1.5)
        square(project(hi), 5, rgba(P.bg, 1), c, 1.2)
      }
    }

    const drawFeedbackLoop = (P: Palette) => {
      const cf = rgba(P.flow.feedback, flowAlpha('feedback') * 0.78)
      polyline(P_FB_TO_AN, cf, 1.25, [4, 3])
      line([AU_X, Y_FB_TOP, 0], [AU_X, CY1, 0], cf, 1.25, [4, 3])
      square(project([AU_X, Y_FB_TOP, 0]), 4, cf, null)
      arrow([AU_X, CY1 + 0.22, 0], [AU_X, CY1, 0], cf, 4.5)
      arrow([AN_X, CY1 + 0.22, 0], [AN_X, CY1, 0], cf, 4.5)
    }

    const drawTopFlows = (P: Palette, halt: number) => {
      const cr = rgba(P.flow.review, flowAlpha('review'))
      const [ra, rb] = P_REVIEW
      line(ra, rb, cr, 1.5)
      square(project(ra), 5, rgba(P.bg, 1), cr, 1.2)
      arrow([rb[0] - 0.2, rb[1], 0], rb, cr)
      const [ba, bb] = P_BACK
      const cb = rgba(P.flow.review, flowAlpha('review') * 0.8)
      line(ba, [bb[0] + 0.08, bb[1], 0], cb, 1.2, [3, 3])
      arrow([bb[0] + 0.2, bb[1], 0], bb, cb, 4.5)
      const red = P.flow.reject
      const ar = vis.review * (0.55 + 0.45 * halt)
      const [ja, jb] = P_REJECT
      line(ja, jb, rgba(red, ar), 1.5)
      line([jb[0] - 0.11, jb[1], 0], [jb[0] + 0.11, jb[1], 0], rgba(red, ar), 2.5 + 1.5 * halt)
    }

    /* --- moving packets --- */
    type Packet = { trailPts: Vec3[]; head: Vec3; c: Rgb; a: number }
    const drawPacket = (pk: Packet, P: Palette) => {
      const q = project(pk.head)
      const tq = project(pk.trailPts[0])
      ctx.globalAlpha = pk.a
      const g = ctx.createLinearGradient(tq.x, tq.y, q.x, q.y)
      g.addColorStop(0, rgba(pk.c, 0))
      g.addColorStop(1, rgba(pk.c, 0.85))
      ctx.strokeStyle = g
      ctx.lineWidth = 3
      ctx.beginPath()
      pk.trailPts.forEach((pt, i) => {
        const qp = project(pt)
        if (i) ctx.lineTo(qp.x, qp.y)
        else ctx.moveTo(qp.x, qp.y)
      })
      ctx.stroke()
      ctx.fillStyle = rgba(pk.c, 0.18)
      ctx.beginPath()
      ctx.arc(q.x, q.y, 7, 0, Math.PI * 2)
      ctx.fill()
      square(q, 6, rgba(pk.c, 1), rgba(P.bg, 1), 1)
      ctx.globalAlpha = 1
    }

    const along = (pts: [Vec3, Vec3], k: number, trail: number): { trailPts: Vec3[]; head: Vec3 } => {
      const head = lerp3(pts[0], pts[1], k)
      return { trailPts: [lerp3(pts[0], pts[1], Math.max(0, k - trail)), head], head }
    }

    const alongPoly = (pts: Vec3[], k: number, trail: number): { trailPts: Vec3[]; head: Vec3 } => {
      const kk = Math.max(0, Math.min(1, k))
      return { trailPts: slicePolyline(pts, Math.max(0, kk - trail), kk), head: samplePolyline(pts, kk) }
    }

    /* --- labels: at their anchors, out of each other's way, inside the box --- */
    const PAD = 4
    const GAP = 5
    const placeLabels = () => {
      const boxes: { l: number; t: number; w: number; h: number }[] = []
      for (const id of LABEL_ORDER) {
        const el = labels.current[id]
        if (!el) continue
        const size = sizes.get(id) ?? { w: el.offsetWidth, h: el.offsetHeight }
        if (!sizes.has(id)) sizes.set(id, size)
        const pl = L.place[id]
        const a = project(pl.at)
        const l = Math.min(Math.max(a.x + pl.dx - pl.ax * size.w, PAD), w - PAD - size.w)
        const tt0 = a.y + pl.dy - pl.ay * size.h
        const free = (tt: number) =>
          boxes.every((b) => !(l < b.l + b.w + GAP && l + size.w + GAP > b.l && tt < b.t + b.h + GAP && tt + size.h + GAP > b.t))
        let t = Math.min(Math.max(tt0, PAD), h - PAD - size.h)
        for (let k = 0; k <= 30; k++) {
          const down = Math.min(Math.max(tt0 + k * 3, PAD), h - PAD - size.h)
          const up = Math.min(Math.max(tt0 - k * 3, PAD), h - PAD - size.h)
          if (free(down)) {
            t = down
            break
          }
          if (free(up)) {
            t = up
            break
          }
        }
        boxes.push({ l, t, w: size.w, h: size.h })
        el.style.transform = `translate3d(${Math.round(l)}px, ${Math.round(t)}px, 0)`
        el.style.visibility = 'visible'
      }
    }

    /* --- one frame --- */
    const frame = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now
      const isPaused = pausedRef.current
      const running = !reduce.matches && !isPaused
      if (running) simTime += dt
      const t = simTime
      const motion = !reduce.matches
      const P = darkRef.current ? DARK : LIGHT
      const fc = focusRef.current

      const ease = 1 - Math.exp(-dt * 5)
      cam.px += (cam.tpx - cam.px) * ease
      cam.py += (cam.tpy - cam.py) * ease
      if (!drag.on) {
        const K = 38
        const D = 2 * Math.sqrt(K)
        cam.vyaw += (-K * cam.dyaw - D * cam.vyaw) * dt
        cam.vpitch += (-K * cam.dpitch - D * cam.vpitch) * dt
        cam.dyaw += cam.vyaw * dt
        cam.dpitch += cam.vpitch * dt
        if (!motion) {
          cam.dyaw = 0
          cam.dpitch = 0
          cam.vyaw = 0
          cam.vpitch = 0
        }
      }
      let settling = drag.on || Math.abs(cam.dyaw) + Math.abs(cam.dpitch) + Math.abs(cam.vyaw) + Math.abs(cam.vpitch) > 1e-3
      settling = settling || Math.abs(cam.tpx - cam.px) + Math.abs(cam.tpy - cam.py) > 1e-3

      const k = Math.floor(t / T)
      const u = t - k * T
      const outcome = OUTCOMES[((k % OUTCOMES.length) + OUTCOMES.length) % OUTCOMES.length]
      const active: Record<FlowId, boolean> = motion
        ? {
            rehearse: u < 2.5,
            telemetry: (u >= 1.6 && u < 3.9) || (outcome === 'apply' && u >= 6.8),
            feedback: outcome === 'apply' && u >= 6.9,
            review: (u >= 3.3 && u < 5.5) || (outcome !== 'apply' && u >= 3.3 && u < 7.5),
            apply: outcome === 'apply' && u >= 5.1 && u < 8.4,
          }
        : { rehearse: true, telemetry: true, feedback: true, review: true, apply: true }
      const fa = 1 - Math.exp(-dt * 6)
      for (const fl of ['rehearse', 'telemetry', 'feedback', 'review', 'apply'] as const) {
        const tl = active[fl] ? 1 : 0
        const tv = fc && fc !== fl ? 0.16 : 1
        const lt = fc === fl ? 1 : tl
        lit[fl] = motion ? lit[fl] + (lt - lit[fl]) * fa : lt
        vis[fl] = motion ? vis[fl] + (tv - vis[fl]) * fa : tv
        if (Math.abs(lit[fl] - lt) + Math.abs(vis[fl] - tv) > 0.003) settling = true
      }

      const breathe = motion ? 1 : 0
      const yaw = L.yaw + cam.dyaw + cam.px * 4 + breathe * (Math.sin(t * 0.29) * 2.0 + Math.sin(t * 0.13) * 0.9)
      const pitch = L.pitch + cam.dpitch + cam.py * 2.2 + breathe * Math.sin(t * 0.21 + 1) * 0.9
      setCamera(yaw * DEG, Math.min(60, Math.max(2, pitch)) * DEG)

      const below: Packet[] = []
      const above: Packet[] = []
      const flashes: { x: number; flow: FlowId; k: number }[] = []
      const push = (pk: Packet) => (pk.head[1] < SLAB_Y ? below : above).push(pk)
      const passFlash = (x: number, y: number, fl: FlowId) => {
        const d = Math.abs(y - SLAB_Y)
        if (d < 0.48) flashes.push({ x, flow: fl, k: d / 0.48 })
      }
      let ripple = -1
      let cloneTelBoost = 0
      let prodTelBoost = 0
      let review = -1
      let arrive = -1
      let backAt = -1
      let halt = 0
      if (motion) {
        const cB = P.flow.rehearse
        let s = span(u, 0, 1.55)
        if (s >= 0) {
          const pk = along(P_REHEARSE, easeIO(s), 0.12)
          push({ ...pk, c: cB, a: vis.rehearse })
          passFlash(X_REHEARSE, pk.head[1], 'rehearse')
        }
        s = span(u, 1.5, 2.45)
        if (s >= 0) ripple = s
        s = span(u, 1.55, 2.15)
        if (s >= 0) {
          const [cn0, cn1] = CLONE_NODES
          const a: Vec3 = [cn0.x, CLONE_CYL.h * 0.5, cn0.z]
          const b: Vec3 = [cn1.x, CLONE_CYL.h * 0.5, cn1.z]
          below.push({ ...along([a, b], easeIO(s), 0.45), c: cB, a: vis.rehearse * 0.85 })
        }
        s = span(u, 1.65, 3.85)
        if (s >= 0) cloneTelBoost = Math.sin(Math.PI * s)

        const cV = P.flow.review
        s = span(u, 3.3, 4.7)
        if (s >= 0) above.push({ ...along(P_REVIEW, easeIO(s), 0.14), c: cV, a: vis.review })
        s = span(u, 4.65, 5.4)
        if (s >= 0) review = s

        if (outcome === 'apply') {
          s = span(u, 5.15, 6.75)
          if (s >= 0) {
            const pk = along(P_APPLY, easeIO(s), 0.11)
            push({ ...pk, c: P.flow.apply, a: vis.apply })
            passFlash(X_APPLY, pk.head[1], 'apply')
          }
          s = span(u, 6.7, 8.2)
          if (s >= 0) arrive = s
          s = span(u, 6.85, 7.6)
          if (s >= 0) {
            const [pNode, s1, s2] = PROD_NODES
            const p0: Vec3 = [pNode.x, pNode.h * 0.45, pNode.z]
            below.push({ ...along([p0, [s1.x, s1.h * 0.45, s1.z]], easeIO(s), 0.45), c: P.flow.apply, a: vis.apply * 0.85 })
            below.push({ ...along([p0, [s2.x, s2.h * 0.45, s2.z]], easeIO(s), 0.45), c: P.flow.apply, a: vis.apply * 0.85 })
          }
          s = span(u, 6.9, 8.9)
          if (s >= 0) prodTelBoost = Math.sin(Math.PI * s)
          // post-change feedback loop: Production -> Auditor & Analyst
          s = span(u, 7.0, 8.35)
          if (s >= 0) above.push({ ...alongPoly(P_FB_TO_AU, easeIO(s), 0.14), c: P.flow.feedback, a: vis.feedback * 0.9 })
          s = span(u, 7.15, 8.95)
          if (s >= 0) above.push({ ...alongPoly(P_FB_TO_AN, easeIO(s), 0.1), c: P.flow.feedback, a: vis.feedback * 0.95 })
        } else if (outcome === 'back') {
          s = span(u, 5.15, 6.65)
          if (s >= 0) above.push({ ...along(P_BACK, easeIO(s), 0.14), c: cV, a: vis.review })
          s = span(u, 6.6, 7.35)
          if (s >= 0) backAt = s
        } else {
          s = span(u, 5.15, 5.7)
          if (s >= 0) above.push({ ...along(P_REJECT, easeIO(s), 0.3), c: P.flow.reject, a: vis.review })
          s = span(u, 5.65, 7.25)
          if (s >= 0) halt = 1 - s
        }
      }

      const dpr = canvas.width / Math.max(1, w)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineJoin = 'round'
      ctx.lineCap = 'butt'

      drawGrid(P)

      // bottom tier: Clones cluster + 3-node Production cluster + always-on telemetry bricks
      drawClonesBack(P)
      drawProdBack(P)
      vlane(P_REHEARSE, 'rehearse', 'below', P)
      vlane(P_APPLY, 'apply', 'below', P)
      for (const pk of below) drawPacket(pk, P)
      if (ripple >= 0) {
        const r = 0.22 + 0.42 * easeOut(ripple)
        const pts: Vec3[] = []
        for (let i = 0; i < 40; i++) pts.push([AN_X + r * Math.cos((i / 40) * Math.PI * 2), CLONE_BOX.h, r * Math.sin((i / 40) * Math.PI * 2) * 0.65])
        poly(pts, null, rgba(P.flow.rehearse, (1 - ripple) * vis.rehearse), 1.2)
      }
      drawClonesFront(P, ripple >= 0 ? Math.sin(Math.PI * Math.min(1, ripple * 1.3)) * 0.75 * vis.rehearse : 0)
      if (arrive >= 0) {
        for (const d of [0, 0.25]) {
          const kk = arrive - d
          if (kk < 0 || kk > 0.75) continue
          const e = kk / 0.75
          const r = 0.24 + 0.52 * easeOut(e)
          const pts: Vec3[] = []
          for (let i = 0; i < 40; i++) pts.push([AU_X + r * Math.cos((i / 40) * Math.PI * 2), PROD.h, r * Math.sin((i / 40) * Math.PI * 2) * 0.68])
          poly(pts, null, rgba(P.flow.apply, (1 - e) * vis.apply), 1.3)
        }
      }
      drawProdFront(P, arrive >= 0 ? Math.sin(Math.PI * Math.min(1, arrive * 1.4)) * 0.85 * vis.apply : 0)
      drawTelemetryBrick(TEL_CLONE, -1, t, fc === 'telemetry' ? 1 : cloneTelBoost, motion, P)
      drawTelemetryBrick(TEL_PROD, 1, t + 0.5, fc === 'telemetry' ? 1 : prodTelBoost, motion, P)

      // middle tier: Actor slab (sole write path)
      drawSlab(P, flashes)

      // post-change feedback loop (Production -> Auditor & Analyst)
      drawFeedbackLoop(P)

      // top tier: Analyst & Auditor cards + flows
      drawCard(AN_X, P)
      drawCard(AU_X, P)
      vlane(P_REHEARSE, 'rehearse', 'above', P)
      vlane(P_APPLY, 'apply', 'above', P)
      drawTopFlows(P, halt)
      if (review >= 0) {
        const s = 0.06 + 0.14 * easeOut(review)
        const [, rb] = P_REVIEW
        poly(rectZ(0, rb[0] - s, rb[0] + s, rb[1] - s, rb[1] + s), null, rgba(P.flow.review, (1 - review) * vis.review), 1.2)
      }
      if (backAt >= 0) {
        const s = 0.06 + 0.14 * easeOut(backAt)
        const [, bb] = P_BACK
        poly(rectZ(0, bb[0] - s, bb[0] + s, bb[1] - s, bb[1] + s), null, rgba(P.flow.review, (1 - backAt) * vis.review), 1.2)
      }
      if (halt > 0) {
        const q = project(P_REJECT[1])
        const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 16)
        g.addColorStop(0, rgba(P.flow.reject, 0.32 * halt * vis.review))
        g.addColorStop(1, rgba(P.flow.reject, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(q.x, q.y, 16, 0, Math.PI * 2)
        ctx.fill()
      }
      for (const pk of above) drawPacket(pk, P)

      placeLabels()

      if (visible && !document.hidden && (running || settling)) raf = requestAnimationFrame(frame)
    }

    const kick = () => {
      if (raf || !w) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    kickRef.current = kick

    /* --- size --- */
    const resize = () => {
      const nw = stage.clientWidth
      if (!nw) return
      w = nw
      L = layoutFor(w)
      h = heightFor(w)
      stage.style.height = `${h}px`
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      setCompact(L.compact)
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      kick()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(stage)
    const lro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLDivElement
        const id = el.dataset.label as LabelId | undefined
        if (id) sizes.set(id, { w: el.offsetWidth, h: el.offsetHeight })
      }
      kick()
    })
    for (const el of Object.values(labels.current)) if (el) lro.observe(el)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(stage)
    const onVisibility = () => {
      if (!document.hidden) kick()
    }
    document.addEventListener('visibilitychange', onVisibility)

    /* --- pointer: tilt on hover, drag to orbit --- */
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      if (drag.on && e.pointerId === drag.id) {
        cam.dyaw = Math.max(-28, Math.min(28, drag.yaw - (e.clientX - drag.x) * 0.3))
        cam.dpitch = Math.max(-8, Math.min(18, drag.pitch + (e.clientY - drag.y) * 0.16))
      } else if (e.pointerType === 'mouse' && !reduce.matches) {
        cam.tpx = ((e.clientX - r.left) / r.width - 0.5) * 2
        cam.tpy = ((e.clientY - r.top) / r.height - 0.5) * 2
      }
      kick()
    }
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      if ((e.target as HTMLElement | null)?.closest('button')) return
      drag.on = true
      drag.id = e.pointerId
      drag.x = e.clientX
      drag.y = e.clientY
      drag.yaw = cam.dyaw
      drag.pitch = cam.dpitch
      cam.vyaw = 0
      cam.vpitch = 0
      stage.setPointerCapture(e.pointerId)
      stage.dataset.dragging = ''
      kick()
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return
      drag.on = false
      drag.id = -1
      delete stage.dataset.dragging
      kick()
    }
    const onLeave = () => {
      cam.tpx = 0
      cam.tpy = 0
      kick()
    }
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onUp)
    stage.addEventListener('pointerleave', onLeave)
    const onReduce = () => kick()
    reduce.addEventListener?.('change', onReduce)

    resize()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      kickRef.current = () => {}
      ro.disconnect()
      lro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
      stage.removeEventListener('pointerleave', onLeave)
      reduce.removeEventListener?.('change', onReduce)
    }
  }, [])

  const setLabel = (id: LabelId) => (el: HTMLDivElement | null) => {
    labels.current[id] = el
  }
  const flowOf = (id: LabelId): FlowId | null =>
    id === 'rehearse' || id === 'clones'
      ? 'rehearse'
      : id === 'telemetry'
        ? 'telemetry'
        : id === 'feedback'
          ? 'feedback'
          : id === 'review' || id === 'sendback' || id === 'reject'
            ? 'review'
            : id === 'apply' || id === 'prod'
              ? 'apply'
              : null
  const isDim = (id: LabelId) => {
    const fl = flowOf(id)
    return focus !== null && fl !== null && fl !== focus
  }

  const scene = (
    <div className={styles.root} data-a3-root>
      <div className={styles.stage} ref={stageRef} data-a3-stage>
        <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
        <div className={styles.labels} aria-hidden="true">
          {NODES.map((nd) => (
            <div
              key={nd.id}
              ref={setLabel(nd.id)}
              data-label={nd.id}
              data-a3-label
              className={clsx(styles.label, styles.node, isDim(nd.id) && styles.dim)}
            >
              <span className={styles.nodeName}>{nd.text}</span>
              {nd.hint && !compact && (
                <span className={styles.nodeHint}>
                  <span className={styles.hintLong}>{nd.hint[0]}</span>
                  {nd.hint[1]}
                </span>
              )}
            </div>
          ))}
          {PILLS.map((p) => (
            <div
              key={p.id}
              ref={setLabel(p.id)}
              data-label={p.id}
              data-a3-label
              onMouseEnter={() => setFocus(p.flow)}
              onMouseLeave={() => setFocus(null)}
              className={clsx(styles.label, styles.pill, styles[p.flow], p.dashed && styles.dashed, isDim(p.id) && styles.dim)}
            >
              <span className={styles.dot} />
              {p.sub && !compact ? (
                <span className={styles.pillBody}>
                  <span className={styles.pillText}>{p.text}</span>
                  <span className={styles.pillSub}>{p.sub}</span>
                </span>
              ) : (
                <span className={styles.pillText}>{compact && p.shortText ? p.shortText : p.text}</span>
              )}
            </div>
          ))}
          <div
            ref={setLabel('reject')}
            data-label="reject"
            data-a3-label
            className={clsx(styles.label, styles.reject, isDim('reject') && styles.dim)}
          >
            reject
          </div>
        </div>
        <button
          type="button"
          className={styles.pauseBtn}
          data-paused={paused ? 'true' : 'false'}
          data-a3-pause
          aria-label={paused ? 'Resume 3D architecture animation' : 'Pause 3D architecture animation'}
          onClick={() => setPaused((v) => !v)}
        >
          <span className={styles.pauseIcon} aria-hidden="true">
            {paused ? (
              <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor">
                <path d="M1.5 1.2L8 5 1.5 8.8V1.2z" />
              </svg>
            ) : (
              <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor">
                <rect x="1.2" y="1.2" width="2.4" height="7.6" rx="0.5" />
                <rect x="5.4" y="1.2" width="2.4" height="7.6" rx="0.5" />
              </svg>
            )}
          </span>
          <span>{paused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>

      <div className={styles.srOnly}>
        The AAA architecture for production Postgres, in three tiers. Top: two AI roles with no direct write access to
        databases. The Analyst investigates, drafts a change request, and rehearses it; the Auditor reviews the change
        request together with clone telemetry and can send it back, reject it, or approve it. Middle: the Actor, a
        deterministic runner and the sole write path to databases. Bottom: a two-node Clones cluster (primary and
        standby) and an illustrative fortified three-node Production Postgres HA cluster (one primary and two standbys),
        each fitted with a read-only telemetry emitter that safely broadcasts signals for Analyst, Auditor, and Actor to
        consume. After a change lands in production, a feedback loop returns production outcomes to both Auditor and
        Analyst so the system improves over time.
      </div>
    </div>
  )

  if (n === undefined) return scene

  return (
    <figure className={figure.figure} id={`fig-${n}`}>
      <div className={figure.media}>{scene}</div>
      {children && (
        <figcaption className={figure.caption}>
          <span className={figure.label}>Fig. {n}</span>
          <div className={figure.captionText}>{children}</div>
        </figcaption>
      )}
    </figure>
  )
}

export default AaaPipeline3D
