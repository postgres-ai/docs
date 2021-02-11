import React from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './styles.module.css';
import blog from '../data/blog';

function IndexPage() {
  const {siteConfig} = useDocusaurusContext();
  const {customFields} = siteConfig;
  const {signInUrl} = customFields;

  return (
    <Layout>
      <section className="banner position-relative text-center">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-md-2"></div>
            <div className="col-md-8">
              <h1>DEPLOY WITH CONFIDENCE</h1>
              <p>
                Been stung by a poorly tested database migration?<br />
                We won't let it happen again.
              </p>
              <a className="btn btn1" href={signInUrl}>Sign up</a>
              <a className="btn btn2" href='https://postgres.ai/docs/'>Learn more</a>
            </div>
            <div className="col-md-2"></div>
          </div>
        </div>
      </section>

      <section className="companies position-relative">
        <div className="container text-center">
          <div className="row">
            <div className="col-md-2 col-6"><a><img src="/assets/landing/gitlab.svg" alt="GitLab" className="img-fluid" /></a></div>
            <div className="col-md-2 col-6"><a><img src="/assets/landing/chewy.svg" alt="Chewy.com" className="img-fluid" /></a></div>
            <div className="col-md-2 col-6"><a><img src="/assets/landing/miro.svg" alt="Miro" className="img-fluid" /></a></div>
            <div className="col-md-2 col-6"><a><img src="/assets/landing/ongres.svg" alt="OnGres" className="img-fluid" /></a></div>
            <div className="col-md-2 col-6"><a><img src="/assets/landing/qiwi.svg" alt="Qiwi" className="img-fluid" /></a></div>
            <div className="col-md-2 col-6"><a><img src="/assets/landing/nutanix.svg" alt="Nutanix" className="img-fluid" /></a></div>
          </div>
        </div>
      </section>

      <section className="six-sec position-relative">
        <div className="container text-center">
          <div className="row">
            <div className="col-sm-6">
              <img src="/assets/landing/feature5.svg" alt="Eliminate downtime caused by poorly tested database changes" />
              <h2>Eliminate downtime caused by<br />poorly tested database changes</h2>
            </div>
            <div className="col-sm-6">
              <img src="/assets/landing/feature2.svg" alt="Test on instantly provisioned full-size database clones" />
              <h2>Test on instantly provisioned,<br />full-size database clones</h2>
            </div>
          </div>
          <div className="row single">
            <div className="col-sm-6">
              <img src="/assets/landing/feature1.svg" alt="Easily access fresh data for development and testing" />
              <h2>Easily access fresh data<br />for development and testing</h2>
            </div>
            <div className="col-sm-6">
              <img src="/assets/landing/feature3.svg" alt="Protect personal and sensitive data, comply with GDPR and CCPA" />
              <h2>Protect personal and sensitive data,<br />comply with GDPR and CCPA</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12"><a href="https://postgres.ai/console/" className="btn btn1">Try Database Lab</a></div>
          </div>
        </div>
      </section>

      <section className="multi-sec position-relative">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h3 className="text-center">What if a multi-terabyte database<br />could be cloned in seconds?</h3>
            </div>
          </div>

          <div className="row user-case2-ml">
            <div className="col-md-1"></div>
            <div className="col-md-4">
              <img src="/assets/landing/use-case2.svg" alt="Use-Case2" className="img-fluid rhs" />
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-6">
              <h4 className="h-m">Automatically verify<br />100% of database migrations</h4>
              <h4 className="h-d">Verify database changes in CI</h4>
              <p>
                Integrate database migration testing into your CI/CD pipeline and verify that any DDL or DML change will run correctly on production.<br />
                <br />
                Understand how your database migrations will perform <i>before</i> you deploy.<br />
                <br />
                Eliminate database-related downtime risk.<br />
                <br />
                <a className="learn-more" href="https://postgres.ai/docs/"><u>Learn more</u></a>
              </p>
            </div>
          </div>

          <div className="row user-case2-lg">
            <div className="col-md-1"></div>
            <div className="col-md-4 h-m">
              <img src="/assets/landing/use-case2.svg" alt="Use-Case2" className="img-fluid rhs" /><br />
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-6">
              <h4 className="h-m">Automatically verify<br />100% of database migrations</h4>
              <h4 className="h-d">Verify database changes in CI</h4>
              <p>
                Integrate database migration testing into your CI/CD pipeline and verify that any DDL or DML change will run correctly on production.<br />
                <br />
                Understand how your database migrations will perform <i>before</i> you deploy.<br />
                <br />
                Eliminate database-related downtime risk.<br />
                <br />
                <a className="learn-more" href="https://postgres.ai/docs/"><u>Learn more</u></a>
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 pt-4">
              <h4 className="lst h-m">Optimize SQL on<br />production database clones</h4>
              <h4 className="lst h-d">Optimize SQL on<br />production database clones</h4>
              <p>
                Optimize SQL on an instantly provisioned, independent, production clone and stop experimenting on live data.<br />
                <br />
                Test SQL using a query optimizer that behaves identically to production.<br />
                <br />
                Iterate as many times as you want to achieve the best results.<br />
                <br />
                <a className="learn-more" href="https://postgres.ai/docs/"><u>Learn more</u></a>
              </p>
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-4">
              <img src="/assets/landing/use-case3.svg" alt="Use-Case3" className="img-fluid lhs" />
            </div>
            <div className="col-md-1"></div>
          </div>

          <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-4">
              <img src="/assets/landing/use-case1.svg" alt="Use-Case1" className="img-fluid lhs" />
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-6">
              <h4 className="h-m">Run staging and test apps<br />with full data</h4>
              <h4 className="h-d">Run staging and test apps<br />with full data</h4>
              <p>
                Understand <i>exactly</i> how your application will behave on production.<br />
                <br />
                Give each developer their own full-size database without the hassle and cost.<br />
                <br />
                Simplify the setup and onboarding of new teammates.<br />
                <br />
                <a className="learn-more" href="https://postgres.ai/docs/"><u>Learn more</u></a>
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 text-center">
              <a className="btn btn1" href={signInUrl}>Try Database Lab</a>
              <a className="btn btn2" href='https://postgres.ai/docs/'>More cases</a>
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
          <div className="row">
            {blog.map((e) => (
            <div key={e.title} className="col col--4 margin-bottom--lg">
                <div className={clsx('card', styles.showcaseresource)}>
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
                  {(e.link) && (
                    <div className="card__footer">
                      <div className="button-group button-group--block">
                        {e.link && (
                          <Link
                            to={useBaseUrl(e.link)}
                            className="button button--small button--secondary button--block">
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
                Postgres.ai ❤ open-source.<br />
                <br />
                We work hard to make our products open and&nbsp;extensible.
              </p>
              <a className="btn btn2" href='https://postgres.ai/docs/'>Read the docs</a>
            </div>
            <div className="col-md-3"></div>
          </div>
          <div className="row ss">
            <div className="col-md-6 lf">
              <div className="source-boxes">
                <a href='https://gitlab.com/postgres-ai/database-lab'>
                  <h4>Database Lab Engine β <img src="/assets/landing/dblab.svg" alt="Database Lab logo" className="float-right" /></h4>
                  <p>Provision independent, multi-terabyte, PostgreSQL databases in a few seconds.</p>
                  <span className="float-left">postgres-ai/database-lab</span>
                  <div className="clearfix"></div>
                </a>
              </div>
            </div>
            <div className="col-md-6 rf">
              <div className="source-boxes">
                <a href='https://gitlab.com/postgres-ai/joe'>
                  <h4>Joe 🤖 a Virtual DBA for SQL optimization<img src="/assets/landing/joe-bot.svg" alt="Joe bot logo" className="float-right joe-bot" /></h4>
                  <p>Database Lab's Virtual DBA, Joe, helps engineers quickly troubleshoot and optimize SQL. Joe runs on top of Database Lab.</p>
                  <span className="float-left">postgres-ai/joe</span>
                  <div className="clearfix"></div>
                </a>
              </div>
            </div>
          </div>
          <div className="row ss">
            <div className="col-md-6 lf">
              <div className="source-boxes">
                <a href='https://gitlab.com/postgres-ai/postgres-checkup'>
                  <h4>postgres-checkup <img src="/assets/landing/postgres-checkup.svg" alt="postgres-checkup logo" className="float-right" /></h4>
                  <p>PostgreSQL health check and SQL performance analysis done right.</p>
                  <span className="float-left">postgres-ai/postgres-checkup</span>
                  <div className="clearfix"></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
    );
  }

  export default IndexPage;
