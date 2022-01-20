import React from 'react'

import { ShareLinks } from '@site/src/components/ShareLinks'
import {
  AuthorBanner,
  Props as AuthorBannerProps,
} from '@site/src/components/AuthorBanner'
import { DbLabBanner } from '@site/src/components/DbLabBanner'

type Props = {
  author: AuthorBannerProps
}

export const BlogFooter = (props: Props) => {
  return (
    <>
      <ShareLinks />
      <AuthorBanner {...props.author} />
      <DbLabBanner />
    </>
  )
}
