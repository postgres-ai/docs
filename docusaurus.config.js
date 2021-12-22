const path = require('path')

const URL = (!!process.env.URL ? process.env.URL : 'https://v2.postgres.ai/');
const BASE_URL = (!!process.env.BASE_URL ? process.env.BASE_URL : '/');
const SIGN_IN_URL = (!!process.env.SIGN_IN_URL ? process.env.SIGN_IN_URL : '/signin');

module.exports = {
  title: 'Database Lab · Instant clones of PostgreSQL databases · Postgres.ai', // Title for your website.
  tagline: 'Boost your development process eliminating Postgres-related roadblocks in the way of developers, DBAs and QA specialists',
  url: URL, // Your website URL.
  baseUrl: BASE_URL, // Base URL for your project.
  onBrokenLinks: 'log', //'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'postgres-ai',
  projectName: 'docs',

  customFields: {
    signInUrl: SIGN_IN_URL,
  },

  // TODO (anatoly): @docusaurus/plugin-google-gtag doesn't seem to work now, refactor when fixed.
  scripts: [
    BASE_URL + 'js/gtag.js',
    {src: BASE_URL + 'js/cookieBanner.js', async: true, defer: true},
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
    },

    metadatas: [
      // This options will overwrite options from pages with the same name/property.
      { name: 'description', content: 'Accelerate your development and testing. Clone PostgreSQL databases of any size in a few seconds. Rapidly test and iterate, optimize SQL, improve quality, and drastically boost time-to-market.' },
      { 'http-equiv': 'x-dns-prefetch-control', content: 'on' },
      { name: 'twitter:card', content: 'summary' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:site_name', content: 'Postgres.ai' },
      { property: 'article:publisher', content: 'https://www.linkedin.com/company/postgres-ai/' },
      { property: 'og:image', content: 'https://postgres.ai/assets/thumbnails/dblab_800_606.png' },
      { property: 'og:image:secure_url', content: 'https://postgres.ai/assets/thumbnails/dblab_800_606.png' },
      { property: 'og:image:width', content: '800' },
      { property: 'og:image:height', content: '606' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:description', content: 'Accelerate your development and testing. Clone PostgreSQL databases of any size in a few seconds. Rapidly test and iterate, optimize SQL, improve quality, and drastically boost time-to-market.' },
      { name: 'twitter:title', content: 'Database Lab by Postgres.ai' },
      { name: 'twitter:site', content: '@Database_Lab' },
      { name: 'twitter:image', content: 'https://postgres.ai/assets/thumbnails/dblab_800_606.png' },
      { name: 'twitter:creator', content: '@Database_Lab' },
    ],

    announcementBar: {
      id: 'advisory_group', // Any value that will identify this message to save the hidden status.
      content: '<a href=\'/blog/20211221-dle-3-0-0-brings-ui-and-persistent-clones\'>Database Lab Engine 3.0 released!</a>',
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
              label: 'Case Studies'
            },
          ],
        },
        {
          to: '/pricing',
          label: 'Pricing',
          position: 'right',
        },
        {
          label: 'Documentation',
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
              to: '/docs/questions-and-answers'
            }
          ]
        },
        {
          to: '/consulting',
          label: 'Services',
          position: 'right',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'right',
        },
        {
          href: SIGN_IN_URL,
          label: 'Sign in',
          position: 'right',
        },
      ],
    },

    algolia: {
      apiKey: 'f1629fe022fbd1e746f284eb138edd19',
      indexName: 'postgres',
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
            }
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
          { to: '/docs/reference-guides/database-lab-engine-api-reference', from: '/docs/database-lab/api-reference' },
          { to: '/docs/reference-guides/dblab-client-cli-reference', from: '/docs/database-lab/cli-reference' },
          { to: '/docs/reference-guides/database-lab-engine-components', from: '/docs/database-lab/components' },
          { to: '/docs/reference-guides/database-lab-engine-configuration-reference', from: '/docs/database-lab/config-reference' },
          { to: '/docs/reference-guides/joe-bot-configuration-reference', from: '/docs/joe-bot/config-reference' },
          { to: '/docs/reference-guides/joe-bot-commands-reference', from: '/docs/joe-bot/commands-reference' },
          { to: '/docs/reference-guides/db-migration-checker-configuration-reference', from: '/docs/db-migration-checker/config-reference' },
          { to: '/docs/how-to-guides', from: '/docs/guides' },
          { to: '/docs/how-to-guides/administration', from: '/docs/guides/administration' },
          { to: '/docs/how-to-guides/administration/data', from: '/docs/guides/data' },
          { to: '/docs/how-to-guides/cli', from: '/docs/guides/cli' },
          { to: '/docs/how-to-guides/cloning', from: '/docs/guides/cloning' },
          { to: '/docs/how-to-guides/joe-bot', from: '/docs/guides/joe-bot' },
          { to: '/docs/how-to-guides/platform', from: '/docs/guides/platform' },
          { to: '/docs/how-to-guides/platform/onboarding', from: '/docs/tutorials/onboarding'},
        ],
      },
    ],
    [
      path.resolve(__dirname, 'plugin-dynamic-routes'),
      { // this is the options object passed to the plugin
          routes: [
              { // using Route schema from react-router
                  path: '/universe',
                  exact: false, // this is needed for sub-routes to match!
                  component: path.resolve(__dirname, 'src/dynamicPages/universe')
              }
          ]
      }
  ],
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
};
