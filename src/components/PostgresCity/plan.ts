/**
 * The city plan.
 *
 * Coordinates are PGSimCity's, unchanged: Y is up, north is -Z, east is +X,
 * one unit is about one metre. Every position below is read from that
 * project's `src/world/layout.ts` ANCHOR table, so this scene is a true
 * projection of the same plan rather than a redrawing of it — the buffer pool
 * really is at the centre, `pg_wal` really is east of it, the standby really
 * is south, and storage really is underneath.
 *
 * What is simplified is population, not geography: 12 backends stand in for
 * however many connections a cluster has, 48 frames for the whole buffer pool,
 * 5 tables for the catalog, 7 silos for `pg_wal`. Those counts are disclosed
 * in the caption, because a reader who counts them would otherwise learn a
 * wrong number.
 *
 * Distance is compressed. The outermost districts — the archive estate and
 * the standby's site — sit closer to the centre than they do in PGSimCity, so
 * the whole cluster fits one frame. The excavation is also wider and the
 * storage layer shallower than that project's: from a camera that cannot move,
 * a deeper pit puts the data directory behind its own near wall and the plaza
 * hides what is left. Direction and ordering are exact; absolute separation is
 * not, and no distance should be read off this scene.
 */

/* --------------------------------------------------------------------------
 * Projection: plan rotated 30° about Y, then flattened by the camera pitch.
 * The rotation is what puts the data path on the reading diagonal — clients
 * top-left, the pool at the centre, the standby bottom-right.
 * ------------------------------------------------------------------------*/

const YAW = Math.PI / 6
const COS_YAW = Math.cos(YAW)
const SIN_YAW = Math.sin(YAW)
/** Camera pitch. 1 would be a plan view; 0 would be an elevation. */
const TILT = 0.52
/** How much a metre of height moves a point up the screen. */
const LIFT = 0.86

export interface Pt {
  x: number
  y: number
}

/** Project a world point into unscaled scene space. Writes into `out`. */
export function project(x: number, y: number, z: number, out: Pt): Pt {
  const rx = x * COS_YAW + z * SIN_YAW
  const rz = -x * SIN_YAW + z * COS_YAW
  out.x = rx
  out.y = rz * TILT - y * LIFT
  return out
}

/** Painter's-algorithm depth. Larger draws later, i.e. nearer the camera. */
export function depth(x: number, z: number): number {
  return -x * SIN_YAW + z * COS_YAW
}

/* --------------------------------------------------------------------------
 * Districts.
 *
 * `blurb` is what a reader gets on hover, focus, and in the text alternative.
 * Each sentence has to be true of PostgreSQL and true of what this scene
 * actually draws; a caption cannot correct a misleading building.
 * ------------------------------------------------------------------------*/

export type DistrictId =
  | 'clients'
  | 'postmaster'
  | 'backends'
  | 'pool'
  | 'wal'
  | 'archive'
  | 'maintenance'
  | 'storage'
  | 'standby'

export interface District {
  id: DistrictId
  label: string
  sub: string
  /** Anchor the label and the hit target hang from, in world space. */
  x: number
  y: number
  z: number
  /** Hit-target radius in scene units. */
  r: number
  /** Where the label sits relative to the anchor, in scene units. */
  lx: number
  ly: number
  accent: string
  blurb: string
}

