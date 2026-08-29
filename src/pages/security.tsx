import React, { useMemo, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'

import styles from './security.module.css'

// AICPA SOC 2 logo: registered use, valid for 12 months from the report date.
// Report dated 2026-06-04 -> remove or re-register by 2027-06-04 unless a new
// report has been issued. The seal must stay hyperlinked to aicpa.org/soc4so
// and must not be altered in any way except for size.
const AICPA_SOC4SO_URL = 'https://www.aicpa.org/soc4so'
const SOC3_REPORT_URL = '/download/DBLab-SOC3-Report-2026.pdf'

const SecurityPage: React.FC = () => {
  const { siteConfig } = useDocusaurusContext()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent('SOC 2 Type 2 report request — PostgresAI')
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Company: ${company}`,
        `Business email: ${email}`,
        '',
        'Reason for request:',
        reason,
      ].join('\n')
    )
    return `mailto:inga@postgres.ai?subject=${subject}&body=${body}`
  }, [name, company, email, reason])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const webhookUrl =
      ((siteConfig?.customFields as any)?.socRequestWebhook as string) || ''

    if (webhookUrl) {
      try {
        setSubmitting(true)
        setSubmitError('')
        const payload = {
          requestType: 'soc2-type2-report',
          name,
          company,
          email,
          reason,
          pagePath:
            typeof window !== 'undefined' ? window.location.pathname : '',
          timestamp: new Date().toISOString(),
        }
        // Opaque response; the receiving script does not need to return JSON.
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        setSubmitted(true)
        setSubmitting(false)
        return
      } catch (err) {
        setSubmitting(false)
        setSubmitError('Submit failed. Opening your email client instead…')
      }
    }

    // Fallback: hand the request to the visitor's mail client.
    window.location.href = mailtoHref
  }

  return (
    <Layout
      title="Security and compliance — SOC 2 Type 2 and SOC 3"
      description="The PostgresAI Platform has completed a SOC 2® Type 2 examination for the Security and Availability Trust Services Criteria, performed by Sensiba LLP. Download the SOC 3 report or request the SOC 2 Type 2 report."
    >
      <main className={styles.page}>
        <header className={styles.hero}>
          <h1>Security and compliance</h1>
          <p className={styles.lede}>
            Security is a first-class requirement of the PostgresAI Platform, not
            an afterthought. This page covers our independent attestations and
            how we run security day to day.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="attestations">
          <h2 id="attestations">Compliance and attestations</h2>

          <div className={styles.attestation}>
            <div className={styles.badges}>
              <img
                className={styles.badgeLight}
                src="/assets/compliance/soc2-type2-sensiba.png"
                alt="SOC 2® Type 2 attested — audited by Sensiba LLP"
                width={267}
                height={125}
                loading="lazy"
              />
              <img
                className={styles.badgeDark}
                src="/assets/compliance/soc2-type2-sensiba-white.png"
                alt="SOC 2® Type 2 attested — audited by Sensiba LLP"
                width={267}
                height={125}
                loading="lazy"
              />
              {/*
                AICPA seal — must remain hyperlinked to aicpa.org/soc4so and
                must not be altered except for size. Do not apply filters,
                recolouring or masks to this image in any theme.
              */}
              <a
                className={styles.aicpaLink}
                href={AICPA_SOC4SO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className={styles.aicpaSeal}
                  src="/assets/compliance/aicpa-soc2-seal.png"
                  alt="AICPA SOC for Service Organizations seal (SOC 2®)"
                  width={110}
                  height={109}
                  loading="lazy"
                />
              </a>
            </div>

            <div className={styles.attestationBody}>
              <p>
                The PostgresAI Platform has successfully completed a SOC 2® Type
                2 examination for the Security and Availability Trust Services
                Criteria, performed by Sensiba LLP, covering the period March 4 –
                June 4, 2026.
              </p>
              <p className={styles.reportNote}>
                The SOC 3® report is publicly available and can be downloaded
                below. The SOC 2 Type 2 report contains detailed control and
                testing information, is restricted use, and is shared with
                customers and prospects under NDA on request.
              </p>

              <div className={styles.actions}>
                <a
                  className={styles.primaryButton}
                  href={SOC3_REPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download SOC 3 report (PDF)
                </a>
                <a className={styles.secondaryButton} href="#request-soc2">
                  Request SOC 2 Type 2 report
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="practices">
          <h2 id="practices">How we run security</h2>
          <dl className={styles.practices}>
            <div>
              <dt>Encryption</dt>
              <dd>
                Data is encrypted in transit with TLS, and volumes holding
                customer data are encrypted at rest.
              </dd>
            </div>
            <div>
              <dt>Backups and availability</dt>
              <dd>
                Platform data is backed up on a regular schedule, with restores
                exercised as part of our availability commitments — one of the
                two Trust Services Criteria in the scope above.
              </dd>
            </div>
            <div>
              <dt>Incident response</dt>
              <dd>
                Incidents are triaged by the engineer on call, assigned a
                severity, and any incident that risks customer data triggers a
                customer alert within 24 hours.
              </dd>
            </div>
            <div>
              <dt>Vulnerability management</dt>
              <dd>
                Container images and dependencies are scanned continuously, and
                findings are tracked to remediation.
              </dd>
            </div>
          </dl>
          <p>
            Full detail — architecture, customer data handling, and the security
            model for self-managed installations — is in the{' '}
            <a href="/docs/platform/security">DBLab Platform security</a>{' '}
            documentation.
          </p>
          <p>
            Found a possible vulnerability? Email{' '}
            <a href="mailto:security@postgres.ai">security@postgres.ai</a>.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="request-soc2">
          <h2 id="request-soc2">Request the SOC 2 Type 2 report</h2>
          <p>
            Tell us a little about you and we will send the report under NDA.
            Requests go to our compliance team and are answered by a person, not
            an automated download.
          </p>

          {submitted ? (
            <p className={styles.success} role="status">
              Thank you — your request has been received. We will be in touch at
              the address you provided.
            </p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <label htmlFor="soc-name">
                Name
                <input
                  id="soc-name"
                  type="text"
                  required
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label htmlFor="soc-company">
                Company
                <input
                  id="soc-company"
                  type="text"
                  required
                  value={company}
                  autoComplete="organization"
                  onChange={(e) => setCompany(e.target.value)}
                />
              </label>
              <label htmlFor="soc-email">
                Business email
                <input
                  id="soc-email"
                  type="email"
                  required
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label htmlFor="soc-reason">
                Reason for request
                <textarea
                  id="soc-reason"
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>

              {submitError ? (
                <p className={styles.error} role="alert">
                  {submitError}
                </p>
              ) : null}

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Request report'}
              </button>
            </form>
          )}
        </section>
      </main>
    </Layout>
  )
}

export default SecurityPage
