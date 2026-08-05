/**
 * What the model is allowed to teach.
 *
 * These assert durable properties of PostgreSQL that the animation is making
 * claims about, not the particular numbers this calibration happens to
 * produce. If a change makes the model more correct and one of these goes
 * red, the assertion is what was wrong — moving a knob to keep a test green
 * is how a model quietly stops being true.
 *
 * Run with `bun test`.
 */

import { describe, expect, it } from 'bun:test'
import { BE_COMMIT_WAIT, CONN_NONE, CONN_OPEN, FRAME_DIRTY, createCity, type City } from './sim'
import { N_BACKENDS, N_FRAMES } from './plan'

const STEP = 1 / 60

function run(city: City, seconds: number, each?: (c: City) => void): void {
  const n = Math.round(seconds / STEP)
  for (let i = 0; i < n; i++) {
    city.step(STEP)
    each?.(city)
  }
}

describe('the buffer pool', () => {
  it('caps usage_count at 5, as the clock sweep does', () => {
    const city = createCity()
    let max = 0
    run(city, 120, (c) => {
      for (let i = 0; i < N_FRAMES; i++) if (c.frameUsage[i] > max) max = c.frameUsage[i]
    })
    /* Must reach the cap and must not pass it: below, the sweep is not being
     * exercised; above, the cap is not being applied. */
    expect(max).toBe(5)
  })

  it('reports the hit ratio by PostgreSQL’s own formula', () => {
    const city = createCity()
    run(city, 30)
    expect(city.hitRatio).toBeCloseTo(city.blksHit / (city.blksHit + city.blksRead), 10)
  })

  it('keeps the hit ratio in a range a real OLTP database reaches', () => {
    /* A front page reporting 40% would be teaching that a healthy database
     * misses half its reads. What this pins is the working set, not the
     * arithmetic. */
    const city = createCity()
    let sum = 0
    let n = 0
    run(city, 180, (c) => {
      sum += c.hitRatio
      n++
    })
    expect(sum / n).toBeGreaterThan(0.88)
    expect(sum / n).toBeLessThan(1)
  })

  it('releases every pin it takes', () => {
    /* A leaked pin permanently removes a frame from the clock sweep's reach. */
    const city = createCity()
    run(city, 240)
    let pinned = 0
    for (let i = 0; i < N_FRAMES; i++) pinned += city.framePinned[i]
    expect(pinned).toBeLessThan(N_BACKENDS + 1)
  })
})

describe('the write-ahead rule', () => {
  it('leaves the changed page dirty in memory after the commit returns', () => {
    /* The claim the whole drawing rests on: a commit makes the WAL record
     * durable, not the data page. If commits cleaned pages, the pool would
     * run clean under write load and the checkpointer would have nothing to
     * do — which is the opposite of why checkpoint tuning matters. */
    const city = createCity()
    run(city, 90)
    expect(city.commits).toBeGreaterThan(0)

    let sawDirty = 0
    let samples = 0
    run(city, 120, (c) => {
      samples++
      if (c.dirtyRatio > 0) sawDirty++
    })
    expect(sawDirty).toBe(samples)
  })

  it('produces write-ahead log before anything is committed', () => {
    const city = createCity(0xc0ffee)
    let walAtFirstCommit = -1
    run(city, 60, (c) => {
      if (walAtFirstCommit < 0 && c.commits > 0) walAtFirstCommit = c.walBytes
    })
    expect(walAtFirstCommit).toBeGreaterThan(0)
  })

  it('parks a backend in commit_wait while its WAL is flushed', () => {
    /* The wait has to be a state a reader can catch, not an instant
     * transition. A commit that never waits is not a commit. */
    const city = createCity()
    let seen = 0
    run(city, 120, (c) => {
      for (let i = 0; i < N_BACKENDS; i++) if (c.backendState[i] === BE_COMMIT_WAIT) seen++
    })
    expect(seen).toBeGreaterThan(0)
  })

  it('floods the log with full-page images after a checkpoint begins', () => {
    /* full_page_writes re-arms at every checkpoint, so the first change to
     * each page afterwards carries the whole page into the log. It is why WAL
     * volume — and replication lag with it — climbs right after a checkpoint
     * starts, and it is the mechanism behind a whole class of "why did my
     * replica fall behind on a schedule" questions. */
    const city = createCity()
    const WINDOW = 4
    const ringLen = Math.round(WINDOW / STEP)
    const ring = new Float64Array(ringLen)
    let head = 0
    let filled = 0
    let t = 0
    let prevActive = false
    let pending: { at: number; atEdge: number; windowAgo: number } | null = null
    const events: { before: number; after: number }[] = []

    run(city, 400, (c) => {
      t += STEP
      const windowAgo = ring[head]
      ring[head] = c.walBytes
      head = (head + 1) % ringLen
      if (filled < ringLen) filled++

      if (c.checkpointActive && !prevActive && filled >= ringLen && !pending) {
        pending = { at: t, atEdge: c.walBytes, windowAgo }
      }
      prevActive = c.checkpointActive

      if (pending && t - pending.at >= WINDOW) {
        events.push({
          before: pending.atEdge - pending.windowAgo,
          after: c.walBytes - pending.atEdge,
        })
        pending = null
      }
    })

    expect(events.length).toBeGreaterThanOrEqual(2)
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
    const before = mean(events.map((e) => e.before))
    const after = mean(events.map((e) => e.after))
    expect(after).toBeGreaterThan(before)
  })
})

