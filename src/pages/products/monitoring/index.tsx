import React, { useEffect, useState } from 'react'
import Layout from '@theme/Layout'
import Head from '@docusaurus/Head'
import Link from '@docusaurus/Link'
import JsonLd, { MONITORING_JSON_LD } from '@site/src/components/JsonLd'

import { type WaitKey, BLOCKER, BLOCKER_TEXT, BY_BLOCKER, BY_EVENT, BY_QUERY, BY_TEXT, BUCKETS, LOCK_QUERIES, PEAK, PEAK_INDEX, PEAK_TOTAL, SERIES, WAITS, Y_MAX } from './_example'
import styles from './styles.module.css'

const CONSOLE_URL = 'https://console.postgres.ai'
const SOURCE_URL = 'https://gitlab.com/postgres-ai/postgresai'
const SKILL_URL = `${SOURCE_URL}/-/raw/main/.claude/skills/postgresai/SKILL.md`
const INSTALL_HOWTO = '/docs/postgresai-howtos/install-postgres-ai-monitoring-from-postgresai-console'
const DOCS = '/docs/monitoring'

const DESCRIPTION =
  'Postgres monitoring that you and your AI agent both read: wait events, queries, autovacuum, bloat, replication. Daily checkups open issues with recommended fixes; agents read them by CLI and MCP.'

// The social card for this page, 1200x630.
const CARD_URL = 'https://postgres.ai/img/og-monitoring-v2.png'
const CARD_ALT = 'PostgresAI monitoring: Postgres monitoring that you and your agent both read.'

// The prompt PostgresAI Console shows on "Set up with your AI agent".
const AGENT_PROMPT = `Install the PostgresAI skill and use it to check my Postgres database.

1. Download https://gitlab.com/postgres-ai/postgresai/-/raw/main/.claude/skills/postgresai/SKILL.md and save it as ~/.claude/skills/postgresai/SKILL.md (or wherever your agent keeps skills). Then read it and follow it.
2. Set up PostgresAI monitoring for my database.
3. Wait for issues to be detected, then report them in order of severity (worst first), along with recommended fixes.`

const CMD_BY_EVENT = `$ npx pgai@latest promql --project shop \\
    --at 2026-11-12T14:36:00Z \\
    'sort_desc(sum by (wait_event) (
      pgwatch_wait_events_total))'`

// The follow-up commands in the compact window: the same command and flags as
// the first block, elided with "…".
const CMD_BY_QUERY = `$ npx pgai@latest promql … \\
    'topk(3, sum by (query_id) (pgwatch_wait_events_total{
      wait_event="transactionid"}))'`

const CMD_BY_BLOCKER = `$ npx pgai@latest promql … \\
    'max by (blocker_query_id) (pgwatch_lock_waits_blocker_tx_ms{
      blocked_query_id="${LOCK_QUERIES[0][0]}"})'`

const CMD_BY_TEXT = `$ npx pgai@latest promql … \\
    'count by (displayname_raw_long) (last_over_time(
      pgwatch_query_info{queryid="${BLOCKER[0]}"}[1h]))'`

const SUPABASE_QUICKSTART = `${DOCS}/getting-started/quickstart-supabase`
const PRIVATELINK_QUICKSTART = `${DOCS}/getting-started/quickstart-rds-privatelink`
const SECURITY = '/security'

const X_LABELS = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00']
const Y_LABELS = [300, 200, 100, 0]

const AREAS: { question: string; data: string }[] = [
  { question: 'What do sessions wait for?', data: 'Active session history (ASH): wait events per query ID, every 15 seconds.' },
  { question: 'Which queries cost the most?', data: 'pg_stat_statements: calls, time, rows, buffers, WAL.' },
  { question: 'Who blocks whom?', data: 'Lock waits, long transactions, idle in transaction.' },
  { question: 'Does autovacuum keep up?', data: 'Workers, queue, dead tuples, xmin horizon holders (sessions that stop cleanup), wraparound risk.' },
  { question: 'Which tables and indexes bloat?', data: 'Sizes, bloat estimates, unused, redundant, invalid indexes.' },
  { question: 'Are replicas and the WAL archive behind?', data: 'Replication lag, slots, WAL generation, archiving lag.' },
  { question: 'How close to max_connections?', data: 'Sessions by state, and the limits.' },
]

