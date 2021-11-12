import { Link, useParams } from '@docusaurus/router'
import React from 'react'
import Layout from '@theme/Layout'
import Masonry from 'react-masonry-css'

import collections from '../../../data/collections'
import { GatewayLink } from '../../../components/GatewayLink'
import authors from '../../../data/authors'
import { ROUTES } from '../../routes'

import styles from '../styles.module.css'

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

const CollectionDetailCmp: React.FC<Props> = (props) => {
  const { id } = useParams<{ id: string }>()

  const collection = collections.find((collection) => collection.id === id)

  if (!collection || !collection.items)
    return (
      <Layout title="Collection not found">
        <main className="container margin-vert--lg">
          <div className="text--center margin-bottom--m">
            <h1>Collection not found</h1>
          </div>
        </main>
      </Layout>
    )

  return (
    <Layout title={collection.title}>
      <div className={styles.backButton}>
        <Link to={ROUTES.UNIVERSE.path}>← Back to collections</Link>
      </div>
      <main className={'margin-vert--lg ' + styles.collectionContainer}>
        <div className="text--center margin-bottom--m">
          <h1>{collection.title}</h1>
          <p>{collection.comment}</p>
          {collection.curatorId && authors[collection.curatorId] && (
            <div>
              <p className={styles.curatedNotion}>Curated by</p>
              <div
                className={styles.avatarContainer + ' ' + styles.curatorAvatar}
              >
                <img
                  className={styles.avatar}
                  src={authors[collection.curatorId].avatarUrl}
                  alt={authors[collection.curatorId].name}
                />
                <span className={styles.commentator}>
                  {authors[collection.curatorId].name}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="row">
          <Masonry
            breakpointCols={masonryColumns}
            className={styles.collectionGrid}
            columnClassName={styles.collectionGridCol}
          >
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
                    <div className={styles.commentBubble}>{item.comment}</div>

                    {item.commentatorId && authors[item.commentatorId] && (
                      <div className={styles.avatarContainer}>
                        <img
                          className={styles.avatar}
                          src={authors[item.commentatorId].avatarUrl}
                          alt={authors[item.commentatorId].name}
                        />
                        <span className={styles.commentator}>
                          {authors[item.commentatorId].name}
                        </span>
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

export const CollectionDetail = React.memo(CollectionDetailCmp)
