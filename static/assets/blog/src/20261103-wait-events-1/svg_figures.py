#!/usr/bin/env python3
"""Static SVG figures for post 1 (plus the CSS-animated SVG twin of the sampler GIF).

Usage: svg_figures.py DATA_DIR OUT_DIR
Reads DATA_DIR/latency.json and DATA_DIR/r1b.json (from extract_data.py); writes
  OUT_DIR/20261103-wait-events-1-sampling.svg
  OUT_DIR/20261103-wait-events-1-latency-tail.svg
  OUT_DIR/20261103-wait-events-1-profile-vs-tail.svg
  OUT_DIR/20261103-wait-events-1-one-slow-request.svg
Standard library only. Colours follow the site palette; each figure has a light file and a -dark file.
"""
import json, math, sys, os

DATA, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
STYLE = """<style>
.bg{fill:#fcfcfb}.t1{fill:#0b0b0b}.t2{fill:#52514e}.grid{stroke:#e4e3df}.axis{stroke:#9a9993}.gap{stroke:#fcfcfb}
.s1{fill:#2a78d6}.s2{fill:#eb6834}.s3{fill:#1baf7a}.s4{fill:#eda100}.s5{fill:#4a3aa7}.n{fill:#c7c6c1}.ann{stroke:#52514e}
.l1{stroke:#2a78d6}.l2{stroke:#eb6834}.l3{stroke:#1baf7a}.l4{stroke:#eda100}
text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
@media (prefers-color-scheme:dark){.bg{fill:#1a1a19}.t1{fill:#fff}.t2{fill:#c3c2b7}.grid{stroke:#383835}.axis{stroke:#6f6e69}.gap{stroke:#1a1a19}.ann{stroke:#c3c2b7}
.s1{fill:#3987e5}.s2{fill:#d95926}.s3{fill:#199e70}.s4{fill:#c98500}.s5{fill:#9085e9}.n{fill:#55544f}
.l1{stroke:#3987e5}.l2{stroke:#d95926}.l3{stroke:#199e70}.l4{stroke:#c98500}}
</style>"""
esc = lambda s: s.replace('&', '&amp;').replace('<', '&lt;')

def svg(w, h, title, desc, body, extra=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="t d">\n'
            f'<title id="t">{title}</title>\n<desc id="d">{desc}</desc>\n{STYLE}{extra}\n<rect class="bg" width="{w}" height="{h}" rx="8"/>\n'
            + '\n'.join(body) + '\n</svg>')

MEDIA = '@media (prefers-color-scheme:dark){'

def write(name, content):
    # The post picks light or dark by the site theme (ThemedImage), and an <img> SVG
    # cannot see that theme, so each figure is written twice with fixed colours.
    i = content.index(MEDIA); j = content.index('</style>', i)
    dark_rules = content[i + len(MEDIA):j].rstrip()[:-1]
    light = content[:i] + content[j:]
    dark = content[:i] + dark_rules + '\n' + content[j:]
    for n, c in ((name, light), (name.replace('.svg', '-dark.svg'), dark)):
        open(os.path.join(OUT, n), 'w').write(c); print('wrote', n)

