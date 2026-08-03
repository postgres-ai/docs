import React, { useState } from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import styles from './styles.module.css'
import { SupabaseLogo, SupabaseMark, GitLabLogo, SunoLogo, MiroLogo } from '../pricing'

// Check items for "What We Check" section
const checkItems = [
  {
    title: 'Table & index bloat',
    description: 'Tables and indexes grow 2–10× larger than needed. We detect and quantify it.',
  },
  {
    title: 'Index hygiene',
    description: 'Missing and unused indexes cause slow reads and heavy writes. We identify them.',
  },
  {
    title: 'Query performance',
    description: 'Slow queries hide inside application traffic. We surface them.',
  },
  {
    title: 'Configuration optimization',
    description: 'Default Postgres settings waste performance headroom. We optimize them.',
  },
  {
    title: 'Autovacuum control',
    description: 'Autovacuum falls behind under real workloads. We bring it under control.',
  },
  {
    title: 'Database observability',
    description: 'Problems appear before outages do. We make them visible.',
  },
]

// How it works steps
const steps = [
  {
    number: '1',
    title: 'Connect your Supabase project',
    description: 'We only need read-only access. Your data stays yours.',
  },
  {
    number: '2',
    title: 'We run 40+ battle-tested checks',
    description: 'Same checks we use with customers like GitLab, Suno, and Supabase.',
  },
  {
    number: '3',
    title: 'Get your health score + specific fixes',
    description: 'Not generic advice. Actual queries you can run today.',
  },
]

// FAQ items
const faqItems = [
  {
    question: 'Is this really free?',
    answer: 'All Postgres health check reports are free forever — no credit card, no trials, no locked features. Paid plans unlock continuous monitoring and expert recommendations that turn findings into clear, prioritized actions.',
  },
  {
    question: 'Is it safe to connect my database?',
    answer: 'We use read-only access. We cannot modify your data. Your connection string is encrypted and deleted after the scan. We\'ve run 5,000+ checks without incident.',
  },
  {
    question: 'Does it work with Supabase\'s connection pooler?',
    answer: 'Yes. Works with direct connections and pooled connections. We\'ll tell you which to use for best results.',
  },
  {
    question: 'What if I\'m on Supabase\'s free tier?',
    answer: 'Works perfectly. In fact, free tier projects often have the most issues because resources are constrained.',
  },
  {
    question: 'How is this different from Supabase\'s built-in dashboard?',
    answer: 'Supabase shows you metrics. We show you problems — with specific fixes. We catch issues that don\'t appear in standard dashboards until they cause outages.',
  },
]

// Trusted companies for this page
const trustedCompanies = [
  { name: 'Supabase', Logo: SupabaseLogo, logoScale: 1.2 },
  { name: 'GitLab', Logo: GitLabLogo, logoScale: 2.2 },
  { name: 'Suno', Logo: SunoLogo, logoScale: 0.68 },
  { name: 'Miro', Logo: MiroLogo, logoScale: 1.4 },
]

interface FAQItemProps {
  question: string
  answer: string
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.faqItem}>
      <button
        className={styles.faqQuestion}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <span className={`${styles.faqArrow} ${isOpen ? styles.faqArrowOpen : ''}`}>
          &#9660;
        </span>
      </button>
      {isOpen && <div className={styles.faqAnswer}>{answer}</div>}
    </div>
  )
}

function SupabaseCheckPage() {
  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { signInUrl } = customFields

  if (typeof signInUrl !== 'string') {
    console.error('signInUrl customField is not configured in docusaurus.config.js')
    return (
      <Layout title="Configuration error">
        <main className={styles.mainContainer}>
          <p>Page configuration error. Please contact support.</p>
        </main>
      </Layout>
    )
  }

  return (
    <Layout
      title="Free Supabase database health check"
      description="Find hidden issues in your Supabase database. Free health check in 60 seconds. No setup. No credit card. Just answers."
    >
      <main className={styles.mainContainer}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.supabaseBadge}>
              <SupabaseMark className={styles.supabaseBadgeLogo} />
              <span>
                Works with <strong>Supabase</strong>
              </span>
            </div>
            <h1 className={styles.heroTitle}>
              Your Supabase database has hidden problems. Let's find them.
            </h1>
            <p className={styles.heroSubtitle}>
              Free health check in 60 seconds. No setup. No credit card. Just answers.
            </p>
            <a href={signInUrl} className={styles.heroCta}>
              Check my database now
            </a>
            <p className={styles.heroTrust}>
              Works with any Supabase project. Read-only access. Used by engineering teams running Postgres in production.
            </p>
          </div>
        </section>

        {/* What We Check Section */}
        <section className={styles.checksSection}>
          <h2 className={styles.sectionTitle}>
            We scan for the issues that kill Supabase projects at scale
          </h2>
          <div className={styles.checksGrid}>
            {checkItems.map((item) => (
              <div key={item.title} className={styles.checkCard}>
                <h3 className={styles.checkTitle}>{item.title}</h3>
                <p className={styles.checkDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className={styles.howItWorksSection}>
          <h2 className={styles.sectionTitle}>
            Results in 60 seconds. Here's how.
          </h2>
          <div className={styles.stepsContainer}>
            {steps.map((step) => (
              <div key={step.number} className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.stepsCta}>
            <a href={signInUrl} className={styles.ctaButton}>
              Start free check
            </a>
          </div>
        </section>

        {/* Sample Results Section */}
        <section className={styles.sampleSection}>
          <h2 className={styles.sectionTitle}>Here's what you'll see</h2>
          <div className={styles.sampleContainer}>
            <pre className={styles.sampleOutput}>{`HEALTH SCORE: 64/100 - Needs Attention
============================================

CRITICAL (2)
|-- Table "events" is 340% bloated (2.1 GiB wasted)
|-- Missing index on "users.created_at" (causing 3s queries)

WARNING (4)
|-- 12 unused indexes consuming 890 MiB
|-- Autovacuum falling behind on "logs" table
|-- Connection pooler at 73% capacity
|-- 3 queries running >5s in last hour

HEALTHY (41 checks passed)`}</pre>
            <p className={styles.sampleCaption}>
              Every issue includes a one-click fix or the exact SQL to run.
            </p>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className={styles.socialProofSection}>
          <p className={styles.socialProofTitle}>Trusted by teams running serious Postgres</p>
          <div className={styles.logoGrid}>
            {trustedCompanies.map(({ name, Logo, logoScale }) => (
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
          <blockquote className={styles.testimonial}>
            <p>
              "The PostgresAI team’s forensic approach to our database incident provided the technical evidence we needed to gain support and resolution with our infrastructure provider, and their subsequent health check showed valuable insights into our platform’s scaling needs."
            </p>
            <cite>
              — Andrew Gershman
              <br />
              Staff SRE at{' '}
              <a href="https://www.linkedin.com/company/cinder-intelligence/" target="_blank" rel="noopener noreferrer">
                Cinder
              </a>
              , USA
              <br />
              Cinder is the industry’s first Trust and Safety operations platform to help organizations combat Internet abuse at scale.
            </cite>
          </blockquote>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Questions & answers</h2>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className={styles.finalCtaSection}>
          <h2 className={styles.finalCtaTitle}>
            Your database is trying to tell you something.
          </h2>
          <p className={styles.finalCtaSubtitle}>Find out what in 60 seconds.</p>
          <a href={signInUrl} className={styles.finalCtaButton}>
            Run free health check
          </a>
          <p className={styles.finalCtaNote}>
            No signup required for basic scan. Email for detailed report.
          </p>
        </section>
      </main>
    </Layout>
  )
}

export default SupabaseCheckPage
