import React from 'react'
import { hints } from '@site/src/components/BotSample/hints'
import { HintCard } from './HintCard'
import s from './styles.module.css'

export type HintCardsProps = {
  onHintClick: (prompt: string) => void
  isConnected: boolean
}

export const HintCards = React.memo((props: HintCardsProps) => {
  const {onHintClick, isConnected} = props;

  return (
    <div className={s.container}>
        {
          hints.map((hint) => (
            <HintCard
              key={hint.hint}
              {...hint}
              onClick={onHintClick}
              disabled={!isConnected}
            />
          ))
        }
      </div>
  )
})