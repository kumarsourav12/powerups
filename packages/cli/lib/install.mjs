import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

const targetLayouts = {
  generic: '.powerups',
  codex: '.codex/skills',
  'claude-code': '.claude/skills',
  cursor: '.cursor/skills',
  copilot: '.github/skills',
  gemini: '.gemini/skills',
};

export function targetDestination(projectRoot, skillId, agent) {
  const layout = targetLayouts[agent];
  if (!layout) throw new Error(`Unsupported target: ${agent}`);
  const targetRoot = resolve(projectRoot, layout);
  const destination = resolve(targetRoot, skillId);
  const destinationRelative = relative(targetRoot, destination);
  if (destinationRelative === '' || destinationRelative === '..' || destinationRelative.startsWith(`..${sep}`) || isAbsolute(destinationRelative)) {
    throw new Error(`Invalid skill id: ${skillId}.`);
  }
  return destination;
}

function projectRelative(projectRoot, destination) {
  return relative(projectRoot, destination).split('\\').join('/');
}

function readLockfile(projectRoot) {
  const file = join(projectRoot, '.powerups-lock.json');
  if (!existsSync(file)) return { skills: [] };
  const lockfile = JSON.parse(readFileSync(file, 'utf8'));
  return { ...lockfile, skills: Array.isArray(lockfile.skills) ? lockfile.skills : [] };
}

function writeLockfile(projectRoot, entry) {
  const lockfile = readLockfile(projectRoot);
  const skills = lockfile.skills.filter((skill) => skill.id !== entry.id || skill.agent !== entry.agent);
  skills.push(entry);
  writeFileSync(join(projectRoot, '.powerups-lock.json'), `${JSON.stringify({ ...lockfile, skills }, null, 2)}\n`);
}

export function installSkill({ projectRoot, repositoryRoot, skill, agent, dryRun, sourceDirectory }) {
  if (!skill.targets.includes(agent)) throw new Error(`Unsupported target: ${agent}`);
  const destination = targetDestination(projectRoot, skill.id, agent);
  const path = projectRelative(projectRoot, destination);
  const files = [relative(sourceDirectory, resolve(repositoryRoot, skill.path)).split('\\').join('/')];

  if (dryRun) return { destination: path, files };

  mkdirSync(projectRoot, { recursive: true });
  cpSync(sourceDirectory, destination, { recursive: true });
  writeLockfile(projectRoot, {
    id: skill.id,
    version: skill.version,
    sha256: skill.sha256,
    agent,
    path,
  });
  return { destination: path, files };
}
