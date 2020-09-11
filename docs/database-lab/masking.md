---
title: Database Lab data masking
sidebar_label: Data masking
---

##  Premasking
Allows to easialy setup dynamic masking rules, without actual data changing. Data is masked only during logical dump on the side of the database.

### Option 1а. Anonymized dump
Database Lab retrieves the data from production in the form of an anonymized logical dump. Requires additional masking set up on the production.

![Premasking / Option 1а. Anonymized dump](/docs/assets/masking-1a-dump.png)

#### Pros
- PII only on production
- Identical data structure for development and optimization

#### Cons
- Anonymization affects production performance

### Option 1b. Anonymized dump using additional Database Lab Engine
Database Lab Engine in the production infrastructure is used to create an anonymized dump. Database Lab Engine in the test/dev/staging environment retrieves the data from the production in the form of an anonymized dump.

![Premasking / Option 1b. Anonymized dump using additional Database Lab Engine](/docs/assets/masking-1b-dump-add.png)

#### Pros
- PII only on production
- Identical data structure for development and optimization
- Data anonymization without affecting the production database
- Data recovery and heavy analytics queries without affecting the production database

#### Cons
 Deployment of additional Database Lab Engine

## Postmasking
Allows to set up dynamic masking rules, without actual data changing. Data is dynamically masked on the side of the Database Lab Engine.

### Option 2a. Database Lab Engine on production
Database Lab Engine deployed only on production infrastructure and works with PII. Depending on the access level developers may or may not have access to the unmasked data.

![Postmasking / Option 2a. Database Lab Engine on production](/docs/assets/masking-2a-production.png)

#### Pros
- PII only on production
- Identical data structure for development and optimization
- Data anonymization without affecting the production database
- Data recovery and heavy analytics queries without affecting the production database
- Easy to deploy

#### Cons
- High requirements for security administration
- Harder to configure access for developers to use the Database Lab

### Option 2b. Database Lab Engine in Test/Dev/Staging
Database Lab Engine deployed only on test/dev/staging infrastructure and works with PII. Developers work with masked data.

![Postmasking / Option 2b. Database Lab Engine in Test/Dev/Staging](/docs/assets/masking-2b-staging.png)

#### Pros
- Identical data structure for development and optimization
- Data anonymization without affecting the production database
- Data recovery and heavy analytics queries without affecting the production database
- Easy to deploy

#### Cons
- PII physically copied from the production infrastructure (but cannot be accessed by developers)
- High requirements for security administration of test/dev/staging environments

## Obfuscation

Instead of masking, the data can be deleted permanently, e.g. during snapshot creation.

Options:
- Use custom obfuscation script (define it using `preprocessingScript` option of [`logicalSnapshot`](/docs/database-lab/config-reference#job-logicalsnapshot) or [`physicalSnapshot`](/docs/database-lab/config-reference#job-physicalsnapshot) jobs);
- Use the [In-place anonymization](https://postgresql-anonymizer.readthedocs.io/en/latest/in_place_anonymization/) of PostgreSQL Anonymizer.
