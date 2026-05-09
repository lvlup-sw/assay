import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SKILL_PATH = resolve(ROOT, 'skills/scaffold-invariants/SKILL.md');
const TEMPLATES_DIR = resolve(ROOT, 'skills/scaffold-invariants/templates');

function readSkill(): string {
  expect(existsSync(SKILL_PATH), 'scaffold-invariants/SKILL.md missing').toBe(true);
  return readFileSync(SKILL_PATH, 'utf-8');
}

describe('axiom:scaffold-invariants skill body', () => {
  it('ScaffoldInvariants_Body_DocumentsInterviewSection', () => {
    const content = readSkill();
    expect(content, 'must have Interview section').toMatch(/^## Interview/m);

    // Five required interview categories
    const categories = [
      'One-line characterization',
      'Non-obvious commitments',
      'Dimension overlap',
      'Failure mode',
      'Mechanical checks',
    ];
    for (const cat of categories) {
      expect(content, `Interview must include category: ${cat}`).toContain(cat);
    }
  });

  it('ScaffoldInvariants_Body_DocumentsEmitCorrectness', () => {
    const content = readSkill();
    expect(content, 'must have Emit section').toMatch(/^## Emit/m);
    expect(content, 'must declare pairs-with: axiom:design').toContain('pairs-with: axiom:design');
    expect(content, 'must declare axiom_overlap field').toContain('axiom_overlap: DIM-N');
    expect(content, 'must declare emitted file structure').toMatch(/SKILL\.md.*INV-N|references\/INV-N/s);
    expect(content, 'must reference deterministic-checks').toContain('deterministic-checks.md');
  });

  it('ScaffoldInvariants_Body_DocumentsFailureModes', () => {
    const content = readSkill();
    expect(content, 'must have Failure Modes section').toMatch(/^## Failure Modes/m);
    expect(content, 'must document vendored skill-creator missing/stale fallback')
      .toMatch(/Vendored skill-creator (missing|not available|missing or stale)/i);
    expect(content, 'must document existing-output-dir handling')
      .toMatch(/already exists|directory already exists/i);
    expect(content, 'must document zero-invariants edge case')
      .toMatch(/zero invariants|No invariants surfaced/i);
  });
});

describe('axiom:scaffold-invariants templates', () => {
  it('Templates_Directory_Exists', () => {
    expect(existsSync(TEMPLATES_DIR), 'templates dir missing').toBe(true);
  });

  it('Templates_AllThreeTemplatesPresent', () => {
    const expected = ['SKILL.template.md', 'INV.template.md', 'deterministic-checks.template.md'];
    for (const fname of expected) {
      const p = resolve(TEMPLATES_DIR, fname);
      expect(existsSync(p), `template missing: ${fname}`).toBe(true);
    }
  });

  it('Templates_HaveExpectedPlaceholderTokens', () => {
    const skillTemplate = resolve(TEMPLATES_DIR, 'SKILL.template.md');
    const invTemplate = resolve(TEMPLATES_DIR, 'INV.template.md');
    if (existsSync(skillTemplate)) {
      const content = readFileSync(skillTemplate, 'utf-8');
      expect(content, 'SKILL.template.md must use {{PROJECT_NAME}}').toContain('{{PROJECT_NAME}}');
      expect(content, 'SKILL.template.md must use {{ONE_LINE_CHARACTERIZATION}}').toContain('{{ONE_LINE_CHARACTERIZATION}}');
    }
    if (existsSync(invTemplate)) {
      const content = readFileSync(invTemplate, 'utf-8');
      expect(content, 'INV.template.md must use {{INV_ID}}').toContain('{{INV_ID}}');
      expect(content, 'INV.template.md must use {{AXIOM_OVERLAP}}').toContain('{{AXIOM_OVERLAP}}');
    }
  });
});
