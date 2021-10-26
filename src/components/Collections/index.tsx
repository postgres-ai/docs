import React, { useEffect, useRef } from 'react'

import Layout from '@theme/Layout';
import Masonry from 'react-masonry-css'

import { GatewayLink } from '../GatewayLink'

import styles from './styles.module.css'
import collections from '../../data/collections';
import authors from '../../data/authors';

type Props = {
  index: bool
  id: string
}

type Item = {
  title: string
  url: string
  previewUrl: string
  comment?: string
  commentatorId: string
}

type Collection = {
  id: string
  title: string
  comment?: string
  previewUrl?: string
  url: string
  items: Item[]
}

const HOME_TITLE = 'Explore PostgreSQL';

const masonryColumns = {
  default: 6,
  2000: 5,
  1650: 4,
  1300: 3,
  950: 2,
  600: 1
};

const renderCollectionsList = (collections: Collection[]) => {
  return (
    <Layout title={HOME_TITLE}>
      <main className={"margin-vert--lg " + styles.collectionContainer}>
        <div className={styles.title}>
          <h1>{HOME_TITLE}</h1>
        </div>
        <div className="row">
          <Masonry
            breakpointCols={masonryColumns}
            className={styles.collectionGrid}
            columnClassName={styles.collectionGridCol}>
            {collections.map((collection) => (
              <div key={collection.title} className={styles.collectionCard}>
                <div className={styles.cardPreview}>
                  <GatewayLink href={collection.url} className={styles.cardLink}>
                    <img src={collection.previewUrl} alt={collection.title} />
                  </GatewayLink>
                </div>

                <div className={styles.cardTop}>
                  <GatewayLink href={collection.url} className={styles.cardLink}>
                    <h4>{collection.title}</h4>
                  </GatewayLink>
                </div>
              </div>
            ))}
          </Masonry>
        </div>
      </main>
    </Layout>
  )
}

const renderCollection = (collection: Collection) => {
  return (
    <Layout title={collection.title}>
      <main className={"margin-vert--lg " + styles.collectionContainer}>
        <div className="text--center margin-bottom--m">
          <h1>{collection.title}</h1>
          <p>{collection.comment}</p>
        </div>
        <div className="row">
          <Masonry
            breakpointCols={masonryColumns}
            className={styles.collectionGrid}
            columnClassName={styles.collectionGridCol}>
            {collection.items.map((item) => (
              <div key={item.title} className={styles.collectionCard}>
                <div className={styles.cardTop}>
                  <GatewayLink href={item.url} className={styles.cardLink}>
                    <h4>{item.title}</h4>
                  </GatewayLink>
                </div>

                <div className={styles.cardPreview}>
                  <GatewayLink href={item.url} className={styles.cardLink}>
                    <img src={item.previewUrl} alt={item.title} />
                  </GatewayLink>
                </div>

                {item.comment && (
                <div className={styles.cardBottom}>
                  <div className={styles.commentBubble}>
                    {item.comment}
                  </div>

                  {item.commentatorId && authors[item.commentatorId] && (
                  <div className={styles.avatarContainer}>
                    <img
                      className={styles.avatar}
                      src={authors[item.commentatorId].avatarUrl}
                      alt={authors[item.commentatorId].name}
                    />
                    <span className={styles.commentator}>{authors[item.commentatorId].name}</span>
                  </div>
                  )}
                </div>
                )}
            </div>
            ))}
          </Masonry>
        </div>
      </main>
    </Layout>
  )
}

export const Collections = (props: Props) => {
  const {
    home = false,
    id = ''
  } = props

  if (home) return renderCollectionsList(collections)

  const collection = collections.find(c => c.id && c.id === id)

  if (!collection || !collection.items) return (
    <Layout title="Collection not found">
      <main className="container margin-vert--lg">
        <div className="text--center margin-bottom--m">
          <h1>Collection not found</h1>
        </div>
      </main>
    </Layout>
  )

  return renderCollection(collection);
}