// Plain words next to the wait event names in the chart legend.
const GLOSS: Partial<Record<WaitKey, string>> = { lwlock: 'lock manager contention' }

// Shown only after the page hydrates: without JavaScript there is no button
// that does nothing, and the prompt stays selectable text.
function CopyButton({ text }: { text: string }): JSX.Element | null {
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState(false)
  useEffect(() => setReady(typeof navigator !== 'undefined' && Boolean(navigator.clipboard)), [])
  if (!ready) return null
  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button type="button" className={styles.copy} onClick={copy} aria-live="polite">
      {copied ? 'Copied' : 'Copy prompt'}
    </button>
  )
}

// One window for every shell and prompt block on the page: a title bar with
// the three window dots and a short title, then the text. The text is a
// <pre>, so it reads and selects without JavaScript.
function Terminal({
  title,
  label,
  wrap = true,
  compact = false,
  action,
  children,
}: {
  title: string
  label: string
  wrap?: boolean
  compact?: boolean
  action?: React.ReactNode
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className={compact ? `${styles.window} ${styles.compact}` : styles.window}>
      <div className={styles.titleBar}>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.windowTitle}>{title}</span>
        <span className={styles.windowAction}>{action}</span>
      </div>
      <pre className={wrap ? `${styles.term} ${styles.wrap}` : styles.term} tabIndex={0} aria-label={label}>
        {children}
      </pre>
    </div>
  )
}

function CtaGroup(): JSX.Element {
  return (
    <div className={styles.cta}>
      <div className={styles.actions}>
        <a className={styles.primary} href="#agent">
          Set up with your agent
        </a>
        <Link className={styles.secondary} to={DOCS}>
          Documentation
        </Link>
      </div>
      <p className={styles.price}>
        From $16 per cluster per month. <Link to="/pricing">Pricing →</Link>
      </p>
    </div>
  )
}

