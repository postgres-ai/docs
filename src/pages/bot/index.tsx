import React from 'react'
import Layout from '@theme/Layout'
import { TypeAnimation } from 'react-type-animation'

import SignupForm from './signupForm/signupForm'

import styles from './styles.module.css'
import botStyles from './signupForm/styles.module.css'

const textSequence = [
  'Free GPT-4 Turbo: the best LLM, available for free (Postgres-related topics only).',
  2000,
  'Rich knowledge base: over 110,000 items including the Postgres docs for all current versions and Postgres-related software such as PgBouncer, Patroni, pgvector.',
  4000,
  "Source code interaction: \"talk to the source code\" to understand how exactly things are implemented, when the docs are not enough.",
  3000,
  "Real database experiments conducted by bot: study Postgres behavior in action, run benchmarks, optimize query performance.",
  3000,
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
