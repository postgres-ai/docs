---
title: Database Lab questions and answers
sidebar_label: Q&A
keywords:
  - "zfs clones"
  - "postgresql clones"
  - "fast postgresql cloning"
  - "instant postgres clones"
  - "postgresql staging clones"
  - "postgresql thin clones"
  - "copy on write for postgres"
  - "postgres test environments"
  - "virtual postgres databases"
---

## What is Postgres.ai (the company)?
Postgres.ai brings continuous integration to full-size databases drastically improving the quality of software development and testing. The Database Lab Engine, developed by Postgres.ai, is an open-source platform to create instant, full-size clones of your production database. Use these clones to test your database migrations, optimize SQL, or deploy full-size staging apps.

The website https://Postgres.ai/ hosts the SaaS version of Database Lab.

Additionally, Postgres.ai's database experts provide database performance and scalability consulting services to a very limited number of fast-growing companies.

## What is "thin cloning"? Thin vs. thick clones
There are two types of cloning used by Database Lab Engine:

1. **Thick cloning** is a regular way to copy data. It is how data is copied to Database Lab initially. There are several options:
    - logical: dump/restore (using `pg_dump` and `pg_restore`),
    - physical:
        - `pg_basebackup`,
        - restore data from a physical archive created by a backup tool such as WAL-E/WAL-G, Barman, pgBackRest, or pg_probackup.

    For managed PostgreSQL databases in clouds (such as Amazon RDS), only the first option, dump/restore, is supported.

    In addition to initial mandatory thick cloning, Database Lab Engine supports continuous synchronization with the source database. It is achieved using either logical or physical replication, depending on which thick cloning method you initially used.

2. **Thin cloning** is how we get local database clones in a few seconds. Such databases can be considered as "virtual databases" because physically, they share most of the data blocks, but logically they look fully independent. The speed of thin cloning does not depend on the database size.

    Thin cloning is fast because it is based on the [CoW (Copy-on-Write)](https://en.wikipedia.org/wiki/Copy-on-write#In_computer_storage).

    Currently, Database Lab Engine supports two technologies to enable CoW and thin cloning: ZFS and LVM. <!-- TODO: move explanation about snapshot management to a separate paragraph --> With ZFS, Database Lab Engine periodically creates a new snapshot of the data directory, and maintains a set of snapshots, periodically deleting the old ones. When requesting a new clone, users choose which snapshot to use. For example, one can request to create two clones, one with a very fresh database state, and another corresponding to yesterday morning. In a few seconds, clones are created, and it immediately becomes possible to compare two database versions: data, SQL query plans, and so on.

---

## Do I need ZFS on production servers?
No.

If you are going to use Database Lab with ZFS, you do **not** need to install ZFS on production servers. ZFS is needed only to enable thin provisioning. Therefore, ZFS is to be used only on Database Lab instances.

---

## Why ZFS?
[ZFS](https://en.wikipedia.org/wiki/ZFS) is an efficient filesystem with rich capabilities, including CoW (Copy-on-Write and) and transparent compression, simple installation, and an easy-to-use CLI. It makes ZFS perfectly suitable for use in development and testing environments.

As an alternative to ZFS, Database Lab Engine supports LVM to enable thin cloning. Moreover, since [Database Lab Engine](https://gitlab.com/postgres-ai/database-lab) is an open-source component with a modular architecture, it is quite easy to extend it to support other systems, such as Ceph, or enterprise-grade storage systems with CoW. Contributions are welcome!

---

## How stable is ZFS?
Modern versions of [ZFS on Linux](https://zfsonlinux.org/) are very stable.

Multi-terabyte Database Lab Engine instances run for many months, synchronizing changes from sources with dozens of thousand TPS, having many dozens of clones, and serving dozens of engineers simultaneously. With such a scale, cloning time may grow to 10-30 seconds, and the lag of applying changes from the source can grow to dozens of seconds. Such numbers still beat any traditional approach to organizing non-production infrastructure by all means.

---

## What do I need to use Database Lab?
- For each Database Lab Engine instance, having a dedicated machine is recommended, either physical or virtual:
    - it does not matter where the machine is located, on-premise or in clouds;
    - it is possible to run multiple Database Lab Engine instances on a single machine, but it is a requirement that each one of them will operate with its own ZFS pool or LVM2 volume (depending on what is used for thin cloning in your case). 
- For each PostgreSQL source database (most usually, production), a separate Database Lab Engine instance is recommended. In systems with micro-service architecture, in most cases, each service has a separate database, usually isolated (separate PostgreSQL cluster) – for each such database, it is recommended to set up a separate Database Lab Engine.
- Machine for Database Lab Engine needs to have a separate disk partition with size enough to store Postgres directory fetched from the source.
- With ZFS, it is highly recommended to always maintain at least 20% of free disk space. Note that ZFS transparently compresses data, so for a 10 TiB database, a 10 TiB disk space is usually enough.
- Any modern Linux is supported. For the Enterprise version, the following systems are officially supported:
    - Ubuntu 16.04 or later,
    - RHEL/CentOS 7 or later.

See [Database Lab Engine configuration reference](/docs/database-lab/config-reference) and [Database Lab Tutorial](/docs/tutorials/database-lab-tutorial) to learn more.

---

## What is needed to use Database Lab for an Amazon RDS database?
For more details, see [Database Lab tutorial for Amazon RDS](/docs/tutorials/database-lab-tutorial-amazon-rds).

---

## Cloud vs. on-premise
You can install Database Lab on any machine which matches our requirements listed above. It doesn't matter whether this machine is in clouds or on-premise.

For the Enterprise version, officially supported platforms:
- [Amazon Web Services](https://aws.amazon.com/),
- [Google Cloud Platform](https://cloud.google.com/),
- [VMWare](https://www.vmware.com/).

We plan to extend the list with the following platforms (please reach out to our support team if you are interested in it now):
- [Microsoft Azure](https://azure.microsoft.com/),
- [Nutanix Era](https://www.nutanix.com/products/era),
- [Yandex Cloud](https://cloud.yandex.com/).

<!-- Q&A for Joe, for Platform GUI -->

---

## Where to get help?
We are always happy to help. Reach out to the support team using the following resources:
- email: support@postgres.ai,
- Intercom chat widget available on [Postgres.ai](https://Postgres.ai) website,
- [Community Slack (English)](https://database-lab-team-slack-invite.herokuapp.com/),
- [Telegram (Russian)](https://t.me/databaselabru).
