import React, { useEffect, useRef } from 'react'

import { GatewayLink } from '@site/src/components/GatewayLink'
import { TwitterLogo } from '@site/src/icons/TwitterLogo'
import { GitlabLogo } from '@site/src/icons/GitlabLogo'
import { GithubLogo } from '@site/src/icons/GithubLogo'
import { LinkedInLogo } from '@site/src/icons/LinkedInLogo'

import styles from './styles.module.css'

export type Props = {
  avatarUrl: string
  name: string
  role: string
  twitterUrl?: string
  gitlabUrl?: string
  githubUrl?: string
  linkedinUrl?: string
  note: string
  anchorId?: string
}

const HEADER_HEIGHT = 60
const CONTENT_INDENT = 24

export const AuthorBanner = (props: Props) => {
  const {
    avatarUrl,
    name,
    role,
    twitterUrl,
    gitlabUrl,
    githubUrl,
    linkedinUrl,
    note,
    anchorId = 'author',
  } = props

  const LINK_SELECTOR = `a[href=\\#${anchorId}]`

  const hasAnyLink = Boolean(
    twitterUrl || gitlabUrl || githubUrl || linkedinUrl,
  )

  const rootRef = useRef<HTMLDivElement | null>(null)

  const handleLinkClick = () => {
    if (!rootRef.current) return

    requestAnimationFrame(() => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement

      const currentScrollPos = scrollTop

      const maxScrollPos = scrollHeight - clientHeight

      if (currentScrollPos === maxScrollPos) return

      window.scrollTo({
        top: currentScrollPos - HEADER_HEIGHT - CONTENT_INDENT,
      })
    })
  }

  useEffect(() => {
    const linkElement = window.document.querySelector(LINK_SELECTOR)
    if (!linkElement) return

    linkElement.addEventListener('click', handleLinkClick)

    return () => linkElement.removeEventListener('click', handleLinkClick)
  }, [])

  return (
    <div className={styles.root} id={anchorId} ref={rootRef}>
      <img className={styles.avatar} src={avatarUrl} alt={name} />
      <div className={styles.content}>
        <h6 className={styles.name}>{name}</h6>
        <p className={styles.role}>
          {role} <a href="/">Postgres.ai</a>
        </p>
        {hasAnyLink && (
          <nav className={styles.links}>
            {twitterUrl && (
              <GatewayLink
                href={twitterUrl}
                className={styles.link}
                label="Twitter"
              >
                <TwitterLogo />
              </GatewayLink>
            )}
            {gitlabUrl && (
              <GatewayLink
                href={gitlabUrl}
                className={styles.link}
                label="Gitlab"
              >
                <GitlabLogo />
              </GatewayLink>
            )}
            {githubUrl && (
              <GatewayLink
                href={githubUrl}
                className={styles.link}
                label="Github"
              >
                <GithubLogo />
              </GatewayLink>
            )}
            {linkedinUrl && (
              <GatewayLink
                href={linkedinUrl}
                className={styles.link}
                label="Linkedin"
              >
                <LinkedInLogo />
              </GatewayLink>
            )}
          </nav>
        )}
        <p className={styles.note}>{note}</p>
      </div>
    </div>
  )
}
