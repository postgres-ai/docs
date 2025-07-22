import React from 'react'

import { ShareLinks } from '@site/src/components/ShareLinks'
import {
  AuthorBanner,
  Props as AuthorBannerProps,
} from '@site/src/components/AuthorBanner'
import { DbLabBanner } from '@site/src/components/DbLabBanner'

type Props = {
  author?: AuthorBannerProps
  authors?: AuthorBannerProps[]
}

export const BlogFooter = (props: Props) => {
  const { author, authors } = props
  
  // Support both single author and multiple authors
  const authorList = authors || (author ? [author] : [])
  
  return (
    <>
      {authorList.map((authorData, index) => (
        <AuthorBanner 
          key={`${authorData.name}-${index}`} 
          {...authorData} 
          anchorId={authorList.length > 1 ? `author-${index + 1}` : 'author'}
        />
      ))}
      <DbLabBanner />
    </>
  )
}
