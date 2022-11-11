import React, { useMemo } from 'react'
import classNames from 'classnames'
import Layout from '@theme/Layout'

import { CardInfo } from '../../components/CardInfo'

import styles from './styles.module.css'

const ContactPage: React.FC = () => {
  const contactsItems = useMemo(() => {
    const openLink = (link: string) => window.open(link)

    const showIntercom = () => {
      if (window.Intercom) {
        window.Intercom('show')
      }
    }

    return [
      {
        name: 'Intercom',
        description: 'We’re here to help with any question or installation',
        icon: '/assets/contact/intercom.svg',
        buttonText: 'Chat with us now',
        onButtonClick: showIntercom,
      },
      {
        name: 'Community on Slack',
        description:
          'Join other Database Lab users to get help and latest news',
        icon: '/assets/contact/slack.svg',
        buttonText: 'Join the Community',
        onButtonClick: () => openLink('https://slack.postgres.ai/'),
      },
      {
        name: 'Email',
        description: (
          <>
            For all suggestions, partnerships, use{' '}
            <a className={styles.link} href="mailto:team@postgres.ai">
              team@postgres.ai
            </a>
          </>
        ),
        icon: (
          <div className={styles.groupIconContainer}>
            <img src="/assets/contact/group.svg" alt="Email" />
          </div>
        ),
        buttonText: 'Send a message',
        onButtonClick: () => (window.location.href = 'mailto:team@postgres.ai'),
      },
    ]
  }, [])

  return (
    <Layout title="PostgreSQL Contact us">
      <main className="banner text-center">
        <section
          className={classNames('container padding-vert--xl', styles.container)}
        >
          <div>
            <h1>Contact us</h1>
            <p>Get in touch and let us know how we can help</p>
          </div>
          <div className="row margin-vert--lg">
            {contactsItems.map((item, index) => {
              return (
                <div
                  key={index}
                  className="col-sm-12 col-md-4 px-4 margin-vert--lg"
                >
                  <CardInfo
                    title={item.name}
                    text={item.description}
                    icon={item.icon}
                    buttonText={item.buttonText}
                    onButtonClick={item.onButtonClick}
                  />
                </div>
              )
            })}
          </div>
          <div className="row">
            <div className="col-sm-12 col-md-6 px-4 margin-vert--lg d-flex justify-content-center">
              <div className={styles.footerInfoContainer}>
                <div
                  className={classNames('font-weight-bold', styles.footerTitle)}
                >
                  Found an issue?
                </div>
                <div className={styles.footerText}>
                  Report and get support on{' '}
                  <a
                    href="https://gitlab.com/postgres-ai/database-lab/-/issues"
                    target="_blank"
                    className={styles.link}
                  >
                    GitLab
                  </a>
                  <br />
                  or send an email to{' '}
                  <a href="mailto:support@postgres.ai" className={styles.link}>
                    support@postgres.ai
                  </a>
                </div>
              </div>
            </div>
            <div
              className={classNames(styles.divider, 'd-none', 'd-md-block')}
            />
            <div className="col-sm-12 col-md-6 px-4 margin-vert--lg d-flex justify-content-center">
              <div className={styles.footerInfoContainer}>
                <div
                  className={classNames('font-weight-bold', styles.footerTitle)}
                >
                  Knowledge base
                </div>
                <div className={styles.footerText}>
                  Check the{' '}
                  <a className={styles.link} href="/docs" target="_blank">
                    Documentation section
                  </a>{' '}
                  containing tutorials and how-tos for most popular use cases.
                </div>
                <div className={styles.footerText}>
                  It's a good idea to start with the{' '}
                  <a
                    className={styles.link}
                    href="/docs/questions-and-answers"
                    target="_blank"
                  >
                    Q&A page
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default ContactPage
