/**
 * The plan makes factual claims about a PostgreSQL cluster, and a drawing can
 * teach a falsehood more persuasively than the caption next to it can teach
 * the truth. These assert the claims that the geometry itself is making.
 *
 * Run with `bun test`.
 */

import { describe, expect, it } from 'bun:test'
import {
  DECK,
  DISTRICTS,
  N_BACKENDS,
  N_FRAMES,
  PIT,
  ROUTES,
  STORAGE_Y,
  backendX,
  buildBoxes,
  buildUnderBoxes,
  conduitX,
  depth,
  forkRoute,
  frameCentre,
  project,
  queryRoute,
  resultRoute,
  routeOf,
  type Box,
} from './plan'

function overlaps(a0: number, a1: number, b0: number, b1: number): boolean {
  return a0 < b1 && b0 < a1
}

function footprint(b: Box): [number, number, number, number] {
  return [b.x - b.w / 2, b.x + b.w / 2, b.z - b.d / 2, b.z + b.d / 2]
}

describe('the excavation', () => {
  it('has no unsupported structure standing over the hole', () => {
    /* A building at grade inside the pit has nothing under it. The two legal
     * exceptions are the plaza itself, which is meant to hang over the cut,
     * and anything standing on the plaza — wal_buffers is shared memory and
     * belongs up there with the pool.
     *
     * This has broken twice: once when the excavation grew wide enough to
     * swallow the entire backend row, and once when wal_buffers sat just off
     * the deck's east edge with the pit underneath it. */
    const onDeck = (b: Box): boolean => {
      const [x0, x1, z0, z1] = footprint(b)
      return (
        x0 >= -DECK.w / 2 && x1 <= DECK.w / 2 && z0 >= -DECK.d / 2 && z1 <= DECK.d / 2
      )
    }
    const offenders = buildBoxes()
      .filter((b) => b.y < 6 && b.district !== 'pool' && !onDeck(b))
      .filter((b) => {
        const [x0, x1, z0, z1] = footprint(b)
        return overlaps(x0, x1, PIT.x0, PIT.x1) && overlaps(z0, z1, PIT.z0, PIT.z1)
      })
      .map((b) => `${b.district}@(${b.x},${b.z})`)
    expect(offenders).toEqual([])
  })

  it('puts every part of the data directory below ground', () => {
    for (const b of buildUnderBoxes()) {
      expect(b.y + b.h).toBeLessThanOrEqual(0)
    }
  })

  it('keeps the data directory inside the hole, where it can be seen', () => {
    for (const b of buildUnderBoxes()) {
      const [x0, x1, z0, z1] = footprint(b)
      expect(x0).toBeGreaterThanOrEqual(PIT.x0)
      expect(x1).toBeLessThanOrEqual(PIT.x1)
      expect(z0).toBeGreaterThanOrEqual(PIT.z0)
      expect(z1).toBeLessThanOrEqual(PIT.z1)
    }
  })

  it('floats the buffer pool over the excavation rather than beside it', () => {
    /* The plaza hanging over the cut is the whole reason a reader can see
     * that memory is above and storage is below. */
    expect(overlaps(-DECK.w / 2, DECK.w / 2, PIT.x0, PIT.x1)).toBe(true)
    expect(overlaps(-DECK.d / 2, DECK.d / 2, PIT.z0, PIT.z1)).toBe(true)
  })

  it('draws storage lower on screen than the memory above it', () => {
    const deck = { x: 0, y: DECK.h, z: 0 }
    const heap = buildUnderBoxes().find((b) => b.accent === 'storage' && b.h > 6)
    expect(heap).toBeDefined()
    const a = project(deck.x, deck.y, deck.z, { x: 0, y: 0 })
    const b = project(heap!.x, heap!.y + heap!.h, heap!.z, { x: 0, y: 0 })
    expect(b.y).toBeGreaterThan(a.y)
  })
})

describe('the plan', () => {
  it('keeps PostgreSQL’s compass: WAL east, maintenance west, standby south', () => {
    const by = (id: string) => DISTRICTS.find((d) => d.id === id)!
    expect(by('wal').x).toBeGreaterThan(0)
    expect(by('maintenance').x).toBeLessThan(0)
    expect(by('standby').z).toBeGreaterThan(0)
    expect(by('clients').z).toBeLessThan(0)
    /* The archive is downstream of pg_wal, further from the server. */
    expect(by('archive').x).toBeGreaterThan(by('wal').x)
    /* Storage is the only district below grade. */
    expect(by('storage').y).toBeLessThan(0)
  })

  it('puts the client further from the pool than the backends are', () => {
    const by = (id: string) => DISTRICTS.find((d) => d.id === id)!
    expect(Math.abs(by('clients').z)).toBeGreaterThan(Math.abs(by('backends').z))
    expect(Math.abs(by('backends').z)).toBeGreaterThan(Math.abs(by('pool').z))
  })

  it('gives every district a structure to name', () => {
    const drawn = new Set(buildBoxes().concat(buildUnderBoxes()).map((b) => b.district))
    for (const d of DISTRICTS) {
      expect(drawn.has(d.id)).toBe(true)
    }
  })

  it('names the excavation depth consistently', () => {
    expect(STORAGE_Y).toBeLessThan(0)
    for (const b of buildUnderBoxes()) expect(b.y).toBeLessThanOrEqual(STORAGE_Y)
  })
})

