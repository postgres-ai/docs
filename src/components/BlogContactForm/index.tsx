import React, { useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import styles from './styles.module.css'

type FormData = {
  email: string
  message: string
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export const BlogContactForm = () => {
  const { siteConfig } = useDocusaurusContext();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<FormStatus>('idle')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const response = await fetch(`${siteConfig.customFields.apiUrlPrefix}/rpc/blog_feedback_send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: formData.email,
          message: formData.message,
        }),
      })

      const data = await response.json()

      if (data.success || data?.[0]?.result?.success) {
        setStatus('success')
        setFormData({ email: '', message: '' })
        
      } else {
        setStatus('error')
        console.error('API Error:', data.error || data.message)
      }
    } catch (error) {
      setStatus('error')
      console.error('Network Error:', error)
    }
  }

  const isSubmitting = status === 'submitting'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className={styles.input}
              placeholder="your.email@company.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="message" className={styles.label}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className={styles.textarea}
              placeholder="Tell us about your company and what you expect"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Sending...' : 'Send message'}
          </button>
        </form>

        {isSuccess && (
          <div className={styles.message + ' ' + styles.success}>
            Thank you! We'll get back to you soon.
          </div>
        )}

        {isError && (
          <div className={styles.message + ' ' + styles.error}>
            Something went wrong. Please try again.
          </div>
        )}
      </div>
    </div>
  )
} 