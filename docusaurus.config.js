const URL = (!!process.env.URL ? process.env.URL : 'https://v2.postgres.ai/');
const BASE_URL = (!!process.env.BASE_URL ? process.env.BASE_URL : '/');
const SIGN_IN_URL = (!!process.env.SIGN_IN_URL ? process.env.SIGN_IN_URL : '/signin');

module.exports = {
  title: 'Database Lab · Fast clones of PostgreSQL databases · Postgres.ai', // Title for your website.
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
    {
      src: '//js.hs-scripts.com/8531691.js',
      async: true,
      id: 'hs-script-loader',
      defer: true,
    },
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
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

    /*announcementBar: {
      id: 'support_us_star', // Any value that will identify this message to save the hidden status.
      content:
        '⭐ If you like Database Lab, give it a star on <a target="_blank" href="https://gitlab.com/postgres-ai/database-lab">GitLab</a> ⭐',
      backgroundColor: '#FFE3C7',
      textColor: '#000',
      isCloseable: true,
    },*/

    navbar: {
      title: 'Postgres.ai',
      logo: {
        alt: 'Database Lab logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          label: 'Products',
          position: 'right',
          items: [
            {
              label: 'Database Lab Engine',
              to: '/',
              activeBasePath: 'not-existing-123', // Intentionally disable highlighting for this item.
            },
            {
              label: 'Joe Bot for SQL Optimization',
              to: '/products/joe',
            },
            {
              label: 'Postgres-checkup',
              to: '/products/postgres-checkup',
            },
          ],
        },
        {
          to: '/consulting',
          label: 'Consulting',
          position: 'right',
        },
        {
          to: '/resources',
          label: 'Resources',
          position: 'right',
        },
        {
          to: '/docs',
          label: 'Docs',
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
              label: 'Q&A',
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
            {
              label: 'Postgres-checkup',
              to: '/products/postgres-checkup',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Community Slack',
              href: 'https://database-lab-team-slack-invite.herokuapp.com',
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
              label: 'Docs',
              to: '/docs/',
            },
            {
              label: 'Resources',
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
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://gitlab.com/postgres-ai/docs/-/edit/master/',
          routeBasePath: '/docs/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
          path: 'blog',
          routeBasePath: 'blog',
          postsPerPage: 3,
          feedOptions: {
            type: 'all', // required. 'rss' | 'feed' | 'all'
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
