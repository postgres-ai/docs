import React from 'react'
import styles from './styles.module.css'
import { Message } from '@site/src/components/BotSample/Message'
import { BotMessage, StreamMessage } from '@site/src/components/BotSample/hooks'
import { SignInBanner } from '@site/src/components/BotSample/SignInBanner'
import { HintsList } from '@site/src/components/AssistantWidget/HintsList'
import { Hint } from '@site/src/components/BotSample/hints'
import { AnimatedMessage } from '@site/src/components/AssistantWidget/AnimatedMessage/AnimatedMessage'

type MessagesProps = {
  messages: BotMessage[],
  isLoading?: boolean
  threadId?: string | null
  hints?: Hint[]
  onHintClick?: (hint: string) => void
  currentStreamMessage: StreamMessage | null
}

export const Messages = ({messages, isLoading, threadId, onHintClick, hints, currentStreamMessage}: MessagesProps) => {
  return (
    <div>
      {(!messages || messages.length === 0) && <AnimatedMessage />}
      {
        (!messages || messages.length === 0) && hints &&
        <HintsList hints={hints} onHintClick={onHintClick} />
      }
      {messages && messages.map((message, index) => (
        <Message
          content={message.content}
          isAi={message.is_ai}
          isLoading={isLoading && !currentStreamMessage}
          key={message.content}
        />
      ))}
      {
        currentStreamMessage && isLoading && <Message
          isAi
          content={currentStreamMessage.content}
          canRetry={false}
        />
      }
      {messages.length >= 2 &&
        <div className={styles.signInBanner}>
          <SignInBanner saveConversationIdOnSignInClick threadId={threadId} />
        </div>
      }
    </div>
  )
}