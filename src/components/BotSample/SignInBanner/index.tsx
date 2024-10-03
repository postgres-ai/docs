import React from 'react'
import styles from './styles.module.css';
import { setCookie } from '@site/src/components/BotSample/utils'

type SignInBannerProps = {
  saveConversationIdOnSignInClick?: boolean
  threadId?: string | null
}

export const SignInBanner = (props: SignInBannerProps) => {
  const { saveConversationIdOnSignInClick, threadId } = props;

  const onSignInClick = () => {
    const duration = 60 * 60 * 1000;
    setCookie('pgai_tmp_thread_id', threadId, duration)
    window.open("/signin", "_blank")
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.description}>To continue, please Sign In or Register</p>
        {saveConversationIdOnSignInClick && threadId
          ? <button onClick={onSignInClick} className="btn btn1">Sign In</button>
          : <a href="/signin" className="btn btn1">Sign In</a>
        }
      </div>
    </div>
  )
}