import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CONTRACT_PATH = resolve(ROOT, 'skills/backend-quality/references/pairing-contract.md');

describe('Pairing Contract', () => {
  it('PairingContract_File_Exists', () => {
    expect(existsSync(CONTRACT_PATH), 'pairing-contract.md missing').toBe(true);
  });

  it('PairingContract_File_DefinesAllRequiredSlots', () => {
    expect(existsSync(CONTRACT_PATH)).toBe(true);
    const content = readFileSync(CONTRACT_PATH, 'utf-8');

    // Three slot definitions must be present
    expect(content, "missing slot: pairs-with").toContain('pairs-with');
    expect(content, "missing slot: pairs-with-pattern").toContain('pairs-with-pattern');
    expect(content, "missing slot: axiom_overlap").toContain('axiom_overlap');
  });

  it('PairingContract_File_HasRequiredSections', () => {
    expect(existsSync(CONTRACT_PATH)).toBe(true);
    const content = readFileSync(CONTRACT_PATH, 'utf-8');

    expect(content, "missing section: Ordering rule").toMatch(/^## Ordering rule/m);
    expect(content, "missing section: Cross-reference convention").toMatch(/^## Cross-reference convention/m);
    expect(content, "missing section: Worked example").toMatch(/^## Worked example/m);
  });

  it('PairingContract_File_ReferencedByBackendQualitySkill', () => {
    const skillPath = resolve(ROOT, 'skills/backend-quality/SKILL.md');
    expect(existsSync(skillPath)).toBe(true);
    const skillContent = readFileSync(skillPath, 'utf-8');
    expect(
      skillContent,
      'backend-quality SKILL.md must reference pairing-contract.md'
    ).toContain('pairing-contract.md');
  });

  it('PairingContract_AuditSkill_DocumentsCheck', () => {
    const auditPath = resolve(ROOT, 'skills/audit/SKILL.md');
    expect(existsSync(auditPath)).toBe(true);
    const content = readFileSync(auditPath, 'utf-8');

    // axiom:audit must document the advisory pairing-contract check
    expect(content, 'audit must have Pairing Contract Check section').toMatch(/^## Pairing Contract Check/m);
    expect(content, 'audit must reference pairing-contract.md').toContain('pairing-contract.md');
    expect(content, 'audit check must declare LOW severity').toMatch(/LOW severity/);
    expect(content, 'audit check must declare advisory-only').toMatch(/advisory only|advisory[, ]/i);
    expect(content, 'audit must document overlap-declaration check').toMatch(/axiom_overlap/);
  });
});
