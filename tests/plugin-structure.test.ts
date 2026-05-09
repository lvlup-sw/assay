import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

describe('Plugin Structure', () => {
  it('PluginJson_Exists_HasRequiredFields', () => {
    const path = resolve(ROOT, '.claude-plugin/plugin.json');
    expect(existsSync(path)).toBe(true);
    const json = JSON.parse(readFileSync(path, 'utf-8'));
    expect(json.name).toBe('axiom');
    expect(json.version).toBeDefined();
    expect(json.description).toBeDefined();
  });

  it('ClaudeMd_Exists_ContainsNoExarchosReferences', () => {
    const path = resolve(ROOT, 'CLAUDE.md');
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, 'utf-8');
    expect(content.toLowerCase()).not.toContain('exarchos');
  });

  it('SkillsDirectory_ContainsExpectedSubdirs', () => {
    const expected = ['backend-quality', 'audit', 'critique', 'harden', 'distill', 'verify', 'scan', 'humanize', 'design', 'scaffold-invariants'];
    for (const dir of expected) {
      const path = resolve(ROOT, 'skills', dir);
      expect(existsSync(path), `Missing skill directory: ${dir}`).toBe(true);
    }
  });

  it('SkillsDirectory_NoVendorContent', () => {
    // Vendored upstream content lives at repo-root vendor/, NOT under skills/.
    // This prevents the skill loader from enumerating vendored content as triggerable skills.
    expect(existsSync(resolve(ROOT, 'skills/_vendor')), 'old skills/_vendor location must not exist').toBe(false);
    expect(existsSync(resolve(ROOT, 'vendor/skill-creator')), 'vendor/skill-creator must exist at repo root').toBe(true);
  });
});
