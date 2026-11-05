import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'

import styles from './styles.module.css'

const CONTACT_URL = 'mailto:sales@postgres.ai?subject=DBLab%20Forge'

const UUID_POST = '/blog/20261105-uuidv4-vs-uuidv7'
const UUID_BRIEF = 'https://console.postgres.ai/shared/brief/9fffe2da-00c1-470b-a79d-a210ae2306bc'
const UUID_EPISODE = 'https://postgres.fm/episodes/uuidv4-vs-uuidv7'
const DUMP_POST = '/blog/20261028-dump-restore-now-what'
const DUMP_EPISODE = 'https://postgres.fm/episodes/dump-restore-done-now-what'

type Stat = {
  value: string
  label: string
  note: string
}

type Chart = {
  light: string
  dark?: string
  narrow?: string
  narrowDark?: string
  alt: string
}

type Study = {
  title: string
  summary: string
  stats: Stat[]
  chart: Chart
  setup: string
  post: string
  episode: string
  episodeLabel: string
  brief?: string
}

const METHOD = [
  {
    title: 'Predictions first',
    text: 'When a study makes predictions, each one is written down with a falsifier before the first row is inserted, and scored afterwards: held, not met, or falsified. The UUID study had fourteen.',
  },
  {
    title: 'Real servers, same-server comparisons',
    text: 'Experiments run on cloud servers, not laptops. Two servers of the same type are not the same server, so ratios between the variants are taken on one server.',
  },
  {
    title: 'Runs reported per server',
    text: 'Results are reported per server, so the spread between servers stays visible instead of disappearing into an average. The UUID study had seven runs, one run per cell; the dump/restore study, three restores and nine cold runs per step.',
  },
  {
    title: 'Full data and a brief',
    text: 'In the UUID study, counters were sampled every 10 seconds: WAL position, pg_stat_io, pg_stat_wal, buffer residency, wait events. The brief gives every number with its source table, the scored predictions, the corrections, and the prior work.',
  },
  {
    title: 'Review before trust',
    text: (
      <>
        Before a ratio is published, the review step compares the servers it
        came from. In the UUID study, the first run showed int8 inserting 12%
        faster than UUIDv7; the review found that the int8 server had a faster
        disk, and on the same server the two keys insert at the same rate (
        <Link to={UUID_POST}>how we caught it</Link>). That study also had
        sixteen independent reviews, eight in a hacker role and eight in a DBRE
        role, run on different AI models and posted on the study record with
        our responses.
      </>
    ),
  },
]

const STUDIES: Study[] = [
  {
    title: 'UUIDv4 vs UUIDv7: what a random primary key costs',
    summary:
      'Same table, same insert stream, three primary keys on Postgres 18: UUIDv4, UUIDv7 and int8. Seven runs on cloud servers, about 2.1 billion UUID rows in total, fourteen hypotheses with falsifiers.',
    stats: [
      {
        value: '0.62–0.69×',
        label: 'UUIDv4 insert rate',
        note: 'vs an ordered key, same server, 100M rows',
      },
      {
        value: '1.5–1.9×',
        label: 'UUIDv4 WAL per row',
        note: 'vs an ordered key, same server, 90M–100M rows',
      },
      {
        value: '+33%',
        label: 'UUIDv4 primary key size',
        note: 'vs UUIDv7, 100M rows',
      },
    ],
    chart: {
      light: '/assets/blog/20261104-uuid-f1-inserts-per-second.svg',
      dark: '/assets/blog/20261104-uuid-f1-inserts-per-second-dark.svg',
      narrow: '/assets/blog/20261104-uuid-f1-inserts-per-second-narrow.svg',
      narrowDark: '/assets/blog/20261104-uuid-f1-inserts-per-second-narrow-dark.svg',
      alt: 'Inserts per second as the table grows from 0 to 100M rows, run 6: on the small tier int8 ends at 23.5k, UUIDv7 at 21.7k and UUIDv4 at 13.9k, with UUIDv4 falling from about 26M rows; on the mid tier UUIDv7 ends at 20.9k and UUIDv4 at 18.3k',
    },
    setup:
      'Runs took one day; the whole study, with design and reviews, about three days.',
    brief: UUID_BRIEF,
    post: UUID_POST,
    episode: UUID_EPISODE,
    episodeLabel: 'Postgres.FM episode 194',
  },
  {
    title: 'Dump/restore done. Now what?',
    summary:
      'After pg_dump and pg_restore, by default the planner statistics and the visibility map are missing. One query over a 250-million-row table with a 31 GiB heap, on a host with 16 GiB of RAM, cold cache, three restores.',
    stats: [
      {
        value: '32.6 s',
        label: 'right after pg_restore',
        note: 'Hash Join over a Seq Scan',
      },
      {
        value: '6.1 s',
        label: 'after ANALYZE',
        note: '24,983 heap fetches',
      },
      {
        value: '23 ms',
        label: 'after VACUUM ANALYZE',
        note: '0 heap fetches',
      },
    ],
    chart: {
      light: '/assets/blog/20261028-dump-restore-f1-one-query-solid.svg',
      dark: '/assets/blog/20261028-dump-restore-f1-one-query-dark.svg',
      narrow: '/assets/blog/20261028-dump-restore-f1-one-query-narrow.svg',
      narrowDark: '/assets/blog/20261028-dump-restore-f1-one-query-narrow-dark.svg',
      alt: 'On Postgres 18.6, one query takes a median 32.6 s cold after a logical restore alone, 6.1 s after ANALYZE (Index Only Scan with 24,983 heap fetches), and 23 ms after VACUUM ANALYZE (0 heap fetches)',
    },
    setup: 'Medians of 9 cold runs, Postgres 18.6; also tested on 19rc1.',
    post: DUMP_POST,
    episode: DUMP_EPISODE,
    episodeLabel: 'Postgres.FM episode 193',
  },
]

