const path = require('path')

const URL = !!process.env.URL ? process.env.URL : 'https://v2.postgres.ai/'
const BASE_URL = !!process.env.BASE_URL ? process.env.BASE_URL : '/'
const REPOSITORY_URL = 'https://github.com/postgres-ai/database-lab-engine'
const SIGN_IN_URL = !!process.env.SIGN_IN_URL
  ? process.env.SIGN_IN_URL
  : '/signin'

module.exports = {
  title: 'Database Lab · Instant clones of PostgreSQL databases · Postgres.ai', // Title for your website.
  tagline:
    'Boost your development process eliminating Postgres-related roadblocks in the way of developers, DBAs and QA specialists',
  url: URL, // Your website URL.
  baseUrl: BASE_URL, // Base URL for your project.
  onBrokenLinks: 'log', //'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'postgres-ai',
  projectName: 'docs',

  customFields: {
    signInUrl: SIGN_IN_URL,
  },

  scripts: [
    BASE_URL + 'js/githubButton.js',
    { src: BASE_URL + 'js/cookieBanner.js', async: true, defer: true },
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
    },

    metadata: [
      // This options will overwrite options from pages with the same name/property.
      { 'http-equiv': 'x-dns-prefetch-control', content: 'on' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:site_name', content: 'Postgres.ai' },
      {
        property: 'article:publisher',
        content: 'https://www.linkedin.com/company/postgres-ai/',
      },
      { name: 'twitter:site', content: '@Database_Lab' },
      { name: 'twitter:creator', content: '@Database_Lab' },
    ],

    announcementBar: {
      id: 'advisory_group', // Any value that will identify this message to save the hidden status.
      content:
        "<a href='/blog/20220703-dle-in-aws-marketplace'>Database Lab Engine is now available on AWS Marketplace</a>",
      backgroundColor: '#D7EEF2',
      textColor: '#013A44',
      isCloseable: true,
    },

    navbar: {
      title: 'Postgres.ai',
      logo: {
        alt: 'Database Lab logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'html',
          className: 'github-lg',
          value: `
          <div class="github-container">
             <a class="github-btn" 
                target="blank"
                href=${REPOSITORY_URL}
                aria-label="Star postgres-ai/database-lab-engine on GitHub">
                  <svg viewBox="0 0 16 16" width="14" height="14" class="octicon octicon-mark-github" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                    &nbsp;Star us
              </a>
              <a class="github-star-placeholder" href=${REPOSITORY_URL}/stargazers target="blank" />
            </div>`,
          position: 'left',
        },
        {
          label: 'Product',
          position: 'right',
          to: '/',
          activeBaseRegex: '^/products',
          items: [
            {
              label: 'How It Works',
              to: '/products/how-it-works',
            },
            {
              label: 'Database Migration Testing',
              to: '/products/database-migration-testing',
            },
            {
              label: 'SQL Optimization',
              to: '/products/joe',
            },
            {
              label: 'Realistic Dev & Test Environments',
              to: '/products/realistic-test-environments',
            },
            {
              label: 'Sensitive Data Masking',
              to: '/products/data-masking',
            },
            {
              to: '/resources',
              label: 'Case Studies',
            },
          ],
        },
        {
          to: '/pricing',
          label: 'Pricing',
          position: 'right',
        },
        {
          label: 'Docs',
          to: '/docs',
          activeBaseRegex: '^/docs',
          position: 'right',
          items: [
            {
              label: 'Documentation Home',
              to: '/docs',
              activeBaseRegex: '^/docs',
            },
            {
              label: 'Install DLE using Terraform',
              to: '/docs/how-to-guides/administration/install-database-lab-with-terraform',
            },
            {
              label: 'Getting Started for Amazon RDS',
              to: '/docs/tutorials/database-lab-tutorial-amazon-rds',
            },
            {
              label: 'Database Lab FAQ',
              to: '/docs/questions-and-answers',
            },
          ],
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'right',
        },
        {
          type: 'html',
          className: 'github-sm',
          value: `
          <div class="github-container">
             <a class="github-btn" 
                target="blank"
                href=${REPOSITORY_URL}
                aria-label="Star postgres-ai/database-lab-engine on GitHub">
                  <svg viewBox="0 0 16 16" width="14" height="14" class="octicon octicon-mark-github" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                    &nbsp;Star us
              </a>
              <a class="github-star-placeholder" href=${REPOSITORY_URL}/stargazers target="blank" />
            </div>`,
          position: 'left',
        },
        {
          type: 'html',
          value: `<a href=${SIGN_IN_URL} class="sign-in-button">Sign in</a>`,
          position: 'right',
        },
      ],
    },

    algolia: {
      apiKey: 'b7b181027b0780f2526b7cdf86bb6d24',
      appId: 'X8XMQ9JWX7',
      indexName: 'postgres_algolia',
    },

    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Platform overview',
              to: '/docs/platform',
            },
            {
              label: 'Getting started',
              to: '/docs/',
            },
            {
              label: 'FAQ',
              to: '/docs/questions-and-answers',
            },
            {
              label: 'Guides',
              to: '/docs/guides',
            },
            {
              label: 'API reference',
              to: '/docs/database-lab/api-reference',
            },
            {
              label: 'CLI reference',
              to: '/docs/database-lab/cli-reference',
            },
          ],
        },
        {
          title: 'Products',
          items: [
            {
              label: 'Database Lab Engine',
              to: '/',
            },
            {
              label: 'Joe Bot for SQL Optimization',
              to: '/products/joe',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Community Slack',
              href: 'https://slack.postgres.ai/',
            },
            {
              label: 'GitLab',
              href: 'https://gitlab.com/postgres-ai',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/postgres-ai',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/Database_Lab',
            },
            {
              label: 'YouTube',
              href: 'https://www.youtube.com/channel/UCLSWQVJX_VQ0NVSzN0fZT3A',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/company/postgres-ai',
            },
          ],
        },
        {
          title: 'Links',
          items: [
            {
              label: 'Home',
              to: '/',
            },
            {
              label: 'Contact',
              to: '/contact/',
            },
            {
              label: 'Documentation',
              to: '/docs/',
            },
            {
              label: 'Services',
              to: '/consulting',
            },
            {
              label: 'Case Studies',
              to: '/resources/',
            },
            {
              label: 'Careers',
              to: '/careers/',
            },
            {
              label: 'Sign in',
              href: SIGN_IN_URL,
            },
            {
              label: 'Terms of service',
              to: '/tos/',
            },
            {
              label: 'Privacy policy',
              to: '/privacy/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Postgres.ai`,
    },

    prism: {
      theme: require('prism-react-renderer/themes/nightOwl'),
    },
  },

  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            to: '/docs/roadmap', // string
            from: ['/docs/oldDocPathFrom2019', '/docs/legacyDocPathFrom2016'], // string | string[]
          },
          {
            to: '/docs/reference-guides/database-lab-engine-api-reference',
            from: '/docs/database-lab/api-reference',
          },
          {
            to: '/docs/reference-guides/dblab-client-cli-reference',
            from: '/docs/database-lab/cli-reference',
          },
          {
            to: '/docs/reference-guides/database-lab-engine-components',
            from: '/docs/database-lab/components',
          },
          {
            to: '/docs/reference-guides/database-lab-engine-configuration-reference',
            from: '/docs/database-lab/config-reference',
          },
          {
            to: '/docs/reference-guides/joe-bot-configuration-reference',
            from: '/docs/joe-bot/config-reference',
          },
          {
            to: '/docs/reference-guides/joe-bot-commands-reference',
            from: '/docs/joe-bot/commands-reference',
          },
          {
            to: '/docs/reference-guides/db-migration-checker-configuration-reference',
            from: '/docs/db-migration-checker/config-reference',
          },
          { to: '/docs/how-to-guides', from: '/docs/guides' },
          {
            to: '/docs/how-to-guides/administration',
            from: '/docs/guides/administration',
          },
          {
            to: '/docs/how-to-guides/administration/data',
            from: '/docs/guides/data',
          },
          { to: '/docs/how-to-guides/cli', from: '/docs/guides/cli' },
          { to: '/docs/how-to-guides/cloning', from: '/docs/guides/cloning' },
          { to: '/docs/how-to-guides/joe-bot', from: '/docs/guides/joe-bot' },
          { to: '/docs/how-to-guides/platform', from: '/docs/guides/platform' },
          {
            to: '/docs/how-to-guides/platform/onboarding',
            from: '/docs/tutorials/onboarding',
          },
          {
            to: '/blog/20220106-explain-analyze-needs-buffers-to-improve-the-postgres-query-optimization-process',
            from: '/blog/20220106-explain-analyze-needs-buffers-to-improve-postgres-query-optimization process',
          },
          {
            to: '/contact/',
            from: '/support',
          },
          {
            to: '/careers/dbe',
            from: '/careers/dba',
          },
        ],
      },
    ],
    [
      path.resolve(__dirname, 'plugins/dynamic-routes'),
      {
        // this is the options object passed to the plugin
        routes: [
          {
            // using Route schema from react-router
            path: '/universe',
            exact: false, // this is needed for sub-routes to match!
            component: path.resolve(__dirname, 'src/dynamicPages/universe'),
          },
        ],
      },
    ],
    [
      path.resolve(__dirname, 'plugins/docusaurus-plugin-google-gtm'),
      {
        trackingID: 'GTM-5M85JPS',
      },
    ],
    require.resolve('./plugins/route-change'),
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://gitlab.com/postgres-ai/docs/-/edit/master/',
          routeBasePath: '/docs/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://gitlab.com/postgres-ai/docs/-/edit/master/',
          path: 'blog',
          routeBasePath: 'blog',
          postsPerPage: 10,
          blogSidebarCount: 0, // 0 to disable the sidebar with a list of posts.
          feedOptions: {
            type: 'all',
            title: '', // default to siteConfig.title
            description: '', // default to  `${siteConfig.title} Blog`
            copyright: 'Postgres.ai',
            language: undefined, // possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        pages: {
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/*.test.{js,ts}',
            '**/__tests__/**',
            '**/console',
          ],
        },
      },
    ],
  ],
}
