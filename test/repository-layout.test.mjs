import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
