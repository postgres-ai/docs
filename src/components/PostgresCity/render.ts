/**
 * Canvas painter for the Postgres city.
 *
 * Everything screen-space is computed once, in `buildScene`, and reused: the
 * per-frame path only reads simulation state and paints. Nothing in `draw`
 * allocates, because a hero animation that makes garbage on a phone is a
 * hero animation that stutters on a phone.
 *
 * Only meaning is allowed to be bright. Structure is painted from the
 * palette's three matte faces; a district gets a lit face when its state
 * means something, and a particle glows because it is carrying data.
 */

import type { Palette } from './palette'
import {
  BUF_TILE,
  DECK,
  DISTRICTS,
  N_BACKENDS,
  N_FRAMES,
  N_TABLES,
  N_WAL_SEGMENTS,
  OS_CACHE_Y,
  PIT,
  ROUTES,
  STORAGE_Y,
  N_STANDBY_FRAMES,
  STANDBY,
  backendX,
  buildBoxes,
  buildUnderBoxes,
  depth,
  frameCentre,
  project,
  standbyFrameCentre,
  tableX,
  walSegmentZ,
  type Box,
  type DistrictId,
  type Pt,
} from './plan'
import {
  BE_COMMIT_WAIT,
  BE_IDLE,
  BE_IO_WAIT,
  CONN_NONE,
  CONN_OPEN,
  FRAME_CLEAN,
  FRAME_DIRTY,
  PK_HEAVY,
  type City,
} from './sim'

const MONO =
  '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'

/** Look a semantic colour up by name. The plan stores names, not values, so a
 *  district cannot drift out of step with the palette it is painted from. */
function accent(pal: Palette, key: string | undefined): string {
  return (key && (pal as unknown as Record<string, string>)[key]) || pal.ink
}

/* --------------------------------------------------------------------------
 * Static scene: everything that depends on geometry but not on state.
 * ------------------------------------------------------------------------*/

interface SceneBox {
  top: Float32Array
  left: Float32Array
  right: Float32Array
  d: number
  accent?: string
  glow: number
  tint: number
  district: DistrictId
}

export interface Scene {
  boxes: SceneBox[]
  /** Painted before the ground, so the hole in the ground reveals them. */
  under: SceneBox[]
  /** The two inner faces of the excavation you can actually see into. */
  pitWallN: Float32Array
  pitWallE: Float32Array
  deckShadow: Float32Array
  /** Survey lines on the ground plane, so the plane reads as a surface. */
  grid: Float32Array
  standbyTiles: Float32Array
  standbyOrder: Int16Array
  /** Buffer-pool frames, back to front. */
  tileOrder: Int16Array
  tiles: Float32Array
  /** Storage-side anchor of each table, for marking autovacuum's target. */
  tables: Float32Array
  /** Ground plane outline and the excavation cut through it. */
  ground: Float32Array
  pit: Float32Array
  /** Route polylines in scene space, with the world-space arclength fraction
   *  at each vertex so a particle's progress maps exactly. */
  routePts: Float32Array[]
  routeFrac: Float32Array[]
  /** District anchors, and where their labels sit. */
  anchors: Float32Array
  labels: Float32Array
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
}

const scratch: Pt = { x: 0, y: 0 }

function quad(
  out: Float32Array,
  o: number,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  cx: number,
  cy: number,
  cz: number,
  dx: number,
  dy: number,
  dz: number,
): void {
  project(ax, ay, az, scratch)
  out[o] = scratch.x
  out[o + 1] = scratch.y
  project(bx, by, bz, scratch)
  out[o + 2] = scratch.x
  out[o + 3] = scratch.y
  project(cx, cy, cz, scratch)
  out[o + 4] = scratch.x
  out[o + 5] = scratch.y
  project(dx, dy, dz, scratch)
  out[o + 6] = scratch.x
  out[o + 7] = scratch.y
}

/**
 * Build the three visible faces of a box. With the plan rotated 30°, the
 * faces that face the camera are the south (+z) and west (-x) ones; they land
 * on the right and the left of the silhouette respectively.
 */
