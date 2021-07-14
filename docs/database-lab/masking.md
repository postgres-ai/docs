---
title: Database Lab data masking and obfuscation
sidebar_label: Data masking and obfuscation
description: Strategies for data anonymization of PostgreSQL databases – build secure non-production environments.
keywords:
  - "PostgreSQL masking"
  - "Postgres data obfuscation"
  - "Postgres data anonymization"
  - "database lab anonymization"
  - "database lab masking"
  - "dynamic data masking"
  - "PostgreSQL GDPR"
  - "PostgreSQL CCPA"
  - "PostgreSQL PII data compliance"
---

## Data masking: "pre-masking"
Allows setting up dynamic masking rules without actual data changes. According to these rules, PII (personally identifiable information) data is masked only when certain users access it.

### Pre-masking, option 1а: dump without PII directly from a production server
Database Lab retrieves the data from production in the form of an anonymized logical dump. This approach requires additional masking set up on the primary production database. Dumping may happen on a replica.

![Pre-masking / Option 1а. Anonymized dump](/assets/masking-1a-dump.png)

#### Pros
- Very secure: PII is stored only on production and does not reach the Database Lab Engine
- In some cases, easier to set up: does not require an additional Database Lab Engine

#### Cons
- May require installation of additional extensions on production servers.
- Anonymization affects production servers' performance: increased disk IO, bloat growth and/or replication lags.
- Data structure is not identical to production, making SQL troubleshooting and optimization less reliable.

### Pre-masking, option 1b: anonymized dump using additional Database Lab Engine
Database Lab Engine in the production infrastructure is used to create an anonymized dump. Database Lab Engine in the test/dev/staging environment retrieves the data from the production in the form of an anonymized dump.

![Pre-masking / Option 1b. Anonymized dump using additional Database Lab Engine](/assets/masking-1b-dump-add.png)

#### Pros
- Very secure: PII is stored only on production and does not reach the Database Lab Engine
- Data anonymization is not affecting production servers
- Data recovery and heavy analytics queries are not affecting production servers (executed on the "production" Database Lab Engine server)

#### Cons
- Requires an additional Database Lab Engine
- Data structure is not identical to production, making SQL troubleshooting and optimization less reliable

## Data masking: "post-masking"
Allows to set up dynamic masking rules, without actual data changing. Data is dynamically masked on the side of the Database Lab Engine.

### Post-masking, option 2a: Database Lab Engine on production
Database Lab Engine is deployed only on production infrastructure, and it physically stores PII. Depending on the access level, developers may or may not have access to the unmasked data.

![Post-masking / Option 2a. Database Lab Engine on production](/assets/masking-2a-production.png)

#### Pros
- Very secure: PII is stored only on the production environment (the Database Lab server also has it, but it also resides in the production environment)
- Physical data layout is identical to production, best conditions for SQL troubleshooting, and optimization
- Data anonymization is not affecting production servers

#### Cons
- High requirements for security administration
- More difficult to configure and maintain access (developers need to deal with the production environment; automation scripts need to reach the Database Lab Engine, which may cause complications)

### Post-masking, option 2b: Database Lab Engine in Test/Dev/Staging
Database Lab Engine is deployed only on test/dev/staging infrastructure, and it physically stores PII. Developers work with masked data.

![Post-masking / Option 2b. Database Lab Engine in Test/Dev/Staging](/assets/masking-2b-staging.png)

#### Pros
- Identical data structure for development and optimization
- Physical data layout is identical to production, best conditions for SQL troubleshooting, and optimization
- Data anonymization is not affecting production servers
- Data recovery and heavy analytics queries are not affecting production servers

#### Cons
- PII is physically copied from the production infrastructure and stored non-production (but cannot be accessed by developers).
- High requirements for security administration of test/dev/staging environments.

## Data obfuscation
Instead of masking, the data can be deleted permanently, e.g., during snapshot creation. Usually, this is a massive change requiring significant time and disk space.

Database Lab Engine supports obfuscation of any type via injecting an SQL transformation to the process of preparation of snapshots for thin clones.

Options:
- Use custom obfuscation script (define it using `preprocessingScript` option of [`logicalSnapshot`](/docs/reference-guides/database-lab-engine-configuration-reference#job-logicalsnapshot) or [`physicalSnapshot`](/docs/reference-guides/database-lab-engine-configuration-reference#job-physicalsnapshot) jobs)
- Use PostgreSQL Anonymizer: [Permanently remove sensitive data](https://postgresql-anonymizer.readthedocs.io/en/stable/static_masking.html)

#### Pros
- PII data anonymization not affecting production servers
- Data recovery and heavy analytics queries are not affecting production servers
- Moderately difficult to set up

#### Cons
- Data structure is not identical to production, making SQL troubleshooting and optimization less reliable
- PII is physically copied from the production infrastructure (but cannot be accessed by developers)
- High requirements for security administration of test/dev/staging environments
