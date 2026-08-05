/**
 * A small, honest model of a PostgreSQL cluster.
 *
 * It is a model, not an emulator: no PostgreSQL code runs here and the rates
 * are scaled so a person can watch them. What it does preserve is the order
 * and the causality, because those are the whole lesson:
 *
 *   - A backend that misses in the buffer pool reads the page from storage
 *     before it can use it, and if the frame it takes was dirty it writes that
 *     page out first — the clock sweep picks the victim, not a queue.
 *   - A write dirties a page in shared memory and produces a WAL record. The
 *     commit waits for that record to reach durable storage and for nothing
 *     else. The wait is a state the backend is visibly in.
 *   - The dirty data page is still in memory after the commit returns. It
 *     reaches storage later: at a checkpoint, through the background writer,
 *     or because somebody needed its frame. This is structural here — no path
 *     marks a frame clean at commit time.
 *   - Replication ships WAL. Nothing in this model sends a data page to the
 *     standby.
 *
 * Determinism is deliberate: one seeded generator, a fixed timestep, and no
 * allocation after construction, so the same elapsed time always produces the
 * same city and the animation loop never makes garbage.
 */

import {
  N_BACKENDS,
  N_FRAMES,
  N_TABLES,
  N_WAL_SEGMENTS,
  ROUTES,
  forkRoute,
  queryRoute,
  resultRoute,
  routeOf,
} from './plan'

/* --- frame states --------------------------------------------------------*/
export const FRAME_FREE = 0
export const FRAME_CLEAN = 1
export const FRAME_DIRTY = 2

/* --- backend states ------------------------------------------------------*/
export const BE_IDLE = 0
export const BE_ACTIVE = 1
/** Waiting for its own WAL to be flushed. This is `commit_wait`, not work. */
export const BE_COMMIT_WAIT = 2
/** Waiting on storage: a page fault, or writing out a dirty victim. */
export const BE_IO_WAIT = 3

/* --- connection lifecycle ------------------------------------------------*/
/** No connection, so no process: PostgreSQL has nothing here at all. */
export const CONN_NONE = 0
/** The postmaster has been asked and is forking. */
export const CONN_OPENING = 1
export const CONN_OPEN = 2

/* --- particle kinds (drawing hints only) ---------------------------------*/
export const PK_NORMAL = 0
export const PK_HEAVY = 1

const MAX_PARTICLES = 320
const MAX_TXNS = 48

/** Pages in the modelled working set. Larger than the pool, so misses are real. */
const N_PAGES = N_TABLES * 44
/** The hot set: what an OLTP workload actually touches, and what a
 *  correctly sized pool is expected to hold. */
const HOT_PAGES = 30
const HOT_SHARE = 0.95
/** Model WAL bytes that fill one segment. Scaled: a real segment is 16 MiB. */
const SEGMENT_BYTES = 900
/** WAL a modelled write produces, before any full-page image. */
const WAL_PER_WRITE = 5.5
/** A full-page image: the first change to a page after a checkpoint. */
const WAL_FULL_PAGE = 26

const CKPT_PERIOD = 21
/** checkpoint_completion_target: spread the writes over most of the interval. */
const CKPT_TARGET = 0.85
const BGW_PERIOD = 0.34
const VAC_PERIOD = 13
const STREAM_PERIOD = 0.3
/** What the standby's startup process can replay, in model WAL bytes/second.
 *  Set a little above the average write rate, so lag drains between bursts
 *  and builds during them rather than sitting at a constant. */
const REPLAY_RATE = 105
const ARRIVAL_RATE = 9
/** How often the city considers opening or closing a connection. */
const CONN_PERIOD = 3.5

/* --- transaction stages --------------------------------------------------*/
const TX_FREE = 0
const TX_ARRIVING = 1
const TX_LOOKUP = 2
const TX_IO = 3
const TX_WAL = 4
const TX_FLUSH = 5
const TX_RETURN = 6