function boxFaces(b: Box): SceneBox {
  const x0 = b.x - b.w / 2
  const x1 = b.x + b.w / 2
  const z0 = b.z - b.d / 2
  const z1 = b.z + b.d / 2
  const yb = b.y
  const yt = b.y + b.h

  const top = new Float32Array(8)
  quad(top, 0, x0, yt, z0, x1, yt, z0, x1, yt, z1, x0, yt, z1)

  const right = new Float32Array(8)
  quad(right, 0, x0, yt, z1, x1, yt, z1, x1, yb, z1, x0, yb, z1)

  const left = new Float32Array(8)
  quad(left, 0, x0, yt, z0, x0, yt, z1, x0, yb, z1, x0, yb, z0)

  return {
    top,
    left,
    right,
    d: depth(b.x, b.z) + b.y * 0.001,
    accent: b.accent,
    glow: b.glow ?? 0,
    tint: b.tint ?? 1,
    district: b.district,
  }
}

export function buildScene(): Scene {
  const boxes = buildBoxes().map(boxFaces)
  boxes.sort((a, b) => a.d - b.d)
  const under = buildUnderBoxes().map(boxFaces)
  under.sort((a, b) => a.d - b.d)

  /* Buffer frames: eight faces each would be noise at this size, so a frame is
   * a flat plate on the deck whose colour is its state. */
  const tiles = new Float32Array(N_FRAMES * 8)
  const tileDepth = new Float32Array(N_FRAMES)
  const c = { x: 0, z: 0 }
  for (let i = 0; i < N_FRAMES; i++) {
    frameCentre(i, c)
    const h = BUF_TILE / 2
    quad(
      tiles,
      i * 8,
      c.x - h, DECK.h + 0.6, c.z - h,
      c.x + h, DECK.h + 0.6, c.z - h,
      c.x + h, DECK.h + 0.6, c.z + h,
      c.x - h, DECK.h + 0.6, c.z + h,
    )
    tileDepth[i] = depth(c.x, c.z)
  }
  const tileOrder = new Int16Array(N_FRAMES)
  for (let i = 0; i < N_FRAMES; i++) tileOrder[i] = i
  tileOrder.sort((a, b) => tileDepth[a] - tileDepth[b])

  const tables = new Float32Array(N_TABLES * 2)
  for (let i = 0; i < N_TABLES; i++) {
    project(tableX(i), STORAGE_Y + 18, 84, scratch)
    tables[i * 2] = scratch.x
    tables[i * 2 + 1] = scratch.y
  }

  /* The ground plane, and the rectangle cut out of it so the storage layer
   * below is visible. The plaza floats over that hole. */
  const G = 470
  const ground = new Float32Array(8)
  quad(ground, 0, -G, 0, -G, G, 0, -G, G, 0, G, -G, 0, G)
  const pit = new Float32Array(8)
  quad(pit, 0, PIT.x0, 0, PIT.z0, PIT.x1, 0, PIT.z0, PIT.x1, 0, PIT.z1, PIT.x0, 0, PIT.z1)

  /* Looking down into a hole, the faces you see are its far ones: the north
   * wall and the east wall. Without them the excavation reads as a painted
   * rectangle instead of a cut. */
  const pitWallN = new Float32Array(8)
  quad(
    pitWallN, 0,
    PIT.x0, 0, PIT.z0,
    PIT.x1, 0, PIT.z0,
    PIT.x1, STORAGE_Y - 6, PIT.z0,
    PIT.x0, STORAGE_Y - 6, PIT.z0,
  )
  const pitWallE = new Float32Array(8)
  quad(
    pitWallE, 0,
    PIT.x1, 0, PIT.z0,
    PIT.x1, 0, PIT.z1,
    PIT.x1, STORAGE_Y - 6, PIT.z1,
    PIT.x1, STORAGE_Y - 6, PIT.z0,
  )

  const deckShadow = new Float32Array(8)
  quad(
    deckShadow, 0,
    -DECK.w / 2, OS_CACHE_Y, -DECK.d / 2,
    DECK.w / 2, OS_CACHE_Y, -DECK.d / 2,
    DECK.w / 2, OS_CACHE_Y, DECK.d / 2,
    -DECK.w / 2, OS_CACHE_Y, DECK.d / 2,
  )

  /* A survey grid on the ground. Flat colour at this size reads as a void;
   * the lines are what make it a surface with the city standing on it. */
  const GRID_STEP = 50
  const gridLines: number[] = []
  for (let g = -G; g <= G; g += GRID_STEP) {
    project(g, 0, -G, scratch)
    gridLines.push(scratch.x, scratch.y)
    project(g, 0, G, scratch)
    gridLines.push(scratch.x, scratch.y)
    project(-G, 0, g, scratch)
    gridLines.push(scratch.x, scratch.y)
    project(G, 0, g, scratch)
    gridLines.push(scratch.x, scratch.y)
  }
  const grid = new Float32Array(gridLines)

  /* The standby's own frames. It rebuilds these from the log it receives, so
   * they are drawn in the same page colours as the primary's pool. */
  const standbyTiles = new Float32Array(N_STANDBY_FRAMES * 8)
  const standbyDepth = new Float32Array(N_STANDBY_FRAMES)
  for (let i = 0; i < N_STANDBY_FRAMES; i++) {
    standbyFrameCentre(i, c)
    const h = STANDBY.tile / 2
    quad(
      standbyTiles,
      i * 8,
      c.x - h, 3.6, c.z - h,
      c.x + h, 3.6, c.z - h,
      c.x + h, 3.6, c.z + h,
      c.x - h, 3.6, c.z + h,
    )
    standbyDepth[i] = depth(c.x, c.z)
  }
  const standbyOrder = new Int16Array(N_STANDBY_FRAMES)
  for (let i = 0; i < N_STANDBY_FRAMES; i++) standbyOrder[i] = i
  standbyOrder.sort((a, b) => standbyDepth[a] - standbyDepth[b])

  /* Routes: scene-space vertices plus the world-space arclength fraction at
   * each, so a particle at t maps onto the same physical point regardless of
   * how the projection stretches a leg. */
  const routePts: Float32Array[] = []
  const routeFrac: Float32Array[] = []
  for (const r of ROUTES) {
    const n = r.pts.length
    const pts = new Float32Array(n * 2)
    const frac = new Float32Array(n)
    let total = 0
    for (let i = 0; i < n; i++) {
      const p = r.pts[i]
      project(p[0], p[1], p[2], scratch)
      pts[i * 2] = scratch.x
      pts[i * 2 + 1] = scratch.y
      if (i > 0) {
        const q = r.pts[i - 1]
        total += Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])
      }
      frac[i] = total
    }
    for (let i = 0; i < n; i++) frac[i] = total > 0 ? frac[i] / total : i / (n - 1)
    routePts.push(pts)
    routeFrac.push(frac)
  }

  const anchors = new Float32Array(DISTRICTS.length * 2)
  const labels = new Float32Array(DISTRICTS.length * 2)
  DISTRICTS.forEach((d, i) => {
    project(d.x, d.y, d.z, scratch)
    anchors[i * 2] = scratch.x
    anchors[i * 2 + 1] = scratch.y
    labels[i * 2] = scratch.x + d.lx
    labels[i * 2 + 1] = scratch.y + d.ly
  })

  /* Fit to whatever the structures and labels actually occupy. */
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const consider = (x: number, y: number): void => {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  for (const b of boxes.concat(under)) {
    for (const face of [b.top, b.left, b.right]) {
      for (let i = 0; i < 8; i += 2) consider(face[i], face[i + 1])
    }
  }
  /* Reserve the plate around each label anchor. Fitting to the bare point
   * clips the topmost label off the frame. */
  const LABEL_PAD_X = 52
  const LABEL_PAD_Y = 26
  for (let i = 0; i < labels.length; i += 2) {
    consider(labels[i] - LABEL_PAD_X, labels[i + 1] - LABEL_PAD_Y)
    consider(labels[i] + LABEL_PAD_X, labels[i + 1] + LABEL_PAD_Y)
  }

  return {
    boxes,
    under,
    pitWallN,
    pitWallE,
    deckShadow,
    grid,
    standbyTiles,
    standbyOrder,
    tileOrder,
    tiles,
    tables,
    ground,
    pit,
    routePts,
    routeFrac,
    anchors,
    labels,
    bounds: { minX, minY, maxX, maxY },
  }
}

