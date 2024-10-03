import React from 'react'
import styles from './styles.module.css'
import { HintCard } from '@site/src/components/BotSample/HintCards/HintCard'
import { Hint } from '@site/src/components/BotSample/hints'

type HintsProps = {
  hints: Hint[]
  onHintClick: (value: string) => void
}

export const HintsList = (props: HintsProps) => {
  const { hints, onHintClick } = props;
  return (
    <div className={styles.container}>
      {
        hints.map((hint) =>
          <HintCard
            key={hint.prompt}
            {...hint}
            onClick={() => onHintClick(hint.prompt)}
          />
        )
      }
    </div>
  )
}