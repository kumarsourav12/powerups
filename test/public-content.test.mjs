import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { checkPublicContent } from '../scripts/check-public-content.mjs';

function trackedFixture(contents) {
  const root = mkdtempSync(join(tmpdir(), 'public-content-'));
  writeFileSync(join(root, 'README.md'), contents);
  execFileSync('git', ['init', '--quiet'], { cwd: root });
  execFileSync('git', ['add', 'README.md'], { cwd: root });
  return root;
}

function withFixture(contents, assertion) {
  const root = trackedFixture(contents);
  try {
    assertion(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('rejects a tracked private-key block without exposing it', () => {
  const keyBlock = ['-----BEGIN', 'PRIVATE', 'KEY-----'].join(' ');
  withFixture(`${keyBlock}\nredacted\n-----END PRIVATE KEY-----\n`, (root) => {
    const result = checkPublicContent({ root });

    assert.equal(result.ok, false);
    assert.match(result.violations[0].kind, /private key/i);
    assert.doesNotMatch(JSON.stringify(result), /redacted/);
  });
});

test('rejects a tracked local absolute path without exposing it', () => {
  const localPath = `/${'Users'}/example/workspace`;
  withFixture(`Use ${localPath} for local development.\n`, (root) => {
    const result = checkPublicContent({ root });

    assert.equal(result.ok, false);
    assert.match(result.violations[0].kind, /local absolute path/i);
    assert.doesNotMatch(JSON.stringify(result), /Users\/example/);
  });
});

test('does not read the filesystem target of a tracked symlink', () => {
  const root = trackedFixture('safe content\n');
  const localPath = `/${'Users'}/example/outside`;
  try {
    writeFileSync(join(root, 'outside.txt'), `External target: ${localPath}\n`);
    symlinkSync('outside.txt', join(root, 'linked.md'));
    execFileSync('git', ['add', 'linked.md'], { cwd: root });

    assert.deepEqual(checkPublicContent({ root }), { ok: true, violations: [] });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a prohibited pattern after a NUL byte in tracked content', () => {
  const keyBlock = ['-----BEGIN', 'PRIVATE', 'KEY-----'].join(' ');
  withFixture(Buffer.from(`safe\0${keyBlock}\n`, 'utf8'), (root) => {
    const result = checkPublicContent({ root });

    assert.equal(result.ok, false);
    assert.match(result.violations[0].kind, /private key/i);
  });
});