/* --------------------------------------------------------------------------
 * Painting.
 * ------------------------------------------------------------------------*/

export interface View {
  /** Scale and offset from scene space to device pixels. */
  s: number
  ox: number
  oy: number
  /** Device pixels. */
  w: number
  h: number
  /** CSS pixels, which is what type size and the compact cutover key off. */
  cssW: number
  cssH: number
  dpr: number
  /** Below this width the scene drops its secondary labels. */
  compact: boolean
}

export function fitView(scene: Scene, cssW: number, cssH: number, dpr: number): View {
  const w = cssW * dpr
  const h = cssH * dpr
  const b = scene.bounds
  const padX = (cssW < 560 ? 14 : 30) * dpr
  const padTop = 30 * dpr
  /* The explanation strip overlays the bottom of the canvas; the scene has to
   * end above it or a district label ends up underneath the prose. */
  const padBottom = 62 * dpr
  const sw = b.maxX - b.minX
  const sh = b.maxY - b.minY
  const s = Math.min((w - padX * 2) / sw, (h - padTop - padBottom) / sh)
  return {
    s,
    ox: w / 2 - ((b.minX + b.maxX) / 2) * s,
    oy: (padTop + (h - padBottom)) / 2 - ((b.minY + b.maxY) / 2) * s,
    w,
    h,
    cssW,
    cssH,
    dpr,
    compact: cssW < 620,
  }
}