# ---------------- 1. sampler explainer, CSS-animated ----------------
def fig_sampling():
    W, H = 760, 330; L, R = 40, 560; T = 1000.0
    X = lambda ms: L + (R - L) * ms / T
    io = [(50, 30), (220, 30), (400, 30), (560, 30), (720, 30), (900, 30)]
    lock = [(10 + k * 33, 2) for k in range(30) if not any(a <= 10 + k * 33 < a + 30 for a, _ in io)][:30]
    ticks = [5 + 10 * i for i in range(100)]
    def hit(t):
        for a, d in io:
            if a <= t < a + d: return 'io'
        for a, d in lock:
            if a <= t < a + d: return 'lock'
        return 'none'
    hits = [hit(t) for t in ticks]; nio = hits.count('io'); nl = hits.count('lock')
    seen = sum(1 for a, d in lock if any(a <= t < a + d for t in ticks))
    io_ms = sum(d for _, d in io); lock_ms = sum(d for _, d in lock); DUR = 10.0
    b = [f'<text class="t1" x="{L}" y="30" font-size="15" font-weight="600">One second of one backend, and what a 10 ms sampler sees of it</text>']
    y0 = 70
    b.append(f'<text class="t2" x="{L}" y="{y0-10}" font-size="12">What happened (the truth):</text>')
    b.append(f'<line class="axis" x1="{L}" x2="{R}" y1="{y0+22}" y2="{y0+22}" stroke-width="1"/>')
    for a, d in io: b.append(f'<rect class="s1" x="{X(a):.1f}" y="{y0}" width="{X(a+d)-X(a):.1f}" height="22" rx="2"/>')
    for a, d in lock: b.append(f'<rect class="s2" x="{X(a):.1f}" y="{y0}" width="{max(1.5, X(a+d)-X(a)):.1f}" height="22"/>')
    for ms in (0, 250, 500, 750, 1000): b.append(f'<text class="t2" x="{X(ms):.1f}" y="{y0+38}" font-size="11" text-anchor="middle">{ms} ms</text>')
    b.append(f'<rect class="s1" x="{R+20}" y="{y0}" width="12" height="12"/><text class="t1" x="{R+38}" y="{y0+11}" font-size="12">{len(io)} I/O waits, 30 ms each</text>')
    b.append(f'<rect class="s2" x="{R+20}" y="{y0+20}" width="12" height="12"/><text class="t1" x="{R+38}" y="{y0+31}" font-size="12">{len(lock)} lock waits, 2 ms each</text>')
    y1 = 150
    b.append(f'<text class="t2" x="{L}" y="{y1-10}" font-size="12">What the sampler sees (one look every 10 ms):</text>')
    b.append(f'<line class="axis" x1="{L}" x2="{R}" y1="{y1+12}" y2="{y1+12}" stroke-width="1"/>')
    for t, h in zip(ticks, hits):
        b.append(f'<circle class="{ {"io":"s1","lock":"s2","none":"n"}[h] } dot" cx="{X(t):.1f}" cy="{y1+12}" r="3.5" style="animation-delay:{DUR*t/T:.2f}s"/>')
    b.append(f'<line class="axis sweep" x1="{L}" x2="{L}" y1="{y0-4}" y2="{y1+26}" stroke-width="1.5" stroke-dasharray="3 3"/>')
    y2 = 215
    b.append(f'<g class="tally"><text class="t1" x="{L}" y="{y2}" font-size="13" font-weight="600">Sampler\'s report</text>'
             f'<text class="t1" x="{L}" y="{y2+22}" font-size="13">I/O: {nio} of 100 samples → {nio}%</text>'
             f'<text class="t1" x="{L}" y="{y2+42}" font-size="13">Lock: {nl} of 100 samples → {nl}%</text>'
             f'<text class="t2" x="{L}" y="{y2+62}" font-size="12">It cannot tell {len(io)} waits from {len(lock)}, and it saw only {seen} of the {len(lock)} lock waits.</text></g>')
    b.append(f'<g class="tally"><text class="t1" x="{R-200}" y="{y2}" font-size="13" font-weight="600">The truth</text>'
             f'<text class="t1" x="{R-200}" y="{y2+22}" font-size="13">I/O: {len(io)} waits, {io_ms} ms → {io_ms/10:.0f}%</text>'
             f'<text class="t1" x="{R-200}" y="{y2+42}" font-size="13">Lock: {len(lock)} waits, {lock_ms} ms → {lock_ms/10:.0f}%</text></g>')
    b.append(f'<text class="t2" x="{L}" y="{H-14}" font-size="11">Shares come out right. Counts, individual durations and order are gone. Synthetic timeline, drawn to scale.</text>')
    extra = f"""<style>
.dot{{opacity:0;animation:ap 0.01s linear forwards}}@keyframes ap{{to{{opacity:1}}}}
.sweep{{animation:sw {DUR}s linear forwards}}@keyframes sw{{to{{transform:translateX({R-L}px)}}}}
.tally{{opacity:0;animation:ap 0.4s ease-out forwards;animation-delay:{DUR+0.3:.1f}s}}
@media (prefers-reduced-motion:reduce){{.dot,.tally{{opacity:1;animation:none}}.sweep{{display:none}}}}
</style>"""
    write('20261103-wait-events-1-sampling.svg', svg(W, H, 'What a 10 ms sampler sees of one second of waits',
          f'A one-second timeline with {len(io)} I/O waits of 30 ms and {len(lock)} lock waits of 2 ms. A sampler looking every 10 ms records {nio} I/O samples and {nl} lock samples: the shares are about right, but it saw only {seen} of the {len(lock)} lock waits and cannot report counts or durations.', b, extra))

