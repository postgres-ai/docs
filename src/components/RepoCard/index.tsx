import React from 'react'
import GitHubButton from 'react-github-btn'

import { GatewayLink } from '@site/src/components/GatewayLink'

import styles from './styles.module.css'

type Props = {
  title: string
  logoUrl: string
  description: string
  repoName: string
  repoUrl: string
  githubButtonText?: string
}

export const RepoCard = (props: Props) => {
  return (
    <div className={styles.root}>
      <div>
        <div className={styles.header}>
          <h4 className={styles.title}>{props.title}</h4>
          <img src={props.logoUrl} alt={props.title} className={styles.logo} />
        </div>
        <p className={styles.description}>{props.description}</p>
      </div>

      <div>
        <GatewayLink
          className={styles.link}
          href={props.repoUrl}
          label={props.repoName}
        >
          {props.repoName}
        </GatewayLink>
        {props.githubButtonText && (
          <div className={styles.githubStarButtonWrapper}>
            <GitHubButton
              href={props.repoUrl}
              // data-color-scheme="no-preference: light; light: light; dark: dark;"
              data-color-scheme="light"
              data-size="large"
              data-show-count="true"
              aria-label="Star ntkme/github-buttons on GitHub"
            >
              Star us
            </GitHubButton>
          </div>
        )}
      </div>
    </div>
  )
}
