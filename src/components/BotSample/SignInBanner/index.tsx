import React from 'react'
import styles from './styles.module.css';

export const SignInBanner = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.description}>To access all features, please Sign In or Register</p>
        <a href="/signin" className="btn btn1">Sign In</a>
      </div>
    </div>
  )
}