/**
 * Colour is semantic here: a hue names a PostgreSQL mechanism. These check
 * that the two palettes stay a translation of each other rather than drifting
 * into two different vocabularies, and that neither one hides a meaning it is
 * supposed to carry.
 *
 * Run with `bun test`.
 */

import { describe, expect, it } from 'bun:test'
import { DAY, NIGHT, paletteFor, type Palette } from './palette'

/** CIE L*a*b*, D65. Perceptual distance is the right instrument here: these
 *  palettes separate meanings by hue at deliberately matched lightness, so a
 *  luminance-only floor would condemn a set that reads perfectly well. */
function lab(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number): number => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const r = f((n >> 16) & 255)
  const g = f((n >> 8) & 255)
  const b = f(n & 255)
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
  const k = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const [fx, fy, fz] = [k(X), k(Y), k(Z)]
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

function deltaE(a: string, b: string): number {
  const A = lab(a)
  const B = lab(b)
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2])
}

/** Relative luminance, WCAG's definition. */
function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return NaN
  const n = parseInt(m[1], 16)
  const lin = (c: number): number => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}

function hue(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  let h: number
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return (h * 60 + 360) % 360
}

/** Shortest distance around the colour wheel, in degrees. */
function hueGap(a: string, b: string): number {
  const d = Math.abs(hue(a) - hue(b)) % 360
  return d > 180 ? 360 - d : d
}

function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

/** The mechanisms whose colour is doing the teaching. */
const MEANINGS: (keyof Palette)[] = [
  'client',
  'postmaster',
  'backend',
  'shmem',
  'bufClean',
  'bufDirty',
  'bufPinned',
  'wal',
  'archive',
  'storage',
  'index',
  'checkpoint',
  'bgwriter',
  'vacuum',
  'replication',
  'ok',
]

describe('the two palettes', () => {
  it('name exactly the same things', () => {
    expect(Object.keys(NIGHT).sort()).toEqual(Object.keys(DAY).sort())
  })

  it('are chosen for their own background, not one dimmed for both', () => {
    /* Reusing night values on a light page is the failure both sets exist to
     * avoid; if any meaning were identical in both, that is what happened. */
    const shared = MEANINGS.filter((k) => NIGHT[k] === DAY[k])
    expect(shared).toEqual([])
  })

  it('resolve by theme', () => {
    expect(paletteFor('dark')).toBe(NIGHT)
    expect(paletteFor('light')).toBe(DAY)
  })
})

describe('legibility', () => {
  /*
   * Floors, not aspirations. Each is set just under what the palettes
   * inherited from PGSimCity actually measure, so the test cannot be
   * satisfied by a set that has quietly got worse:
   *
   *   night — closest meanings index/bgwriter, ΔE76 9.6
   *   day   — closest meanings client/backend,  ΔE76 12.2
   *   both  — every meaning is ≥ 36 from the ground it stands on
   */
  const MEANING_FLOOR = 9
  const SURFACE_FLOOR = 25

  for (const [name, pal] of [
    ['night', NIGHT],
    ['day', DAY],
  ] as [string, Palette][]) {
    it(`keeps every meaning distinct from every other in ${name}`, () => {
      const tight: string[] = []
      for (let i = 0; i < MEANINGS.length; i++) {
        for (let j = i + 1; j < MEANINGS.length; j++) {
          const d = deltaE(pal[MEANINGS[i]], pal[MEANINGS[j]])
          if (d < MEANING_FLOOR) tight.push(`${MEANINGS[i]}/${MEANINGS[j]}:${d.toFixed(1)}`)
        }
      }
      expect(tight).toEqual([])
    })

    it(`keeps every meaning off the surfaces it is painted on in ${name}`, () => {
      /* A mechanism that sinks into the ground or into the matte structure it
       * stands on has stopped carrying its meaning, whatever its hue is. */
      const lost: string[] = []
      for (const k of MEANINGS) {
        for (const surface of ['ground', 'matTop', 'skyTop'] as (keyof Palette)[]) {
          const d = deltaE(pal[k], pal[surface])
          if (d < SURFACE_FLOOR) lost.push(`${k} on ${surface}:${d.toFixed(1)}`)
        }
      }
      expect(lost).toEqual([])
    })
  }

  it('keeps label ink readable in both themes', () => {
    /* The plates are translucent over an unknown scene, so measure against
     * the opaque extremes they sit between. */
    expect(contrast(NIGHT.ink, NIGHT.skyTop)).toBeGreaterThan(7)
    expect(contrast(DAY.ink, '#ffffff')).toBeGreaterThan(7)
  })

  it('separates clean pages from dirty ones by hue, in both themes', () => {
    /* Clean and dirty are the pool's whole vocabulary, and they are separated
     * on the colour wheel rather than by lightness: both palettes put them
     * about 140° apart at closely matched luminance. That is deliberate — the
     * pool must not read as a brightness gradient — but it means colour alone
     * carries no information on a monochrome display or to a reader with a
     * colour-vision deficiency, which is why `drawPool` also raises dirty
     * frames above the deck. If that redundant channel is ever removed, this
     * test is the record of why it was there. */
    for (const pal of [NIGHT, DAY]) {
      expect(hueGap(pal.bufClean, pal.bufDirty)).toBeGreaterThan(90)
      expect(contrast(pal.bufClean, pal.bufDirty)).toBeLessThan(1.6)
    }
  })
})
