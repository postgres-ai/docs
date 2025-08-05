import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import classNames from 'classnames'
import emoji from 'emoji-dictionary'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import React, { useCallback, useEffect } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import { getElapsedTimeString } from '../utils'

import styles from './styles.module.css'

interface ChatProps {
  id: string
  created_at: string
  modified_at: any
  parent_id: string
  is_ai: boolean
  content: string
  user_id: any
  summary: any
  is_public: boolean
  via_app: string
  display_name: any
  first_name: string
  last_name: any
  children_ids: string[]
}

const convertSlackContentToMarkdown = (item: {
  content: string
  via_app?: string
}) => {
  let replacedContent = item.content
  if (item.via_app === 'slack') {
    replacedContent = item.content
      .replace(/:\w+:/gi, (name) => emoji.getUnicode(name))
      .replace(/\*(.*?)\*/gi, (name) => `**${name}**`)
      .replace(/\n•/gi, () => `\n-`)
      .replace(/\n/gi, () => `\n\n`)
      .replace(/<(.*?)\|(.*?)>/gi, (name, url, text) => `[${text}](${url})`)
  }

  return replacedContent
}

export const Chatscontent = () => {
  const { id } = useParams<{ id: string }>()
  const { siteConfig } = useDocusaurusContext()
  const apiUrlPrefix = siteConfig.customFields.apiUrlPrefix

  const [state, setState] = React.useState({
    data: [],
    loading: false,
    error: false,
  })

  const handleFetchChat = useCallback(() => {
    setState({ data: null, loading: true, error: false })
    fetch(`${apiUrlPrefix}/chats?id=eq.${id}`)
      .then((response) => response.json())
      .then((data) => {
        setState({ data, loading: false, error: false })
      })
      .catch(() => {
        setState({ data: null, loading: false, error: true })
      })
  }, [id])

  useEffect(() => {
    handleFetchChat()
  }, [id])

  return (
    <main className={styles.outerContainer}>
      <div className={styles.main}>
        <div
          style={{
            display: 'none',
          }}
        >
          <Layout title="Postgres Chat" />
        </div>
        <nav className={styles.navigation}>
          <Link className={styles.flex} to="/">
            <img
              src="/img/logo.svg"
              alt="Postgres Bot Logo"
              height="32px"
              width="32px"
            />
            <span>PostgresAI</span>
          </Link>
        </nav>
        <div
          className={
            state.loading || !state.data?.length ? styles.centerContent : ''
          }
        >
          {state.loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner} />
            </div>
          ) : state.data && state.data?.length > 0 ? (
            <div className={styles.messagesContainer}>
              {state.data.map((item: ChatProps) => (
                <div key={item.id} className={styles.messageContainer}>
                  <div className={styles.messageHeader}>
                    {(item.first_name || item.last_name) && (
                      <span className={styles.subtext}>
                        {item.first_name} {item.last_name} |
                      </span>
                    )}
                    {item.created_at && (
                      <span
                        className={classNames(styles.pointer, styles.subtext)}
                        title={item.created_at}
                      >
                        {getElapsedTimeString(item.created_at)} ago
                      </span>
                    )}
                    {item.parent_id && (
                      <span className={styles.subtext}>
                        | <Link to={`/chats/${item.parent_id}`}>prev</Link>
                      </span>
                    )}
                    {item.children_ids?.length > 0 && (
                      <span className={styles.subtext}>
                        |{' '}
                        <Link to={`/chats/${item.children_ids[0]}`}>next</Link>
                      </span>
                    )}
                  </div>
                  <ReactMarkdown
                    className={styles.messageContent}
                    linkTarget="_blank"
                  >
                    {convertSlackContentToMarkdown(item)}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          ) : (
            !state.loading && (
              <div className={styles.errorContainer}>
                <h2>Chat not found</h2>
                <p>
                  No chat found with the id <strong>{id}</strong>
                </p>
                <p>
                  <span onClick={handleFetchChat} className={styles.tryAgain}>
                    Try again
                  </span>{' '}
                  or go back to the <Link to="/">homepage</Link>.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  )
}