const VIDEOS = [
  {
    id: 'gf8e3JkQ_8M',
    title: 'Postgres.FM episode 194: UUIDv4 vs UUIDv7',
    link: UUID_EPISODE,
  },
  {
    id: '0R1BJBzLCoc',
    title: 'Postgres.FM episode 193: Dump/restore done. Now what?',
    link: DUMP_EPISODE,
  },
]

const PAST = [
  {
    group: 'Locks and contention',
    items: [
      { title: 'Subtransactions: the cliff past 64 per backend', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/20' },
      { title: 'Subtransactions on replicas during a long transaction', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/21' },
      { title: 'Subtransactions: testing the SLRU patches', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/22' },
      { title: 'LWLock:LockManager with many tables and indexes in one query', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/41' },
      { title: 'LWLock contention in Postgres 18', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/69' },
      { title: 'The global lock taken by NOTIFY at commit', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/67' },
    ],
  },
  {
    group: 'Limits that arrive without warning',
    items: [
      { title: 'MultiXact member space exhaustion, reproduced', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/70' },
      { title: 'TOAST OID exhaustion', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/71' },
      { title: 'What too high max_connections does to a healthy database', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/64' },
    ],
  },
  {
    group: 'The cost of a setting or an extension',
    items: [
      { title: 'pg_stat_statements.track_planning', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/43' },
      { title: 'pg_stat_statements on Intel vs AMD', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/52' },
      { title: 'pg_wait_sampling', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/18' },
      { title: 'data_checksums', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/44' },
      { title: 'wal_compression', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/15' },
      { title: 'track_activity_query_size, 1 kB to 16 kB', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/78' },
    ],
  },
  {
    group: 'Architecture choices',
    items: [
      { title: 'Connection poolers vs bare Postgres: PgBouncer, PgDog, SPQR, Citus, Multigres', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/73' },
      { title: 'Queues in Postgres: PgQue, PgQ, PGMQ, River, Que, pg-boss', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/77' },
      { title: 'NOT EXISTS vs EXISTS with partial indexes, 50M rows', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/74' },
      { title: 'max_wal_size and checkpoint tuning', href: 'https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/31' },
    ],
  },
]

// Phones get the narrow drawing, as in the blog's BlogFigure.
const NARROW = '(max-width: 600px)'

const ChartPicture = ({ src, narrow, alt, className }: { src: string; narrow?: string; alt: string; className?: string }) => (
  <picture className={className}>
    {narrow && <source media={NARROW} srcSet={narrow} />}
    <img src={src} alt={alt} loading="lazy" decoding="async" />
  </picture>
)

const ChartImage = ({ chart }: { chart: Chart }) => {
  if (!chart.dark) {
    return <ChartPicture src={chart.light} narrow={chart.narrow} alt={chart.alt} />
  }
  return (
    <>
      <ChartPicture className={styles.chartLight} src={chart.light} narrow={chart.narrow} alt={chart.alt} />
      <ChartPicture className={styles.chartDark} src={chart.dark} narrow={chart.narrowDark} alt={chart.alt} />
    </>
  )
}

const DBLabForge = () => {
  return (
    <Layout
      title="DBLab Forge: Postgres experiments you can check"
      description="DBLab Forge runs controlled Postgres experiments on real cloud servers: same-server comparisons, predictions with falsifiers written before the first row, full data, and a brief. Closed beta, available to PostgresAI customers."
    >
      <main className={styles.page} data-hide-announcement>
        <section className={styles.hero}>
          <h1 className={styles.title}>DBLab Forge</h1>
          <p className={styles.tagline}>Postgres experiments you can check</p>
          <p className={styles.lead}>
            DBLab Forge runs controlled Postgres experiments on real cloud
            servers: same-server comparisons, predictions with falsifiers
            written before the first row when a study makes them, the full
            data, and a brief with every number traced to its source.
          </p>
          <p className={styles.lead}>
            For teams with a Postgres decision that is expensive to get wrong:
            UUIDv4 or UUIDv7 before a table reaches billions of rows, which
            connection pooler before a traffic jump, what to run after
            pg_restore before switching traffic.
          </p>
          <p className={styles.availability}>
            Closed beta, available to PostgresAI customers. The UUID study
            took about three days, one of them running experiments.{' '}
            <a href={UUID_BRIEF} target="_blank" rel="noopener noreferrer">
              Its brief is public
            </a>
            .
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href={CONTACT_URL}>
              Talk to us
            </a>
            <a className={styles.secondaryButton} href="#examples">
              See example studies
            </a>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What a Forge study looks like</h2>
          <p className={styles.sectionLead}>
            A question about Postgres behavior becomes a study with a written
            design. Opinions and quick benchmarks are where it starts, not
            where it ends.
          </p>
          <ol className={styles.method}>
            {METHOD.map((step) => (
              <li key={step.title} className={styles.methodItem}>
                <h3 className={styles.methodTitle}>{step.title}</h3>
                <p className={styles.methodText}>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="examples" className={styles.section}>
          <h2 className={styles.sectionTitle}>Example studies</h2>
          <p className={styles.sectionLead}>
            Two recent posts on the PostgresAI blog are based on Forge studies.
            Each was discussed on Postgres.FM.
          </p>
          {STUDIES.map((study) => (
            <article key={study.title} className={styles.study}>
              <h3 className={styles.studyTitle}>
                <Link to={study.post}>{study.title}</Link>
              </h3>
              <p className={styles.studySummary}>{study.summary}</p>
              <div className={styles.stats}>
                {study.stats.map((stat) => (
                  <div key={stat.label} className={styles.stat}>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                    <div className={styles.statNote}>{stat.note}</div>
                  </div>
                ))}
              </div>
              <Link
                to={study.post}
                className={styles.chart}
                aria-label={`${study.title}: open the post`}
              >
                <ChartImage chart={study.chart} />
              </Link>
              <p className={styles.studySetup}>{study.setup}</p>
              <p className={styles.studyLinks}>
                <Link to={study.post}>Read the post</Link>
                {study.brief && (
                  <>
                    <span aria-hidden="true"> · </span>
                    <a href={study.brief} target="_blank" rel="noopener noreferrer">
                      Open the brief
                    </a>
                  </>
                )}
                <span aria-hidden="true"> · </span>
                <a href={study.episode} target="_blank" rel="noopener noreferrer">
                  {study.episodeLabel}
                </a>
              </p>
            </article>
          ))}

        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Watch the discussions</h2>
          <p className={styles.sectionLead}>
            Kirk Wolak and Nikolay Samokhvalov discuss both studies on
            Postgres.FM.
          </p>
          <div className={styles.videos}>
            {VIDEOS.map((video) => (
              <figure key={video.id} className={styles.video}>
                <iframe
                  className={styles.videoFrame}
                  src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
                <figcaption className={styles.videoCaption}>
                  <a href={video.link} target="_blank" rel="noopener noreferrer">
                    {video.title}
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Questions we have answered before</h2>
          <p className={styles.sectionLead}>
            Forge is the third generation of the experiment harness PostgresAI
            has built since 2018. The first two generations ran experiments in
            our <Link to="/consulting">consulting</Link> work, many of them
            public in{' '}
            <a href="https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks">
              tests-and-benchmarks
            </a>
            . The two studies above ran on Forge; the questions below come
            from the earlier generations. A few:
          </p>
          <div className={styles.pastGrid}>
            {PAST.map((g) => (
              <div key={g.group}>
                <h3 className={styles.pastGroup}>{g.group}</h3>
                <ul className={styles.questions}>
                  {g.items.map((i) => (
                    <li key={i.href} className={styles.question}>
                      <a href={i.href}>{i.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className={styles.caveat}>
            Every study reports its limits. Your tables, row sizes, load and
            hardware shift the ratios, so the answer to your question comes
            from an experiment designed for your case.
          </p>
        </section>

        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Closed beta for PostgresAI customers</h2>
          <p className={styles.ctaText}>
            Tell us the question you need answered, and we will say whether a
            Forge study fits it.
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href={CONTACT_URL}>
              Talk to us
            </a>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default DBLabForge