/** Append a quad as a subpath. The caller owns `beginPath`, because the
 *  ground needs two subpaths in one path to cut the excavation out of it. */
function subPoly(ctx: CanvasRenderingContext2D, p: Float32Array, o: number, v: View): void {
  ctx.moveTo(p[o] * v.s + v.ox, p[o + 1] * v.s + v.oy)
  ctx.lineTo(p[o + 2] * v.s + v.ox, p[o + 3] * v.s + v.oy)
  ctx.lineTo(p[o + 4] * v.s + v.ox, p[o + 5] * v.s + v.oy)
  ctx.lineTo(p[o + 6] * v.s + v.ox, p[o + 7] * v.s + v.oy)
  ctx.closePath()
}

function poly(ctx: CanvasRenderingContext2D, p: Float32Array, o: number, v: View): void {
  ctx.beginPath()
  subPoly(ctx, p, o, v)
}

/** Cheap tint: mix a colour toward a target by `k` using globalAlpha layers. */
function fillQuad(
  ctx: CanvasRenderingContext2D,
  p: Float32Array,
  o: number,
  v: View,
  color: string,
  alpha = 1,
): void {
  poly(ctx, p, o, v)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.fill()
  ctx.globalAlpha = 1
}

/** A tower: four corners of a footprint extruded to `h`, drawn in place. */
function tower(
  ctx: CanvasRenderingContext2D,
  v: View,
  pal: Palette,
  cx: number,
  cz: number,
  w: number,
  d: number,
  y0: number,
  h: number,
  accent: string,
  lit: number,
): void {
  const x0 = cx - w / 2
  const x1 = cx + w / 2
  const z0 = cz - d / 2
  const z1 = cz + d / 2
  const yt = y0 + h

  const buf = towerBuf
  quad(buf, 0, x0, yt, z0, x1, yt, z0, x1, yt, z1, x0, yt, z1)
  quad(buf, 8, x0, yt, z1, x1, yt, z1, x1, y0, z1, x0, y0, z1)
  quad(buf, 16, x0, yt, z0, x0, yt, z1, x0, y0, z1, x0, y0, z0)

  fillQuad(ctx, buf, 16, v, pal.matLeft)
  fillQuad(ctx, buf, 8, v, pal.matRight)
  if (lit > 0) {
    fillQuad(ctx, buf, 8, v, accent, lit * 0.45)
    fillQuad(ctx, buf, 16, v, accent, lit * 0.28)
  }
  fillQuad(ctx, buf, 0, v, lit > 0.12 ? accent : pal.matTop, lit > 0.12 ? Math.min(1, 0.45 + lit) : 1)
}
const towerBuf = new Float32Array(24)

export interface DrawOpts {
  scene: Scene
  view: View
  pal: Palette
  city: City
  /** District under the pointer or keyboard focus, if any. */
  active: DistrictId | null
}

/**
 * Paint one frame. There is no time argument on purpose: everything that
 * moves is a consequence of model state, so a paused scene is a real instant
 * of the cluster rather than an animation holding still.
 */
export function draw(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { view: v, pal } = o

  /* Sky. */
  const g = ctx.createLinearGradient(0, 0, 0, v.h)
  g.addColorStop(0, pal.skyTop)
  g.addColorStop(1, pal.skyBottom)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, v.w, v.h)

  /* Order is the argument. Storage is painted first and the ground is then
   * painted over it with the excavation cut out, so the only reason you can
   * see the data directory at all is that you are looking down a hole at it.
   * Paint it after the ground and the picture says the opposite. */
  drawUnderground(ctx, o)
  drawVacuumTarget(ctx, o)
  drawGround(ctx, o)
  drawRoads(ctx, o)
  drawStructures(ctx, o)
  drawPool(ctx, o)
  drawStandbyPool(ctx, o)
  drawBackends(ctx, o)
  drawWalSegments(ctx, o)
  drawParticles(ctx, o)
  drawLabels(ctx, o)
}

