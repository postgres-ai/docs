import React from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import styles from './styles.module.css';
import blog from '../data/blog';

function IndexPage() {
  return (
    <Layout>
      <section className="banner position-relative text-center">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-md-2"></div>
            <div className="col-md-8">
              <h1>BOOST YOUR DEVELOPMENT PROCESS</h1>
              <p>We eliminate database-related roadblocks<br />
                on the way of developers, DBAs and QA engineers</p>
              <a className="btn btn1" href='https://postgres.ai/console/'>Sign up (private beta)</a>
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
              <img src="/assets/landing/feature1.svg" alt="Refresh faster for actual production data" />
              <h2>Deliver fresh data for development<br />and testing without hassle</h2>
            </div>
            <div className="col-sm-6">
              <img src="/assets/landing/feature2.svg" alt="Provision full-sized clones in seconds" />
              <h2>Provision full-sized<br />clones in seconds</h2>
            </div>
          </div>
          <div className="row single">
            <div className="col-sm-6">
              <img src="/assets/landing/feature3.svg" alt="Data compliance and security" />
              <h2>Protect personal and sensitive data,<br />comply with GDPR and CCPA</h2>
            </div>
            <div className="col-sm-6">
              <img src="/assets/landing/feature4.svg" alt="Improve time to market" />
              <h2>Improve time to market</h2>
            </div> 
          </div>
          <div className="row">
            <div className="col-sm-6">
              <img src="/assets/landing/feature5.svg" alt="Eliminate downtime caused by database-related changes" />
              <h2>Eliminate downtime caused by<br />database-related changes</h2>
            </div>
            <div className="col-sm-6">
              <img src="/assets/landing/feature6.svg" alt="Significantly reduce infrastructure costs by using thin clones" />
              <h2>Significantly reduce infrastructure<br />costs by using thin clones</h2>
            </div> 
          </div>
          <div className="row">
            <div className="col-sm-12"><a href="https://postgres.ai/console/" className="btn btn1">Try Database Lab Platform</a></div>
          </div>
        </div>
      </section>

      <section className="multi-sec position-relative">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h3 className="text-center">What if multi-terabyte database<br />could be cloned in seconds?</h3>
            </div>
          </div>
          <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-4">
              <img src="/assets/landing/use-case1.svg" alt="Use-Case1" className="img-fluid lhs" />
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-6">
              <h4 className="h-m">Run staging and review apps<br />with production-like databases</h4>
              <h4 className="h-d">Deploy staging and review<br />apps with full-sized data</h4>
              <p>
                Get most reliable results much faster.<br />
                <br />
                Save disk space. A lot. Local thin clones share the data blocks saving time and budgets.<br />
                <br />
                Tasks such as verification of major upgrades, partitioning, index maintenance can and must be verified in Database Lab first, to minimize risks of negative events in production.<br />
                <br />
                <a className="learn-more" href="https://postgres.ai/docs/"><u>Learn more</u></a>
              </p>
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
                Automatically verify database schema changes.<br />
                <br />
                Get valuable performance insights to make right decisions.<br />
                <br />
                Eliminate database-related downtime risks.<br />
                <br />
                <a className="learn-more" href="https://postgres.ai/docs/"><u>Learn more</u></a>
              </p>
            </div>
          </div>

          <div className="row user-case2-lg">
            <div className="col-md-4 h-d"><img src="/assets/landing/use-case2.svg" alt="Use-Case2" className="img-fluid rhs" /></div>
            <div className="col-md-6">
              <h4 className="h-m">Automatically verify<br />100% of database migrations</h4>
              <h4 className="h-d">Verify database changes in CI</h4>
              <p>
                Automatically verify database schema changes.<br />
                <br />
                Get valuable performance insights to make right decision.<br />
                <br />
                Eliminate database-related downtime risk.<br />
                <br />
                <a className="learn-more" href="https://postgres.ai/docs/"><u>Learn more</u></a>
              </p>
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-4 h-m">
              <img src="/assets/landing/use-case2.svg" alt="Use-Case2" className="img-fluid rhs" /><br />
            </div>
            <div className="col-md-1"></div> 
          </div>

          <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-4">
              <img src="/assets/landing/use-case3.svg" alt="Use-Case3" className="img-fluid lhs" />
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-6 pt-4">
              <h4 className="lst h-m">Optimize SQL on production-like clones</h4>
              <h4 className="lst h-d">Optimize SQL on production-like clones</h4>
              <p>
                Get strong understanding on how the database optimizer behaves on production database not touching it.<br />
                <br />
                Check any optimization ideas on a full-sized production-like clone provisioned in a few seconds.<br />
                <br />
                Iterate as many times as you want to achieve the best results.<br />
                <br />
                Accumulate the knowledge related to optimization, share it with your teammates, and grow confidence in how you control the database performance.<br />
                <br />
                <a className="learn-more" href="https://postgres.ai/docs/"><u>Learn more</u></a>
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 text-center">
              <a className="btn btn1" href='https://postgres.ai/console/'>Try Database Lab Platform</a>
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
                    <a
                      href={e.link}
                      target="_blank"
                      rel="noreferrer noopener">
                        <img src={e.image} alt={e.title} />
                    </a>
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
                          <a
                            className="button button--small button--secondary button--block"
                            href={e.link}
                            target="_blank"
                            rel="noreferrer noopener">
                            Read more
                          </a>
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
                  <p>Provision independent non-production environments with multi-terabyte PostgreSQL databases in a few seconds without extra costs.</p>
                  <span className="float-left">postgres-ai/database-lab</span>
                  <div className="clearfix"></div>
                </a>
              </div>
            </div>
            <div className="col-md-6 rf">
              <div className="source-boxes">
                <a href='https://gitlab.com/postgres-ai/joe'>
                  <h4>Joe 🤖 DBA-bot for SQL optimization <img src="/assets/landing/joe-bot.svg" alt="Joe bot logo" className="float-right joe-bot" /></h4>
                  <p>Joe helps backend engineers and DBAs troubleshoot and optimize SQL, moving really quickly. Joe works on top of Database Lab.</p>
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
