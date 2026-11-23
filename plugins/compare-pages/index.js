// Builds /compare and one page per file in src/data/compare/pages, and writes
// a markdown twin of each page under /raw/compare/.
//
// The data is validated when it is loaded (see ./load.js), so a page with an
// uncited row, a missing row or opinion wording stops the build.

const fs = require('fs')
const path = require('path')

const { loadCompare, DATA_DIR } = require('./load')
const { buildPageView, buildIndexView, pagePath, markdownPath, INDEX_PATH } = require('./view')
const { renderPage } = require('./markdown')

module.exports = function comparePagesPlugin(context) {
  const { siteDir, siteConfig } = context
  const siteUrl = siteConfig.url.replace(/\/+$/, '')

  return {
    name: 'compare-pages',

    getPathsToWatch() {
      return [path.join(DATA_DIR, '**/*.json')]
    },

    async loadContent() {
      return loadCompare()
    },

    async contentLoaded({ content, actions }) {
      const { us, pages } = content
      const { addRoute, createData } = actions

      for (const page of pages) {
        const view = buildPageView(page, us, pages)
        addRoute({
          path: pagePath(page),
          exact: true,
          component: path.join(siteDir, 'src/components/Compare/ComparePage.tsx'),
          modules: { view: await createData(`${page.slug}.json`, JSON.stringify(view)) },
        })
      }

      addRoute({
        path: INDEX_PATH,
        exact: true,
        component: path.join(siteDir, 'src/components/Compare/CompareIndex.tsx'),
        modules: { view: await createData('index.json', JSON.stringify(buildIndexView(us, pages))) },
      })
    },

    async postBuild({ outDir, content }) {
      const { us, pages } = content
      for (const page of pages) {
        const file = path.join(outDir, markdownPath(page))
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, renderPage(buildPageView(page, us, pages), siteUrl))
      }
    },
  }
}
