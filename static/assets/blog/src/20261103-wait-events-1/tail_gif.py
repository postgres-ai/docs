#!/usr/bin/env python3
"""Latency tail of the checkout request, four runs drawn one after another.

Usage: tail_gif.py latency.json OUT.gif FRAMES_DIR
latency.json holds, per run, the complementary CDF on a log grid, computed from
tests/results/checkout-tail-20261022/raw/sh-*/lat-all.txt.gz (see README).
"""
import json, os, subprocess, sys
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt

DATA, OUT, FR = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(FR, exist_ok=True)

# ---- theme ----
import os as _os
THEME = _os.environ.get('THEME', 'light')
if THEME == 'dark':
    BG, T1, T2, GRID, AXIS = '#1a1a19', '#ffffff', '#c3c2b7', '#383835', '#6f6e69'
    BLUE, ORANGE, AQUA, YELLOW, VIOLET, GREYBAR = '#3987e5', '#d95926', '#199e70', '#c98500', '#9085e9', '#55544f'
else:
    BG, T1, T2, GRID, AXIS = '#fcfcfb', '#0b0b0b', '#52514e', '#e4e3df', '#9a9993'
    BLUE, ORANGE, AQUA, YELLOW, VIOLET, GREYBAR = '#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#4a3aa7', '#c7c6c1'

plt.rcParams.update({'font.family': ['DejaVu Sans'], 'font.size': 12, 'text.color': T1, 'axes.labelcolor': T2,
                     'xtick.color': T2, 'ytick.color': T2, 'axes.edgecolor': GRID, 'grid.color': GRID,
                     'figure.facecolor': BG, 'axes.facecolor': BG, 'savefig.facecolor': BG})
lat = json.load(open(DATA))
RUNS = [('sh-R0c', BLUE, 'baseline', 'p99.9 = 11.0 ms\n972 requests over 5 ms'),
        ('sh-F1a', ORANGE, 'fix A: asynchronous commit', 'mean halves, p99.9 = 11.4 ms\nthe tail stays'),
        ('sh-F1b', YELLOW, 'fix B: 2 GB cache, no disk reads', 'reads gone, p99.9 = 11.3 ms\nthe tail stays'),
        ('sh-F2',  VIOLET, 'fix C: job in 5-row chunks', 'p99.9 = 5.8 ms, max 10.0 ms\nonly the tail moves')]
XMIN = 3.0
FPS, PER, HOLD = 12, 1.8, 4.5
N = int(FPS * (PER * len(RUNS) + HOLD))

def frame(i):
    s = i / FPS
    fig = plt.figure(figsize=(11, 5.4), dpi=100)
    fig.text(0.04, 0.95, 'Checkout requests slower than X, four runs of about 240,000 each', fontsize=16, fontweight='bold', va='center')
    ax = fig.add_axes([0.08, 0.17, 0.56, 0.70])
    # Linear axes, tail only: the count of requests slower than X, from 3 ms up
    ax.set_xlim(XMIN, 28); ax.set_ylim(0, 2900)
    ax.set_xticks([3, 5, 10, 15, 20, 25]); ax.set_xticklabels(['3 ms', '5 ms', '10 ms', '15 ms', '20 ms', '25 ms'])
    ax.set_yticks([0, 500, 1000, 1500, 2000, 2500]); ax.set_yticklabels(['0', '500', '1,000', '1,500', '2,000', '2,500'])
    ax.set_ylabel('requests slower than X')
    ax.minorticks_off(); ax.grid(True, lw=0.8); ax.set_xlabel('request latency, measured from its scheduled start')
    for sp in ax.spines.values(): sp.set_visible(False)
    ax.axhline(240, color=T2, lw=0.8, ls=(0, (2, 2)), zorder=2)
    ax.text(27.6, 290, 'p99.9: 240 requests, 1 in 1,000', fontsize=10, color=T2, ha='right')
    px = fig.add_axes([0.67, 0.17, 0.33, 0.70]); px.axis('off'); px.set_xlim(0, 1); px.set_ylim(0, 10)
    for k, (run, col, name, note) in enumerate(RUNS):
        start = k * PER; prog = min(1.0, max(0.0, (s - start) / (PER * 0.85)))
        pts = [(x, y * lat[run]['n']) for x, y in lat[run]['ccdf'] if XMIN <= x <= 28]
        n = int(len(pts) * prog)
        if n > 1:
            # The baseline is drawn dashed and on top: fixes A and B lie on it above 5 ms
            base = k == 0
            ax.plot([p[0] for p in pts[:n]], [p[1] for p in pts[:n]], color=col, lw=3.0 if base else 2.6,
                    ls=(0, (5, 3)) if base else '-', zorder=5 if base else 3, solid_capstyle='round')
        y = 9.4 - k * 2.3
        if prog > 0:
            px.plot([0.0, 0.08], [y, y], color=col, lw=5 if k else 3.0, ls=(0, (3, 2)) if k == 0 else '-', solid_capstyle='butt')
            px.text(0.11, y, name, fontsize=11, fontweight='bold', va='center')
            if prog >= 1: px.text(0.12, y - 0.95, note, fontsize=10, color=T2, va='center', linespacing=1.4)
    if s >= PER * len(RUNS):
        fig.text(0.04, 0.035, 'Fixes A and B leave the tail where it was. Fix C changes nothing in the database and cuts it.',
                 fontsize=11, fontweight='bold', va='center')
    else:
        fig.text(0.04, 0.035, 'Runs R0c, F1a, F1b, F2: 2,000 requests/s, 120 s each, about 240,000 requests per run.', fontsize=11, color=T2, va='center')
    fig.savefig(f'{FR}/f{i:03d}.png'); plt.close(fig)

for i in range(N): frame(i)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-i', f'{FR}/f%03d.png', '-vf',
                'fps=12,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=none', '-loop', '0', OUT], check=True)
print('ok', OUT, os.path.getsize(OUT) // 1024, 'KB', N, 'frames')
