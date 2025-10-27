---
title: SQL optimization with Joe Bot
description: Joe Bot, a virtual DBA for SQL optimization
---

# SQL optimization with Joe Bot

Database Lab includes a virtual DBA that leverages the DBLab Engine to
assist engineers with SQL optimization. [Learn how the DBLab Engine works](/products/how-it-works).

## The SQL optimization paradox

Without the right tools, the task of SQL Optimization faces a challenging paradox:

<blockquote class='em-quote'>
  The goal is to improve performance on production.<br />
  It is <em>neither safe nor secure</em> to experiment on production.
</blockquote>

This leaves organizations with three _bad_ options:

1. Deploy query optimizations without properly testing them
1. Allow engineers to experiment on production despite the significant risks
1. Incur the time, cost, and complexity of maintaining secure and realistic pre-production databases


## Joe Bot to the rescue
<img alt="Joe bot for SQL optimization" src="/assets/joe-robot.svg" style={{width: '140px'}} align="right" hspace="5" vspace="5" />

Built atop the DBLab Engine, Joe Bot resolves the SQL optimization paradox and
gives engineers the power to improve query performance in a fully realistic, safe, and secure
manner.

Joe Bot acts as a mediator between an engineer and a thin clone of the production database generated
by the DBLab Engine. Joe Bot accepts SQL commands from the engineer, executes them against the database clone,
and returns performance statistics and SQL recommendations.

<blockquote class='em-quote'>
  Joe Bot never returns data itself,
  which is unnecessary when the goal is solely performance improvement.
</blockquote>

Organizations using Joe Bot can safely empower every engineer to improve query performance.

## Joe Bot in action

* Joe Bot recommends what to do with a poorly performing query
* The engineer experiments with a solution by creating an index and verifies the result
* Joe Bot can immediately reset and try another idea.

<div class='joe-bot-demo'>
  <img alt="Joe Bot Demo" src="/assets/joe-bot-demo.gif" />
</div>


<div className="products-btn-container">
  <a className="btn btn1" href="https://console.postgres.ai/" target="_blank">
    Get started in 3 minutes
  </a>
  <a className="btn btn4" href="https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec" target="_blank">
    AWS Marketplace
  </a>
  <a className="btn btn2" href="/products/realistic-test-environments">Next: Realistic Test Environments</a>
</div>
