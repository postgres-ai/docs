---
title: Platform.ai Security Aspects
---

Postgres.ai Platform and its components are developed with strong focus on security. To ensure that your data is secure, please carefully read this document and 

## If you found a security-related issue

If you found a possible vulnerability or have any urgent security-related concerns, please contact Postgres.ai Support as soon as possible, using one of the following options:

1. Intercom widget available on Postgres.ai,
1. write an email to security@postgres.ai.

## Architecture and data availability

## What data can be received and stored in the Platform Database


### Self-managed setups

In the case of a Self-managed setup, all the components are installed and operate inside your infrastructure (cloud or on-premise). It is strongly recommended to treat Database Lab instances that work with production clones as production-like machines, therefore protecting them correspondingly, using firewalls, secure connections.

### SaaS: what data can be transferred and stored in the Postgres.ai database?

In SaaS setup (Postgres.ai) of the Platform, components that can connect to database clones are installed inside your infrastructure. The Platform works "outside" and *cannot* reach your databases and read or modify anything in your databases (including temporary clones):

![Postgres.ai SaaS Security Model](/docs/assets/saas-security-model.png)

Further we discuss all Postgres.ai components that are to be installed in your infrastructure, and what kind of information can be transferred to Postgres.ai.

#### Database Lab

When integrated, the Database Lab component may receive only control signals such as "create clone", "destroy clone", "refresh clone", "list snapshots". The full list of capabilities you may find in [Database Lab CLI Reference](/docs/database-lab/6_cli_reference). By no means any data from the databases you use is available to the Platform.

To connect to a clone, users need to be able to work inside your infrastructure, to be able to connect Database Lab (by default, ports 6000..6100 are used for Postgres connections on clones), using the username and the password defined at clone creation time. Passwords for clones are never stored by Postgres.ai, and it is users' responsibility to remember them.

#### Joe Bot

The key principle of Joe Bot:

> Users may work only with metadata, but not with data. 

For example, when users run a SELECT for a table, they do not see the data, and only metadata (EXPLAIN plans) is available.

At the same time, some data can be still relealed indirectly:

- if an SQL query being analyzed contains some sensitive data, it is available in the Joe History,
- under some circumstances, row counts may be considered as sensitive pieces of data.

To mitigate these aspects, consider the following:

1. allow working with Joe Bot only to whom you can trust (your organization's team members),
1. use audit logs Joe Bot provides to periodically review all the activity,
1. ensure that you use only secure connections (HTTPS), with valid SSL certificates,
1. if needed, cleanup Joe Bot history or disable it completely,
1. finally, you may want to consider removing sensitive data at snapshot creation time in Database Lab instances – in this case, the sensitive data won't be available at all (however, this approach changes physical layout, affecting EXPLAIN plans, in some cases they may change and not be identical to production anymore).

#### postgres-checkup

postgres-checkup reports contain only metadata: database and database object sizes, row counts, Postgres configuration parameters, abstract SQL queries (queries without parameters).

