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

const TEMP_POST = '/blog/20261118-hidden-costs-of-create-temp-table'
const TEMP_BRIEF = 'https://console.postgres.ai/shared/brief/dfe99713-f5a8-483b-9aab-1606a883b75d'
const TEMP_EPISODE = 'https://postgres.fm/episodes/the-hidden-costs-of-create-temp-table'
const EXT_BRIEF = 'https://console.postgres.ai/shared/brief/c501d438-b872-4705-89a6-bdab30ea1680'
const EXT_EPISODE = 'https://postgres.fm/episodes/extensions-on-demand'

type Study = {
  // Postgres.FM episode number and air date.
  episode: number
  date: string
  episodeUrl: string
  question: string
  headline: string
  headlineNote: string
  facts: string[]
  post?: string
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

// Newest first. Every number is copied from the post or the brief it links to.
const STUDIES: Study[] = [
  {
    episode: 196,
    date: 'November 13, 2026',
    episodeUrl: TEMP_EPISODE,
    question: 'What does a temp table per transaction cost?',
    headline: '23×',
    headlineNote:
      'the TPS of a CTE doing the same work: 86,997 vs 3,783 for CREATE TEMP TABLE in each transaction. Postgres 18.6, 16 vCPU, no idle sessions.',
    facts: [
      'With 5,000 idle sessions and a 500 TPS target, temp-table DDL got 127 TPS in one run and 249 in another; 502 with no idle sessions.',
      'One create and drop sends 132 invalidation messages, and every backend must read them, idle ones too.',
    ],
    post: TEMP_POST,
    brief: TEMP_BRIEF,
  },
  {
    episode: 195,
    date: 'November 6, 2026',
    episodeUrl: EXT_EPISODE,
    question: 'Does an extension in its own image avoid the restart?',
    headline: '192–193 s',
    headlineNote:
      'without new read-write connections: CloudNativePG restart with persistent sessions, for an extension image and for a fat image alike. Medians of 5.',
    facts: [
      'With switchover instead, the longest read-write outage was 6.4 s and 6.5 s.',
      '18 PGDG extensions take 98 MiB as one image layer; the CloudNativePG pgvector image, 0.31 MiB.',
    ],
    brief: EXT_BRIEF,
  },
  {
    episode: 194,
    date: 'October 30, 2026',
    episodeUrl: UUID_EPISODE,
    question: 'What does a random UUIDv4 primary key cost?',
    headline: '0.62–0.69×',
    headlineNote:
      'the UUIDv4 insert rate vs an ordered key on the same server, at 100M rows. Postgres 18, seven runs.',
    facts: [
      'UUIDv4 wrote 1.5–1.9× the WAL per row of an ordered key, at 90M–100M rows.',
      'The UUIDv4 primary key was 33% larger than UUIDv7, at 100M rows.',
    ],
    post: UUID_POST,
    brief: UUID_BRIEF,
  },
  {
    episode: 193,
    date: 'October 23, 2026',
    episodeUrl: DUMP_EPISODE,
    question: 'Dump/restore done: what to run before traffic?',
    headline: '32.6 s → 23 ms',
    headlineNote:
      'one query, cold cache: right after pg_restore, then after VACUUM ANALYZE. 250M rows, 31 GiB heap, 16 GiB RAM, Postgres 18.6.',
    facts: [
      'After ANALYZE alone: 6.1 s, an Index Only Scan with 24,983 heap fetches.',
      'Medians of 9 cold runs; also tested on 19rc1.',
    ],
    post: DUMP_POST,
  },
]

const VIDEOS = [
  {
    id: 'gAdhpYewLZ8',
    title: 'Postgres.FM episode 196: The hidden costs of CREATE TEMP TABLE',
    link: TEMP_EPISODE,
  },
  {
    id: '7oeAAqU00zk',
    title: 'Postgres.FM episode 195: Extensions on demand',
    link: EXT_EPISODE,
  },
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
            The four Forge studies published so far, newest first. Each was
            discussed on Postgres.FM; every number comes from the post or the
            public brief linked below it.
          </p>
          <ol className={styles.studies}>
            {STUDIES.map((study) => (
              <li key={study.episode} className={styles.study}>
                <p className={styles.studyMeta}>
                  Postgres.FM {study.episode} · {study.date}
                </p>
                <h3 className={styles.studyTitle}>{study.question}</h3>
                <p className={styles.headline}>{study.headline}</p>
                <p className={styles.headlineNote}>{study.headlineNote}</p>
                <ul className={styles.facts}>
                  {study.facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
                <p className={styles.studyLinks}>
                  {study.post && (
                    <>
                      <Link to={study.post}>Read the post</Link>
                      <span aria-hidden="true"> · </span>
                    </>
                  )}
                  {study.brief && (
                    <>
                      <a href={study.brief} target="_blank" rel="noopener noreferrer">
                        Brief
                      </a>
                      <span aria-hidden="true"> · </span>
                    </>
                  )}
                  <a href={study.episodeUrl} target="_blank" rel="noopener noreferrer">
                    Episode {study.episode}
                  </a>
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Watch the discussions</h2>
          <p className={styles.sectionLead}>
            Kirk Wolak and Nikolay Samokhvalov discuss each study on
            Postgres.FM; in episode 195, with Álvaro Hernández of StackGres.
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
            . The four studies above ran on Forge; the questions below come
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
