import React from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import styles from './index.module.css'
import { TRUSTED_BY_COMPANIES } from './pricing'
import { SITE_NAME, SITE_SLOGAN, SITE_SUBTITLE } from '../config/site'

// Testimonials
const testimonials = [
  {
    quote: "PostgresAI was instrumental in driving us toward zero-downtime upgrades and improving our disaster recovery process, achieving 7 TiB/hour restore speeds. Their commitment to putting developers first aligns perfectly with our open-source philosophy",
    name: "Oliver Rice, Ph.D.",
    title: "Head of Engineering",
    company: "Supabase",
    location: "USA",
  },
  {
    quote: "When you're powering thousands of developer apps, database downtime isn't an option — PostgresAI's expertise over the years culminated in a flawless zero-downtime Postgres upgrade that kept our platform running seamlessly while we scaled for the future.",
    name: "Harry Brundage",
    title: "Co-founder & CTO",
    company: "Gadget",
    location: "Canada",
  },
  {
    quote: "The PostgresAI team's forensic approach to our database incident provided the technical evidence we needed to gain support and resolution with our infrastructure provider, and their subsequent health check showed valuable insights into our platform's scaling needs.",
    name: "Andrew Gershman",
    title: "Staff SRE",
    company: "Cinder",
    location: "USA",
  },
]

