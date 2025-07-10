---
title: How Database Lab works
description: Basics of the DBLab Platform
---

# How it Works
The DBLab Engine is an open-source experimentation platform for PostgreSQL
databases. Instantly create full-size clones of your production database and use
them to test your database migrations, optimize SQL, or deploy full-size staging
apps.


## Architecture
<a href='/assets/architecture.png' target='_blank' class='diagram-thumbnail clear'>
  <img src="/assets/architecture.png" alt="Database Lab Architecture" class='outline' />
</a>

The DBLab Engine runs on an independent server within your own infrastructure.
The engine stores a single, full-size copy of production data on the specialized ZFS
filesystem.<sup>1</sup>

Using the copy-on-write capabilities of ZFS, the DBLab Engine is able to generate full-size
replicas of the production database in seconds. These writable "thin clones" will behave
identically to production: they will have the same data and generate the same query plans.

[Learn more about the DBLab Engine](/docs/database-lab)

## Security
<a href='/assets/saas-security-model.png' target='_blank' class='diagram-thumbnail clear'>
  <img src="/assets/saas-security-model.png" alt="Security Model" class='outline' />
</a>

Instances of the DBLab Engine and all thin clones reside completely within
your own infrastructure at all times.

The DBLab Engine is managed via an API that can be exposed either over HTTPS or an SSH tunnel.
The team at Postgres AI and all platform components:
* ___cannot___ reach your databases
* ___cannot___ read or modify the data in your databases
* ___cannot___ SSH to your machines

Production data is sensitive - even within your own organization. You can configure the DBLab Engine
to generate fully masked clones so that engineers without production authorization
can also gain the benefits of experimenting with thin clones.

[Learn more about our Security Model](/docs/platform/security)

## Setup
You can install the DBLab Engine on a Linux<sup>2</sup> server where you can provision a ZFS volume.
If you run your infrastructure on AWS, you can follow our
[Getting Started Guide for RDS](/docs/tutorials/database-lab-tutorial-amazon-rds).

Here's what you can expect when setting up the DBLab Engine:
* Experienced engineers can setup the DBLab Engine in less than 1 hour
* The DBLab Engine host instance should have a disk 30% larger than the production DB
* [Sensitive data masking](/products/data-masking) can be achieved with a set of declarative rules

<div className="products-btn-container">
  <a className="btn btn1" href="https://console.postgres.ai/" target="_blank">
    Get started in 3 minutes
  </a>
  <a className="btn btn4" href="https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec" target="_blank">
    AWS Marketplace
  </a>
  <a className="btn btn2" href='/products/database-migration-testing'>Next: Database Migration Testing</a>
</div>

<ul class='footnotes'>
  <li><sup>1</sup> If desired, alternate copy-on-write systems may be used. See the &nbsp;
    <a href="/docs/dblab-howtos/administration/install-dle-manually"
       target="_blank">
      documentation
    </a>
  </li>
  <li><sup>2</sup> The DBLab Engine has been tested on Ubuntu and RHEL/CentOS.</li>
</ul>
