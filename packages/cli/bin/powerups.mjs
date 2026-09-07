#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findSkill, readCatalog, verifySource } from '../lib/catalog.mjs';
import { installSkill } from '../lib/install.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = packageRoot;

function usage() {
  return 'Usage: powerups list | powerups install <id> --agent <name> [--dry-run]';
}

function parseInstall(arguments_) {
  const [id, ...options] = arguments_;
  const [agentFlag, agent, ...remaining] = options;
  const dryRun = remaining.length === 1 && remaining[0] === '--dry-run';
  if (!id || agentFlag !== '--agent' || !agent || (remaining.length !== 0 && !dryRun)) {
    throw new Error(usage());
  }
  return { id, agent, dryRun };
}

try {
  const [command, ...arguments_] = process.argv.slice(2);
  const catalog = readCatalog(repositoryRoot);

  if (command === 'list' && arguments_.length === 0) {
    for (const skill of catalog.skills) console.log(`${skill.id} ${skill.version} (generic)`);
  } else if (command === 'install') {
    const { id, agent, dryRun } = parseInstall(arguments_);
    const skill = findSkill(catalog, id);
    const { directory } = verifySource(repositoryRoot, skill);
    const result = installSkill({
      projectRoot: process.cwd(),
      repositoryRoot,
      skill,
      agent,
      dryRun,
      sourceDirectory: directory,
    });
    const action = dryRun ? 'Would install' : 'Installed';
    console.log(`${action} ${skill.id} to ${result.destination}`);
    for (const file of result.files) console.log(`  ${file}`);
  } else {
    throw new Error(usage());
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
