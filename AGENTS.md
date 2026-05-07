# Repository Guidelines

## Project Structure & Module Organization

This repository is currently documentation-first. The main entry point is `docs/README.md`, which links to implementation-phase documentation.

- `docs/v1-spec/`: V1 private MVP requirements for the Node/Hono MCP server, Postgres schema, Plaid sync, Auth0 OAuth, operations, and security.
- `docs/v1-spec/onboarding/`: short onboarding notes and expected run/debug flow for a junior engineer joining the prototype.
- `docs/post-mvp/`: deferred public SaaS architecture, expanded data model, operations, webhooks, and ADRs. Do not treat these as V1 requirements unless explicitly promoted.
- `.gitignore`: excludes local macOS and Obsidian artifacts.

When code is added, keep source, migrations, and tests aligned with the V1 architecture before expanding post-MVP surfaces.

## Build, Test, and Development Commands

There is no runnable application scaffold in the repository yet. The expected command shape after the Node app is added is documented in `docs/v1-spec/onboarding/run-and-debug.md`:

```sh
pnpm install
pnpm db:migrate
pnpm dev
```

Until scripts exist, validate changes by reading affected docs end to end and checking Markdown formatting. Once `package.json` is introduced, add canonical scripts for `dev`, `build`, `test`, linting, and database migrations.

## Coding Style & Naming Conventions

Use concise Markdown with sentence-case section headings and direct, implementation-oriented language. Keep V1 docs focused on the private MVP; place future product scope in `docs/post-mvp/`.

For future TypeScript code, prefer strict types, 2-space indentation, `camelCase` for variables/functions, `PascalCase` for types/classes, and descriptive file names such as `plaid-sync.ts` or `mcp-tools.ts`.

## Testing Guidelines

No test framework is configured yet. When implementation begins, add focused tests around Auth0 token validation, Plaid sync mapping, tool argument validation, and database reads. Name tests after behavior, for example `search-transactions.test.ts`. Document any required smoke test updates in `docs/v1-spec/onboarding/run-and-debug.md`.

## Commit & Pull Request Guidelines

Git history currently uses concise imperative commits, for example `Add project documentation and repo scaffolding`. Continue that style: `Add Auth0 token verifier`, `Document Plaid sync failures`.

Pull requests should include a short summary, the V1 or post-MVP area affected, validation performed, and any configuration changes. Link related issues or ADRs when changing architecture or scope.

## Security & Configuration Tips

Never commit credentials, Plaid tokens, Auth0 secrets, database URLs, AES keys, or raw financial payloads. Preserve the V1 privacy constraints: normalized data only by default, encrypted Plaid access tokens, and no tool argument-value logging.
