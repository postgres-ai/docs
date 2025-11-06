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
    <Layout title="PostgresAI copilot — Expert-level Postgres observability">
      <main>
        {/* Hero Section with Video */}
        <section className="banner position-relative text-center">
          <div className="container">
            <div className="row justify-content-center align-items-center">
              <div className="col-lg-10">
                <h1 className={styles.mainTitle}>
                  Ship features instead of fighting Postgres fires
                </h1>
                <p className={styles.subtitle}>
                  15 min from start to your first database improvement
                </p>
                
                {/* Video Container */}
                <div className={styles.videoContainer}>
                  <div className={styles.videoEmbed}>
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/O6UTwEGOFio"
                      title="postgres_ai monitoring demo"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Key Features */}
                <div className={styles.featuresGrid}>
                  <div className={styles.feature}>
                    <h3>Effortless index maintenance</h3>
                    <p>Continuously clean up unused and redundant indexes. Automatically mitigate index bloat — all while maintaining full control</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Built for fast-moving teams</h3>
                    <p>For startups and growing companies with solid engineering teams. Focus on shipping features — we've got your database covered</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Universal integration</h3>
                    <p>Works with any Postgres, from self-managed and Kubernetes setups to RDS, CloudSQL, Supabase, and other managed services</p>
                  </div>
                  <div className={styles.feature}>
                    <h3>Battle-tested expertise</h3>
                    <p>We've helped companies like GitLab, Chewy, Supabase, Miro, ClickUp, Midjourney, Suno, Gamma, Photoroom, and <a href="/consulting">many others</a>. We'll help you avoid various cliffs, from XID wraparound to LWLock:LockManager. Don't fall — we've got you</p>
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
