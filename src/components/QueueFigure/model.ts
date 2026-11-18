/*
 * Fig. 2 of "The hidden costs of CREATE TEMP TABLE": the shared invalidation
 * queue of Postgres 18, in five steps. This file has no DOM in it: the steps,
 * their words, and what the ring shows at each moment.
 *
 * Steps 1 to 4 follow one writer, one active session and one session that
 * does not read. The mechanism is from src/backend/storage/ipc/sinvaladt.c
 * and sinval.c (REL_18_6). The counts are from a run with one writer and one
 * reader on Postgres 18.6: 132 messages for one create and drop of a table
 * (id int, v text), the catch-up signal during transaction 16, the reset of a
 * reader in a long statement during transaction 32.
 *
 * Step 5 is a schematic of many idle sessions. Three things in it are the
 * rates that the study measured, 50 times slower: the speed of the writer,
 * the share of the time that the writer waits, and the reset flashes. The
 * rest follows the rules of steps 1 to 4 and is not a measurement: where the
 * marks sit, which one gets the signal, and how many are lapped.
 *
 * Not drawn: the cleanup calls themselves (SICleanupQueue), reads in batches
 * of 32 messages, backends that only send, and the wraparound of the message
 * counters.
 */

// sinvaladt.c: MAXNUMMESSAGES, and CLEANUP_MIN = SIG_THRESHOLD = half of it
export const Q = 4096
export const HALF = Q / 2
// one transaction that creates and drops a temp table (id int, v text):
// 71 messages for CREATE and 61 for DROP, measured on 18.6 and 17.11
export const TX = 132
// How the 132 reach the queue: 6 at once during CREATE, then at commit 104 in
// two batches (WRITE_QUANTUM = 64) and 19 more, then 3 when the files go.
const BATCHES: [size: number, from: number, to: number][] = [
  [6, 0, 0.08],
  [64, 0.16, 0.46],
  [40, 0.54, 0.74],
  [19, 0.8, 0.9],
  [3, 0.95, 1],
]

/** step 5 is drawn this many times slower than the server ran */
export const SLOW = 50
/** one mark of step 5 stands for this many idle sessions */
export const PER_MARK = 100

// The study: Postgres 18.6, 16 vCPU, 16 DDL clients at a target of 500 TPS,
// idle sessions that ran one query every 30 s, one run per idle count.
// tps: temp-table TPS reached. wait: share of the DDL sessions' active
// samples in LWLock:SInvalWrite, %. resets: full cache resets per second
// over all backends.
export const TARGET = 500
/** 5000 idle sessions, a second run on another server: temp-table TPS */
export const SECOND_RUN = 249
export const WRITERS = 16
export const PRESETS = [0, 1000, 3000, 5000] as const
export type Idle = (typeof PRESETS)[number]
export const MEASURED: Record<
  Idle,
  { tps: number; wait: number; resets: number }
> = {
  0: { tps: 502, wait: 1.3, resets: 0.1 },
  1000: { tps: 502, wait: 54, resets: 49 },
  3000: { tps: 274, wait: 86, resets: 194 },
  5000: { tps: 127, wait: 91, resets: 457 },
}

export type Step = {
  /** short name, on the step button */
  tab: string
  /** the one line a reader must get */
  title: string
  /** the numbers and the reason, for a reader who stays */
  detail: string
  /** seconds of motion, then seconds of rest before the next step */
  duration: number
  hold: number
  /** the moment that stands for the step in print and with reduced motion */
  still: number
}

