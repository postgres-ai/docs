import classNames from 'classnames'
import React, { useState } from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export const emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

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

    if (!emailRegex.test(state.email)) {
      setState({
        ...state,
        isLoading: false,
        isSubmitted: false,
        error: 'Please enter a valid email address',
      })
      return
    }

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
      <BrowserOnly>
        {() => {
          if (state.isSubmitted) {
            return (
              <div className={styles.container}>
                <h3>
		  Thanks! Here's what's next:
		</h3>
		<ol style={{ textAlign: 'left', fontSize: '18px' }}>
		  <li style={{ marginBottom: '10px' }}>Once approved, you will receive an email invitation to join the private alpha-testing Slack channel (usually 1-2 days)</li>
		  <li>Meanwhile, join our Slack workspace: <a href="https://slack.postgres.ai" target="_blank">Slack.Postgres.ai</a></li>
                </ol>
              </div>
            )
          } else {
            return (
              <form onSubmit={onSubmit} className={styles.container}>
                <h3>New PostgresAI bot – get early access</h3>
                <div className={styles.flex}>
                  <input
                    type="text"
                    disabled={state.isLoading || state.isSubmitted}
                    className={classNames(
                      hasError && styles.inputError,
                      styles.input,
                    )}
                    value={state.email}
                    placeholder="email@address.com"
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
            )
          }
        }}
      </BrowserOnly>
    </div>
  )
}
