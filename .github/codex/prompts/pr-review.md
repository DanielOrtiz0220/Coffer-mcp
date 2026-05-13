# PR review scope

Review this pull request for likely bugs and security vulnerabilities only. Do not edit files.

Focus on material issues in the pull request diff:

- incorrect runtime behavior or broken user-facing flows
- data leaks, unsafe logging, or accidental exposure of secrets
- authentication or authorization flaws
- injection risks, unsafe parsing, or command execution risks
- database migration hazards, irreversible data loss, or unsafe schema changes
- financial-data privacy regressions, especially raw Plaid payload exposure, token handling, or tool argument-value logging

Ignore style, naming, broad refactors, preference comments, and general test coverage unless the issue directly creates a bug or security risk.

Use the checked-out merge commit and GitHub Actions pull request environment to inspect the diff. Prefer commands such as `git diff --merge-base "${CODEX_PR_BASE_REF}" HEAD` when the base ref is available. The PR head is also fetched as `${CODEX_PR_HEAD_REF}` when needed.

# Output format

Return concise Markdown suitable for a sticky PR comment.

If you find material issues, list findings first and include at most 5 findings. For each finding, include:

- severity: critical, high, medium, or low
- file and line
- concrete impact
- specific fix suggestion

If you find no material bug or security issue, return exactly:

No bug or security findings found.
