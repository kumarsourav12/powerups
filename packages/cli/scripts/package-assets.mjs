import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(packageRoot, '..', '..');
const assetDirectories = ['registry', 'skills'];

function target(directory) {
  return resolve(packageRoot, directory);
}

if (process.argv[2] === 'copy') {
  for (const directory of assetDirectories) {
    rmSync(target(directory), { recursive: true, force: true });
    cpSync(resolve(repositoryRoot, directory), target(directory), { recursive: true });
  }
} else if (process.argv[2] === 'clean') {
  for (const directory of assetDirectories) rmSync(target(directory), { recursive: true, force: true });
} else {
  throw new Error('Usage: package-assets.mjs copy | clean');
}

for (const directory of assetDirectories) {
  if (process.argv[2] === 'copy' && !existsSync(target(directory))) {
    throw new Error(`Missing packaged asset: ${directory}`);
  }
}
