/**
 * Docusaurus plugin to inject Meta Pixel (Facebook) across all pages
 */

function metaPixelPlugin() {
  return {
    name: 'meta-pixel',
    injectHtmlTags() {
      const initScript = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?\n n.callMethod.apply(n,arguments):n.queue.push(arguments)};\n if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\n n.queue=[];t=b.createElement(e);t.async=!0;\n t.src=v;s=b.getElementsByTagName(e)[0];\n s.parentNode.insertBefore(t,s)}(window, document,'script',\n 'https://connect.facebook.net/en_US/fbevents.js');\n fbq('init', '1552857229428488');\n fbq('track', 'PageView');`;

      const noscriptImg = '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1552857229428488&ev=PageView&noscript=1"/>'

      return {
        headTags: [
          {
            tagName: 'script',
            innerHTML: initScript,
          },
        ],
        postBodyTags: [
          {
            tagName: 'noscript',
            innerHTML: noscriptImg,
          },
        ],
      }
    },
  }
}

module.exports = metaPixelPlugin


