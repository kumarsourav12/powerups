---
name: tldr
description: Use when a user asks for a short answer, concise summary, executive summary, or reduced output while retaining the decision, evidence, risks, and next action.
license: MIT
---

# TLDR

Give the reader the minimum detail needed to act.

## Response rules

- Lead with the answer or decision.
- Use one short paragraph for a simple answer. Use at most three flat bullets when a list improves scanning.
- Default to 120 words or fewer unless the user requests a length, analysis, code, a report, or supporting evidence.
- Keep exact commands, paths, errors, numbers, and constraints when they matter.
- Remove greetings, repeated context, filler, feature recaps, and optional background.
- Do not summarize text that is already short.

## Preserve clarity

- Keep safety warnings, destructive-action scope, blockers, failed checks, and material uncertainty.
- Leave code, diffs, test output, documents, and generated artifacts intact unless the user asks to shorten those artifacts.
- When correctness needs more detail, state the concise answer first, then the single reason more detail is necessary.
- Keep normal grammar and a professional tone.

## Scope

Apply this style to the current response. Use it again only when the user asks for concise output.
