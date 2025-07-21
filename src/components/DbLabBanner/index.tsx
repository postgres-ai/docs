import React from 'react'

import { StyledLink } from './StyledLink'

import styles from './styles.module.css'

export const DbLabBanner = () => {
  return (
    <div className={styles.root}>
      <img
        src="/assets/db-lab-logo.svg"
        alt="Database Lab"
        className={styles.img}
        width="224px"
        height="170px"
      />
      <div className={styles.content}>
        <h6 className={styles.title}>DBLab Engine 4.0</h6>
        <p className={styles.desc}>
          Instant database branching with O(1) economics.
        </p>
        <nav className={styles.links}>
          <StyledLink href="/blog/20250721-dblab-engine-4-0-released" className={styles.link}>
            Read detailed blog post
          </StyledLink>
          <StyledLink href="/docs" className={styles.link}>
            Read documentation
          </StyledLink>
        </nav>
      </div>
    </div>
  )
}
