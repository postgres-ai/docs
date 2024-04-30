const path = require('path')
const { Joi } = require('@docusaurus/utils-validation')

function pluginGoogleGTM(context, options) {
  const { trackingID } = options

  return {
    name: 'docusaurus-plugin-google-gtm',

    async contentLoaded({ actions }) {
      actions.setGlobalData(options)
    },

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            attributes: {
              async: true,
              href: `https://www.googletagmanager.com/gtag/js?id=${trackingID}`,
            },
          },
          {
            tagName: 'script',
            innerHTML: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date()); gtag('config', '${trackingID}');`,
          },
        ],
        preBodyTags: [
          {
            tagName: 'noscript',
            innerHTML: `<iframe src="https://www.googletagmanager.com/gtag/js?id=${trackingID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          },
        ],
      }
    },
  }
}

const pluginOptionsSchema = Joi.object({
  trackingID: Joi.string().required(),
})

pluginGoogleGTM.validateOptions = function ({ validate, options }) {
  return validate(pluginOptionsSchema, options)
}

module.exports = pluginGoogleGTM
