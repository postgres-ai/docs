/*
 * Canvas drawing for the hero of "The hidden costs of CREATE TEMP TABLE".
 *
 * Each line is a session. A message (orange) reaches every session. The few
 * active sessions (dark lines) read it at once, the many idle ones (grey
 * lines) read it late, so the front of each message becomes ragged. An idle
 * session that sleeps too long loses its backlog and starts again: the whole
 * line flashes.
 *
 * Canvas 2D, no dependency. The random numbers are seeded, so the first frame
 * (the "rest" frame) is always the same picture. The still images of the hero
 * are screenshots of that frame. With reduced motion the hero starts paused on
 * it. The loop stops when the canvas is off screen, the tab is hidden, or the
 * reader pauses it.
 */

const TAU = Math.PI * 2
const SEED = 11
const LINES = 38
const LINES_NARROW = 22
const POINTS = 84 // segments per line
const POINTS_NARROW = 56
const REST = 4.02 // model seconds before the first frame: a clear message front
const REST_NARROW = 10.62
// width / height below which the phone drawing is used: the phone still frame
// is 9:5, the wide one is 18:7
const NARROW_BELOW = 2.2

type Palette = { panel: string; idle: string; active: string; accent: string }

const PALETTES: Record<'light' | 'dark', Palette> = {
  light: {
    panel: '#f1f0ec',
    idle: '#b3b2ab',
    active: '#141414',
    accent: '#ff6111',
  },
  dark: {
    panel: '#2b2d31',
    idle: '#6a6964',
    active: '#e6e6e1',
    accent: '#ff7a3d',
  },
}

export type HeroOptions = {
  /** 'auto' (default) follows <html data-theme>, which Docusaurus sets */
  theme?: 'auto' | 'light' | 'dark'
  seed?: number
  /** model seconds before the first frame */
  rest?: number
  /** draw the first frame and never animate: for screenshots */
  freeze?: boolean
  /** start paused (the reader's Pause button, or reduced motion) */
  paused?: boolean
}

export type Hero = {
  /** stop the loop for good and remove the listeners */
  stop: () => void
  /** Pause stops the animation loop; Play starts it again */
  setPaused: (paused: boolean) => void
}

type Line = {
  u: number // place across the current, 0..1
  active: boolean
  deep: boolean // an idle session that sleeps for long
  lag: number // seconds between a message and the moment this session reads it
  v: number // speed of a mark, in line lengths per second
  gap: number // shortest time between two marks on this line
  side: 1 | -1 // which way the line bends when a mark passes
  flash: number // 1 right after the backlog is dropped, then decays to 0
  pulses: number[] // start times of the marks on this line
  x: Float32Array
  y: Float32Array
}

