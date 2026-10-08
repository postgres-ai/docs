import React from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import Home from '../components/Home'
import { SITE_NAME } from '../config/site'

// The homepage's own slogan and description (the site-wide tagline in site.json is unchanged)
const HOME_SLOGAN = "Postgres under control. Focus on your product."
const HOME_DESCRIPTION =
  'Keep database health under control with continuous monitoring, prioritized fixes and safe testing on full-size clones. Give your team and coding agents room to build the product.'

// Testimonials
const testimonials = [
  {
    quote: "PostgresAI was instrumental in driving us toward zero-downtime upgrades and improving our disaster recovery process, achieving 7 TiB/hour restore speeds. Their commitment to putting developers first aligns perfectly with our open-source philosophy",
    name: "Oliver Rice, Ph.D.",
    title: "Head of Engineering",
    company: "Supabase",
    location: "USA",
  },
  {
    quote: "When you're powering thousands of developer apps, database downtime isn't an option — PostgresAI's expertise over the years culminated in a flawless zero-downtime Postgres upgrade that kept our platform running seamlessly while we scaled for the future.",
    name: "Harry Brundage",
    title: "Co-founder & CTO",
    company: "Gadget",
    location: "Canada",
  },
  {
    quote: "The PostgresAI team's forensic approach to our database incident provided the technical evidence we needed to gain support and resolution with our infrastructure provider, and their subsequent health check showed valuable insights into our platform's scaling needs.",
    name: "Andrew Gershman",
    title: "Staff SRE",
    company: "Cinder",
    location: "USA",
  },
]

function IndexPage() {
  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { signInUrl } = customFields

  if (typeof signInUrl !== 'string') return null

  return (
    <Layout title={`${SITE_NAME} – ${HOME_SLOGAN}`} description={HOME_DESCRIPTION}>
      <main>
        <Home signInUrl={signInUrl} testimonials={testimonials} />
      </main>
    </Layout>
  )
}

export default IndexPage
