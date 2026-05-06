# 0007 - Postgres-Backed Job Queue Over BullMQ And Redis

**Status:** deferred from V1
**Date:** 2026-05-04
**Deciders:** Daniel Ortiz

## Context

The broader architecture expected Plaid webhooks to acknowledge quickly while real sync work ran elsewhere. It also expected scheduled jobs for recurring detection and email digests. That required a durable job queue with retries.

The original alternative was BullMQ on Redis. Review found two problems:

1. Expected job volume was low enough that Redis was not justified.
2. Enqueueing outside the Postgres transaction could create a row without the job needed to process it.

## Decision

Use graphile-worker as the future job queue, backed by the same Postgres database, when background processing returns to scope.

This is not a V1 requirement. V1 uses manual or lazy sync in the main app.

## Alternatives considered

- **BullMQ + Redis:** Rejected because it adds a service and does not share the database transaction.
- **pg-boss:** Rejected because graphile-worker's listen/notify pickup model fit the desired behavior better.
- **Custom queue table:** Rejected because retries, scheduling, and dead-letter behavior are already solved by existing libraries.
- **Inline long-running work only:** Rejected for the broader product because public webhook response paths need quick acknowledgements.

## Consequences

What becomes easier later:

- Transactional enqueue with user-data writes.
- One fewer infrastructure service than Redis.
- Queue data included in Postgres backup and restore.

What becomes harder later:

- Postgres carries queue load.
- Queue table churn needs vacuum attention.
- Operations need graphile-worker-specific visibility.

## Revisit when

- Background processing returns to scope.
- Sustained job throughput could stress Postgres.
- The product needs complex workflow orchestration that graphile-worker does not provide.
