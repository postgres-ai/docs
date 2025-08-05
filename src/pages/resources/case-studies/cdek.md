---
title: "Database Lab: How CDEK Speeds up Product Development"
---

# Database Lab: How CDEK Speeds up Product Development

<table class="minimal-style">
  <tr>
    <td>
      <b>Industry</b>
     </td>
     <td>
      <b>Headquarters</b>
    </td>
    <td>
      <b>Revenue</b>
    </td>
  </tr>
  <tr>
    <td>
      Logistics
    </td>
    <td>
      Novosibirsk, Russia
    </td>
    <td>
      $65 million (2019)
    </td>
  </tr>
</table>

## About CDEK

<p style={{textAlign: 'center'}}>
  <img style={{width: '30%'}} src="/assets/case-study/logo-cdek.svg" alt="CDEK Logo" />
</p>

CDEK is an international express delivery company shipping documents and parcels with a 20-year history. It has 1 million active users, 150,000 departures per day (tripled in 2 years) in 36,000 localities in the world. The company operates 1,800 offices in 14 countries.

More info: [https://www.cdek-usa.com/en/about](https://www.cdek-usa.com/en/about)

## Challenge
To support growth plans, CDEK improves DevOps to reduce development time and continually deliver new features and improvements. CDEK is building a heavily loaded microservice architecture that is processing 360,000 transactions per minute. At the same time, more than 100 users (developers and testers) often have no other way to test a change other than in a production environment. There is an urgent need to provide developers and test engineers with accessible testing environments. The goal is to reduce the risks of downtime and performance degradation by checking the riskiness of migrations and optimizing SQL queries.

>*DBLab helped more than 100 of our engineers raise the bar of development quality and velocity. Currently, we use more than 50 DBLab Engines which covers a significant amount of our services. With its capabilities, we increase the overall quality and deliver value faster. Troubleshooting, testing, and QA were never so swift and easy. And last but not least, we eliminated the risks of downtime or performance degradation when deploying complex database changes!*

<p style={{textAlign: 'right'}}>
  <b>Roman Kozlov</b> DBA, CDEK
</p>

## Solution
DBLab was deployed in just three weeks with very limited resources — a success made possible by support from PostgresAI (documentation and advice). CDEK uses DBLab for its PostgreSQL databases, which are hosted in a private cloud.

## Results
Database Lab has enabled CDEK to speed up development and testing significantly, reducing data provisioning time to seconds. Previously, it took several days to restore the CDEK staging database, but now the environment can be restored in a few seconds. Staging databases was updated only in special technological windows and the data could be outdated for several months. Now, thanks to automation, staging databases is updated daily (enough for development and testing, but can be updated more often if necessary). Using Database Lab allowed the existing team to support the rapid growth of database administration tasks. Development teams now also have the opportunity to use their own personal staging and conduct production-like experiments.

## Key benefits
- Quick and easy start
- Staging data is always fresh: reduced the lag from several months to just a day
- Instant data delivery for development and testing: seconds instead of 14 hours
- No additional staff needed to support growth 

<div className="products-btn-container">
  <a className="btn btn1" href='https://console.postgres.ai/' target="_blank">
    Get started in 3 minutes
  </a>
  <a className="btn btn2" href='/download/database-lab-case-study-cdek.pdf' target='_blank'>Download PDF</a>
</div>