export const DISTRICTS: readonly District[] = [
  {
    id: 'clients',
    lx: -10,
    ly: -30,
    label: 'CLIENTS',
    sub: 'your application',
    x: 0,
    y: 14,
    z: -300,
    r: 62,
    accent: 'client',
    blurb:
      'Connections arrive from outside the server. Each one is a socket held for the whole session, not a request that comes and goes.',
  },
  {
    id: 'postmaster',
    lx: 68,
    ly: -22,
    label: 'POSTMASTER',
    sub: 'the supervisor',
    x: 0,
    y: 36,
    z: -215,
    r: 42,
    accent: 'postmaster',
    blurb:
      'The supervisor process forks one backend per accepted connection, then steps out of the data path. It never reads or writes your tables itself.',
  },
  {
    id: 'backends',
    lx: -122,
    ly: -26,
    label: 'BACKENDS',
    sub: 'one process per connection',
    x: 0,
    y: 26,
    z: -130,
    r: 120,
    accent: 'backend',
    blurb:
      'One operating-system process serves one connection. It parses, plans and executes your statement, and it is the process that writes WAL for its own transaction.',
  },
  {
    id: 'pool',
    lx: -150,
    ly: 19,
    label: 'BUFFER POOL',
    sub: 'shared_buffers',
    x: 0,
    y: 10,
    z: 0,
    r: 96,
    accent: 'bufClean',
    blurb:
      'Shared memory holding fixed-size page frames. Every read and every write goes through a frame here; a page changed in memory is dirty until something writes it back to storage.',
  },
  {
    id: 'wal',
    lx: 18,
    ly: -46,
    label: 'WAL',
    sub: 'pg_wal',
    x: 168,
    y: 20,
    z: 0,
    r: 64,
    accent: 'wal',
    blurb:
      'The write-ahead log. A change is durable once its WAL record is flushed here — before the changed data page has gone anywhere. That is the rule the whole design rests on.',
  },
  {
    id: 'archive',
    lx: 32,
    ly: -38,
    label: 'ARCHIVE',
    sub: 'completed segments',
    x: 232,
    y: 14,
    z: -66,
    r: 48,
    accent: 'archive',
    blurb:
      'Finished WAL segments are copied off the machine. Together with a base backup they are what makes point-in-time recovery possible.',
  },
  {
    id: 'maintenance',
    lx: -54,
    ly: 32,
    label: 'MAINTENANCE',
    sub: 'checkpointer · bgwriter · autovacuum',
    x: -170,
    y: 18,
    z: 0,
    r: 84,
    accent: 'checkpoint',
    blurb:
      'The checkpointer writes every dirty page at a checkpoint; the background writer trickles some out ahead of it; autovacuum reclaims row versions no transaction can still see.',
  },
  {
    id: 'storage',
    lx: -64,
    ly: 42,
    label: 'STORAGE',
    sub: 'the data directory',
    x: -46,
    y: -34,
    z: 84,
    r: 110,
    accent: 'storage',
    blurb:
      'Heap files and indexes on disk. Memory ends and durable storage begins here, which is why the ground is cut away above it.',
  },
  {
    id: 'standby',
    lx: 24,
    ly: -28,
    label: 'STANDBY',
    sub: 'streaming replica',
    x: 120,
    y: 16,
    z: 258,
    r: 90,
    accent: 'replication',
    blurb:
      'A second server replaying the primary’s WAL as it arrives. Replication ships the log, never the buffer pool, so the replica rebuilds the same pages from the same records.',
  },
]

/* --------------------------------------------------------------------------
 * Structures. A box is (centre x, z), footprint (w, d), base y and height.
 * ------------------------------------------------------------------------*/

export interface Box {
  x: number
  z: number
  w: number
  d: number
  y: number
  h: number
  /** Palette key for the lit top face; absent means matte structure. */
  accent?: string
  /** 0..1 — how much the accent bleeds onto the side faces. */
  glow?: number
  /** 0..1 — how much of the top face the accent takes. A big plane at 1 is a
   *  wash of colour that drowns everything meaningful standing on it. */
  tint?: number
  district: DistrictId
}

export const N_BACKENDS = 12
export const BUF_COLS = 8
export const BUF_ROWS = 6
export const N_FRAMES = BUF_COLS * BUF_ROWS
export const N_WAL_SEGMENTS = 7
export const N_TABLES = 5

/** World Y of the storage layer, and of the kernel cache slab above it. */
export const STORAGE_Y = -52
export const OS_CACHE_Y = -24

export const DECK = { w: 156, d: 124, y: 0, h: 5 }
const BUF_PITCH_X = 17
const BUF_PITCH_Z = 18.5
export const BUF_TILE = 12.5
/**
 * The excavation. The ground is cut away here so the storage layer below is
 * visible, and nothing that stands at ground level may be placed inside it.
 * It runs from under the plaza's southern half out to open ground before the
 * standby's site: the plaza floats over its northern end, and the rest is the
 * cutaway a reader looks down into. A symmetric hole centred on the plaza
 * cannot work from a fixed camera — the plaza would cover the half of the
 * floor that its own near wall did not already hide.
 */
export const PIT = { x0: -124, x1: 108, z0: -30, z1: 180 }

export function backendX(i: number): number {
  const span = 232
  return -span / 2 + (i * span) / (N_BACKENDS - 1)
}

export function frameCentre(i: number, out: { x: number; z: number }): void {
  const col = i % BUF_COLS
  const row = (i / BUF_COLS) | 0
  out.x = -((BUF_COLS - 1) * BUF_PITCH_X) / 2 + col * BUF_PITCH_X
  out.z = -((BUF_ROWS - 1) * BUF_PITCH_Z) / 2 + row * BUF_PITCH_Z
}