function IndexPage() {
  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { signInUrl } = customFields

  if (typeof signInUrl !== 'string') return null

  return (
    <Layout title={`${SITE_NAME} – ${SITE_SLOGAN}`}>
      <main>
        {/* Hero Section with Video */}
        <section className="banner position-relative text-center">
          <div className="container">
            <div className="row justify-content-center align-items-center">
              <div className="col-lg-10">
{/* Alternative value proposition for future consideration:
                <h1 className={styles.mainTitle}>
                  Not dashboards. Fixes
                </h1>
                <p className={styles.subtitle}>
                  Ship your product features instead of fighting Postgres fires
                </p>
*/}
                <h1 className={styles.tagline}>{SITE_SLOGAN}</h1>
                <p className={styles.subtitle}>{SITE_SUBTITLE}</p>

                {/* Hero CTA Buttons */}
                <div className={styles.heroCtaButtons}>
                  <a href={signInUrl} className={styles.ctaPrimary}>
                    Check my database now
                  </a>
                </div>

                {/* Video Container */}
                <div className={styles.videoContainer}>
                  <div className={styles.videoEmbed}>
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/PJ4bh1TnpLE?modestbranding=1&rel=0"
                      title="PostgresAI demo"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Architecture Diagram */}
                <div className={styles.architectureDiagram}>
                  <div className={styles.architectureDiagramInner}>
                    <pre className={styles.architectureDiagramDesktop}>{`╔════════════╗        ╔═══════════════ POSTGRESAI ═══════════════╗
║    Your    ║░       ║  ┏━━━━━━━━━━━━━━┓     ┏━━━━━━━━━━━━━━┓   ║░
║  Postgres  ║░──────▶║  ┃  Monitoring  ┃────▶┃ Health check ┃   ║░
║  database  ║░       ║  ┗━━━━━━━━━━━━━━┛     ┃   & Issues   ┃   ║░
╚════════════╝░       ║                       ┗━━━━━━━━━━━━━━┛   ║░
 ░░░░░░░░░░░░░░       ╚══════════════════════════════════════════╝░
      ▲                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      │                                                │
      │                                                ▼
      │     ╔═════════════════════════╗     ╔═════════════════════╗
      └─────║ GitHub PRs / GitLab MRs ║░◀───║ AI tool (Cursor, …) ║░
            ╚═════════════════════════╝░    ╚═════════════════════╝░
             ░░░░░░░░░░░░░░░░░░░░░░░░░░░     ░░░░░░░░░░░░░░░░░░░░░░░`}</pre>
                    <pre className={styles.architectureDiagramMobile}>{`    ╔════════════════╗
    ║      Your      ║░
    ║    Postgres    ║░◀─────────┐
    ╚════════════════╝░          │
     ░░░░░░░░░░░░░░░░░░          │
            │                    │
            ▼                    │
╔══════ POSTGRESAI ══════╗       │
║  ┏━━━━━━━━━━━━━━━━━┓   ║░      │
║  ┃   Monitoring    ┃   ║░      │
║  ┗━━━━━━━━━━━━━━━━━┛   ║░      │
║          ▼             ║░      │
║  ┏━━━━━━━━━━━━━━━━━┓   ║░      │
║  ┃  Health check   ┃   ║░      │
║  ┃   & Issues      ┃   ║░      │
║  ┗━━━━━━━━━━━━━━━━━┛   ║░      │
╚════════════════════════╝░      │
 ░░░░░░░░░░░░░░░░░░░░░░░░░░      │
            │                    │
            ▼                    │
  ╔════════════════════╗         │
  ║ AI tool (Cursor,…) ║░        │
  ╚════════════════════╝░        │
   ░░░░░░░░░░░░░░░░░░░░░░        │
            │                    │
            ▼                    │
  ╔════════════════════╗         │
  ║ GitHub PRs /       ║░────────┘
  ║ GitLab MRs         ║░
  ╚════════════════════╝░
   ░░░░░░░░░░░░░░░░░░░░░░`}</pre>
                  </div>
                </div>

                {/* Key Features */}
                <p className={styles.subtitle}>
                  Autonomous Postgres, Level 3
                </p>
                <div className={styles.featuresGrid}>
                  <div className={styles.feature}>
                    <h3>Index maintenance and bloat control</h3>
                    <p>PostgresAI continuously cleans up unused and redundant indexes and mitigates bloat – following battle-tested methodologies, not guesswork</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Query optimization</h3>
                    <p>PostgresAI identifies slow queries and missing indexes, and delivers actionable fixes tested on clones of your database</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Postgres configuration tuning</h3>
                    <p>PostgresAI tunes 20+ configuration parameters – continuously expanding coverage based on real-world workloads</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Performance cliffs and risk analysis</h3>
                    <p>PostgresAI detects and predicts hard issues – LWLock:LockManager contention, MultiXact exhaustion, XID wraparound – helping you avoid disastrous consequences</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Monitoring for self-driving Postgres</h3>
                    <p>Monitoring designed for deep visibility, AI workflows, and a high degree of automation – supporting both detailed investigation and hands-off operations</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Built for fast-moving teams</h3>
                    <p>For teams that ship fast. Focus on features – we've got your database covered</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Universal integration</h3>
                    <p>Works with any Postgres: self-managed, Kubernetes, RDS, CloudSQL, Supabase, and other managed services</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Battle-tested expertise</h3>
                    <p>Trusted by GitLab, Chewy, Supabase, Miro, Orb, Midjourney, Suno, WorkOS, Photoroom, and <a href="/consulting">many others</a></p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={styles.testimonialsSection}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className={styles.testimonialsGrid}>
                  {testimonials.map((t, i) => (
                    <div key={i} className={styles.testimonialCard}>
                      <blockquote className={styles.testimonialQuote}>
                        "{t.quote}"
                      </blockquote>
                      <div className={styles.testimonialAuthor}>
                        <strong>{t.name}</strong>
                        <span>{t.title} at <strong>{t.company}</strong>, {t.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className={styles.trustedBySection}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className={styles.trustedByTitle}>Trusted by thousands of engineers</div>
                <div className={styles.logoGrid}>
                  {TRUSTED_BY_COMPANIES.map(({ name, Logo, logoScale }) => (
                    <div key={name} className={styles.logoCard}>
                      {Logo ? (
                        <Logo
                          className={styles.logoSvg}
                          aria-label={name}
                          style={
                            logoScale
                              ? { transform: `scale(${logoScale})`, transformOrigin: 'center' }
                              : undefined
                          }
                        />
                      ) : (
                        <span className={styles.logoText}>{name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <h2 className={styles.ctaTitle}>
                  <span className={styles.ctaTitleLight}>Check my database now,</span> scale with confidence
                </h2>
                <div className={styles.ctaButtons}>
                  <a href={signInUrl} className={styles.ctaPrimary}>
                    Check my database now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </Layout>
  )
}

export default IndexPage
