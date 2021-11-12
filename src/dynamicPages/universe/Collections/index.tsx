import React from 'react'
import Layout from '@theme/Layout'
import Masonry from 'react-masonry-css'

import mockCollections from '../../../data/collections'
import { CollectionItem } from './CollectionItem'

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
        <div className="row">
          <Masonry
            breakpointCols={masonryColumns}
            className={styles.collectionGrid}
            columnClassName={styles.collectionGridCol}
          >
            {mockCollections.map((collection) => {
              return <CollectionItem collection={collection} />
            })}
          </Masonry>
        </div>
      </main>
    </Layout>
  )
}
