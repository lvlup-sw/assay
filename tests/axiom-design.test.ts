import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SKILL_PATH = resolve(ROOT, 'skills/design/SKILL.md');

function readSkill(): string {
  expect(existsSync(SKILL_PATH), 'design/SKILL.md missing').toBe(true);
  return readFileSync(SKILL_PATH, 'utf-8');
}

describe('axiom:design skill body', () => {
  it('AxiomDesign_Body_ReferencesFoundationAndContract', () => {
    const content = readSkill();
    expect(content, 'must reference dimensions.md').toContain('@skills/backend-quality/references/dimensions.md');
    expect(content, 'must reference pairing-contract.md').toContain('@skills/backend-quality/references/pairing-contract.md');
  });

  it('AxiomDesign_Body_DocumentsThreeOperatingModes', () => {
    const content = readSkill();
    expect(content, 'must document no-paired-skill mode').toMatch(/No paired skill loaded|No paired invariants skill detected/);
    expect(content, 'must document one-paired-skill mode').toMatch(/One paired skill loaded/);
    expect(content, 'must document multiple-paired-skills mode').toMatch(/Multiple paired skills loaded/);
  });

  it('AxiomDesign_Body_DocumentsPairingDiscoveryMechanic', () => {
    const content = readSkill();
    expect(content, 'must document Pairing Discovery section').toMatch(/^## Pairing Discovery/m);
    expect(content, 'must mention frontmatter slot lookup').toMatch(/frontmatter slot|pairs-with: axiom:design/);
  });

  it('AxiomDesign_Body_DocumentsInterleaving', () => {
    const content = readSkill();
    expect(content, 'must document Output Composition section').toMatch(/^## Output Composition/m);
    expect(content, 'must document interleaving by axiom_overlap').toContain('axiom_overlap');
    expect(content, 'must document ordering precedence').toMatch(/precedence|wins on conflict|takes precedence/);
  });

  it('AxiomDesign_Body_DocumentsFailureModes', () => {
    const content = readSkill();
    expect(content, 'must have Failure Modes section').toMatch(/^## Failure Modes/m);
    expect(content, 'must document scaffolder hint on no paired skill').toContain('/axiom:scaffold-invariants');
    expect(content, 'must document multiple-skill fallback').toMatch(/Multiple paired skills/);
    expect(content, 'must document no-invariants edge case').toMatch(/no invariants|has no invariants/);
  });
});
