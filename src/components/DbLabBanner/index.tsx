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
      />
      <div className={styles.content}>
        <h6 className={styles.title}>Explore Database Lab</h6>
        <p className={styles.desc}>
          Clone large PostgreSQL databases in seconds and get superpowers when
          changing DB schema and optimizing SQL queries!
        </p>
        <nav className={styles.links}>
          <StyledLink href="/products/how-it-works" className={styles.link}>
            How it works
          </StyledLink>
          <StyledLink href="/docs" className={styles.link}>
            Read documentation
          </StyledLink>
        </nav>
      </div>
    </div>
  )
}
