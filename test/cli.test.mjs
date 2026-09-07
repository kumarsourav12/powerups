import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { test } from 'node:test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), 'agent-skills-cli-'));
  mkdirSync(join(root, 'packages', 'cli'), { recursive: true });
  cpSync(join(repositoryRoot, 'packages', 'cli'), join(root, 'packages', 'cli'), { recursive: true });
  cpSync(join(repositoryRoot, 'registry'), join(root, 'registry'), { recursive: true });
  cpSync(join(repositoryRoot, 'skills'), join(root, 'skills'), { recursive: true });
  const project = join(root, 'project');
  mkdirSync(project);
  return { root, project };
}

function runCli(fixture, args) {
  return spawnSync(
    process.execPath,
    [join(fixture.root, 'packages', 'cli', 'bin', 'agent-skills.mjs'), ...args],
    { cwd: fixture.project, encoding: 'utf8' },
  );
}

function removeFixture(fixture) {
  rmSync(fixture.root, { recursive: true, force: true });
}

test('list shows the cataloged skill and its stable generic target', () => {
  const fixture = createFixture();
  try {
    const result = runCli(fixture, ['list']);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /human-docs 1\.0\.0/);
    assert.match(result.stdout, /generic/);
  } finally {
    removeFixture(fixture);
  }
});

test('dry-run reports the generic destination and files without changing the project', () => {
  const fixture = createFixture();
  try {
    const result = runCli(fixture, ['install', 'human-docs', '--agent', 'generic', '--dry-run']);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /\.agent-skills\/human-docs/);
    assert.match(result.stdout, /SKILL\.md/);
    assert.equal(existsSync(join(fixture.project, '.agent-skills', 'human-docs', 'SKILL.md')), false);
    assert.equal(existsSync(join(fixture.project, '.agent-skills-lock.json')), false);
  } finally {
    removeFixture(fixture);
  }
});

test('dry-run uses documented project-local candidate layouts for target aliases', () => {
  const fixture = createFixture();
  try {
    for (const [agent, destination] of [
      ['codex', '.codex/skills/human-docs'],
      ['claude-code', '.claude/skills/human-docs'],
      ['cursor', '.cursor/skills/human-docs'],
      ['copilot', '.github/skills/human-docs'],
      ['gemini', '.gemini/skills/human-docs'],
    ]) {
      const result = runCli(fixture, ['install', 'human-docs', '--agent', agent, '--dry-run']);
      assert.equal(result.status, 0, result.stderr);
      assert.ok(result.stdout.includes(destination), result.stdout);
    }
  } finally {
    removeFixture(fixture);
  }
});

test('install copies the canonical skill to the generic layout', () => {
  const fixture = createFixture();
  try {
    const result = runCli(fixture, ['install', 'human-docs', '--agent', 'generic']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      readFileSync(join(fixture.project, '.agent-skills', 'human-docs', 'SKILL.md'), 'utf8'),
      readFileSync(join(fixture.root, 'skills', 'human-docs', 'SKILL.md'), 'utf8'),
    );
  } finally {
    removeFixture(fixture);
  }
});

test('install rejects a skill whose canonical source does not match its catalog checksum', () => {
  const fixture = createFixture();
  try {
    writeFileSync(join(fixture.root, 'skills', 'human-docs', 'SKILL.md'), 'changed source');
    const result = runCli(fixture, ['install', 'human-docs', '--agent', 'generic']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /checksum/i);
    assert.equal(existsSync(join(fixture.project, '.agent-skills', 'human-docs')), false);
  } finally {
    removeFixture(fixture);
  }
});

test('install rejects a traversal skill id before copying outside its target layout', () => {
  const fixture = createFixture();
  try {
    const catalogPath = join(fixture.root, 'registry', 'skills.json');
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    catalog.skills[0].id = '../../outside';
    writeFileSync(catalogPath, `${JSON.stringify(catalog)}\n`);

    const result = runCli(fixture, ['install', '../../outside', '--agent', 'generic']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /skill id/i);
    assert.equal(existsSync(join(fixture.root, 'outside', 'SKILL.md')), false);
  } finally {
    removeFixture(fixture);
  }
});

test('list rejects catalog entries with missing fields or unsafe source paths', () => {
  for (const change of [
    (skill) => { delete skill.sha256; },
    (skill) => { skill.path = '../SKILL.md'; },
  ]) {
    const fixture = createFixture();
    try {
      const catalogPath = join(fixture.root, 'registry', 'skills.json');
      const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
      change(catalog.skills[0]);
      writeFileSync(catalogPath, `${JSON.stringify(catalog)}\n`);

      const result = runCli(fixture, ['list']);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /missing|required|source path/i);
    } finally {
      removeFixture(fixture);
    }
  }
});

test('install refuses an unsupported target', () => {
  const fixture = createFixture();
  try {
    const result = runCli(fixture, ['install', 'human-docs', '--agent', 'unknown-agent']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unsupported target/i);
  } finally {
    removeFixture(fixture);
  }
});

test('install records the installed skill in a project lockfile', () => {
  const fixture = createFixture();
  try {
    const result = runCli(fixture, ['install', 'human-docs', '--agent', 'generic']);
    assert.equal(result.status, 0, result.stderr);
    const lockfile = JSON.parse(readFileSync(join(fixture.project, '.agent-skills-lock.json'), 'utf8'));
    assert.deepEqual(lockfile.skills, [{
      id: 'human-docs',
      version: '1.0.0',
      sha256: '31772abcb14ca2fbb31f49c918f99b9b6f74fb13b801670aee100c63f6172072',
      agent: 'generic',
      path: '.agent-skills/human-docs',
    }]);
  } finally {
    removeFixture(fixture);
  }
});
