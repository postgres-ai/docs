---
title: Postgres.ai Security Aspects
---

Postgres.ai Platform and its components are developed with a strong focus on security. To ensure that your data is secure, please carefully read this document and 

## If you found a security-related issue

If you found a possible vulnerability or have any urgent security-related concerns, please contact Postgres.ai Support as soon as possible, using one of the following options:

1. use Intercom widget available on Postgres.ai,
1. write an email to security@postgres.ai.

## Architecture and data availability

## What data can be received and stored in the Platform Database


### Self-managed setups

In the case of a Self-managed setup, all the components are installed and operate inside your infrastructure, cloud or on-premise. It is strongly recommended to treat Database Lab instances that work with production clones as production-like machines, therefore protecting them correspondingly, using firewalls, secure connections.

### SaaS: what data can be transferred and stored in the Postgres.ai database?

In the case of a SaaS setup (Postgres.ai) of the Platform, the components that can connect to database clones are installed inside your infrastructure. The Platform works "outside" and *cannot* reach your databases and read or modify anything in your databases (including temporary clones):

![Postgres.ai SaaS Security Model](/docs/assets/saas-security-model.png)

By default, ports 2400 and 2345 operate using HTTP, which is not secure. It is highly recommended that HTTP connections are not available to public, and all communication happens using HTTPS (consider using NGINX with SSL certificates as a proxy option to allow only encrypted communication between the Platform and Database Lab / Joe).

What if you do not want to open ports to the world at all? In this case, you need to use a more complicated setup, based on secure tunneling using WebSockets.
It may be useful for communication Database Lab and Joe instances behind firewalls when making exclusions for specific ports is impossible or prohibited.
The connection to the Platform is established by starting the tunnel client with a registration key. Please contact Postgres.ai support to obtain your registration key and detailed installation instructions. This option is available for paid customers (Enterprise Edition) only.

![Postgres.ai SaaS Security Model](/docs/assets/saas-security-tunnel-model.png)

Further, we discuss all Postgres.ai components that are to be installed in your infrastructure, and what kind of information can be transferred to Postgres.ai.

#### Database Lab

When integrated, the Database Lab component may receive only control signals such as "create clone", "destroy clone", "refresh clone", "list snapshots". The full list of capabilities you may find in [Database Lab CLI Reference](/docs/database-lab/6_cli_reference). By no means is data from your databases available to the Platform.

To be able to connect to a clone, users need to work inside your infrastructure, where connections to Database Lab clones (by default, ports 6000..6100) are possible, using the username and the password defined at clone creation time. Postgres.ai never stores passwords for clones, and it is the users' responsibility to remember them.

#### Joe Bot

The key principle of Joe Bot:

> Users may work only with metadata, but not with data. 

For example, when users run a SELECT for a table, they do not see the data, and only metadata (EXPLAIN plans) is available.

At the same time, some data can be still revealed indirectly:

- if an SQL query being analyzed contains some sensitive data, it is available in the Joe History,
- under some circumstances, row counts may be considered as sensitive pieces of data.

To mitigate these aspects, consider the following:

1. only people you can trust to work with Joe Bot (your organization's team members),
1. use audit logs Joe Bot provides to review all the activity periodically,
1. ensure that you use only secure connections (HTTPS), with valid SSL certificates,
1. if needed, you can clean up Joe Bot history or disable it completely,
1. finally, you may want to consider removing sensitive data at snapshot creation time in Database Lab instances. In this case, the sensitive data won't be available at all (however, this approach changes the physical layout, affecting EXPLAIN plans; in some cases, they may change and not be identical to production anymore).

#### postgres-checkup

postgres-checkup reports contain only metadata: database and database object sizes, row counts, Postgres configuration parameters, abstract SQL queries (queries without parameters).