function drawUnderground(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { scene, view: v, pal, active } = o
  const dim = active && active !== 'storage' ? 0.5 : 1

  /* Two inner walls of the cut. Everything below ground gets one value
   * darker than the ground above it, so depth is carried by value and the
   * data directory can still be the brightest thing down there. */
  fillQuad(ctx, scene.pitWallN, 0, v, pal.pitWall, dim)
  fillQuad(ctx, scene.pitWallE, 0, v, pal.underground, dim)

  /* The plaza's footprint dropped onto the pit floor. Without it the deck
   * reads as resting on the floor rather than hanging over it. */
  fillQuad(ctx, scene.deckShadow, 0, v, '#000000', 0.34 * dim)

  for (const b of scene.under) {
    fillQuad(ctx, b.left, 0, v, pal.matLeft, dim)
    fillQuad(ctx, b.right, 0, v, pal.matRight, dim)
    const c = accent(pal, b.accent)
    if (b.tint < 1) fillQuad(ctx, b.top, 0, v, pal.matTop, dim)
    fillQuad(ctx, b.top, 0, v, b.accent ? c : pal.matTop, dim * (b.accent ? b.tint : 1))
    if (b.glow > 0) {
      fillQuad(ctx, b.right, 0, v, c, b.glow * 0.4 * dim)
      fillQuad(ctx, b.left, 0, v, c, b.glow * 0.25 * dim)
    }
  }
}

