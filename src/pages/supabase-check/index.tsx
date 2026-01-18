import React, { useState } from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import styles from './styles.module.css'
import { SupabaseLogo, GitLabLogo, SunoLogo, MiroLogo } from '../pricing'

// Check items for "What We Check" section
const checkItems = [
  {
    title: 'Bloated Tables',
    description: 'Tables grow 2-10x larger than needed. We find them.',
  },
  {
    title: 'Missing Indexes',
    description: 'Slow queries hiding in your API calls. We catch them.',
  },
  {
    title: 'Unused Indexes',
    description: 'Wasting storage and slowing writes. We identify them.',
  },
  {
    title: 'Connection Leaks',
    description: 'Eating your pooler limits. We spot them.',
  },
  {
    title: 'Vacuum Problems',
    description: 'Silent performance killer. We detect them.',
  },
  {
    title: 'Lock Contention',
    description: 'Random slowdowns under load. We expose them.',
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
    title: 'We run 47 battle-tested checks',
    description: 'Same checks we use for GitLab, Suno, and Supabase\'s own infra.',
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
    answer: 'Yes. The health check is free forever. No credit card, no trial expiration. We offer paid monitoring if you want continuous checks, but the one-time scan is always free.',
  },
  {
    question: 'Is it safe to connect my database?',
    answer: 'We use read-only access. We cannot modify your data. Your connection string is encrypted and deleted after the scan. We\'ve run 50,000+ checks without incident.',
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

  if (typeof signInUrl !== 'string') return null

  return (
    <Layout
      title="Free Supabase Database Health Check"
      description="Find hidden issues in your Supabase database. Free health check in 60 seconds. No setup. No credit card. Just answers."
    >
      <main className={styles.mainContainer}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.supabaseBadge}>
              <SupabaseLogo className={styles.supabaseBadgeLogo} />
              <span>Works with Supabase</span>
            </div>
            <h1 className={styles.heroTitle}>
              Your Supabase Database Has Hidden Problems. Let's Find Them.
            </h1>
            <p className={styles.heroSubtitle}>
              Free health check in 60 seconds. No setup. No credit card. Just answers.
            </p>
            <a href={signInUrl} className={styles.heroCta}>
              Check My Database Now
            </a>
            <p className={styles.heroTrust}>
              Works with any Supabase project. Read-only access. Used by 2,000+ teams including Supabase themselves.
            </p>
          </div>
        </section>

        {/* What We Check Section */}
        <section className={styles.checksSection}>
          <h2 className={styles.sectionTitle}>
            We scan for the issues that kill Supabase projects at scale
          </h2>
          <div className={styles.checksGrid}>
            {checkItems.map((item, index) => (
              <div key={index} className={styles.checkCard}>
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
            {steps.map((step, index) => (
              <div key={index} className={styles.step}>
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
              Start Free Check
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
|-- Table "events" is 340% bloated (2.1GB wasted)
|-- Missing index on "users.created_at" (causing 3s queries)

WARNING (4)
|-- 12 unused indexes consuming 890MB
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
              "PostgresAI found 6 issues in our Supabase project that we had no idea existed.
              Fixed them in an afternoon, API response times dropped 40%."
            </p>
            <cite>— Senior Engineer, Series A startup</cite>
          </blockquote>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Questions & Answers</h2>
          <div className={styles.faqList}>
            {faqItems.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
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
            Run Free Health Check
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
