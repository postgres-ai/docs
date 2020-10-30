---
title: Database Lab roadmap
sidebar_label: Roadmap
description: Development roadmap for Database Lab Engine and related products.
keywords:
  - "Postgres.ai roadmap"
  - "Database Lab development roadmap"
---

## Roadmap
We work hard to develop new features for Database Lab Engine and Platform. Below you can find the main ideas we are working on now or planning to work soon.

*Edited: 2020-10-13*

### Physical provisioning
Physical provisioning: native support of provisioning from archives created by a specific backup solution or based on an existing Postgres database

- [ ] Support various sources
    - [x] Arbitrary Postgres instance (pg_basebackup, rsync)
    - [x] WAL-E/WAL-G backups
    - [ ] pgBackRest backups
    - [ ] Barman backups
    - [ ] pg_probackup backups
    - [ ] Nutanix Era
- [x] Continuously updated state (physical replication based on WAL shipping)
- [x] Snapshot management (schedule, retention policy)
- [ ] faster WAL replay (pg_prefaulter)

### Logical provisioning
Logical provisioning: native support of provisioning for managed PostgreSQL databases

- [ ] Support various sources
    - [x] Simple dump/restore
    - [x] Amazon RDS
    - [ ] Heroku Postgres
    - [ ] Azure PostgreSQL
    - [ ] Google Cloud SQL for Postgres
    - [ ] Digital Ocean Postgres
- [ ] Continuously updated state (logical replication)
- [ ] Snapshot management (schedule, retention policy)
- [ ] Simplified full refresh
- [ ] Partial data retrieval
    - [ ] specific tables
    - [ ] arbitrary filtering (columns, rows)

### Advanced engine features
- [ ] Point-in-time recovery (PITR) (Can be used for ultra-fast recovery of accidentally deleted data)
- [ ] Duplicate DLE (create a new DLE based on existing one)
- [ ] Utilization alerts
- [ ] Clone analytics
- [ ] User quotas
- [ ] Audit
- [ ] "Tmp" system- and Postgres-level monitoring for clones/sessions
- [ ] Utilization of DLE instance and alerts
- [ ] Usage and estimated savings reports
- [x] SSH port forwarding for API and Postgres connections
- [ ] Tags
- [ ] Framework for macro database experiments (work with thick clones)
- [ ] Auto-register DLE in Platform

### Automated verification of database schema and complex data changes (migrations)
- [a] History and logging for clones/sessions
- [a] Automated detection of locking issues
- [a] Setting custom `statement_timeout`
- [a] PostgreSQL logs for the migration
- [a] Report in CI and Platform
- [ ] Integration with CI tools – advanced integration
    - [ ] GitHub Actions
    - [ ] CitcleCI
    - [ ] Jenkins
    - [ ] GitLab CI/CD
    - [ ] Bamboo
    - [ ] TravisCI
- [ ] Database migration tools – advanced integration
    - [ ] Sqitch
    - [ ] Flyway
    - [ ] Liquibase
    - [ ] Ruby on Rails Active Record
    - [ ] Django migrations

### Cloning
- [x] ZFS
- [x] LVM
- [ ] PureStorage
- [ ] Remote clones – Amazon Aurora

### Automation, clouds, Kubernetes
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
- [ ] Kubernetes support
    - [ ] DLE operator
    - [ ] Integration with [StackGres](https://stackgres.io) 
        - [x] PoC (logical, physical WAL-E)
        - [ ] integration
    - [ ] Support [CSI Volume Cloning](https://kubernetes.io/docs/concepts/storage/volume-pvc-datasource/) (GA: 1.18)

### SQL optimization – Joe bot
- [x] Web UI version
- [x] Slack chatbot
- [ ] Telegram chatbot
- [x] History with Search and Share options
- [ ] Visualizations
    - [x] explain.depesz
    - [x] explain.dalibo (PEV2)
    - [ ] pgMustard (EE only)
    - [ ] FlameGraphs
- [ ] Better optimization recommendations
- [ ] Macroanalysis insights (suggestions based on postgres-checkup / pgss)
- [x] Hypothetical indexes
- [ ] Hypothetical partitioning
- [ ] Index advisor
- [ ] Utilization control

### Data masking and obfuscation
- [x] Basic support for masking and obfuscation
    - [x] custom scripts
    - [x] parallel execution of custom scripts
    - [x] [postgres_anonymizer](https://postgresql-anonymizer.readthedocs.io/en/stable/masking_functions/)
    - [x] [kitchen-sync](https://github.com/willbryant/kitchen_sync)
    - [ ] [pgsync]https://github.com/ankane/pgsync)
- [ ] Hybrid setup: raw and obfuscaned/masked clones on the same DLE instance
- [ ] Automated masking
- [ ] Automated obfuscation

### Better documentation
- [ ] Tutorials
    - [x] Basic
    - [x] RDS
    - [ ] Specific cases
- [ ] User Guides
    - [x] DLE setup and administration
    - [x] Cloning
    - [x] SQL optimization with Joe bot
    - [ ] Checkups
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
- [ ] Video demonstrations
