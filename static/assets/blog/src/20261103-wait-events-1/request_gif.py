#!/usr/bin/env python3
"""One slow checkout request, replayed from its trace ring, slowed down about 500x.

Usage: request_gif.py r1b.json OUT.gif FRAMES_DIR
Needs matplotlib, pillow and ffmpeg. Data: r1b.json, produced from
tests/results/checkout-tail-20261022/raw/sh-R1b/rings.csv.gz (see README).
"""
import json, os, subprocess, sys
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

DATA, OUT, FR = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(FR, exist_ok=True)

# ---- theme ----
THEME = os.environ.get('THEME', 'light')
if THEME == 'dark':
    BG, T1, T2, GRID, AXIS = '#1a1a19', '#ffffff', '#c3c2b7', '#383835', '#6f6e69'
    BLUE, ORANGE, AQUA, YELLOW, VIOLET, GREYBAR = '#3987e5', '#d95926', '#199e70', '#c98500', '#9085e9', '#55544f'
else:
    BG, T1, T2, GRID, AXIS = '#fcfcfb', '#0b0b0b', '#52514e', '#e4e3df', '#9a9993'
    BLUE, ORANGE, AQUA, YELLOW, VIOLET, GREYBAR = '#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#4a3aa7', '#c7c6c1'
GREY = GREYBAR
COL = {'Client:ClientRead': VIOLET, 'IO:DataFileRead': YELLOW, 'Lock:transactionid': ORANGE,
       'LWLock:WALWrite': BLUE, 'IO:WalWrite': BLUE, 'IO:WalSync': BLUE}
NAME = {'Client:ClientRead': 'client round trip', 'IO:DataFileRead': 'disk read', 'Lock:transactionid': 'row lock',
        'LWLock:WALWrite': 'WAL write', 'IO:WalWrite': 'WAL write', 'IO:WalSync': 'WAL fsync'}
plt.rcParams.update({'font.family': ['DejaVu Sans'], 'font.size': 12, 'text.color': T1,
                     'figure.facecolor': BG, 'axes.facecolor': BG, 'savefig.facecolor': BG})

ex = json.load(open(DATA))['examples'][1]
END = ex['srv_ms']
segs = [(e['end_rel_ms'] - e['dur_ms'], e['end_rel_ms'], e['ev']) for e in ex['events'] if e['dur_ms'] > 0]
stmts = [(0.0, 0.03, 'BEGIN'), (0.275, 0.731, 'SELECT … FROM catalog'), (0.739, 11.86, 'UPDATE stock … WHERE item_id = $1'), (12.07, END, 'COMMIT')]
TICK = 3.7                      # the one 10 ms sampler tick that falls inside this request
FPS, PLAY, HOLD = 12, 6.5, 4.0
N = int(FPS * (PLAY + HOLD))
XMAX = 13.0

