const path = require('path')

const URL = !!process.env.URL ? process.env.URL : 'https://v2.postgres.ai/'
const COLOR_MODE = typeof window !== 'undefined' && window.localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
const API_URL_PREFIX = !!process.env.API_URL_PREFIX ? process.env.API_URL_PREFIX : 'https://postgres.ai/api/general' // was: 'https://v2.postgres.ai/api/general/'
const BASE_URL = !!process.env.BASE_URL ? process.env.BASE_URL : '/'
const REPOSITORY_URL = 'https://github.com/postgres-ai/database-lab-engine'
const SIGN_IN_URL = !!process.env.SIGN_IN_URL
  ? process.env.SIGN_IN_URL
  : '/signin'
const BOT_WS_URL = !!process.env.BOT_WS_URL ? process.env.BOT_WS_URL : '/ai-bot-ws/'

module.exports = {
  title:
    'PostgresAI', // Title for your website.
  tagline:
    'Branching 🖖 and thin cloning ⚡️ for any Postgres database. Empower database testing in CI/CD. Optimize DB-related costs while improving time-to-market and software quality.',
  url: URL, // Your website URL.
  baseUrl: BASE_URL, // Base URL for your project.
  onBrokenLinks: 'log', //'throw',
  favicon: 'img/favicon.svg',
  organizationName: 'postgres-ai',
  projectName: 'docs',

  customFields: {
    signInUrl: SIGN_IN_URL,
    apiUrlPrefix: API_URL_PREFIX,
    botWSUrl: BOT_WS_URL
  },

  scripts: [
    BASE_URL + 'js/githubButton.js',
    { src: BASE_URL + 'js/cookieBanner.js?v3', async: true, defer: true },
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
      { property: 'og:site_name', content: 'PostgresAI' },
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
      id: 'launch_week_banner', // Any value that will identify this message to save the hidden status.
      content:
        "<a href='/launch-week'>✨ Our very first Launch Week - July 21-25</a>",
      backgroundColor: '#D7EEF2',
      textColor: '#013A44',
      isCloseable: true,
    },

    navbar: {
                title: 'PostgresAI',
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
              to: '/products/postgres-ai-monitoring'
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
          label: 'DBLab Pricing',
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
          label: 'Postgres how-tos',
          to: '/docs/postgres-howtos',
          position: 'right',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'right',
        },
        {
          type: 'html',
          className: 'menu__list-item--sign-in-button',
          value: `<a href="/consulting" class="consulting-button">Consulting</a>`,
          position: 'right',
        },
        {
          type: 'html',
          className: 'menu__list-item--sign-in-button',
          value: `<a href=${SIGN_IN_URL} class="console-button">Console</a>`,
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
        alt: 'Database Lab logo',
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
          title: 'Docs',
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
              label: 'DBLab how-tos',
              to: '/docs/dblab-howtos',
            },
            {
              label: 'DBLab API',
              to: '/docs/reference-guides/database-lab-engine-api-reference',
            },
            {
              label: 'DBLab CLI',
              to: '/docs/reference-guides/dblab-client-cli-reference',
            },
            {
              label: 'DBLab config',
              to: '/docs/reference-guides/database-lab-engine-configuration-reference',
            },
            {
              label: 'AI rules',
              to: '/rules',
            },
          ],
        },
        {
          title: 'Products & Services',
          items: [
            {
              label: 'Consulting',
              to: '/consulting',
            },
            {
              label: 'postgres_ai (monitoring)',
              to: '/products/postgres-ai-monitoring',
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
              label: 'Joe bot for SQL Optimization',
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
              label: 'Postgres.TV (YouTube)',
              href: 'https://www.youtube.com/PostgresTV',
            },
            {
              label: 'Postgres FM (podcast)',
              href: 'https://postgres.fm',
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
          title: 'Links',
          items: [
            {
              label: 'Home',
              to: '/',
            },
            {
              label: 'Sign in',
              href: SIGN_IN_URL,
            },
            {
              label: 'Contact us',
              to: '/contact/',
            },
            {
              label: 'Documentation',
              to: '/docs/',
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
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} PostgresAI`,
    },

    prism: {
      theme: require('prism-react-renderer/themes/nightOwlLight'),
      darkTheme: require('prism-react-renderer/themes/nightOwl'),
    },
  },

  clientModules: [],
  
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
    [
      path.resolve(__dirname, 'plugins/docusaurus-plugin-google-gtm'),
      {
        trackingID: 'G-SM4CXEQJYY',
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
          sidebarCollapsible: true,
          sidebarCollapsed: true,
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
            copyright: 'PostgresAI',
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

