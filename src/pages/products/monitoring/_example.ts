// Example data for the "investigating a spike" block. It is not measured
// data: a steady 20-30 active sessions, then an incident that peaks at 262
// at 14:36. The chart and the shell pane read the same numbers, so they
// cannot disagree.

export type WaitKey = 'cpu' | 'io' | 'client' | 'lwlock' | 'lock'

export const WAITS: { key: WaitKey; type: string; event: string }[] = [
  { key: 'cpu', type: 'CPU*', event: 'CPU*' },
  { key: 'io', type: 'IO', event: 'DataFileRead' },
  { key: 'client', type: 'Client', event: 'ClientRead' },
  { key: 'lwlock', type: 'LWLock', event: 'LockManager' },
  { key: 'lock', type: 'Lock', event: 'transactionid' },
]

export type Bucket = Record<WaitKey, number>

export const PEAK: Bucket = { cpu: 31, io: 14, client: 8, lwlock: 38, lock: 171 }
export const PEAK_TOTAL = 262
export const PEAK_INDEX = 48 // 13:00 + 48 x 2 min = 14:36
export const BUCKETS = 90 // 3 hours, one bar per 2 minutes
export const Y_MAX = 300

// The incident, bar by bar: [cpu, io, client, lwlock, lock]. The rise takes
// 4 minutes, and the lock waits come first. Then the blocker is gone, the
// waiters wake up together, and LWLock and CPU carry the load down, with a
// second, smaller wave at 14:50. The bar at PEAK_INDEX is PEAK.
const INCIDENT: Record<number, [number, number, number, number, number]> = {
  46: [15, 5, 3, 3, 38],
  47: [19, 7, 5, 12, 125],
  48: [PEAK.cpu, PEAK.io, PEAK.client, PEAK.lwlock, PEAK.lock],
  49: [38, 15, 8, 54, 128],
  50: [44, 17, 7, 61, 82],
  51: [47, 18, 6, 58, 57],
  52: [41, 14, 5, 37, 32],
  53: [36, 11, 4, 24, 22],
  54: [39, 12, 4, 29, 34],
  55: [42, 13, 5, 33, 41],
  56: [35, 10, 4, 21, 22],
  57: [28, 8, 3, 12, 10],
  58: [22, 7, 3, 7, 5],
  59: [19, 6, 3, 4, 5],
}

// Small fixed generator, so the server and the browser draw the same bars.
// The baseline stays between 20 and 30 sessions.
function series(): Bucket[] {
  let seed = 20261112
  const rnd = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed % n
  }
  const out: Bucket[] = []
  for (let i = 0; i < BUCKETS; i++) {
    const base: Bucket = { cpu: 13 + rnd(5), io: 4 + rnd(3), client: 2 + rnd(2), lwlock: 1 + rnd(2), lock: rnd(3) }
    const row = INCIDENT[i]
    out.push(row ? { cpu: row[0], io: row[1], client: row[2], lwlock: row[3], lock: row[4] } : base)
  }
  return out
}

export const SERIES = series()

// The sessions that wait for Lock:transactionid at the peak, per query ID.
// The three largest hold 171 sessions, which is the Lock row above.
export const LOCK_QUERIES: [string, number][] = [
  ['-7514152763537218973', 148],
  ['-2835399305386018931', 19],
  ['-370359998942231564', 4],
]

// The table `pgai promql` prints for an instant query (cli/lib/promql.ts,
// renderPromQL): the label set as Prometheus prints it, padded, two spaces,
// the value; then a blank line and the series and point counts.
// The compact example window passes footer = false: the CLI prints "1 series,
// 1 points" for a single series, so the example leaves the count line out
// rather than show the plural bug.
export function promqlTable(rows: [string, number][], footer = true): string {
  const w = Math.max(6, ...rows.map(([m]) => m.length))
  const lines = [`${'SERIES'.padEnd(w)}  VALUE`]
  for (const [m, v] of rows) lines.push(`${m.padEnd(w)}  ${v}`)
  if (footer) lines.push('', `${rows.length} series, ${rows.length} points`)
  return lines.join('\n')
}

export const BY_EVENT = promqlTable(
  [...WAITS]
    .sort((a, b) => PEAK[b.key] - PEAK[a.key])
    .map((w) => [`{wait_event="${w.event}"}`, PEAK[w.key]]),
)

export const BY_QUERY = promqlTable(LOCK_QUERIES.map(([q, n]) => [`{query_id="${q}"}`, n]), false)

// Who blocks them: the lock-wait metric (metrics.yml lock_waits, as
// pgwatch_lock_waits_blocker_tx_ms) labels each blocked session with the
// blocker's query ID; the value is the age of the blocker's transaction, in
// milliseconds. Example numbers: one blocker, 94 seconds into its transaction.
export const BLOCKER: [string, number] = ['3018945720344115117', 94120]

export const BY_BLOCKER = promqlTable([[`{blocker_query_id="${BLOCKER[0]}"}`, BLOCKER[1]]], false)

// The blocker's query text: pgwatch_query_info carries each active query ID's
// normalized text as labels (monitoring_flask_backend /query_info_metrics,
// scraped into the same store); displayname_raw_long is "<queryid> | <text>",
// cut at 100 characters. Example text.
export const BLOCKER_TEXT = 'update orders set status = $1 where id = $2'

export const BY_TEXT = promqlTable([[`{displayname_raw_long="${BLOCKER[0]} | ${BLOCKER_TEXT}"}`, 1]], false)
