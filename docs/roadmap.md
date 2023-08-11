---
title: Database Lab development roadmap
sidebar_label: Roadmap
description: Development roadmap for Database Lab Engine and related products.
keywords:
  - "Postgres.ai development roadmap"
  - "Database Lab development roadmap"
---

## Roadmap
We work hard to develop the Database Lab Platform (DLP) and its open-source core component, Database Lab Engine (DLE). Below you can find the main ideas we are working on now or planning to work soon.

*Updated: 2022-01-20*

### [DLE] Physical provisioning
Physical provisioning: native support of provisioning from archives created by a specific backup solution or based on an existing Postgres database

- [ ] Support various sources
    - [x] Generic (anything: pg_basebackup, rsync, any backup tools)
    - Native support for specific backup tools
        - [x] WAL-E/WAL-G
        - [ ] pgBackRest
        - [ ] Barman
        - [ ] pg_probackup
- [x] Continuously updated state (physical replication based on WAL shipping)
- [x] Snapshot management (schedule, retention policy)

### [DLE] Logical provisioning
Logical provisioning: native support of provisioning for managed PostgreSQL databases

- [x] Support various sources
    - [x] Any PostgreSQL DB via dump/restore: Amazon RDS, Heroku Postgres, Azure PostgreSQL, GCP CloudSQL, Digital Ocean Postgres, etc.
    - [x] AWS: RDS IAM
    - [ ] GCP: CloudSQL IAM
    - [ ] Azure IAM
    - [x] Restore from backups stored on AWS S3
        - [x] uncompressed
        - [x] compressed (gzip, bzip2)
- [ ] Continuously updated state (logical replication)
- [x] Dump/restore on the fly (without need to save dumps on disk)
- [x] Multiple pools, rotation/refresh on schedule
    - [ ] "Selected pool": allow to specify pool for the case when multiple DLEs are running on the same machine
    - [ ] Advanced refresh policies: force refresh on pools being in use, warning period, number of retries before forcing
- [ ] Partial data retrieval
    - [x] specific databases
    - [x] specific tables
    - [ ] arbitrary filtering (column and row filtering)

### [DLE] Engine features
- [x] Persist clones when the engine restarts (added in DLE 3.0.0)
- [ ] Point-in-time recovery (PITR) (Can be used for ultra-fast recovery of accidentally deleted data)
- [ ] Troubleshoot/test standby behavior
    - [ ] Create clone running in read-only mode to allow troubleshooting hot standby issues
    - [ ] Allow launching N replicas for a clone
    - [ ] For the "physical" mode: create clone from "pre" snapshot (read-only, unpromoted; admins only)
- [ ] Duplicate DLE (create a new DLE based on existing one)
- [ ] Clone observability
    - [ ] "Temporary" system- and Postgres-level monitoring for clones/sessions
    - [ ] Clone analytics
    - [ ] Advanced audit
    - [ ] perf/FlameGraphs
- [ ] Utilization of DLE instance and alerts
- [ ] Usage and estimated savings reports
- [x] SSH port forwarding for API and Postgres connections
- [ ] Tags
- [ ] Framework for macro database experiments (work with thick/regular clones)
- [ ] Auto-register DLE in Platform
- [x] Resource usage quotas for clones: CPU, RAM (container quotas, supported by Docker)
- [ ] User quotas
- [ ] Disk quotas (`zfs set quota=xx`)
- [x] GUI with key features (added in DLE 3.0.0)
- [ ] Fast connection to clone's DB via CLI
- [ ] Advanced snapshot management
    - [ ] API handle to create/destroy snapshots (for continuously updated state)
    - [ ] User-defined snapshots for clones
    - [ ] Snapshot export/import (S3)
- [ ] Advanced schema management
    - [ ] schema diff
    - [ ] zero-downtime DDL auto-generation
- [x] Reset clone's state to particular database version – keeping DB creds the same (including port)
    - [x] physical: allow choosing `dataStateAt`
    - [x] logical: allow "jumping" between DB versions (pools)

### [DLP] Platform features
- [x] Support working with multiple DLEs
- [x] Backups, PITR
- [x] User management: basic permissions
- [ ] User management: advanced permissions
- [ ] SSO
- [ ] Clone (Postgres, Postgres over SSH / port forwarding) connection options
    - [ ] LDAP
    - [ ] SSH key management
- [ ] Security
    - [ ] Security overview: software used, incidents, code analysis
    - [x] Basic audit logging
    - [ ] Advanced audit logging and alerting
    - [ ] Export audit logs from GUI
- [ ] Usage stats
- [ ] Monitoring
- [ ] Notifications
    - [ ] Notification management – turn on/off all or specific ones
    - [ ] Non-deletable clone is abandoned / not used for too long 
    - [ ] Clone and snapshot is using too much disk space / out-of-disk-space risks
    - [ ] CPU saturation
    - [ ] Disk space saturation
    - [ ] Disk IO saturation 
    - [ ] Refresh cannot be done because all pools are busy and policy doesn't allow forced refresh 
    - [ ] Full refresh started
    - [ ] Full refresh finished
    - [ ] Lag value is too high ("sync" container)
    - [ ] Initial data retrieval started
    - [ ] Initial data retrieval finished
    - [ ] Snapshot created
    - [ ] Snapshot deleted
