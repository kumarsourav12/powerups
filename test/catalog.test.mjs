import assert from 'node:assert/strict';
import test from 'node:test';

import { validateCatalog } from '../scripts/validate-catalog.mjs';

test('rejects a catalog whose initial skill is not human-docs', () => {
  assert.throws(
    () => validateCatalog({ skills: [{ id: 'other-skill', path: 'skills/other-skill/SKILL.md' }] }),
    /first skill.*human-docs/i,
  );
});

test('rejects a catalog entry whose path does not name a SKILL.md file', () => {
  assert.throws(
    () => validateCatalog({ skills: [{ id: 'human-docs', path: 'skills/human-docs/README.md' }] }),
    /SKILL\.md/,
  );
});