/** The standby's own buffer frames: fewer, because it is a smaller claim. */
export const STANDBY = { x: 120, z: 284, cols: 4, rows: 3, pitch: 15, tile: 10.5 }
export const N_STANDBY_FRAMES = STANDBY.cols * STANDBY.rows

export function standbyFrameCentre(i: number, out: { x: number; z: number }): void {
  const col = i % STANDBY.cols
  const row = (i / STANDBY.cols) | 0
  out.x = STANDBY.x - ((STANDBY.cols - 1) * STANDBY.pitch) / 2 + col * STANDBY.pitch
  out.z = STANDBY.z - ((STANDBY.rows - 1) * STANDBY.pitch) / 2 + row * STANDBY.pitch
}

export function walSegmentZ(i: number): number {
  const pitch = 13
  return -((N_WAL_SEGMENTS - 1) * pitch) / 2 + i * pitch
}

export function tableX(i: number): number {
  const pitch = 42
  return -((N_TABLES - 1) * pitch) / 2 + i * pitch
}

/** Static structures, in no particular order; the renderer depth-sorts them. */
export function buildBoxes(): Box[] {
  const boxes: Box[] = []

  // Client terminal, outside the server boundary.
  boxes.push({ x: 0, z: -300, w: 118, d: 30, y: 0, h: 13, district: 'clients' })
  boxes.push({ x: -34, z: -300, w: 20, d: 16, y: 13, h: 6, accent: 'client', glow: 0.5, district: 'clients' })
  boxes.push({ x: 34, z: -300, w: 20, d: 16, y: 13, h: 6, accent: 'client', glow: 0.5, district: 'clients' })

  // Postmaster: one tower on the centre line, alone, because the conduits are
  // forbidden to touch it.
  boxes.push({ x: 0, z: -215, w: 30, d: 26, y: 0, h: 30, district: 'postmaster' })
  boxes.push({ x: 0, z: -215, w: 20, d: 17, y: 30, h: 5, accent: 'postmaster', glow: 0.7, district: 'postmaster' })

  // Backend row. Heights are animated, so only the plinth is static here.
  for (let i = 0; i < N_BACKENDS; i++) {
    boxes.push({ x: backendX(i), z: -130, w: 13, d: 14, y: 0, h: 2, district: 'backends' })
  }

  // The shared-memory deck the buffer pool sits on.
  boxes.push({
    x: 0, z: 0, w: DECK.w, d: DECK.d, y: DECK.y, h: DECK.h,
    accent: 'shmem', glow: 0.3, tint: 0.16, district: 'pool',
  })
  // wal_buffers: shared memory too, at the deck's east edge, where WAL is
  // staged before any of it reaches pg_wal.
  boxes.push({ x: 66, z: 0, w: 14, d: 46, y: DECK.h, h: 9, accent: 'wal', glow: 0.35, district: 'wal' })

  // pg_wal: the segment vault, east.
  boxes.push({ x: 128, z: -34, w: 26, d: 24, y: 0, h: 18, district: 'wal' })
  boxes.push({ x: 168, z: 0, w: 30, d: 104, y: 0, h: 4, district: 'wal' })
  // The walsender: the process that reads pg_wal and ships it south.
  boxes.push({ x: 206, z: 46, w: 22, d: 20, y: 0, h: 16, district: 'standby' })

  // Archive estate, further east and off the server's own ground.
  boxes.push({ x: 200, z: -48, w: 20, d: 18, y: 0, h: 14, district: 'archive' })
  boxes.push({ x: 232, z: -66, w: 40, d: 30, y: 0, h: 9, district: 'archive' })

  // Maintenance yard, west.
  boxes.push({ x: -140, z: -40, w: 30, d: 28, y: 0, h: 22, district: 'maintenance' })
  boxes.push({ x: -140, z: 34, w: 28, d: 26, y: 0, h: 16, district: 'maintenance' })
  boxes.push({ x: -196, z: 0, w: 26, d: 24, y: 0, h: 19, district: 'maintenance' })

  // Standby: its own walreceiver, its own startup process, its own deck. Its
  // buffer frames are drawn from replay state, not placed here.
  boxes.push({ x: 120, z: 212, w: 22, d: 20, y: 0, h: 15, district: 'standby' })
  boxes.push({ x: 120, z: 244, w: 24, d: 22, y: 0, h: 20, district: 'standby' })
  boxes.push({ x: 120, z: 284, w: 74, d: 54, y: 0, h: 3, district: 'standby' })

  return boxes
}