def frame(i):
    t = min(END, END * i / (FPS * PLAY)); done = i >= FPS * PLAY
    fig = plt.figure(figsize=(11, 4.6), dpi=100)
    fig.text(0.04, 0.94, f'One slow checkout, {END} ms, replayed from its own waits', fontsize=16, fontweight='bold', va='center')
    fig.text(0.04, 0.875, 'Backend 32748, patch run R1b. Slowed down about 500 times.', fontsize=11, color=T2, va='center')
    ax = fig.add_axes([0.16, 0.30, 0.82, 0.52]); ax.set_xlim(-0.1, XMAX); ax.set_ylim(0, 10); ax.axis('off')
    # lane 1: waits
    ax.text(-0.25, 8.55, 'what it waited on', fontsize=12, fontweight='bold', ha='right', va='center')
    ax.plot([0, XMAX - 0.3], [7.7, 7.7], color=AXIS, lw=1)
    for a, e, ev in segs:
        if a < t:
            ax.add_patch(Rectangle((a, 7.7), max(0.04, min(e, t) - a), 1.7, color=COL.get(ev, GREY), lw=0))
    lock_a, lock_e = [(a, e) for a, e, ev in segs if ev == 'Lock:transactionid'][0]
    if t > lock_a + 2.5:
        ax.text((lock_a + min(lock_e, t)) / 2, 8.55, f'Lock:transactionid · {min(lock_e, t) - lock_a:.2f} ms', color='white',
                fontsize=12, fontweight='bold', ha='center', va='center')
    for ms in range(0, 13, 2):
        ax.text(ms, 7.35, f'{ms} ms', fontsize=10, color=T2, ha='center', va='top')
    # lane 2: statements
    ax.text(-0.25, 5.3, 'which statement', fontsize=12, fontweight='bold', ha='right', va='center')
    for a, e, n in stmts:
        if a < t:
            ax.add_patch(Rectangle((a, 4.7), max(0.05, min(e, t) - a), 1.2, color=GREY, lw=0))
            if e - a > 1 and t > a + 3:
                ax.text((a + min(e, t)) / 2, 5.3, n, fontsize=11, ha='center', va='center')
    if t > 0.5: ax.text(0.0, 4.35, 'BEGIN · SELECT', fontsize=10, color=T2, va='top')
    if t > 12.2: ax.text(12.35, 4.35, 'COMMIT', fontsize=10, color=T2, ha='center', va='top')
    # lane 3: sampler
    ax.text(-0.25, 2.4, 'a 10 ms sampler', fontsize=12, fontweight='bold', ha='right', va='center')
    for k in range(-1, 3):
        tk = TICK + 10 * k
        if -0.1 < tk < XMAX: ax.plot([tk, tk], [2.0, 2.8], color=AXIS, lw=1)
    if t >= TICK:
        ax.plot([TICK], [2.4], 'o', ms=9, color=COL['Lock:transactionid'], mec='none')
        ax.text(TICK + 0.25, 2.4, 'one look: "Lock:transactionid"', fontsize=11, va='center')
    else:
        ax.text(0.0, 2.4, 'next look at 3.7 ms, then 13.7 ms', fontsize=11, color=T2, va='center')
    # sweep line and clock
    if not done:
        ax.plot([t, t], [1.6, 9.8], color=T2, lw=1.5, ls=(0, (3, 3)))
        ax.text(t, 9.95, f't = {t:4.1f} ms', fontsize=11, color=T2, ha='center', va='bottom')
    # footer
    fx = fig.add_axes([0.04, 0.03, 0.95, 0.2]); fx.axis('off'); fx.set_xlim(0, 1); fx.set_ylim(0, 1)
    waited = sum(min(e, t) - a for a, e, ev in segs if ev == 'Lock:transactionid' and a < t)
    if done:
        fx.text(0, 0.72, 'The truth: 10.97 of 12.63 ms waiting for one row lock, held by the background job.', fontsize=13, fontweight='bold', va='center')
        fx.text(0, 0.36, "The sampler's view of the same request: one or two looks, each saying only \"lock\". A 1 s sampler would almost never look.", fontsize=12, va='center')
        fx.text(0, 0.04, 'Disk read 0.27 ms, WAL write and fsync 0.53 ms, client round trips 0.5 ms in total.', fontsize=12, color=T2, va='center')
    else:
        fx.text(0, 0.72, f'waiting on the row lock so far: {waited:5.2f} ms', fontsize=13, fontweight='bold', va='center')
        fx.text(0, 0.36, 'purple: client round trip · yellow: disk read · orange: row lock · blue: WAL write and fsync', fontsize=12, color=T2, va='center')
    fig.savefig(f'{FR}/f{i:03d}.png'); plt.close(fig)

for i in range(N): frame(i)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-i', f'{FR}/f%03d.png', '-vf',
                'fps=12,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=none', '-loop', '0', OUT], check=True)
print('ok', OUT, os.path.getsize(OUT) // 1024, 'KB', N, 'frames')
