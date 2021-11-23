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
        <h6 className={styles.title}>Database Lab by Postgres.ai</h6>
        <p className={styles.desc}>
          An open-source experimentation platform for PostgreSQL databases. Instantly create full-size clones of your production database and use them to test your database migrations, optimize SQL, or deploy full-size staging apps.
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
