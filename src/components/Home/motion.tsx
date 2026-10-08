import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import styles from './styles.module.css'

/* Scroll-reveal and media-query hooks for the homepage. Browser-only work happens in effects. */

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// True once the element has scrolled into view (or right away when motion is reduced).
export function useInView<T extends Element>(rootMargin = '0px 0px -15% 0px'): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setSeen(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])
  return [ref, seen]
}

// Live match for a media query. null during SSR and the first client render (CSS decides then).
export function useMedia(query: string): boolean | null {
  const [match, setMatch] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

// A headline that rises word by word out of a clip when it scrolls into view.
export function RevealTitle({ id, text, className }: { id: string; text: string; className: string }) {
  const [ref, on] = useInView<HTMLHeadingElement>('0px 0px -10% 0px')
  const words = text.split(' ')
  return (
    <h2 ref={ref} id={id} className={clsx(className, styles.reveal, on && styles.revealOn)}>
      {words.map((w, i) => (
        <React.Fragment key={`${w}-${i}`}>
          <span className={styles.revealClip}>
            <span className={styles.revealWord} style={{ '--i': i } as React.CSSProperties}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </h2>
  )
}