export const STEPS: Step[] = [
  {
    tab: 'Write',
    title:
      'A session creates and drops a temp table. That puts 132 invalidation messages into the queue.',
    detail:
      'Each message tells all other sessions to drop one cached catalog row or table descriptor: 71 for CREATE, 61 for DROP. The queue is one ring of 4096 slots for the whole Postgres instance. The writer appends in batches of up to 64 messages (one cell of the ring) and holds the lock SInvalWrite for each batch.',
    duration: 2.2,
    hold: 2.4,
    still: 2.2,
  },
  {
    tab: 'Read',
    title:
      'An active session reads the new messages at its next transaction start. An idle session does not read.',
    detail:
      'Every session has its own read position and must read every message, 32 at a time. A slot is free again only after all sessions have read it, so the idle session holds the queue back. (An active session also reads when it locks a table.)',
    duration: 3.7,
    hold: 2.2,
    still: 3.7,
  },
  {
    tab: 'Catch up',
    title:
      'The queue passes half full, 2048 of 4096 slots: the writer signals the session that is furthest behind. The idle session wakes up and reads its backlog.',
    detail:
      'This happens in transaction 16. When the idle session has caught up, it takes the lock SInvalWrite itself, to pass the signal to the next session that is behind. One signal at a time, and while a reader holds the lock, the writers wait.',
    duration: 6.0,
    hold: 2.2,
    still: 3.9,
  },
  {
    tab: 'Lapped',
    title:
      'A session that does not read in time is lapped. This one is in a long statement and does not act on the signal: the writer comes around, laps it, and it must reset its caches.',
    detail:
      '31 transactions fit. Transaction 32 needs slots that the session has not read, so its unread messages are dropped. It cannot know what it missed: at its next read it throws away all its cached catalog rows, table descriptors and plans, and loads them again.',
    duration: 5.8,
    hold: 2.6,
    still: 3.75,
  },
  {
    tab: 'At scale',
    title:
      'With thousands of idle sessions, only one is signalled at a time. The writer comes around to the others before their turn: they are lapped.',
    detail:
      'A lapped session resets its caches at its next read. A woken session reads, then takes SInvalWrite and scans all sessions to pass the signal on. The writers need the same lock, so they wait. With 5000 idle sessions, temp-table DDL got 127 of the 500 TPS target (249 in a second run).',
    duration: 0,
    hold: 0,
    still: 0,
  },
]

export const SCALE = STEPS.length - 1
/** seconds on each idle count when step 5 plays by itself */
export const DWELL = 3.6

/** one mark of step 5: about 100 idle sessions with one read position */
export type Mark = {
  /** where it stands once it is lapped, as a message number */
  seat: number
  /** its read position while it is not lapped */
  at: number
  lapped: boolean
  /** 1 to 0: one of its sessions resets its caches now */
  flash: number
  /** it has the catch-up signal: it reads, then holds the lock */
  woken: boolean
}

/** what the ring shows at one moment; positions are message numbers */
export type Frame = {
  step: number
  /** messages written so far: the writer */
  head: number
  /** transactions written so far (steps 1 to 4) */
  tx: number
  /** the writer waits for SInvalWrite: a session that woke up holds it */
  waits: boolean
  /** the oldest message that some session has not read */
  tail: number
  /** read position of the active session (steps 1 to 4) */
  active: number
  /** read position of the one session of steps 1 to 4 that does not read */
  idle: number | null
  /** what that session is: idle, or in a long statement */
  who: 'idle' | 'long query'
  /** it was lapped: a reset waits for it */
  reset: boolean
  /** 0 to 1: the catch-up signal on its way from the writer to a session */
  signal: number
  /** the read position of that session when the signal reached it */
  signalTo: number
  /** 0 to 1: that session reads its backlog */
  catchup: number
  /** the half-full and the full mark are shown */
  half: boolean
  full: boolean
  /** step 5 */
  marks: Mark[]
  count: Idle | null
}

const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
/** 0 before a, 1 after b */
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const ease = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2

/** One transaction, batch by batch, from `from` and for `length` seconds. */
function batches(t: number, from: number, length: number) {
  let head = 0
  for (const [size, a, b] of BATCHES)
    head += size * ease(seg(t, from + a * length, from + b * length))
  return head
}

