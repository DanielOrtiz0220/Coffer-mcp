---
name: git-acp
description: Commit and push changes in the Coffer-mcp repo with the repo-local `git acp` alias and Conventional Commits. Use when the user asks to commit, push, publish, or save repo changes; first verify all worktree changes belong in the commit because `git acp` stages everything.
---

# git acp

Use the repo-local `git acp` alias for normal commit-and-push work in this repository.

```sh
git acp "<conventional commit message>"
```

The alias is configured in `.git/config`, not version-controlled. It runs `git add -A`, commits with the supplied message, then pushes. On a new branch it sets upstream with `git push -u origin <branch>`.

## Before running

1. Run `git status --short --branch`.
2. Inspect unstaged and staged changes with `git diff` and `git diff --cached`.
3. Confirm the current branch is not `main`, `master`, `release`, or `production`.
4. Confirm every worktree change belongs in the requested commit. `git acp` stages everything.
5. Compose a Conventional Commit message from the actual diff.

If unrelated or user-owned changes are present, do not run `git acp`. Ask how to split the commit, or use explicit raw git only after the user agrees to a selective commit path.

## Safety rules

- Do not bypass hooks with `--no-verify`.
- Do not force-push.
- Do not commit secrets, Plaid tokens, Auth0 secrets, AES keys, database URLs, or raw financial payloads.
- If hooks fail, report the failing hook and relevant output; do not bypass it.
- If the alias is missing, read `AGENTS.md` and `.git/config` context, then ask before recreating local git configuration.

## Alias behavior

Expect these guards:

- Requires a non-empty commit message.
- Refuses detached `HEAD`.
- Refuses protected branches: `main`, `master`, `release`, `production`.
- Refuses when there is nothing to commit.
- Runs hooks normally.
- Pushes without force.

## Conventional Commits format

Use:

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

### Types used in this repo

- `feat`: new user-facing capability
- `fix`: bug fix
- `docs`: documentation only
- `refactor`: code change that neither fixes a bug nor adds a feature
- `perf`: performance improvement
- `test`: adding or correcting tests
- `build`: build system, dependencies, or tooling (`pnpm`, `tsconfig`, Docker)
- `ci`: CI configuration and scripts
- `chore`: maintenance that doesn't fit the above (no production code change)
- `style`: formatting only (whitespace, semicolons) - no logic change

### Scopes

Use a single lowercase word matching the V1 surface when helpful: `auth`, `plaid`, `mcp`, `db`, `migrations`, `docs`, `ops`. Omit the scope for repo-wide changes.

### Description rules

- Imperative mood, lowercase, no trailing period.
- Subject line under ~72 characters.
- One blank line between description, body, and footers.

### Breaking changes

Signal with either `!` after the type/scope (`feat(mcp)!: drop legacy tool schema`) or a `BREAKING CHANGE: <explanation>` footer - preferably both. Either form bumps MAJOR. `BREAKING CHANGE` must be uppercase; `BREAKING-CHANGE` is accepted as a synonym in footers.

### Footers

`Token: value` or `Token #ref`, one blank line after the body. Common tokens: `Refs:`, `Closes:`, `Co-authored-by:`.

### Examples

```
feat(plaid): encrypt access tokens at rest

fix(auth): reject Auth0 tokens with missing `aud` claim

docs(v1-spec): clarify Plaid sync failure modes

refactor(mcp)!: rename search-transactions tool arguments

BREAKING CHANGE: clients must update tool argument names from
`q` to `query` and `from`/`to` to `start_date`/`end_date`.
```

## Multi-line messages

Pass a multi-line message via a quoted heredoc so the subject, body, and footers keep blank lines:

```sh
git acp "$(cat <<'EOF'
feat(plaid): encrypt access tokens at rest

Use AES-256-GCM with the rotation-aware envelope key. Tokens
are encrypted in the same transaction as item creation so a
crash never leaves cleartext at rest.

Refs: PLAID-23
EOF
)"
```

## Pull requests

PR titles follow the same Conventional Commits format as the squash-merge target. See `AGENTS.md` for required PR summary, validation, and configuration-change callouts.
