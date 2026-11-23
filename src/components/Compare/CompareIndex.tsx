import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import Heading from '@theme/Heading'

import { Cta, formatDate, TryIt, VerdictMark } from './parts'
import styles from './styles.module.css'
import type { IndexView } from './types'

type Props = { view: IndexView }

const TITLE = 'PostgresAI and DBLab compared with other Postgres tools'

const STATUS_LABEL = { discontinued: 'Discontinued', acquired: 'Acquired' } as const

// "A", "A and B", "A, B and C".
const listOf = (items: string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

export default function CompareIndex({ view }: Props): JSX.Element {
  const description =
    `${view.total} side-by-side comparisons of PostgresAI and DBLab with Postgres monitoring, AI tuning, ` +
    'database branching and schema change tools. Every row cites the other vendor\'s documentation.'

  return (
    <Layout title={TITLE} description={description}>
      <main className={styles.page}>
        <div className={`${styles.hero} ${view.tryIt ? styles.heroSplit : ''}`}>
          <div className={styles.heroMain}>
            <h1>PostgresAI and DBLab, compared</h1>
            <p className={styles.angle}>every claim linked to documentation, ours and theirs</p>
            <p className={styles.lead}>
              {view.total} comparisons with other tools for PostgreSQL, one page each. Every page pairs what our
              documentation says with what the other vendor's documentation says, and says when the other product is
              the better choice.
            </p>
            {view.cta && <Cta items={view.cta} />}
            <p className={styles.meta}>
              Checked on <time dateTime={view.checkedOn}>{formatDate(view.checkedOn)}</time>. PostgreSQL only.
            </p>
          </div>
          {view.tryIt && <TryIt tryIt={view.tryIt} />}
        </div>

        <nav className={styles.kinds} aria-label="Kinds of comparison">
          {view.kinds.map((k) => (
            <a key={k.key} href={`#${k.key}`} className={styles.kind}>
              <span className={styles.kindCount}>{k.count}</span>
              <span className={styles.cardName}>{k.label}</span>
            </a>
          ))}
        </nav>

        {view.kinds.map((kind) => (
          <section key={kind.key} aria-labelledby={kind.key}>
            <Heading as="h2" id={kind.key}>{kind.label}</Heading>
            <p>{kind.intro}</p>

            {kind.groups.map((group) => (
              <div key={group.key}>
                <h3 className={styles.groupLabel}>{group.label}</h3>
                <ul className={styles.cards}>
                  {group.pages.map((p) => (
                    <li key={p.path}>
                      <Link to={p.path} className={styles.card} title={p.description}>
                        <span className={styles.cardName}>
                          {p.name}
                          {p.status !== 'active' && <span className={styles.badge}>{STATUS_LABEL[p.status]}</span>}
                        </span>
                        <span className={styles.cardNote}>{p.angle || p.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {kind.matrix.rows.length > 0 && (
              <>
                <Heading as="h3" id={`${kind.key}-matrix`} className={styles.groupLabel}>
                  At a glance
                </Heading>
                <p className={styles.tallyNote}>
                  {kind.matrix.matchAll.length === 0 ? 'None' : kind.matrix.matchAll.length} of the{' '}
                  {kind.matrix.rows.length} products {kind.matrix.matchAll.length > 1 ? 'answer' : 'answers'} Yes in
                  all {kind.matrix.ourYes} columns where {kind.product} does.{' '}
                  {kind.matrix.rarest.length > 0 &&
                    `Fewest answer Yes on ${listOf(
                      kind.matrix.rarest.map((c) => `${c.label} (${c.yes} of ${kind.matrix.rows.length})`)
                    )}.`}
                </p>
                <div className={styles.scroll}>
                  <table className={`${styles.table} ${styles.matrix}`}>
                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                        {kind.matrix.columns.map((c) => (
                          <th scope="col" key={c.key}>
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={styles.ours}>
                        <th scope="row">
                          <Link to={kind.productUrl}>{kind.product}</Link>
                        </th>
                        {kind.matrix.us.map((v, i) => (
                          <td key={kind.matrix.columns[i].key}>
                            <VerdictMark v={v} text={view.verdictShort} full={view.verdictText} />
                          </td>
                        ))}
                      </tr>
                      {kind.matrix.rows.map((row) => (
                        <tr key={row.path}>
                          <th scope="row">
                            <Link to={row.path}>{row.name}</Link>
                          </th>
                          {row.cells.map((v, i) => (
                            <td key={kind.matrix.columns[i].key}>
                              <VerdictMark v={v} text={view.verdictShort} full={view.verdictText} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className={styles.tally}>
                        <th scope="row">Products that answer Yes</th>
                        {kind.matrix.tally.map((n, i) => (
                          <td key={kind.matrix.columns[i].key}>
                            {n} of {kind.matrix.rows.length}
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className={styles.note}>
                  n/d: not documented in the sources we reviewed. n/a: does not apply. Each cell is the short form of
                  a sourced row on that product's page; open the page for the detail and the source. We chose the
                  columns, so they favor {kind.product}: each page also lists what the other product does that{' '}
                  {kind.product} does not.
                </p>
              </>
            )}
          </section>
        ))}

        <section aria-labelledby="limits">
          <Heading as="h2" id="limits">What PostgresAI and DBLab do not do</Heading>
          <p>A comparison is only useful if it states our limits too. These are the ones in our own documentation:</p>
          <ul className={styles.fair}>
            {view.limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="method">
          <Heading as="h2" id="method">How we compare</Heading>
          <p>{view.method}</p>
          <p>
            Found a mistake? <Link to="/contact">Tell us</Link> and we will correct the page.
          </p>
        </section>
      </main>
    </Layout>
  )
}
