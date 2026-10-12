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
  return (
    <section className={clsx(styles.section, styles.hero)} aria-labelledby="home-title">
      <div className={clsx('container', styles.heroGrid)}>
        <div className={styles.heroCopy}>
          <h1 id="home-title" className={styles.h1}>Zero drama Postgres</h1>
          <p className={styles.heroSubtitle}>Today's pains fixed. Tomorrow's pains prevented.</p>
          <p className={styles.heroSub}>
            Slow queries, incidents, growth limits: we fix them. Then every change, upgrades included, is rehearsed on a full copy of your data and comes back with evidence before it touches production.
          </p>
          <div className={styles.heroCta}>
            <div className={styles.ctaPair}>
              <a href={consoleUrl} className={clsx(styles.btn, styles.btnPrimary)}>Get started in minutes →</a>
              <Link to="/consulting" className={styles.btn}>Talk to an expert →</Link>
            </div>
            <p className={styles.heroQuickLink}>Free checkup, no credit card. Your data stays in your environment.</p>
          </div>
        </div>
        <div className={styles.heroTile}>
          <ControlScene />
        </div>
      </div>

    </section>
  )
}

const TROUBLES = [
  { title: 'Slow queries and high load.', body: 'Find the cause, fix it, confirm it on a copy of your data.', to: '/consulting' },
  { title: 'Incidents and corruption.', body: 'Fast response, root cause, a fix that is tested before it is applied.', to: '/consulting' },
  { title: 'Major upgrades, zero downtime.', body: 'PG12 to PG18 and beyond, rehearsed on your data, applied without a maintenance window.', to: '/products/postgres-ai-zdu' },
  { title: 'Growth and capacity.', body: 'Know what breaks at 10x before it does. Indexes, vacuum, connections, storage.', to: '/consulting' },
]

function Troubles() {
  return (
    <section className={clsx(styles.section, styles.troubles)} aria-labelledby="troubles-title">
      <div className="container">
        <RevealTitle id="troubles-title" className={styles.h2} text="What teams call us for" />
        <div className={styles.troubleGrid}>
          {TROUBLES.map(item => <Link key={item.title} to={item.to} className={styles.troubleCard}>
            <h3>{item.title}</h3><p>{item.body}</p><span aria-hidden="true">→</span>
          </Link>)}
        </div>
        <p className={styles.inlineLinks}><Link to="/consulting">Already know the problem? Talk to an expert →</Link></p>
      </div>
    </section>
  )
}

function WorksWith() {
  const platformBaseUrl = useBaseUrl('/img/platforms/')
  return (
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
  )
}

function SameRule() {
  return (
    <section className={clsx(styles.section, styles.sameRule)} aria-labelledby="same-rule-title">
      <div className="container">
        <RevealTitle id="same-rule-title" className={styles.h2} text="Human or agent, same rule." />
        <p className={styles.lede}>Coding agents now propose many database changes. They get the same treatment as our own experts: the change runs on a copy of your data, the evidence is shown, and you approve before production.</p>
        <p className={styles.inlineLinks}><Link to="/docs/dblab-howtos/branching">How we test changes →</Link></p>
      </div>
    </section>
  )
}

function PodcastStrip() {
  return (
    <aside className={styles.podcastStrip} aria-label="Postgres podcasts and live sessions">
      <div className="container">
        <p>Postgres FM. Our weekly podcast since 2022, 190+ episodes on running Postgres in production. <a href="https://postgres.fm">Listen →</a></p>
        <p className={styles.podcastSecondary}>Postgres.TV: live hacking sessions on Postgres internals. <a href="https://www.youtube.com/PostgresTV">Watch →</a></p>
      </div>
    </aside>
  )
}

function MonitorDiagnose() {
  return (
    <section id="see" className={clsx(styles.section, styles.chapter)} aria-labelledby="see-title">
      <div className="container">
        <div className={styles.chapterHead}>
          <p className={styles.eyebrow}>01 / Monitor → Diagnose</p>
          <RevealTitle id="see-title" className={styles.h2} text="Catch it before it becomes an incident." />
          <p className={styles.lede}>Track around 1,000 metrics across queries, indexes, storage and database risks. Prioritized findings explain what needs attention, what to do next, and what to test first.</p>
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
          <p className={styles.eyebrow}>DBLab / Test on a copy</p>
          <RevealTitle id="branch-title" className={styles.h2} text="Every change tested on a full copy first. Upgrades included." />
          <p className={styles.lede}>Migrations, index changes, config, major upgrades: we run them on a branch of production-size data in seconds, compare plans and timing, and show you the result before anything touches production. Your engineers and your coding agents get the same branches.</p>
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
  return (
    <section className={clsx(styles.section, styles.guardrails)} aria-labelledby="guardrails-title">
      <div className="container">
        <p className={styles.eyebrow}>Guardrails</p>
        <RevealTitle id="guardrails-title" className={styles.h2} text="Safe by default." />
        <ul className={styles.guardList}>
          <li><strong>Your keys, your decision.</strong> PostgresAI never changes production without your approval.</li>
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
          <li>
            <Link to="/security"><strong>SOC2</strong></Link>
          </li>
        </ul>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className={clsx(styles.section, styles.final)} aria-labelledby="final-title">
      <div className={clsx('container', styles.finalInner)}>
        <RevealTitle id="final-title" className={styles.h2} text="In trouble now? Talk to an expert today." />
        <div className={styles.ctaPair}>
          <Link to="/consulting" className={clsx(styles.btn, styles.btnPrimary)}>Talk to an expert →</Link>
        </div>
        <p className={styles.inlineLinks}>Not on fire? Start with a free checkup or continuous monitoring. <Link to={PRICING}>See pricing →</Link></p>
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
      <Troubles />
      <WorksWith />
      <Proof testimonials={testimonials} />
      <MonitorDiagnose />
      <TestReview consoleUrl={CONSOLE} />
      <SameRule />
      <Guardrails />
      <CustomerLogos consoleUrl={CONSOLE} />
      <PodcastStrip />
      <FinalCta />
      <ParticleWordmark />
    </div>
  )
}
