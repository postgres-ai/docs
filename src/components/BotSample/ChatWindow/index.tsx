import React, { useEffect, useRef, useState } from 'react'
import { Message } from '@site/src/components/BotSample/Message'
import styles from './styles.module.css';
import cn from 'classnames'
import { SignInBanner } from '@site/src/components/BotSample/SignInBanner'
import { BotMessage, ErrorType, StateMessage, StreamMessage, SecondaryStreamMessage } from '@site/src/components/BotSample/hooks'

type ChatWindowProps = {
  isChatVisible: boolean
  messages: BotMessage[] | null
  stateMessage: StateMessage | null
  isLoading: boolean
  error: ErrorType
  onRetrySendingMessage: (content: string) => void
  currentStreamMessage: StreamMessage | null
  currentSecondaryStreamMessage?: SecondaryStreamMessage | null
  secondaryStreamBuffer?: string
}

export const ChatWindow = (props: ChatWindowProps) => {
  const {
    isChatVisible,
    messages,
    isLoading,
    stateMessage,
    error,
    onRetrySendingMessage,
    currentStreamMessage,
    currentSecondaryStreamMessage,
    secondaryStreamBuffer
  } = props;

  // Show state text at the end, keep it briefly after null
  const [visibleState, setVisibleState] = useState<string | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const incoming = stateMessage?.state;
    if (incoming) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setVisibleState(incoming);
    } else {
      if (visibleState && !hideTimeoutRef.current) {
        hideTimeoutRef.current = setTimeout(() => {
          setVisibleState(null);
          hideTimeoutRef.current = null;
        }, 1500);
      }
    }
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    }
  }, [stateMessage?.state]);

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
        { (currentStreamMessage || currentSecondaryStreamMessage) && (
          <Message
            isAi
            content={currentStreamMessage?.content || ''}
            isLoading={isLoading}
            canRetry={false}
            isCurrentStreamMessage
            secondaryStreamBuffer={secondaryStreamBuffer}
          />
        )}
        { isLoading && !currentStreamMessage && !currentSecondaryStreamMessage && (
          <Message
            isAi
            content={null}
            isLoading
          />
        )}
        {visibleState && (
          <div className={styles.stateMessage}>{visibleState}</div>
        )}
        {messages.length >= 2 && <SignInBanner />}
      </div>}
    </div>
  )
}