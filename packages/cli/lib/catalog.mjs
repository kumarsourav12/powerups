import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';

const requiredFields = ['id', 'version', 'path', 'sha256', 'license', 'targets'];
const skillIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateSkill(skill) {
  if (!skill || typeof skill !== 'object') throw new Error('Catalog entries must be objects.');

  for (const field of requiredFields) {
    if (skill[field] === undefined || skill[field] === '') {
      throw new Error(`Catalog entry ${skill.id ?? '(unknown)'} is missing ${field}.`);
    }
  }

  if (!skillIdPattern.test(skill.id)) {
    throw new Error(`Invalid skill id: ${skill.id}.`);
  }

  if (skill.path !== `skills/${skill.id}/SKILL.md`) {
    throw new Error(`Catalog entry ${skill.id} must use canonical source path skills/${skill.id}/SKILL.md.`);
  }

  if (!Array.isArray(skill.targets) || skill.targets.length === 0) {
    throw new Error(`Catalog entry ${skill.id} must declare at least one target.`);
  }

  if (!/^[a-f0-9]{64}$/.test(skill.sha256)) {
    throw new Error(`Catalog entry ${skill.id} must declare a SHA-256 checksum.`);
  }
}

function sourceFile(repositoryRoot, skill) {
  const file = resolve(repositoryRoot, skill.path);
  if (relative(repositoryRoot, file).startsWith(`..${sep}`)) {
    throw new Error(`Skill ${skill.id} has a source path outside the repository.`);
  }
  return file;
}

export function readCatalog(repositoryRoot) {
  const catalog = JSON.parse(readFileSync(resolve(repositoryRoot, 'registry/skills.json'), 'utf8'));
  if (!Array.isArray(catalog.skills)) throw new Error('Catalog must contain skills.');
  for (const skill of catalog.skills) validateSkill(skill);
  return catalog;
}

export function findSkill(catalog, id) {
  const skill = catalog.skills.find((entry) => entry.id === id);
  if (!skill) throw new Error(`Unknown skill: ${id}`);
  return skill;
}

export function verifySource(repositoryRoot, skill) {
  const source = sourceFile(repositoryRoot, skill);
  const checksum = createHash('sha256').update(readFileSync(source)).digest('hex');
  if (checksum !== skill.sha256) throw new Error(`Checksum verification failed for ${skill.id}.`);
  return { source, directory: dirname(source) };
}
