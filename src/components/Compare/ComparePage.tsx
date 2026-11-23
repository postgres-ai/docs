import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import Heading from '@theme/Heading'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import JsonLd from '@site/src/components/JsonLd'

import { Cta, formatDate, OurRefs, Refs, TryIt, VerdictMark } from './parts'
import styles from './styles.module.css'
import type { PageView } from './types'

type Props = { view: PageView }

export default function ComparePage({ view }: Props): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  const siteUrl = siteConfig.url.replace(/\/+$/, '')
  const { competitor: c, product } = view
  const sourceId = (n: number) => `source-${n}`
  const gone = c.status === 'discontinued'

  // The same two sections read differently when the other product is a
  // complement, or is no longer sold.
  const proofsTitle = view.complement
    ? `What ${product} adds to ${c.name}`
    : gone
      ? `What ${product} offers in its place`
      : `Where ${product} is ahead of ${c.name}`
  const fairTitle = view.complement
    ? `What ${c.name} does that ${product} does not`
    : gone
      ? `What ${c.name} was chosen for`
      : `When ${c.name} is the better choice`

  return (
    <Layout title={view.title} description={view.description}>
      <JsonLd
        data={{
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Compare', item: siteUrl + view.indexPath },
                { '@type': 'ListItem', position: 2, name: view.title, item: siteUrl + view.path },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: view.faq.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          ],
        }}
      />
      <main className={styles.page}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link to={view.indexPath}>Compare</Link>
          <span aria-hidden="true"> / </span>
          <span>{view.groupLabel}</span>
        </nav>

        <div className={`${styles.hero} ${view.tryIt ? styles.heroSplit : ''}`}>
          <div className={styles.heroMain}>
            <h1>
              {product} <span className={styles.vs}>vs</span> {c.name}
            </h1>
            {view.angle && <p className={styles.angle}>{view.angle}</p>}
            <p className={styles.lead}>{view.description}</p>
            <Cta items={view.cta} />
            <p className={styles.meta}>
              Checked on <time dateTime={view.checkedOn}>{formatDate(view.checkedOn)}</time> against{' '}
              <a href="#sources">
                {view.sources.length} pages of {c.name} documentation
              </a>
              . PostgreSQL only. <a href={view.markdownPath}>Markdown</a>
            </p>
            {view.disclosure && <p className={styles.meta}>Disclosure: {view.disclosure}</p>}
            {c.status !== 'active' && (
              <p className={styles.status}>
                <strong>Status of {c.name}:</strong> {c.statusNote}
                <Refs nums={c.statusSources} id={sourceId} />
              </p>
            )}
          </div>
          {view.tryIt && <TryIt tryIt={view.tryIt} />}
        </div>

        <section aria-labelledby="proof">
          <Heading as="h2" id="proof">{proofsTitle}</Heading>
          <p className={styles.sectionNote}>
            Each point pairs what our documentation says with what the {c.name} documentation says. Follow the
            links and check.
          </p>
          <ol className={styles.proofs}>
            {view.proofs.map((p) => (
              <li key={p.key} className={styles.proof}>
                <h3>{p.title}</h3>
                <div className={styles.proofUs}>
                  <span className={styles.who}>{product}</span>
                  <p>
                    {p.us}
                    <OurRefs sources={p.usSources} />
                  </p>
                </div>
                <div className={styles.proofThem}>
                  <span className={styles.who}>{c.name}</span>
                  <p>
                    {p.them}
                    <Refs nums={p.sources} id={sourceId} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="short-answer" className={styles.answer}>
          <div>
            <Heading as="h2" id="short-answer">Short answer</Heading>
            <p>{view.summary}</p>
          </div>
          <div>
            <Heading as="h3" id="fair">{fairTitle}</Heading>
            <ul className={styles.fair}>
              {view.chooseThem.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>

        {view.figure && (
          <section aria-labelledby="see-it" className={styles.seeIt}>
            <figure className={styles.figure}>
              <a href={view.figure.src} aria-label="Open the screenshot at full size">
                <img
                  src={view.figure.src}
                  width={view.figure.width}
                  height={view.figure.height}
                  alt={view.figure.alt}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </figure>
            <div>
              <Heading as="h2" id="see-it">What you get</Heading>
              <p>
                {view.figure.caption}{' '}
                {view.figure.href && <Link to={view.figure.href}>How it works</Link>}
              </p>
              <Cta items={view.cta} />
            </div>
          </section>
        )}

        <section aria-labelledby="side-by-side">
          <Heading as="h2" id="side-by-side">
            {product} and {c.name}, side by side
          </Heading>
          <div className={styles.scroll}>
            <table className={`${styles.table} ${styles.stack} ${styles.sides}`}>
              <thead>
                <tr>
                  <th scope="col" className={styles.question}>
                    Question
                  </th>
                  <th scope="col" className={styles.oursCol}>
                    {product}
                  </th>
                  <th scope="col">{c.name}</th>
                </tr>
              </thead>
              <tbody>
                {view.rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row" className={styles.question}>
                      {row.label}
                    </th>
                    <td data-label={product} className={styles.oursCol}>
                      <VerdictMark v={row.usV} text={view.verdictText} about={row.verdictAbout} />
                      {row.us}
                      <OurRefs sources={row.usSources} />
                    </td>
                    <td data-label={c.name}>
                      <VerdictMark v={row.v} text={view.verdictText} about={row.verdictAbout} />
                      {row.them}
                      <Refs nums={row.sources} id={sourceId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="pricing">
          <Heading as="h2" id="pricing">Pricing</Heading>
          <div className={styles.scroll}>
            <table className={`${styles.table} ${styles.prices}`}>
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Plan</th>
                  <th scope="col">List price</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {view.pricing.us.map((p) => (
                  <tr key={`us-${p.plan}`} className={styles.oursRow}>
                    <td>{product}</td>
                    <td>{p.plan}</td>
                    <td className={styles.price}>{p.price}</td>
                    <td>{p.notes}</td>
                  </tr>
                ))}
                {view.pricing.them.map((p) => (
                  <tr key={`them-${p.plan}`}>
                    <td>{c.name}</td>
                    <td>{p.plan}</td>
                    <td className={styles.price}>{p.price}</td>
                    <td>
                      {p.notes}
                      <Refs nums={p.sources} id={sourceId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>
            List prices on {formatDate(view.checkedOn)}. The billing units differ, so this is not a total-cost
            comparison. {view.pricing.note} <Link to={view.pricing.usUrl}>{product} pricing</Link>
          </p>
        </section>

        {view.together && (
          <section aria-labelledby="together">
            <Heading as="h2" id="together">
              Using {product} with {c.name}
            </Heading>
            <p>{view.together}</p>
          </section>
        )}

        <section aria-labelledby="questions">
          <Heading as="h2" id="questions">Questions</Heading>
          <dl className={styles.faq}>
            {view.faq.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>
                  {f.a}
                  <Refs nums={f.sources} id={sourceId} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="next" className={styles.closing}>
          <Heading as="h2" id="next">
            {view.tryIt ? view.tryIt.title : `See ${product} for yourself`}
          </Heading>
          {view.tryIt && <p>{view.tryIt.text}</p>}
          <Cta items={view.cta} />
        </section>

        <section aria-labelledby="sources">
          <Heading as="h2" id="sources">Sources</Heading>
          <ol className={styles.sources}>
            {view.sources.map((s, i) => (
              <li key={s.url} id={sourceId(i + 1)}>
                <a href={s.url} rel="noopener noreferrer nofollow">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
          <p className={styles.note}>
            {view.method} Found a mistake? <Link to="/contact">Tell us</Link> and we will correct the page.
          </p>
        </section>

        {view.related.length > 0 && (
          <section aria-labelledby="related">
            <Heading as="h2" id="related">More comparisons</Heading>
            <ul className={styles.cards}>
              {view.related.map((r) => (
                <li key={r.path}>
                  <Link to={r.path} className={styles.card}>
                    <span className={styles.cardName}>{r.name}</span>
                    <span className={styles.cardNote}>{r.angle || r.description}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link to={view.indexPath} className={`${styles.card} ${styles.cardAll}`}>
                  <span className={styles.cardName}>All comparisons</span>
                </Link>
              </li>
            </ul>
          </section>
        )}
      </main>
    </Layout>
  )
}
