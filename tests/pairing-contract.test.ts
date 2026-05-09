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

    // Three slot definitions must be present, each independently — boundary-aware
    // so that `pairs-with-pattern` can't satisfy the `pairs-with` check.
    // `pairs-with` matches when followed by a non-hyphen boundary (whitespace, end,
    // backtick, colon, comma, period). `pairs-with-pattern` is matched as the literal
    // word followed by the same boundary class.
    const slotBoundary = String.raw`(?![\w-])`;
    expect(content, 'missing slot: pairs-with').toMatch(new RegExp(String.raw`pairs-with${slotBoundary}`));
    expect(content, 'missing slot: pairs-with-pattern').toMatch(new RegExp(String.raw`pairs-with-pattern${slotBoundary}`));
    expect(content, 'missing slot: axiom_overlap').toMatch(new RegExp(String.raw`axiom_overlap${slotBoundary}`));
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

    // DR-10 specifies TWO distinct checks; both must be documented
    expect(content, 'audit must document overlap-declaration check (check 1 of 2)')
      .toMatch(/Overlap declaration|declares.*axiom_overlap.*at least|≥1 axiom_overlap|at least one of its invariants/i);
    expect(content, 'audit must document overlap-validity check (check 2 of 2)')
      .toMatch(/Overlap validity|reference (real|valid).*DIM-N|DIM-1 through DIM-8|reference a real dimension/i);
  });
});
