---
title: Questions & answers
sidebar_label: Questions & answers
keywords:
  - "database branching"
  - "postgresql thin cloning"
  - "zero downtime postgres upgrades"
  - "instant database clones"
  - "postgresql development environments"
  - "database lab engine"
  - "postgresai assistant"
  - "postgresql testing automation"
  - "copy on write postgres"
---

# Questions & answers

## About PostgresAI

### What is PostgresAI?

PostgresAI is a technology company revolutionizing PostgreSQL development and operations. We provide tools and services that make working with PostgreSQL databases faster, safer, and more efficient:

- **DBLab Engine**: Our flagship open-source platform for instant database cloning and branching
- **PostgresAI Assistant**: Free AI-powered PostgreSQL expert available 24/7
- **Zero-downtime solutions**: Tools and expertise for seamless PostgreSQL upgrades
- **Expert consulting**: PostgreSQL performance optimization and architecture services

We help companies ship database changes 10x faster while reducing infrastructure costs and preventing production incidents.

### What makes PostgresAI different?

We provide a comprehensive PostgreSQL platform that transforms how teams work with databases:

**DBLab Engine - Database Branching & Cloning:**
- **Instant database branching**: Create full-size database branches in 10 seconds (vs. hours with traditional methods)
- **True CI/CD for databases**: Test every migration with production data using DBLab clones
- **Cost efficiency**: Run 50+ DBLab clones on a single machine
- **Developer empowerment**: Self-service database environments on demand with DBLab

**PostgresAI Assistant - AI-Powered Expertise:**
- **Multi-model AI support**: Choose between GPT, Claude, and Gemini for PostgreSQL assistance
- **24/7 availability**: Get expert-level answers instantly, no waiting for human experts
- **Context-aware responses**: Understands complex PostgreSQL scenarios and best practices

**Professional Services & Tools:**
- **Zero-downtime upgrades**: Proven methodologies and tools for risk-free PostgreSQL migrations
- **Performance optimization**: Expert consulting for query tuning and architecture design
- **Custom solutions**: Tailored PostgreSQL tools for specific enterprise needs

**Open Source Leadership:**
- **Community-driven development**: Core products are open source with transparent roadmaps
- **PostgreSQL ecosystem contributions**: Active participation in advancing PostgreSQL technology

## DBLab

### What is DBLab Engine?

DBLab Engine is an open-source platform that enables instant cloning and branching for PostgreSQL databases. It allows you to:

- Create full-size database clones in seconds, regardless of size
- Test migrations, optimize queries, and debug issues with real data
- Integrate database testing into CI/CD pipelines
- Provide isolated development environments to every team member

### How fast is database cloning?

- **1 TB database**: ~10 seconds
- **10 TB database**: ~10 seconds
- **Speed is constant** regardless of database size

Traditional approaches would take hours or days for such operations.

### What editions are available?

**Community Edition (Free)**
- Open-source (Apache 2.0 license)
- Full thin cloning capabilities
- Community support
- Perfect for small teams and POCs

**Standard Edition (SE)**
- Commercial support included
- Compatible with managed databases (RDS, Cloud SQL, etc.)
- One-click deployment via Console
- Monitoring and alerting included
- Starting from $0.27/hour

**Enterprise Edition (EE)**
- Everything in SE, plus:
- Unified control plane for multiple instances
- SSO and advanced user management
- Comprehensive audit logs
- API for automation
- Custom pricing based on requirements

### What is "thin cloning"?

Thin cloning uses Copy-on-Write (CoW) technology to create virtual database copies that:
- Share unchanged data blocks between clones
- Appear as completely independent databases
- Support full read/write operations
- Use minimal additional storage

This is fundamentally different from traditional copying, which duplicates all data.

### How does DBLab Engine work?

1. **Initial sync**: DBLab copies data from your source database (thick clone)
2. **Continuous sync**: Keeps data up-to-date using logical or physical replication
3. **Snapshot management**: Automatically creates and manages data snapshots
4. **Instant cloning**: Creates thin clones from any snapshot in seconds
5. **Isolation**: Each clone is fully isolated and can be modified independently

### What technologies does DBLab use?