/**
 * `n` transactions, one every `gap` seconds from `from`: the writer appends
 * 132 messages each time. The active session reads a transaction when the
 * next one starts, so it has not read the last one yet.
 */
function run(t: number, from: number, n: number, gap: number) {
  let head = 0
  let active = 0
  for (let k = 0; k < n; k++) {
    const s = from + k * gap
    head += TX * ease(seg(t, s, s + gap * 0.6))
    if (k < n - 1) active += TX * ease(seg(t, s + gap, s + gap * 1.4))
  }
  return { head, active }
}

const blank = (step: number): Frame => ({
  step,
  head: 0,
  tx: 0,
  waits: false,
  tail: 0,
  active: 0,
  idle: 0,
  who: 'idle',
  reset: false,
  signal: 0,
  signalTo: 0,
  catchup: 0,
  half: false,
  full: false,
  marks: [],
  count: null,
})

/** Steps 1 to 4 at `t` seconds: a fixed story, the same for every reader. */
export function frameAt(step: number, t: number): Frame {
  const f = blank(step)
  if (step === 0) {
    // transaction 1, batch by batch; the sessions come in at step 2
    f.head = batches(t, 0.35, 1.6)
    f.idle = null
  } else if (step === 1) {
    // the active session reads the first 132; then 7 more transactions, and
    // it reads each one when the next begins: the 8th is not read yet
    const more = run(t, 0.9, 7, 0.36)
    f.head = TX + more.head
    f.active = TX * ease(seg(t, 0.2, 0.75)) + more.active
  } else if (step === 2) {
    // 7 more, then transaction 16 takes the queue past 2048. The writer
    // signals the idle session, which reads all 2112 and then takes the lock.
    const more = run(t, 0.25, 7, 0.2)
    f.head = 8 * TX + more.head + batches(t, 1.75, 0.75)
    f.active =
      7 * TX +
      TX * ease(seg(t, 0.25, 0.33)) +
      more.active +
      TX * ease(seg(t, 1.75, 1.9)) +
      TX * ease(seg(t, 3.05, 3.25))
    f.half = true
    f.signal = seg(t, 2.1, 2.8)
    f.catchup = ease(seg(t, 3.3, 4.9))
    f.idle = 16 * TX * f.catchup
    f.tail = f.idle
    f.waits = t >= 4.95 && t < 5.85
  } else if (step === 3) {
    // The session at slot 0 is in a long statement. 15 more transactions
    // fill the ring: 31 * 132 = 4092 of 4096. Transaction 32 does not fit:
    // the session is reset, its slots are freed, and the writer goes on. The
    // active session has not begun its next transaction, so it stays behind.
    const more = run(t, 0.3, 15, 0.15)
    f.who = 'long query'
    f.head = 16 * TX + more.head + TX * ease(seg(t, 4.9, 5.2))
    f.active = 16 * TX + more.active
    f.half = true
    f.full = true
    f.reset = t >= 2.9
    // the slots are freed: nothing but the active session holds them now
    f.tail = f.active * ease(seg(t, 4.1, 4.8))
  }
  f.tx = Math.floor((f.head + 0.5) / TX)
  return f
}

/* mulberry32: seeded, so the marks sit at the same places for every reader */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SEATS = PRESETS[PRESETS.length - 1] / PER_MARK
/** step 5: seconds of one round, in which the writer waits and then writes */
const ROUND = 2
/** the part of the wait in which the signal goes out, and the part in which
    the woken session reads; it holds the lock for the rest */
const SIGNAL = 0.28
const READ = 0.78

export type Scale = {
  /** the idle count; the marks of a smaller count stay when it grows */
  setIdle: (n: Idle, settled?: boolean) => void
  advance: (dt: number) => void
  frame: () => Frame
}

