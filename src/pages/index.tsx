import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import { RepoCard } from '@site/src/components/RepoCard'

import blog from '../data/blog'

import styles from './index.module.css'

const AWS_DLE_URL =
  'https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec'

function IndexPage() {
  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { signInUrl } = customFields

  if (typeof signInUrl !== 'string') return null

  return (
    <Layout>
      <section className="banner position-relative text-center">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-md-2"></div>
            <div className="col-md-8">
              <h1>DEPLOY WITH CONFIDENCE</h1>
              <p>
                Been stung by a poorly tested database migration?
                <br />
                We won't let it happen again.
              </p>
              <a className="btn btn1" href={AWS_DLE_URL} target="_blank">
                Get started in 3 minutes
              </a>
              <a className="btn btn2" href="/products/how-it-works">
                How it works
              </a>
            </div>
            <div className="col-md-2"></div>
          </div>
        </div>
      </section>

      <section className="companies position-relative">
        <div className="container text-center">
          <div className="row">
            <div className="col-md-2 col-6">
              <a>
                <img
                  src="/assets/landing/gitlab.svg"
                  alt="GitLab"
                  className="img-fluid"
                />
              </a>
            </div>
            <div className="col-md-2 col-6">
              <a>
                <img
                  src="/assets/landing/chewy.svg"
                  alt="Chewy.com"
                  className="img-fluid"
                />
              </a>
            </div>
            <div className="col-md-2 col-6">
              <a>
                <img
                  src="/assets/landing/miro.svg"
                  alt="Miro"
                  className="img-fluid"
                />
              </a>
            </div>
            <div className="col-md-2 col-6">
              <a>
                <img
                  src="/assets/landing/ongres.svg"
                  alt="OnGres"
                  className="img-fluid"
                />
              </a>
            </div>
            <div className="col-md-2 col-6">
              <a>
                <img
                  src="/assets/landing/qiwi.svg"
                  alt="Qiwi"
                  className="img-fluid"
                />
              </a>
            </div>
            <div className="col-md-2 col-6">
              <a>
                <img
                  src="/assets/landing/nutanix.svg"
                  alt="Nutanix"
                  className="img-fluid"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="six-sec position-relative">
        <div className="col-sm-12">
          <h3 className="text-center">
            Instantly clone your production database and...
          </h3>
        </div>
        <div className="container text-center">
          <div className="row">
            <div className="col-sm-6">
              <img
                src="/assets/landing/feature5.svg"
                alt="Eliminate downtime caused by poorly tested database changes"
              />
              <h2>
                Eliminate downtime caused by
                <br />
                poorly tested database changes
              </h2>
            </div>
            <div className="col-sm-6">
              <img
                src="/assets/landing/feature4.svg"
                alt="Optimize SQL queries"
              />
              <h2>
                Test your SQL optimizations on a<br />
                realistic, risk-free database clone
              </h2>
            </div>
          </div>
          <div className="row single">
            <div className="col-sm-6">
              <img
                src="/assets/landing/feature1.svg"
                alt="Easily access fresh data for development and testing"
              />
              <h2>
                Easily access fresh data
                <br />
                for development and testing
              </h2>
            </div>
            <div className="col-sm-6">
              <img
                src="/assets/landing/feature3.svg"
                alt="Mask personal and sensitive data"
              />
              <h2>
                Maintain security and compliance by
                <br />
                masking sensitive data
              </h2>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <a href={AWS_DLE_URL} className="btn btn1" target="_blank">
                Get started in 3 minutes
              </a>
              <a className="btn btn2 btn2-margin" href="/products/how-it-works">
                How it works
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="multi-sec position-relative">
        <div className="container">
          <div className="row user-case2-ml">
            <div className="col-md-1"></div>
            <div className="col-md-4">
              <img
                src="/assets/landing/use-case2.svg"
                alt="Use-Case2"
                className="img-fluid rhs"
              />
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-6">
              <h4 className="h-m">
                Automatically verify
                <br />
                your database migrations
              </h4>
              <h4 className="h-d">Verify database changes in CI</h4>
              <p>
                Integrate database migration testing into your CI/CD pipeline
                and verify that any DDL or DML change will run correctly on
                production.
                <br />
                <br />
                Understand how your database migrations will perform{' '}
                <i>before</i> you deploy.
                <br />
                <br />
                Eliminate database-related downtime risk.
                <br />
                <br />
                <a
                  className="learn-more"
                  href="/products/database-migration-testing"
                >
                  <u>Learn more</u>
                </a>
              </p>
            </div>
          </div>

          <div className="row user-case2-lg">
            <div className="col-md-1"></div>
            <div className="col-md-4 h-m">
              <img
                src="/assets/landing/use-case2.svg"
                alt="Use-Case2"
                className="img-fluid rhs"
              />
              <br />
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-6">
              <h4 className="h-m">
                Automatically verify
                <br />
                your database migrations
              </h4>
              <h4 className="h-d">Verify database changes in CI</h4>
              <p>
                Integrate database migration testing into your CI/CD pipeline
                and verify that any DDL or DML change will run correctly on
                production.
                <br />
                <br />
                Understand how your database migrations will perform{' '}
                <i>before</i> you deploy.
                <br />
                <br />
                Eliminate database-related downtime risk.
                <br />
                <br />
                <a
                  className="learn-more"
                  href="/products/database-migration-testing"
                >
                  <u>Learn more</u>
                </a>
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 pt-4">
              <h4 className="lst h-m">
                Optimize SQL on
                <br />
                production database clones
              </h4>
              <h4 className="lst h-d">
                Optimize SQL on
                <br />
                production database clones
              </h4>
              <p>
                Optimize SQL on an instantly provisioned, independent,
                production clone and stop experimenting on live data.
                <br />
                <br />
                <a href="/products/joe">Joe Bot</a>, our virtual DBA, runs on
                top of Database Lab to help you find and fix bottlenecks.
                <br />
                <br />
                Iterate as many times as you want to achieve the best results.
                <br />
                <br />
                <a className="learn-more" href="/products/joe">
                  <u>Learn more</u>
                </a>
              </p>
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-4">
              <img
                src="/assets/landing/use-case3.svg"
                alt="Use-Case3"
                className="img-fluid lhs"
              />
            </div>
            <div className="col-md-1"></div>
          </div>

          <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-4">
              <img
                src="/assets/landing/use-case1.svg"
                alt="Use-Case1"
                className="img-fluid lhs"
              />
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-6">
              <h4 className="h-m">
                Run staging and test apps
                <br />
                with full data
              </h4>
              <h4 className="h-d">
                Run staging and test apps
                <br />
                with full data
              </h4>
              <p>
                Understand <i>exactly</i> how your application will behave on
                production.
                <br />
                <br />
                Give each developer their own full-size database without the
                hassle and cost.
                <br />
                <br />
                Simplify the setup and onboarding of new teammates.
                <br />
                <br />
                <a
                  className="learn-more"
                  href="/products/realistic-test-environments"
                >
                  <u>Learn more</u>
                </a>
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 text-center">
              <a className="btn btn1" href={AWS_DLE_URL} target="_blank">
                Get started in 3 minutes
              </a>
              <a className="btn btn2" href="/products/how-it-works">
                How it works
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-sec position-relative">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h3 className="text-center">The latest from our blog</h3>
            </div>
          </div>
          <div className="card__row">
            {blog.map((e) => (
              <div key={e.title} className="col col--4 margin-bottom--lg">
                <div className="card">
                  <div className="card__image">
                    <Link to={useBaseUrl(e.link)}>
                      <img src={e.image} alt={e.title} />
                    </Link>
                  </div>
                  <div className="card__body">
                    <div className="avatar">
                      <div className="avatar__intro margin-left--none">
                        <h4 className="avatar__name">{e.title}</h4>
                        <small className="avatar__subtitle">
                          {e.description}
                        </small>
                      </div>
                    </div>
                  </div>
                  {e.link && (
                    <div className="card__footer">
                      <div className="button-group button-group--block">
                        {e.link && (
                          <Link
                            to={useBaseUrl(e.link)}
                            className="button button--small button--secondary button--block"
                          >
                            Read more
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="source-sec position-relative">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3"></div>
            <div className="col-md-6">
              <h3>Open source and extensible</h3>
              <p>
                We work hard to make our products open, accessible, and
                extensible. Join the Database Lab Engine Community and help us
                build even better products.
                <br />
                <br />
                Found a bug? Have a feature idea? Want to contribute? Talk to
                us.
              </p>
            </div>
            <div className="col-md-3"></div>
          </div>

          <div className="row text-center">
            <div className="col-lg-12 community-buttons">
              <a href="https://slack.postgres.ai/">
                Our&nbsp;Community&nbsp;Slack
              </a>
              <a href="https://github.com/postgres-ai/database-lab-engine/blob/master/CONTRIBUTING.md">
                Contribute
              </a>
              <a href="/docs">Documentation</a>
            </div>
          </div>

          <div className="row text-center">
            <div className="col-md-3"></div>
            <div className="col-md-6">
              <p>
                Postgres.ai ❤ open source.
                <br />
              </p>
            </div>
          </div>

          <div className={styles.repos}>
            <RepoCard
              title="Database Lab Engine"
              logoUrl="/assets/landing/dblab.svg"
              description="Provision independent, multi-terabyte, PostgreSQL databases in a few seconds."
              repoName="postgres-ai/database-lab-engine"
              repoUrl="https://github.com/postgres-ai/database-lab-engine"
              githubButtonText="Star us"
            />
            <RepoCard
              title="Joe Bot 🤖 for SQL optimization"
              logoUrl="/assets/landing/joe-bot.svg"
              description="Database Lab's Virtual DBA, Joe, helps engineers quickly troubleshoot and optimize SQL. Joe runs on top of Database Lab."
              repoName="postgres-ai/joe"
              repoUrl="https://github.com/postgres-ai/joe"
              githubButtonText="Star us"
            />
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default IndexPage
