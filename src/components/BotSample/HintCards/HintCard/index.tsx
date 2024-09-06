import React from 'react'
import { Hint } from '@site/src/components/BotSample/hints'
import { matchHintTypeAndIcon } from '@site/src/components/BotSample/utils'
import { HintCardsProps } from '@site/src/components/BotSample/HintCards'
import s from './styles.module.css'

export const HintCard = (props: Hint & { onClick: HintCardsProps["onHintClick"] }) => {
  const { prompt, hint, type, onClick } = props;
  return (
    <button
      onClick={() => onClick(prompt)}
      className={s.container}
    >
      {React.createElement(matchHintTypeAndIcon(type))}
      <span>
        {hint}
      </span>
    </button>
  )
}