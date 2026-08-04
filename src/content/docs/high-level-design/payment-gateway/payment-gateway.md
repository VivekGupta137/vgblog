---
title: Payment Gateway
sidebar:
  order: 1
---

# Payment Gateway — HLD Documentation

This series explains payment gateway system design from first principles. It covers the full architecture — from the API layer that merchants call, through fraud detection and the transaction engine, all the way to settlement, funding, and operational observability. Suitable for interview prep and onboarding developers new to payment systems.

:::note[Start here if you know nothing about payments]
Read `00-overview.md` for a full architectural walkthrough, then `01-payment-ecosystem.md` to understand the industry — who the parties are, how money actually moves, and what authorization really means.
:::

---

## Documents

| File | What it covers |
|---|---|
| 00-overview.md | 5-page master overview — start here. Full architecture, all flows, scale targets. |
| 01-payment-ecosystem.md | Payment industry basics: parties, authorization flow, transaction types, chargebacks |
| 02-api-layer.md | API gateway design: auth, rate limiting, idempotency, routing, REST contracts |
| 03-transaction-processing.md | Core transaction engine: state machine, write-before-call, dedup, circuit breaker |
| 04-security-pci-3ds.md | PCI DSS, MLE, HSM, tokenization, 3D Secure |
| 05-fraud-detection.md | Rules engine, ML scoring, precision-recall tradeoff, auth-and-hold |
| 06-stored-credentials-tokenization.md | Customer profiles, gateway vs network tokens, CIM→TMS migration |
| 07-recurring-billing.md | Subscription engine, retry rules, dunning, MIT framework, SCA |
| 08-ach-echeck.md | ACH network, NACHA format, return codes, Kafka batch decoupling |
| 09-settlement-funding.md | Settlement pipeline, funding flow, reconciliation, chargebacks |
| 10-scalability-reliability.md | Active-active DC, DB partitioning, Redis, Kafka, circuit breakers, capacity |
| 11-observability.md | Metrics, logging (what not to log), tracing, alerting, runbooks |

---

## Learning Paths

### Beginner — understand payments before the architecture
01 → 00 → 03 → 02 → 04

Start with the ecosystem to understand what a payment actually is, then the overview for the big picture, then the transaction engine and API layer to see how it is built, then security to understand the compliance constraints.

### Interview Prep — the most commonly tested topics
00 → 03 → 04 → 10 → 05

Master overview first, then the transaction engine (idempotency, state machine, write-before-call), security and PCI, scalability, and fraud detection. These five documents cover ~90% of payment system design interview questions.

### Full Coverage — read in order
00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11

Each document builds on the previous. By the end you will have a complete mental model of how a production payment gateway operates.
