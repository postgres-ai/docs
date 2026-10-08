import React, { useEffect, useRef, useState } from 'react'
import { createShader, type ShaderInstance } from 'shaders/js'
import styles from './styles.module.css'

// The library owns the GPU renderer; the page's content stays ordinary HTML.
export default function ShaderLayer({ onUnavailable, hero = false }: { onUnavailable: () => void; hero?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    let alive = true
    let instance: ShaderInstance | null = null
    createShader(canvas, {
      components: hero ? [
        { type: 'Aurora', id: 'aurora', props: { colorA: '#ff6212', colorB: '#ffac64', colorC: '#247d86', colorSpace: 'linear', intensity: 38, curtainCount: 3, speed: .3, waviness: .65, rayDensity: 35, height: 70, center: { x: .5, y: .18 }, seed: 14 } },
      ] : [
        { type: 'ContourLines', id: 'contours', props: { levels: 6, lineWidth: 1, softness: 0.2, gamma: 1, colorMode: 'custom', lineColor: '#ff772e', backgroundColor: '#081216' }, children: [
          { type: 'FlowingGradient', id: 'flow', props: { colorA: '#040c12', colorB: '#ffffff', colorC: '#db5721', colorD: '#102e38', colorSpace: 'linear', speed: 0.3, distortion: 0.65, seed: 7 } },
        ] },
      ],
    }, {
      disableTelemetry: true,
      observeElement: !hero,
      colorSpace: 'srgb',
      onReady: () => { if (alive) setReady(true) },
      onError: () => { if (alive) onUnavailable() },
    }).then((shader) => {
      if (alive) {
        instance = shader
        // The atmosphere needs a soft, small texture; the particle sculpture stays sharp.
        if (hero) {
          shader.resize(240, 180)
          canvas.style.width = '100%'
          canvas.style.height = '100%'
        }
      }
      else shader.destroy()
    }).catch(() => { if (alive) onUnavailable() })
    return () => {
      alive = false
      instance?.destroy()
    }
  }, [onUnavailable, hero])
  return <canvas ref={canvasRef} className={styles.shaderCanvas} data-ready={ready} style={{ display: 'block' }} />
}
