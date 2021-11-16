import React from 'react'
import { Link } from '@docusaurus/router'
import { Collection } from '../../../../data/collections'
import { ROUTES } from '../../../routes'

import styles from '../../styles.module.css'

type OwnProps = {
  collection: Collection
}

type Props = OwnProps

const CollectionItemCmp: React.FC<Props> = (props) => {
  const { collection } = props

  const detailUrl = `${ROUTES.UNIVERSE.path}${collection.id}`

  return (
    <div className={styles.collectionCard}>
      <div className={styles.cardPreview}>
        <Link to={detailUrl} className={styles.cardLink}>
          <img src={collection.previewUrl} alt={collection.title} />
        </Link>
      </div>

      <div className={styles.cardTop}>
        <Link to={detailUrl} className={styles.cardLink}>
          <h4>{collection.title}</h4>
        </Link>
      </div>
    </div>
  )
}

export const CollectionItem = React.memo(CollectionItemCmp)
