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
                      src="https://www.youtube.com/embed/ZWGY64V8AHw?modestbranding=1&rel=0"
                      title="postgres_ai copilot demo"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Copilot Diagram */}
                <div className={styles.copilotDiagram}>
                  <div className={styles.copilotDiagramInner}>
                    <pre className={styles.copilotDiagramDesktop}>{`╔════════════╗        ╔══════════ POSTGRESAI COPILOT ════════════╗
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
                    <pre className={styles.copilotDiagramMobile}>{`    ╔════════════════╗
    ║      Your      ║░
    ║    Postgres    ║░◀─────────┐
    ╚════════════════╝░          │
     ░░░░░░░░░░░░░░░░░░          │
            │                    │
            ▼                    │
╔══ POSTGRESAI COPILOT ══╗       │
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
                <div className={styles.featuresGrid}>
                  <div className={styles.feature}>
                    <h3>Effortless index maintenance</h3>
                    <p>Copilot continuously cleans up unused and redundant indexes, mitigates bloat — following battle-tested methodologies, not just AI guessing</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Query analysis</h3>
                    <p>Copilot identifies slow queries, missing indexes, and delivers actionable fixes tested on clones of your database</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Performance cliffs</h3>
                    <p>Copilot detects and predicts issues like LWLock:LockManager contention, MultiXact exhaustion, XID wraparound — helping you avoid disastrous consequences</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Built for fast-moving teams</h3>
                    <p>For startups with solid engineering teams. Focus on shipping features — we've got your database covered</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Universal integration</h3>
                    <p>Works with any Postgres: self-managed, Kubernetes, RDS, CloudSQL, Supabase, and other managed services</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Battle-tested expertise</h3>
                    <p>Trusted by GitLab, Chewy, Supabase, Miro, Orb, Midjourney, Suno, Gamma, Photoroom, and <a href="/consulting">many others</a></p>
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
