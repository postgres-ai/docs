import React, { useEffect, useRef } from 'react'

import { GatewayLink } from '../GatewayLink'
import { TwitterLogo } from './TwitterLogo'
import { GitlabLogo } from './GitlabLogo'
import { GithubLogo } from './GithubLogo'
import { LinkedInLogo } from './LinkedInLogo'

import styles from './styles.module.css'

type Props = {
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

  const hasAnyLink = Boolean(twitterUrl || gitlabUrl || githubUrl || linkedinUrl)

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
              <GatewayLink href={twitterUrl} className={styles.link}>
                <TwitterLogo />
              </GatewayLink>
            )}
            {gitlabUrl && (
              <GatewayLink href={gitlabUrl} className={styles.link}>
                <GitlabLogo />
              </GatewayLink>
            )}
            {githubUrl && (
              <GatewayLink href={githubUrl} className={styles.link}>
                <GithubLogo />
              </GatewayLink>
            )}
            {linkedinUrl && (
              <GatewayLink href={linkedinUrl} className={styles.link}>
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
