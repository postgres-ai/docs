import React, { useEffect, useRef, useState } from 'react'
import styles from './styles.module.css'
import useBaseUrl from '@docusaurus/useBaseUrl'

// One GPU draw call for the database, orbital streams and their clone destinations.
// HTML explains the workflow. This point-cloud sculpture is an illustration, not live telemetry.
const VERTEX = `
precision highp float;
attribute vec3 aHome;
attribute vec3 aClone;
attribute vec3 aReview;
attribute vec3 aScatter;
attribute vec2 aMeta;
uniform float uTime, uCloneTime, uOpening, uClone, uCalm, uDpr, uScale, uPulse, uDiagnose, uReview, uLight;
uniform vec2 uViewport, uPointer;
uniform float uPointerOn;
varying vec3 vColor;
varying float vAlpha;
mat3 rotY(float a) { float c=cos(a),s=sin(a); return mat3(c,0.,s,0.,1.,0.,-s,0.,c); }
mat3 rotX(float a) { float c=cos(a),s=sin(a); return mat3(1.,0.,0.,0.,c,-s,0.,s,c); }
void main() {
 float seed=aMeta.x, extra=step(2.5,aMeta.y), disposable=step(3.5,aMeta.y);
 float edge=step(1.5,aMeta.y)*(1.-extra);
 float orbit=min(aMeta.y,1.)*(1.-edge);
 orbit *= 1.-extra;
 float opening=smoothstep(seed*.18, .78+seed*.18, uOpening);
 float group=floor(seed*3.);
 float life=fract(uCloneTime/6.+group/3.);
 float dissolve=smoothstep(.62,.98,life);
 vec3 test=aHome*.88+vec3(-85.,0.,0.);
 vec3 departing=aClone+vec3(50.+life*205.,sin(group*2.)*16.,group*18.);
 departing += vec3(25.+fract(seed*47.)*65.,sin(seed*153.)*65.,cos(seed*127.)*50.)*dissolve;
 test=mix(test,departing,disposable);
 vec3 home=mix(mix(aHome,test,uClone),aReview,uReview);
 float focus=(1.-orbit)*(1.-edge)*(1.-extra)*step(.78,seed);
 vec2 diagnosticCell=floor(fract(aScatter.xy*vec2(.017,.019))*6.);
 float alert=(1.-step(.5,abs(diagnosticCell.x-3.)))*(1.-step(.5,abs(diagnosticCell.y-2.)));
 vec3 isolated=vec3(165.,25.,-35.)+vec3((diagnosticCell-2.5)*12.,fract(aScatter.z*.021)*4.-2.);
 home=mix(home,isolated,focus*uDiagnose);
 home.x -= (1.-focus)*uDiagnose*35.;
 home.y=mix(home.y,sin(uTime*1.1)*95.+seed*12.,orbit*uDiagnose);
 float drift=uTime * mix(.09,.22,orbit);
 // One shared transform per state: sheet, checks and rows must stay together.
 float yaw=drift*(1.-uClone)*(1.-uReview)*(1.-uDiagnose);
 yaw += uClone*(-.30+sin(uTime*.45)*.12);
 yaw += uReview*sin(uTime*.36)*.075;
 home=rotY(yaw)*home;
 vec3 wild=aScatter;
 wild.x += sin(uTime*.8+seed*60.)*22.;
 wild.y += cos(uTime*.65+seed*35.)*18.;
 vec3 p=mix(wild,home,opening);
 float trouble=(1.-edge)*(1.-extra)*(1.-uCalm)*(1.-orbit)*smoothstep(.78,1.,seed);
 p += vec3(sin(uTime*1.5+seed*33.),cos(uTime*2.+seed*44.),sin(seed*55.+uTime))*trouble*14.;
 p += normalize(p + vec3(.001)) * uPulse * (14.+seed*45.)*(1.-uReview);
 p *= 1.+uReview*uPulse*.035;
 // Keep the face within its viewing cone while the complete Review scene turns.
 float pointerTurn=mix(1.,.5,uReview);
 p=rotX(mix(mix(.33,.16,uClone),.04+sin(uTime*.28)*.045,uReview)+uPointer.y*.14*pointerTurn)*rotY(uPointer.x*.24*pointerTurn)*p;
 float perspective=650./(650.+p.z);
 vec2 pixel=p.xy*perspective*uScale;
 vec2 clip=pixel*2./uViewport;
 vec2 delta=clip-uPointer;
 // A moving inspection light reveals detail without pulling the sculpture apart.
 float influence=exp(-dot(delta,delta)*16.)*uPointerOn;
 gl_Position=vec4(clip,0.,1.);
 float sweep=pow(max(0.,sin(seed*6.283-uTime*1.3)),32.);
 gl_PointSize=clamp((1.6+seed*1.4+uClone*.15+influence*.9+orbit*sweep*5.*(1.-uReview)+focus*uDiagnose*1.5)*perspective*uDpr,1.,18.);
 float signal=(1.-uClone)*(1.-uReview)*(1.-orbit)*(1.-disposable);
 gl_PointSize *= 1.+signal*(1.-edge)*.18;
 gl_PointSize *= (1.+uLight*.28)*(1.+uReview*.5*(1.-step(30.,aReview.x))*(1.-orbit));
 vec3 warm=vec3(1.,.33,.075), pale=vec3(1.,.78,.52), cool=vec3(.36,.88,.83);
 vColor=mix(mix(warm,pale,seed*.6),cool,orbit*.72+uCalm*.12);
 vColor=mix(vColor,vec3(1.,.22,.06),trouble*.7);
 vColor=mix(vColor,vec3(1.,.86,.65),edge*.7);
 vColor=mix(vColor,mix(cool*.6,vec3(1.,.38,.12),alert),focus*uDiagnose);
 vColor=mix(vColor,vec3(.55,1.,.79),uReview*step(30.,aReview.x));
 vColor *= mix(1.,mix(.42,1.,1.-smoothstep(-42.,42.,aClone.z)),uClone);
 float check=uReview*step(70.,aReview.x)*(1.-step(102.,aReview.x));
 vColor=mix(vColor,vec3(.25,1.,.48),check);
 vColor=mix(vColor,vec3(1.,.60,.23),uClone*disposable*.65);

 vAlpha=(.25+.65*perspective)*mix(.8,.28+sweep*.8,orbit) * mix(1.,.92+focus*.37,uDiagnose*(1.-orbit))*mix(1.,1.15,uClone);
 vec3 lightWarm=vec3(.74,.20,.025), lightCool=vec3(.025,.36,.30);
 vec3 lightColor=mix(lightWarm,lightCool,orbit*.85);
 lightColor=mix(lightColor,mix(lightCool,lightWarm,alert),focus*uDiagnose);
 lightColor=mix(lightColor,vec3(.025,.38,.18),uReview*step(30.,aReview.x));
 lightColor *= mix(.80,1.12,seed)*mix(1.,mix(.72,1.,1.-smoothstep(-42.,42.,aClone.z)),uClone);
 vColor=mix(vColor,lightColor,uLight);
 vAlpha=mix(vAlpha,.55,uReview*step(30.,aReview.x));
 vAlpha *= mix(1.,max(step(.86,fract(seed*37.)),alert)*(.45+alert*.55),focus*uDiagnose);
 vAlpha *= mix(1.,.10,orbit*uClone);
 // Reuse detail particles in Monitor and Diagnose too: denser walls at no extra draw cost.
 vAlpha *= mix(1.,mix(1.,uClone,disposable),extra);
 vAlpha *= 1.+signal*.18;
 vAlpha *= mix(1.,.12,uReview*orbit*(1.-step(30.,aReview.x)));
 vAlpha *= mix(1.,smoothstep(0.,.16,life)*(1.-smoothstep(.66,.98,life)),disposable);
 // Carve openings all the way through: rear particles cannot fill the holes.
 // Perspective-tapered, countersunk cavities rotate with the entire cylinder.
 // Widening inside the shell keeps its rear wall out of the pointer's view cone.
 vec2 face=aReview.xy*((650.-100.)/(650.+aReview.z))-vec2(-90.,0.);
 // The eyes occupy the upper tier; the broad upward crescent fills the lower.
 // At mobile size these remain two open circles and a single readable smile.
 float wallX=aReview.x+90.;
 float frontZ=-sqrt(max(0.,104.*104.-wallX*wallX));
 float cavity=max(0.,aReview.z-frontZ)*.42;
 float eyes=1.-smoothstep(.96,1.03,min(length((face-vec2(-35.,66.))/(vec2(16.,15.)+cavity)),length((face-vec2(35.,66.))/(vec2(16.,15.)+cavity))));
 float smileX=face.x/60.;
 float smileTop=-52.+14.*smileX*smileX;
 float smileBottom=-74.+36.*smileX*smileX;
 float mouth=smoothstep(smileBottom-.7-cavity,smileBottom+.7-cavity,face.y)*(1.-smoothstep(smileTop-.7+cavity,smileTop+.7+cavity,face.y))*(1.-smoothstep(59.+cavity,61.+cavity,abs(face.x)));
 vAlpha *= 1.-max(eyes,mouth)*uReview;
 // Apply the same inspection contrast after all mode-specific colour/opacity.
 vAlpha *= mix(1.,.60+influence*.95,uPointerOn)*(1.+uLight*.18);
 vColor *= mix(1.,.75+influence*.55,uPointerOn);
}
`
const FRAGMENT = `
precision mediump float;
uniform highp float uLight;
varying vec3 vColor;
varying float vAlpha;
void main() {
 float r=length(gl_PointCoord-.5)*2.;
 if(r>1.) discard;
 float core=exp(-r*r*mix(5.,3.4,uLight));
 gl_FragColor=vec4(vColor,core*vAlpha);
}
`

