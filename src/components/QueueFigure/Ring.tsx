import React from 'react'

import { Frame, HALF, MEASURED, Q, TARGET, describe } from './model'
import styles from './styles.module.css'

/*
 * The drawing of Fig. 2: the queue as a ring of 4096 slots. Slot 0 is at the
 * top and the numbers grow clockwise. The writer is the triangle outside the
 * ring, the messages are the orange part of it, and every session is a pin
 * inside the ring at the message it reads next.
 *
 * Plain SVG from one Frame, with no state: the server renders it, print gets
 * it, and the colours come from the CSS variables of the figure.
 */

const VIEW_W = 324
const VIEW_H = 312
const CX = 162
const CY = 156
const R = 106 // the middle of the track
const W = 20 // its width
const CIRC = 2 * Math.PI * R
const CELLS = 64 // one cell is one batch of the writer: 64 messages
const GAP = 1.6
// how far a pin reaches towards the centre: an idle session stays close to
// the ring, the active one reaches further, so both show at the same place
const TIP_IDLE = 81
const TIP_ACTIVE = 70
const TEXT = 12.5
// step 5: the marks that still read are pins at the ring, as in steps 1 to 4;
// the lapped ones stand in a row of their own, further in
const LIVE = 85
const PARK = 73
// the signal of step 5 goes around the outside of the ring
const SIGNAL_R = R + W / 2 + 11
// steps 1 to 4: the dotted way of the session that reads its backlog
const READ_R = 78

const rad = (m: number) => (m / Q) * 2 * Math.PI
const deg = (m: number) => (((m % Q) + Q) % Q) * (360 / Q)
const at = (a: number, r: number): [number, number] => [
  CX + r * Math.sin(a),
  CY - r * Math.cos(a),
]
const n1 = (x: number) => Math.round(x * 10) / 10
// rough width of a label in the caption face, for its place only
const half = (text: string, size = TEXT) => (text.length * size * 0.47) / 2 + 2

const unit = (x: number) => Math.max(-1, Math.min(1, x))
const smooth = (x: number) => {
  const u = Math.max(0, Math.min(1, x))
  return u * u * (3 - 2 * u)
}
const mix = (
  a: [number, number],
  b: [number, number],
  k: number,
): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]

/**
 * A label outside the ring, in the direction `a`: its box lies against the
 * ring and never covers it, so the drawing needs little room around the ring.
 * `sub` is a second line, in the lighter face; `light` sets the label itself
 * in that face.
 */
function Outside({
  a,
  text,
  sub,
  room,
  light,
}: {
  a: number
  text: string
  sub?: string
  /** keep the place of the second line when there is none */
  room?: boolean
  light?: boolean
}) {
  const hh = sub || room ? 14 : 7
  const [x, y] = at(a, R + W / 2 + 5)
  const cx = n1(x + half(text) * unit(Math.sin(a) / 0.35))
  const top = y - hh * unit(Math.cos(a) / 0.35) - hh
  return (
    <>
      <text
        className={light ? styles.tick : styles.label}
        x={cx}
        y={n1(top + 11.5)}
        textAnchor="middle"
      >
        {text}
      </text>
      {sub && (
        <text
          className={styles.tick}
          x={cx}
          y={n1(top + 25)}
          textAnchor="middle"
        >
          {sub}
        </text>
      )}
    </>
  )
}

/**
 * The place of a label inside the ring. At the top and the bottom it lies
 * between the pin at the angle `a` and the centre. At the sides the centre
 * text is in that place, so the label moves over the pin.
 */
function inside(a: number, text: string, tip: number): [number, number] {
  const hw = half(text)
  const side = Math.abs(Math.sin(a))
  const r = tip - 3 - (hw * side + 7 * Math.abs(Math.cos(a)))
  const under = at(a, r)
  const over = at(a, tip - 8)
  return mix(under, [over[0], over[1] - 19], smooth((side - 0.7) / 0.22))
}

/** room for the small copy of the pin that a pin's label begins with */
const GLYPH = 10

/**
 * The label of a pin, around the point `p`. It begins with a small copy of
 * the pin, so two labels side by side still say which pin each one names.
 */
