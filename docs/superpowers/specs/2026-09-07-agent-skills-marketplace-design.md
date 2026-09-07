# Agent Skills Marketplace design

## Goal

Create a public repository of portable coding-agent skills that can be installed directly or through an npm CLI, with room for native agent marketplaces and future adapters.

## Scope of the first release

- One canonical skill: `human-docs`.
- A concise README and contributor rules.
- A machine-readable catalog.
- An npm CLI that lists skills, validates the catalog, installs one skill into a selected target layout, supports dry runs, and writes a lockfile.
- A generic public-only-content guard that has no organization-identifying terms in the repository.
- A portable plugin manifest and placeholder adapter directories for future native marketplace packages.

## Architecture

`skills/` is the only source of skill instructions. `registry/skills.json` records a skill's id, version, license, source path, checksum, and supported targets. `packages/cli` reads that catalog, validates paths and checksums, then copies the canonical skill into an explicit target directory. It never executes skill scripts during installation.

The first CLI supports the generic Agent Skills destination plus documented target aliases for Codex, Claude Code, Cursor, Copilot, and Gemini. It reports an unsupported target rather than guessing an unpublished integration. The adapter directories exist as controlled seams; their native manifests are introduced only after their public schemas and installation flows are tested.

## Public-only-content controls

Public files contain no organization-identifying terms, deny lists, or private scan patterns. The repository enforces generic safeguards:

- `CONTRIBUTING.md` limits content to original or publicly attributable material and requires a source declaration.
- Pull requests use a generic attestation template.
- A tracked guard rejects common secret formats, private-key blocks, non-public hostnames, and accidental local paths. It does not claim to detect all confidential information.
- Maintainers review every content contribution and may use private local or repository-setting controls outside this repository.

## Security and releases

The package is published from GitHub Actions using npm trusted publishing, with provenance enabled. Releases are tag-based. The CLI installs by copy, writes a JSON lockfile, shows the target and file list in dry-run mode, and verifies the catalog's SHA-256 content hash before copying.

## Compatibility and evolution

Use `stable`, `next`, and `experimental` channels. Only stable adapters appear in normal installation output. New or beta capabilities stay opt-in and adapter-local until public documentation and repeatable compatibility tests exist. Unknown catalog metadata is preserved by the CLI.

## Success criteria

- The repository is public and has a short working README.
- `human-docs` is the first cataloged skill and the first canonical skill directory.
- `npm test` validates the catalog, content guard, CLI list/install/dry-run behavior, and lockfile output.
- No public file contains organization-identifying policy language or private source material.