function Chart(): JSX.Element {
  return (
    <div
      className={styles.chart}
      role="img"
      aria-label={`Example chart: active sessions over three hours, stacked by wait event. A steady 20 to 30 sessions, then a sharp rise to ${PEAK_TOTAL} at 14:36, most of them waiting for the transactionid lock, and a slower, uneven decline over the next 20 minutes.`}
    >
      <div className={styles.yAxis} aria-hidden="true">
        {Y_LABELS.map((y) => (
          <span key={y}>{y}</span>
        ))}
      </div>
      <div className={styles.plot} aria-hidden="true">
        <span className={styles.peakNote} style={{ left: `${((PEAK_INDEX + 0.5) / BUCKETS) * 100}%` }}>
          {PEAK_TOTAL} at 14:36
        </span>
        <div className={styles.bars}>
          {SERIES.map((b, i) => (
            <div key={i} className={styles.bar}>
              {WAITS.map((w) => (
                <i key={w.key} data-w={w.key} style={{ height: `${(b[w.key] / Y_MAX) * 100}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.xAxis} aria-hidden="true">
        {X_LABELS.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
    </div>
  )
}

export default function MonitoringPage(): JSX.Element {
  return (
    <Layout title="PostgresAI monitoring" description={DESCRIPTION}>
      <Head>
        <meta property="og:image" content={CARD_URL} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={CARD_ALT} />
        <meta name="twitter:image" content={CARD_URL} />
        <meta name="twitter:image:alt" content={CARD_ALT} />
      </Head>
      <JsonLd data={MONITORING_JSON_LD} />
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.product}>PostgresAI monitoring</p>
          <h1 className={styles.title}>Postgres monitoring that you and your agent both read.</h1>
          <p className={styles.lede}>
            Catch problems early, and find the cause with your agent.
          </p>
          <CtaGroup />

          <figure className={styles.example}>
            <figcaption className={styles.exampleHead}>
              <h2 className={styles.exampleTitle}>When something happens: investigating a spike</h2>
              <p>Active sessions go from a steady 20-30 to {PEAK_TOTAL}. Why?</p>
            </figcaption>
            <div className={styles.readers}>
              <div className={styles.reader}>
                <p className={styles.who}>
                  <b>You, in dashboards</b> <span>active session history, 3 hours</span>
                </p>
                <Chart />
                <ul className={styles.legend}>
                  {[...WAITS].sort((a, b) => PEAK[b.key] - PEAK[a.key]).map((w) => (
                    <li key={w.key}>
                      <i data-w={w.key} aria-hidden="true" />
                      <span>
                        {w.type === w.event ? w.type : `${w.type}: ${w.event}`}
                        {GLOSS[w.key] && <small className={styles.gloss}> ({GLOSS[w.key]})</small>}
                      </span>
                      <b>{PEAK[w.key]}</b>
                    </li>
                  ))}
                </ul>
                <p className={styles.note}>
                  Sessions at 14:36, by wait event. CPU* means that Postgres reports no wait event.
                </p>
                <div className={styles.after}>
                  <p className={styles.finding}>
                    <b>The finding:</b> {PEAK.lock} of {PEAK_TOTAL} sessions wait for a row lock, and one query ID has{' '}
                    {LOCK_QUERIES[0][1]} of them. Their blocker has had a transaction open for{' '}
                    {Math.round(BLOCKER[1] / 1000)} seconds, and runs <code>{BLOCKER_TEXT}</code>.
                  </p>
                  <p className={styles.note}>
                    Example data; real metrics and commands. The first answer can take up to about 12 minutes;
                    follow-ups come within seconds.{' '}
                    <Link to="/docs/reference-guides/postgresai-cli-reference#command-promql">CLI reference →</Link>
                  </p>
                </div>
              </div>
              <div className={styles.reader}>
                <p className={styles.who}>
                  <b>Your agent, in a shell</b> <span>the stored history of 14:36, queried later</span>
                </p>
                <Terminal title="pgai promql" label="Shell example: wait events at the peak">
                  <span className={styles.comment}>
                    {'# What do the sessions wait for?\n# pgwatch_wait_events_total is a gauge: sessions per event'}
                  </span>
                  {'\n'}
                  <span className={styles.cmd}>{CMD_BY_EVENT}</span>
                  {'\n'}
                  {BY_EVENT}
                </Terminal>
                <p className={styles.step}>Then, in the same shell:</p>
                <Terminal title="pgai promql" label="Shell example: the waiting query IDs, their blocker, and its query text" compact>
                  <span className={styles.comment}># Which queries wait for the row lock?</span>
                  {'\n'}
                  <span className={styles.cmd}>{CMD_BY_QUERY}</span>
                  {'\n'}
                  {BY_QUERY}
                  {'\n\n'}
                  <span className={styles.comment}># Who blocks them? (value: the blocker&apos;s transaction age, ms)</span>
                  {'\n'}
                  <span className={styles.cmd}>{CMD_BY_BLOCKER}</span>
                  {'\n'}
                  {BY_BLOCKER}
                  {'\n\n'}
                  <span className={styles.comment}># What does the blocker run?</span>
                  {'\n'}
                  <span className={styles.cmd}>{CMD_BY_TEXT}</span>
                  {'\n'}
                  {BY_TEXT}
                </Terminal>
              </div>
            </div>
          </figure>
        </section>

        <section className={styles.warn} aria-labelledby="checkups">
          <h2 id="checkups" className={styles.warnTitle}>Checkups warn you early</h2>
          <ul className={styles.hear}>
            <li><b>First checkup:</b> indexes, bloat, Postgres version and risky settings, with recommended fixes.</li>
            <li><b>After about 24 hours:</b> query analysis and wait-event trends, then daily checkups.</li>
            <li><b>Every Monday:</b> a weekly review; over time, health history and forecasts.</li>
            <li><b>Every plan:</b> issue updates by email or Slack. Your agent reads issues through the CLI or MCP, and metrics through the CLI.</li>
            <li><b>Not a pager:</b> keep your on-call alerting.</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="what-it-keeps">
          <h2 id="what-it-keeps">What it keeps</h2>
          <p className={styles.prose}>
            The state and the history of your Postgres: sessions, wait events, queries, autovacuum, bloat,
            replication. The system views, sampled every 30 seconds for most metrics, with history.
          </p>
          <div className={styles.areas}>
            {AREAS.map((a) => (
              <div key={a.question} className={styles.area}>
                <h3>{a.question}</h3>
                <p>{a.data}</p>
              </div>
            ))}
          </div>
          <p className={styles.more}>
            Host CPU, memory and disk for RDS, Aurora, Supabase and ClickHouse.{' '}
            <Link to={`${DOCS}/dashboards/`}>14 dashboards →</Link>
          </p>
        </section>



        {/*
          Sources for the statements about CloudWatch and Datadog, read on 2026-11-17.
          Both show load by wait event:
            https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Database-Insights-Database-Instance-Dashboard.html
            https://docs.datadoghq.com/integrations/postgres/ (postgresql.activity.wait_event)
          RDS metric and counter lists are instance-wide, with no bloat estimate:
            https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html
            https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights_Counters.html
          Datadog: collect_bloat_metrics defaults to false; no autovacuum queue metric:
            https://docs.datadoghq.com/integrations/postgres/
            https://github.com/DataDog/integrations-core/blob/master/postgres/datadog_checks/postgres/data/conf.yaml.example
          Database Insights: per-query statistics are Advanced only, billed per vCPU-hour; RDS, Aurora, EC2:
            https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Database-Insights.html
            https://aws.amazon.com/cloudwatch/pricing/
          Datadog Database Monitoring, $70 per database host per month, billed annually:
            https://www.datadoghq.com/pricing/list/
          postgres_exporter: stat_statements collector disabled by default, no bloat collector:
            https://github.com/prometheus-community/postgres_exporter (README, Flags)
          PostgresAI plans: src/data/monitoringPlans.json, src/pages/pricing/index.tsx
          Datadog deployments and SaaS backend, explain on sampled queries, samples and plans sent:
            https://docs.datadoghq.com/database_monitoring/architecture/
            https://docs.datadoghq.com/database_monitoring/data_collected/
            https://docs.datadoghq.com/database_monitoring/setup_postgres/selfhosted/
          Recommendations:
            https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/monitoring-recommendations.html
            https://docs.datadoghq.com/database_monitoring/recommendations/
        */}
        <section className={styles.section} aria-labelledby="comparison">
          <h2 id="comparison">Compared with CloudWatch, Datadog and a DIY Grafana</h2>
          <p className={styles.prose}>
            CloudWatch and Datadog are good general tools, with database load by wait event and automatic
            recommendations. The differences, from their public docs:
          </p>
          <dl className={`${styles.facts} ${styles.factsWide}`}>
            <div>
              <dt>Postgres depth</dt>
              <dd>
                <span>CloudWatch (RDS for PostgreSQL): instance-wide metrics, no bloat estimates.</span>
                <span>Datadog: bloat estimates off by default, no autovacuum queue metric.</span>
                <span><b>PostgresAI:</b> bloat estimates, the autovacuum queue and the xmin horizon holder, by default.</span>
              </dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>
                <span>CloudWatch Database Insights: Standard free, 7 days; per-query statistics need Advanced, per vCPU-hour.</span>
                <span>Datadog Database Monitoring: $70 per database host per month, billed annually.</span>
                <span>
                  <b>PostgresAI:</b> Starter covers the primary; Scale includes replicas (up to 5)
                  and Grafana. <Link to="/pricing">Pricing →</Link>
                </span>
              </dd>
            </div>
            <div>
              <dt>postgres_exporter + Grafana, run yourself</dt>
              <dd>
                <span>Free and open source; you run it. <code>pg_stat_statements</code> off by default, no bloat estimates.</span>
                <span><b>PostgresAI:</b> both by default, plus wait-event history per query ID, daily checkups and issues. The core is open source too.</span>
              </dd>
            </div>
          </dl>
          <details className={styles.sources}>
            <summary>Sources</summary>
            <p>
              <a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Database-Insights.html">Database Insights</a>,{' '}
              <a href="https://aws.amazon.com/cloudwatch/pricing/">CloudWatch pricing</a>,{' '}
              <a href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html">RDS metrics</a>,{' '}
              <a href="https://www.datadoghq.com/pricing/list/">Datadog pricing</a>,{' '}
              <a href="https://docs.datadoghq.com/integrations/postgres/">Datadog Postgres integration</a>,{' '}
              <a href="https://github.com/prometheus-community/postgres_exporter">postgres_exporter</a>; read in November 2026.
            </p>
          </details>
        </section>

        <section className={styles.section} aria-labelledby="start">
          <h2 id="start">Set it up with your AI agent</h2>
          <div className={styles.fit}>
            <h3>Which setup fits you</h3>
            <dl className={styles.facts}>
              <div>
                <dt>Any Postgres with a public endpoint: RDS, Aurora, Neon, self-managed, Cloud SQL, Azure</dt>
                <dd>
                  PostgresAI runs the monitoring box. For IP allowlists, Deploy shows the box&apos;s IP first.
                  <span className={styles.neonNote}>Neon: 30-second monitoring queries keep the compute awake.</span>
                </dd>
              </div>
              <div>
                <dt>RDS in a private subnet</dt>
                <dd>
                  AWS PrivateLink, on Scale: $512 per cluster, replicas included. Single RDS instances; Aurora not yet.{' '}
                  <Link to={PRIVATELINK_QUICKSTART}>Setup guide →</Link>
                </dd>
              </div>
              <div>
                <dt>Supabase</dt>
                <dd>
                  <Link to={SUPABASE_QUICKSTART}>Approve access in Supabase</Link> (OAuth): no URL, no password. Any
                  plan, with host stats.
                </dd>
              </div>
              <div>
                <dt>Other private networks</dt>
                <dd><Link to="/contact">Contact us →</Link></dd>
              </div>
            </dl>
          </div>
          <div className={styles.ways}>
            <div className={styles.way} id="agent">
              <h3>Paste this prompt into your agent</h3>
              <Terminal title="Prompt" label="Agent prompt" wrap action={<CopyButton text={AGENT_PROMPT} />}>
                {AGENT_PROMPT}
              </Terminal>
              <ul className={styles.steps}>
                <li>Claude Code, Cursor, Codex, or any agent that runs commands.</li>
                <li>Your agent does the setup. You approve the sign-in, say yes to the price, and add a card.</li>
                <li>
                  Setup creates a read-only role (<code>postgres_ai_mon</code>), a <code>postgres_ai</code> schema and{' '}
                  <code>pg_stat_statements</code>. Nothing else changes in your database without your OK:{' '}
                  <a href={SKILL_URL}>SKILL.md</a>.
                </li>
              </ul>
            </div>
            <div className={`${styles.way} ${styles.waySide}`}>
              <div className={styles.agentStart}>
                <h3>Agents start here</h3>
                <p><a href={SKILL_URL}>{SKILL_URL}</a></p>
                <p>On a remote machine, use an API key instead of the browser sign-in.</p>
              </div>
              <h3>Prefer to click through it yourself?</h3>
              <ol className={styles.steps}>
                <li>Sign in to PostgresAI Console and create an organization.</li>
                <li>
                  <b>DB health</b> &rarr; <b>Monitoring instances</b>: pick your database, then Starter or Scale.
                </li>
                <li>
                  Add a card and the database URL. For <Link to={SUPABASE_QUICKSTART}>Supabase</Link>, you approve
                  access in Supabase (OAuth) instead: no URL, no password.
                </li>
                <li>
                  <b>Test connection</b> &rarr; <b>Deploy</b>.
                </li>
              </ol>
              <div className={styles.actions}>
                <a className={styles.secondary} href={CONSOLE_URL}>
                  Open PostgresAI Console
                </a>
                <Link className={styles.plain} to={INSTALL_HOWTO}>
                  Step by step
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="professional-way">
          <h2 id="professional-way">The people behind it</h2>
          <ul className={styles.points}>
            <li>
              Your agent follows the order we use in consulting: golden signals, then wait events, then the query.
            </li>
            <li>
              When a problem needs a human, escalate it: Scale includes two expert requests per month, answered within
              24 business hours; you can buy more. Larger work: <Link to="/consulting">PostgresAI consulting</Link>.
            </li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="data-privacy-metadata-only">
          <h2 id="data-privacy-metadata-only"><Link to={`${DOCS}#data-privacy-metadata-only`}>Data privacy →</Link></h2>
          <p className={styles.prose}>
            No table data, no application data, no query parameter values (one exception below).
          </p>
          <ul className={styles.points}>
            <li>
              Collected: system view statistics, wait events, object names, and query texts with <code>$1</code>,{' '}
              <code>$2</code> in place of parameters.
            </li>
            <li>
              The exception, on by default: the health check includes the first 500 characters of the query
              that holds the xmin horizon, as written, so it can contain literal values. The setting{' '}
              <code>postgresai.capture_query_preview=off</code> disables it.
            </li>
            <li>
              Credentials: an admin login is used once to create the read-only role and is never stored, or you create
              the role yourself (<code>npx pgai@latest prepare-db --print-sql</code>). The monitoring box connects as
              that role.
            </li>
            <li>
              <Link to={SUPABASE_QUICKSTART}>Supabase</Link> only: for host stats, PostgresAI reads the project&apos;s
              secret key on demand, never stores it, and logs each use.
            </li>
            <li>
              Every metric&apos;s source is public: the SQL in{' '}
              <a href={`${SOURCE_URL}/-/blob/0.18.0/config/pgwatch-prometheus/metrics.yml`}>metrics.yml</a>, and
              the query texts for chart legends (<code>pgwatch_query_info</code>) from the{' '}
              <a href={`${SOURCE_URL}/-/blob/0.18.0/monitoring_flask_backend/app.py`}>monitoring backend</a>.
            </li>
          </ul>
          <div className={styles.review}>
            <h3>For a security review</h3>
            <ul className={styles.points}>
              <li>
                Where it runs: a VM in PostgresAI cloud that PostgresAI operates, on the provider and region you choose
                in <Link to={`${INSTALL_HOWTO}#advanced-setup-optional`}>Advanced setup</Link> (for example, AWS or
                Hetzner).
              </li>
              <li>
                <Link to={SECURITY}>SOC 2 Type 2</Link>: the PostgresAI Platform, Security and Availability criteria,
                examined by Sensiba LLP for March 4 to June 4, 2026. The report is issued to DBLab Inc., an affiliate of
                Nombox LLC d.b.a. PostgresAI, and shared under NDA on request.
              </li>
              <li>
                Sub-processors, with where they process data:{' '}
                <Link to="/docs/platform/service-providers">the published list</Link>.
              </li>
              <li>
                Pin the CLI:{' '}
                <code>
                  {/* "pgai@0.18.0" as one text node reads as an email address to Cloudflare's email
                      obfuscation, which then serves "[email protected]" to readers without JS. The
                      span keeps the raw HTML from matching. */}
                  npx pgai<span>@</span>0.18.0
                </code>.
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="supported-postgres-versions">
          <h2 id="supported-postgres-versions">Supported Postgres versions</h2>
          <dl className={styles.facts}>
            <div>
              <dt>Versions</dt>
              <dd>
                PostgreSQL 14 through 19. Version 19 is a pre-release (RC1).{' '}
                <Link to={`${DOCS}#supported-postgres-versions`}>Details</Link>.
              </dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>Open-source core, Apache 2.0 (postgres-ai/postgresai). PostgresAI Console runs it for you.</dd>
            </div>
          </dl>
        </section>

        <section className={styles.closing}>
          <p>Install it while your database is healthy. One prompt, and your agent sets it up.</p>
          <CtaGroup />
        </section>
      </main>
    </Layout>
  )
}
