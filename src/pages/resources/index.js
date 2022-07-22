import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';

import resources from '../../data/resources';

const TITLE = 'Resources';

function Showcase() {
  return (
    <Layout title={TITLE}>
      <main className="container margin-vert--lg">
        <div className="text--center margin-bottom--m">
          <h1>{TITLE}</h1>
        </div>
        <div className="card__row">
          {resources.map((resource) => (
            <div key={resource.title} className="col col--4 margin-bottom--lg">
                <div className={clsx('card', 'showcaseUser', 'resources')}>
                  <div className="card__image">
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noreferrer noopener">
                        <img src={resource.preview} alt={resource.title} />
                    </a>
                  </div>
                  <div className="card__body">
                    <div className="avatar">
                      <div className="avatar__intro margin-left--none">
                        <h4 className="avatar__name">{resource.title}</h4>
                        <small className="avatar__subtitle">
                          {resource.description}
                        </small>
                      </div>
                    </div>
                  </div>
                  {resource.link && (
                    <div className="card__footer">
                      <div className="button-group button-group--block">
                        {resource.internalLink && (
                          <a
                            className="button button--small button--secondary button--block"
                            href={resource.link}>
                            Read more
                          </a>
                        )}
                        {!resource.internalLink && (
                          <a
                            className="button button--small button--secondary button--block"
                            href={resource.link}
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
      </main>
    </Layout>
  );
}

export default Showcase;
