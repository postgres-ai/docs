import React, { useEffect, useRef, useState } from 'react'
import useBaseUrl from '@docusaurus/useBaseUrl'

import { mount, type Hero } from './engine'
import styles from './styles.module.css'

/*
 * Hero of the temp-tables post: sessions as lines, invalidation messages as
 * orange marks that move along them.
 *
 * The server renders four still frames (light and dark, wide and phone) in the
 * `.pgai-hero-art` markup of the long-read style, so the page is complete with
 * no JavaScript. In the browser a canvas lies over them and plays the same
 * drawing, starting from the same frame. The canvas is decorative
 * (aria-hidden); the still frame carries the alt text.
 *
 * A Pause button (WCAG 2.2.2) stops the animation loop. It appears only once
 * the canvas runs, and with reduced motion the hero starts paused.
 */

type Props = {
  /** path of the still frames without the suffix: `${stem}-light.png`, `-dark`, `-narrow-light`, `-narrow-dark` */
  stem: string
  alt: string
}

export default function SessionsHero({ stem, alt }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<Hero | null>(null)
  const [playing, setPlaying] = useState<boolean | null>(null)
  const base = useBaseUrl(stem)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hero = mount(canvas, { paused: still })
    heroRef.current = hero
    setPlaying(!still)
    return () => {
      heroRef.current = null
      hero.stop()
    }
  }, [])

  const toggle = () => {
    const next = !playing
    heroRef.current?.setPaused(!next)
    setPlaying(next)
  }

  return (
    <div className={`pgai-hero-art ${styles.wrap}`}>
      {(['light', 'dark'] as const).map((theme) => (
        <picture key={theme} className={`pgai-${theme}`}>
          <source
            media="(max-width: 600px)"
            srcSet={`${base}-narrow-${theme}.png`}
            width={720}
            height={400}
          />
          {/* lazy, and before src: the still frame of the other theme is never fetched */}
          <img
            loading="lazy"
            decoding="async"
            src={`${base}-${theme}.png`}
            width={1440}
            height={560}
            alt={alt}
          />
        </picture>
      ))}
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      {playing !== null && (
        <button
          type="button"
          className={styles.pause}
          onClick={toggle}
          aria-label={playing ? 'Pause the animation' : 'Play the animation'}
        >
          <span className={styles.face} aria-hidden="true">
            {playing ? 'Pause' : 'Play'}
          </span>
        </button>
      )}
    </div>
  )
}
