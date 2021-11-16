import React from 'react'
import Layout from '@theme/Layout'
import Masonry from 'react-masonry-css'

import mockCollections from '../../../data/collections'
import mockAuthors from '../../../data/authors'
import { CollectionItem } from './CollectionItem'
import { PostItem } from '../components/PostItem'
import { getAuthorById, getLatestFeed } from './utils'

import styles from '../styles.module.css'

const HOME_TITLE = 'PostgreSQL Universe'

const masonryColumns = {
  default: 6,
  2000: 5,
  1650: 4,
  1300: 3,
  950: 2,
  600: 1,
}

export const Collections: React.FC = () => {
  return (
    <Layout title={HOME_TITLE}>
      <main className={'margin-vert--lg ' + styles.collectionContainer}>
        <div className={styles.title}>
          <h1>{HOME_TITLE}</h1>
        </div>
        <h2>Collections</h2>
        <div className="row">
          <Masonry
            breakpointCols={masonryColumns}
            className={styles.collectionGrid}
            columnClassName={styles.collectionGridCol}
          >
            {mockCollections.map((collection) => {
              return (
                <CollectionItem key={collection.id} collection={collection} />
              )
            })}
          </Masonry>
        </div>
        <h2>Latest</h2>
        <div className="row">
          <Masonry
            breakpointCols={masonryColumns}
            className={styles.collectionGrid}
            columnClassName={styles.collectionGridCol}
          >
            {getLatestFeed(mockCollections, 10).map((post, index) => {
              return (
                <PostItem
                  // todo change index to id
                  key={index}
                  post={post}
                  commentAuthor={getAuthorById(
                    mockAuthors,
                    post.commentatorId,
                  )}
                />
              )
            })}
          </Masonry>
        </div>
      </main>
    </Layout>
  )
}
