---
title: Sensitive Data Masking
description: Mask sensitive data to ensure security and compliance
---

# Sensitive Data Masking

Database Lab allows a robust and centralized means to both mask<sup>1</sup>
and control access to test and staging databases. Implement masking rules
within the Database Lab Engine to adhere to security best practices and
simplify external audits.

## Control Data Access for Security and Compliance
<img src="/assets/landing/feature3.svg" style={{width: '100px'}} align="right" hspace="5" vspace="5" />

Security certifications such as SOC2, ISO 27001, and HIPPA dictate strict controls
governing access to and visibility of production data. Organizations seeking third
party certification of their adherence to these standards are required to demonstrate
several things:

1. Only specially authorized employees can access production (or customer) data
1. This access is regularly audited
1. Internal systems (such as staging or test environments) have no sensitive data

Database Lab gives organizations a clear and centralized means to achieve these objectives.


## A Comprehensive Approach to Masking

The Database Lab Engine provides a robust API that gives software teams the power to implement
a multi-faceted and comprehensive approach to data masking.  There are three pillars
to well-implemented masking:

1. **Hashing & Randomization** - Randomize parts or all of a value using either deterministic or non-deterministic methods
1. **Data Generation & Destruction** - Generate fake data using a variety of algorithms or simply destroy it
1. **Data Generalization** - Replace an original value with one truncated to a lower precision

Learn more about masking techniques with our recommended tool:
[PostgreSQL Anonymizer](https://postgresql-anonymizer.readthedocs.io/en/stable/).


## Clear and Auditable Rules

Database Lab recommends a declarative approach to data masking using
[PostgreSQL Anonymizer](https://postgresql-anonymizer.readthedocs.io/en/stable/declare_masking_rules/).

Masking rules are declared as security labels within the schema itself.

```
CREATE TABLE player( id SERIAL, name TEXT, points INT);

INSERT INTO player VALUES
  ( 1, 'Kareem Abdul-Jabbar', 38387),
  ( 5, 'Michael Jordan', 32292 );

SECURITY LABEL FOR anon ON COLUMN player.name
  IS 'MASKED WITH FUNCTION anon.fake_last_name()';

SECURITY LABEL FOR anon ON COLUMN player.id
  IS 'MASKED WITH VALUE NULL';
```

Colocating security rules and data gives software teams better visibility and control over
access to data.

* Security rules can change alongside schema changes
* Security rules can be reviewed and audited using standard code reviews
* Security rules can share the same access control scheme as the database

Database Lab gives organizations a flexible and powerful way to protect sensitive data
within their organization and to comply with security standards.

<div style={{'margin-top': '50px'}}>
  <a className="btn btn1" style={{'margin-right': '20px'}} href='https://postgres.ai/console/'>Start Free Trial</a>
  <a className="btn btn2" href='/resources'>Case Studies</a>
</div>

<ul class='footnotes'>
  <li>
    <sup>1</sup> We use the term "masking" to refer to the general process of both data masking and data anonymization.
    Database Lab allows customers to implement a variety of specific approaches to data masking including both
    dynamic and persistent (or "in-place") methods.
  </li>
</ul>
