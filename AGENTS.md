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

Follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). Each commit message has the shape:

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

**Types used in this repo:**

- `feat`: a new user-facing capability (MINOR in SemVer)
- `fix`: a bug fix (PATCH in SemVer)
- `docs`: documentation only
- `refactor`: code change that neither fixes a bug nor adds a feature
- `perf`: performance improvement
- `test`: adding or correcting tests
- `build`: build system, dependencies, or tooling (`pnpm`, `tsconfig`, Docker)
- `ci`: CI configuration and scripts
- `chore`: maintenance that doesn't fit the above (no production code change)
- `style`: formatting only (whitespace, semicolons) — no logic change

**Scopes** match the V1 surface, e.g. `auth`, `plaid`, `mcp`, `db`, `migrations`, `docs`, `ops`. Use a single lowercase word; omit if the change is repo-wide.

**Description rules:**

- Imperative mood, lowercase, no trailing period (`add Plaid sync retry`, not `Added...`).
- Keep the subject line under ~72 characters.
- One blank line between description, body, and footers.

**Breaking changes** must be signalled either by appending `!` after the type/scope (`feat(mcp)!: drop legacy tool schema`) or by a `BREAKING CHANGE: <explanation>` footer — preferably both. Either form bumps MAJOR. `BREAKING CHANGE` must be uppercase; `BREAKING-CHANGE` is accepted as a synonym in footers.

**Footers** follow the `Token: value` or `Token #ref` form, one blank line after the body. Common tokens: `Refs:`, `Closes:`, `Co-authored-by:`.

**Examples:**

```
feat(plaid): encrypt access tokens at rest

fix(auth): reject Auth0 tokens with missing `aud` claim

docs(v1-spec): clarify Plaid sync failure modes

refactor(mcp)!: rename search-transactions tool arguments

BREAKING CHANGE: clients must update tool argument names from
`q` to `query` and `from`/`to` to `start_date`/`end_date`.
```

### Committing with `git acp`

A repo-local git alias `acp` ("add, commit, push") is configured in `.git/config` to run the full add → commit → push flow in one step:

```sh
git acp "feat(plaid): encrypt access tokens at rest"
```

It enforces the safety guards we rely on:

- requires a commit message
- refuses to run on `main`, `master`, `release`, or `production`
- refuses to run with a detached `HEAD` or when there is nothing to commit
- never passes `--no-verify` — `pre-commit` (lint, typecheck, test) and any future `commit-msg`/`pre-push` hooks always run
- never force-pushes; sets upstream automatically on the first push of a new branch

The alias is repo-local (set via `git config --local`) and is not version-controlled. New contributors should re-run the setup in `docs/v1-spec/onboarding/run-and-debug.md`, or invoke the steps manually.

### Pull requests

Open PRs with:

- a title in the same Conventional Commits format as the squash-merge target
- a summary that names the V1 (or post-MVP) area affected and the motivation
- the validation you performed (`pnpm lint`, `pnpm typecheck`, `pnpm test`, manual MCP calls, migration dry-runs, etc.)
- any configuration, environment-variable, or migration changes called out explicitly
- links to related issues, ADRs, or `docs/v1-spec/` sections when the change touches architecture or scope

## Security & Configuration Tips

Never commit credentials, Plaid tokens, Auth0 secrets, database URLs, AES keys, or raw financial payloads. Preserve the V1 privacy constraints: normalized data only by default, encrypted Plaid access tokens, and no tool argument-value logging.