describe('connections', () => {
  it('forks a backend per connection, not per statement', () => {
    /* Connections change on their own slow clock. If a slot went from unused
     * to used on every statement, the drawing would be teaching a
     * process-per-query database, which is the misconception this scene most
     * needs not to reinforce. */
    const city = createCity()
    let transitions = 0
    const prev = new Uint8Array(N_BACKENDS)
    prev.set(city.backendConn)
    run(city, 180, (c) => {
      for (let i = 0; i < N_BACKENDS; i++) {
        if (c.backendConn[i] !== prev[i]) transitions++
        prev[i] = c.backendConn[i]
      }
    })
    expect(city.commits).toBeGreaterThan(0)
    expect(city.commits / Math.max(1, transitions)).toBeGreaterThan(1)
  })

  it('keeps at least one connection open and never exceeds the row', () => {
    const city = createCity()
    let minOpen = N_BACKENDS
    let maxUsed = 0
    run(city, 240, (c) => {
      let open = 0
      let used = 0
      for (let i = 0; i < N_BACKENDS; i++) {
        if (c.backendConn[i] === CONN_OPEN) open++
        if (c.backendConn[i] !== CONN_NONE) used++
      }
      if (open < minOpen) minOpen = open
      if (used > maxUsed) maxUsed = used
    })
    expect(minOpen).toBeGreaterThanOrEqual(1)
    expect(maxUsed).toBeLessThanOrEqual(N_BACKENDS)
  })

  it('never shows work on a slot with no process behind it', () => {
    const city = createCity()
    let violations = 0
    run(city, 180, (c) => {
      for (let i = 0; i < N_BACKENDS; i++) {
        if (c.backendConn[i] === CONN_NONE && c.backendLoad[i] > 0.5) violations++
      }
    })
    expect(violations).toBe(0)
  })
})

describe('replication', () => {
  it('measures lag as the gap between what is sent and what is replayed', () => {
    const city = createCity()
    run(city, 120)
    expect(city.replayedBytes).toBeLessThanOrEqual(city.sentBytes)
    expect(city.sentBytes).toBeLessThanOrEqual(city.walBytes)
  })

  it('lets lag both build and drain rather than pinning at either end', () => {
    /* A lag readout stuck at zero teaches that replication is free; one stuck
     * at the maximum teaches that a replica can never catch up. */
    const city = createCity()
    let min = Infinity
    let max = -Infinity
    run(city, 300, (c) => {
      if (c.replayLag < min) min = c.replayLag
      if (c.replayLag > max) max = c.replayLag
    })
    expect(min).toBeLessThan(0.35)
    expect(max).toBeGreaterThan(0.02)
    expect(max).toBeLessThan(1)
  })
})

describe('the model as a machine', () => {
  it('is deterministic for a given seed', () => {
    const a = createCity(1234)
    const b = createCity(1234)
    run(a, 60)
    run(b, 60)
    expect(a.commits).toBe(b.commits)
    expect(a.walBytes).toBe(b.walBytes)
    expect(Array.from(a.frameState)).toEqual(Array.from(b.frameState))
  })

  it('differs for a different seed', () => {
    const a = createCity(1)
    const b = createCity(2)
    run(a, 60)
    run(b, 60)
    expect(Array.from(a.frameState)).not.toEqual(Array.from(b.frameState))
  })

  it('never exhausts its fixed particle pool', () => {
    /* The pool is preallocated so the animation loop allocates nothing. If it
     * saturates, particles are silently dropped and the causality the scene
     * is showing stops being complete. */
    const city = createCity()
    let peak = 0
    run(city, 300, (c) => {
      if (c.pCount > peak) peak = c.pCount
    })
    expect(peak).toBeGreaterThan(0)
    expect(peak).toBeLessThan(city.pAlive.length * 0.75)
  })

  it('holds a steady state rather than drifting to all-clean or all-dirty', () => {
    const city = createCity()
    run(city, 600)
    let dirty = 0
    for (let i = 0; i < N_FRAMES; i++) if (city.frameState[i] === FRAME_DIRTY) dirty++
    expect(dirty).toBeGreaterThan(0)
    expect(dirty).toBeLessThan(N_FRAMES)
  })
})
