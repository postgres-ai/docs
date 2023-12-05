import React from 'react'
import Layout from '@theme/Layout'
import { TypeAnimation } from 'react-type-animation'

import SignupForm from './signupForm/signupForm'

import styles from './styles.module.css'
import botStyles from './signupForm/styles.module.css'

const textSequence = [
  'Free GPT-4 Turbo for Postgres-related topics: Free access to the latest GPT-4 Turbo technology, specially adapted for PostgreSQL-related discussions.',
  3000,
  'Rich Knowledge Base: Over 50,000+ documents including official documentation for all current Postgres versions and hand-picked expert articles.',
  1000,
  "Source Code Interaction: Directly query PostgreSQL source code for in-depth insights, a unique feature for when documentation isn't enough.",
  1000,
]

const Bot = () => (
  <>
    <div
      style={{
        display: 'none',
      }}
    >
      <Layout title="Postgres Bot" />
    </div>
    <main className={styles.main}>
      <div className={styles.formContainer}>
        <nav className={styles.navigation}>
          <div className={styles.flex}>
            <img
              src="/img/logo.svg"
              alt="Postgres Bot Logo"
              height="32px"
              width="32px"
            />
            <span>Postgres.ai</span>
          </div>
        </nav>
        <SignupForm />
      </div>
      <div className={styles.contentContainer}>
        <div>
          <TypeAnimation
            speed={60}
            preRenderFirstString
            className={botStyles.typeAnimation}
            sequence={textSequence}
            omitDeletionAnimation={true}
            wrapper="div"
            repeat={Infinity}
          />
        </div>
      </div>
    </main>
  </>
)

export default Bot
