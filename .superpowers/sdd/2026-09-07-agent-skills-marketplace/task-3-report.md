# Task 3 report — npm skill installer

Implemented a dependency-free Node CLI at `packages/cli`.

## Behavior

- `agent-skills list` shows cataloged skills and the stable generic target.
- `agent-skills install <id> --agent <name> [--dry-run]` verifies the canonical source checksum before copying the skill directory.
- `generic` installs under `.agent-skills/<id>`.
- Codex, Claude Code, Cursor, Copilot, and Gemini aliases use documented project-local candidate layouts only; they do not claim native marketplace support.
- Non-dry-run installs update `.agent-skills-lock.json`; dry runs do not write project files.
- Installation copies files only and does not execute source scripts.

## Test-first evidence

Before the package existed, `npm test -- test/cli.test.mjs` failed for all initial CLI tests because `packages/cli` was absent (`ENOENT`).

## Verification

- `npm test -- test/cli.test.mjs`
- `npm test`
- `npm run check:public-content`
- `node scripts/validate-catalog.mjs`