/**
 * Everything below the excavation. Kept separate from the surface because the
 * ground has a hole cut in it and these have to be painted before that hole
 * exists — otherwise the data directory ends up drawn on top of the city it
 * is supposed to be underneath.
 */
export function buildUnderBoxes(): Box[] {
  const boxes: Box[] = []
  /* The data directory floor. It stays inside the excavation, because the
   * only thing making the memory/storage boundary legible is that you are
   * looking down through a hole at it. */
  boxes.push({
    x: (PIT.x0 + PIT.x1) / 2, z: (PIT.z0 + PIT.z1) / 2,
    w: PIT.x1 - PIT.x0 - 8, d: PIT.z1 - PIT.z0 - 8,
    y: STORAGE_Y - 6, h: 6, accent: 'storage', glow: 0.08, tint: 0.06, district: 'storage',
  })
  /* Heap files, then the indexes on them nearer the viewer. Both stand clear
   * of the plaza's footprint, which is the only part of the floor a reader
   * can see down onto. */
  for (let i = 0; i < N_TABLES; i++) {
    boxes.push({ x: tableX(i), z: 84, w: 30, d: 24, y: STORAGE_Y, h: 18, accent: 'storage', glow: 0.45, district: 'storage' })
    boxes.push({ x: tableX(i), z: 118, w: 17, d: 18, y: STORAGE_Y, h: 16, accent: 'index', glow: 0.5, district: 'storage' })
  }
  return boxes
}

/* --------------------------------------------------------------------------
 * Routes. Every animated packet travels one of these; the id names the real
 * mechanism, and the order they fire in is the order PostgreSQL does the work.
 *
 * The connection routes are per backend, not shared. That is not decoration:
 * a PostgreSQL connection is a process and a socket held for the whole
 * session, so it gets its own duct from the client terminal to one backend
 * and keeps it. Sharing one lane between all eight would draw the thing
 * people already wrongly believe — that a statement is handed to whichever
 * worker is free.
 * ------------------------------------------------------------------------*/

export type RouteId =
  | 'conn'
  | 'bufReq'
  | 'pageRead'
  | 'walIns'
  | 'walFlush'
  | 'walFsync'
  | 'ckptSweep'
  | 'bgwSweep'
  | 'pageWrite'
  | 'archiveShip'
  | 'stream'
  | 'replay'
  | 'vacGo'

export interface RouteDef {
  /** Named routes carry their id; per-backend variants carry the family name. */
  id: string
  pts: readonly (readonly [number, number, number])[]
  accent: string
  /** World units per simulated second. */
  speed: number
  /** Draw a faint road under it. */
  road?: boolean
  /** Set on per-backend routes: which backend, and whether the road is a
   *  connection duct that should only appear while that backend exists. */
  backend?: number
  conduit?: boolean
}

const CONDUIT_Y = 7
const TERMINAL_FACE = -286
const BACKEND_FACE = -140
/** No duct may come closer than this to the centre line — the postmaster's. */
const CLEAR_X = 24

/** X of connection duct i where it leaves the client terminal. */
export function conduitX(i: number): number {
  const half = N_BACKENDS / 2
  const inner = 24
  const step = 12
  const west = i < half
  const k = west ? half - 1 - i : i - half
  const x = inner + k * step
  return west ? -x : x
}

const routes: RouteDef[] = []
function addRoute(def: RouteDef): number {
  routes.push(def)
  return routes.length - 1
}

/* --- named routes -------------------------------------------------------- */

const named: Partial<Record<RouteId, number>> = {}
function named_(id: RouteId, def: Omit<RouteDef, 'id'>): void {
  named[id] = addRoute({ id, ...def })
}

/* A new connection walks the arrivals avenue to the postmaster's door. This
 * happens once per connection, not once per statement. */
named_('conn', {
  accent: 'client',
  speed: 170,
  road: true,
  pts: [
    [0, 2, -282],
    [0, 2, -252],
    [0, 2, -224],
  ],
})

named_('bufReq', {
  accent: 'backend',
  speed: 300,
  road: true,
  pts: [
    [0, 10, -122],
    [0, 11, -80],
    [0, 8, -46],
  ],
})

named_('pageRead', {
  accent: 'storage',
  speed: 220,
  road: true,
  pts: [
    [-34, STORAGE_Y + 20, 80],
    [-22, OS_CACHE_Y, 42],
    [-12, 6, 2],
  ],
})

