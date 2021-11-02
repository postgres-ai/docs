const collections = [
  {
    id: 'aws-postgres',
    title: 'AWS, RDS, Aurora PostgreSQL',
    curatorId: 'nik',
    comment: 'AWS collection comment',
    previewUrl: '/assets/universe/thumbnail-base.png',
    url: '/universe/aws-postgres',
    date: '2021-10-10 20:00:00',
    items: [
      {
        title: 'Tuning PostgreSQL for High Write Workloads',
        url: 'https://www.youtube.com/watch?v=xrMbzHdPLKM',
        previewUrl: '/assets/universe/aws-postgres/1.jpeg',
        commentatorId: 'nik',
        comment: 'This is the very video where the benefits of Aurora Postgres were revealed. Many technical details: problem with checkpoints and full-page writes, basic concepts of Aurora architecture, benchmarks. A must-watch.',
      },
      {
        title: 'Migrating Oracle to Aurora PostgreSQL Utilizing AWS Database Migration Service (DMS)',
        url: 'https://www.youtube.com/watch?v=EcS9PC_TnG0',
        previewUrl: '/assets/universe/aws-postgres/3.jpeg',
        commentatorId: 'nik',
        comment: 'Aurora Postgres is considered as a replacement for Oracle, so of course, AWS is interested in advertising case studies of the conversion. Good to see more and more companies migrating. However, I feel very sorry to those who use DMS – it\'s definitely no fun. Allocate a good amount of workforce if you\'re going to go this route.',
      },
      {
        title: 'Using Performance Insights to Analyze Performance of Amazon Aurora PostgreSQL',
        url: 'https://www.youtube.com/watch?v=4462hcfkApM',
        previewUrl: '/assets/universe/aws-postgres/4.jpeg',
        commentatorId: 'nik',
        comment: 'Performance Insights, inspired by Oracle tooling, is a must-have thing these days. AWS helped make this approach ("active session history analysis" – in Postgres, it\'s based on sampling of pg_stat_activity) the 3rd standard way in PostgreSQL query analysis – in addition to pg_stat_statements and log-based analysis. If you\'re not on RDS/Aurora, this video is still useful – check it out and then also check PASH Viewer https://github.com/dbacvetkov/PASH-Viewer, pg_wait_sampling https://github.com/postgrespro/pg_wait_sampling, and pgsentinel https://github.com/pgsentinel/pgsentinel',
      },
      {
        title: 'PostgreSQL In-Depth Training: Aurora Part 2',
        url: 'https://www.youtube.com/watch?v=f3hOKNIZvRU',
        previewUrl: '/assets/universe/aws-postgres/5.jpeg',
        commentatorId: 'nik',
        comment: 'Jeremy Scheider has always great materials  (unfortunately, not often). If you\'re on Aurora, this is a must-watch.',
      },
      {
        title: 'Jignesh Shah Deep Dive into the RDS PostgreSQL Universe',
        url: 'https://www.youtube.com/watch?v=NnRAA4cXcGg',
        previewUrl: '/assets/universe/aws-postgres/6.jpeg',
        commentatorId: 'nik',
        comment: 'Great overview of RDS Postgres capabilities. Video has time codes, convenient.',
      },
      {
        title: 'Jignesh Shah Tips and Tricks with Amazon RDS for PostgreSQL',
        url: 'https://www.youtube.com/watch?v=RC3uMCMSlfw',
        previewUrl: '/assets/universe/aws-postgres/7.jpeg',
        commentatorId: 'nik',
        comment: 'Jignesh knows a lot about Postgres and RDS – this talk is a good bag of tricks (video has timecodes)',
      },
      {
        title: 'Managed PostgreSQL Databases on AWS',
        url: 'https://www.youtube.com/watch?v=hdQ-geGBsq4',
        previewUrl: '/assets/universe/aws-postgres/8.jpeg',
      },
      {
        title: '1 - Introduction and Demo - AWS Lambda Functions with Python',
        url: 'https://www.youtube.com/watch?v=CEBPMnroAng',
        previewUrl: '/assets/universe/aws-postgres/9.jpeg',
      },
      {
        title: '5 - Standing up RDS Instance with PostgreSQL - AWS Lambda Functions with Python',
        url: 'https://www.youtube.com/watch?v=noH0tkVw_fE',
        previewUrl: '/assets/universe/aws-postgres/10.jpeg',
      },
      {
        title: 'PostgreSQL In-Depth Training: Aurora Part 1',
        url: 'https://www.youtube.com/watch?v=--jED3W8Qy4',
        previewUrl: '/assets/universe/aws-postgres/11.jpeg',
      },
    ]
  },
  {
    id: 'connection-pooling',
    title: 'Connection pooling (pgBouncer, Odyssey, etc.)',
    curatorId: 'nik',
    comment: 'collection comment',
    previewUrl: '/assets/universe/thumbnail-base.png',
    url: '/universe/connection-pooling',
    date: '2021-10-10 20:00:00',
    items: [
      {
        title: 'Connection pooling routing and queueing with pgBouncer',
        url: 'https://www.youtube.com/watch?v=x_XpPbfomso',
        previewUrl: '/assets/universe/connection-pooling/1.jpg',
      },
      {
        title: 'PgBouncer and 20000 TPS at one node: advanced tuning, hacks and problem solving',
        url: 'https://www.youtube.com/watch?v=6s4T2L5cieg',
        previewUrl: '/assets/universe/connection-pooling/2.jpg',
      },
      {
        title: 'PgBouncer Connection Pooling and Routing',
        url: 'https://www.youtube.com/watch?v=a0SDogoPzss',
        previewUrl: '/assets/universe/connection-pooling/3.jpg',
      },
      {
        title: 'Connection pooling, routing, and queuing with PgBouncer',
        url: 'https://www.youtube.com/watch?v=CAKI_eZiRAU',
        previewUrl: '/assets/universe/connection-pooling/4.jpg',
      },
      {
        title: 'Connection Pooling in PostgresSQL with NodeJS (Performance Numbers)',
        url: 'https://www.youtube.com/watch?v=GTeCtIoV2Tw',
        previewUrl: '/assets/universe/connection-pooling/5.jpg',
      },
      {
        title: 'Architecture for building scalable and highly available Postgres Cluster',
        url: 'https://www.youtube.com/watch?v=G4i-xnSMwkY',
        previewUrl: '/assets/universe/connection-pooling/6.jpg',
      },
      {
        title: 'pgbouncer High Availability Demo',
        url: 'https://www.youtube.com/watch?v=z9mzamF5ZE8',
        previewUrl: '/assets/universe/connection-pooling/7.jpg',
      },
      {
        title: 'Configuring pgBouncer for use with PEM Agents',
        url: 'https://www.youtube.com/watch?v=4OdmSKODcS4',
        previewUrl: '/assets/universe/connection-pooling/8.jpg',
      },
      {
        title: 'HUD | Architecture with Connection Pooling | pgBouncer, config and benefits',
        url: 'https://www.youtube.com/watch?v=B2B9cjiovYE',
        previewUrl: '/assets/universe/connection-pooling/9.jpg',
      },
      {
        title: 'Odyssey - Andrey Borodin',
        url: 'https://www.youtube.com/watch?v=rvyG92iCj4g',
        previewUrl: '/assets/universe/connection-pooling/10.jpg',
      },
    ],
  },
  {
    id: 'postgresql-cli',
    title: 'psql, pg_dump, pg_restore – work with PostgreSQL in console',
    curatorId: 'nik',
    comment: 'collection comment',
    previewUrl: '/assets/universe/thumbnail-base.png',
    url: '/universe/postgresql-cli',
    date: '2021-10-10 20:00:00',
    items: [
      {
        title: 'PostgresOpen 2019 Fascinating Reporting With Postgres psql',
        url: 'https://www.youtube.com/watch?v=GMiJs7YSzXM',
        previewUrl: '/assets/universe/postgresql-cli/1.jpg',
      },
    ],
  },
  {
    id: 'postgresql-in-containers',
    title: 'Postgres in containers. Docker. Kubernetes',
    curatorId: 'nik',
    comment: 'collection comment',
    previewUrl: '/assets/universe/thumbnail-base.png',
    url: '/universe/postgresql-in-containers',
    date: '2021-10-10 20:00:00',
    items: [
      {
        title: 'OCB: High Availability PostgreSQL and more on OpenShift - Jonathan Katz (Crunchy Data)',
        url: 'https://www.youtube.com/watch?v=9jbR9lZuSU0',
        previewUrl: '/assets/universe/postgresql-in-containers/1.jpg',
      },
      {
        title: 'Postgres Tuesday №12 [ENGLISH] with Álvaro Hernández',
        url: 'https://www.youtube.com/watch?v=u8LLRyKN3Ew',
        previewUrl: '/assets/universe/postgresql-in-containers/2.jpg',
      },
      {
        title: 'PostgreSQL Operator 4.3 Feature Demo: Standby Cluster Setup and Promotion',
        url: 'https://www.youtube.com/watch?v=G3N2nvuYcNw',
        previewUrl: '/assets/universe/postgresql-in-containers/3.jpg',
      },
      {
        title: 'PostgreSQL Operator 4.3 Feature Demo: Customize Postgresql Configuration',
        url: 'https://www.youtube.com/watch?v=VIf1urE2-Ek',
        previewUrl: '/assets/universe/postgresql-in-containers/4.jpg',
      },
      {
        title: 'How to Deploy the PostgreSQL Operator in OpenShift',
        url: 'https://www.youtube.com/watch?v=jQ2AaBNMz8s',
        previewUrl: '/assets/universe/postgresql-in-containers/5.jpg',
      },
      {
        title: 'Building your own PostgreSQL-as-a-Service on Kubernetes. - Alexander Kukushkin, Zalando SE',
        url: 'https://www.youtube.com/watch?v=G8MnpkbhClc',
        previewUrl: '/assets/universe/postgresql-in-containers/6.jpg',
      },
      {
        title: 'PostgreSQL on K8S at Zalando: Two years in production',
        url: 'https://www.youtube.com/watch?v=StLzIkU00HY',
        previewUrl: '/assets/universe/postgresql-in-containers/7.jpg',
      },
      {
        title: 'Lev Dragunov PostgreSQL inside Docker',
        url: 'https://www.youtube.com/watch?v=5K87966UhyM',
        previewUrl: '/assets/universe/postgresql-in-containers/8.jpg',
      },
      {
        title: 'PostgreSQL and Docker - getting started',
        url: 'https://www.youtube.com/watch?v=A8dErdDMqb0',
        previewUrl: '/assets/universe/postgresql-in-containers/9.jpg',
      },
      {
        title: 'How to easily run Postgres in Docker',
        url: 'https://www.youtube.com/watch?v=iZDbENJrl4I',
        previewUrl: '/assets/universe/postgresql-in-containers/10.jpg',
      },
      {
        title: 'Docker and PostgreSQL in [10 Minutes]',
        url: 'https://www.youtube.com/watch?v=aHbE3pTyG-Q',
        previewUrl: '/assets/universe/postgresql-in-containers/11.jpg',
      },
      {
        title: 'Kube-native Postgres [I] - Josh Berkus, RedHat',
        url: 'https://www.youtube.com/watch?v=Zn1vd7sQ_bc',
        previewUrl: '/assets/universe/postgresql-in-containers/12.jpg',
      },
      {
        title: 'Deploying the Crunchy Data Postgres Operator on Minikube',
        url: 'https://www.youtube.com/watch?v=RRolyGpplK4',
        previewUrl: '/assets/universe/postgresql-in-containers/13.jpg',
      },
      {
        title: 'PostgresOpen 2019 Easy And Correct High Availability PostgreSQL With Kubernetes',
        url: 'https://www.youtube.com/watch?v=p0WVyHDWsgA',
        previewUrl: '/assets/universe/postgresql-in-containers/14.jpg',
      },
      {
        title: '(May 2020) #RuPostgres Tuesday №12 [ENGLISH] with Álvaro Hernández',
        url: 'https://www.youtube.com/watch?v=g0mPr0kW9Ag',
        previewUrl: '/assets/universe/postgresql-in-containers/15.jpg',
      },
      {
        title: '== StackGres: Cloud-Native PostgreSQL on Kubernetes ==',
        url: 'https://www.youtube.com/watch?v=GqCz_l8OUNo',
        previewUrl: '/assets/universe/postgresql-in-containers/16.jpg',
      },
    ],
  },
  {
    id: 'sql-query-micro-optimization',
    title: 'SQL query micro-optimization, EXPLAIN',
    curatorId: 'nik',
    comment: 'collection comment',
    previewUrl: '/assets/universe/thumbnail-base.png',
    url: '/universe/sql-query-micro-optimization',
    date: '2021-10-10 20:00:00',
    items: [
      {
        title: 'Being a Better Developer With EXPLAIN - Louise Grandjonc',
        url: 'https://www.youtube.com/watch?v=IwahVdNboc8',
        previewUrl: '/assets/universe/sql-query-micro-optimization/1.jpg',
      },
      {
        title: 'PostgresOpen 2019 The Art Of PostgreSQL',
        url: 'https://www.youtube.com/watch?v=q9IXCdy_mtY',
        previewUrl: '/assets/universe/sql-query-micro-optimization/2.jpg',
      },
      {
        title: 'Query optimization in Postgres',
        url: 'https://www.youtube.com/watch?v=nTYE5SsYaJg',
        previewUrl: '/assets/universe/sql-query-micro-optimization/3.jpg',
      },
      {
        title: 'Postgres Open 2016 - Identifying Slow Queries and Fixing Them!',
        url: 'https://www.youtube.com/watch?v=yhOkob2PQFQ',
        previewUrl: '/assets/universe/sql-query-micro-optimization/4.jpg',
      },
      {
        title: 'PostgresOpen 2019 Optimizing Query Performance',
        url: 'https://www.youtube.com/watch?v=8tnF1qqnagY',
        previewUrl: '/assets/universe/sql-query-micro-optimization/5.jpg',
      },
      {
        title: 'Basic understanding of EXPLAIN ANALYZE',
        url: 'https://www.youtube.com/watch?v=Kdjz2e8HYPU',
        previewUrl: '/assets/universe/sql-query-micro-optimization/6.jpg',
      },
      {
        title: 'PGConf.Russia 2019 Julien Rouhaud «HypoPG 2: Hypothetical Partitioning support for PostgreSQL»',
        url: 'https://www.youtube.com/watch?v=H2tEOg7hTf0',
        previewUrl: '/assets/universe/sql-query-micro-optimization/7.jpg',
      },
      {
        title: 'PGConf.Russia 2019 Tatsuro Yamada «Auto plan tuning using feedback loop»',
        url: 'https://www.youtube.com/watch?v=wtHGcjdGIjA',
        previewUrl: '/assets/universe/sql-query-micro-optimization/8.jpg',
      },
      {
        title: 'PGConf.Russia 2019 Stepan Danilov «Optimization of optimized and not quite»',
        url: 'https://www.youtube.com/watch?v=wwnRe3Z6dJM',
        previewUrl: '/assets/universe/sql-query-micro-optimization/9.jpg',
      },
      {
        title: 'PGConf India 2020 - Lightning Talk - Auto Explain - Ashutosh Bapat - 2ndQuadrant',
        url: 'https://www.youtube.com/watch?v=vnGL7OB_HPs',
        previewUrl: '/assets/universe/sql-query-micro-optimization/10.jpg',
      },
      {
        title: 'SE-Radio Episode 328: Bruce Momjian on the Postgres Query Planner',
        url: 'https://www.youtube.com/watch?v=vjRuSjiSpbI',
        previewUrl: '/assets/universe/sql-query-micro-optimization/11.jpg',
      },
      {
        title: 'PostgresOpen 2019 Explain Plans And You',
        url: 'https://www.youtube.com/watch?v=OO-CHEXAX4o',
        previewUrl: '/assets/universe/sql-query-micro-optimization/12.jpg',
      },
      {
        title: 's01e08 PostgreSQL query optimization, pgMustard - Michael Christofides',
        url: 'https://www.youtube.com/watch?v=cDvcZm0dqMc',
        previewUrl: '/assets/universe/sql-query-micro-optimization/13.jpg',
      },
      {
        title: '2021-03-12 Discussing root cause of DB incident and follow up steps',
        url: 'https://www.youtube.com/watch?v=F53wsUtvPmI',
        previewUrl: '/assets/universe/sql-query-micro-optimization/14.jpg',
      },
    ],
  },
];

export default collections;
