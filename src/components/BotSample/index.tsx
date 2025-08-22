import React, { useEffect, useState } from 'react'
import { ChatWindow } from '@site/src/components/BotSample/ChatWindow'
import { CommandLine } from '@site/src/components/BotSample/CommandLine'
import { ConnectionStatus, useBotMessages } from '@site/src/components/BotSample/hooks'
import styles from './styles.module.css'
import { HintCards } from '@site/src/components/BotSample/HintCards'
import { KBStats } from '@site/src/components/KBStats'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export const BotSample = () => {
  const [isChatVisible, setChatVisible] = useState(false);

  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { signInUrl } = customFields

  const {
    messages,
    sendMessage,
    loading,
    stateMessage,
    connectionStatus,
    error,
    currentStreamMessage,
    currentSecondaryStreamMessage,
    secondaryStreamBuffer
  } = useBotMessages();

  const handleSendMessage = (content: string) => {
    if (content) {
      sendMessage({ content })
    }
  }

  useEffect(() => {
    if (messages && messages.length > 0) {
      setChatVisible(true)
    }
  }, [messages])

  const handleHintClick = (prompt: string) => {
    if (!error) {
      handleSendMessage(prompt)
    }
  }

  return (
    <div>
      {!isChatVisible && (
        <HintCards
          onHintClick={handleHintClick}
          isConnected={connectionStatus === ConnectionStatus.OPEN}
        />
      )}
      <div>
        <ChatWindow
          isChatVisible={isChatVisible}
          messages={messages}
          isLoading={loading}
          stateMessage={stateMessage}
          error={error}
          onRetrySendingMessage={handleSendMessage}
          currentStreamMessage={currentStreamMessage}
          currentSecondaryStreamMessage={currentSecondaryStreamMessage}
          secondaryStreamBuffer={secondaryStreamBuffer}
        />
        {messages.length < 2 && <CommandLine
          isChatVisible={isChatVisible}
          onSend={handleSendMessage}
          isLoading={loading}
          disabled={messages && messages.length > 0 || connectionStatus !== ConnectionStatus.OPEN}
        />}
        {!isChatVisible && (
          connectionStatus !== ConnectionStatus.OPEN ? (
            <span className={styles.errorMessage}>
              {error && error.message ? error.message : 'Connecting…'}
            </span>
          ) : (
            !error && (
              <span className={styles.noteMessage}>
                Public by default. For private chats, register in&nbsp;
                <a href={signInUrl as string} className={styles.link}>Console</a>.
              </span>
            )
          )
        )}
      </div>
      {!isChatVisible && <KBStats />}
    </div>
  )
}