export default function ControlUniverse({ step, paused }: { step: number; paused: boolean }) {
  const logoUrl = useBaseUrl('/img/logo.svg')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef({ step, paused })
  inputRef.current = { step, paused }
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return undefined
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power' })
    if (!gl) return undefined
    const shaders: WebGLShader[] = []
    const buffers: WebGLBuffer[] = []
    let program: WebGLProgram | null = null
    let raf = 0, alive = true, visible = false, lost = false, lastStep = -1
    let width = 1, height = 1, dpr = 1, clock = 0, cloneClock = 0, last = 0, opening = 0, clone = 0, calm = 0, pulse = 0, diagnose = 0, review = 0
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, on: 0 }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let motionReduced = reduce.matches

    function compile(type: number, source: string) {
      const shader = gl!.createShader(type)
      if (!shader) throw new Error('No shader')
      shaders.push(shader)
      gl!.shaderSource(shader, source)
      gl!.compileShader(shader)
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error('Shader unavailable')
      return shader
    }
    try {
      program = gl.createProgram()
      if (!program) throw new Error('No program')
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Renderer unavailable')
    } catch {
      shaders.forEach(s => gl.deleteShader(s))
      if (program) gl.deleteProgram(program)
      return undefined
    }
    gl.useProgram(program)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    const uniform = (name: string) => gl.getUniformLocation(program!, name)
    const uniforms = Object.fromEntries(['uTime', 'uCloneTime', 'uOpening', 'uClone', 'uCalm', 'uDpr', 'uScale', 'uPulse', 'uViewport', 'uPointer', 'uPointerOn', 'uDiagnose', 'uReview', 'uLight'].map(k => [k, uniform(k)]))
    const homes: number[] = [], clones: number[] = [], reviews: number[] = [], scatters: number[] = [], metadata: number[] = []
    let seed = 731
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
    const narrow = window.innerWidth < 768
    const dataCount = narrow ? 2600 : 6200
    function add(x: number, y: number, z: number, orbit: number, index: number) {
      homes.push(x, y, z)
      clones.push(x, y, z)
      if (orbit === 1) {
        if (index % 2) {
          const t = index / (narrow ? 480 : 1000) * 4
          const side = Math.floor(t) % 4, f = t % 1
          reviews.push(side === 0 ? 60 + f * 175 : side === 1 ? 235 : side === 2 ? 235 - f * 175 : 60,
            side === 0 ? 130 : side === 1 ? 130 - f * 260 : side === 2 ? -130 : -130 + f * 260, -25)
        } else reviews.push(x * .4 - 90, y * .5, z * .4)
      } else if (orbit === 3) {
        // Fold Review detail onto the visible wall; Test keeps its original volume.
        // A dense front surface gives the removed particles a crisp silhouette.
        const radius = Math.max(1, Math.hypot(x, z))
        const tier = Math.floor((y + 82) / 72)
        reviews.push(x / radius * 103.04 - 90,
          (tier * 72 - 82 + (index * .61803398875 % 1) * 48) * .92 - 8,
          -Math.abs(z) / radius * 103.04)
      } else if (index % 2) {
        const row = 85 - (Math.floor(index / 2) % 3) * 65
        if (index % 8 === 1 || index % 8 === 3) {
          // Square and tick share the sheet plane, so neither can drift away.
          const t = rand()
          if (index % 8 === 1) {
            const side = Math.floor(t * 4), f = t * 4 % 1
            reviews.push(side === 0 ? 74 + f * 22 : side === 1 ? 96 : side === 2 ? 96 - f * 22 : 74,
              side === 0 ? row + 12 : side === 1 ? row + 12 - f * 24 : side === 2 ? row - 12 : row - 12 + f * 24, -25)
          } else {
            const start = t < .35 ? [78, row] : [84, row - 5]
            const end = t < .35 ? [84, row - 5] : [93, row + 7]
            const f = t < .35 ? t / .35 : (t - .35) / .65
            reviews.push(start[0] + (end[0] - start[0]) * f, start[1] + (end[1] - start[1]) * f, -25)
          }
        } else reviews.push(110 + rand() * 100, row + rand() * 7, -25)
      } else reviews.push(x * .92 - 90, y * .92 - 8, z * .92)
      scatters.push((rand() - .5) * 740, (rand() - .5) * 550, (rand() - .5) * 600)
      metadata.push(orbit === 1 ? index / (narrow ? 480 : 1000) : rand(), orbit)
    }
    for (let i = 0; i < dataCount; i++) {
      const tier = i % 3
      const angle = rand() * Math.PI * 2
      const top = i % 5 < 2
      const radius = top ? Math.sqrt(rand()) * 112 : 112 + rand() * 1.5
      const y = tier * 72 - 82 + (top ? 0 : rand() * 48)
      add(Math.cos(angle) * radius, y, Math.sin(angle) * radius, 0, i)
    }
    // Bright rims make all three tiers legible even on a small screen.
    const rimCount = narrow ? 200 : 420
    for (let tier = 0; tier < 3; tier++) for (let end = 0; end < 2; end++) for (let i = 0; i < rimCount; i++) {
      const angle = i / rimCount * Math.PI * 2
      add(Math.cos(angle) * 112, tier * 72 - 82 + end * 48, Math.sin(angle) * 112, 2, i)
    }
    const orbitCount = narrow ? 480 : 1000
    for (let ring = 0; ring < 4; ring++) for (let i = 0; i < orbitCount; i++) {
      const angle = i / orbitCount * Math.PI * 2
      const radius = 190 + ring * 24
      const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius
      const tilt = ring % 2 ? -.62 : .58
      add(x, z * Math.sin(tilt) + (ring - 1.5) * 15, z * Math.cos(tilt), 1, i)
    }
    // Detail fills Test and the Review surface, making its carved openings legible.
    const detailCount = narrow ? 2600 : 6000
    for (let i = 0; i < detailCount; i++) {
      const angle = rand() * Math.PI * 2, tier = i % 3
      const top = i % 5 < 2, radius = top ? Math.sqrt(rand()) * 112 : 112 + rand() * 1.5
      add(Math.cos(angle) * radius, tier * 72 - 82 + (top ? 0 : rand() * 48), Math.sin(angle) * radius, 3, i)
    }
    const cloneStart = metadata.length / 2
    const disposableCount = narrow ? 3300 : 7200
    for (let i = 0; i < disposableCount; i++) {
      // Analytic fallback: a flat cut and the outer curved wall of a thin slice.
      const angle = (rand() - .5) * Math.PI, tier = i % 3
      const cap = i % 3 === 0
      const x = 30 * Math.cos(angle) * (cap ? rand() : 1) - 15
      add(0, 0, 0, 4, i)
      const n = clones.length - 3
      clones[n] = x
      clones[n + 1] = tier * 64 - 72 + (cap ? 0 : rand() * 42)
      clones[n + 2] = Math.sin(angle) * 9
    }
    canvas.dataset.reviewSmile = 'cutouts'
    function attribute(name: string, size: number, values: number[]) {
      const buffer = gl!.createBuffer()
      if (!buffer) return null
      buffers.push(buffer)
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer)
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array(values), gl!.STATIC_DRAW)
      const location = gl!.getAttribLocation(program!, name)
      gl!.enableVertexAttribArray(location)
      gl!.vertexAttribPointer(location, size, gl!.FLOAT, false, 0, 0)
      return buffer
    }
    attribute('aHome', 3, homes)
    const cloneBuffer = attribute('aClone', 3, clones)
    attribute('aReview', 3, reviews)
    attribute('aScatter', 3, scatters)
    attribute('aMeta', 2, metadata)
    const count = metadata.length / 2
    canvas.dataset.disposableClones = '3'
    canvas.dataset.particleCount = String(count)

    // Sample only the logo's first partial cylinder. Its three-tier silhouette,
    // flat cut and curved edge stay exact while shallow walls add real depth.
    const logo = new Image()
    logo.onload = () => {
      if (!alive || lost || !cloneBuffer) return
      const sample = document.createElement('canvas'); sample.width = 384; sample.height = 384
      const context = sample.getContext('2d', { willReadFrequently: true })
      if (!context) return
      context.drawImage(logo, 0, 0, 384, 384)
      const pixels = context.getImageData(0, 0, 384, 384).data
      const points: number[] = [], edges: number[] = []
      const opaque = (x: number, y: number) => pixels[(y * 384 + x) * 4 + 3] > 120
      for (let y = 88; y < 298; y++) for (let x = 234; x < 267; x++) {
        if (!opaque(x, y)) continue
        const point = [(x / 8 - 31.18) * 8, (24 - y / 8) * 8]
        points.push(...point)
        if (!opaque(x - 1, y) || !opaque(x + 1, y) || !opaque(x, y - 1) || !opaque(x, y + 1)) edges.push(...point)
      }
      if (!points.length) return
      for (let i = cloneStart; i < count; i++) {
        const wall = i % 3 === 0 && edges.length > 0
        const candidates = wall ? edges : points
        const pick = Math.floor(rand() * candidates.length / 2) * 2
        clones[i * 3] = candidates[pick]; clones[i * 3 + 1] = candidates[pick + 1]
        clones[i * 3 + 2] = wall ? (rand() - .5) * 18 : i % 2 ? -9 : 9
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, cloneBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(clones), gl.STATIC_DRAW)
      canvas.dataset.cloneSilhouette = 'brand-slice'
      wake()
    }
    logo.src = logoUrl

    function draw(now: number) {
      raf = 0
      if (!alive || lost) return
      // Cap ambient motion at 30 fps; input remains responsive without burning a core.
      if (!inputRef.current.paused && !motionReduced && last && now - last < 32) {
        if (visible && !document.hidden) raf = requestAnimationFrame(draw)
        return
      }
      const dt = Math.min((now - (last || now)) / 1000, .05)
      last = now
      const paused = inputRef.current.paused || motionReduced
      const targetClone = inputRef.current.step === 2 ? 1 : 0
      const targetDiagnose = inputRef.current.step === 1 ? 1 : 0
      const targetReview = inputRef.current.step === 3 ? 1 : 0
      const targetCalm = inputRef.current.step === 0 ? .1 : 1
      if (inputRef.current.step === 2 && lastStep !== 2) cloneClock = .8
      if (paused) {
        // A paused hero always shows the finished illustration for its mode, even if it was
        // paused during the opening assembly or halfway through a mode transition.
        clone = targetClone; calm = targetCalm; diagnose = targetDiagnose; review = targetReview
        opening = 1; pulse = 0
      }
      else {
        clock += dt
        if (targetClone) cloneClock += dt
        opening = Math.min(1, opening + dt / 2.8)
        const ease = 1 - Math.exp(-dt * 3)
        clone += (targetClone - clone) * ease
        calm += (targetCalm - calm) * ease
        diagnose += (targetDiagnose - diagnose) * ease
        review += (targetReview - review) * ease
        pointer.x += (pointer.tx - pointer.x) * ease
        pointer.y += (pointer.ty - pointer.y) * ease
        pulse *= Math.exp(-dt * 2.5)
      }
      lastStep = inputRef.current.step
      const light = document.documentElement.dataset.theme === 'light'
      if (light) gl!.blendFuncSeparate(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA, gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA)
      else gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE)
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
      gl!.clearColor(0, 0, 0, 0)
      gl!.clear(gl!.COLOR_BUFFER_BIT)
      gl!.uniform1f(uniforms.uTime, clock)
      gl!.uniform1f(uniforms.uCloneTime, cloneClock)
      gl!.uniform1f(uniforms.uOpening, opening)
      gl!.uniform1f(uniforms.uClone, clone)
      gl!.uniform1f(uniforms.uCalm, calm)
      gl!.uniform1f(uniforms.uDpr, dpr)
      gl!.uniform1f(uniforms.uScale, Math.min(width / 600, height / 470) * .97)
      gl!.uniform1f(uniforms.uPulse, pulse)
      gl!.uniform1f(uniforms.uDiagnose, diagnose)
      gl!.uniform1f(uniforms.uReview, review)
      gl!.uniform1f(uniforms.uLight, light ? 1 : 0)
      gl!.uniform2f(uniforms.uViewport, width, height)
      gl!.uniform2f(uniforms.uPointer, pointer.x, pointer.y)
      gl!.uniform1f(uniforms.uPointerOn, paused ? 0 : pointer.on)
      gl!.drawArrays(gl!.POINTS, 0, count)
      if (visible && !paused && !document.hidden) raf = requestAnimationFrame(draw)
    }
    function wake() { if (!raf && alive && !lost && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(draw) } }
    function resize() {
      const box = wrapper!.getBoundingClientRect()
      width = Math.max(1, box.width); height = Math.max(1, box.height)
      dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2)
      canvas!.width = Math.round(width * dpr); canvas!.height = Math.round(height * dpr)
      wake()
    }
    function move(event: PointerEvent) {
      if (motionReduced || inputRef.current.paused) return
      const box = wrapper!.getBoundingClientRect()
      pointer.tx = (event.clientX - box.left) / box.width * 2 - 1
      pointer.ty = 1 - (event.clientY - box.top) / box.height * 2
      pointer.on = 1
      wake()
    }
    function leave() { pointer.on = 0; pointer.tx = 0; pointer.ty = 0 }
    function burst() { if (!motionReduced && !inputRef.current.paused) { pulse = 1; wake() } }
    function visibility() { if (document.hidden) { cancelAnimationFrame(raf); raf = 0 } else wake() }
    function preference() { motionReduced = reduce.matches; wake() }
    function contextLost(event: Event) { event.preventDefault(); lost = true; cancelAnimationFrame(raf); raf = 0; setReady(false) }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) wake()
      else { cancelAnimationFrame(raf); raf = 0; last = 0 }
    }, { rootMargin: '50px' })
    const resizer = new ResizeObserver(resize)
    observer.observe(wrapper); resizer.observe(wrapper)
    // Changes to the HTML controls also need one still frame when animation is paused.
    const controls = new MutationObserver(wake)
    controls.observe(wrapper, { attributes: true, attributeFilter: ['data-step', 'data-paused'] })
    const themeObserver = new MutationObserver(wake)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    wrapper.addEventListener('pointermove', move)
    wrapper.addEventListener('pointerleave', leave)
    wrapper.addEventListener('pointerdown', burst)
    canvas.addEventListener('webglcontextlost', contextLost)
    document.addEventListener('visibilitychange', visibility)
    reduce.addEventListener('change', preference)
    resize(); setReady(true)
    return () => {
      alive = false; logo.onload = null; cancelAnimationFrame(raf)
      observer.disconnect(); resizer.disconnect(); controls.disconnect(); themeObserver.disconnect()
      wrapper.removeEventListener('pointermove', move); wrapper.removeEventListener('pointerleave', leave); wrapper.removeEventListener('pointerdown', burst)
      canvas.removeEventListener('webglcontextlost', contextLost); document.removeEventListener('visibilitychange', visibility); reduce.removeEventListener('change', preference)
      buffers.forEach(b => gl.deleteBuffer(b)); shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program)
    }
  }, [logoUrl])

  return <div ref={wrapperRef} className={styles.universe} data-step={step} data-paused={paused} data-ready={ready}>
    <svg className={styles.universeFallback} viewBox="0 0 600 470" aria-hidden="true">
      <defs><mask id="review-face-cutout" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="470"><rect width="600" height="470" fill="white" stroke="none" /><circle cx="266" cy="194" r="15" fill="black" stroke="none" /><circle cx="334" cy="194" r="15" fill="black" stroke="none" /><path d="M240 319 Q300 349 360 319 Q300 380 240 319" fill="black" stroke="none" /></mask></defs>
      {step === 2 && <g>{[340,410,480].map((x,i)=><svg key={x} x={x} y="130" width="28" height="195" viewBox="29 11.5 4.4 25" opacity={1-i*.3}><image href={logoUrl} width="48" height="48" /></svg>)}</g>}
      <g mask={step === 3 ? 'url(#review-face-cutout)' : undefined} transform={step === 3 ? 'translate(-45 24) scale(.85)' : step === 2 ? 'translate(-65 24) scale(.85)' : undefined}>
      {step < 2 && [155, 225, 295].map(y => <path key={y} d={`M190 ${y} v42 a110 28 0 0 0 220 0 v-42 a110 28 0 0 1-220 0`} fill="#e97632" fillOpacity=".32" />)}
      {step === 3 && [155, 225, 295].map(y => <path key={y} d={`M190 ${y} v42 a110 28 0 0 0 220 0 v-42 a110 28 0 0 1-220 0`} fill="#cf501b" fillOpacity=".72" />)}
      {[155, 225, 295].map(y => <g key={y}><path d={`M 190 ${y} v 42 a 110 28 0 0 0 220 0 v -42`} /><ellipse cx="300" cy={y} rx="110" ry="28" /></g>)}
      <ellipse cx="300" cy="235" rx="230" ry="85" transform="rotate(-25 300 235)" />
      <ellipse cx="300" cy="235" rx="230" ry="85" transform="rotate(25 300 235)" />
      </g>
      {step === 1 && <g><circle cx="465" cy="210" r="34" fill="#ff612220" /><circle cx="465" cy="210" r="44" /><path d="M465 158v16m0 72v16m-52-52h16m72 0h16" /></g>}
      {step === 3 && <g stroke="#79eca0"><rect x="358" y="105" width="170" height="260" rx="4" />{[153,216,281].map(y => <g key={y}><rect x="373" y={y-12} width="22" height="24" rx="2" /><path d={`M377 ${y} l6 5 l9 -12`} strokeWidth="3" /><path d={`M409 ${y} h91`} strokeWidth="5" /></g>)}</g>}
    </svg>
    <canvas ref={canvasRef} aria-hidden="true" />
    {step === 2 && <div className={styles.universeHint}>Create · experiment · dispose · repeat</div>}
    <span className={styles.universeProduction}>{['POSTGRES / HEALTH CONTROL', 'ISOLATE THE SIGNAL / FIND THE CAUSE', 'ONE SHARED BASE / INDEPENDENT CLONES', 'DATABASE EVIDENCE / YOUR DECISION'][step]}</span>
    {step === 1 && <span className={styles.heroDiagnosis}>A problem isolated<span>Evidence → recommended action</span></span>}
    {step === 3 && <div className={styles.heroReview}><span>Database</span><strong>✅ Evidence ready<span>Awaiting your review</span></strong></div>}
  </div>
}
