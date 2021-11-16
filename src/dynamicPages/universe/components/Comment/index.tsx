import React from 'react'

import { Author } from '../../../../data/authors'
import { AuthorInfo } from '../AuthorInfo'

import styles from './styles.module.css'

type OwnProps = {
  text: string
  commentAuthor: Author
}

type Props = OwnProps

const CommentCmp: React.FC<Props> = (props) => {
  const { text, commentAuthor } = props

  return (
    <div className={styles.cardBottom}>
      <div className={styles.commentBubble}>{text}</div>

      {commentAuthor && <AuthorInfo author={commentAuthor} />}
    </div>
  )
}

export const Comment = React.memo(CommentCmp)
