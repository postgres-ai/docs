---
title: Database Lab pricing
sidebar_label: Pricing
---

## Overview

- The billing is based on the overall size of your databases (physical size on disk, observed by `df`)
- For billing purposes, Database Lab Engine automatically tracks the size of the data directory, on an hourly basis
- Two payment models are available:
    - "Cloud" model:
        - $2.6624 / per TiB per hour (with GiB precision),
        - once the billing cycle (a month) is finalized, the Platform automatically generates both the detailed report and the invoice,
        - payments are made based on this invoice and credit card on file ([Stripe](https://stripe.com) is used for all automated payments),
        - this model is most convenient for smaller companies, it is based on usage (calculated hourly).
    - "Enterprise" model:
        - the price is based on the analysis of your company's needs, several Tiers are available:
            - up to 1 TiB: $1,950 monthly (minimum for this model),
            - up to 3 TiB: $5,432 monthly (discount 7.14%),
            - up to 5 TiB: $8,287 monthly (discount 15%),
            - up to 10 TiB: $14,625 monthly (discount 25%),
            - more than 10 TiB: reach out to the Sales team for a special offering;
        - the limit may be exceeded any time, no service interruption occurs, but the detailed usage is recorded and reported at the end of the billing period,  
        - payment is made prior to the use, via the Sales team, based on an individual contract,
        - billing period options: monthly, quarterly, or annually, 
        - reach out to the Sales team to learn more: sales@postgres.ai.
- Two weeks trial, that could be extended by participating in the Liable Beta Tester program
- Database Lab Engine is always hosted on your infrastructure, and the data never leaves your infrastructure


[Try Database Lab now](https://postgres.ai/console)

## Features

| Features | Community<br/>Edition | Enterprise<br/>Edition |
| :------- | :------------------: | :-------------------: |
| **Features** | **Community<br/>Edition** | **Enterprise<br/>Edition** |
|Price|Free|$2.6624 /<br/>per TiB per hour|
||||
|**Platform – all components, with API, CLI, and GUI**|✅|✅|
|**Personal tokens in API, CLI**|❌|✅|
||||
|**Thin clones (Database Lab)**|||
|Thin cloning in seconds|✅|✅|
|Multiple snapshots and simultaneous independent clones|✅|✅|
|Full API access (REST, CLI, SDK)|✅|✅|
|Snapshot management and recycling|✅|✅|
|Clone management and recycling (of idle clones)|✅|✅|
|Customization of Postgres Docker images|✅|✅|
|Database refresh (from backup system, dumps): periodical or continuous|✅|✅|
|AWS RDS support|✅|✅|
|Anonymization / obfuscation / masking of PII data *(Roadmap)*|✅|✅|
|Simple deployment to AWS or GCP *(Roadmap)*|❌|✅|
|Fast recovery to arbitrary point in time (PITR) *(Roadmap)*|❌|✅|
||||
|**SQL optimization environment (Joe Bot)**|||
|Session management and recycling|✅|✅|
|Support hypothetical indexes|✅|✅|
|Support hypothetical partitioning *(Roadmap)*|✅|✅|
|Index advisor *(Roadmap)*|✅|✅|
|Slack chatbot|✅|✅|
|Web chatbot|❌|✅|
|Private chats|❌|✅|
|SQL optimization knowledge base|❌|✅|
|SQL query visualization|❌|✅|
|Integration with postgres-checkup, seamless SQL optimization workflow *(Roadmap)*|❌|✅|
|Advanced SQL tutorials *(Roadmap)*|❌|✅|
|Smart auto-deletion and/or auto-deletion control *(Roadmap)*|❌|✅|
|Channel mapping: one Joe can work with multiple Database Lab instances / multiple databases|❌|✅|
|Share session *(Roadmap)*|❌|✅|
||||
|**Healthcheck (postgres-checkup)**|||
|Reports and recommendations|✅|✅|
|Deep SQL performance analysis|✅|✅|
|Centralized storage of all reports|❌|✅|
|Performance and problems trend analysis *(Roadmap)*|❌|✅|
||||
|**BI**||
|Run long-running queries not affecting production health|✅|✅|
|Named queries / query organizer|❌|✅|
||||
|**Security and compliance**|||
|Login via: Google, LinkedIn, GitHub, GitLab|✅|✅|
|Invite team members|✅|✅|
|Integration with project management systems (Jira, GitHub Issues, GitLab Issues, etc) *(Roadmap)*|❌|✅|
|Automated sign-in using corporate email domain|❌|✅|
|SSO (Okta, ActiveDirectory) *(Roadmap)*|❌|✅|
|Audit log *(Roadmap)*|❌|✅|
|Security dashboard *(Roadmap)*|❌|✅|
|Roles / Team management / Personal tokens|❌|✅|
|Quotas management|❌|✅|
||||
|**Support and deployment**|||
|Community support|✅|✅|
|Guaranteed priority support|❌|✅|

[Try Database Lab now](https://postgres.ai/console)