- **Storage**: ZFS (recommended) or LVM for Copy-on-Write capabilities
- **Containerization**: Docker for clone isolation
- **Replication**: PostgreSQL logical/physical replication for data sync
- **API**: RESTful API for automation and integration

### Do I need to modify my production database?

**No.** DBLab runs completely separately from your production environment. It only needs:
- Read access to your database (for initial copy)
- Replication connection (for continuous sync)
- No ZFS, Docker, or special software on production

### Who uses DBLab Engine?

**Development Teams**
- Get production-like data for development
- Test database changes before deployment
- Debug production issues safely

**DevOps Engineers**
- Automate database provisioning in CI/CD
- Reduce staging environment costs
- Standardize database workflows

**QA Teams**
- Test with real data scenarios
- Reproduce production bugs
- Validate data migrations

**DBAs**
- Optimize queries with production data
- Test PostgreSQL upgrades safely
- Train junior DBAs without risk

### What problems does DBLab solve?

✅ **Long wait times** for database copies
✅ **High infrastructure costs** for non-production environments
✅ **Production incidents** from untested database changes
✅ **Developer productivity** bottlenecks
✅ **Compliance issues** with production data access

### What infrastructure do I need for DBLab?

**For DBLab Engine:**
- Dedicated machine (VM or physical)
- Disk space = database size + 20% overhead
- 16GB+ RAM recommended
- Any modern Linux distribution
- Network access to source database

**Supported environments:**
- ✅ AWS, GCP, Azure
- ✅ On-premises data centers
- ✅ VMware, Nutanix
- ✅ Any PostgreSQL 9.6+

### Can I use DBLab with managed databases?

Yes! DBLab works with:
- Amazon RDS & Aurora
- Google Cloud SQL
- Azure Database for PostgreSQL
- Heroku Postgres
- Supabase
- Any PostgreSQL-compatible service

For managed databases, we use logical replication for data synchronization.

### How quickly can I get started with DBLab?

- **Community Edition**: 1-2 hours to first clone
- **Standard Edition**: 15 minutes with guided setup
- **POC Support**: We offer free POC assistance


### Is my data secure?

- DBLab runs in your infrastructure
- No data leaves your environment
- Full audit logging (Enterprise Edition)
- Encryption at rest and in transit
- Role-based access control

### Can I mask sensitive data?

Yes! DBLab supports:
- Custom data masking rules
- Subset data for smaller clones
- Compliance with GDPR, HIPAA, SOC2

### How is DBLab priced?

**Community Edition**: Free forever (Apache 2.0 license)

**Standard Edition**: Based on compute resources
- Starts at ~$63/month (excl. costs of cloud resources)
- No per-database or per-clone fees
- Transparent hourly billing

**Enterprise Edition**: Annual contracts
- Custom pricing based on scale
- Includes professional services
- SLA guarantees

### How do I get support?

**Community Edition:**
- [Community Slack](https://slack.postgres.ai)
- [GitLab issues](https://gitlab.com/postgres-ai/database-lab/-/issues)
- [Documentation](/docs)

**Paid Editions:**
- Dedicated support team
- Email/Slack/Zoom priority support
- Support of custom Postgres images and Postgres images for popular Postgres platforms ([details](https://postgres.ai/docs/database-lab/#paid-versions-dblab-se-and-ee))
- Custom training available

### Where can I learn more?

- [Documentation](/docs)
- [DBLab Engine GitLab repository](https://gitlab.com/postgres-ai/database-lab)
- [Blog](/blog) – echnical articles and case studies

### How do I contact PostgresAI?

See the ["Contact us"](/contact) page.

## PostgresAI Assistant

### What is PostgresAI Assistant?

An AI-powered chatbot specifically trained for PostgreSQL questions, supporting multiple leading AI models including GPT, Claude, and Gemini. It helps with:
- Query optimization
- Schema design
- Performance troubleshooting
- Best practices guidance
- PostgreSQL feature explanations

Available at https://postgres.ai - no registration required for public conversations.

### Is PostgresAI Assistant really free?

Yes! Public conversations are completely free. For private conversations with sensitive data, you can register your organization in the Console.

---

*Have a question not answered here? Contact us at support@postgres.ai*