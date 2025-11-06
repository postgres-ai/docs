import classNames from 'classnames'
import React, { useState } from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import styles from './styles.module.css'

export default function SignupForm() {
  const { siteConfig } = useDocusaurusContext()
  const apiUrlPrefix = siteConfig.customFields.apiUrlPrefix

  const [state, setState] = useState({
    email: '',
    error: '',
    isLoading: false,
    isSubmitted: false,
  })

  const hasError = state.error.length > 0

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setState({ ...state, isLoading: true, error: '' })

    fetch(`${apiUrlPrefix}/bot_leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: state.email,
      }),
    })
      .then((response) => {
        if (response.ok) {
          setState({
            email: '',
            isSubmitted: true,
            isLoading: false,
            error: '',
          })
        } else {
          response.json().then((res) => {
            setState({
              ...state,
              isLoading: false,
              isSubmitted: false,
              error: res?.message || 'Something went wrong',
            })
          })
        }
      })
      .catch((err) =>
        setState({
          ...state,
          isLoading: false,
          isSubmitted: false,
          error: err?.message || err || 'Something went wrong',
        }),
      )
  }

  return (
     <div id="signup" className={styles.form}>
      {state.isSubmitted ? (
        <div className={styles.container}>
          <h3>Thank you! We will get in touch.</h3>
        </div>
      ) : (
        <form onSubmit={onSubmit} className={styles.container}>
          <h3 className={styles.formTitle}>Get early access</h3>
          <p className={styles.formDescription}>
            Currently in preview. Please use your work email address
          </p>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              disabled={state.isLoading || state.isSubmitted}
              className={classNames(
                hasError && styles.inputError,
                styles.input,
              )}
              value={state.email}
              placeholder="jane.smith@goodvibes.ai"
              required
              onChange={(evt) => {
                setState({
                  ...state,
                  email: evt.target.value,
                  error: '',
                })
              }}
            />
            <button
              type="submit"
              className={styles.button}
              disabled={state.isLoading || state.isSubmitted || hasError}
            >
              {state.isLoading ? (
                <div className={styles.loading} />
              ) : (
                'Join'
              )}
            </button>
          </div>
          {hasError && (
            <span className={styles.error}>{state.error}</span>
          )}
        </form>
      )}
    </div>
  )
}

