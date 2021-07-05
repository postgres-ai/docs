---
title: "Database Lab: How Qiwi Controls the Data to Accelerate Development"
---

# Database Lab: How Qiwi Controls the Data to Accelerate Development

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
      Bank
    </td>
    <td>
      Nicosia, Cyprus
    </td>
    <td>
      $635 million (2019)
    </td>
  </tr>
</table>

## About Qiwi

<p style={{textAlign: 'center'}}>
  <img style={{width: '30%'}} src="/assets/case-study/logo-qiwi.svg" alt="Qiwi Logo" />
</p>

Qiwi is a publicly-traded payment service provider and bank headquartered in Nicosia (Cyprus). It operates electronic online payment systems primarily in Russia, Ukraine, Kazakhstan, Moldova, Belarus, Romania, the United States, and the United Arab Emirates. RocketBank is a unit of Qiwi and one of the first Russian neobanks (virtual banks) founded in 2012. The bank specializes in providing convenient service for small businesses.

More info: [https://qiwi.com](https://qiwi.com)

## Challenge
RocketBank team develops heavily loaded microservice applications. The company needs to reduce the risk of downtime and the amount of refactoring, related to bugs detected in the production environment. In the bank, PostgreSQL staging servers (thick copies of the production databases) were used for changes verification and testing. There were two problems with this approach: the staging server was outdated because it may took weeks to update the data on the server; a large number of users of the server (more than 50 developers and testers) resulted in a deceleration of the development process. It also resulted in complex communications, and the need to occasionally redeploy the server because of the data corruption. In order to support the development process there was an urgent need to address these problems.

>*With Database Lab we are finally able to control the data. Instead of waiting for weeks to get the latest data state from production, I can refresh the data on 10 PostgreSQL staging servers (more than 6 TB total) in a minute. Such a significant shift in our workflow helped a team of 50+ developers and testers detect and solve problems in earlier stages and iterate faster. We reduced the amount of refactoring and eliminated the risk of production downtime.*

<p style={{textAlign: 'right'}}>
  <b>Vladislav Polyakov</b> DBA, Qiwi
</p>

## Solution
Database Lab was quickly deployed to replace the previously used staging server. Database Lab is being used now for PostgreSQL databases in staging and test environments. Quick and responsive support along with rich and improving documentation significantly speeded up the deployment process.

## Results
RocketBank team chose Database Lab to eliminate manual work required to refresh databases in staging and testing environments and speed up the process. The goal was reached with impressive results. The bank can now refresh the data in minutes instead of a week required before (the actual lag of the data could reach a month due to technical windows schedule). As a result, higher test data quality made it possible to detect and solve problems on earlier stages (before they reach production), accelerating time-to-market, and eliminating production downtime related to data operations. Developers and testers can now provision an isolated full-sized clone in a self-service manner in seconds and perform experiments they could not before, which improves the overall quality and performance.

## Key benefits
- Development velocity improved for a team of 50+
- Staging data is always fresh: reduced the lag from several weeks to minutes
- Instant data delivery for development and testing: seconds instead of days
- No additional staff needed to support growth

<div style={{marginTop: '50px'}}>
  <a className="btn btn1" style={{marginRight: '20px'}} href='https://console.postgres.ai/'>Start Free Trial</a>
  <a className="btn btn2" href='/download/database-lab-case-study-qiwi-rocketbank.pdf' target='_blank'>Download PDF</a>
</div>
