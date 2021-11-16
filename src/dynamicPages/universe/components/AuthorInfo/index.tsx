import React from 'react'
import classNames from 'classnames'

import { Author } from '../../../../data/authors'

import styles from './styles.module.css'

type OwnProps = {
  author: Author
  containerClassName?: string
}

type Props = OwnProps

const AuthorInfoCmp: React.FC<Props> = (props) => {
  const { author, containerClassName } = props

  return (
    <div className={classNames(styles.avatarContainer, containerClassName)}>
      <img className={styles.avatar} src={author.avatarUrl} alt={author.name} />
      <span className={styles.commentator}>{author.name}</span>
    </div>
  )
}

export const AuthorInfo = React.memo(AuthorInfoCmp)
