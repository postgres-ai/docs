---
title: Database Migration Testing in CI/CD
description: Add DB change testing to your CI/CD pipeline using thin DB clones provided by Database Lab.
---

# Database Migration Testing

The Database Lab Engine's (DLE) ability to instantly create full-size clones of your
production database allows you to integrate fully automated DB migration testing into
your CI/CD pipeline. [Learn how the DLE works](/products/how-it-works).

## Realistic DB Migration Testing is Hard
<a href='/assets/db-testing-hierarchy.png' target='_blank' class='diagram-thumbnail large clear'>
  <img src="/assets/db-testing-hierarchy.png" alt="Database Testing Hierarchy" />
</a>

Nearly every software organization invests in a full suite of automated tests that validate
an application's runtime behavior. However, very few are able to automatically validate an
application's *deploy-time* behavior.

For most organizations, automated DB migration testing is simply too time-intensive and costly.
Using conventional methods, provisioning a full-size copy of the database could take hours
(or days!) and significantly increase compute and storage costs.


## No Testing Means Unexpected Problems

However, the absence of realistic migration testing presents significant risks including failed
deploys and unexpected application downtime.

Here are just a few of the *most* common problems when migrations aren't tested in a realistic
environment:

* A lock is held for an extended time period causing a cascade of failures
* A query hits a `statement_timeout` and aborts the DB migration (or leaves the application in a partially migrated state)
* The database contains unanticipated values causing unexpected behavior or even data loss


## Database Lab Makes Realistic Testing Easy

The Database Lab Engine (DLE) eliminates the time and cost that make it difficult to set up automated
testing of database migrations. Companies can use the DLE to build a migration specific
CI job which:

1. Instantly creates a thin clone of the production database
1. Executes pending migrations against the clone
1. Reports status, statistics, and valuable metadata

<a href='https://gitlab.com/postgres-ai/ci-example/-/jobs/662277420' target='_blank' class='diagram-thumbnail clear'>
  <img src="/assets/db-migration-job.png" alt="Database Migration Job Example" class='outline' />
</a>

Companies that use Database Lab to test their DB migrations will gain full visibility into their
applications' deploy-time behavior eliminating a major source of risk.

Explore our examples to see how this works in practice using [GitHub Actions](https://github.com/postgres-ai/green-zone/pull/4).
<!-- - using [GitLab CI/CD](https://gitlab.com/postgres-ai/ci-example/-/jobs/662277420) -->

<div className="products-btn-container">
  <a className="btn btn1" href='https://console.postgres.ai/' target="_blank">
    Get started in 3 minutes
  </a>
  <a className="btn btn4" href="https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec" target="_blank">
    AWS Marketplace
  </a>
  <a className="btn btn2" href='/products/joe'>Next: SQL Optimization</a>
</div>

