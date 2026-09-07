import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const requiredFields = ['id', 'version', 'path', 'sha256', 'license', 'targets'];

export function validateCatalog(catalog, { root = repositoryRoot, verifyFiles = false } = {}) {
  if (!catalog || !Array.isArray(catalog.skills) || catalog.skills.length === 0) {
    throw new Error('Catalog must contain at least one skill.');
  }

  if (catalog.skills[0].id !== 'human-docs') {
    throw new Error('The first skill must be human-docs.');
  }

  for (const skill of catalog.skills) {
    if (!skill.path?.endsWith('/SKILL.md')) {
      throw new Error(`Skill ${skill.id ?? '(unknown)'} path must name a SKILL.md file.`);
    }

    for (const field of requiredFields) {
      if (skill[field] === undefined || skill[field] === '') {
        throw new Error(`Skill ${skill.id ?? '(unknown)'} is missing ${field}.`);
      }
    }

    if (!Array.isArray(skill.targets) || skill.targets.length === 0) {
      throw new Error(`Skill ${skill.id} must declare at least one target.`);
    }

    if (!/^[a-f0-9]{64}$/.test(skill.sha256)) {
      throw new Error(`Skill ${skill.id} must declare a SHA-256 checksum.`);
    }

    if (verifyFiles) {
      const contents = readFileSync(resolve(root, skill.path));
      const checksum = createHash('sha256').update(contents).digest('hex');
      if (checksum !== skill.sha256) {
        throw new Error(`Skill ${skill.id} checksum does not match its source file.`);
      }
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalog = JSON.parse(readFileSync(resolve(repositoryRoot, 'registry/skills.json'), 'utf8'));
  validateCatalog(catalog, { verifyFiles: true });
  console.log('Catalog is valid.');
}
