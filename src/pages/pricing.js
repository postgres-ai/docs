import React from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './styles.module.css';
import blog from '../data/blog';

// References:
// https://circleci.com/pricing/
// https://databricks.com/product/aws-pricing

function PricingPage() {
  const {siteConfig} = useDocusaurusContext();
  const {customFields} = siteConfig;
  const {signInUrl} = customFields;

  return (
    <Layout>
      <section className='pricing-header position-relative'>
        <h1 class='em'>Pricing that scales with you</h1>
      </section>

      <section className='pricing-table position-relative'>
        <div class='container text-center'>
          <div className="row price-row">
            <div className='col-md-2'>&nbsp;</div>
            <div className='col-md-3 price-box'>
              <h3>Community Edition</h3>
              <div class='em'>Open Source</div>
              <a class="btn btn2 cta" href="https://gitlab.com/postgres-ai/database-lab" target="_blank">
                View repo
              </a>
              <ul class='mobile-feature-list'>
                <li>Unlimited Thin Cloning</li>
              </ul>
            </div>
            <div className='col-md-3 price-box'>
              <h3>Standard</h3>
              <div class='em'>$190 per month</div>
              <div>for each 100 GiB of data<sup>1</sup></div>
              <a class="btn btn1 cta" href='https://postgres.ai/console/'>
                Start free trial
              </a>
              <ul class='mobile-feature-list'>
                <li>Unlimited Thin Cloning</li>
                <li>SQL Optimization UI</li>
                <li>Security & User Management Features</li>
                <li>Business hour support with 24 hour response time</li>
              </ul>
            </div>
            <div className='col-md-3 price-box'>
              <h3>Enterprise</h3>
              <div class='em'>Custom Pricing</div>
              <div>annual contracts</div>
              <a class="btn btn1 cta" href='mailto: sales@postgres.ai'>
                Contact us
              </a>
              <ul class='mobile-feature-list'>
                <li>Unlimited Thin Cloning</li>
                <li>SQL Optimization UI</li>
                <li>Advanced User Management & SSO</li>
                <li>24 / 7 / 365 support with 1 hour response time</li>
              </ul>
            </div>
          </div>
        </div>
        <div class='container text-center pricing-feature-table'>
          <div className="row feature-row even">
            <div className='col-md-2 feature-name'>Thin Cloning</div>
            <div className='col-md-3'>Unlimited</div>
            <div className='col-md-3'>Unlimited</div>
            <div className='col-md-3'>Unlimited</div>
          </div>
          <div className="row feature-row odd">
            <div className='col-md-2 feature-name'>SQL Optimization UI</div>
            <div className='col-md-3'><i>Not Included</i></div>
            <div className='col-md-3'>
              <ul>
                <li>Joe Bot secure web interface</li>
                <li><code>EXPLAIN ANALYZE</code> visualization</li>
              </ul>
            </div>
            <div className='col-md-3'><i>All Standard Features</i></div>
          </div>
          <div className="row feature-row even">
            <div className='col-md-2 feature-name'>Security & User Management</div>
            <div className='col-md-3'><i>Not Included</i></div>
            <div className='col-md-3'>
              <ul>
                <li>Secure User Access Tokens</li>
                <li>Basic Access Control</li>
                <li>Audit Log</li>
              </ul>
            </div>
            <div className='col-md-3'>
              <i>All Standard Features</i>+<br />
              <ul>
                <li>Advanced Access Control</li>
                <li>Enterprise SSO</li>
              </ul>
            </div>
          </div>
          <div className="row feature-row odd">
            <div className='col-md-2 feature-name'>Support SLA</div>
            <div className='col-md-3'><i>Not Included</i></div>
            <div className='col-md-3'>
              <div>Monday - Friday</div>
              <div>24 hour response time</div>
            </div>
            <div className='col-md-3'>
              <div>24 / 7 / 365</div>
              <div>1 hour response time</div>
            </div>
          </div>
        </div>
      </section>

      <section className='pricing-details position-relative'>
        <div className='container'>
          <div className='row'>
            <div className='col-md-9 offset-2'>
              <ul class='footnotes'>
                <li>
                  <sup>1</sup> Service is priced per GiB / hour at a rate of $0.0026.
                  Database Lab monitors the physical size of the database using <code>df</code>
                  on an hourly basis.
                  Standard and Enterprise packages have access to the Database Lab Web Platform.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default PricingPage;
