import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';

import careers from '../../data/careers';

const TITLE = 'Careers';

function Careers() {
  return (
    <Layout title={TITLE}>
      <main className="container margin-vert--lg">
        <div className="text--center margin-bottom--m">
          <h1>{TITLE}</h1>
        </div>
        <div className="card__row">
          {careers.map((job) => (
            <div key={job.title} className="col col--4 margin-bottom--lg">
                <div className={clsx('card', 'showcaseUser', 'careers')}>
                  <div className="card__body">
                    <div className="avatar">
                      <div className="avatar__intro margin-left--none">
                        <h4 className="avatar__name">{job.title}</h4>
                        <small className="avatar__subtitle">
                          {job.descriptions && job.descriptions.map((desc) => (
                            <span>- {desc}<br /></span>
                          ))}
                        </small>
                      </div>
                    </div>
                  </div>
                  {(job.link) && (
                    <div className="card__footer">
                      <div className="button-group button-group--block">
                        {job.link && (
                          <a
                            className="button button--small button--secondary button--block"
                            href={job.link}>
                            More details
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}

export default Careers;