/* mulberry32: a small seeded generator, so every reader gets the same first frame */
function rng(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${alpha})`
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

/*
 * The current: height of line `u` at `x` (both 0..1) and time `t`, as a share
 * of the panel height. Two slow waves move the lines closer and apart, so they
 * gather into bundles and spread again and are never parallel.
 */
function lineY(u: number, x: number, t: number): number {
  const th1 = TAU * (x / 0.95) + 0.13 * t + 0.7
  const th2 = -TAU * (x / 0.5) + 0.085 * t + 2.1
  const w =
    u +
    (0.62 / TAU) * Math.sin(TAU * u + th1) +
    (0.3 / (TAU * 2.3)) * Math.sin(TAU * 2.3 * u + th2)
  const g = 0.055 * Math.sin((TAU * x) / 1.45 - 0.1 * t + 1.0)
  return 0.07 + 0.86 * w + g
}

/* ---------- the model: messages, readers, backlog ---------- */

class Model {
  t = 0
  readonly lines: Line[] = []
  readonly points: number
  private readonly random: () => number
  private next = 0.3 // time of the next message
  private burst = 0 // messages still to come right behind the last one

  constructor(seed: number, narrow: boolean) {
    const r = rng(seed)
    const n = narrow ? LINES_NARROW : LINES
    this.random = r
    this.points = narrow ? POINTS_NARROW : POINTS
    const phase = r() * TAU
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5 + (r() - 0.5) * 0.6) / n
      // smooth across the lines, so the front of a message is a curve
      const slow = 0.5 + 0.5 * Math.sin(TAU * 1.35 * u + phase)
      this.lines.push({
        u,
        active: false,
        deep: false,
        pulses: [],
        flash: 0,
        lag: 0.15 + 0.95 * Math.pow(slow, 1.3) + 0.2 * r(),
        v: 0.46 - 0.1 * slow + 0.04 * r(),
        gap: 0.19,
        side: r() < 0.5 ? -1 : 1,
        x: new Float32Array(this.points + 1),
        y: new Float32Array(this.points + 1),
      })
    }
    // about one session in six is active
    let k = Math.max(3, Math.round(n / 6))
    let step = n / k
    for (let i = 0; i < k; i++) {
      const j = Math.min(n - 1, Math.floor((i + 0.2 + 0.6 * r()) * step))
      const line = this.lines[j]
      line.active = true
      line.lag = 0
      line.v = 0.62 + 0.08 * r()
      line.gap = 0.09
    }
    // a few idle sessions sleep for long: their backlog grows until it is dropped
    k = Math.max(1, Math.round(n / 13))
    step = n / k
    for (let i = 0; i < k; i++) {
      let j = Math.min(n - 1, Math.floor((i + 0.15 + 0.7 * r()) * step))
      if (this.lines[j].active) j = (j + 1) % n
      const line = this.lines[j]
      if (line.active) continue
      line.deep = true
      line.lag = 1.5 + 0.6 * r()
      line.v = 0.27 + 0.03 * r()
    }
  }

  /* one message: every session gets a mark, each after its own lag */
  private emit(t0: number): void {
    for (const line of this.lines) {
      let ts = t0 + line.lag * (0.88 + 0.24 * this.random())
      const last = line.pulses[line.pulses.length - 1]
      if (last !== undefined && ts < last + line.gap) ts = last + line.gap
      line.pulses.push(ts)
      if (line.deep && line.pulses.length > 3) {
        // too far behind: the backlog is dropped and the session starts again
        line.pulses.length = 0
        line.flash = 1
      }
    }
  }

  step(dt: number): void {
    const r = this.random
    this.t += dt
    while (this.t >= this.next) {
      this.emit(this.next)
      if (this.burst > 0) {
        this.burst--
        this.next += 0.16 + 0.14 * r()
      } else {
        this.next += Math.min(8, 2.6 - 2.2 * Math.log(1 - r()))
        // one message in five brings 1 to 3 more right behind it
        if (r() < 0.22) this.burst = 1 + Math.floor(r() * 2.5)
      }
    }
    for (const line of this.lines) {
      while (line.pulses.length && (this.t - line.pulses[0]) * line.v > 1.2) {
        line.pulses.shift()
      }
      if (line.flash > 0) line.flash = Math.max(0, line.flash - dt / 1.1)
    }
  }
}

/* ---------- drawing ---------- */

/* value of a sampled line at a fractional index */
function sample(a: Float32Array, f: number): number {
  const j = Math.floor(f)
  if (j >= a.length - 1) return a[a.length - 1]
  return a[j] + (a[j + 1] - a[j]) * (f - j)
}

/* the small bend that travels along a line with a mark */
function bend(line: Line, p: number, points: number, amp: number): void {
  const { x, y } = line
  const c = p * points
  const from = Math.max(1, Math.floor(c - 7))
  const to = Math.min(points - 1, Math.ceil(c + 7))
  for (let j = from; j <= to; j++) {
    const dx = x[j + 1] - x[j - 1]
    const dy = y[j + 1] - y[j - 1]
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const g = amp * Math.exp(-((j - c) * (j - c)) / 6.8)
    x[j] += (-dy / len) * g
    y[j] += (dx / len) * g
  }
}

/* a mark: a stroke along the line that fades towards its tail */
function comet(
  ctx: CanvasRenderingContext2D,
  line: Line,
  points: number,
  p: number,
  tail: number,
  accent: string,
  width: number,
  alpha: number,
): void {
  const { x, y } = line
  const head = clamp01(p) * points
  const end = clamp01(p - tail) * points
  if (head - end < 0.05 || alpha <= 0.01) return
  const ax = sample(x, end)
  const ay = sample(y, end)
  const hx = sample(x, head)
  const hy = sample(y, head)
  if (Math.abs(ax - hx) + Math.abs(ay - hy) < 0.5) return
  const gradient = ctx.createLinearGradient(ax, ay, hx, hy)
  gradient.addColorStop(0, rgba(accent, 0))
  gradient.addColorStop(1, accent)
  ctx.beginPath()
  ctx.moveTo(ax, ay)
  for (let j = Math.floor(end) + 1; j < head; j++) ctx.lineTo(x[j], y[j])
  ctx.lineTo(hx, hy)
  ctx.strokeStyle = gradient
  ctx.lineWidth = width
  ctx.globalAlpha = alpha
  ctx.stroke()
}

/* the lines fade into the panel at the left and right edges */
function fadeSides(
  ctx: CanvasRenderingContext2D,
  panel: string,
  W: number,
  H: number,
): void {
  const f = 0.07 * W
  const clear = rgba(panel, 0)
  ctx.globalAlpha = 1
  let gradient = ctx.createLinearGradient(0, 0, f, 0)
  gradient.addColorStop(0, panel)
  gradient.addColorStop(1, clear)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, f, H)
  gradient = ctx.createLinearGradient(W, 0, W - f, 0)
  gradient.addColorStop(0, panel)
  gradient.addColorStop(1, clear)
  ctx.fillStyle = gradient
  ctx.fillRect(W - f, 0, f, H)
}

function draw(
  ctx: CanvasRenderingContext2D,
  model: Model,
  W: number,
  H: number,
  palette: Palette,
): void {
  const { lines, points, t } = model
  const k = W < 480 ? 0.85 : 1 // strokes a little lighter on a phone

  ctx.globalAlpha = 1
  ctx.fillStyle = palette.panel
  ctx.fillRect(0, 0, W, H)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // geometry: the current, then the bend under each mark
  for (const line of lines) {
    for (let j = 0; j <= points; j++) {
      const x = -0.03 + 1.06 * (j / points)
      line.x[j] = x * W
      line.y[j] = lineY(line.u, x, t) * H
    }
    for (const start of line.pulses) {
      const p = (t - start) * line.v
      if (p <= 0 || p >= 1.05) continue
      const ease = clamp01(p / 0.12) * clamp01((1.05 - p) / 0.2)
      bend(line, p, points, (line.active ? 5 : 3) * k * line.side * ease)
    }
  }

  // the lines: idle first, active on top
  for (const active of [false, true]) {
    for (const line of lines) {
      if (line.active !== active) continue
      ctx.beginPath()
      ctx.moveTo(line.x[0], line.y[0])
      for (let j = 1; j <= points; j++) ctx.lineTo(line.x[j], line.y[j])
      ctx.strokeStyle = active ? palette.active : palette.idle
      ctx.globalAlpha = active ? 0.6 : 1
      ctx.lineWidth = (active ? 1.2 : 1) * k
      ctx.stroke()
      if (line.flash > 0) {
        ctx.strokeStyle = palette.accent
        ctx.globalAlpha = line.flash * line.flash * 0.9
        ctx.lineWidth = 1.3 * k
        ctx.stroke()
      }
    }
  }

  // the marks
  for (const active of [false, true]) {
    for (const line of lines) {
      if (line.active !== active) continue
      const tail = active ? 0.1 : 0.065
      for (const start of line.pulses) {
        const p = (t - start) * line.v
        if (p <= 0 || p >= 1 + tail) continue
        const ease = clamp01(p / 0.05) * clamp01((1 + tail - p) / 0.12)
        const width = (active ? 2 : 1.35) * k
        const alpha = (active ? 1 : 0.85) * ease
        comet(ctx, line, points, p, tail, palette.accent, width, alpha)
      }
    }
  }

  fadeSides(ctx, palette.panel, W, H)
  ctx.globalAlpha = 1
}

/* ---------- mounting ---------- */

/** Draws on the canvas and animates it. */
export function mount(
  canvas: HTMLCanvasElement,
  options: HeroOptions = {},
): Hero {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { stop: () => {}, setPaused: () => {} }
  const seed = options.seed ?? SEED
  let paused = options.paused ?? false
  let W = 0
  let H = 0
  let model: Model | null = null
  let narrow: boolean | null = null
  let raf = 0
  let last = 0
  let visible = true
  let dead = false

  const palette = (): Palette => {
    const theme = options.theme ?? 'auto'
    if (theme !== 'auto') return PALETTES[theme]
    const dark = document.documentElement.dataset.theme === 'dark'
    return PALETTES[dark ? 'dark' : 'light']
  }

  const build = (isNarrow: boolean) => {
    const rest = options.rest ?? (isNarrow ? REST_NARROW : REST)
    narrow = isNarrow
    model = new Model(seed, isNarrow)
    for (let i = Math.round(rest * 60); i > 0; i--) model.step(1 / 60)
  }

  const fit = () => {
    const box = canvas.getBoundingClientRect()
    if (!box.width || !box.height) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = box.width
    H = box.height
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const isNarrow = W / H < NARROW_BELOW
    if (isNarrow !== narrow) build(isNarrow)
  }

  const paint = () => {
    if (model && W) draw(ctx, model, W, H, palette())
  }

  const moving = () =>
    !options.freeze && !paused && visible && !document.hidden && !dead

  const frame = (now: number) => {
    raf = 0
    if (!model || !moving()) return
    // about 60 pictures per second at most, also on a 120 Hz screen
    if (now - last < 12) {
      raf = requestAnimationFrame(frame)
      return
    }
    model.step(Math.min(0.05, Math.max(0, (now - last) / 1000)))
    last = now
    paint()
    raf = requestAnimationFrame(frame)
  }

  const play = () => {
    if (raf || !model || !moving()) return
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  const refresh = () => {
    fit()
    paint()
    play()
  }

  const resizes = new ResizeObserver(refresh)
  resizes.observe(canvas)
  const views = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting
    play()
  })
  views.observe(canvas)
  const themes = new MutationObserver(paint)
  themes.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  document.addEventListener('visibilitychange', play)
  refresh()

  return {
    stop: () => {
      dead = true
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      resizes.disconnect()
      views.disconnect()
      themes.disconnect()
      document.removeEventListener('visibilitychange', play)
    },
    setPaused: (p: boolean) => {
      paused = p
      if (paused) {
        // stop the loop itself, not only the drawing
        if (raf) cancelAnimationFrame(raf)
        raf = 0
      } else {
        play()
      }
    },
  }
}