- [ ] Pricing, billing
    - [x] pricing based on disk space used
    - [x] report usage to postgres.ai
    - [ ] flexible pricing options
    - [ ] AWS: instance type and size based

### [DLP] Automated verification of database schema and complex data changes a.k.a. DB migrations
- [x] History and logging for clones/sessions
- [x] Automated detection of locking issues
- [x] Setting custom `statement_timeout`
- [x] PostgreSQL logs for the migration
- [x] Report in CI and Platform
- [ ] Integration with CI tools – advanced integration
    - [x] GitHub Actions
    - [ ] Bitbucket CI/CD
    - [ ] CitcleCI
    - [ ] Jenkins
    - [ ] GitLab CI/CD
    - [ ] Bamboo
    - [ ] TravisCI
- [x] Support various database migration tools + demo
    - [x] Sqitch
    - [x] Flyway
    - [x] Liquibase
    - [x] Ruby on Rails Active Record
    - [x] Django migrations
- [x] "Production timing" estimator (experimental feature, added in DLE 2.3.0, removed in DLE 3.4.0)
- [x] More artifacts to support decisions: pg_stat_*, system usage, WAL, checkpoints, etc.

### [DLE] Cloning (CoW technology)
- [x] ZFS
- [x] LVM
- [ ] Storage-based CoW

### [DLP] Automation, clouds, Kubernetes
- [ ] Simplify setup for major Cloud Service Providers, automation of installation in clients' accounts
    - [x] Basic Terraform templates
    - [ ] One-click setup on AWS. AWS Marketplace
    - [ ] One-click setup on GCP. GCP Marketplace
    - [ ] One-click setup on Azure. GCP Marketplace
- [ ] Cloud DLP ("DLP SaaS"): cloud offering (fully managed DLE and DLP)
    - [ ] AWS
    - [ ] GCP
    - [ ] Azure
- [ ] Self-managed DLP ("DLP Enterprise"): work multiple DLEs and all DLP features in customer's account
- [ ] Cost optimization
    - [ ] AWS spot instances
    - [ ] GCP preemptible instances (24h max)
    - [ ] Azure spot instances
    - [ ] AWS/GCP/Azure: Self-stopping instances for cost savings, keeping disk present, and refreshing when needed
- [ ] Kubernetes support
    - [ ] DLE operator
    - [ ] Integration with [StackGres](https://stackgres.io) 
        - [x] PoC (logical, physical: WAL-E/G)
        - [ ] integration
    - [ ] Support [CSI Volume Cloning](https://kubernetes.io/docs/concepts/storage/volume-pvc-datasource/) (GA: k8s 1.18)

### [DLP/Joe] SQL optimization chatbot
- [x] Web UI version
- [x] Slack chatbot
- [ ] Telegram chatbot
- [x] History with Search and Share options
- [ ] Visualizations
    - [x] explain.depesz
    - [x] explain.dalibo (PEV2)
    - [ ] pgMustard (WebUI/SaaS only)
    - [ ] FlameGraphs
- [ ] Better optimization recommendations
- [ ] Macroanalysis insights (suggestions based on postgres-checkup / pgss)
- [x] Hypothetical indexes
- [ ] Hypothetical partitioning
- [ ] Index advisor
- [ ] Utilization control
- [x] Restore user sessions after Joe container restarts
- [ ] Better chatbot security
    - [x] Do not use DB superuser
    - [x] Quotas (rate limits)
    - [ ] Alert admins when a quota is reached
- [ ] Runtime execution plan observability: [pg_query_state](https://github.com/postgrespro/pg_query_state)
- [ ] Reset to specific `dataStateAt`
- [ ] perf/FlameGraphs
- [ ] Wait event sampling

### [SaaS] Data masking and anonymization
- [x] Basic support for masking and obfuscation
    - [x] custom scripts
    - [x] parallel execution of custom scripts
    - [x] [postgres_anonymizer](https://postgresql-anonymizer.readthedocs.io/en/stable/masking_functions.html)
    - [x] [kitchen-sync](https://github.com/willbryant/kitchen_sync)
    - [ ] [pgsync](https://github.com/ankane/pgsync)
- [ ] Hybrid setup: raw and obfuscated/masked clones on the same DLE instance
- [ ] Dump/restore with runtime anonymization, parallelized, via GitOps
- [ ] Simplified setup for anonymization - GUI
- [ ] Automated masking / anonymization

### [Docs] Better documentation and demo
- [ ] Tutorials
    - [x] Basic
    - [x] RDS
    - [x] SQL optimization using Joe bot
    - [x] DB migration testing in CI/CD pipelines
    - [x] Katacoda
- [ ] User Guides
    - [x] DLE setup and administration
    - [x] Cloning
    - [x] SQL optimization with Joe bot
    - [ ] Building non-production environments
- [x] References
    - [x] DLE API
    - [x] CLI
    - [x] DLE configuration
    - [x] Joe configuration
- [ ] Explanations and concepts
    - [ ] SQL optimization workflow with Database Lab
    - [ ] Configuration details
    - [ ] Why and how SQL optimization is possible on thin clones
    - [x] Security aspects
    - [ ] Secure and robust test/staging environments
- [ ] Interactive demo
    - [x] Basic DLE features
    - [x] SaaS features
    - [x] SQL optimization using Joe bot (WebUI)
    - [ ] DB migration testing (GitHub Actions)
    - [ ] Advanced examples, use cases
- [ ] Video demonstrations
