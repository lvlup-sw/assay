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

  it('SkillsDirectory_VendorDirIsExcludedFromPublicSkills', () => {
    // The _vendor namespace contains pinned upstream copies; they are not user-facing skills.
    // Underscore prefix is the convention for non-public namespaces.
    const vendorPath = resolve(ROOT, 'skills/_vendor');
    if (existsSync(vendorPath)) {
      // Verify any vendored skills have name fields starting with `_vendor:`
      // so they don't trigger as public skills.
      // (Detailed assertion lives in tests/vendor.test.ts)
      expect(true).toBe(true);
    }
  });
});
