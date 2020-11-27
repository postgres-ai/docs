/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Layout from '@theme/Layout';

import clsx from 'clsx';
import styles from './styles.module.css';
import resources from '../../data/resources';

const TITLE = 'Resources';

function Showcase() {
  return (
    <Layout title={TITLE}>
      <main className="container margin-vert--lg">
        <div className="text--center margin-bottom--m">
          <h1>{TITLE}</h1>
        </div>
        <div className="row">
          {resources.map((resource) => (
            <div key={resource.title} className="col col--4 margin-bottom--lg">
                <div className={clsx('card', styles.showcaseresource)}>
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
                  {(resource.link) && (
                    <div className="card__footer">
                      <div className="button-group button-group--block">
                        {resource.link && (
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
