---
title: Zero-downtime Postgres major upgrades - battle-tested at GitLab scale
description: Physical-to-logical replication technique for zero-downtime, reversible, zero-data-loss Postgres major version upgrades, proven on multi-terabyte production clusters
---

# Zero-downtime Postgres major upgrades

**Physical2logical + PAUSE/RESUME** technique for true zero-downtime, reversible, zero-data-loss Postgres major version upgrades. Battle-tested on mission-critical clusters with dozens of terabytes of data and 100,000s TPS.

## Three critical guarantees

Our solution delivers all three essential characteristics for enterprise-grade major upgrades for Postgres:

- ⚡ **Zero downtime**
- 🔄 **Reversible**
- ✅ **Zero data loss** (in both directions)

## The problem

Traditional Postgres major version upgrades require:

- **Hours of downtime** for multi-terabyte databases
- **Complete database shutdown** during pg_upgrade  
- **Irreversible process** - no easy way back if issues arise
- **Hard to test and verify** procedures for various issues like incompatibilities
- **Risks of plan flips** and performance regressions after upgrade

## Our solution: Four-component approach

A complete system:

- **Reliable, safe, battle-proven physical2logical** conversion technique for zero data loss
- **PgBouncer's PAUSE/RESUME** for true zero-downtime connection management
- **Reverse replication** enabling full reversibility - go back if needed with zero data loss
- **Extensive testing before deployment** including for plan flips and compatibility issues

## Case studies

- [GitLab's conference talks](https://www.youtube.com/results?search_query=gitlab+postgres+upgrade+conference) about their zero-downtime upgrade experience
- [pganalyze technical review](https://pganalyze.com/blog/5mins-postgres-zero-downtime-upgrades-logical-replication) of zero-downtime upgrade approaches including our method
- A heavily-loaded cluster on Crunchy Bridge (TBD)
- More cases (TBD)

## Get preview access
This solution is **fully developed and battle-tested**. We're offering preview access to select enterprise customers.

<div style={{textAlign: 'center', margin: '2rem 0'}}>
  <a 
    href="mailto:contact@postgres.ai" 
    className="button button--primary button--lg"
    style={{
      backgroundColor: '#007bff',
      borderColor: '#007bff',
      color: 'white',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      textDecoration: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      display: 'inline-block',
      fontWeight: '500'
    }}
  >
    Contact us for preview access
  </a>
</div>
