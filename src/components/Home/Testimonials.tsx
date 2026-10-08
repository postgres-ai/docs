import React from 'react'
import clsx from 'clsx'
import useBaseUrl from '@docusaurus/useBaseUrl'

import { TRUSTED_BY_COMPANIES } from '../../pages/pricing'
import styles from './styles.module.css'

export interface Testimonial {
  quote: string
  name: string
  title: string
  company: string
  location: string
}

// Logos not in the site's logo set: official artwork in static/img/customers, painted in the
// same flat colour through a CSS mask. Sources: withorb.com (site header), resend.com/brand
// (brand kit), outtake.ai (site header).
const EXTRA_LOGOS = [
  { name: 'Orb', file: 'orb.svg', aspect: 66 / 31, h: 30 },
  { name: 'Resend', file: 'resend.svg', aspect: 1978 / 420, h: 24 },
  { name: 'Outtake', file: 'outtake.svg', aspect: 137 / 25, h: 26 },
]

// Lead customers first; the rest follow.
const ORDER = ['Supabase', 'GitLab', 'Suno', 'Orb', 'WorkOS', 'Gadget', 'Resend', 'Photoroom', 'Miro', 'Outtake', 'Chewy.com']

function MaskLogo({ name, file, aspect, h }: (typeof EXTRA_LOGOS)[number]) {
  const url = useBaseUrl(`/img/customers/${file}`)
  return (
    <span
      role="img"
      aria-label={name}
      className={styles.logoMask}
      style={{ width: `${Math.round(h * aspect)}px`, height: `${h}px`, WebkitMaskImage: `url(${url})`, maskImage: `url(${url})` }}
    />
  )
}

function LogoFor({ name }: { name: string }) {
  const company = TRUSTED_BY_COMPANIES.find((c) => c.name === name)
  if (company?.Logo) {
    const { Logo, logoScale } = company
    return <Logo aria-label={name} style={{ height: `${Math.round(26 * (logoScale || 1))}px` }} />
  }
  const extra = EXTRA_LOGOS.find((l) => l.name === name)
  if (extra) return <MaskLogo {...extra} />
  // Chewy may only be named in text
  return <span className={styles.logoText}>{name}</span>
}

/* Real customer words lead; the logo mesh follows the product evidence. */
export default function Proof({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className={clsx(styles.section, styles.proof)} aria-labelledby="customer-stories-title">
      <div className="container">
        <div className={styles.quoteHeading}><h2 id="customer-stories-title" className={styles.proofTitle}>From the teams we work with</h2></div>
        <div className={styles.quoteGrid}>
          {testimonials.map(quote => <figure key={quote.company} className={styles.quote}>
            <blockquote className={styles.quoteText}>{quote.quote.split(/(\d+ TiB\/hour)/).map((part, i) => i % 2 ? <strong key={i}>{part}</strong> : part)}</blockquote>
            <figcaption className={styles.quoteBy}><span className={styles.quoteName}>{quote.name}</span><span>{quote.title}</span><strong className={styles.quoteCompany}>{quote.company}</strong></figcaption>
          </figure>)}
        </div>
      </div>
    </section>
  )
}

export function CustomerLogos({ consoleUrl }: { consoleUrl: string }) {
  return (
    <section className={clsx(styles.section, styles.proof)} aria-labelledby="trusted-by-title">
      <div className="container">
        <h2 id="trusted-by-title" className={styles.proofTitle}>You're in good company</h2>
        <div className={clsx(styles.proofGrid, styles.logoMeshOnly)}>
          <ul className={styles.logos}>
            {ORDER.map(name => <li key={name} className={styles.logo}><LogoFor name={name} /></li>)}
            <li className={clsx(styles.logo, styles.logoCta)}>
              <a href={consoleUrl} className={styles.logoCtaLink}>
                <span className={styles.logoCtaMain}>Your team here? <span aria-hidden="true">→</span></span>
                <span className={styles.logoCtaSub}>Get started in minutes</span>
                <span className={styles.logoCtaDot} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
