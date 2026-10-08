import React from 'react'
import clsx from 'clsx'
import Head from '@docusaurus/Head'
import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'

import { DiagnosisScene } from './EvidenceScenes'
import CloneEconomics from './CloneEconomics'
import ParticleWordmark from './ParticleWordmark'
import Proof, { CustomerLogos, type Testimonial } from './Testimonials'
import { RevealTitle } from './motion'
import { WORKS_WITH } from './content'
import { ControlScene } from './ValueScenes'
import styles from './styles.module.css'

/* Customer outcomes lead; monitoring, branching and guardrails follow. Canvas effects are decorative. */

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900' +
  '&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800' +
  '&family=Geist+Mono:wght@400;500;700&display=swap'

const PRICING = '/pricing'
const CONSOLE = 'https://console.postgres.ai/'

function Hero({ consoleUrl }: { consoleUrl: string }) {
  const platformBaseUrl = useBaseUrl('/img/platforms/')
  return (
    <section className={clsx(styles.section, styles.hero)} aria-labelledby="home-title">
      <div className={clsx('container', styles.heroGrid)}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Postgres expertise, automated.</p>
          <h1 id="home-title" className={styles.h1}>
            Postgres under control.{' '}
            <span className={styles.accent}>Focus on your product.</span>
          </h1>
          <p className={styles.heroSub}>
            Keep database health under control with continuous monitoring, prioritized fixes and safe testing with database branching.
            Give your team and coding agents room to build the product.
          </p>
          <div className={styles.heroCta}>
            <div className={styles.ctaPair}>
              <a href={consoleUrl} className={clsx(styles.btn, styles.btnPrimary)}>Get started in minutes →</a>
            </div>
            <p className={styles.heroQuickLink}>Sign in or create your Console account.</p>
          </div>
        </div>
        <div className={styles.heroTile}>
          <ControlScene />
        </div>
      </div>
      <div className={clsx('container', styles.works)}>
        <p className={styles.worksLabel}>Works with any Postgres</p>
        <ul className={styles.worksList}>
          {WORKS_WITH.map((w, i) => (
            <li key={w.name} style={{ '--platform': i } as React.CSSProperties}>
              <span className={clsx(styles.platformChip, w.dark && styles.platformChipDark)} aria-hidden="true">
                <img src={`${platformBaseUrl}${w.logo}`} alt="" width="26" height="26" loading="lazy" decoding="async" />
              </span>
              <span>{w.name}</span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}

function MonitorDiagnose() {
  return (
    <section id="see" className={clsx(styles.section, styles.chapter)} aria-labelledby="see-title">
      <div className="container">
        <div className={styles.chapterHead}>
          <p className={styles.eyebrow}>01 / Monitor → Diagnose</p>
          <RevealTitle id="see-title" className={styles.h2} text="Keep database problems from slowing your product." />
          <p className={styles.lede}>Track around 1,000 metrics across queries, indexes, storage and database risks. Prioritized findings explain what needs attention and what to do next.</p>
        </div>
        <DiagnosisScene consoleUrl={CONSOLE} />
      </div>
    </section>
  )
}

function TestReview({ consoleUrl }: { consoleUrl: string }) {
  return (
    <section id="branch" className={clsx(styles.section, styles.chapter, styles.chapterAlt)} aria-labelledby="branch-title">
      <div className="container">
        <div className={styles.chapterHead}>
          <p className={styles.eyebrow}>DBLab / Database branching for coding agents</p>
          <RevealTitle id="branch-title" className={styles.h2} text="Database branching. A full Postgres for every agent." />
          <p className={styles.lede}>Give every coding agent its own branch: an isolated, fully writable Postgres clone with your schema, data and extensions. Ready in a couple of seconds, even at 100 TiB. Run migrations and experiments in parallel, then discard the branches. Production stays untouched.</p>
        </div>
        <p className={styles.branchPromise}>More agents. One shared base. No extra full-copy storage costs.</p>
        <CloneEconomics />
        <p className={styles.inlineLinks}>Use DBLab Cloud or run DBLab in your own infrastructure. Once the base copy is ready, each branch is a thin clone that shares its data and stores only its changes. Compute and changed-data storage depend on your workload.</p>
        <a href={consoleUrl} className={clsx(styles.btn, styles.btnPrimary)}>Get started in minutes →</a>
      </div>
    </section>
  )
}

/* Read-only checkups, plan-only Joe responses, obfuscated test data and
 * infrastructure choice, backed by the SOC 2 Type 2 attestation. */
function Guardrails() {
  const sensiba = useBaseUrl('/assets/compliance/soc2-type2-sensiba.png')
  const sensibaDark = useBaseUrl('/assets/compliance/soc2-type2-sensiba-white.png')
  const seal = useBaseUrl('/assets/compliance/aicpa-soc2-seal-k.png')
  const sealDark = useBaseUrl('/assets/compliance/aicpa-soc2-seal.png')
  return (
    <section className={clsx(styles.section, styles.guardrails)} aria-labelledby="guardrails-title">
      <div className="container">
        <p className={styles.eyebrow}>Guardrails</p>
        <RevealTitle id="guardrails-title" className={styles.h2} text="Safe by default." />
        <ul className={styles.guardList}>
          <li>
            <strong>Read-only checkups.</strong> Select queries over Postgres's catalog and statistics views, with the
            pg_monitor role.
          </li>
          <li>
            <strong>Plans, never data.</strong> Joe returns execution plans and timings, not rows.
          </li>
          <li>
            <strong>Keep PII out of testing.</strong> Use DBLab Cloud or your own infrastructure. Obfuscate sensitive data before it reaches agents and non-production environments.
          </li>
          <li className={styles.guardSoc}>
            <span>
              <strong>SOC 2 Type 2.</strong> Examined by Sensiba LLP. <Link to="/security">Security</Link>
            </span>
            <span className={styles.badges}>
              <img className={styles.lightOnly} src={sensiba} alt="Sensiba SOC 2 Type 2" width={120} height={44} loading="lazy" />
              <img className={styles.darkOnly} src={sensibaDark} alt="Sensiba SOC 2 Type 2" width={120} height={44} loading="lazy" />
              <a href="https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2" className={styles.seal}>
                <img className={styles.lightOnly} src={seal} alt="AICPA SOC 2" width={44} height={44} loading="lazy" />
                <img className={styles.darkOnly} src={sealDark} alt="AICPA SOC 2" width={44} height={44} loading="lazy" />
              </a>
            </span>
          </li>
        </ul>
      </div>
    </section>
  )
}

function FinalCta({ consoleUrl }: { consoleUrl: string }) {
  return (
    <section className={clsx(styles.section, styles.final)} aria-labelledby="final-title">
      <div className={clsx('container', styles.finalInner)}>
        <RevealTitle id="final-title" className={styles.h2} text="Focus on building your product. We'll keep your Postgres healthy." />
        <div className={styles.ctaPair}>
          <a href={consoleUrl} className={clsx(styles.btn, styles.btnPrimary)}>Get started in minutes →</a>
        </div>
        <p className={styles.inlineLinks}>Start with a free checkup or continuous monitoring. <Link to={PRICING}>See pricing →</Link></p>
      </div>
    </section>
  )
}

export default function Home({ testimonials }: { signInUrl?: string; testimonials: Testimonial[] }) {
  return (
    <div className={styles.home}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </Head>
      <Hero consoleUrl={CONSOLE} />
      <Proof testimonials={testimonials} />
      <MonitorDiagnose />
      <TestReview consoleUrl={CONSOLE} />
      <CustomerLogos consoleUrl={CONSOLE} />
      <Guardrails />
      <FinalCta consoleUrl={CONSOLE} />
      <ParticleWordmark />
    </div>
  )
}
