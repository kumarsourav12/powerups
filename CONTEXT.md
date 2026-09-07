# Ubiquitous language

## Skill

A portable, versioned directory that contains a required `SKILL.md` and optional scripts, references, and assets.

## Catalog

The machine-readable index of skills and their release metadata. It is not the source of a skill's instructions.

## Adapter

An agent-specific package layout or manifest generated from, or pointing to, a portable skill. An adapter never owns the canonical instructions.

## Installer

The npm command-line package that reads the catalog, copies a selected skill into an agent's supported location, and writes a lockfile.

## Public-only content

Material that is original to the contributor or attributable to a public source with a compatible license. It excludes confidential, employer-derived, customer, internal-system, and non-public material.

## Channel

A release track: `stable` for verified public integrations, `next` for pre-release changes, and `experimental` for opt-in adapters that may change or be removed.
