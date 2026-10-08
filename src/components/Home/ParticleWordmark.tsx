import React, { useEffect, useRef } from 'react'

import styles from './styles.module.css'

/*
 * The page's closing moment: a full-width "Postgres.AI" drawn in thousands of dots.
 *   1. When it scrolls into view, particles fly in and assemble "Postgres" and "AI", leaving the
 *      dot slot empty.
 *   2. The reel's orange ball drops in from above and bounces three times into the slot (the
 *      reel's end-card bounce: heights and timing, squash and stretch, an impact ring). Every
 *      contact sends a shockwave through the nearby letters, which ripple and spring back.
 *   3. On the final landing the ball bursts into the orange particle cluster that is the dot.
 *   4. Hovering (or tapping) the dot re-forms the ball: a small hop, a ripple, and it bursts again.
 * The pointer scatters letter particles, which spring home; a tap elsewhere sends a ripple.
 * Canvas 2D over typed arrays; paused offscreen. Reduced motion: a static dotted wordmark with a
 * solid orange dot. The canvas is decorative (aria-hidden); a visually hidden heading names it.
 */

const WORD_A = 'Postgres'
const WORD_DOT = '.'
const WORD_B = 'AI'
const ORANGE = 'rgb(255,98,18)'
const REPEL_R = 120 // CSS px
const FIELD_FRACTION = 0.14 // extra drifting "dust" particles, share of the total

// the reel's end-card bounce (s9), in units of the ball radius and seconds
const FALL = 0.62
const BOUNCES: [number, number][] = [
  [5.2, 0.34],
  [1.6, 0.2],
  [0.43, 0.11],
]
const SQUASH = [0.38, 0.2, 0.08, 0.03]
const SHOCK = [1, 0.55, 0.26, 0.1]
const SETTLE = 1.75 // seconds after the wordmark is first seen before the ball drops

type DotState = 'empty' | 'ball' | 'particles' | 'hop'

function themeInk(): [number, number, number] {
  const dark = document.documentElement.dataset.theme === 'dark'
  return dark ? [238, 234, 226] : [13, 13, 16]
}

