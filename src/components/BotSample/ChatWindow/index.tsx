import React from 'react'
import { Message } from '@site/src/components/BotSample/Message'
import styles from './styles.module.css';
import cn from 'classnames'
import { SignInBanner } from '@site/src/components/BotSample/SignInBanner'
import { BotMessage, ErrorType, StateMessage } from '@site/src/components/BotSample/hooks'

type ChatWindowProps = {
  isChatVisible: boolean
  messages: BotMessage[] | null
  stateMessage: StateMessage | null
  isLoading: boolean
  error: ErrorType
  onRetrySendingMessage: (content: string) => void
}

export const ChatWindow = (props: ChatWindowProps) => {
  const {
    isChatVisible,
    messages,
    isLoading,
    stateMessage,
    error,
    onRetrySendingMessage
  } = props;

  return (
    <div className={cn(styles.container, {[styles.chatVisible]: isChatVisible})}>
      {messages && messages.length > 0 && <div className={styles.content}>
        {
          messages.map((item) =>
            <Message
              isAi={item.is_ai}
              content={item.content}
              key={item.content}
              canRetry={error && error.errorType === 'ratelimit' && !item.is_ai}
              onRetrySendingMessage={onRetrySendingMessage}
            />
          )
        }
        {
          isLoading && <Message
            isAi
            content={null}
            isLoading
          />
        }
        {messages.length >= 2 && <SignInBanner />}
      </div>}
    </div>
  )
}