const URL = (!!process.env.URL ? process.env.URL : 'https://postgres.ai/');
const BASE_URL = (!!process.env.BASE_URL ? process.env.BASE_URL : '/docs/');

module.exports = {
  title: 'Database Lab Docs · Fast clones of PostgreSQL databases · Postgres.ai', // Title for your website.
  tagline: 'Boost your development process eliminating Postgres-related roadblocks on the way of developers, DBAs and QA specialists',
  url: URL, // Your website URL.
  baseUrl: BASE_URL, // Base URL for your project.
  onBrokenLinks: 'log', //'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'postgres-ai',
  projectName: 'docs',

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
    },

    navbar: {
      title: 'Database Lab Docs',
      logo: {
        alt: 'Database Lab logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          href: 'https://postgres.ai/console',
          label: '👋 Private beta',
          position: 'right',
        },
        {
          href: 'https://postgres.ai/',
          label: 'Home',
          position: 'right',
        },
        {
          to: 'database-lab/api-reference',
          label: 'API',
          position: 'right',
        },
        {
          to: 'database-lab/cli-reference',
          label: 'CLI',
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
              to: '/platform',
            },
            {
              label: 'Getting started',
              to: '/',
            },
            {
              label: 'Q&A',
              to: 'questions-and-answers',
            },
            {
              label: 'Guides',
              to: '/guides',
            },
          ],
        },
        {
          title: 'Reference',
          items: [
            {
              label: 'API reference',
              to: 'database-lab/api-reference',
            },
            {
              label: 'CLI reference',
              to: 'database-lab/cli-reference',
            },
          ],
        },
        {
          title: 'Links',
          items: [
            {
              label: 'Home',
              href: 'https://postgres.ai/',
            },
            {
              label: 'GitLab',
              href: 'https://gitlab.com/postgres-ai',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/Database_Lab',
            },
            {
              label: 'YouTube',
              href: 'https://www.youtube.com/channel/UCLSWQVJX_VQ0NVSzN0fZT3A',
            },
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'Community Slack',
              href: 'https://database-lab-team-slack-invite.herokuapp.com/',
            },
            {
              label: 'Private beta 👋',
              href: 'https://postgres.ai/console',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Postgres.ai`,
    },
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://gitlab.com/postgres-ai/docs/-/edit/master/',
          routeBasePath: '/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
