/**
 * Semantic palette for the Postgres city.
 *
 * Ported from PGSimCity (github.com/NikolayS/PGSimCity, `src/core/themes.ts`),
 * which tunes two independent palettes rather than dimming one: a dark set for
 * a night scene where meaning glows against matte structure, and a light set
 * where saturation and value carry meaning under daylight. Reusing the dark
 * values on a light page is the failure mode both sets exist to avoid.
 *
 * A hue names a PostgreSQL mechanism. It is never chosen because it looks
 * good next to its neighbour, and the same hue means the same mechanism
 * everywhere in the scene.
 */

export interface Palette {
  /** Scene backdrop, top and bottom of the sky gradient. */
  skyTop: string
  skyBottom: string
  /** The ground plane the districts stand on, and its survey grid. */
  ground: string
  groundEdge: string
  grid: string
  /** The cut faces of the excavation, and the air below it. */
  pitWall: string
  underground: string

  /* Processes and memory. */
  client: string
  postmaster: string
  backend: string
  shmem: string

  /* Buffer-pool frame states. */
  bufClean: string
  bufDirty: string
  bufPinned: string
  bufFree: string

  /* Durability. */
  wal: string
  walDim: string
  archive: string
  storage: string
  index: string

  /* Maintenance. */
  checkpoint: string
  bgwriter: string
  vacuum: string
  replication: string

  /* Status and type. */
  ok: string
  ink: string
  inkDim: string

  /** Structure faces get their own ramp so meaning stays the only bright thing. */
  matTop: string
  matLeft: string
  matRight: string
  /** Backing plate behind a label, so type never fights the scene under it. */
  plate: string
  /** The flare on a frame a backend just touched. Brighter in both themes —
   *  using the ink colour darkens it in daylight, which reads as a different
   *  page state rather than as a page being used. */
  flash: string
}

/**
 * Night. Structure is matte, meaning is the only thing that emits. Values are
 * PGSimCity's NIGHT_PALETTE unchanged, so a reader who follows the link from
 * here into the full city finds the same colours meaning the same things.
 */
export const NIGHT: Palette = {
  skyTop: '#04060c',
  skyBottom: '#0a1120',
  ground: '#15243c',
  groundEdge: '#3d68a0',
  grid: '#20334f',
  pitWall: '#0b1526',
  underground: '#050810',

  client: '#8ecae6',
  postmaster: '#9db4ff',
  backend: '#5ad1ff',
  shmem: '#7b6cff',

  bufClean: '#3fa7ff',
  bufDirty: '#ff4d6d',
  bufPinned: '#ffd166',
  bufFree: '#1b2740',

  wal: '#ffb03a',
  walDim: '#7a5312',
  archive: '#c9a227',
  storage: '#55d6a0',
  index: '#64ffda',

  checkpoint: '#ff7ac6',
  bgwriter: '#4fe3c1',
  vacuum: '#b57bff',
  replication: '#ff9c1c',

  ok: '#57e389',
  ink: '#e8f1ff',
  inkDim: '#8fa5c4',

  matTop: '#243449',
  matLeft: '#151e2d',
  matRight: '#1b2738',
  plate: 'rgba(4, 8, 16, 0.72)',
  flash: '#ffffff',
}

/**
 * Day. The same call sites, a different rendering model: no glow at all, so
 * hue and lightness have to do the whole job. Values are PGSimCity's
 * DAY_PALETTE, whose closest pair measures ΔE2000 7.0 — daylight separates
 * these meanings more strictly than night does.
 */
export const DAY: Palette = {
  skyTop: '#cfe0ee',
  skyBottom: '#eef2f5',
  ground: '#9c9583',
  groundEdge: '#5f5a4d',
  grid: '#8b8573',
  pitWall: '#6f6a5b',
  underground: '#5f5b4e',

  client: '#5f96c4',
  postmaster: '#6a63d9',
  backend: '#0089b5',
  shmem: '#4b2fd0',

  bufClean: '#1d5fcb',
  bufDirty: '#e02b46',
  bufPinned: '#efbc16',
  bufFree: '#acaeb2',

  wal: '#b8720a',
  walDim: '#8c7444',
  archive: '#7d6018',
  storage: '#17954f',
  index: '#05a47e',

  checkpoint: '#c42d92',
  bgwriter: '#0e8f8c',
  vacuum: '#8b2bc0',
  replication: '#e2690d',

  ok: '#3f9c22',
  ink: '#18222e',
  inkDim: '#5d6b7a',

  matTop: '#e8e5dc',
  matLeft: '#aca697',
  matRight: '#c9c4b7',
  plate: 'rgba(255, 255, 255, 0.82)',
  flash: '#ffffff',
}

export function paletteFor(mode: 'light' | 'dark'): Palette {
  return mode === 'dark' ? NIGHT : DAY
}
