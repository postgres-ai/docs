import React from 'react'

import { LinkIcon } from './LinkIcon'

import styles from './styles.module.css'

type Props = {
  href: string
  children: React.ReactNode
  className: string
}

export const StyledLink = (props: Props) => {
  return (
    <a href={props.href} className={props.className}>
      {props.children}&nbsp;
      <LinkIcon className={styles.icon} />
    </a>
  )
}
