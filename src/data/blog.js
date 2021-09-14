// Duplicates data from the blog.
const blog = [
  {
    link: 'blog/20210914-dle-2-5',
    date: '2021-09-14 00:00:00',
    title: 'DLE 2.5: Better data extraction for logical mode and configuration improvements',
    description: 'Now it is possible to dump/restore multiple databases at the same time and use different pg_dump formats and compression formats of plain-text dump. DLE and related products configuration structure were significantly reworked and require manual action to migrate to the new version.',
    image: '/assets/thumbnails/dle-2.5-blog.png',
  },
  {
    link: 'blog/20210909-what-is-a-slow-sql-query',
    date: '2021-09-09 22:18:00',
    title: 'What is a slow SQL query?',
    description: 'Is 200 ms slow for an SQL query? What about 20 ms? When do we need to optimize?',
    image: '/assets/thumbnails/what-is-slow-sql.png',
  },
  {
    link: 'blog/20210831-postgresql-subtransactions-considered-harmful',
    date: '2021-08-31 12:06:00',
    title: 'PostgreSQL Subtransactions Considered Harmful',
    description: 'PostgreSQL subtransactions (nested transactions) may cause multiple performance and scalability issues: higher rates of XID growth and higher risks of transaction ID wraparound, performance degradation when more than PGPROC_MAX_CACHED_SUBXIDS (64) are used in a session, drastic performance slowdowns when subtransactions are combined with SELECT .. FOR UPDATE, and finally, brief downtime on standbys when subtranasctions used on the primary in paralell with long-running transactions or just slow statements. Subtransactions can be created using SAVEPOINT in regular SQL or using EXCEPTION WHEN blocks in PL/pgSQL.',
    image: '/assets/thumbnails/20210831-harmful-subtransactions.png',
  },
  /*{
    link: 'blog/20210728-code-and-data',
    date: '2021-07-28 16:00:00',
    publishDate: '2021-07-28 16:00:00',
    title: 'Comprehensive Testing Covers Code AND Data',
    description: 'A large gap remains on the landscape of software tooling…',
    image: '/assets/thumbnails/dle-generic-blog.png',
  },
  {
    link: 'blog/20210714-dle-2-4-test-db-changes-in-ci',
    date: '2021-07-14 13:18:00',
    publishDate: '2021-07-14 13:18:00',
    title: 'DLE 2.4: realistic DB testing in GitHub Actions; Terraform module',
    description: 'DLE 2.4 brings two major capabilities to those who are interested in working with PostgreSQL thin clones: automated tests of DB migrations in GitHub Actions, and Terraform module to deploy Database Lab in AWS',
    image: '/assets/thumbnails/dle-2.4-blog.png',
  },  {
  {
    link: 'blog/dle-2-2-release',
    date: '2021-02-22 06:45:00',
    title: 'Database Lab Engine 2.2 and Joe Bot 0.9',
    description: 'Database Lab Engine 2.2.0 and SQL Optimization Chatbot “Joe” 0.9.0 released: multiple pools for automated “logical” initialization, production timing estimation (experimental), and improved security.',
    image: '/assets/thumbnails/dle-2.2-blog.png',
  },
  {
    link: 'blog/dle-2-1-release',
    date: '2020-12-31 09:22:00',
    publishDate: '2020-12-31 09:22:00',
    title: 'Database Lab Engine 2.1',
    description: 'Database Lab Engine 2.1 released: automated physical and logical initialization, Amazon RDS PostgreSQL support, basic data transformation and masking',
    image: '/assets/thumbnails/dle-2.1-blog.png',
  },
  
    link: 'blog/plan-exporter',
    date: '2020-05-23 21:19:00',
    title: 'plan-exporter: visualize PostgreSQL EXPLAIN data right from psql',
    description: 'No more headache with copy-pasting huge plans from psql to explain.dalibo.com and explain.depesz.com',
    image: '/assets/plan-exporter2.png',
  },
  {
    link: '/blog/joe-0.7',
    date: '2020-05-18 11:16:00',
    title: 'Joe 0.7.0 released! New in this release: Web UI, Channel Mapping, and new commands',
    description: 'Secure and performant Web UI brings more flexibility, 1:1 communication, and visualization options',
    image: '/assets/joe-3-silhouettes.svg',
  },
  {
    link: '/blog/joe-0.6',
    date: '2020-03-23 10:42:00',
    title: 'Joe 0.6.0 supports hypothetical indexes',
    description: 'Have an index idea for a large table? Get a sneak peek of how SQL plan will look like using Joe\'s new command, "hypo", that provides support of hypothetical indexes',
    image: '/assets/joe-3-silhouettes.svg',
  },
  {
    link: '/blog/dblab-0.3',
    date: '2020-03-04 08:02:00',
    title: 'Database Lab Engine 0.3, supports both ZFS and LVM',
    description: 'Database Lab Engine 0.3: now LVM can be used instead of ZFS for thin cloning',
    image: '/assets/dblab.svg',
  },
  {
    link: '/blog/joe-0.5',
    date: '2020-02-26 21:42:00',
    title: 'Joe bot, an SQL query optimization assistant, updated to version 0.5.0',
    description: 'Postgres.ai team is proud to present version 0.5.0 of Joe bot, an SQL query optimization assistant',
    image: '/assets/joe-3-silhouettes.svg',
  },
  {
    link: '/blog/dblab-0.2',
    date: '2020-02-06 10:38:00',
    title: 'Database Lab Engine 0.2',
    description: 'Database Lab Engine updated to 0.2: everything in containers, better API and CLI',
    image: '/assets/dblab.svg',
  },
  {
    link: '/blog/dblab-first-release',
    date: '2020-01-28 14:15:00',
    title: 'The first public release of Database Lab Engine',
    description: 'Postgres.ai team is proud to announce the very first public release of Database Lab Engine',
    image: '/assets/dblab.svg',
  },*/
];

export default blog;
