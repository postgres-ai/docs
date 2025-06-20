import React, { useMemo, useState } from 'react'
import { ConnectionStatus, StreamMessage, useBotMessages } from '@site/src/components/BotSample/hooks'
import styles from './styles.module.css'
import { Messages } from '@site/src/components/AssistantWidget/Messages'
import { Input } from '@site/src/components/AssistantWidget/Input'
import { Hint } from '@site/src/components/BotSample/hints'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

type AssistantWidgetProps = {
  aiContext?: string;
  defaultValue?: string
  hints?: Hint[]
}



export const AssistantWidget = (props: AssistantWidgetProps) => {
  const { aiContext, defaultValue: defaultValueProp, hints } = props;
  const {
    sendMessage,
    messages,
    loading,
    connectionStatus,
    error,
    threadId,
    currentStreamMessage,
  } = useBotMessages({
    saveData: false,
  })

  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { signInUrl } = customFields

  const [defaultValue, setDefaultValue] = useState(defaultValueProp)

  const processedAiContext = useMemo(() => {
    if (typeof window !== 'undefined') {
      const replacements = {
        '{currentPageUrl}': window.location.href,
      };

      return Object.keys(replacements).reduce((context, key) => {
        return context.replace(new RegExp(key, 'g'), replacements[key]);
      }, aiContext);
    }
    return aiContext;
  }, [aiContext]);

  const handleSendButtonClick = (value: string) => {
    if (value) {
      sendMessage({content: value, padding: messages.length == 0 ? processedAiContext : null})
    }
  }

  const handleHintClick = (hint: string) => {
    if (hint) {
      setDefaultValue(hint)
    }
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.pgaiLogo}>
          <img
            src="/img/chatbot-avatar.png"
            alt="Postgres AI logo"
            className={styles.pgaiLogoImage}
          />
          <b className="navbar__title text--truncate">Postgres AI Assistant</b>
        </div>
        <Messages
          isLoading={loading}
          messages={messages}
          threadId={threadId}
          hints={hints}
          onHintClick={handleHintClick}
          currentStreamMessage={currentStreamMessage}
        />
        {messages.length < 2 && <>
          <Input
            defaultValue={defaultValue}
            onSend={handleSendButtonClick}
            disabled={connectionStatus !== ConnectionStatus.OPEN || error !== null || loading}
            hintClicked={messages.length > 0}
          />
          <span className={styles.noteMessage}>By default, this communication is public. For private chats, register your own organization <a href={signInUrl as string} target="_blank">in Console</a>.</span>
        </>}
      </div>
      {error && <span className={styles.errorMessage}>{error.message}</span>}
    </div>
  )
}