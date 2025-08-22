import React from 'react'
import { Hint } from '@site/src/components/BotSample/hints'
import { matchHintTypeAndIcon } from '@site/src/components/BotSample/utils'
import { HintCardsProps } from '@site/src/components/BotSample/HintCards'
import s from './styles.module.css'

export const HintCard = (props: Hint & { onClick: HintCardsProps["onHintClick"], disabled?: boolean }) => {
  const { prompt, hint, type, onClick, disabled } = props;
  return (
    <button
      onClick={() => !disabled && onClick(prompt)}
      className={`${s.container} ${disabled ? s.disabled : ''}`}
      disabled={!!disabled}
      title={disabled ? 'Connecting…' : undefined}
    >
      {React.createElement(matchHintTypeAndIcon(type))}
      <span>
        {hint}
      </span>
    </button>
  )
}