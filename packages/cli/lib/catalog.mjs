import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';

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
