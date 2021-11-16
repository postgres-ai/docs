import { Link } from '@docusaurus/router'
import React from 'react'

import { GatewayLink } from '../../../../components/GatewayLink'
import { Author } from '../../../../data/authors'
import { Post } from '../../../../data/collections'
import { Comment } from '../Comment'

import styles from '../../styles.module.css'

type OwnProps = {
  post: Post & { collection?: any }
  commentAuthor?: Author
}

type Props = OwnProps

const PostItemCmp: React.FC<Props> = (props) => {
  const { post, commentAuthor } = props

  return (
    <div key={post.title} className={styles.collectionCard}>
      <div className={styles.cardTop}>
        <GatewayLink href={post.url} className={styles.cardLink}>
          <h4>{post.title}</h4>
        </GatewayLink>
      </div>

      <div className={styles.cardPreview}>
        <GatewayLink href={post.url} className={styles.cardLink}>
          <img src={post.previewUrl} alt={post.title} />
        </GatewayLink>
      </div>

      {post.comment && (
        <Comment text={post.comment} commentAuthor={commentAuthor} />
      )}

      {post.collection && (
        <div className={styles.inlineCollectionName}>
          <Link to={post.collection.url} className={styles.cardLink}>
            From <span>{post.collection.title}</span> collection
          </Link>
        </div>
      )}
    </div>
  )
}

export const PostItem = React.memo(PostItemCmp)
