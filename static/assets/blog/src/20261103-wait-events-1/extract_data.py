#!/usr/bin/env python3
"""Extract the numbers behind the post-1 figures from the published raw data.

Usage: extract_data.py <path to tests/results/checkout-tail-20261022/raw> <out dir>

Writes:
  latency.json      per run (R0c, F1a, F1b, F2): n, mean, p50, p99, p99.9, max,
                    requests over 5 ms, and the complementary CDF on a log grid.
                    Source: sh-*/lat-all.txt.gz (pgbench per-transaction log,
                    latency counted from the scheduled start), t0/t1 window.
  sampler_r0c.json  pg_wait_sampling shares for the request backends in R0c,
                    ClientRead excluded. Source: sh-R0c/pgws-by-query.csv.
  r1b.json          per-request reconstruction from the patch trace rings of R1b
                    (same rule as shtail.py in the results directory): share of
                    all request wait time, dominant wait of each slow request
                    (> 5 ms server time), share of wait time inside slow
                    requests, and a few lock-dominated example requests with
                    their full wait sequence. Source: sh-R1b/rings.csv.gz.
The raw files live in the evidence-20261023 release of DmitryNFomin/pg_wait_tracer;
untar checkout-tail-20261022-raw.tar.gz inside tests/results/ first.
"""
import bisect, collections, csv, gzip, json, os, sys

R, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

res = {}
for run in ['sh-R0c', 'sh-F1a', 'sh-F1b', 'sh-F2']:
    d = f'{R}/{run}'
    t0, t1 = float(open(f'{d}/t0').read()), float(open(f'{d}/t1').read())
    lat = []
    with gzip.open(f'{d}/lat-all.txt.gz', 'rt') as f:
        for l in f:
            p = l.split(); end = int(p[4]) + int(p[5]) / 1e6
            if t0 <= end < t1: lat.append(int(p[2]) / 1000)
    lat.sort(); n = len(lat); q = lambda pp: lat[min(n - 1, int(pp * n))]
    grid = [0.5 * (1.08 ** i) for i in range(60)]
    ccdf = [(round(g, 3), (n - bisect.bisect_right(lat, g)) / n) for g in grid if g <= 40]
    res[run] = {'n': n, 'mean': sum(lat) / n, 'p50': q(.5), 'p99': q(.99), 'p999': q(.999), 'max': lat[-1],
                'gt5': sum(1 for x in lat if x > 5), 'ccdf': ccdf}
    print(run, n, f"mean {res[run]['mean']:.2f} p99 {q(.99):.2f} p99.9 {q(.999):.2f} max {lat[-1]:.1f} >5ms {res[run]['gt5']}")
json.dump(res, open(f'{OUT}/latency.json', 'w'))

tot = collections.Counter()
for qt, et, e, c in csv.reader(open(f'{R}/sh-R0c/pgws-by-query.csv')):
    if e == 'ClientRead': continue
    tot[f'{et}:{e}'] += int(c)
S = sum(tot.values())
json.dump({k: 100 * v / S for k, v in tot.items()}, open(f'{OUT}/sampler_r0c.json', 'w'))

rows = collections.defaultdict(list)
with gzip.open(f'{R}/sh-R1b/rings.csv.gz', 'rt') as f:
    for r in csv.reader(f):
        if r[1] == 'req': rows[r[0]].append((int(r[3]), int(r[4]), r[5], r[6], float(r[7] or 0)))
total = collections.Counter(); slow_dom = collections.Counter(); slow_time = collections.Counter(); n = ns = 0; ex = []
for pid, rs in rows.items():
    rs.sort(); seg = []; arrival = None
    for seq, ts, typ, ev, dur in rs:
        if typ == 'Client' and ev == 'ClientRead' and arrival is None: arrival = ts; continue
        if typ == 'Query' and ev == 'TxnCommit':
            if arrival is not None:
                srv = (ts - arrival) / 1e6; w = collections.Counter()
                for _, _, t2, e2, du in seg:
                    if t2 == 'Client': w['Client:in-transaction round trip'] += du / 1e3
                    elif t2 != 'Query': w[f'{t2}:{e2}'] += du / 1e3
                n += 1
                for k, v in w.items(): total[k] += v
                if srv > 5:
                    ns += 1; dom = w.most_common(1)[0] if w else ('CPU/other', 0)
                    if dom[1] < 0.5 * srv: dom = ('CPU/other', 0)
                    slow_dom[dom[0]] += 1
                    for k, v in w.items(): slow_time[k] += v
                    if dom[0] == 'Lock:transactionid' and 9 < srv < 14 and len(ex) < 4:
                        ex.append({'pid': pid, 'srv_ms': round(srv, 2), 'arrival': arrival, 'commit': ts,
                                   'events': [{'seq': s, 'end_rel_ms': round((t - arrival) / 1e6, 3), 'dur_ms': round(du / 1e3, 3), 'ev': f'{t2}:{e2}'}
                                              for s, t, t2, e2, du in seg]})
            seg = []; arrival = None; continue
        if arrival is not None: seg.append((seq, ts, typ, ev, dur))
T = sum(total.values()); St = sum(slow_time.values())
json.dump({'n': n, 'ns': ns, 'all': {k: 100 * v / T for k, v in total.items()}, 'dom': {k: 100 * v / ns for k, v in slow_dom.items()},
           'slowtime': {k: 100 * v / St for k, v in slow_time.items()}, 'examples': ex}, open(f'{OUT}/r1b.json', 'w'))
print(f'R1b: requests {n}, slow {ns}')
