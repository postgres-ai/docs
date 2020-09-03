---
title: Q&A
sidebar_label: Q&A
hide_title: false
---

## What does "thin cloning" mean? Thin vs. thick clones. Why is thin cloning so fast?

There are two types of cloning used by Database Lab:

1. Thick cloning is how data is copied to a Database Lab instance initially. There are many options:

- dump/restore (using `pg_dump`/`pg_dumpall` and `pg_restore`/`psql`),
- `pg_basebackup`,
- restoring from a physical archive (e.g., WAL-G or Barman or `pg_probackup`),
- or simple `rsync` with `pg_start_backup() / pg_stop_backup()`.

In addition to initial mandatory thick cloning, Database Lab supports continuous synchronization of PGDATA with the state of an external source such as production PostgreSQL or production archive. In the case of "logical" thick copy (dump/restore), logical replication needs to be used. In the case of "physical" thick copy (all other options listed above), it is possible to use "physical" replication, preferably based on shipping WAL files from WAL archive (e.g., WAL-G's `wal-fetch` configured in `restore_command`). Note that currently, the continuous synchronization feature needs to be configured separately; please reach out Postgres.ai support to learn more about the options.

2. Thin cloning is how we get local database clones in a couple of seconds. The speed of thin cloning is extremely high; it does not depend on the database size and feels like instant cloning.

Thin cloning is fast because it is based on the Copy-on-Write (CoW) feature implemented. Read more on [Wikipedia](https://en.wikipedia.org/wiki/Copy-on-write#In_computer_storage).

Currently, Database Lab supports two methods for thin cloning: ZFS and LVM. <!-- TODO: move explanation about snapshot management to a separate paragraph --> In the case of ZFS, we periodically prepare a new snapshot of PGDATA, which is thick-cloned (optionally, PGDATA is continuously synchronized with production using the synchronization feature described above). Then, on a user's request, such a snapshot is used to create a thin clone instantly. It is allowed to keep multiple snapshots, so users can choose which one to use.


## Do I need ZFS on production?

If you are going to use Database Lab with ZFS, you do not need to install ZFS on production servers. ZFS is needed only to enable thin provisioning. Therefore, ZFS is needed only on the Database Lab instances. Production machines do not need any changes. They can be located anywhere: in clouds (including managed options like AWS RDS), on-premise; and they may use any operating system and any filesystem.

ZFS is an efficient filesystem with rich capabilities, simple installation, and an easy-to-use CLI. It makes ZFS perfectly suitable for use in development and testing environments.

As an alternative to ZFS, Database Lab supports LVM to enable thin-provisioning. [Database Lab](https://gitlab.com/postgres-ai/database-lab) is an open-source component, and its architecture allows extending to support other systems, such as Ceph, in the future. Contributions are welcome!


## What is needed to use Database Lab?

- for each Database Lab instance, a separate machine is needed, either physical or virtual, either on-premise or in clouds;
- for each Postgres production source database, a separate Database Lab instance is required;
- a Database Lab machine needs to have a separate disk partition with size enough to store the target Postgres directory (PGDATA), see [Database Lab Tutorial](/docs/tutorials/engine-setup) for more details;
- any modern Linux is supported, with ZFS module (if you are going to use ZFS to support thin cloning, which is the default method) and Docker installed;
- currently, you need to take care of the initial copying of the database to this disk yourself (the "thick cloning" stage), use either of the following:
    - dump/restore procedure (`pg_dump`/`pg_dumpall` and `pg_restore`/`psql`),
    - the standard `pg_basebackup` tool,
    - restore from a physical archive (e.g., WAL-G, Barman, pgBackRest), or
    - put the source database into "backup" mode using then `pg_start_backup()` function, then copy PGDATA to Database Lab instance (e.g., using `rsync`), and then stop the "backup" mode (`pg_stop_backup()`).

For more details, see [Database Lab Tutorial](/docs/tutorials/engine-setup).

## What is needed to use Database Lab with RDS?

For more details, see [Database Lab RDS Tutorial](/docs/tutorials/engine-setup-rds).

## Cloud vs. on-premise

You can install Database Lab on any machine which matches our requirements listed above. It doesn't matter whether this machine is in clouds or on-premise.

<!-- Q&A for Joe, for Platform GUI -->

## Where to get help?

Our team is happy to help you with Database Lab and related products setup and usage. Reach us using the following resources:

- email: support@postgres.ai,
- Intercom chat available on [Postgres.ai](https://Postgres.ai) website,
- [Community Slack (English)](https://database-lab-team-slack-invite.herokuapp.com/),
- [Telegram (Russian)](https://t.me/databaselabru).