/**
 * Step 5. The writer goes in rounds: it waits for SInvalWrite for the
 * measured share of a round, then writes, and its mean speed is the measured
 * one. While it waits, the mark that is furthest behind (and more than half
 * a ring behind) gets the signal, reads up to the writer and holds the lock.
 * One signal a round keeps only a few marks going. The writer comes around
 * to the others: they are lapped, and leave the ring for the inner row.
 *
 * A flash is one reset, at the measured rate: one session of a lapped mark
 * reads again. It does not bring the mark back, with one exception: when
 * fewer marks are left than the signal can keep going, the mark that flashes
 * joins them at the writer's position.
 */
export function createScale(seed = 196): Scale {
  const random = rng(seed)
  // places for the lapped marks: even around the ring, in a fixed random order
  const seats: number[] = []
  for (let i = 0; i < SEATS; i++) seats.push(((i + 0.5) * Q) / SEATS)
  for (let i = SEATS - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[seats[i], seats[j]] = [seats[j], seats[i]]
  }

  let count: Idle = 0
  let head = 0
  let debt = 0
  // seconds into the round, and its length
  let phase = 0
  let round = ROUND
  let marks: { seat: number; pos: number; lapped: boolean; flash: number }[] =
    []
  // the mark that has the signal in this round, and where it was then
  let woken = -1
  let from = 0

  const behind = (seat: number) => head - ((((head - seat) % Q) + Q) % Q)
  // the share of a round that the writer waits; a small share is not drawn
  const share = () => {
    const wait = MEASURED[count].wait / 100
    return wait < 0.05 ? 0 : wait
  }
  const speed = () => (MEASURED[count].tps * TX) / SLOW
  // how many marks one signal a round can keep ahead of the writer
  const chain = () =>
    count ? Math.max(1, Math.floor((0.82 * Q) / (speed() * ROUND))) : 0
  const wake = () => {
    woken = -1
    if (!share()) return
    let far = head - HALF
    marks.forEach((mark, i) => {
      if (!mark.lapped && mark.pos < far) {
        far = mark.pos
        woken = i
      }
    })
    if (woken >= 0) from = marks[woken].pos
  }

  return {
    setIdle(n, settled = false) {
      count = n
      const want = n / PER_MARK
      marks = marks.slice(0, want)
      for (let i = marks.length; i < want; i++)
        marks.push({
          seat: seats[i],
          pos: behind(seats[i]),
          lapped: false,
          flash: 0,
        })
      // a new round: with idle sessions the writer starts with a wait
      phase = 0
      round = ROUND
      wake()
      if (settled) {
        // as after a long run: the signal keeps a few marks going and has
        // just reached the one that is furthest behind; the rest are lapped
        head = Math.max(head, 2 * Q + 0.71 * Q)
        round = ROUND
        phase = round * share() * SIGNAL
        debt = 0
        const keep = chain()
        const step = speed() * ROUND
        marks.forEach((mark, i) => {
          mark.lapped = i >= keep
          mark.pos = head - (i + 1) * step
          mark.flash = 0
        })
        // a few resets, well apart around the row of lapped marks
        marks
          .filter((mark) => mark.lapped)
          .sort((a, b) => a.seat - b.seat)
          .forEach((mark, i) => {
            if (i % 11 === 4) mark.flash = 0.55
          })
        if (keep) {
          woken = keep - 1
          from = marks[woken].pos
        }
      }
    },
    advance(dt) {
      const m = MEASURED[count]
      const wait = share()
      // the writer moves in the last part of each round, and makes up there
      // for the time it stood still: the mean speed is the measured one
      let left = dt
      while (left > 0) {
        const step = Math.min(left, round - phase)
        const moving = Math.max(0, phase + step - Math.max(phase, round * wait))
        if (moving > 0 && woken >= 0) {
          // the woken session has read everything; the lock is free again
          marks[woken].pos = head
          woken = -1
        }
        head += (speed() * moving) / (1 - wait)
        phase += step
        left -= step
        for (const mark of marks)
          if (!mark.lapped && head - mark.pos >= Q) mark.lapped = true
        if (phase >= round - 1e-9) {
          phase = 0
          round = ROUND * (0.8 + 0.4 * random())
          wake()
        }
      }
      for (const mark of marks)
        if (mark.flash > 0) mark.flash = Math.max(0, mark.flash - dt / 0.6)
      debt += (m.resets / SLOW) * dt
      while (debt >= 1) {
        debt -= 1
        const lapped = marks.filter((mark) => mark.lapped)
        if (!lapped.length) continue
        const mark = lapped[Math.floor(random() * lapped.length)]
        mark.flash = 1
        if (marks.length - lapped.length < chain()) {
          mark.lapped = false
          mark.pos = head
        }
      }
    },
    frame() {
      const f = blank(SCALE)
      f.idle = null
      f.count = count
      f.head = head
      f.active = head
      const pause = round * share()
      f.waits = phase < pause
      if (woken >= 0) {
        const u = f.waits ? phase / pause : 1
        f.signal = clamp(u / SIGNAL)
        f.signalTo = from
        f.catchup = ease(seg(u, SIGNAL, READ))
      }
      let tail = head
      f.marks = marks.map((mark, i) => {
        const at = i === woken ? from + (head - from) * f.catchup : mark.pos
        if (!mark.lapped) tail = Math.min(tail, at)
        return {
          seat: mark.seat,
          at,
          lapped: mark.lapped,
          flash: mark.flash,
          woken: i === woken,
        }
      })
      f.tail = Math.max(tail, head - Q)
      return f
    },
  }
}

