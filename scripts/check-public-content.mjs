import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const privateHost = ['local', 'host'].join('');
const privateSuffixes = ['lo' + 'cal', 'inter' + 'nal', 'lan'];

const patterns = [
  ['private key', /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/i],
  ['credential', /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{16,}/i],
  ['access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['local absolute path', /(?:^|[\s'"`(=])\/(?:Users|home|private|var\/folders)\//],
  ['local absolute path', /\b[A-Za-z]:\\(?:Users|home)\\/],
  ['private hostname', new RegExp(`\\b(?:${privateHost}|[A-Za-z0-9-]+\\.(?:${privateSuffixes.join('|')}))\\b`, 'i')],
  ['private hostname', /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/],
];

function trackedBlobs(root) {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'buffer' })
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map((path) => ({
      path,
      objectId: execFileSync('git', ['rev-parse', `:${path}`], { cwd: root, encoding: 'utf8' }).trim(),
    }));
}

export function checkPublicContent({ root = repositoryRoot } = {}) {
  const violations = [];

  for (const { path, objectId } of trackedBlobs(root)) {
    const contents = execFileSync('git', ['cat-file', 'blob', objectId], { cwd: root, encoding: 'buffer' });

    const text = contents.toString('utf8');
    for (const [kind, pattern] of patterns) {
      if (pattern.test(text)) violations.push({ path, kind });
    }
  }

  return { ok: violations.length === 0, violations };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = checkPublicContent();
  if (!result.ok) {
    for (const violation of result.violations) {
      console.error(`Public-content check failed: ${violation.path} (${violation.kind}).`);
    }
    process.exitCode = 1;
  }
}
