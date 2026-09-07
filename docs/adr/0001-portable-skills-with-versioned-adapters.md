# ADR 0001: Keep portable skills separate from agent adapters

## Status

Accepted

## Context

Coding agents share a `SKILL.md` convention but use different installation locations, manifests, permission models, and marketplace formats. Treating one agent's package as the source would make every other integration dependent on that agent's release cycle.

## Decision

Store the canonical instructions in `skills/<skill-name>/`. Keep agent-specific manifests and generated package layouts under `adapters/<agent>/`. The npm installer reads the catalog and installs canonical skills into explicit, supported target locations. Each adapter has its own compatibility status and version.

## Consequences

- A new agent can be added without rewriting existing skills.
- Agent-specific permissions and optional features remain isolated.
- The first release can support direct installation before every marketplace adapter exists.
- Adapter validation is required before a channel is promoted to `stable`.