function Label({
  p,
  text,
  kind,
}: {
  p: [number, number]
  text: string
  kind: 'active' | 'idle' | 'reset'
}) {
  const left = p[0] - (half(text) - 2) - GLYPH / 2
  const gx = n1(left + 3.5)
  const gy = n1(p[1])
  return (
    <g>
      {kind === 'active' && (
        <circle className={styles.active} cx={gx} cy={gy} r={3} />
      )}
      {kind === 'idle' && (
        <circle className={styles.idle} cx={gx} cy={gy} r={2.8} />
      )}
      {kind === 'reset' && (
        <path
          className={styles.crossSmall}
          d={`M${n1(left + 0.9)} ${n1(p[1] - 2.6)}l5.2 5.2m0 -5.2l-5.2 5.2`}
        />
      )}
      <text
        className={`${styles.label} ${styles.fromStart}`}
        x={n1(left + GLYPH)}
        y={n1(p[1] + 4.5)}
      >
        {text}
      </text>
    </g>
  )
}

/** A session: a pin on the inner edge of the ring, at its read position. */
function Pin({
  m,
  kind,
}: {
  m: number
  kind: 'active' | 'idle' | 'reset' | 'woken'
}) {
  return (
    <g transform={`rotate(${n1(deg(m))} ${CX} ${CY})`}>
      <line
        className={
          kind === 'active' || kind === 'woken' ? styles.stem : styles.stemIdle
        }
        x1={CX}
        y1={CY - R + W / 2}
        x2={CX}
        y2={kind === 'active' ? CY - 78 : CY - 90}
      />
      {kind === 'active' && (
        <circle className={styles.active} cx={CX} cy={CY - 75} r={4.6} />
      )}
      {kind === 'idle' && (
        <circle className={styles.idle} cx={CX} cy={CY - LIVE} r={4} />
      )}
      {kind === 'woken' && (
        <circle className={styles.woken} cx={CX} cy={CY - LIVE} r={4.4} />
      )}
      {kind === 'reset' && (
        <path
          className={styles.cross}
          d={`M${CX - 4.2} ${CY - 89.2}L${CX + 4.2} ${CY - 80.8}M${CX + 4.2} ${CY - 89.2}L${CX - 4.2} ${CY - 80.8}`}
        />
      )}
    </g>
  )
}

const ARROW = 'M-5 -4L4 0L-5 4Z'

