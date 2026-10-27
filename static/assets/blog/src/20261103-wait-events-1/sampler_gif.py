#!/usr/bin/env python3
"""Sampler explainer GIF: one second of a backend, a 10 ms sampler sweeping across it.

Usage: sampler_gif.py OUT.gif FRAMES_DIR  (needs matplotlib, pillow, ffmpeg)
"""
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import os, subprocess, sys
OUT=sys.argv[1]; FR=sys.argv[2]; os.makedirs(FR,exist_ok=True)

# ---- theme ----
import os as _os
THEME = _os.environ.get('THEME', 'light')
if THEME == 'dark':
    BG, T1, T2, GRID, AXIS = '#1a1a19', '#ffffff', '#c3c2b7', '#383835', '#6f6e69'
    BLUE, ORANGE, AQUA, YELLOW, VIOLET, GREYBAR = '#3987e5', '#d95926', '#199e70', '#c98500', '#9085e9', '#55544f'
else:
    BG, T1, T2, GRID, AXIS = '#fcfcfb', '#0b0b0b', '#52514e', '#e4e3df', '#9a9993'
    BLUE, ORANGE, AQUA, YELLOW, VIOLET, GREYBAR = '#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#4a3aa7', '#c7c6c1'
NONE = '#d9d8d3' if THEME == 'light' else '#3a3a37'
plt.rcParams.update({'font.family':['DejaVu Sans'],'font.size':12,'text.color':T1,'figure.facecolor':BG,'axes.facecolor':BG,'savefig.facecolor':BG})
T=1000.0
io=[(50,30),(220,30),(400,30),(560,30),(720,30),(900,30)]
lock=[(10+k*33,2) for k in range(30) if not any(a<=10+k*33<a+30 for a,_ in io)][:30]
ticks=[5+10*i for i in range(100)]
def hit(t):
    for a,d in io:
        if a<=t<a+d: return 'io'
    for a,d in lock:
        if a<=t<a+d: return 'lock'
    return 'none'
hits=[hit(t) for t in ticks]
io_ms=sum(d for _,d in io); lock_ms=sum(d for _,d in lock)
FPS=12; SWEEP=8.0; HOLD=4.5; N=int(FPS*(SWEEP+HOLD))
def frame(i):
    tcur=min(T, T*(i/(FPS*SWEEP)))
    done = i>=FPS*SWEEP
    fig=plt.figure(figsize=(11,4.5),dpi=100)
    fig.text(0.04,0.94,'One second of one backend, and what a 10 ms sampler sees of it',fontsize=16,fontweight='bold',color=T1,va='center')
    ax=fig.add_axes([0.04,0.33,0.64,0.56]); ax.set_xlim(-10,1010); ax.set_ylim(1.9,9.3); ax.axis('off')
    # lane 1: truth
    ax.text(0,8.6,'What happened',fontsize=12,color=T2,va='center')
    y0=6.7
    ax.plot([0,1000],[y0,y0],color=AXIS,lw=1)
    for a,d in io: ax.add_patch(Rectangle((a,y0),d,1.3,color=BLUE,lw=0))
    for a,d in lock: ax.add_patch(Rectangle((a,y0),max(d,3),1.3,color=ORANGE,lw=0))
    for ms in (0,250,500,750,1000): ax.text(ms,y0-0.45,f'{ms} ms',fontsize=10,color=T2,ha='center',va='top')
    # lane 2: samples
    ax.text(0,4.4,'What the sampler sees: one look every 10 ms',fontsize=12,color=T2,va='center')
    y1=2.9
    ax.plot([0,1000],[y1,y1],color=AXIS,lw=1)
    for t,h in zip(ticks,hits):
        if t<=tcur: ax.plot([t],[y1],'o',ms=7,color={'io':BLUE,'lock':ORANGE,'none':NONE}[h],mec='none')
    if not done:
        ax.plot([tcur,tcur],[y1-0.6,y0+1.9],color=T2,lw=1.5,ls=(0,(3,3)))
    # right panel: live counters
    px=fig.add_axes([0.71,0.33,0.28,0.56]); px.axis('off'); px.set_xlim(0,1); px.set_ylim(0,10)
    n=sum(1 for t in ticks if t<=tcur); nio=sum(1 for t,h in zip(ticks,hits) if t<=tcur and h=='io'); nl=sum(1 for t,h in zip(ticks,hits) if t<=tcur and h=='lock')
    seen=sum(1 for a,d in lock if any(a<=t<a+d for t in ticks if t<=tcur))
    px.text(0,9.6,'The truth',fontsize=13,fontweight='bold',va='center')
    px.add_patch(Rectangle((0,8.55),0.06,0.5,color=BLUE,lw=0)); px.text(0.1,8.8,f'I/O: {len(io)} waits, {io_ms} ms  →  {io_ms/10:.0f}%',fontsize=12,va='center')
    px.add_patch(Rectangle((0,7.75),0.06,0.5,color=ORANGE,lw=0)); px.text(0.1,8.0,f'locks: {len(lock)} waits, {lock_ms} ms  →  {lock_ms/10:.0f}%',fontsize=12,va='center')
    px.text(0,6.3,"The sampler's report",fontsize=13,fontweight='bold',va='center')
    px.text(0,5.5,f'looks so far: {n:3d} of 100',fontsize=12,va='center',color=T2)
    sh=lambda k: f'{100*k/n:.0f}%' if n else '–'
    px.add_patch(Rectangle((0,4.45),0.06,0.5,color=BLUE,lw=0)); px.text(0.1,4.7,f'I/O: {nio} samples  →  {sh(nio)}',fontsize=12,va='center')
    px.add_patch(Rectangle((0,3.65),0.06,0.5,color=ORANGE,lw=0)); px.text(0.1,3.9,f'locks: {nl} samples  →  {sh(nl)}',fontsize=12,va='center')
    px.text(0,2.9,f'lock waits seen: {seen} of {len(lock)}',fontsize=12,va='center',color=T2)
    # bottom takeaway, always present, emphasized at the end
    fx=fig.add_axes([0.04,0.03,0.95,0.25]); fx.axis('off'); fx.set_xlim(0,1); fx.set_ylim(0,1)
    if done:
        fx.text(0,0.72,'The shares come out about right. What the sampler cannot report:',fontsize=13,fontweight='bold',va='center')
        fx.text(0,0.36,f'how many waits there were ({len(io)} or {len(lock)}: same kind of number), how long each one lasted, or their order.',fontsize=12,va='center')
        fx.text(0,0.06,f'Of the {len(lock)} short lock waits it saw {seen}. Synthetic timeline, drawn to scale.',fontsize=12,va='center',color=T2)
    else:
        fx.text(0,0.72,'Each dot is one look. A look records only the name of the wait in progress at that instant.',fontsize=12,va='center',color=T2)
        fx.text(0,0.36,'Blue: inside an I/O wait. Orange: inside a lock wait. Grey: not waiting.',fontsize=12,va='center',color=T2)
    fig.savefig(f'{FR}/f{i:03d}.png'); plt.close(fig)
for i in range(N): frame(i)
print('frames',N)
subprocess.run(['ffmpeg','-loglevel','error','-y','-framerate',str(FPS),'-i',f'{FR}/f%03d.png','-vf','fps=12,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=none','-loop','0',OUT],check=True)
print('gif ok', os.path.getsize(OUT)//1024,'KB')
