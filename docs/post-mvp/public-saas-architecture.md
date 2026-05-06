# Public SaaS Architecture

This captures the broader product architecture deferred from V1.

## Deferred containers

### Next.js dashboard on Vercel

The previous plan included a browser-facing app for signup, account management, charts, tables, custom rows, and "connect to AI" instructions.

Deferred because V1 only needs a private setup route inside the Node/Hono app.

### Separate API routes

The previous plan colocated dashboard API routes with the Next.js app for link-token creation, token exchange, webhook receipt, and custom-row CRUD.

Deferred because V1 can keep setup routes in the single Node/Hono app.

### Worker on Railway

The previous plan used a separate worker process for long Plaid sync jobs, recurring detection, and scheduled jobs.

Deferred because V1 uses manual or lazy sync and has one private user.

### Cloudflare R2

The previous plan used R2 to store generated CSV exports behind signed URLs.

Deferred because V1 has no export tool.

### Resend

The previous plan used Resend for transactional email and digest delivery.

Deferred because V1 has no email tool or notification product.

## Deferred project layout

```text
apps/
  web/       Next.js dashboard
  mcp/       Hono MCP service
  worker/    background jobs
packages/
  db/        shared schema and migrations
  plaid/     shared Plaid sync helpers
```

V1 can still grow toward this layout later if the single-service prototype becomes hard to maintain.
