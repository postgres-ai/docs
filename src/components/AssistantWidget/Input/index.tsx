import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import styles from './styles.module.css'
import { SendIcon } from '@site/src/icons/SendIcon'
import { useCaret } from '@site/src/components/BotSample/hooks'
import { addNewLine, checkIsNewLineCmd, checkIsSendCmd } from '@site/src/components/BotSample/CommandLine/utils'

type InputProps = {
  defaultValue: string,
  onSend: (value: string) => void,
  disabled: boolean,
  hintClicked: boolean,
}

export const Input = (props: InputProps) => {
  const { defaultValue, onSend, disabled } = props;

  const [value, setValue] = useState<string>(defaultValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const caret = useCaret(textareaRef);

  const handleChangeText = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (!textareaRef.current) return

    // Trigger to send.
    if (checkIsSendCmd(e.nativeEvent)) {
      e.preventDefault()
      if (value && value.length > 0 && !disabled) {
        handleSend();
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

      return
    }
  }

  const handleSend = () => {
    if (value) {
      onSend(value)
      setValue('')
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    if (defaultValue !== value) {
      setValue(defaultValue)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }, [defaultValue])

  return (
    <div className={styles.inputContainer}>
      <textarea
        rows={1}
        className={styles.textarea}
        value={value}
        ref={textareaRef}
        onChange={handleChangeText}
        onKeyDown={handleKeyDown}
        placeholder="Message..."
      />
      <button
        className={styles.sendButton}
        onClick={handleSend}
        disabled={disabled || (value?.length === 0 && !defaultValue)}
      >
        <SendIcon />
      </button>
    </div>
  );
};