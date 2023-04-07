import React from 'react'

type Props = {
  href: string
  className?: string
  children?: React.ReactNode
  label: string
}

export const GatewayLink = (props: Props) => {
  return (
    <a
      href={props.href}
      className={props.className}
      aria-label={props.label}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  )
}
