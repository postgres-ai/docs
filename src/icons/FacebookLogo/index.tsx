import React from 'react'

type Props = React.SVGProps<SVGSVGElement>

export const FacebookLogo = (props: Props) => {
  return (
    <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M15 0c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C0 6.716 6.716 0 15 0Zm2.3 6.1c-2.4 0-4.1 1.5-4.1 4.2v2.3h-2.7v3.2h2.7v8.1h3.2v-8.1h2.7l.4-3.2h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V6.2c-.3 0-1.3-.1-2.4-.1Z"
        fill="currentColor"
        fill-rule="nonzero"
      />
    </svg>
  )
}
