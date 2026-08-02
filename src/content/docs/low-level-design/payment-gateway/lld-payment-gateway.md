---
title: Lld Payment Gateway
---

# Payment Gateway — Low Level Design

## Overview

Low Level Design (LLD) is concerned with **class-level structure** — the objects, data structures, algorithms, and design patterns that make a subsystem work correctly. It is distinct from High Level Design (HLD), which covers infrastructure topology, service boundaries, and data flow between systems.

Where HLD answers "what services exist and how do they communicate?", LLD answers:

- What classes exist inside a service?
- What are their responsibilities and relationships?
- How does data flow through a method call chain?
- Which algorithms and data structures handle the core logic?
- Which design patterns enforce correctness constraints?

### Why Design Patterns Matter in Payment Systems

Payment systems operate under constraints that most software does not:

- **Never double-charge.** A customer must be billed exactly once per transaction, regardless of retries, network failures, or system restarts.
- **Never lose a transaction.** Every operation that touches money must be durable, auditable, and recoverable.
- **Every state transition must be valid.** A transaction cannot jump from `INITIATED` to `SETTLED` without passing through `AUTHORIZED` and `CAPTURED`.

Design patterns are not decorative — they are the mechanism by which these constraints are enforced in code. A State pattern makes illegal state transitions unrepresentable. A Command pattern makes every operation replayable and auditable. A Chain of Responsibility pattern ensures fraud filters run in the correct order and can short-circuit safely. Choosing the right pattern is a correctness decision, not a style decision.

---

## Design Patterns Used

The table below lists every pattern used across the LLD documents, the subsystem it appears in, and the reason it was chosen.

| Pattern | Category | Used in | Why |
|---|---|---|---|
| State | Behavioral | Transaction Engine | Enforce valid state transitions; prevent invalid operations |
| Command | Behavioral | Transaction Engine, Settlement | Encapsulate operations for retry, undo, audit |
| Template Method | Behavioral | Transaction Engine (card/ACH/wallet) | Fixed processing skeleton, variable steps per payment type |
| Chain of Responsibility | Behavioral | Fraud Engine | Ordered fraud filter pipeline with short-circuit |
| Strategy | Behavioral | Fraud Engine (scoring), Processor Integration | Swap algorithms/processors without changing calling code |
| Observer | Behavioral | Fraud Engine | Decouple fraud event notification from detection |
| Adapter | Structural | Processor Integration | Wrap legacy/incompatible processor APIs |
| Facade | Structural | Processor Integration, API layer | Single entry point hiding subsystem complexity |
| Proxy | Structural | Stored Credentials | Control access + lazy decryption of encrypted payment profiles |
| Decorator | Structural | API layer | Stack cross-cutting concerns (logging, rate-limit, idempotency) |
| Singleton | Creational | HSM Client | Single shared connection pool to hardware security module |
| Iterator | Structural | Settlement Pipeline | Stream large transaction batches without loading all into memory |

---

## Files Index

| File | Patterns | What it covers |
|---|---|---|
| 01-transaction-engine-lld.md | State, Command, Template Method | Transaction lifecycle state machine, operation encapsulation, multi-payment-type processing pipeline |
| 02-fraud-engine-lld.md | Chain of Responsibility, Strategy, Observer | Fraud filter chain, scoring algorithm swap, event notification decoupling |
| 03-processor-integration-lld.md | Strategy, Adapter, Facade | Processor routing, legacy API wrapping, unified payment facade |
| 04-settlement-pipeline-lld.md | Iterator, Command | Memory-safe batch traversal, retry-aware settlement step encapsulation |
| 05-stored-credentials-lld.md | Proxy, Singleton, Decorator | Encrypted profile access control, HSM singleton, API request pipeline |

---

## How to Use These Docs

**Start with `01-transaction-engine-lld.md`.** The transaction engine is the heart of the system — every payment flows through it, and it introduces the three most fundamental patterns (State, Command, Template Method) that recur throughout the rest of the series.

After that, each document is self-contained. If you are designing a specific subsystem, you can jump directly to the relevant file without reading the others first.

Every pattern section in each document follows the same structure:

- **Intent** — the problem the pattern solves in one sentence
- **Class diagram** — the key classes and their relationships
- **When to use** — the specific conditions that justify applying this pattern
- **Java implementation** — a worked example drawn from the payment gateway domain
- **Tradeoffs** — what you gain and what you give up

---

## Patterns Not Used (and Why)

Several patterns were considered during design and deliberately set aside.

| Pattern | Considered for | Reason not used |
|---|---|---|
| Builder | `PaymentRequest` construction | The request object is simple enough to construct directly; Builder would add indirection without meaningful benefit |
| Composite | Transaction line items | Line items are flat — they do not form a hierarchy, so Composite would misrepresent the data model |
| Visitor | Reporting engine | Deferred; would apply if a reporting layer needed to traverse a heterogeneous transaction hierarchy, but that requirement does not exist yet |
| Mediator | Service coordination | Facade was sufficient for request-response flows; Mediator would introduce unnecessary indirection and complexity |

:::note
Not using a pattern is as important as using one. Every pattern adds complexity — only apply it when the problem it solves actually exists.
:::
