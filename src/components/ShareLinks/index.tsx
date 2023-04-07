import React from 'react'

import { GatewayLink } from '@site/src/components/GatewayLink'
import { FacebookLogo } from '@site/src/icons/FacebookLogo'
import { TwitterLogo } from '@site/src/icons/TwitterLogo'
import { LinkedInLogo } from '@site/src/icons/LinkedInLogo'

import { useShareUrls } from './hooks'

import styles from './styles.module.css'

export const ShareLinks = () => {
  const shareUrls = useShareUrls()

  return (
    <div className={styles.root}>
      <h4>Share this blog post:</h4>
      <nav className={styles.links}>
        <GatewayLink
          href={shareUrls.facebook}
          className={styles.link}
          label="Facebook"
        >
          <FacebookLogo className={styles.icon} />
        </GatewayLink>
        <GatewayLink
          href={shareUrls.twitter}
          className={styles.link}
          label="Twitter"
        >
          <TwitterLogo className={styles.icon} />
        </GatewayLink>
        <GatewayLink
          href={shareUrls.linkedIn}
          className={styles.link}
          label="LinkedIn"
        >
          <LinkedInLogo className={styles.icon} />
        </GatewayLink>
      </nav>
    </div>
  )
}
