---
name: git-acp
description: Commit and push in the Coffer-mcp repo using the repo-local `git acp` alias with Conventional Commits per AGENTS.md. Invoke whenever the user asks to commit, push, or "save" changes in this repo — do not fall back to raw `git add`/`commit`/`push`.
---

# git acp — commit and push the Coffer-mcp repo

This repo commits via a repo-local git alias `acp` ("add, commit, push") that runs the full flow in one step and enforces the safety guards we rely on. **Use it instead of raw `git add` / `git commit` / `git push` whenever you commit in this repo.**

```sh
git acp "<conventional commit message>"
```

## What the alias does

Defined in `.git/config` (not version-controlled). The flow:

1. Requires a non-empty commit message argument.
2. Refuses to run on `main`, `master`, `release`, or `production`.
3. Refuses with a detached `HEAD` or when there is nothing to commit.
4. Runs `git add -A` → `git commit -m "$1"` → `git push`.
5. On the first push of a new branch, sets upstream with `git push -u origin <branch>`.
6. Never passes `--no-verify` — `pre-commit` (lint, typecheck, test) and any future `commit-msg`/`pre-push` hooks always run.
7. Never force-pushes.

If the alias is missing (fresh clone), re-run the setup described in `docs/v1-spec/onboarding/run-and-debug.md` before committing.

## When to invoke

Invoke this skill whenever the user asks you to commit, push, or "save" changes in the Coffer-mcp working tree. Compose the message yourself from the staged diff per the rules below — only ask the user for input when the intent of the change is ambiguous.

Do NOT:
- Run raw `git add`, `git commit`, or `git push` in this repo (use `git acp`).
- Pass `--no-verify` or otherwise skip hooks.
- Force-push.
- Commit on `main`/`master`/`release`/`production` — switch to a feature branch first.
- Commit secrets (Plaid tokens, Auth0 secrets, AES keys, database URLs, raw financial payloads).

## Conventional Commits format

Follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

### Types used in this repo

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

### Scopes

Match the V1 surface: `auth`, `plaid`, `mcp`, `db`, `migrations`, `docs`, `ops`. Use a single lowercase word; omit if the change is repo-wide.

### Description rules

- Imperative mood, lowercase, no trailing period (`add Plaid sync retry`, not `Added...`).
- Subject line under ~72 characters.
- One blank line between description, body, and footers.

### Breaking changes

Signal with either `!` after the type/scope (`feat(mcp)!: drop legacy tool schema`) or a `BREAKING CHANGE: <explanation>` footer — preferably both. Either form bumps MAJOR. `BREAKING CHANGE` must be uppercase; `BREAKING-CHANGE` is accepted as a synonym in footers.

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

`git acp` forwards its single argument to `git commit -m`. Pass a multi-line message via a quoted heredoc so the subject, body, and footers stay separated by blank lines:

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

## Before invoking

- Run `git status` and `git diff` (staged + unstaged) to understand the change.
- Confirm the current branch is not protected.
- Confirm there are changes to commit.
- Stage nothing by hand — `git acp` runs `git add -A` for you. If files must be excluded, commit selectively with raw git first and call that out to the user, since it sidesteps the alias contract.

## Pull requests

PRs follow the same Conventional Commits format as the squash-merge target. See `AGENTS.md` § "Pull requests" for required summary, validation, and configuration-change callouts.
