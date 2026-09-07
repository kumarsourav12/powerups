import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

function rootPath(path) {
  return new URL(path, `file://${repositoryRoot}/`);
}

test('publishing assets provide a portable manifest and documented adapter seam', () => {
  const manifestPath = rootPath('plugin.json');
  const adapterReadmePath = rootPath('adapters/README.md');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  assert.equal(manifest.name, 'agent-skills-marketplace');
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.skills, './skills');
  assert.equal(existsSync(adapterReadmePath), true);
  assert.match(readFileSync(adapterReadmePath, 'utf8'), /canonical.*skills/i);
});

test('the CLI package tarball includes its executable and required catalog assets', () => {
  const packageRoot = fileURLToPath(rootPath('packages/cli/'));
  const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: packageRoot,
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: join(tmpdir(), 'agent-skills-marketplace-npm-cache') },
  });
  const files = JSON.parse(output)[0].files.map(({ path }) => path);

  for (const path of [
    'bin/agent-skills.mjs',
    'lib/catalog.mjs',
    'lib/install.mjs',
    'registry/skills.json',
    'skills/human-docs/SKILL.md',
  ]) {
    assert.ok(files.includes(path), `missing ${path}`);
  }
});