/** The frame that stands for a step when nothing moves. */
export function stillFrame(step: number): Frame {
  if (step !== SCALE) return frameAt(step, STEPS[step].still)
  const scale = createScale()
  scale.setIdle(5000, true)
  return scale.frame()
}

/** What the ring shows, in words: the text alternative of the drawing. */
export function describe(f: Frame): string {
  const used = Math.round(f.head - f.tail)
  if (f.count !== null) {
    const m = MEASURED[f.count]
    const lapped = f.marks.filter((mark) => mark.lapped).length * PER_MARK
    return (
      `The invalidation queue as a ring of ${Q} slots, with ${f.count} idle sessions. ` +
      (f.count
        ? `About ${lapped} of them are lapped and have a cache reset to do. ` +
          (f.signal > 0
            ? 'One group of the others has the catch-up signal: it reads, then holds the lock SInvalWrite, and the writer waits for it. '
            : '')
        : 'The ring is almost empty. ') +
      `Measured: ${m.tps} of ${TARGET} temp-table transactions per second` +
      (f.count === 5000 ? ` (${SECOND_RUN} in a second run), ` : ', ') +
      `${m.wait}% of the writers' active time in LWLock:SInvalWrite, ${m.resets} full cache resets per second.`
    )
  }
  const at = (x: number) => `slot ${Math.round(x) % Q}`
  if (f.idle === null)
    return (
      `The invalidation queue as a ring of ${Q} slots, ${used} in use, after ${f.tx} ${f.tx === 1 ? 'transaction' : 'transactions'}. ` +
      `The writer is at ${at(f.head)}.`
    )
  const who = f.who === 'long query' ? 'session in a long statement' : 'idle session'
  return (
    `The invalidation queue as a ring of ${Q} slots, ${used} in use, after ${f.tx} ${f.tx === 1 ? 'transaction' : 'transactions'}. ` +
    `The writer is at ${at(f.head)}${f.waits ? ' and waits for the lock SInvalWrite' : ''}, ` +
    `the active session has read up to ${at(f.active)}, ` +
    (f.reset
      ? `and the ${who} was lapped: it must reset its caches.`
      : `and the ${who} has read up to ${at(f.idle ?? 0)}` +
        (f.signal >= 1 && f.catchup < 1
          ? ', and has the catch-up signal.'
          : '.'))
  )
}
