const path = require('path')

// Site-wide constants (single source of truth)
const { SITE_NAME, SITE_SLOGAN } = require('./src/config/site.json')

const URL = !!process.env.URL ? process.env.URL : 'https://v2.postgres.ai/'
const COLOR_MODE = typeof window !== 'undefined' && window.localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
const API_URL_PREFIX = !!process.env.API_URL_PREFIX ? process.env.API_URL_PREFIX : 'https://postgres.ai/api/general' // was: 'https://v2.postgres.ai/api/general/'
const BASE_URL = !!process.env.BASE_URL ? process.env.BASE_URL : '/'
const REPOSITORY_URL = 'https://github.com/postgres-ai/database-lab-engine'
const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID || ''
const UMAMI_SCRIPT_URL = process.env.UMAMI_SCRIPT_URL || ''
const IS_PROD = process.env.NODE_ENV === 'production'

const scripts = [
  BASE_URL + 'js/githubButton.js',
  BASE_URL + 'js/trackingCapture.js',
]

if (IS_PROD && UMAMI_WEBSITE_ID && UMAMI_SCRIPT_URL) {
  scripts.push({
    src: UMAMI_SCRIPT_URL,
    async: true,
    'data-website-id': UMAMI_WEBSITE_ID,
  })
}
const SIGN_IN_URL = !!process.env.SIGN_IN_URL
  ? process.env.SIGN_IN_URL
  : '/signin'
const BOT_WS_URL = !!process.env.BOT_WS_URL ? process.env.BOT_WS_URL : '/ai-bot-ws/'
const CONSULTING_WEBHOOK = process.env.CONSULTING_WEBHOOK ? process.env.CONSULTING_WEBHOOK : ''

