import React from 'react'
import Layout from '@theme/Layout'
import Table from '@site/src/pages/pricing/table'

import styles from './styles.module.css'

const Pricing = () => {
  return (
    <Layout>
      <main className={`${styles.mainContainer} text-center`}>
        <section className={styles.titleSection}>
          <h1>Flexible pricing to meet your needs</h1>
        </section>

        <section className="container position-relative">
          <div className={`${styles.flexGap} row justify-content-between`}>
            <div className={`${styles.package} ${styles.flex2}`}>
              <div className={`${styles.rowWrapper} row`}>
                <div
                  className={`${styles.justifyCenter} ${styles.subscription} ${styles.standardPlan} col-sm`}
                >
                  <h2>Standard</h2>
                  <div className={styles.contentWrapper}>
                    <div>
                      <p className={styles.purchase}>Purchase on</p>
                      <a
                        className={styles.marketplace}
                        href="https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec"
                        target="_blank"
                      >
                        <img src="https://d1.awsstatic.com/Marketplace/Campaigns%20Only/BigData%20Main%20LP/AWSMP_logo_RGB_REV.369d58099de9bd4b56a099cf2c2e663891ccc88b.png" />
                      </a>
                      <p>
                        Not an AWS user?{' '}
                        <a href="mailto: sales@postgres.ai">Contact us</a>
                      </p>
                    </div>
                    <ul className={styles.list}>
                      <li>Netdata monitoring</li>
                      <li>Unlimited thin cloning</li>
                      <li>Simple setup (takes a few minutes)</li>
                      <li>Automated data refresh on schedule</li>
                      <li>Single user / API key</li>
                      <li>Maximum database size 2000 GiB</li>
                      <li>
                        Help with Postgres customization (extensions, locales,
                        etc.)
                      </li>
                      <li>
                        Vendor support; max. response time: 3 business days
                      </li>
                    </ul>
                    <div className={styles.pricing}>
                      <p>
                        Starting at <b>$131 per month</b>
                      </p>
                      <a href="#aws-pricing-details">Explore pricing</a>
                    </div>
                    <a
                      className="btn btn1"
                      target="blank"
                      href="https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec"
                    >
                      Set up in 3 minutes
                    </a>
                  </div>
                </div>

                {/* Support */}
                <div
                  className={`${styles.justifyCenter} ${styles.support} col-sm`}
                >
                  <h2>"Booster" add-on</h2>
                  <ul className={`${styles.list}`}>
                    <li>
                      One-time package delivering Enterprise-level support
                    </li>
                    <li>Unlimited Slack communications</li>
                    <li>1 hour live training (Zoom)</li>
                    <li>Custom-built docker images upon request</li>
                    <li>Max. response time: 1 business day</li>
                  </ul>
                  <div className={styles.pricing}>
                    <p>
                      <b>$4,500 for 3 months</b>
                    </p>
                  </div>{' '}
                  <a className="btn btn3" href="mailto: sales@postgres.ai">
                    Contact us
                  </a>
                </div>
              </div>
            </div>

            <div
              className={`${styles.package} ${styles.enterprise} flex-sm-fill`}
            >
              <div className={`${styles.rowWrapper} row`}>
                {/* Subscription */}
                <div
                  className={`${styles.justifyCenter} ${styles.subscription} col-sm`}
                >
                  <h2>Enterprise</h2>
                  <div className={styles.empty} />
                  <ul className={styles.list}>
                    <li>Multi-user SSO</li>
                    <li>Unlimited database size</li>
                    <li>Advanced access control</li>
                    <li>Automated database testing in CI/CD pipelines</li>
                    <li>SQL optimization tooling and workflow</li>
                    <li>Unlimited Slack or Zoom support</li>
                    <li>Quarterly training & best practice review</li>
                    <li>Live debugging & troubleshooting</li>
                    <li>Max. response time: 1 business day</li>
                  </ul>
                  <div className={styles.empty} />
                  <div className={styles.pricing}>
                    <p>
                      <b>Custom Pricing</b> Available as an annual contract <br /> (starts from $0.2662 / 100 GiB / h)
                    </p>
                  </div>
                  <a className="btn btn3" href="mailto: sales@postgres.ai">
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="container position-relative">
          <Table />
        </section>
      </main>
    </Layout>
  )
}

export default Pricing
