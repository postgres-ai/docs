---
title: Database Lab Platform Security
sidebar_label: Database Lab Platform Security
---

Database Lab Platform and its components are developed with a strong focus on security. To ensure that your data is secure, please carefully read this document.

## Found a security issue or have questions?
If you found a possible vulnerability or have an urgent security-related concern, please reach out to Postgres.ai Support as soon as possible, using one of the following options:

1. Use Intercom widget available on Postgres.ai
1. Write an email to <a href="mailto:security@postgres.ai">security@postgres.ai</a>

## Security incidents and incident management
### Security incident
Security incident – any violation or reasonable risk (or threat) to violate of:
- Database Lab Platform (Postgres.ai) integral security (including but not limited to: databases, backups, application code, infrastructure components, customer data)
- Internal Postgres.ai Information Security Policies

### How incidents are processed
Once the information about an incident becomes known to the Engineer on Call, it is analyzed, the incident registration performed, severity level is assigned, and then it is determined if customer notification is needed.

### Communication with customers
Any severe incidents with risks to affect customer data trigger customer alert. The corresponding customers are alerted using an appropriate channel (email, phone, messaging system) within 24 hours. In this communication the following information is provided:
- Date and time when the incident happened
- The overview of ongoing security issues and potential issues in the future
- What data is affected
- The mitigation plan
- Direct contacts for receiving further information on the particular incident resolution

## Architecture and data availability
## Customer data management
### Self-managed installations
In the case of a Self-managed setup, all the components are installed and operate inside your infrastructure, cloud or on-premise. It is strongly recommended to treat Database Lab instances that work with production clones as production-like machines, therefore protecting them correspondingly, using firewalls, secure connections.

### Key security principles of communication between Postgres.ai SaaS and your infrastructure
In [Postgres.ai SaaS](https://postgres.ai/console), all the components that can communicate directly to database clones are installed inside your infrastructure. The Platform works "outside". This means that both Postgres.ai components and Postgres.ai engineers cannot reach your infrastructure:
- Postgres.ai *cannot* reach your databases
- Postgres.ai *cannot* read or modify the data in your databases, including temporary clones
- Postgres.ai *cannot* SSH to your machines

### SaaS (Postgres.ai): what data can be transferred to and stored in the Postgres.ai database
![Postgres.ai SaaS Security Model](/assets/saas-security-model.png)

By default, ports 2400 and 2345 operate using HTTP, which is not secure. It is highly recommended that HTTP connections are not open to the world, and all communications happen using HTTPS only (consider using NGINX with SSL certificates as a proxy option to allow only encrypted communication between the Platform and Database Lab / Joe).

What if you do not want to open ports to the world at all, even for HTTPS communication? In this case, you need to use a more complicated setup, based on secure tunneling using WebSockets. It also can be useful for setting up Database Lab and Joe instances behind firewalls when making exclusions for specific ports is impossible or prohibited. In this approach, the connection to the Platform is established by starting the tunnel client with a registration key. Note, that as of ctober 2020, the use of tunneling requires a special configuration of your organization in Postgres.ai SaaS.

:::note
Please contact Postgres.ai support to obtain your registration key and detailed installation instructions. This option is available for paid customers (Enterprise Edition) only.
:::

![Postgres.ai SaaS Security Model](/assets/saas-security-tunnel-model.png)

### Data transferred to and collected in Postgres.ai database
Further, we discuss all Postgres.ai components that are to be installed in your infrastructure, and what kind of information can be transferred to Postgres.ai.

#### Database Lab
When integrated, the Database Lab component may receive only control signals such as "create clone", "destroy clone", "refresh clone", "list snapshots". The full list of capabilities you may find in [Database Lab CLI Reference](/docs/database-lab/cli-reference). By no means is data from your databases available to the Platform.

To be able to connect to a clone, users need to work inside your infrastructure, where connections to Database Lab clones (by default, ports 6000..6100) are possible, using the username and the password defined at clone creation time. Postgres.ai never stores passwords for clones, and it is the users' responsibility to remember them.

If CI observability is enabled (Database migration verification, "Observed sessions"), then partial PostgreSQL logs corresponding to activity observed on Database Lab clones is sent to Postgres.ai and stored there. Such logs may contain sensitive data. Customer can configure rules to automatically mask the sensitive data in these logs prior to sending to Postgres.ai.

#### Joe Bot
The key principle of Joe Bot:

:::info
Communicating with Joe bot, users work only with metadata, but not with data.
:::

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

