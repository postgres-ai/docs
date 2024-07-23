import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import styles from './styles.module.css';
import cn from 'classnames'
import { addNewLine, checkIsNewLineCmd, checkIsSendCmd } from '@site/src/components/BotSample/CommandLine/utils'
import { ConnectionStatus, useCaret } from '@site/src/components/BotSample/hooks'
import { SendIcon } from '@site/src/icons/SendIcon'

type CommandLineProps = {
  isChatVisible: boolean,
  onSend: (content: string) => void,
  isLoading: boolean
  disabled: boolean
}

export const CommandLine = (props: CommandLineProps) => {
  const { isChatVisible, onSend, isLoading, disabled } = props;
  const [value, setValue] = useState('');
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const caret = useCaret(textareaRef);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };


  const handleSubmitForm = (event: FormEvent) => {
    event.preventDefault();

    if (value && value.length > 0  && !disabled) {
      onSend(value);
      setValue('');
    }

  }

  const handleChangeText = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (!textareaRef.current) return

    // Trigger to send.
    if (checkIsSendCmd(e.nativeEvent)) {
      e.preventDefault()
      if (value && value.length > 0  && !disabled) {
        onSend(value);
        setValue('')
      }
      return
    }

    // Trigger line break.
    if (checkIsNewLineCmd(e.nativeEvent)) {
      e.preventDefault()

      const content = addNewLine(value, textareaRef.current)
      setValue(content.value)
      caret.setPosition(content.caretPosition)

      handleInput();

      return
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <form
      className={cn(styles.form, {[styles.chatVisible]: isChatVisible})}
      onSubmit={handleSubmitForm}
      ref={formRef}
    >
      <textarea
        placeholder="Let's talk all things Postgres"
        className={styles.formInput}
        value={value}
        onChange={handleChangeText}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        ref={textareaRef}
        rows={1}
      />
      <button
        type="submit"
        className={cn(styles.sendButton)}
        disabled={disabled || isLoading}
      >
        <SendIcon />
      </button>
    </form>
  )
}