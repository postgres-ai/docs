---
title: Database Lab development roadmap
sidebar_label: Roadmap
description: Development roadmap for Database Lab Engine and related products.
keywords:
  - "Postgres.ai development roadmap"
  - "Database Lab development roadmap"
---

## Roadmap
We work hard to develop new features for Database Lab SaaS and its open-source components, Database Lab Engine (DLE) and SQL Optimization Chatbot (Joe). Below you can find the main ideas we are working on now or planning to work soon.

*Updated: 2021-09-07*

### [DLE] Physical provisioning
Physical provisioning: native support of provisioning from archives created by a specific backup solution or based on an existing Postgres database

- [ ] Support various sources
    - [x] Generic (anything: pg_basebackup, rsync, backup tools)
    - Native support
        - [x] WAL-E/WAL-G backups
        - [ ] pgBackRest backups
        - [ ] Barman backups
        - [ ] pg_probackup backups
        - [ ] Nutanix Era
- [x] Continuously updated state (physical replication based on WAL shipping)
- [x] Snapshot management (schedule, retention policy)
- [ ] faster WAL replay (pg_prefaulter)

### [DLE] Logical provisioning
Logical provisioning: native support of provisioning for managed PostgreSQL databases

- [x] Support various sources
    - [x] Simple dump/restore
    - [x] Amazon RDS
    - [x] Heroku Postgres
    - [x] Azure PostgreSQL
    - [x] Google Cloud SQL for Postgres
    - [x] Digital Ocean Postgres
    - [x] Any PostgreSQL DB via dump/restore
- [ ] Continuously updated state (logical replication)
- [x] Restore from backups stored on AWS S3
    - [x] uncompressed
    - [x] compressed (gzip, bzip2)
- [x] Multiple pools, rotation on schedule
- [ ] Partial data retrieval
    - [ ] specific tables
    - [ ] arbitrary filtering (columns, rows)

### [DLE] Engine features
- [ ] Persist clones when the engine restarts :fire:
- [ ] Point-in-time recovery (PITR) (Can be used for ultra-fast recovery of accidentally deleted data)
- [ ] Duplicate DLE (create a new DLE based on existing one)
- [ ] Clone analytics
- [ ] Advanced audit
- [ ] "Temporary" system- and Postgres-level monitoring for clones/sessions
- [ ] Utilization of DLE instance and alerts
- [ ] Usage and estimated savings reports
- [x] SSH port forwarding for API and Postgres connections
- [ ] Tags
- [ ] Framework for macro database experiments (work with thick/regular clones)
- [ ] Auto-register DLE in Platform
- [x] Resource usage quotas for clones: CPU, RAM (container quotas, supported by Docker)
- [ ] User quotas
- [ ] Disk quotas (`zfs set quota=xx`)
- [ ] GUI with key features
- [ ] Fast connection to clone's DB via CLI

### [SaaS] Automated verification of database schema and complex data changes a.k.a. DB migrations
- [a] History and logging for clones/sessions
- [a] Automated detection of locking issues
- [a] Setting custom `statement_timeout`
- [a] PostgreSQL logs for the migration
- [a] Report in CI and Platform
- [ ] Integration with CI tools – advanced integration
    - [x] GitHub Actions
    - [ ] Bitbucket CI/CD
    - [ ] CitcleCI
    - [ ] Jenkins
    - [ ] GitLab CI/CD
    - [ ] Bamboo
    - [ ] TravisCI
- [x] Support vairous database migration tools + demo
    - [x] Sqitch
    - [x] Flyway
    - [x] Liquibase
    - [x] Ruby on Rails Active Record
    - [x] Django migrations
- [e] "Production timing" estimator
- [x] More artifacts to support decisions: pg_stat_*, system usage, WAL, checkpoints, etc.

### [DLE] Cloning (CoW technology)
- [x] ZFS
- [x] LVM
- [ ] PureStorage
- [ ] Remote clones – Amazon Aurora, Zenith

### [SaaS] Automation, clouds, Kubernetes
- [ ] Clouds, automation of installation in clients' accounts
    - [x] Basic Terraform templates
    - [ ] One-click setup on AWS. AWS Marketplace
    - [ ] One-click setup on GCP. GCP Marketplace
    - [ ] One-click setup on Azure. GCP Marketplace
    - [ ] One-click setup on Alibaba
- [ ] SaaS: cloud offering (fully managed Database Lab)
    - [ ] AWS
    - [ ] GCP
    - [ ] Azure
    - [ ] Ali
- [ ] AWS Spot instances for further savings
- [ ] Kubernetes support
    - [ ] DLE operator
    - [ ] Integration with [StackGres](https://stackgres.io) 
        - [x] PoC (logical, physical:WAL-E)
        - [ ] integration
    - [ ] Support [CSI Volume Cloning](https://kubernetes.io/docs/concepts/storage/volume-pvc-datasource/) (GA: 1.18)

### [Joe] SQL optimization chatbot
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
    - [ ] Alert admins when a quota is hit

### [SaaS] Data masking and anonymization
- [x] Basic support for masking and obfuscation
    - [x] custom scripts
    - [x] parallel execution of custom scripts
    - [x] [postgres_anonymizer](https://postgresql-anonymizer.readthedocs.io/en/stable/masking_functions.html)
    - [x] [kitchen-sync](https://github.com/willbryant/kitchen_sync)
    - [ ] [pgsync](https://github.com/ankane/pgsync)
- [ ] Hybrid setup: raw and obfuscaned/masked clones on the same DLE instance
- [ ] Dump/restore with runtime anonimization, parallelized, via GitOps
- [ ] Simplified setup for anonymization - GUI
- [ ] Automated masking / anonymization

### [Docs] Better documentation and demo
- [ ] Tutorials
    - [x] Basic
    - [x] RDS
    - [x] SQL optimization using Joe bot
    - [ ] DB migration testing in CI/CD pipelines
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
