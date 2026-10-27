import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './styles.module.css';

const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Keep the inline anchor in flow and dock before it reaches the header. */
export default function MobileNavigation({children, progress, permalink}: {
  children: React.ReactNode; progress: number; permalink: string;
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const control = useRef<HTMLDivElement>(null);
  const previousRect = useRef<DOMRect | null>(null);
  const dockedRef = useRef(false);
  const restoreFocus = useRef(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [docked, setDocked] = useState(false);
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const navbar = document.querySelector<HTMLElement>('.navbar');
    const target = navbar?.querySelector<HTMLElement>('.navbar__inner .blog-reading-navbar-slot');
    if (!navbar || !target) return undefined;
    target.classList.add(styles.navbarSlot);
    setSlot(target);
    const media = window.matchMedia('(max-width: 996px)');
    // At <= 996px the search button is absolutely positioned over the navbar items.
    const search = navbar.querySelector<HTMLElement>('.DocSearch-Button');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!anchor.current) return;
      const items = target.parentElement;
      if (search && items) {
        const space = `${Math.ceil(Math.max(0, items.getBoundingClientRect().right - search.getBoundingClientRect().left))}px`;
        if (target.style.getPropertyValue('--search-space') !== space) target.style.setProperty('--search-space', space);
      }
      const headerBottom = navbar.getBoundingClientRect().bottom;
      const box = anchor.current.getBoundingClientRect();
      // An open inline panel docks only after it passes the header, so the whole tree stays reachable.
      // Otherwise start while the whole toggle is still visible, with hysteresis for small scroll reversals.
      const next = media.matches && (openRef.current && !dockedRef.current
        ? box.bottom <= headerBottom
        : box.top <= headerBottom + (dockedRef.current ? 40 : 24));
      if (next !== dockedRef.current) {
        previousRect.current = control.current?.getBoundingClientRect() ?? null;
        restoreFocus.current = !!control.current?.contains(document.activeElement);
        // The panel closes on every dock change, so reserve only the collapsed control.
        const node = control.current;
        const toggle = node?.querySelector('button');
        const bottom = box.bottom;
        anchor.current.style.height = next && node && toggle ? `${node.offsetHeight - node.clientHeight + toggle.offsetHeight}px` : '';
        // Keep the text in place when an open inline panel above the viewport collapses.
        const shift = anchor.current.getBoundingClientRect().bottom - bottom;
        if (shift && bottom <= headerBottom) window.scrollBy({top: shift, behavior: 'instant'});
        dockedRef.current = next;
        setOpen(false);
        setDocked(next);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    resize.observe(navbar);
    resize.observe(document.body);
    if (search) resize.observe(search);
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      target.classList.remove(styles.navbarSlot);
      target.style.removeProperty('--search-space');
    };
  }, []);

  useEffect(() => { setOpen(false); }, [permalink]);
  useClientLayoutEffect(() => {
    const node = control.current;
    if (restoreFocus.current) {
      node?.querySelector('button')?.focus({preventScroll: true});
      restoreFocus.current = false;
    }
    const from = previousRect.current;
    previousRect.current = null;
    if (!node || !from || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const to = node.getBoundingClientRect();
    // Limit travel on restored scroll positions and large programmatic jumps.
    const dy = Math.max(-80, Math.min(80, from.top - to.top));
    // Paint above the navbar only while undocking, so the control never covers the menu or search.
    if (!docked) Object.assign(node.style, {position: 'relative', zIndex: 'calc(var(--ifm-z-index-fixed) + 1)'});
    const lower = () => Object.assign(node.style, {position: '', zIndex: ''});
    const animation = node.animate([
      {transform: `translate(${from.left - to.left}px, ${dy}px)`, width: `${from.width}px`},
      {transform: 'translate(0, 0)', width: `${to.width}px`},
    ], {duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)'});
    animation.onfinish = lower;
    return () => { animation.cancel(); lower(); };
  }, [docked]);

  useEffect(() => {
    if (!open) return undefined;
    const dismiss = (event: PointerEvent) => {
      if (!control.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        control.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const navigation = <div ref={control} className={`${styles.mobileControl} ${docked ? styles.docked : ''}`}>
    <button type="button" className={styles.toggle} aria-expanded={open}
      aria-controls="blog-mobile-tos" onClick={() => setOpen(value => !value)}>
      <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>ToS</span>
      <span className={styles.compactProgress} aria-label={`${progress}% read`}>{progress}%</span>
    </button>
    <nav id="blog-mobile-tos" hidden={!open} className={styles.mobilePanel} aria-label="Article contents"
      onClick={event => {
        if ((event.target as Element).closest('a')) {
          setOpen(false);
          control.current?.querySelector('button')?.focus();
        }
      }}>{children}</nav>
  </div>;
  return <div ref={anchor} className={styles.mobile}>
    {docked && slot ? createPortal(navigation, slot) : navigation}
  </div>;
}
