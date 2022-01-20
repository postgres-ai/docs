import useIsBrowser from '@docusaurus/useIsBrowser'

const getFacebookShareUrl = (pageUrl: string) =>
  `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({
    u: pageUrl,
  })}`

const getTwitterShareUrl = (pageUrl: string) =>
  `https://twitter.com/intent/tweet?${new URLSearchParams({
    url: pageUrl,
  })}`

const getLinkedInShareUrl = (pageUrl: string) =>
  `https://www.linkedin.com/shareArticle?${new URLSearchParams({
    mini: 'true',
    url: pageUrl,
  })}`

export const useShareUrls = () => {
  const isBrowser = useIsBrowser()

  if (!isBrowser)
    return {
      facebook: '#',
      twitter: '#',
      linkedIn: '#',
    }

  const pageUrl = window.location.href

  return {
    facebook: getFacebookShareUrl(pageUrl),
    twitter: getTwitterShareUrl(pageUrl),
    linkedIn: getLinkedInShareUrl(pageUrl),
  }
}