# ---------------- 2. latency tail, static ----------------
def fig_tail():
    lat = json.load(open(os.path.join(DATA, 'latency.json')))
    W, H = 760, 420; L, R, Tp, Bt = 70, 730, 52, 340
    xmin, xmax, ymin, ymax = 0.5, 40, 1e-4, 1
    xx = lambda v: L + (R - L) * (math.log10(v) - math.log10(xmin)) / (math.log10(xmax) - math.log10(xmin))
    yy = lambda v: Bt - (Bt - Tp) * (math.log10(v) - math.log10(ymin)) / (math.log10(ymax) - math.log10(ymin))
    b = [f'<text class="t1" x="{L}" y="30" font-size="16" font-weight="600">Share of checkout requests slower than X, four runs</text>']
    for v, lab in ((1, '100%'), (1e-1, '10%'), (1e-2, '1%'), (1e-3, '0.1%'), (1e-4, '0.01%')):
        b.append(f'<line class="grid" x1="{L}" x2="{R}" y1="{yy(v):.1f}" y2="{yy(v):.1f}" stroke-width="1"/>')
        b.append(f'<text class="t2" x="{L-8}" y="{yy(v)+4:.1f}" font-size="12" text-anchor="end">{lab}</text>')
    for v in (0.5, 1, 2, 5, 10, 20, 40):
        b.append(f'<line class="grid" x1="{xx(v):.1f}" x2="{xx(v):.1f}" y1="{Tp}" y2="{Bt}" stroke-width="1"/>')
        b.append(f'<text class="t2" x="{xx(v):.1f}" y="{Bt+18}" font-size="12" text-anchor="middle">{v:g} ms</text>')
    b.append(f'<text class="t2" x="{(L+R)/2}" y="{Bt+40}" font-size="12" text-anchor="middle">request latency, measured from its scheduled start (log scale)</text>')
    b.append(f'<text class="t2" x="{L+6}" y="{yy(1e-3)-5:.1f}" font-size="12">p99.9: 1 request in 1,000 is slower than this</text>')
    series = [('sh-R0c', 'l1', 's1', 'baseline'), ('sh-F1a', 'l2', 's2', 'fix A: synchronous_commit = off'),
              ('sh-F1b', 'l4', 's4', 'fix B: 2 GB cache, no disk reads'), ('sh-F2', 'l3', 's3', 'fix C: background job in 5-row chunks')]
    for run, lc, sc, name in series:
        pts = [(xx(x), yy(max(y, ymin))) for x, y in lat[run]['ccdf'] if y > 0 and x >= xmin]
        b.append(f'<path class="{lc}" d="M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + '" fill="none" stroke-width="2.5" stroke-linejoin="round"/>')
    b.append(f'<text class="t1" x="724" y="{yy(1e-3)-22:.1f}" font-size="12" text-anchor="end">baseline, A and B:</text>')
    b.append(f'<text class="t1" x="724" y="{yy(1e-3)-8:.1f}" font-size="12" text-anchor="end">p99.9 ≈ 11 ms</text>')
    b.append(f'<text class="t1" x="{xx(5.8)-8:.1f}" y="{yy(1e-3)+26:.1f}" font-size="12" text-anchor="end">C: 5.8 ms</text>')
    for i, (run, lc, sc, name) in enumerate(series):
        ny = 283 + i * 17
        b.append(f'<rect class="{sc}" x="86" y="{ny}" width="16" height="4"/><text class="t1" x="110" y="{ny+5}" font-size="12">{esc(name)}</text>')
    b.append(f'<text class="t2" x="{L}" y="{H-24}" font-size="11">Runs R0c, F1a, F1b, F2: 2,000 requests/s, 120 s each, about 240,000 requests per run.</text>')
    b.append(f'<text class="t2" x="{L}" y="{H-9}" font-size="11">Fixes A and B move the bulk of requests and leave the tail; fix C moves only the tail.</text>')
    write('20261103-wait-events-1-latency-tail.svg', svg(W, H, 'Latency tail of the checkout request in four runs',
          'Complementary distribution of request latency on log axes for baseline, synchronous_commit off, 2 GB cache, and the chunked background job. The first two overlap the baseline above 5 ms; the chunked job alone cuts the tail: p99.9 from 11.0 to 5.8 ms, max from 26.7 to 10.0 ms.', b))

# ---------------- 3. profile share vs slow-request share ----------------
def fig_profile():
    r = json.load(open(os.path.join(DATA, 'r1b.json')))
    evs = [('LWLock:WALWrite', 'WAL write lock'), ('IO:WalSync', 'WAL fsync'), ('Client:in-transaction round trip', 'client round trip inside the transaction'),
           ('IO:DataFileRead', 'disk read'), ('Lock:transactionid', 'row lock (Lock:transactionid)')]
    W, H = 760, 330; L, R, rowh, top = 300, 720, 44, 70
    b = [f'<text class="t1" x="40" y="28" font-size="15" font-weight="600">Where the time went vs. what made requests slow</text>',
         f'<rect class="s1" x="40" y="42" width="12" height="12"/><text class="t1" x="58" y="53" font-size="12">share of all wait time (what a profile ranks by)</text>',
         f'<rect class="s2" x="380" y="42" width="12" height="12"/><text class="t1" x="398" y="53" font-size="12">share of slow requests (&gt; 5 ms) where this was the main wait</text>']
    sc = lambda v: (R - L) * v / 60
    for i, (k, lab) in enumerate(evs):
        y = top + i * rowh; a = r['all'].get(k, 0); dm = r['dom'].get(k, 0)
        b.append(f'<text class="t1" x="{L-10}" y="{y+22}" font-size="12" text-anchor="end">{esc(lab)}</text>')
        b.append(f'<rect class="s1" x="{L}" y="{y+4}" width="{sc(a):.1f}" height="14" rx="2"/><text class="t1" x="{L+sc(a)+6:.1f}" y="{y+15}" font-size="11">{a:.1f}%</text>')
        b.append(f'<rect class="s2" x="{L}" y="{y+21}" width="{max(sc(dm), 0.1):.1f}" height="14" rx="2"/><text class="t1" x="{L+sc(dm)+6:.1f}" y="{y+32}" font-size="11">{dm:.0f}%</text>')
    b.append(f'<line class="axis" x1="{L}" x2="{L}" y1="{top}" y2="{top+len(evs)*rowh}" stroke-width="1"/>')
    b.append(f'<text class="t2" x="40" y="{H-14}" font-size="11">Patch run R1b: {r["n"]:,} requests rebuilt from trace rings over ~50 s; {r["ns"]} of them took more than 5 ms of server time.</text>')
    write('20261103-wait-events-1-profile-vs-tail.svg', svg(W, H, 'Profile share versus slow-request share per wait event',
          'Paired bars for five wait events. WAL write lock 34.5% of all wait time but the main wait in 12% of slow requests; WAL fsync 30% vs 3%; client round trip 20.5% vs 33%; disk read 11.5% vs 0%; row lock 2.5% of all wait time but the main wait in 51% of slow requests.', b))

# ---------------- 4. one slow request, static ----------------
def fig_request():
    r = json.load(open(os.path.join(DATA, 'r1b.json'))); ex = r['examples'][1]
    W, H = 760, 360; L, R, T = 150, 730, 13.0
    X = lambda ms: L + (R - L) * ms / T
    segs = [(e['end_rel_ms'] - e['dur_ms'], e['end_rel_ms'], e['ev']) for e in ex['events'] if e['dur_ms'] > 0]
    cls = {'Client:ClientRead': 's5', 'IO:DataFileRead': 's4', 'Lock:transactionid': 's2', 'LWLock:WALWrite': 's1', 'IO:WalWrite': 's1', 'IO:WalSync': 's1'}
    b = [f'<text class="t1" x="40" y="30" font-size="16" font-weight="600">One slow checkout, {ex["srv_ms"]} ms, rebuilt from its own waits</text>',
         f'<text class="t2" x="40" y="50" font-size="12">Backend {ex["pid"]}, patch run R1b. Each bar is one wait with its measured length.</text>']
    y = 100
    b.append(f'<text class="t1" x="{L-12}" y="{y+17}" font-size="13" text-anchor="end" font-weight="600">what it waited on</text>')
    b.append(f'<line class="axis" x1="{L}" x2="{R}" y1="{y+26}" y2="{y+26}" stroke-width="1"/>')
    for a, e, ev in segs: b.append(f'<rect class="{cls.get(ev, "n")}" x="{X(a):.1f}" y="{y}" width="{max(2, X(e)-X(a)):.1f}" height="26" rx="2"/>')
    b.append(f'<text x="{X(6.3):.1f}" y="{y+18}" font-size="13" text-anchor="middle" fill="#fff" font-weight="600">Lock:transactionid · 10.97 ms · 87% of the request</text>')
    for ms in range(0, 14, 2): b.append(f'<text class="t2" x="{X(ms):.1f}" y="{y+42}" font-size="11" text-anchor="middle">{ms} ms</text>')
    ys = 165
    b.append(f'<text class="t1" x="{L-12}" y="{ys+14}" font-size="13" text-anchor="end" font-weight="600">which statement</text>')
    for a, e, n in ((0.0, 0.03, ''), (0.275, 0.731, ''), (0.739, 11.86, 'UPDATE stock … WHERE item_id = $1'), (12.07, ex['srv_ms'], '')):
        b.append(f'<rect class="n" x="{X(a):.1f}" y="{ys}" width="{max(3, X(e)-X(a)):.1f}" height="20" rx="2"/>')
        if n: b.append(f'<text class="t1" x="{(X(a)+X(e))/2:.1f}" y="{ys+14}" font-size="12" text-anchor="middle">{n}</text>')
    b.append(f'<text class="t2" x="{X(0.0):.1f}" y="{ys+34}" font-size="11">BEGIN, then SELECT … FROM catalog (0.46 ms)</text>')
    b.append(f'<text class="t2" x="{X(12.35):.1f}" y="{ys+34}" font-size="11" text-anchor="middle">COMMIT</text>')
    yt = 240
    b.append(f'<text class="t1" x="{L-12}" y="{yt+4}" font-size="13" text-anchor="end" font-weight="600">a 10 ms sampler</text>')
    b.append(f'<line class="ann" x1="{X(3.7):.1f}" x2="{X(3.7):.1f}" y1="{y-8}" y2="{yt+6}" stroke-width="1.5" stroke-dasharray="3 3"/>')
    b.append(f'<circle class="s2" cx="{X(3.7):.1f}" cy="{yt}" r="5"/>')
    b.append(f'<text class="t2" x="{X(3.7)+10:.1f}" y="{yt+4}" font-size="12">at most one look at this request, and only the wait\'s name</text>')
    for i, (c, n) in enumerate([('s5', 'client round trip, 0.5 ms in total'), ('s4', 'disk read, 0.27 ms'), ('s2', 'row lock, 10.97 ms'), ('s1', 'WAL write + fsync, 0.53 ms')]):
        b.append(f'<rect class="{c}" x="{40+i*180}" y="{H-62}" width="12" height="12"/><text class="t1" x="{58+i*180}" y="{H-51}" font-size="11">{n}</text>')
    b.append(f'<text class="t2" x="40" y="{H-22}" font-size="11">The dashboard ranked the commit path first and disk reads high: here 0.53 and 0.27 ms. The lock it ranked last: 10.97 ms.</text>')
    write('20261103-wait-events-1-one-slow-request.svg', svg(W, H, 'Anatomy of one slow checkout request',
          'Timeline of a 12.63 ms request: BEGIN, a 0.27 ms disk read for the catalog lookup, then 10.97 ms waiting on a row lock inside the stock update, then 0.53 ms of WAL write and fsync at COMMIT. A 10 ms sampler would catch it in at most one sample.', b))

fig_sampling(); fig_tail(); fig_profile(); fig_request()