export default function Ring({ frame: f }: { frame: Frame }) {
  const used = Math.min(Q, Math.max(0, f.head - f.tail))
  const aHead = rad(f.head)
  const aActive = rad(f.active)
  const aIdle = rad(f.idle ?? 0)
  const scale = f.count !== null
  const idleText = f.reset ? 'reset' : f.who
  // steps 3 and 5: the writer can wait for the lock there, and its label
  // keeps room for that word
  const canWait = f.step === 2 || scale

  // The labels of the two pins. Each lies at its own pin. When the pins are
  // close together, at the top or the bottom of the ring, the labels share
  // one row under them and move apart, each to the side of its pin.
  let pActive = inside(aActive, 'active', TIP_ACTIVE)
  let pIdle = inside(aIdle, idleText, TIP_IDLE)
  if (f.idle !== null) {
    // how far the active session is ahead of the other one, -Q/2 to Q/2
    const ahead = ((((f.active - f.idle) % Q) + Q + Q / 2) % Q) - Q / 2
    const top = Math.cos(aIdle)
    const k =
      (1 - smooth((Math.abs(ahead) - 330) / 330)) *
      smooth((Math.abs(top) - 0.6) / 0.2)
    if (k > 0) {
      const y = CY - Math.sign(top) * 58
      const xa = CX + 75 * Math.sin(aActive)
      const xi = CX + LIVE * Math.sin(aIdle)
      // clockwise is to the right at the top and to the left at the bottom
      const s = (ahead >= 0 ? 1 : -1) * Math.sign(top)
      const need = half('active') + half(idleText) + 8 + GLYPH
      const d = Math.max(0, need - s * (xa - xi)) / 2
      pActive = mix(pActive, [xa + s * d, y], k)
      pIdle = mix(pIdle, [xi - s * d, y], k)
    }
  }

  // Steps 1 to 4, the catch-up signal: from the writer's place on the ring
  // to the idle session, across the free part of the ring
  const aTo = rad(f.signalTo)
  const far = (aHead + aTo) / 2 + Math.PI
  const from = at(aHead + 0.07, R - W / 2 - 1)
  const to = at(aTo - 0.32, 82)
  const bend = at(far, 128)
  const signalPath = `M${n1(from[0])} ${n1(from[1])}Q${n1(bend[0])} ${n1(bend[1])} ${n1(to[0])} ${n1(to[1])}`
  const signalAt = at(aTo - 0.62, 52)

  // the way the woken session reads: along the messages, up to the writer
  const a0 = rad((f.idle ?? 0) + 210)
  const a1 = rad(f.head - 330)
  const readAt = at(aTo + 0.62, 52)
  const readStart = at(a0, READ_R)
  const readEnd = at(a1, READ_R)
  const readPath =
    a1 > a0
      ? `M${n1(readStart[0])} ${n1(readStart[1])}A${READ_R} ${READ_R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${n1(readEnd[0])} ${n1(readEnd[1])}`
      : ''

  // Step 5, the same signal: around the outside of the ring, clockwise from
  // the writer to the read position of the session that gets it
  const reach = rad((((f.signalTo - f.head) % Q) + Q) % Q)
  const b0 = aHead + 0.1
  const b1 = aHead + Math.max(reach, 0.16)
  const o0 = at(b0, SIGNAL_R)
  const o1 = at(b1, SIGNAL_R)
  // it goes on across the ring, to the pin of that session
  const o2 = at(b1, 94.5)
  // it starts at the session that holds the lock: the one that read last,
  // which is now at the writer; it passes the signal on
  const sender = at(aHead, LIVE)
  const sending = scale && f.waits && f.signal > 0 && f.catchup <= 0
  const outPath = `${sending ? `M${n1(sender[0])} ${n1(sender[1])}L` : 'M'}${n1(o0[0])} ${n1(o0[1])}A${SIGNAL_R} ${SIGNAL_R} 0 ${b1 - b0 > Math.PI ? 1 : 0} 1 ${n1(o1[0])} ${n1(o1[1])}L${n1(o2[0])} ${n1(o2[1])}`

  // step 5: the marks that read are pins, the lapped ones crosses further in
  let stems = ''
  let circles = ''
  let crosses = ''
  let woken: number | null = null
  for (const mark of f.marks) {
    if (mark.lapped) {
      const [x, y] = at(rad(mark.seat), PARK)
      crosses += `M${n1(x - 2.7)} ${n1(y - 2.7)}l5.4 5.4m0 -5.4l-5.4 5.4`
    } else if (mark.woken) {
      woken = mark.at
    } else {
      const a = rad(mark.at)
      const [x1, y1] = at(a, R - W / 2)
      const [x2, y2] = at(a, 90)
      const [x, y] = at(a, LIVE)
      stems += `M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}`
      circles += `M${n1(x - 3.6)} ${n1(y)}a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0`
    }
  }

  // step 5: the woken session, once it has read, holds SInvalWrite
  // its label only once it has read: while it sends, the signal is in the way
  const holder = woken !== null && f.catchup >= 1 && f.waits ? woken : null
  const m = scale ? MEASURED[f.count!] : null
  const showSignal = f.signal > 0 && f.catchup < 0.25
  const fade = n1(1 - Math.min(1, f.catchup * 4))

  return (
    <svg
      className={styles.ring}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={describe(f)}
    >
      {/* the ring: free slots, then the messages, then the cell lines */}
      <circle className={styles.track} cx={CX} cy={CY} r={R} strokeWidth={W} />
      <circle
        className={styles.arc}
        cx={CX}
        cy={CY}
        r={R}
        strokeWidth={W}
        strokeDasharray={`${n1((used / Q) * CIRC)} ${n1(CIRC)}`}
        transform={`rotate(${n1(deg(f.tail) - 90)} ${CX} ${CY})`}
      />
      <circle
        className={styles.cells}
        cx={CX}
        cy={CY}
        r={R}
        strokeWidth={W + 2}
        strokeDasharray={`${GAP} ${n1(CIRC / CELLS - GAP)}`}
        strokeDashoffset={GAP / 2}
        transform={`rotate(-90 ${CX} ${CY})`}
      />

      {/* half full and full, counted from the idle session's read position */}
      {f.half && (
        <g>
          <line
            className={styles.mark}
            x1={CX}
            y1={CY + R - W / 2 - 3}
            x2={CX}
            y2={CY + R + W / 2 + 7}
          />
          <text
            className={styles.tick}
            x={CX + 16}
            y={CY + R + W / 2 + 32}
            textAnchor="start"
          >
            half full: {HALF}
          </text>
        </g>
      )}
      {f.full && (
        <g>
          <line
            className={styles.mark}
            x1={CX}
            y1={CY - R + W / 2 + 3}
            x2={CX}
            y2={CY - R - W / 2 - 7}
          />
          <text
            className={styles.tick}
            x={CX - 16}
            y={CY - R - W / 2 - 24}
            textAnchor="end"
          >
            full: {Q}
          </text>
        </g>
      )}

      {/* steps 1 to 4: the signal, and the way the woken session then reads */}
      {!scale && showSignal && (
        <g opacity={fade}>
          <path
            className={styles.signal}
            d={signalPath}
            pathLength={1}
            strokeDasharray={`${n1(f.signal)} 1`}
          />
          {f.signal >= 1 && (
            <text
              className={styles.tick}
              x={n1(signalAt[0])}
              y={n1(signalAt[1] + 4)}
              textAnchor="middle"
            >
              signal
            </text>
          )}
          {f.signal >= 1 && (
            <path
              className={styles.signalHead}
              d={ARROW}
              transform={`translate(${n1(to[0])} ${n1(to[1])}) rotate(${n1(
                (Math.atan2(to[1] - bend[1], to[0] - bend[0]) * 180) / Math.PI,
              )})`}
            />
          )}
        </g>
      )}
      {!scale && f.signal >= 1 && f.catchup < 1 && a1 - a0 > 0.5 && (
        <g>
          <path className={styles.path} d={readPath} />
          <path
            className={styles.pathHead}
            d={ARROW}
            transform={`translate(${n1(readEnd[0])} ${n1(readEnd[1])}) rotate(${n1(deg(f.head - 330))})`}
          />
          {f.catchup <= 0 && (
            <text
              className={styles.tick}
              x={n1(readAt[0])}
              y={n1(readAt[1] + 4)}
              textAnchor="middle"
            >
              reads
            </text>
          )}
        </g>
      )}

      {/* step 5: the signal, then the sessions */}
      {scale && showSignal && (
        <g opacity={fade}>
          <path
            className={styles.signal}
            d={outPath}
            pathLength={1}
            strokeDasharray={`${n1(f.signal)} 1`}
          />
          {f.signal >= 1 && (
            <path
              className={styles.signalHead}
              d={ARROW}
              transform={`translate(${n1(o2[0])} ${n1(o2[1])}) rotate(${n1(deg(f.signalTo) + 90)})`}
            />
          )}
          {f.signal >= 1 && <Outside a={b1 + 0.34} text="signal" light />}
        </g>
      )}
      {scale && (
        <g>
          <path className={styles.stemIdle} d={stems} />
          <path className={styles.idle} d={circles} />
          <path className={styles.crossSmall} d={crosses} />
          {f.marks.map(
            (mark) =>
              mark.flash > 0 && (
                <circle
                  key={mark.seat}
                  className={styles.flash}
                  cx={n1(at(rad(mark.seat), PARK)[0])}
                  cy={n1(at(rad(mark.seat), PARK)[1])}
                  r={n1(4.5 + 8 * (1 - mark.flash))}
                  opacity={n1(mark.flash)}
                />
              ),
          )}
          {woken !== null && <Pin m={woken} kind="woken" />}
          {sending && <Pin m={f.head} kind="woken" />}
          {/* the holder is at the writer: its label goes on the other side */}
          {holder !== null && <Outside a={aHead + 0.3} text="holds" sub="the lock" light />}
        </g>
      )}
      {!scale && f.step > 0 && (
        <g>
          <Pin m={f.active} kind="active" />
          <Label p={pActive} text="active" kind="active" />
        </g>
      )}
      {f.idle !== null && (
        <g>
          <Pin m={f.idle} kind={f.reset ? 'reset' : 'idle'} />
          <Label p={pIdle} text={idleText} kind={f.reset ? 'reset' : 'idle'} />
        </g>
      )}

      {/* the writer */}
      <path
        className={f.waits ? styles.waiting : styles.writer}
        d={`M${CX} ${CY - R - W / 2 - 3}l-7.5 -14h15Z`}
        transform={`rotate(${n1(deg(f.head))} ${CX} ${CY})`}
      />
      <Outside
        a={aHead + (scale ? -0.25 : 0.25)}
        text="writer"
        sub={f.waits ? 'waits' : undefined}
        room={canWait}
      />

      {/* the centre: what the queue holds, or what the server reached */}
      {m ? (
        <g>
          <text className={styles.small} x={CX} y={CY - 20}>
            {f.count} idle sessions
          </text>
          <text className={styles.big} x={CX} y={CY + 4}>
            {m.tps} TPS
          </text>
          <text className={styles.small} x={CX} y={CY + 20}>
            target: {TARGET}
          </text>
          <text className={styles.small} x={CX} y={CY + 35}>
            writers wait: {m.wait}%
          </text>
        </g>
      ) : (
        <g>
          <text className={styles.small} x={CX} y={CY - 14}>
            {f.tx} {f.tx === 1 ? 'transaction' : 'transactions'}
          </text>
          <text className={styles.big} x={CX} y={CY + 11}>
            {Math.round(used)}
          </text>
          <text className={styles.small} x={CX} y={CY + 27}>
            of {Q} queue slots
          </text>
        </g>
      )}
    </svg>
  )
}
