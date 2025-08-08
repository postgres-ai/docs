import React from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { BotSample } from '@site/src/components/BotSample'




function IndexPage() {
  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { signInUrl } = customFields

  if (typeof signInUrl !== 'string') return null

  return (
    <Layout>
      <section className="banner position-relative text-center">
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
      </section>
    </Layout>
  )
}

export default IndexPage
