import classNames from 'classnames'
import React from 'react'

import styles from './styles.module.css'

type OwnProps = {
  title: string
  text: string | React.ReactNode
  icon: string | React.ReactNode
  buttonText: string
  onButtonClick(): void
}

type Props = OwnProps

const CardInfoCmp: React.FC<Props> = (props) => {
  const { title, text, buttonText, icon, onButtonClick } = props

  return (
    <div className={classNames('card', styles.container)}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          {typeof icon === 'string' ? <img src={icon} alt={title} /> : icon}
        </div>
      </div>
      <div className="card-body px-xl-3">
        <h3 className="card-title">{title}</h3>
        <div className={styles.cardText}>{text}</div>
        <div className={styles.button} onClick={onButtonClick}>
          {buttonText}
        </div>
      </div>
    </div>
  )
}

export const CardInfo = React.memo(CardInfoCmp)
