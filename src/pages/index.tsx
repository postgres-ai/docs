import React from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import SignupForm from '../components/signupForm/signupForm'
import styles from './index.module.css'

function IndexPage() {
  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { signInUrl } = customFields

  if (typeof signInUrl !== 'string') return null

  return (
    <Layout title="PostgresAI – self-healing Postgres for fast-growing startups">
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
                <h1 className={styles.mainTitle}>
                  Self-healing Postgres for fast&#8209;growing startups
                </h1>
                <p className={styles.subtitle}>
                  Ship your product features instead of fighting Postgres fires
                </p>
                
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
                    <pre className={styles.architectureDiagramDesktop}>{`╔════════════╗        ╔══════════════ POSTGRESAI ═══════════════╗
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
╔════ POSTGRESAI ════╗           │
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

        {/* Signup Section */}
        <section className={styles.signupSectionFullWidth}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <SignupForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default IndexPage
