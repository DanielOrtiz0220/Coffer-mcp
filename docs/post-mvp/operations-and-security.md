# Operations And Security

This captures operational and security work deferred from V1.

## Public SaaS operations

Deferred:

- Separate local, staging, and production environments.
- Public signup.
- Preview deploys.
- Multi-user support workflows.
- Customer-impacting incident definitions.
- On-call rotation.
- Operational runbooks for queue floods, stuck jobs, and broad outages.

Why deferred: V1 has one allowlisted user and a private support path.

## Background job operations

Deferred:

- graphile-worker schema and worker process.
- Queue metrics and queue-depth alerts.
- Job retries, dead-letter handling, and job dashboards.
- Scheduled sync and recurring analysis jobs.

Why deferred: V1 sync is manual or lazy.

## Multi-tenant database controls

Deferred:

- Row-level security on every user-scoped table.
- Separate read and write database roles.
- Tenant isolation integration tests.
- Admin tooling for cross-user support.

Why deferred: V1 is single-user. Reintroduce before adding public signup or more than one real user.

## Production key management

Deferred:

- KMS-backed envelope encryption.
- Per-row data encryption keys.
- Re-wrapping jobs.
- Formal key rotation runbooks.

Why deferred: V1 uses a single environment-held AES key. KMS envelope encryption should return before broader launch.

## Threats to revisit

- Cross-tenant data exposure.
- Malicious free-form query tools.
- Generated export leakage.
- Notification abuse.
- Bot signup and Plaid Link abuse.
- Compromised dashboard session.
- Public incident response.