describe('connections', () => {
  it('gives each backend its own duct, never a shared lane', () => {
    /* One process per connection is the single most misunderstood thing about
     * PostgreSQL. If two backends shared a route, the drawing would be making
     * the wrong claim. */
    const q = new Set<number>()
    const r = new Set<number>()
    const f = new Set<number>()
    for (let i = 0; i < N_BACKENDS; i++) {
      q.add(queryRoute(i))
      r.add(resultRoute(i))
      f.add(forkRoute(i))
    }
    expect(q.size).toBe(N_BACKENDS)
    expect(r.size).toBe(N_BACKENDS)
    expect(f.size).toBe(N_BACKENDS)
  })

  it('keeps the ducts out of the postmaster’s avenue', () => {
    /* The postmaster forks a backend and then leaves the data path. No
     * connection may be drawn touching it. */
    for (let i = 0; i < N_BACKENDS; i++) {
      const pts = ROUTES[queryRoute(i)].pts
      for (const [x, , z] of pts) {
        if (z < -200 && z > -260) expect(Math.abs(x)).toBeGreaterThanOrEqual(24)
      }
    }
  })

  it('lands each duct on the backend it belongs to', () => {
    for (let i = 0; i < N_BACKENDS; i++) {
      const pts = ROUTES[queryRoute(i)].pts
      expect(pts[0][0]).toBeCloseTo(conduitX(i), 5)
      expect(pts[pts.length - 1][0]).toBeCloseTo(backendX(i), 5)
    }
  })
})

describe('routes', () => {
  it('are all well formed and have length', () => {
    for (const r of ROUTES) {
      expect(r.pts.length).toBeGreaterThanOrEqual(2)
      let len = 0
      for (let i = 1; i < r.pts.length; i++) {
        const a = r.pts[i - 1]
        const b = r.pts[i]
        len += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])
      }
      expect(len).toBeGreaterThan(0)
      expect(r.speed).toBeGreaterThan(0)
    }
  })

  it('sends the write-ahead log to durable storage, not the pool', () => {
    /* wal.fsync must descend. A flat or rising route would draw a commit that
     * never left memory. */
    const pts = ROUTES[routeOf('walFsync')].pts
    expect(pts[pts.length - 1][1]).toBeLessThan(pts[0][1])
    expect(pts[pts.length - 1][1]).toBeLessThanOrEqual(STORAGE_Y + 20)
  })

  it('reads pages up out of storage and writes them back down', () => {
    const read = ROUTES[routeOf('pageRead')].pts
    expect(read[0][1]).toBeLessThan(read[read.length - 1][1])
    const write = ROUTES[routeOf('pageWrite')].pts
    expect(write[0][1]).toBeGreaterThan(write[write.length - 1][1])
  })

  it('routes WAL through wal_buffers before pg_wal', () => {
    /* A record is staged in shared memory first; it is not written straight
     * to the segment by the backend that produced it. */
    const ins = ROUTES[routeOf('walIns')].pts
    const flush = ROUTES[routeOf('walFlush')].pts
    const insEnd = ins[ins.length - 1]
    expect(Math.abs(insEnd[0] - flush[0][0])).toBeLessThan(12)
    expect(Math.abs(insEnd[2] - flush[0][2])).toBeLessThan(12)
    /* And it ends up east of where it started. */
    expect(flush[flush.length - 1][0]).toBeGreaterThan(ins[0][0])
  })

  it('streams to the standby from pg_wal, never from the buffer pool', () => {
    const stream = ROUTES[routeOf('stream')].pts
    expect(stream[0][0]).toBeGreaterThan(140)
    expect(stream[stream.length - 1][2]).toBeGreaterThan(120)
  })
})

describe('projection', () => {
  it('is a consistent depth ordering: south and west are nearer', () => {
    expect(depth(0, 100)).toBeGreaterThan(depth(0, -100))
    expect(depth(-100, 0)).toBeGreaterThan(depth(100, 0))
  })

  it('lifts height up the screen', () => {
    const low = project(0, 0, 0, { x: 0, y: 0 })
    const high = project(0, 40, 0, { x: 0, y: 0 })
    expect(high.y).toBeLessThan(low.y)
  })
})

describe('the buffer pool grid', () => {
  it('lays every frame on the deck', () => {
    const c = { x: 0, z: 0 }
    for (let i = 0; i < N_FRAMES; i++) {
      frameCentre(i, c)
      expect(Math.abs(c.x)).toBeLessThan(DECK.w / 2)
      expect(Math.abs(c.z)).toBeLessThan(DECK.d / 2)
    }
  })

  it('gives every frame a distinct position', () => {
    const seen = new Set<string>()
    const c = { x: 0, z: 0 }
    for (let i = 0; i < N_FRAMES; i++) {
      frameCentre(i, c)
      seen.add(`${c.x.toFixed(3)},${c.z.toFixed(3)}`)
    }
    expect(seen.size).toBe(N_FRAMES)
  })
})
