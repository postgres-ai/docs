import React from 'react'

type Props = {
  href: string
  className?: string
  children?: React.ReactNode
}

export const GatewayLink = (props: Props) => {
  return (
    <a
      href={props.href}
      className={props.className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  )
}
