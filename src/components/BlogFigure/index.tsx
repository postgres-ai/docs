import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

/**
 * Props for the BlogFigure component.
 */
type BlogFigureProps = {
  /** Figure number shown in the label ("Fig. 1") */
  n: number;
  /** Light, wide image, e.g. /assets/blog/post-f1.svg */
  src: string;
  /** Text alternative for the chart */
  alt: string;
  /**
   * The image also exists as <name>-dark, <name>-narrow and <name>-narrow-dark.
   * Dark follows the site theme; narrow is used on phones.
   */
  variants?: boolean;
  /** Caption: a bold first sentence, then the details */
  children?: ReactNode;
}

const variant = (src: string, suffix: string) => src.replace(/(\.[a-z]+)$/, `${suffix}$1`)

// Phones get the narrow drawing; keep in sync with the media query in styles.module.css.
const NARROW = '(max-width: 600px)'

const Picture = ({ src, narrow, alt, className }: { src: string; narrow?: string; alt: string; className?: string }) => (
  <picture className={clsx(styles.picture, className)}>
    {narrow && <source media={NARROW} srcSet={narrow} />}
    <img src={src} alt={alt} loading="lazy" decoding="async" />
  </picture>
)

/**
 * A numbered figure card for blog posts: the chart, a "Fig. N" label and a caption.
 * Click or tap the chart to open it full screen; Esc or a click on the backdrop closes it.
 * The chart stays an image with its alt text; the zoom button lies on top of it.
 *
 * @example
 * ```mdx
 * <BlogFigure n={1} src="/assets/blog/post-f1.svg" variants alt="Inserts per second ...">
 *
 * **Inserts per second as the table grows.** UUIDv4 starts to fall when ...
 *
 * </BlogFigure>
 * ```
 */
export const BlogFigure = ({ n, src, alt, variants, children }: BlogFigureProps) => {
  const [open, setOpen] = useState(false)
  const light = useBaseUrl(src)
  const dark = useBaseUrl(variants ? variant(src, '-dark') : src)
  const narrowLight = useBaseUrl(variant(src, '-narrow'))
  const narrowDark = useBaseUrl(variant(src, '-narrow-dark'))

  const close = useCallback(() => setOpen(false), [])
  // Without variants, one image serves both themes.
  const lightClass = variants ? styles.light : undefined

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <figure className={styles.figure} id={`fig-${n}`}>
      <div className={styles.media}>
        <Picture className={lightClass} src={light} narrow={variants ? narrowLight : undefined} alt={alt} />
        {variants && <Picture className={styles.dark} src={dark} narrow={narrowDark} alt={alt} />}
        <button type="button" className={styles.zoom} onClick={() => setOpen(true)} aria-label={`Enlarge figure ${n}`}>
          <span className={styles.zoomHint} aria-hidden="true">⤢</span>
        </button>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.label}>Fig. {n}</span>
        <div className={styles.captionText}>{children}</div>
      </figcaption>
      {open && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`Figure ${n}`} onClick={close}>
          <button type="button" className={styles.close} onClick={close} aria-label="Close">×</button>
          <div className={styles.lightboxScroll}>
            <img className={lightClass} src={light} alt={alt} onClick={(e) => e.stopPropagation()} />
            {variants && <img className={styles.dark} src={dark} alt={alt} onClick={(e) => e.stopPropagation()} />}
          </div>
          <div className={styles.lightboxCaption} onClick={(e) => e.stopPropagation()}>
            <span className={styles.label}>Fig. {n}</span>
            <div className={styles.captionText}>{children}</div>
            <a href={light} target="_blank" rel="noopener noreferrer" className={styles.raw}>Open the SVG ↗</a>
          </div>
        </div>
      )}
    </figure>
  )
}
