import React, { useState, useRef, useEffect } from 'react'
import { ConnectionStatus, useBotMessages } from '@site/src/components/BotSample/hooks'
import styles from './SimpleChat.module.css'
import ReactMarkdown from 'react-markdown'

/**
 * Props for the SimpleChat component.
 */
type SimpleChatProps = {
  /** System context/instructions passed to the AI on the first message */
  aiContext?: string;
  /** Placeholder text shown in the input field */
  placeholder?: string;
}

/**
 * A simple chat interface for asking questions about blog content.
 * Connects to a WebSocket backend and displays AI responses with markdown support.
 * Includes rate limiting (maxMessages).
 */
export const SimpleChat = (props: SimpleChatProps) => {
  const { aiContext, placeholder = "Ask anything about this article..." } = props;
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const maxMessages = 5;
  const {
    sendMessage,
    messages,
    loading,
    connectionStatus,
    error,
    currentStreamMessage,
  } = useBotMessages({
    saveData: false,
    maxMessages,
  });

  // Check if message limit reached - account for in-flight messages to prevent race condition
  const limitReached = messages.length >= maxMessages && !loading && !currentStreamMessage;
  const canSendMore = messages.length < maxMessages && !loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && connectionStatus === ConnectionStatus.OPEN && canSendMore) {
      sendMessage({ content: inputValue, padding: messages.length === 0 ? aiContext : null });
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = connectionStatus !== ConnectionStatus.OPEN || !canSendMore;

  return (
    <div className={styles.container}>
      {messages.length === 0 && !currentStreamMessage ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            className={styles.input}
          />
          <button
            type="submit"
            disabled={isDisabled || !inputValue.trim()}
            className={styles.button}
          >
            Ask
          </button>
        </form>
      ) : (
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${msg.is_ai ? styles.ai : styles.user}`}>
              {msg.is_ai ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          ))}
          {currentStreamMessage && (
            <div className={`${styles.message} ${styles.ai}`}>
              <ReactMarkdown>{currentStreamMessage.content}</ReactMarkdown>
            </div>
          )}
          {loading && !currentStreamMessage && (
            <div className={`${styles.message} ${styles.ai} ${styles.loading}`}>
              Thinking...
            </div>
          )}
          {limitReached && (
            <div className={styles.signIn}>
              <a href="https://console.postgres.ai">Sign in</a> to continue
            </div>
          )}
        </div>
      )}
      {error && <span className={styles.error}>{error.message}</span>}
    </div>
  );
};
