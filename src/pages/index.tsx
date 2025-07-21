import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import { RepoCard } from '@site/src/components/RepoCard'
import LaunchWeekPreview from '@site/src/components/LaunchWeekPreview'

import blog from '../data/blog'

import styles from './index.module.css'
import { BotSample } from '@site/src/components/BotSample'




function IndexPage() {
  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { signInUrl } = customFields

  if (typeof signInUrl !== 'string') return null

  return (
    <Layout>
      <div className="launch-week-section">
        <div className="container">
          <LaunchWeekPreview />
        </div>
      </div>
      {/* Return SECTION!!! and  banner class after launch week */}
      <div className="position-relative text-center">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-md-2 d-none d-md-block"></div>
            <div className="col-md-8">
              <div className="mb-4">
                <BotSample />
              </div>
            </div>
            <div className="col-md-2"></div>
          </div>
        </div>
      </div>
      
      
    </Layout>
  )
}

export default IndexPage