named_('walIns', {
  accent: 'wal',
  speed: 360,
  road: true,
  pts: [
    [16, 11, -126],
    [48, 14, -76],
    [64, 11, -26],
    [66, 10, -4],
  ],
})

named_('walFlush', {
  accent: 'wal',
  speed: 330,
  road: true,
  pts: [
    [68, 10, -8],
    [104, 12, -28],
    [128, 11, -34],
    [160, 8, -18],
    [168, 6, -4],
  ],
})

/* fsync: the record reaches durable media. Commit waits for this, and for
 * nothing downstream of it. */
named_('walFsync', {
  accent: 'wal',
  speed: 250,
  pts: [
    [168, 4, 14],
    [150, -18, 54],
    [98, STORAGE_Y + 14, 92],
  ],
})

named_('ckptSweep', {
  accent: 'checkpoint',
  speed: 230,
  road: true,
  pts: [
    [-124, 12, -40],
    [-92, 10, -26],
    [-52, 8, -10],
  ],
})

named_('bgwSweep', {
  accent: 'bgwriter',
  speed: 230,
  road: true,
  pts: [
    [-124, 10, 34],
    [-92, 9, 26],
    [-52, 8, 14],
  ],
})

named_('pageWrite', {
  accent: 'bufDirty',
  speed: 200,
  road: true,
  pts: [
    [10, 6, 10],
    [8, OS_CACHE_Y, 48],
    [6, STORAGE_Y + 20, 84],
  ],
})

named_('archiveShip', {
  accent: 'archive',
  speed: 240,
  road: true,
  pts: [
    [176, 8, -34],
    [200, 9, -48],
    [232, 8, -64],
  ],
})

named_('stream', {
  accent: 'replication',
  speed: 320,
  road: true,
  pts: [
    [178, 7, 26],
    [206, 8, 46],
    [200, 3, 110],
    [166, 3, 166],
    [126, 6, 202],
  ],
})

named_('replay', {
  accent: 'replication',
  speed: 220,
  pts: [
    [120, 9, 224],
    [120, 10, 244],
    [120, 7, 268],
  ],
})

named_('vacGo', {
  accent: 'vacuum',
  speed: 150,
  road: true,
  pts: [
    [-186, 8, 6],
    [-156, -12, 40],
    [-122, STORAGE_Y + 20, 76],
    [-88, STORAGE_Y + 20, 84],
  ],
})

/* --- per-backend routes -------------------------------------------------- */

const forkRoutes = new Int16Array(N_BACKENDS)
const queryRoutes = new Int16Array(N_BACKENDS)
const resultRoutes = new Int16Array(N_BACKENDS)

for (let i = 0; i < N_BACKENDS; i++) {
  const bx = backendX(i)
  const cx = conduitX(i)
  /* Hold the duct out of the postmaster's avenue while it crosses the yard. */
  const raw = cx + (bx - cx) * 0.3
  const mx = Math.abs(raw) < CLEAR_X ? Math.sign(raw || 1) * CLEAR_X : raw

  forkRoutes[i] = addRoute({
    id: 'fork',
    accent: 'postmaster',
    speed: 260,
    backend: i,
    pts: [
      [0, 3, -202],
      [bx * 0.35, 3, -178],
      [bx * 0.8, 3, -154],
      [bx, 5, BACKEND_FACE],
    ],
  })

  queryRoutes[i] = addRoute({
    id: 'query',
    accent: 'client',
    speed: 340,
    road: true,
    conduit: true,
    backend: i,
    pts: [
      [cx, CONDUIT_Y, TERMINAL_FACE],
      [cx, CONDUIT_Y, -250],
      [mx, CONDUIT_Y, -212],
      [bx, CONDUIT_Y, -168],
      [bx, CONDUIT_Y, BACKEND_FACE],
    ],
  })

  resultRoutes[i] = addRoute({
    id: 'result',
    accent: 'ok',
    speed: 370,
    backend: i,
    pts: [
      [bx + 3, CONDUIT_Y, BACKEND_FACE],
      [bx + 3, CONDUIT_Y, -168],
      [mx + 3, CONDUIT_Y, -212],
      [cx + 3, CONDUIT_Y, -250],
      [cx + 3, CONDUIT_Y, TERMINAL_FACE],
    ],
  })
}

export const ROUTES: readonly RouteDef[] = routes
export function routeOf(id: RouteId): number {
  return named[id] as number
}
export function forkRoute(i: number): number {
  return forkRoutes[i]
}
export function queryRoute(i: number): number {
  return queryRoutes[i]
}
export function resultRoute(i: number): number {
  return resultRoutes[i]
}
