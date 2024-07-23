import React from 'react'
import styles from './styles.module.css';
import ReactMarkdown from 'react-markdown'
import cn from 'classnames'
import { RetryIcon } from '@site/src/icons/RetryIcon'
import { LoadingIcon } from '@site/src/icons/LoadingIcon'

type MessageProps = {
  isAi: boolean
  content: string
  canRetry?: boolean
  onRetrySendingMessage?: (content: string) => void
  isLoading?: boolean
};

export const Message = (props: MessageProps) => {
  const { isAi, content, canRetry, onRetrySendingMessage, isLoading } = props;

  const handleRetry = () => {
    if (onRetrySendingMessage) {
      onRetrySendingMessage(content)
    }
  }

  return (
    <div className={cn(styles.container, { [styles.aiMessage]: isAi })}>
      <div className={styles.heading}>
        <span>{isAi ? 'Postgres.AI' : 'You'}</span>
      </div>
      <div className={cn(styles.content, { [styles.loader]: isLoading })}>
        {
          content &&
          <ReactMarkdown>
            {content}
          </ReactMarkdown>
        }
        {
          isLoading && <LoadingIcon />
        }
      </div>
      {canRetry && <button
        className={styles.retryButton}
        title="Try again"
        onClick={handleRetry}
      >
        <RetryIcon />
      </button>}
    </div>
  )
}