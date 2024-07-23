import React, { useEffect, useState } from 'react'
import { ChatWindow } from '@site/src/components/BotSample/ChatWindow'
import { CommandLine } from '@site/src/components/BotSample/CommandLine'
import { ConnectionStatus, useBotMessages } from '@site/src/components/BotSample/hooks'
import styles from './styles.module.css'

export const BotSample = () => {
  const [isChatVisible, setChatVisible] = useState(false);
  const {
    messages,
    sendMessage,
    loading,
    stateMessage,
    connectionStatus,
    error
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

  return (
    <div>
      <div>
        <ChatWindow
          isChatVisible={isChatVisible}
          messages={messages}
          isLoading={loading}
          stateMessage={stateMessage}
          error={error}
          onRetrySendingMessage={handleSendMessage}
        />
        {messages.length < 2 && <CommandLine
          isChatVisible={isChatVisible}
          onSend={handleSendMessage}
          isLoading={loading}
          disabled={messages && messages.length > 0 || connectionStatus !== ConnectionStatus.OPEN}
        />}
        {error && error.message && !isChatVisible && <span className={styles.errorMessage}>{error.message}</span>}
      </div>
    </div>
  )
}