/* --- what a particle does when it lands ----------------------------------*/
const ON_NOTHING = 0
const ON_TX_BUFREQ = 1
const ON_TX_IO_DONE = 2
const ON_TX_WAL_FLUSH = 3
const ON_TX_COMMIT = 4
const ON_TX_DONE = 5
const ON_WRITE_PAGE = 6
const ON_PAGE_CLEAN = 7
const ON_VACUUM = 8
const ON_FORKED = 9

function xorshift32(seed: number): () => number {
  let s = seed | 0 || 0x9e3779b9
  return () => {
    s ^= s << 13
    s |= 0
    s ^= s >>> 17
    s ^= s << 5
    s |= 0
    return (s >>> 0) / 4294967296
  }
}

export interface City {
  /* Buffer pool. */
  frameState: Uint8Array
  frameTag: Int32Array
  frameUsage: Uint8Array
  framePinned: Uint8Array
  /** Seconds of "just touched" highlight left on the frame. */
  frameHot: Float32Array
  sweepHand: number

  /* Backends. A slot with no connection has no process behind it at all. */
  backendConn: Uint8Array
  backendState: Uint8Array
  backendLoad: Float32Array

  /* Particles, structure-of-arrays so the loop allocates nothing. */
  pRoute: Int8Array
  pT: Float32Array
  pRate: Float32Array
  pKind: Uint8Array
  pAlive: Uint8Array
  pCount: number

  /* Districts under load, 0..1 — a pulse a reader can actually see. */
  pulseCheckpoint: number
  pulseWal: number
  pulseVacuum: number
  pulseFork: number

  /* WAL. */
  walBytes: number
  segmentFill: number
  segmentHead: number
  /** Fill level of each visible segment silo, 0..1. */
  segments: Float32Array

  /* Replication, in model WAL bytes. Lag is the gap between what the
   * walsender has shipped and what the standby has replayed. */
  sentBytes: number
  replayedBytes: number
  /** That gap, normalised against one segment, for the readout. */
  replayLag: number

  /* Maintenance. */
  checkpointActive: boolean
  checkpointProgress: number
  vacuumTable: number

  /* Counters. */
  blksHit: number
  blksRead: number
  commits: number

  /* Derived each step, for the readouts. */
  hitRatio: number
  dirtyRatio: number

  t: number
  step(dt: number): void
}

