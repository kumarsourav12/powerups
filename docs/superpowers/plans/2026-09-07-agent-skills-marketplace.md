# Agent Skills Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a portable skill repository with a safe npm installer and an initial `human-docs` skill.

**Architecture:** Canonical skills live in `skills/`; the registry indexes their immutable release metadata; a dependency-free Node CLI validates and copies one skill into a known target location. Agent-specific adapters remain isolated under `adapters/`.

**Tech Stack:** Node.js 20+, npm, Node built-in test runner, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-07-agent-skills-marketplace-design.md`

## Global Constraints

- Public files contain only original or publicly attributable material.
- `human-docs` is the first canonical and cataloged skill.
- Keep instructions canonical under `skills/`; do not duplicate them in adapters.
- The installer never executes bundled scripts during installation.
- Do not include organization-specific policy terms or scan patterns in version control.

---

### Task 1: Repository policy and canonical skill

**Files:**
- Create: `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `skills/human-docs/SKILL.md`, `registry/skills.json`
- Test: `test/catalog.test.mjs`

**Interfaces:**
- Produces: valid catalog entries with `id`, `version`, `path`, `sha256`, `license`, and `targets`.

- [ ] Write a failing test that rejects a catalog whose first entry is not `human-docs` and whose path does not contain `SKILL.md`.
- [ ] Run `npm test -- test/catalog.test.mjs` and confirm the missing validator failure.
- [ ] Add repository policy, README, `human-docs`, catalog, and a validator that checks the catalog and initial-skill invariant.
- [ ] Run `npm test -- test/catalog.test.mjs` and confirm it passes.
- [ ] Commit with `feat: add canonical human-docs skill`.

### Task 2: Generic public-only guard

**Files:**
- Create: `scripts/check-public-content.mjs`, `test/public-content.test.mjs`, `.github/pull_request_template.md`

**Interfaces:**
- Produces: `npm run check:public-content`, exit zero only when tracked public files contain no detectable secret, private-key, local-path, or private-hostname pattern.

- [ ] Write failing fixture tests for a private-key block and a local absolute path.
- [ ] Run `npm test -- test/public-content.test.mjs` and confirm the guard is missing.
- [ ] Implement the deterministic guard and PR source attestation template.
- [ ] Run `npm test -- test/public-content.test.mjs` and `npm run check:public-content`.
- [ ] Commit with `feat: add public-content safeguards`.

### Task 3: npm installer

**Files:**
- Create: `packages/cli/package.json`, `packages/cli/bin/agent-skills.mjs`, `packages/cli/lib/catalog.mjs`, `packages/cli/lib/install.mjs`, `test/cli.test.mjs`

**Interfaces:**
- Consumes: `registry/skills.json` and `skills/<id>/`.
- Produces: `agent-skills list`, `agent-skills install <id> --agent <name> [--dry-run]`, and `.agent-skills-lock.json`.

- [ ] Write failing tests for `list`, dry-run output, copy installation, checksum failure, unsupported target, and lockfile output.
- [ ] Run `npm test -- test/cli.test.mjs` and confirm the CLI is missing.
- [ ] Implement only the commands and targets covered by the tests.
- [ ] Run `npm test -- test/cli.test.mjs` and confirm it passes.
- [ ] Commit with `feat: add npm skill installer`.

### Task 4: Release and adapter seams

**Files:**
- Create: `package.json`, `plugin.json`, `adapters/README.md`, `.github/workflows/ci.yml`, `.github/workflows/publish.yml`, `.gitignore`, `LICENSE`
- Test: `test/repository-layout.test.mjs`

**Interfaces:**
- Produces: root validation commands, a portable plugin manifest, CI checks, and trusted-publishing release workflow.

- [ ] Write a failing layout test for the required root manifest and adapter directory.
- [ ] Run `npm test -- test/repository-layout.test.mjs` and confirm it fails.
- [ ] Add root package scripts, CI, release workflow, manifest, license, and adapter documentation.
- [ ] Run `npm test`, `npm run check:public-content`, and `npm pack --dry-run`.
- [ ] Commit with `chore: add release automation`.
