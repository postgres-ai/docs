import React, { useEffect, useMemo, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import classNames from 'classnames'
import Layout from '@theme/Layout'

import styles from './consulting-landing.module.css'

// If empty, the form will fall back to opening a prefilled email (mailto: consultings@postgres.ai)
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0AP5vLysIX3KF6FWlr_SjvnCVimMDkYOJxTGerVmn_Pd7InSp3F1FoiSp9ol-pkB8cw/exec'


const ConsultingLandingPage: React.FC = () => {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent('Consulting request — Postgres AI')
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Company: ${company}`,
        `Email: ${email}`,
        `Phone: ${phone || '—'}`,
        '',
        'Challenge:',
        description,
      ].join('\n')
    )
    return `mailto:consulting@postgres.ai?subject=${subject}&body=${body}`
  }, [name, company, email, phone, description])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Prefer GA4 gtag if present; fall back to GTM dataLayer
      const eventParams = {
        event_category: 'lead',
        event_label: 'consulting-landing',
        // Do not send PII (no name, email, phone)
      }
      if (typeof (window as any).gtag === 'function') {
        ;(window as any).gtag('event', 'consulting_form_submit', eventParams)
      }
      if (Array.isArray((window as any).dataLayer)) {
        ;(window as any).dataLayer.push({ event: 'consulting_form_submit', ...eventParams })
      }
      // Meta Pixel 'Lead' event (no PII)
      if (typeof (window as any).fbq === 'function') {
        ;(window as any).fbq('track', 'Lead', { content_name: 'consulting-landing' })
      }
    } catch {}

    // If Google Apps Script URL provided, send to Google Sheets first
    const webhookUrl = GOOGLE_APPS_SCRIPT_URL
    if (webhookUrl) {
      try {
        setSubmitting(true)
        setSubmitError('')
        const payload = {
          name,
          company,
          email,
          phone,
          description,
          pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
          timestamp: new Date().toISOString(),
        }
        // Using no-cors keeps the response opaque; Apps Script does not need to return JSON.
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        setSubmitted(true)
        setSubmitting(false)
        try {
          const successParams = { event_category: 'lead', event_label: 'consulting-landing' }
          if (typeof (window as any).gtag === 'function') {
            ;(window as any).gtag('event', 'consulting_form_submit_success', successParams)
          }
          if (Array.isArray((window as any).dataLayer)) {
            ;(window as any).dataLayer.push({ event: 'consulting_form_submit_success', ...successParams })
          }
        } catch {}
        return
      } catch (err) {
        setSubmitting(false)
        setSubmitError('Submit failed. Falling back to email…')
        try {
          const errorParams = { event_category: 'lead', event_label: 'consulting-landing' }
          if (typeof (window as any).gtag === 'function') {
            ;(window as any).gtag('event', 'consulting_form_submit_error', errorParams)
          }
          if (Array.isArray((window as any).dataLayer)) {
            ;(window as any).dataLayer.push({ event: 'consulting_form_submit_error', ...errorParams })
          }
        } catch {}
      }
    }

    // Fallback: open mail client
    window.location.href = mailtoHref
  }

  useEffect(() => {
    // Hide global navbar and announcement bar on this page only
    const navbar = document.querySelector('.navbar') as HTMLElement | null
    const announcement = document.querySelector('[class^="announcementBar_"]') as HTMLElement | null
    const prevNavbarDisplay = navbar?.style.display
    const prevAnnDisplay = announcement?.style.display
    if (navbar) navbar.style.display = 'none'
    if (announcement) announcement.style.display = 'none'
    return () => {
      if (navbar) navbar.style.display = prevNavbarDisplay || ''
      if (announcement) announcement.style.display = prevAnnDisplay || ''
    }
  }, [])

  return (
    <Layout title="Postgres consulting: complex problems, clear solutions">
      <main>
        {/* Hero */}
        <section className={classNames('container', styles.hero)}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>Postgres consulting: complex problems, clear solutions.</h1>
            <p className={styles.heroSubTitle}>
              Trusted by fast‑growing teams. We’ve helped companies like GitLab and Supabase scale confidently.
              We’re passionate about Postgres and laser‑focused on helping startups eliminate bottlenecks fast.
            </p>
            <div style={{ textAlign: 'center' }}>
              <a
                className={classNames('consulting-button', styles.primaryCta)}
                href="#get-help"
                onClick={() => {
                  try {
                    const eventParams = { event_category: 'engagement', event_label: 'consulting-landing' }
                    if (typeof (window as any).gtag === 'function') {
                      ;(window as any).gtag('event', 'cta_click_get_help', eventParams)
                    }
                    if (Array.isArray((window as any).dataLayer)) {
                      ;(window as any).dataLayer.push({ event: 'cta_click_get_help', ...eventParams })
                    }
                  } catch {}
                }}
              >
                Get help now
              </a>
            </div>
          </div>
        </section>

        {/* Why engage */}
        <section className={classNames('container', styles.section)}>
          <h2 className={styles.sectionTitle}>Why engage Postgres AI?</h2>
          <ul className={styles.bullets}> 
            <li>You're hitting database bottlenecks as usage accelerates.</li>
            <li>You’re growing fast but have limited in‑house database expertise.</li>
            <li>You need zero‑downtime migrations or major schema changes.</li>
            <li>You want startup‑friendly experts tuned for high‑growth realities.</li>
          </ul>
        </section>

        {/* Approach */}
        <section className={classNames('container', styles.section)}>
          <h2 className={styles.sectionTitle}>Our approach</h2>
          <p className={styles.paragraph}>
            We break complex Postgres challenges into clear, actionable steps. No guesswork — just real‑world
            experience applied hands‑on with your team. We fix problems and transfer knowledge so your team
            benefits long after the engagement.
          </p>
        </section>

        {/* What to expect */}
        <section className={classNames('container', styles.section)}>
          <h2 className={styles.sectionTitle}>What to expect</h2>
          <div className={styles.expectGrid}>
            <div className={styles.expectCard}>
              <h3 className={styles.cardTitle}>Immediate impact</h3>
              <ul className={styles.cardList}>
                <li>Rapid incident triage and resolution.</li>
                <li>Comprehensive database health check.</li>
              </ul>
            </div>
            <div className={styles.expectCard}>
              <h3 className={styles.cardTitle}>Long‑term improvement</h3>
              <ul className={styles.cardList}>
                <li>Schema redesign and partitioning.</li>
                <li>Major version upgrades without downtime.</li>
                <li>Improved observability and ongoing optimization.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Clients (below What to expect) */}
        <section className={classNames('container', styles.section)}>
          <h2 className={styles.sectionTitle}>Some of our clients</h2>
          <div className={styles.clients}>
            <div className={styles.clientsList}>
              <span className={styles.client}>GitLab</span>
              <span className={styles.separator}>•</span>
              <span className={styles.client}>Chewy</span>
              <span className={styles.separator}>•</span>
              <span className={styles.client}>Miro</span>
              <span className={styles.separator}>•</span>
              <span className={styles.client}>ClickUp</span>
              <span className={styles.separator}>•</span>
              <span className={styles.client}>Midjourney</span>
              <span className={styles.separator}>•</span>
              <span className={styles.client}>Suno</span>
              <span className={styles.separator}>•</span>
              <span className={styles.client}>Gamma</span>
              <span className={styles.separator}>•</span>
              <span className={styles.client}>Photoroom</span>
              <span className={styles.separator}>•</span>
              <span className={styles.client}>Recall.io</span>
              <span className={styles.separator}>•</span>
              <span className={styles.client}>Gadget.dev</span>
              <span className={styles.separator}>•</span>
              <span className={styles.client}>Supabase</span>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={classNames('container', styles.section)}>
          <h2 className={styles.sectionTitle}>What founders and engineering leaders say</h2>
          <div className={styles.testimonials}>
            <blockquote className={styles.quote}>
              “PostgresAI was instrumental in driving us toward zero-downtime upgrades and improving our disaster recovery process, achieving 7 TiB/hour restore speeds. Their commitment to putting developers first aligns perfectly with our open-source philosophy.”
              <footer className={styles.quoteFooter}><a className={styles.accent} href="https://www.linkedin.com/in/oliver-r-9a16b943/" target="_blank" rel="noreferrer">Oliver Rice, Ph.D</a> — Head of Engineering at <span className={styles.accent}>Supabase</span>, USA</footer>
            </blockquote>
            <blockquote className={styles.quote}>
              “When you're powering thousands of developer apps, database downtime isn't an option—PostgresAI's expertise over the years culminated in a flawless zero-downtime Postgres upgrade that kept our platform running seamlessly while we scaled for the future.”
              <footer className={styles.quoteFooter}><a className={styles.accent} href="https://www.linkedin.com/in/harrybrundage/" target="_blank" rel="noreferrer">Harry Brundage</a> — Co-founder & CTO at <span className={styles.accent}>Gadget</span>, Canada</footer>
            </blockquote>
            <blockquote className={styles.quote}>
              “The PostgresAI team's forensic approach to our database incident provided the technical evidence we needed to gain support and resolution with our infrastructure provider, and their subsequent health check showed valuable insights into our platform’s scaling needs.”
              <footer className={styles.quoteFooter}><a className={styles.accent} href="https://www.linkedin.com/in/agershman/" target="_blank" rel="noreferrer">Andrew Gershman</a> — Staff SRE at <span className={styles.accent}>Cinder</span>, USA</footer>
            </blockquote>
          </div>
        </section>

        {/* Lead form */}
        <section id="get-help" className={classNames('container', styles.section)}>
          <div className={styles.formCard}>
            <h2 className={styles.sectionTitle}>Consulting request</h2>
            <p className={styles.paragraph}>We respond within one business day. Your information is kept private and confidential.</p>
            {submitted ? (
              <div className={styles.paragraph}>
                Thanks! We received your request and will respond within one business day.
              </div>
            ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="name">Name</label>
                <input id="name" className={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="company">Company</label>
                <input id="company" className={styles.input} type="text" value={company} onChange={(e) => setCompany(e.target.value)} required />
              </div>
              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input id="email" className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="phone">Phone (optional)</label>
                <input id="phone" className={styles.input} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="desc">Brief description</label>
                <textarea id="desc" className={styles.textarea} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              {submitError ? (
                <div className={styles.paragraph}>
                  {submitError}
                </div>
              ) : null}
              <div className={styles.actions}>
                <button
                  type="submit"
                  className={classNames('consulting-button', styles.submit)}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Get help now'}
                </button>
              </div>
            </form>
            )}
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default ConsultingLandingPage


