import { Link, useParams } from '@docusaurus/router'
import React from 'react'
import Layout from '@theme/Layout'
import Masonry from 'react-masonry-css'
import classNames from 'classnames'

import collections from '../../../data/collections'
import { ROUTES } from '../../routes'
import mockAuthors from '../../../data/authors'
import { getAuthorById } from '../Collections/utils'
import { AuthorInfo } from '../components/AuthorInfo'
import { PostItem } from '../components/PostItem'

import commonStyles from '../styles.module.css'
import styles from './styles.module.css'

type OwnProps = {}

type Props = OwnProps

const masonryColumns = {
  default: 6,
  2000: 5,
  1650: 4,
  1300: 3,
  950: 2,
  600: 1,
}

const CollectionDetailCmp: React.FC<Props> = () => {
  const { id } = useParams<{ id: string }>()

  const collection = collections.find((collection) => collection.id === id)

  if (!collection || !collection.posts)
    return (
      <Layout title="Collection not found">
        <main className="container margin-vert--lg">
          <div className="text--center margin-bottom--m">
            <h1>Collection not found</h1>
          </div>
        </main>
      </Layout>
    )

  const curator = getAuthorById(mockAuthors, collection.curatorId)

  return (
    <Layout title={collection.title}>
      <div className={styles.backButton}>
        <Link to={ROUTES.UNIVERSE.path}>← Back to collections</Link>
      </div>
      <main
        className={classNames(
          'margin-vert--lg',
          commonStyles.collectionContainer,
        )}
      >
        <div className="text--center margin-bottom--m">
          <h1>{collection.title}</h1>
          <p>{collection.comment}</p>
          {curator && (
            <div>
              <p className={styles.curatedNotion}>Curated by</p>
              {curator && (
                <AuthorInfo
                  author={curator}
                  containerClassName={styles.curatorAvatar}
                />
              )}
            </div>
          )}
        </div>
        <div className="row">
          <Masonry
            breakpointCols={masonryColumns}
            className={commonStyles.collectionGrid}
            columnClassName={commonStyles.collectionGridCol}
          >
            {collection.posts.map((post, index) => {
              return (
                <PostItem
                  // todo change index to id
                  key={index}
                  post={post}
                  commentAuthor={getAuthorById(mockAuthors, post.commentatorId)}
                />
              )
            })}
          </Masonry>
        </div>
      </main>
    </Layout>
  )
}

export const CollectionDetail = React.memo(CollectionDetailCmp)
