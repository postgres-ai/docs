---
id: get-started
title: Get started
hide_title: true
sidebar_label: Postgres.ai
---
## Get started with Postgres.ai
Try our [Database Lab Tutorial](./database-lab/1_tutorial) that covers
Database Lab server installation, database generation, snapshotting,
and client CLI install and usage.


## Usage examples
- Perform SQL optimization in a convenient way (see [https://gitlab.com/postgres-ai/joe](postgres-ai/joe))
- Check database schema changes (database migrations) on full-sized database clones using Database Lab in CI (see [https://gitlab.com/postgres-ai/ci-example](postgres-ai/ci-example))


## Workflow overview and requirements
**TL;DR:** you need:

- any machine with a separate disk that is big enough to store a single copy of your database,
- Linux with Docker and ZFS,
- the initial copy of your Postgres database.

Details:

- for each Database Lab instance, a separate machine (either physical or virtual) is needed,
- both on-premise and cloud setups are possible,
- for each Postgres cluster (a single Postgres server with databases), a separate Database Lab instance is required,
- the machine needs to have a separate disk partition with size enough to store the target Postgres directory (PGDATA),
- any modern Linux is supported,
- Docker needs to be installed on the machine,
- currently, you need to take care yourself of the initial copying of the database to this disk ("thick cloning" stage),
- use pg_basebackup, restoration from an archive (such as WAL-G, Barman, pgBackRest or any), or dump/restore (the only way
- supported for RDS, until AWS guys decide to allow replication connections),
- upon request, Database Lab will do "thin cloning" of PGDATA, providing fully independent writable Postgres clones to users,
- currently, the only technology supported for thin cloning is ZFS, so ZFS on Linux needs to be installed on the machine,
- however, it is easy to extend and add, say, LVM or Ceph - please write us if you need it; also, contributions are highly welcome).


## Q&A
### Do we need ZFS on production?
ZFS is used only for thin-provisioning, therefore it is needed only on the Database Lab instance.
Production can be located anywhere: in clouds (including managed options like AWS RDS), on-premise,
running on any operating system and using any filesystem.

ZFS is an efficient filesystem with rich capabilities, simple installation, and
easy to use CLI. It makes ZFS perfectly suitable for use in development
environments. We will add support of different thin-provision methods
in the future, e.g., LVM, Ceph (Contribution are welcome).

### What does thin cloning mean? Thin vs. thick clones. Why is thin cloning so fast?
There are two types of cloning used in Database Lab:

1. Thick cloning is how data being copied to a Database Lab instance initially.
There is a lot of options: dump/restore, pg_basebackup, restore from an archive
(e.g., WAL-G or Barman or pg_probackup) or simple rsync with `pg_start_backup() / pg_stop_backup()`.
Should be done at least one or periodically.

If thick cloning is performed on the physical level (pg_basebackup or recovered from an archive),
then we can use `restore_command` in `recovery.conf` (in Postgres versions 12 or newer, it's in `postgresql.conf`).
In this case, we will use Database Lab "sync" instance to fetch and replay WALs.
In fact, we have a full replica of production based on WAL shipping.

2. Thin cloning is how we get local clones of Postgres in a couple of seconds.
Currently, Database Lab supports only one method for thin clone provisioning: ZFS.
We periodically prepare a snapshot of PGDATA, which was thick cloned (and optionally
being kept up in an actual state using `restore_command`) and then can be used
for fast thin cloning.

### Cloud vs on-premise?
You can install Database Lab on any machine which matches our requirements listed
above. It doesn't matter whether this machine is in clouds or on-premise.

### Where to get help?
Our team is happy to help you with Database Lab and related products setup
and usage, you can reach us at:
- support@postgres.ai
- [Community Slack (English)](https://database-lab-team-slack-invite.herokuapp.com/)
- [Telegram (Russian)](https://t.me/databaselabru)