export function createCity(seed = 0x5eed1e): City {
  const rng = xorshift32(seed)

  const frameState = new Uint8Array(N_FRAMES)
  const frameTag = new Int32Array(N_FRAMES).fill(-1)
  const frameUsage = new Uint8Array(N_FRAMES)
  const framePinned = new Uint8Array(N_FRAMES)
  const frameHot = new Float32Array(N_FRAMES)
  /* Bumped every time a frame is dirtied. A write-back only cleans the frame
   * if the stamp has not moved since the write started — PostgreSQL's
   * BM_JUST_DIRTIED, without which a page changed during its own write-out
   * would be silently lost. */
  const frameStamp = new Uint16Array(N_FRAMES)

  const backendConn = new Uint8Array(N_BACKENDS)
  const backendState = new Uint8Array(N_BACKENDS)
  const backendLoad = new Float32Array(N_BACKENDS)

  const pRoute = new Int8Array(MAX_PARTICLES)
  const pT = new Float32Array(MAX_PARTICLES)
  const pRate = new Float32Array(MAX_PARTICLES)
  const pKind = new Uint8Array(MAX_PARTICLES)
  const pOnArrive = new Uint8Array(MAX_PARTICLES)
  const pOwner = new Int16Array(MAX_PARTICLES)
  const pArg = new Int16Array(MAX_PARTICLES)
  const pStamp = new Uint16Array(MAX_PARTICLES)
  const pAlive = new Uint8Array(MAX_PARTICLES)
  const freeP = new Int16Array(MAX_PARTICLES)
  let freePTop = MAX_PARTICLES
  for (let i = 0; i < MAX_PARTICLES; i++) freeP[i] = MAX_PARTICLES - 1 - i

  const txState = new Uint8Array(MAX_TXNS)
  const txWrite = new Uint8Array(MAX_TXNS)
  const txBackend = new Int8Array(MAX_TXNS)
  const txFrame = new Int16Array(MAX_TXNS)
  const txPage = new Int32Array(MAX_TXNS)
  /** Blocks this statement still has to touch. Real statements touch many. */
  const txBlocks = new Uint8Array(MAX_TXNS)
  const freeT = new Int16Array(MAX_TXNS)
  let freeTTop = MAX_TXNS
  for (let i = 0; i < MAX_TXNS; i++) freeT[i] = MAX_TXNS - 1 - i

  /** Pages already given a full-page image since the last checkpoint. */
  const fpiDone = new Uint8Array(N_PAGES)

  /** Frames the checkpointer still has to write in this checkpoint. */
  const ckptQueue = new Int16Array(N_FRAMES)
  let ckptCount = 0
  let ckptCursor = 0
  let ckptRelease = 0

  /* Route lengths in world units, so particle speed is screen-independent. */
  const routeLen = new Float32Array(ROUTES.length)
  for (let r = 0; r < ROUTES.length; r++) {
    const pts = ROUTES[r].pts
    let len = 0
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i - 1][0]
      const dy = pts[i][1] - pts[i - 1][1]
      const dz = pts[i][2] - pts[i - 1][2]
      len += Math.sqrt(dx * dx + dy * dy + dz * dz)
    }
    routeLen[r] = len || 1
  }

  const city: City = {
    frameState,
    frameTag,
    frameUsage,
    framePinned,
    frameHot,
    sweepHand: 0,
    backendConn,
    backendState,
    backendLoad,
    pRoute,
    pT,
    pRate,
    pKind,
    pAlive,
    pCount: 0,
    pulseCheckpoint: 0,
    pulseWal: 0,
    pulseVacuum: 0,
    pulseFork: 0,
    walBytes: 0,
    segmentFill: 0,
    segmentHead: 0,
    segments: new Float32Array(N_WAL_SEGMENTS),
    sentBytes: 0,
    replayedBytes: 0,
    replayLag: 0,
    checkpointActive: false,
    checkpointProgress: 0,
    vacuumTable: -1,
    blksHit: 40,
    blksRead: 3,
    commits: 0,
    hitRatio: 0.93,
    dirtyRatio: 0,
    t: 0,
    step,
  }

  /* ---- particles ------------------------------------------------------- */

  function emit(
    r: number,
    onArrive: number,
    owner: number,
    arg: number,
    kind: number,
    stamp = 0,
  ): void {
    if (freePTop === 0) return
    const i = freeP[--freePTop]
    pRoute[i] = r
    pT[i] = 0
    pRate[i] = ROUTES[r].speed / routeLen[r]
    pKind[i] = kind
    pOnArrive[i] = onArrive
    pOwner[i] = owner
    pArg[i] = arg
    pStamp[i] = stamp
    pAlive[i] = 1
    city.pCount++
  }

  function release(i: number): void {
    pAlive[i] = 0
    freeP[freePTop++] = i
    city.pCount--
  }

  /* ---- buffer pool ----------------------------------------------------- */

  function findResident(tag: number): number {
    for (let i = 0; i < N_FRAMES; i++) if (frameTag[i] === tag) return i
    return -1
  }

  function markDirty(f: number): void {
    frameState[f] = FRAME_DIRTY
    frameStamp[f] = (frameStamp[f] + 1) & 0xffff
  }

  /**
   * PostgreSQL's clock sweep. Each pass decrements a frame's usage count and
   * only an unpinned frame at zero can be taken. The count is capped at 5,
   * which is why a page read repeatedly survives several passes.
   */
  function clockSweep(): number {
    for (let guard = 0; guard < N_FRAMES * 6; guard++) {
      const i = city.sweepHand
      city.sweepHand = (i + 1) % N_FRAMES
      if (framePinned[i]) continue
      if (frameState[i] === FRAME_FREE) return i
      if (frameUsage[i] > 0) {
        frameUsage[i]--
        continue
      }
      return i
    }
    return city.sweepHand
  }

  /* ---- transactions ---------------------------------------------------- */

  /* A hot set plus a long cold tail. A uniform pick would make the hit ratio
   * a function of pool size alone, and would put a number on screen that no
   * healthy OLTP database has ever reported. */
  function pickPage(): number {
    return rng() < HOT_SHARE
      ? (rng() * HOT_PAGES) | 0
      : Math.min(N_PAGES - 1, (rng() * N_PAGES) | 0)
  }

  function idleBackend(): number {
    const start = (rng() * N_BACKENDS) | 0
    for (let k = 0; k < N_BACKENDS; k++) {
      const i = (start + k) % N_BACKENDS
      if (backendConn[i] === CONN_OPEN && backendState[i] === BE_IDLE) return i
    }
    return -1
  }

  /**
   * Open a connection. The postmaster forks one backend for it, and that
   * backend then serves every statement on that connection until it closes.
   * This happens per connection — never per statement, which is the thing
   * everyone assumes and the reason it is drawn separately here.
   */
  function openConnection(): void {
    let slot = -1
    for (let i = 0; i < N_BACKENDS; i++) {
      if (backendConn[i] === CONN_NONE) {
        slot = i
        break
      }
    }
    if (slot < 0) return
    backendConn[slot] = CONN_OPENING
    city.pulseFork = 1
    emit(routeOf('conn'), ON_NOTHING, -1, 0, PK_NORMAL)
    emit(forkRoute(slot), ON_FORKED, -1, slot, PK_HEAVY)
  }

  function closeConnection(): void {
    let open = 0
    for (let i = 0; i < N_BACKENDS; i++) if (backendConn[i] === CONN_OPEN) open++
    if (open <= 4) return
    for (let i = N_BACKENDS - 1; i >= 0; i--) {
      if (backendConn[i] === CONN_OPEN && backendState[i] === BE_IDLE) {
        backendConn[i] = CONN_NONE
        backendLoad[i] = 0
        return
      }
    }
  }

  function beginTxn(): void {
    if (freeTTop === 0) return
    const be = idleBackend()
    if (be < 0) return
    const tx = freeT[--freeTTop]
    txState[tx] = TX_ARRIVING
    txWrite[tx] = rng() < 0.34 ? 1 : 0
    txBackend[tx] = be
    txFrame[tx] = -1
    txPage[tx] = pickPage()
    /* One statement touches several blocks — an index descent and its heap
     * fetches are already three or four. Drawing one buffer access per
     * statement would understate the pool's job by about that much. */
    txBlocks[tx] = 3 + ((rng() * 5) | 0)
    backendState[be] = BE_ACTIVE
    emit(queryRoute(be), ON_TX_BUFREQ, tx, 0, PK_NORMAL)
  }

  function endTxn(tx: number): void {
    const be = txBackend[tx]
    if (be >= 0) backendState[be] = BE_IDLE
    const f = txFrame[tx]
    if (f >= 0 && framePinned[f] > 0) framePinned[f]--
    txState[tx] = TX_FREE
    txFrame[tx] = -1
    freeT[freeTTop++] = tx
  }

  /** The statement has reached its backend; ask shared memory for the page. */
  function requestBuffer(tx: number): void {
    txState[tx] = TX_LOOKUP
    emit(routeOf('bufReq'), ON_TX_IO_DONE, tx, 0, PK_NORMAL)
  }

  function lookup(tx: number): void {
    const tag = txPage[tx]
    let f = findResident(tag)
    if (f >= 0) {
      city.blksHit++
      if (frameUsage[f] < 5) frameUsage[f]++
      frameHot[f] = 0.55
      framePinned[f]++
      txFrame[tx] = f
      usePage(tx)
      return
    }

    city.blksRead++
    f = clockSweep()
    /* A dirty victim is written by the backend that needed the frame. Under
     * the write-ahead rule its WAL is flushed first, so this is never cheap —
     * it is the price a too-small pool actually charges. */
    if (frameState[f] === FRAME_DIRTY) emit(routeOf('pageWrite'), ON_NOTHING, -1, f, PK_HEAVY)
    frameTag[f] = tag
    frameState[f] = FRAME_CLEAN
    frameUsage[f] = 1
    framePinned[f]++
    txFrame[tx] = f
    txState[tx] = TX_IO
    backendState[txBackend[tx]] = BE_IO_WAIT
    emit(routeOf('pageRead'), ON_TX_IO_DONE, tx, f, PK_NORMAL)
  }

  /** The page is in a frame and pinned; do what the statement asked for. */
  function usePage(tx: number): void {
    const f = txFrame[tx]
    frameHot[f] = 0.55
    backendState[txBackend[tx]] = BE_ACTIVE

    if (txWrite[tx]) {
      /* Changed in memory now. Nothing below marks it clean: it stays dirty
       * until a checkpoint, the background writer, or an eviction writes it. */
      markDirty(f)

      const page = txPage[tx]
      let bytes = WAL_PER_WRITE
      if (!fpiDone[page]) {
        /* full_page_writes: the first change to a page after a checkpoint
         * carries the whole page into the WAL. It is why WAL floods just
         * after a checkpoint begins, and why replay falls behind there. */
        bytes += WAL_FULL_PAGE
        fpiDone[page] = 1
      }
      city.walBytes += bytes
      city.pulseWal = Math.min(1, city.pulseWal + bytes / 90)
      /* One WAL record per changed block, staged into wal_buffers. None of
       * them is flushed yet — the commit below is what waits. */
      emit(routeOf('walIns'), ON_NOTHING, -1, 0, bytes > WAL_PER_WRITE ? PK_HEAVY : PK_NORMAL)
    }

    /* Done with this block: unpin it and move to the next one. */
    if (framePinned[f] > 0) framePinned[f]--
    txFrame[tx] = -1
    txBlocks[tx]--

    if (txBlocks[tx] > 0) {
      txPage[tx] = pickPage()
      txState[tx] = TX_LOOKUP
      emit(routeOf('bufReq'), ON_TX_IO_DONE, tx, 0, PK_NORMAL)
      return
    }

    if (!txWrite[tx]) {
      txState[tx] = TX_RETURN
      emit(resultRoute(txBackend[tx]), ON_TX_DONE, tx, 0, PK_NORMAL)
      return
    }

    /* The commit record. Everything this transaction wrote becomes durable
     * when this one reaches disk, and not before. */
    city.walBytes += WAL_PER_WRITE
    txState[tx] = TX_WAL
    emit(routeOf('walIns'), ON_TX_WAL_FLUSH, tx, 0, PK_HEAVY)
  }

  /* ---- arrivals -------------------------------------------------------- */

  function arrive(what: number, tx: number, arg: number, stamp: number): void {
    switch (what) {
      case ON_TX_BUFREQ:
        if (txState[tx] === TX_ARRIVING) requestBuffer(tx)
        break

      case ON_TX_IO_DONE:
        if (txState[tx] === TX_LOOKUP) lookup(tx)
        else if (txState[tx] === TX_IO) usePage(tx)
        break

      case ON_TX_WAL_FLUSH:
        if (txState[tx] === TX_WAL) {
          txState[tx] = TX_FLUSH
          /* Asleep in commit_wait. The backend is not doing work and is not
           * holding up anything but itself and its client. */
          backendState[txBackend[tx]] = BE_COMMIT_WAIT
          emit(routeOf('walFlush'), ON_TX_COMMIT, tx, 0, PK_HEAVY)
        }
        break

      case ON_TX_COMMIT:
        if (txState[tx] === TX_FLUSH) {
          city.commits++
          /* Durable. The WAL record is on disk; the data page it describes is
           * still dirty in shared memory, and that is correct. */
          emit(routeOf('walFsync'), ON_NOTHING, -1, 0, PK_NORMAL)
          txState[tx] = TX_RETURN
          backendState[txBackend[tx]] = BE_ACTIVE
          emit(resultRoute(txBackend[tx]), ON_TX_DONE, tx, 0, PK_NORMAL)
        }
        break

      case ON_TX_DONE:
        if (txState[tx] !== TX_FREE) endTxn(tx)
        break

      case ON_WRITE_PAGE:
        /* The sweep reached the pool; now the page itself travels to storage,
         * carrying the stamp it had when the write was scheduled. */
        emit(routeOf('pageWrite'), ON_PAGE_CLEAN, -1, arg, PK_NORMAL, frameStamp[arg])
        break

      case ON_PAGE_CLEAN:
        if (frameState[arg] === FRAME_DIRTY && frameStamp[arg] === stamp) {
          frameState[arg] = FRAME_CLEAN
        }
        break

      case ON_VACUUM:
        city.vacuumTable = arg
        city.pulseVacuum = 1
        break

      case ON_FORKED:
        /* The forked backend exists now and will serve this connection until
         * it closes. The postmaster takes no further part. */
        backendConn[arg] = CONN_OPEN
        backendState[arg] = BE_IDLE
        break

      default:
        break
    }
  }

  /* ---- background activity --------------------------------------------- */

  function beginCheckpoint(): void {
    ckptCount = 0
    for (let i = 0; i < N_FRAMES; i++) if (frameState[i] === FRAME_DIRTY) ckptQueue[ckptCount++] = i
    ckptCursor = 0
    ckptRelease = 0
    city.checkpointActive = ckptCount > 0
    city.checkpointProgress = 0
    city.pulseCheckpoint = 1
    /* A checkpoint re-arms full_page_writes: the next change to any page
     * carries a full-page image again. */
    fpiDone.fill(0)
  }

  function driveCheckpoint(dt: number): void {
    if (!city.checkpointActive || ckptCount === 0) return
    /* Spread the writes across checkpoint_completion_target of the interval
     * rather than dumping them: that smoothing is the point of the setting. */
    const spread = CKPT_PERIOD * CKPT_TARGET
    ckptRelease += (ckptCount / spread) * dt
    while (ckptRelease >= 1 && ckptCursor < ckptCount) {
      ckptRelease -= 1
      const f = ckptQueue[ckptCursor++]
      if (frameState[f] === FRAME_DIRTY) emit(routeOf('ckptSweep'), ON_WRITE_PAGE, -1, f, PK_NORMAL)
    }
    city.checkpointProgress = ckptCursor / ckptCount
    if (ckptCursor >= ckptCount) city.checkpointActive = false
  }

  /**
   * The background writer trickles dirty pages out ahead of the checkpointer,
   * scanning from the clock-sweep position so it writes the frames most likely
   * to be reused next.
   */
  function runBgwriter(): void {
    let written = 0
    for (let k = 0; k < 16 && written < 3; k++) {
      const f = (city.sweepHand + k) % N_FRAMES
      if (frameState[f] === FRAME_DIRTY && !framePinned[f]) {
        emit(routeOf('bgwSweep'), ON_WRITE_PAGE, -1, f, PK_NORMAL)
        written++
      }
    }
  }

  /* ---- the step -------------------------------------------------------- */

  let txAccum = 0
  let bgwAccum = 0
  let vacAccum = 0
  let streamAccum = 0
  let ckptAccum = 0
  let connAccum = 0
  let lastWalBytes = 0

  function step(dt: number): void {
    city.t += dt

    /* Connections come and go on their own clock, far slower than statements
     * do. Watch the postmaster: it fires here and nowhere else. */
    connAccum += dt
    if (connAccum >= CONN_PERIOD) {
      connAccum = 0
      if (rng() < 0.62) openConnection()
      else closeConnection()
    }

    /* Arrivals. The rate is scaled for watching, not benchmarked. */
    txAccum += ARRIVAL_RATE * dt
    while (txAccum >= 1) {
      txAccum -= 1
      beginTxn()
    }

    /* Particles. Read the landing payload before releasing the slot, because
     * `arrive` can emit and immediately reuse it. */
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (!pAlive[i]) continue
      pT[i] += pRate[i] * dt
      if (pT[i] >= 1) {
        const what = pOnArrive[i]
        const owner = pOwner[i]
        const arg = pArg[i]
        const stamp = pStamp[i]
        release(i)
        arrive(what, owner, arg, stamp)
      }
    }

    ckptAccum += dt
    if (ckptAccum >= CKPT_PERIOD) {
      ckptAccum = 0
      beginCheckpoint()
    }
    driveCheckpoint(dt)

    bgwAccum += dt
    if (bgwAccum >= BGW_PERIOD) {
      bgwAccum = 0
      runBgwriter()
    }

    vacAccum += dt
    if (vacAccum >= VAC_PERIOD) {
      vacAccum = 0
      emit(routeOf('vacGo'), ON_VACUUM, -1, (rng() * N_TABLES) | 0, PK_NORMAL)
    }

    /* WAL segments fill in order; a finished one is shipped to the archive. */
    const produced = city.walBytes - lastWalBytes
    lastWalBytes = city.walBytes
    city.segmentFill += produced
    while (city.segmentFill >= SEGMENT_BYTES) {
      city.segmentFill -= SEGMENT_BYTES
      city.segments[city.segmentHead % N_WAL_SEGMENTS] = 1
      city.segmentHead++
      emit(routeOf('archiveShip'), ON_NOTHING, -1, 0, PK_HEAVY)
    }
    city.segments[city.segmentHead % N_WAL_SEGMENTS] = city.segmentFill / SEGMENT_BYTES

    /* Streaming replication. The walsender ships WAL as it is generated; the
     * standby's startup process replays it at a finite rate. Lag is the gap
     * between the two — which is why it climbs when full-page images flood
     * the log after a checkpoint, and drains when writes go quiet. Nothing
     * here sends a data page: a replica rebuilds its own pages from the log. */
    city.sentBytes = city.walBytes
    city.replayedBytes = Math.min(city.sentBytes, city.replayedBytes + REPLAY_RATE * dt)
    const lagBytes = city.sentBytes - city.replayedBytes
    city.replayLag = Math.min(1, lagBytes / SEGMENT_BYTES)

    streamAccum += dt
    if (streamAccum >= STREAM_PERIOD) {
      streamAccum = 0
      if (produced > 0) emit(routeOf('stream'), ON_NOTHING, -1, 0, PK_NORMAL)
      if (lagBytes > 1) emit(routeOf('replay'), ON_NOTHING, -1, 0, PK_NORMAL)
    }

    /* Decay: pulses, frame highlights, backend afterglow. */
    const decay = Math.min(1, dt * 1.8)
    city.pulseCheckpoint -= city.pulseCheckpoint * decay
    city.pulseWal -= city.pulseWal * decay * 1.4
    city.pulseVacuum -= city.pulseVacuum * decay * 0.5
    city.pulseFork -= city.pulseFork * decay * 2
    for (let i = 0; i < N_FRAMES; i++) {
      if (frameHot[i] > 0) frameHot[i] = Math.max(0, frameHot[i] - dt)
    }
    for (let i = 0; i < N_BACKENDS; i++) {
      const target = backendState[i] === BE_IDLE ? 0 : 1
      backendLoad[i] += (target - backendLoad[i]) * Math.min(1, dt * 7)
    }

    /* Readouts. `blks_hit / (blks_hit + blks_read)` is PostgreSQL's own
     * formula; the counters decay so the ratio tracks the recent workload
     * instead of freezing at a lifetime average. */
    const halfLife = Math.pow(0.5, dt / 6)
    city.blksHit *= halfLife
    city.blksRead *= halfLife
    const reads = city.blksHit + city.blksRead
    city.hitRatio = reads > 0 ? city.blksHit / reads : 1

    let dirty = 0
    for (let i = 0; i < N_FRAMES; i++) if (frameState[i] === FRAME_DIRTY) dirty++
    city.dirtyRatio = dirty / N_FRAMES
  }

  /* A database a reader arrives at has been up for a while: some connections
   * are already established, and the pool is already populated. Start there,
   * then run the model forward so the first painted frame is a working
   * cluster rather than a cold start. */
  for (let i = 0; i < 8; i++) {
    backendConn[i] = CONN_OPEN
    backendState[i] = BE_IDLE
  }
  for (let i = 0; i < 1800; i++) step(1 / 60)

  return city
}
