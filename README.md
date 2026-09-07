# Powerups

Portable, versioned skills for coding agents. Each skill stays in the standard `SKILL.md` format; agent-specific installation details stay outside the skill itself.

## Use a skill

After the npm package is published, list the available skills:

```bash
npx @kumarsourav12/powerups list
```

Install a skill into a project-local agent directory:

```bash
npx @kumarsourav12/powerups install human-docs --agent codex
```

Use `--dry-run` to see the destination without changing files:

```bash
npx @kumarsourav12/powerups install tldr --agent cursor --dry-run
```

The installer verifies the skill checksum before copying it, never runs bundled scripts, and records non-dry-run installs in `.powerups-lock.json`.

## Skills

- [`human-docs`](skills/human-docs/SKILL.md) — writes factual technical documentation for the reader's next action.
- [`tldr`](skills/tldr/SKILL.md) — produces concise, professional answers without dropping material risk or evidence.

`registry/skills.json` is the installable catalog. `skills/` is the source of truth for instructions.

## Agent support

The CLI supports project-local layouts for Codex, Claude Code, Cursor, GitHub Copilot, and Gemini. The `generic` target is the stable portable path. Native marketplace adapters will be added only after their public package format and installation flow are tested.

## Contribute

Add one skill per `skills/<name>/SKILL.md` directory, with a concise description, an MIT-compatible license, and a matching catalog entry. Content must be original or publicly attributable. A maintainer reviews every skill or content change before merge.

Run these checks before opening a pull request:

```bash
npm test
npm run check:catalog
npm run check:public-content
```