function drawGround(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { scene, view: v, pal } = o

  /* Ground with the excavation cut out of it, so the storage layer below
   * stays visible and the plaza reads as floating over a hole. */
  ctx.beginPath()
  subPoly(ctx, scene.ground, 0, v)
  subPoly(ctx, scene.pit, 0, v)
  ctx.fillStyle = pal.ground
  ctx.fill('evenodd')

  /* Survey lines, clipped to the ground so they never cross the hole. */
  ctx.save()
  ctx.clip('evenodd')
  ctx.strokeStyle = pal.grid
  ctx.lineWidth = Math.max(1, 1 * v.dpr)
  ctx.globalAlpha = 0.65
  ctx.beginPath()
  const g = scene.grid
  for (let i = 0; i < g.length; i += 4) {
    ctx.moveTo(g[i] * v.s + v.ox, g[i + 1] * v.s + v.oy)
    ctx.lineTo(g[i + 2] * v.s + v.ox, g[i + 3] * v.s + v.oy)
  }
  ctx.stroke()
  ctx.restore()
  ctx.globalAlpha = 1

  poly(ctx, scene.pit, 0, v)
  ctx.strokeStyle = pal.groundEdge
  ctx.lineWidth = Math.max(1.5, 2 * v.dpr)
  ctx.globalAlpha = 0.9
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawRoads(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { scene, view: v, pal, city } = o
  ctx.lineWidth = Math.max(1, 1.4 * v.dpr)
  ctx.lineCap = 'round'
  for (let r = 0; r < ROUTES.length; r++) {
    const def = ROUTES[r]
    if (!def.road) continue
    /* A connection duct only exists while its backend does. The road is the
     * connection, not a lane that statements are dispatched into. */
    if (def.conduit && city.backendConn[def.backend as number] === CONN_NONE) continue
    const pts = scene.routePts[r]
    ctx.beginPath()
    ctx.moveTo(pts[0] * v.s + v.ox, pts[1] * v.s + v.oy)
    for (let i = 2; i < pts.length; i += 2) {
      ctx.lineTo(pts[i] * v.s + v.ox, pts[i + 1] * v.s + v.oy)
    }
    ctx.globalAlpha = def.conduit ? 0.34 : 0.28
    ctx.strokeStyle = accent(pal, def.accent)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawStructures(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { scene, view: v, pal, active } = o
  for (const b of scene.boxes) {
    const dim = active && b.district !== active ? 0.45 : 1
    ctx.globalAlpha = dim
    fillQuad(ctx, b.left, 0, v, pal.matLeft, dim)
    fillQuad(ctx, b.right, 0, v, pal.matRight, dim)
    if (b.accent) {
      const c = accent(pal, b.accent)
      if (b.tint < 1) fillQuad(ctx, b.top, 0, v, pal.matTop, dim)
      fillQuad(ctx, b.top, 0, v, c, dim * b.tint)
      if (b.glow > 0) {
        fillQuad(ctx, b.right, 0, v, c, b.glow * 0.4 * dim)
        fillQuad(ctx, b.left, 0, v, c, b.glow * 0.25 * dim)
      }
    } else {
      fillQuad(ctx, b.top, 0, v, pal.matTop, dim)
    }
  }
  ctx.globalAlpha = 1
}

const frameCentreScratch = { x: 0, z: 0 }

function drawPool(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { scene, view: v, pal, city, active } = o
  const dim = active && active !== 'pool' ? 0.45 : 1

  for (let k = 0; k < scene.tileOrder.length; k++) {
    const i = scene.tileOrder[k]
    const st = city.frameState[i]
    let color = pal.bufFree
    let a = dim
    if (st === FRAME_CLEAN) color = pal.bufClean
    else if (st === FRAME_DIRTY) color = pal.bufDirty
    else a = dim * 0.75
    if (city.framePinned[i] > 0) color = pal.bufPinned

    /* Dirty frames stand proud of the deck. Blue and red are far apart in hue
     * but close in luminance, so on a monochrome display or to a reader with
     * a colour-vision deficiency the pool would otherwise say nothing at all.
     * Height is the redundant channel — and it is the right metaphor: a dirty
     * page is work the cluster still owes its storage. */
    frameCentre(i, frameCentreScratch)
    const h = st === FRAME_DIRTY ? 3.4 : 0.9
    tower(
      ctx,
      v,
      pal,
      frameCentreScratch.x,
      frameCentreScratch.z,
      BUF_TILE,
      BUF_TILE,
      DECK.h,
      h,
      color,
      a,
    )

    /* A frame a backend just touched flares briefly, so a reader can see that
     * one page was hit rather than the pool changing as a block. `towerBuf`
     * still holds that tile's top face. */
    const hot = city.frameHot[i]
    if (hot > 0) fillQuad(ctx, towerBuf, 0, v, pal.flash, Math.min(0.55, hot) * dim)

    /* The clock sweep's hand: the next frame it will consider. */
    if (i === city.sweepHand % N_FRAMES) {
      poly(ctx, towerBuf, 0, v)
      ctx.strokeStyle = pal.ink
      ctx.globalAlpha = 0.75 * dim
      ctx.lineWidth = Math.max(1, 1.4 * v.dpr)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }
}

/**
 * The standby's buffer frames. They come and go with replay, because that is
 * what a replica does: it reads the log and reconstructs pages of its own. No
 * page ever crosses the wire.
 */
function drawStandbyPool(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { scene, view: v, pal, city, active } = o
  const dim = active && active !== 'standby' ? 0.45 : 1
  const replayed = city.replayedBytes
  for (let k = 0; k < scene.standbyOrder.length; k++) {
    const i = scene.standbyOrder[k]
    /* Each frame lights when replay has passed its slot; the wave running
     * across the deck is the startup process working through the log. */
    const phase = (replayed / 90 + i * 0.37) % 1
    const lit = phase < 0.34
    fillQuad(ctx, scene.standbyTiles, i * 8, v, lit ? pal.bufDirty : pal.bufClean, dim * (lit ? 0.95 : 0.7))
  }
}

function drawBackends(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { view: v, pal, city, active } = o
  const dim = active && active !== 'backends' ? 0.45 : 1
  ctx.globalAlpha = dim
  for (let i = 0; i < N_BACKENDS; i++) {
    if (city.backendConn[i] === CONN_NONE) continue
    const opening = city.backendConn[i] !== CONN_OPEN
    const st = city.backendState[i]
    const load = city.backendLoad[i]
    const h = 8 + load * 16
    let accent = pal.backend
    let lit = 0.15 + load * 0.75
    if (opening) {
      accent = pal.postmaster
      lit = 0.5
    } else if (st === BE_COMMIT_WAIT) {
      /* Waiting for its own WAL flush. Amber, because what it is waiting for
       * is the write-ahead log, not the storage its page will land on. */
      accent = pal.wal
      lit = 1
    } else if (st === BE_IO_WAIT) {
      accent = pal.storage
      lit = 0.9
    } else if (st === BE_IDLE) {
      lit = 0.18
    }
    tower(ctx, v, pal, backendX(i), -130, 11, 12, 2, opening ? 5 : h, accent, lit)
  }
  ctx.globalAlpha = 1
}

function drawWalSegments(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { view: v, pal, city, active } = o
  const dim = active && active !== 'wal' ? 0.45 : 1
  ctx.globalAlpha = dim
  for (let i = 0; i < N_WAL_SEGMENTS; i++) {
    const fill = city.segments[i]
    const current = i === city.segmentHead % N_WAL_SEGMENTS
    const h = 3 + fill * 17
    tower(ctx, v, pal, 168, walSegmentZ(i), 20, 9, 4, h, current ? pal.wal : pal.walDim, current ? 0.9 : 0.5)
  }
  ctx.globalAlpha = 1
}

/**
 * The table autovacuum is currently working on. Marking the target is the
 * only way the reader can tell that vacuum visits a specific relation rather
 * than sweeping the whole data directory.
 */
function drawVacuumTarget(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { scene, view: v, pal, city } = o
  const t = city.vacuumTable
  if (t < 0 || t >= N_TABLES || city.pulseVacuum <= 0.02) return
  const x = scene.tables[t * 2] * v.s + v.ox
  const y = scene.tables[t * 2 + 1] * v.s + v.oy
  ctx.globalAlpha = Math.min(0.8, city.pulseVacuum)
  ctx.strokeStyle = pal.vacuum
  ctx.lineWidth = Math.max(1, 1.6 * v.dpr)
  ctx.beginPath()
  ctx.ellipse(x, y, 18 * v.s * 0.9, 18 * v.s * 0.9 * 0.52, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
}

const partPos: Pt = { x: 0, y: 0 }

/** Position a particle at fraction t along a route, in device pixels. */
function pointOnRoute(scene: Scene, v: View, r: number, t: number, out: Pt): void {
  const pts = scene.routePts[r]
  const frac = scene.routeFrac[r]
  const n = frac.length
  let i = 1
  while (i < n - 1 && frac[i] < t) i++
  const f0 = frac[i - 1]
  const f1 = frac[i]
  const k = f1 > f0 ? (t - f0) / (f1 - f0) : 0
  const x = pts[(i - 1) * 2] + (pts[i * 2] - pts[(i - 1) * 2]) * k
  const y = pts[(i - 1) * 2 + 1] + (pts[i * 2 + 1] - pts[(i - 1) * 2 + 1]) * k
  out.x = x * v.s + v.ox
  out.y = y * v.s + v.oy
}

function drawParticles(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { scene, view: v, pal, city, active } = o
  /* Size a packet in world units so it stays the same size relative to the
   * city, with a floor so it does not vanish on a phone. Clamping to a
   * constant device size instead made a packet a blob two frames wide at
   * 390px. */
  const base = Math.max(2 * v.dpr, 1.5 * v.s)

  for (let i = 0; i < city.pAlive.length; i++) {
    if (!city.pAlive[i]) continue
    const r = city.pRoute[i]
    const def = ROUTES[r]
    if (active && !routeTouches(def.id, active)) {
      ctx.globalAlpha = 0.22
    } else {
      ctx.globalAlpha = 1
    }
    pointOnRoute(scene, v, r, city.pT[i], partPos)
    const color = accent(pal, def.accent)
    const rad = city.pKind[i] === PK_HEAVY ? base * 1.35 : base

    /* Two circles rather than a shadow blur: a halo the eye reads as glow,
     * at a fraction of the cost on a software rasteriser. */
    ctx.fillStyle = color
    ctx.globalAlpha *= 0.18
    ctx.beginPath()
    ctx.arc(partPos.x, partPos.y, rad * 2.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = ctx.globalAlpha / 0.18
    ctx.beginPath()
    ctx.arc(partPos.x, partPos.y, rad, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/** Which districts a route belongs to, for dimming everything else. */
function routeTouches(id: string, d: DistrictId): boolean {
  switch (d) {
    case 'clients':
      return id === 'query' || id === 'result' || id === 'conn'
    case 'postmaster':
      return id === 'conn' || id === 'fork'
    case 'backends':
      return id === 'query' || id === 'result' || id === 'fork' || id === 'bufReq' || id === 'walIns'
    case 'pool':
      return (
        id === 'bufReq' ||
        id === 'pageRead' ||
        id === 'pageWrite' ||
        id === 'ckptSweep' ||
        id === 'bgwSweep'
      )
    case 'wal':
      return id === 'walIns' || id === 'walFlush' || id === 'walFsync' || id === 'archiveShip'
    case 'archive':
      return id === 'archiveShip'
    case 'maintenance':
      return id === 'ckptSweep' || id === 'bgwSweep' || id === 'vacGo'
    case 'storage':
      return id === 'pageRead' || id === 'pageWrite' || id === 'walFsync' || id === 'vacGo'
    case 'standby':
      return id === 'stream' || id === 'replay'
    default:
      return false
  }
}

/* --------------------------------------------------------------------------
 * Type. Monospace, because that is the page this lives on, and because a
 * district label is a name, not a caption.
 * ------------------------------------------------------------------------*/

function drawLabels(ctx: CanvasRenderingContext2D, o: DrawOpts): void {
  const { scene, view: v, pal, city, active } = o
  const size = Math.max(9, Math.min(12.5, v.cssW / 62)) * v.dpr
  const subSize = size * 0.84

  for (let i = 0; i < DISTRICTS.length; i++) {
    const d = DISTRICTS[i]
    const x = scene.labels[i * 2] * v.s + v.ox
    const y = scene.labels[i * 2 + 1] * v.s + v.oy
    const ax = scene.anchors[i * 2] * v.s + v.ox
    const ay = scene.anchors[i * 2 + 1] * v.s + v.oy
    const on = active === d.id
    if (v.compact && !on && d.id !== 'pool' && d.id !== 'wal' && d.id !== 'storage') continue

    const readout = readoutFor(d.id, city)
    ctx.font = `600 ${size}px ${MONO}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    const wLabel = ctx.measureText(d.label).width
    ctx.font = `400 ${subSize}px ${MONO}`
    const wSub = v.compact ? 0 : ctx.measureText(d.sub).width
    const wRead = readout ? ctx.measureText(readout).width : 0
    const w = Math.max(wLabel, wSub, wRead) + 12 * v.dpr
    const lines = 1 + (v.compact ? 0 : 1) + (readout ? 1 : 0)
    const h = size * 1.25 * lines + 8 * v.dpr

    /* A leader line, so a label that had to move out of the way still names
     * the thing it is naming. */
    ctx.beginPath()
    ctx.moveTo(x, y - h / 2)
    ctx.lineTo(ax, ay)
    ctx.strokeStyle = on ? accent(pal, d.accent) : pal.inkDim
    ctx.globalAlpha = on ? 0.7 : 0.35
    ctx.lineWidth = Math.max(1, 1 * v.dpr)
    ctx.stroke()
    ctx.globalAlpha = 1

    ctx.fillStyle = pal.plate
    ctx.globalAlpha = on ? 1 : 0.92
    roundRect(ctx, x - w / 2, y - h, w, h, 3 * v.dpr)
    ctx.fill()
    if (on) {
      ctx.strokeStyle = accent(pal, d.accent)
      ctx.lineWidth = Math.max(1, 1 * v.dpr)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    let ty = y - h + size * 1.05 + 3 * v.dpr
    ctx.font = `600 ${size}px ${MONO}`
    ctx.fillStyle = on ? accent(pal, d.accent) : pal.ink
    ctx.fillText(d.label, x, ty)
    if (!v.compact) {
      ty += size * 1.15
      ctx.font = `400 ${subSize}px ${MONO}`
      ctx.fillStyle = pal.inkDim
      ctx.fillText(d.sub, x, ty)
    }
    if (readout) {
      ty += size * 1.15
      ctx.font = `500 ${subSize}px ${MONO}`
      ctx.fillStyle = accent(pal, d.accent)
      ctx.fillText(readout, x, ty)
    }
  }
}

/**
 * The three figures worth putting on screen. All are dimensionless on
 * purpose: a ratio cannot be mistaken for somebody's throughput, and this
 * scene has no business implying it measured one.
 */
function readoutFor(id: DistrictId, city: City): string | null {
  switch (id) {
    case 'pool':
      return `hit ${(city.hitRatio * 100).toFixed(1)}%  dirty ${Math.round(city.dirtyRatio * 100)}%`
    case 'standby':
      return `replay lag ${city.replayLag < 0.02 ? 'none' : bar(city.replayLag)}`
    default:
      return null
  }
}

const BAR = '▁▂▃▄▅▆▇'
function bar(v: number): string {
  const n = Math.max(0, Math.min(BAR.length - 1, Math.round(v * (BAR.length - 1))))
  return BAR[n].repeat(3)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Screen position of a district anchor, for placing the DOM hit targets. */
export function anchorAt(scene: Scene, v: View, i: number, out: Pt): void {
  /* The label, not the district: the plate is the visible affordance, so it
   * is where a pointer and a Tab stop both expect the target to be. */
  out.x = scene.labels[i * 2] * v.s + v.ox
  out.y = scene.labels[i * 2 + 1] * v.s + v.oy - 10 * v.dpr
}