export default function ParticleWordmark() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const narrow = window.matchMedia('(max-width: 767px)').matches
    const target = narrow ? 2600 : 8200

    let W = 0
    let H = 0
    let dpr = 1
    let n = 0
    let x = new Float32Array(0)
    let y = new Float32Array(0)
    let hx = new Float32Array(0)
    let hy = new Float32Array(0)
    let vx = new Float32Array(0)
    let vy = new Float32Array(0)
    let size = new Float32Array(0)
    let phase = new Float32Array(0)
    let delay = new Float32Array(0)
    let kind = new Uint8Array(0) // 0 letter, 1 orange dot, 2 dust
    let alphaBin = new Uint8Array(0)
    let ink = themeInk()
    let pointer = { x: -1e4, y: -1e4, active: false }
    // the dot: its slot (centre and radius), and what currently fills it
    const dot = { cx: 0, cy: 0, r: 10 }
    let dotState: DotState = reduce ? 'ball' : 'empty'
    let ballAt = 0 // time the current ball move started (drop or hop), seconds on the page clock
    let shocks = 0 // contacts already applied for the current ball move
    let hovering = false
    let assembled = reduce
    let assembleAt = 0
    let visible = false
    let raf = 0
    let alive = true
    const born = performance.now()
    const clock = (now: number) => (now - born) / 1000

    // sample the wordmark into home positions (CSS pixels)
    function sample() {
      const rect = canvas.getBoundingClientRect()
      W = Math.max(1, Math.round(rect.width))
      H = Math.max(1, Math.round(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)

      const off = document.createElement('canvas')
      off.width = W
      off.height = H
      const o = off.getContext('2d', { willReadFrequently: true })
      if (!o) return
      const fam = '"Archivo", "Helvetica Neue", Arial, sans-serif'
      o.font = `900 100px ${fam}`
      o.fillStyle = '#fff'
      o.textBaseline = 'alphabetic'
      // Keep the complete brand on one line at every viewport width.
      const full = o.measureText(WORD_A + WORD_DOT + WORD_B).width
      const fs = Math.min((W * 0.92 * 100) / full, H * 0.95)
      o.font = `900 ${fs}px ${fam}`
      const wA = o.measureText(WORD_A).width
      const wDot = o.measureText(WORD_DOT).width
      const total = o.measureText(WORD_A + WORD_DOT + WORD_B).width
      const x0 = (W - total) / 2
      const base = H * 0.5 + fs * 0.36
      o.fillText(WORD_A + WORD_DOT + WORD_B, x0, base)
      const dotX0 = x0 + wA
      const dotX1 = dotX0 + wDot
      const data = o.getImageData(0, 0, W, H).data

      // estimate glyph area, pick a grid step that lands near the target count
      let area = 0
      for (let i = 3; i < data.length; i += 16) if (data[i] > 128) area += 4
      const letterTarget = target * (1 - FIELD_FRACTION)
      const step = Math.max(1.6, Math.sqrt(area / letterTarget))
      const pts: number[] = []
      const dots: number[] = []
      let dMinY = 1e9
      let dMaxY = -1e9
      for (let py = 0; py < H; py += step) {
        for (let px = 0; px < W; px += step) {
          const jx = px + (Math.random() - 0.5) * step * 0.6
          const jy = py + (Math.random() - 0.5) * step * 0.6
          const ix = Math.min(W - 1, Math.max(0, Math.round(jx)))
          const iy = Math.min(H - 1, Math.max(0, Math.round(jy)))
          if (data[(iy * W + ix) * 4 + 3] <= 128) continue
          if (jx >= dotX0 - 2 && jx <= dotX1 + 2) {
            dots.push(jx, jy)
            dMinY = Math.min(dMinY, jy)
            dMaxY = Math.max(dMaxY, jy)
          } else pts.push(jx, jy)
        }
      }
      // the dot slot: a round cluster centred on the glyph's period
      dot.r = Math.max(6, Math.min(dotX1 - dotX0, dMaxY - dMinY) * 0.5)
      dot.cx = (dotX0 + dotX1) / 2
      dot.cy = dMaxY > dMinY ? (dMinY + dMaxY) / 2 : base - dot.r
      const cluster: number[] = []
      const cStep = step * 0.62
      for (let py = dot.cy - dot.r; py <= dot.cy + dot.r; py += cStep) {
        for (let px = dot.cx - dot.r; px <= dot.cx + dot.r; px += cStep) {
          const jx = px + (Math.random() - 0.5) * cStep * 0.5
          const jy = py + (Math.random() - 0.5) * cStep * 0.5
          if ((jx - dot.cx) ** 2 + (jy - dot.cy) ** 2 <= dot.r * dot.r) cluster.push(jx, jy)
        }
      }
      const dust = Math.round(target * FIELD_FRACTION)
      n = pts.length / 2 + cluster.length / 2 + dust
      x = new Float32Array(n)
      y = new Float32Array(n)
      hx = new Float32Array(n)
      hy = new Float32Array(n)
      vx = new Float32Array(n)
      vy = new Float32Array(n)
      size = new Float32Array(n)
      phase = new Float32Array(n)
      delay = new Float32Array(n)
      kind = new Uint8Array(n)
      alphaBin = new Uint8Array(n)
      let k = 0
      const put = (px: number, py: number, kd: number) => {
        hx[k] = px
        hy[k] = py
        kind[k] = kd
        size[k] = kd === 1 ? 1.5 + Math.random() * 1.3 : kd === 2 ? 0.8 + Math.random() * 0.8 : 1.1 + Math.random() * 0.9
        phase[k] = Math.random() * Math.PI * 2
        alphaBin[k] = kd === 2 ? 0 : 1 + Math.floor(Math.random() * 3)
        // entry: letters scatter across (and beyond) the frame and settle left to right
        delay[k] = kd === 0 ? (px / W) * 0.55 + Math.random() * 0.35 : 0
        if (assembled || kd !== 0) {
          x[k] = px
          y[k] = py
        } else {
          const a = Math.random() * Math.PI * 2
          const r = (0.35 + Math.random() * 0.9) * Math.max(W, H)
          x[k] = W / 2 + Math.cos(a) * r
          y[k] = H / 2 + Math.sin(a) * r * 0.6
        }
        k++
      }
      for (let i = 0; i < pts.length; i += 2) put(pts[i], pts[i + 1], 0)
      for (let i = 0; i < cluster.length; i += 2) put(cluster[i], cluster[i + 1], 1)
      for (let i = 0; i < dust; i++) put(Math.random() * W, Math.random() * H, 2)
    }

    // ball height above its rest point (px) and squash, for a move that started `s` seconds ago
    function ballPose(s: number, hop: boolean): { lift: number; sq: number; done: boolean; contact: number } {
      const r = dot.r
      const fall = hop ? 0 : FALL
      const bounces = hop ? ([[1.3, 0.3]] as [number, number][]) : BOUNCES
      const amps = hop ? [0.14, 0.04] : SQUASH
      let lift = 0
      let contact = 0
      if (!hop && s < fall) {
        const k = s / fall
        lift = (1 - k * k) * (dot.cy + r * 3)
      } else {
        let tt = s - fall
        contact = 1
        let done = true
        for (const [h, d] of bounces) {
          if (tt < d) {
            const u = tt / d
            lift = 4 * h * r * u * (1 - u)
            done = false
            break
          }
          tt -= d
          contact++
        }
        if (done) contact = bounces.length + 1
        // squash at each contact
        let sq = 0
        let ct = fall
        for (let i = 0; i <= bounces.length; i++) {
          const dd = s - ct
          if (dd >= 0 && dd < 0.12) sq = Math.max(sq, amps[i] * Math.sin((Math.PI * dd) / 0.12))
          if (i < bounces.length) ct += bounces[i][1]
        }
        return { lift, sq, done, contact }
      }
      return { lift, sq: 0, done: false, contact }
    }

    // a radial shockwave through the letters, from the dot slot
    function shock(strength: number) {
      const R = dot.r * 16
      for (let i = 0; i < n; i++) {
        if (kind[i] !== 0) continue
        const dx = x[i] - dot.cx
        const dy = y[i] - (dot.cy + dot.r)
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        if (d > R) continue
        const f = (1 - d / R) ** 2 * 9 * strength
        vx[i] += (dx / d) * f
        vy[i] += (dy / d) * f - f * 0.35
      }
    }

    // the ball bursts into the cluster: dot particles start at the ball and fly home
    function burst() {
      for (let i = 0; i < n; i++) {
        if (kind[i] !== 1) continue
        const a = Math.random() * Math.PI * 2
        const sp = 2 + Math.random() * 7
        x[i] = dot.cx + Math.cos(a) * dot.r * 0.3
        y[i] = dot.cy + Math.sin(a) * dot.r * 0.3
        vx[i] = Math.cos(a) * sp
        vy[i] = Math.sin(a) * sp
      }
    }

    const ALPHAS = [0.2, 0.62, 0.8, 0.96]
    function drawBall(t: number) {
      const hop = dotState === 'hop'
      const s = reduce ? 99 : t - ballAt
      const { lift, sq } = reduce ? { lift: 0, sq: 0 } : ballPose(s, hop)
      const r = dot.r
      // impact ring on the first landing
      if (!hop && !reduce) {
        const k = (s - FALL) / 0.6
        if (k > 0 && k < 1) {
          ctx.strokeStyle = ORANGE
          ctx.globalAlpha = 1 - k
          ctx.lineWidth = 2.5
          const rr = r + k * r * 6
          ctx.beginPath()
          ctx.ellipse(dot.cx, dot.cy + r, rr, rr * 0.22, 0, 0, Math.PI * 2)
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
      // squash and stretch, anchored at the contact point
      const sx = 1 + sq
      const sy = 1 - sq
      const stretch = !hop && s < FALL ? 1 + 0.25 * (s / FALL) : 1
      ctx.save()
      ctx.translate(dot.cx, dot.cy + r - lift)
      ctx.scale(sx / Math.sqrt(stretch), sy * stretch)
      ctx.fillStyle = ORANGE
      ctx.beginPath()
      ctx.arc(0, -r, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function draw(now: number) {
      const t = clock(now)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      // letters and dust, one pass per alpha bin (twinkle bumps a particle up one bin)
      for (let bin = 0; bin < ALPHAS.length; bin++) {
        ctx.fillStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},${ALPHAS[bin]})`
        for (let i = 0; i < n; i++) {
          if (kind[i] === 1) continue
          const b = reduce ? alphaBin[i] : Math.min(3, alphaBin[i] + (Math.sin(t * 1.7 + phase[i] * 3) > 0.93 ? 1 : 0))
          if (b !== bin) continue
          const s = size[i]
          ctx.fillRect(x[i] - s / 2, y[i] - s / 2, s, s)
        }
      }
      // letter particles near the pointer warm toward orange
      if (pointer.active) {
        ctx.fillStyle = 'rgba(255,98,18,0.55)'
        const r2 = (REPEL_R * 1.25) ** 2
        for (let i = 0; i < n; i++) {
          if (kind[i] !== 0) continue
          const dx = x[i] - pointer.x
          const dy = y[i] - pointer.y
          if (dx * dx + dy * dy < r2) ctx.fillRect(x[i] - size[i] / 2, y[i] - size[i] / 2, size[i], size[i])
        }
      }
      // the dot: a solid ball while it moves, a cluster of particles at rest
      if (dotState === 'ball' || dotState === 'hop') drawBall(t)
      else if (dotState === 'particles') {
        ctx.fillStyle = ORANGE
        for (let i = 0; i < n; i++) {
          if (kind[i] !== 1) continue
          const s = size[i] * (1 + 0.18 * Math.sin(t * 2.4 + phase[i]))
          ctx.fillRect(x[i] - s / 2, y[i] - s / 2, s, s)
        }
      }
    }

    function stepBall(t: number) {
      if (dotState === 'empty') {
        if (assembleAt && t - clock(assembleAt) > SETTLE) {
          dotState = 'ball'
          ballAt = t
          shocks = 0
        }
        return
      }
      if (dotState !== 'ball' && dotState !== 'hop') return
      const hop = dotState === 'hop'
      const pose = ballPose(t - ballAt, hop)
      const contacts = hop ? 2 : BOUNCES.length + 1
      // a shockwave on each new contact, scaled by the bounce's strength
      while (shocks < pose.contact && shocks < contacts) {
        shock(hop ? 0.4 : SHOCK[shocks])
        shocks++
      }
      if (pose.done && t - ballAt > (hop ? 0.3 : FALL + BOUNCES.reduce((m, b) => m + b[1], 0)) + 0.1) {
        burst()
        dotState = 'particles'
      }
    }

    function step(now: number) {
      const t = clock(now)
      const since = assembled ? 99 : assembleAt ? (now - assembleAt) / 1000 : -1
      stepBall(t)
      const R2 = REPEL_R * REPEL_R
      for (let i = 0; i < n; i++) {
        let ax = 0
        let ay = 0
        if (kind[i] === 2) {
          // dust drifts on slow noise, wrapping around the frame
          x[i] += Math.sin(t * 0.21 + phase[i]) * 0.08 + 0.05
          y[i] += Math.cos(t * 0.17 + phase[i] * 1.3) * 0.06
          if (x[i] > W + 4) x[i] = -4
          continue
        }
        if (kind[i] === 1) {
          if (dotState !== 'particles') continue
          ax += (hx[i] - x[i]) * 0.09
          ay += (hy[i] - y[i]) * 0.09
          vx[i] = (vx[i] + ax) * 0.8
          vy[i] = (vy[i] + ay) * 0.8
          x[i] += vx[i]
          y[i] += vy[i]
          continue
        }
        if (since > delay[i]) {
          ax += (hx[i] + Math.sin(t * 0.8 + phase[i]) * 0.45 - x[i]) * 0.055
          ay += (hy[i] + Math.cos(t * 0.7 + phase[i]) * 0.45 - y[i]) * 0.055
        }
        if (pointer.active) {
          const dx = x[i] - pointer.x
          const dy = y[i] - pointer.y
          const d2 = dx * dx + dy * dy
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const f = (1 - d / REPEL_R) ** 2 * 5.5
            ax += (dx / d) * f
            ay += (dy / d) * f
          }
        }
        vx[i] = (vx[i] + ax) * 0.84
        vy[i] = (vy[i] + ay) * 0.84
        x[i] += vx[i]
        y[i] += vy[i]
      }
    }

    function frame(now: number) {
      raf = 0
      if (!alive || !visible) return
      step(now)
      draw(now)
      raf = requestAnimationFrame(frame)
    }

    function ripple(px: number, py: number) {
      for (let i = 0; i < n; i++) {
        if (kind[i] !== 0) continue
        const dx = x[i] - px
        const dy = y[i] - py
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        const f = Math.max(0, 1 - d / 260) * 14
        vx[i] += (dx / d) * f
        vy[i] += (dy / d) * f
      }
    }

    // the dot re-forms the ball and hops
    function hop() {
      if (dotState !== 'particles') return
      dotState = 'hop'
      ballAt = clock(performance.now())
      shocks = 0
    }
    const onDot = (p: { x: number; y: number }) => (p.x - dot.cx) ** 2 + (p.y - dot.cy) ** 2 < (dot.r * 2.2) ** 2

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const p = local(e)
      pointer = { x: p.x, y: p.y, active: true }
      const over = onDot(p)
      if (over && !hovering) hop()
      hovering = over
    }
    const onLeave = () => {
      pointer = { x: -1e4, y: -1e4, active: false }
      hovering = false
    }
    const onDown = (e: PointerEvent) => {
      const p = local(e)
      if (onDot(p)) hop()
      else ripple(p.x, p.y)
    }

    sample()
    if (reduce) {
      draw(performance.now())
    } else {
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerleave', onLeave)
      canvas.addEventListener('pointerdown', onDown)
    }

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible && !assembled && !assembleAt) assembleAt = performance.now()
        if (visible && !reduce && !raf) raf = requestAnimationFrame(frame)
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    if (!reduce) io.observe(wrap)

    // re-sample on width changes; re-colour on theme changes
    let lastW = W
    const onResize = () => {
      const w = Math.round(canvas.getBoundingClientRect().width)
      if (Math.abs(w - lastW) < 2) return
      lastW = w
      assembled = true
      sample()
      if (dotState === 'particles') burst()
      draw(performance.now())
    }
    window.addEventListener('resize', onResize)
    const mo = new MutationObserver(() => {
      ink = themeInk()
      if (reduce || !visible) draw(performance.now())
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    // fonts can land after first paint: re-sample once they do
    document.fonts?.ready.then(() => {
      if (!alive) return
      sample()
      draw(performance.now())
    })

    return () => {
      alive = false
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <section ref={wrapRef} className={styles.wordmark} aria-labelledby="wordmark-title">
      <h2 id="wordmark-title" className={styles.srOnly}>
        PostgresAI
      </h2>
      <canvas ref={canvasRef} className={styles.wordmarkCanvas} aria-hidden="true" />
    </section>
  )
}