module.exports = {
  title: SITE_NAME,
  tagline: SITE_SLOGAN,
  url: URL, // Your website URL.
  baseUrl: BASE_URL, // Base URL for your project.
  onBrokenLinks: 'warn', //'throw',
  favicon: '/favicon.svg',
  organizationName: 'postgres-ai',
  projectName: 'docs',

  // Treat all .md files as MDX for easier reviewing
  // Files with <placeholder> text need HTML entities: &lt;placeholder&gt;
  markdown: {
    format: 'mdx',
  },

  customFields: {
    signInUrl: SIGN_IN_URL,
    apiUrlPrefix: API_URL_PREFIX,
    botWSUrl: BOT_WS_URL,
    consultingWebhook: CONSULTING_WEBHOOK,
    umamiWebsiteId: UMAMI_WEBSITE_ID,
    umamiScriptUrl: UMAMI_SCRIPT_URL,
  },

  scripts,

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon-96x96.png',
        sizes: '96x96',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'shortcut icon',
        href: '/favicon.ico',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'apple-mobile-web-app-title',
        content: SITE_NAME,
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'manifest',
        href: '/site.webmanifest',
      },
    },
  ],

  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
    },

    metadata: [
      // This options will overwrite options from pages with the same name/property.
      { 'http-equiv': 'x-dns-prefetch-control', content: 'on' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:image', content: `${URL}/img/og-image.png` },
      {
        property: 'article:publisher',
        content: 'https://www.linkedin.com/company/postgres-ai/',
      },
      { name: 'twitter:site', content: '@Database_Lab' },
      { name: 'twitter:creator', content: '@Database_Lab' },
      { name: 'twitter:image', content: `${URL}/img/og-image.png` },
      { name: 'twitter:card', content: 'summary_large_image' }
    ],

    announcementBar: {
      id: 'postgres_marathon_banner', // Any value that will identify this message to save the hidden status.
      content:
        "<a href='/blog/tags/postgres-marathon'>#PostgresMarathon is live: deep-dive technical insights</a>",
      backgroundColor: '#D7EEF2',
      textColor: '#013A44',
      isCloseable: true,
    },

    navbar: {
        title: SITE_NAME,
      logo: {
        alt: 'PostgresAI logo',
        src: 'img/logo.svg',
        width: '32px',
        height: '32px',
      },
      items: [
        {
          label: 'Products',
          position: 'right',
          to: '/',
          activeBaseRegex: '^/products',
          items: [
            {
              label: 'postgres_ai (monitoring)',
              to: '/docs/monitoring'
            },
            {
              label: 'DBLab Engine',
              to: '/products/dblab_engine'
            },
            {
              label: 'Zero-downtime upgrades',
              to: '/products/postgres-ai-zdu'
            },
            {
              label: 'PostgresAI Assistant',
              to: '/blog/20240127-postgres-ai-bot',
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
              label: 'Documentation home',
              to: '/docs',
              activeBaseRegex: '^/docs',
            },
            {
              label: 'DBLab for Amazon RDS',
              to: '/docs/tutorials/database-lab-tutorial-amazon-rds',
            },
            {
              label: 'DBLab how-tos',
              to: '/docs/dblab-howtos',
            },
            {
              label: 'Questions & answers',
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
          to: '/consulting',
          label: 'Consulting',
          position: 'right',
        },
        {
          type: 'html',
          className: 'menu__list-item--sign-in-button',
          value: `<a href=${SIGN_IN_URL} class="start-free-button">Start free</a>`,
          position: 'right',
        },
        {
          type: 'html',
          className: 'menu__list-item--sign-in-button',
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
      logo: {
        alt: 'PostgresAI logo',
        src: 'img/logo.svg',
        width: '64px',
        height: '64px',
      },
      links: [
        {
          items: [
            {
              html: `
                <iframe 
                src=https://postgresai.instatus.com/embed-status/2c18fe48/${COLOR_MODE}-sm 
                width="230" 
                height="61" 
                frameBorder="0" 
                scrolling="no" 
                class="footer-status-iframe"
              >
              </iframe>            
                `,
            },
          ],
        },
        {
          title: 'DOCS',
          items: [
            {
              label: 'Questions & answers',
              to: '/docs/questions-and-answers',
            },
            {
              label: 'Getting started',
              to: '/docs/',
            },
            {
              label: 'PostgresAI Assistant',
              to: '/docs/reference-guides/postgres-ai-bot-reference',
            },
            {
              label: 'DBLab docs',
              to: '/docs/database-lab',
            },
            {
              label: 'AI rules',
              to: '/rules',
            },
          ],
        },
        {
          title: 'PRODUCTS',
          items: [
            {
              label: 'PostgresAI Console',
              href: SIGN_IN_URL,
            },
            {
              label: 'postgres_ai (monitoring)',
              to: '/docs/monitoring',
            },
            {
              label: 'DBLab Engine',
              to: '/docs/database-lab',
            },
            {
              label: 'Zero-downtime upgrades',
              to: '/products/postgres-ai-zdu',
            },
            {
              label: 'PostgresAI assistant',
              to: '/blog/20240127-postgres-ai-bot',
            },
            {
              label: 'Joe bot for SQL optimization',
              to: '/products/joe',
            },
            {
              label: 'Pricing',
              to: '/pricing',
            },
          ],
        },
        {
          title: 'SOCIAL',
          items: [
            {
              label: 'Community Slack',
              href: 'https://slack.postgres.ai/',
            },
            {
              label: 'Postgres.TV (YouTube)',
              href: 'https://www.youtube.com/PostgresTV',
            },
            {
              label: 'Postgres FM (podcast)',
              href: 'https://postgres.fm',
            },
            {
              label: 'Twitter @postgres_ai',
              href: 'https://twitter.com/postgres_ai',
            },
            {
              label: 'Twitter @Database_Lab',
              href: 'https://twitter.com/Database_Lab',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/company/postgres-ai',
            },
          ],
        },
        {
          title: 'LINKS',
          items: [
            {
              label: 'GitLab',
              href: 'https://gitlab.com/postgres-ai',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/postgres-ai',
            },
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Case studies',
              to: '/resources/',
            },
            {
              label: 'Terms of service',
              to: '/tos/',
            },
            {
              label: 'Privacy policy',
              to: '/privacy/',
            },
            {
              label: 'Contact us',
              to: '/contact/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ${SITE_NAME}`,
    },

    prism: {
      theme: require('prism-react-renderer').themes.nightOwlLight,
      darkTheme: require('prism-react-renderer').themes.nightOwl,
    },
  },

  clientModules: [],
  
  plugins: [
    // Fix cytoscape module resolution for mermaid
    function () {
      return {
        name: 'webpack-cytoscape-fix',
        configureWebpack() {
          return {
            resolve: {
              alias: {
                'cytoscape/dist/cytoscape.umd.js': require.resolve('cytoscape'),
              },
            },
          };
        },
      };
    },
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
          // Blog post URL improvements
          { from: '/blog/20251105-postgres-marathon-2-012', to: '/blog/20251105-postgres-marathon-2-012-ultra-fast-replica-creation-pgbackrest' },

          // PostgresAI how-tos redirects (moved from monitoring and platform)
          { from: '/docs/monitoring/how-to-install', to: '/docs/postgresai-howtos/install-postgres-ai-monitoring-from-postgresai-console' },
          { from: '/docs/monitoring/administration/how-to-install', to: '/docs/postgresai-howtos/install-postgres-ai-monitoring-from-postgresai-console' },
          { from: '/docs/monitoring/administration/install-postgres-ai-monitoring-from-postgresai-console', to: '/docs/postgresai-howtos/install-postgres-ai-monitoring-from-postgresai-console' },
          { from: '/docs/monitoring/cli/postgresai-cli', to: '/docs/postgresai-howtos/postgresai-cli' },
          { from: '/docs/platform/how-to-install-mcp', to: '/docs/postgresai-howtos/how-to-install-mcp' },
          { from: '/docs/platform/how-to-work-with-issues', to: '/docs/postgresai-howtos/how-to-work-with-issues' },

          // DBLab how-tos redirects (moved from /docs/how-to-guides to /docs/dblab-howtos)
          { from: '/docs/how-to-guides', to: '/docs/dblab-howtos' },
          
          // Administration redirects
          { from: '/docs/how-to-guides/administration', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/administration/index', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/administration/add-disk-space-to-zfs-pool', to: '/docs/dblab-howtos/administration/add-disk-space-to-zfs-pool' },
          { from: '/docs/how-to-guides/administration/ci-observer-postgres-log-masking', to: '/docs/dblab-howtos/administration/ci-observer-postgres-log-masking' },
          { from: '/docs/how-to-guides/administration/engine-manage', to: '/docs/dblab-howtos/administration/engine-manage' },
          { from: '/docs/how-to-guides/administration/engine-secure', to: '/docs/dblab-howtos/administration/engine-secure' },
          { from: '/docs/how-to-guides/administration/install-database-lab-with-terraform', to: '/docs/dblab-howtos/administration/install-database-lab-with-terraform' },
          { from: '/docs/how-to-guides/administration/install-dle-from-aws-marketplace', to: '/docs/dblab-howtos/administration/install-dle-from-aws-marketplace' },
          { from: '/docs/how-to-guides/administration/install-dle-from-postgres-ai', to: '/docs/dblab-howtos/administration/install-dle-from-postgres-ai' },
          { from: '/docs/how-to-guides/administration/install-dle-manually', to: '/docs/dblab-howtos/administration/install-dle-manually' },
          { from: '/docs/how-to-guides/administration/joe-manage', to: '/docs/dblab-howtos/administration/joe-manage' },
          { from: '/docs/how-to-guides/administration/logical-full-refresh', to: '/docs/dblab-howtos/administration/logical-full-refresh' },
          { from: '/docs/how-to-guides/administration/postgresql-configuration', to: '/docs/dblab-howtos/administration/postgresql-configuration' },
          { from: '/docs/how-to-guides/administration/run-database-lab-on-mac', to: '/docs/dblab-howtos/administration/run-database-lab-on-mac' },
          
          // Data sources redirects
          { from: '/docs/how-to-guides/administration/data', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/administration/data/index', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/administration/data/custom', to: '/docs/dblab-howtos/administration/data/custom' },
          { from: '/docs/how-to-guides/administration/data/dump', to: '/docs/dblab-howtos/administration/data/dump' },
          { from: '/docs/how-to-guides/administration/data/pg_basebackup', to: '/docs/dblab-howtos/administration/data/pg_basebackup' },
          { from: '/docs/how-to-guides/administration/data/pgbackrest', to: '/docs/dblab-howtos/administration/data/pgbackrest' },
          { from: '/docs/how-to-guides/administration/data/rds', to: '/docs/dblab-howtos/administration/data/rds' },
          { from: '/docs/how-to-guides/administration/data/rsync', to: '/docs/dblab-howtos/administration/data/rsync' },
          { from: '/docs/how-to-guides/administration/data/wal-g', to: '/docs/dblab-howtos/administration/data/wal-g' },
          
          // CLI redirects
          { from: '/docs/how-to-guides/cli', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/cli/index', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/cli/cli-install-init', to: '/docs/dblab-howtos/cli/cli-install-init' },
          
          // Cloning redirects
          { from: '/docs/how-to-guides/cloning', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/cloning/index', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/cloning/clone-protection', to: '/docs/dblab-howtos/cloning/clone-protection' },
          { from: '/docs/how-to-guides/cloning/clone-upgrade', to: '/docs/dblab-howtos/cloning/clone-upgrade' },
          { from: '/docs/how-to-guides/cloning/connect-clone', to: '/docs/dblab-howtos/cloning/connect-clone' },
          { from: '/docs/how-to-guides/cloning/create-clone', to: '/docs/dblab-howtos/cloning/create-clone' },
          { from: '/docs/how-to-guides/cloning/destroy-clone', to: '/docs/dblab-howtos/cloning/destroy-clone' },
          { from: '/docs/how-to-guides/cloning/reset-clone', to: '/docs/dblab-howtos/cloning/reset-clone' },
          
          // Branching redirects
          { from: '/docs/how-to-guides/branching', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/branching/index', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/branching/create-branch', to: '/docs/dblab-howtos/branching/create-branch' },
          { from: '/docs/how-to-guides/branching/delete-branch', to: '/docs/dblab-howtos/branching/delete-branch' },
          
          // Snapshots redirects
          { from: '/docs/how-to-guides/snapshots', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/snapshots/index', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/snapshots/create-snapshot', to: '/docs/dblab-howtos/snapshots/create-snapshot' },
          { from: '/docs/how-to-guides/snapshots/delete-snapshot', to: '/docs/dblab-howtos/snapshots/delete-snapshot' },
          
          // Joe Bot redirects
          { from: '/docs/how-to-guides/joe-bot', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/joe-bot/index', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/joe-bot/count-rows', to: '/docs/dblab-howtos/joe-bot/count-rows' },
          { from: '/docs/how-to-guides/joe-bot/create-index', to: '/docs/dblab-howtos/joe-bot/create-index' },
          { from: '/docs/how-to-guides/joe-bot/get-database-table-index-size', to: '/docs/dblab-howtos/joe-bot/get-database-table-index-size' },
          { from: '/docs/how-to-guides/joe-bot/get-query-plan', to: '/docs/dblab-howtos/joe-bot/get-query-plan' },
          { from: '/docs/how-to-guides/joe-bot/query-activity-and-termination', to: '/docs/dblab-howtos/joe-bot/query-activity-and-termination' },
          { from: '/docs/how-to-guides/joe-bot/reset-session', to: '/docs/dblab-howtos/joe-bot/reset-session' },
          { from: '/docs/how-to-guides/joe-bot/sql-optimization-history', to: '/docs/dblab-howtos/joe-bot/sql-optimization-history' },
          { from: '/docs/how-to-guides/joe-bot/visualize-query-plan', to: '/docs/dblab-howtos/joe-bot/visualize-query-plan' },
          
          // Platform redirects
          { from: '/docs/how-to-guides/platform', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/platform/index', to: '/docs/dblab-howtos' },
          { from: '/docs/how-to-guides/platform/audit-logs', to: '/docs/dblab-howtos/platform/audit-logs' },
          { from: '/docs/how-to-guides/platform/onboarding', to: '/docs/dblab-howtos/platform/onboarding' },
          { from: '/docs/how-to-guides/platform/start-using-platform', to: '/docs/dblab-howtos/platform/start-using-platform' },
          { from: '/docs/how-to-guides/platform/tokens', to: '/docs/dblab-howtos/platform/tokens' },
          
          // Existing redirects
          {
            to: '/docs/reference-guides/database-lab-engine-api-reference',
            from: '/docs/database-lab/api-reference',
          },
          {
            from: '/docs/database-lab/cli-reference',
            to: '/docs/reference-guides/dblab-client-cli-reference'
          },
          {
            from: '/docs/database-lab/components',
            to: '/docs/reference-guides/database-lab-engine-components'
          },
          {
            from: '/docs/database-lab/config-reference',
            to: '/docs/reference-guides/database-lab-engine-configuration-reference'
          },
          {
            from: '/docs/joe-bot/config-reference',
            to: '/docs/reference-guides/joe-bot-configuration-reference'
          },
          {
            from: '/docs/joe-bot/commands-reference',
            to: '/docs/reference-guides/joe-bot-commands-reference'
          },
          {
            from: '/docs/db-migration-checker/config-reference',
            to: '/docs/reference-guides/db-migration-checker-configuration-reference'
          },
          {
            to: '/blog/20220106-explain-analyze-needs-buffers-to-improve-the-postgres-query-optimization-process',
            from: '/blog/20220106-explain-analyze-needs-buffers-to-improve-postgres-query-optimization process',
          },
          { to: '/docs/dblab-howtos', from: '/docs/guides' },
          { from: '/docs/guides/administration', to: '/docs/dblab-howtos' },
          { from: '/docs/guides/data', to: '/docs/dblab-howtos' },
          { from: '/docs/guides/cli', to: '/docs/dblab-howtos' },
          { from: '/docs/guides/cloning', to: '/docs/dblab-howtos' },
          { from: '/docs/guides/joe-bot', to: '/docs/dblab-howtos' },
          { from: '/docs/guides/platform', to: '/docs/dblab-howtos' },
          { from: '/docs/tutorials/onboarding', to: '/docs/dblab-howtos/platform/onboarding' },
          { from: '/support', to: '/contact/' },
          { from: '/careers/dba', to: '/careers/dbe' },
          {
            from: '/docs/how-to-guides/administration/machine-setup',
            to: '/docs/dblab-howtos/administration/install-dle-manually' 
          },
          {
            from: '/blog/20240127-postges-ai-bot',
            to: '/blog/20240127-postgres-ai-bot' 
          },
          {
            from: '/docs/db-migration-checker',
            to: '/docs/database-lab/db-migration-checker'
          },
          {
            from: '/blog/20250725-selft-driving-postgres',
            to: '/blog/20250725-self-driving-postgres'
          }
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
          {
            path: '/chats/:chatId',
            exact: false,
            component: path.resolve(__dirname, 'src/dynamicPages/chats'),
          },

        ],
      },
    ],
    // Google Tag Manager disabled
    // Meta Pixel (Facebook) disabled
    path.resolve(__dirname, 'plugins/route-change'),
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://gitlab.com/postgres-ai/docs/-/edit/master/',
          routeBasePath: '/docs/',
          sidebarCollapsible: true,
          sidebarCollapsed: true,
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://gitlab.com/postgres-ai/docs/-/edit/master/',
          path: 'blog',
          onInlineTags: 'ignore',
          routeBasePath: 'blog',
          postsPerPage: 10,
          blogSidebarTitle: 'Categories',
          blogSidebarCount: 1, // Disable posts list in sidebar
          blogTagsListComponent: '@theme/BlogTagsListPage',
          blogTagsPostsComponent: '@theme/BlogTagsPostsPage',
          feedOptions: {
            type: 'all',
            title: '', // default to siteConfig.title
            description: '', // default to  `${siteConfig.title} Blog`
            copyright: SITE_NAME,
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

