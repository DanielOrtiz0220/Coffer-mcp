# Coffer-MCP Docs

These docs are split by implementation phase.

## Start here

- [V1 spec](v1-spec/README.md): the private MVP we are building first.
- [V1 onboarding](v1-spec/onboarding/README.md): short docs for a junior engineer joining the prototype.
- [Post-MVP](post-mvp/README.md): deferred architecture, tools, operations, and ADRs kept as a paper trail.

## V1 in one paragraph

Coffer-MCP V1 is a private, single-user, read-only financial-data MCP server. It runs as one public Node/Hono app on Railway, stores normalized Plaid account and transaction data in one Postgres database, uses Auth0 for OAuth access from Claude.ai and ChatGPT, and exposes four read-only MCP tools.

## What is deliberately not in V1

Anything that makes this a public multi-user product is deferred. That includes a dashboard product, background workers, broad data products beyond cash/card transactions, generated exports, email delivery, write tools, public signup, and production operations for a broader user base.

Keep V1 docs focused on the fastest private path that can be implemented and debugged end to end.
