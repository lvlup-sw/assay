import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(import.meta.dirname, '..');
const VENDOR_DIR = resolve(ROOT, 'skills/_vendor/skill-creator');

function parseFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const parsed = parseYaml(match[1]);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  return parsed as Record<string, unknown>;
}

describe('Vendored skill-creator', () => {
  it('VendorSkillCreator_SkillFile_ExistsAndIsRenamed', () => {
    const skillPath = resolve(VENDOR_DIR, 'SKILL.md');
    expect(existsSync(skillPath), 'vendored SKILL.md missing').toBe(true);
    const content = readFileSync(skillPath, 'utf-8');
    const fm = parseFrontmatter(content);
    expect(fm, 'vendored SKILL.md must have frontmatter').not.toBeNull();
    expect(fm!.name, 'vendored skill must be renamed to _vendor:skill-creator').toBe('_vendor:skill-creator');
  });

  it('VendorSkillCreator_LicenseFile_Present', () => {
    const licensePath = resolve(VENDOR_DIR, 'LICENSE');
    expect(existsSync(licensePath), 'LICENSE file missing in vendor dir').toBe(true);
    const content = readFileSync(licensePath, 'utf-8');
    expect(content, 'LICENSE must be Apache 2.0').toMatch(/Apache License/);
  });

  it('VendorSkillCreator_UpstreamMd_Present_HasRequiredFields', () => {
    const upstreamPath = resolve(VENDOR_DIR, 'UPSTREAM.md');
    expect(existsSync(upstreamPath), 'UPSTREAM.md missing in vendor dir').toBe(true);
    const content = readFileSync(upstreamPath, 'utf-8');
    expect(content, 'UPSTREAM.md must record source URL').toMatch(/source[_-]url|github\.com\/anthropics\/skills/i);
    expect(content, 'UPSTREAM.md must record commit SHA').toMatch(/commit[_-]sha|sha:|commit:/i);
    expect(content, 'UPSTREAM.md must record sync date').toMatch(/sync[_-]date|synced:|date:/i);
    expect(content, 'UPSTREAM.md must document the rename policy').toMatch(/_vendor:skill-creator|rename/i);
  });
});

describe('Vendor sync CI workflow', () => {
  it('VendorSyncWorkflow_File_Exists', () => {
    const workflowPath = resolve(ROOT, '.github/workflows/vendor-sync.yml');
    expect(existsSync(workflowPath), 'vendor-sync.yml missing').toBe(true);
  });

  it('VendorSyncWorkflow_HasCorrectShape', () => {
    const workflowPath = resolve(ROOT, '.github/workflows/vendor-sync.yml');
    if (!existsSync(workflowPath)) return; // covered by existence test above
    const content = readFileSync(workflowPath, 'utf-8');

    // Must have a schedule (weekly cadence)
    expect(content, 'must have schedule trigger').toMatch(/schedule:/);
    expect(content, 'must specify cron').toMatch(/cron:/);

    // Must reference upstream
    expect(content, 'must reference anthropics/skills upstream').toContain('anthropics/skills');

    // Must run on ubuntu-latest (matching axiom's other workflows)
    expect(content, 'must run on ubuntu-latest').toMatch(/runs-on:\s*ubuntu-latest/);

    // Must open a PR on drift
    expect(content, 'must use create-pull-request action or equivalent').toMatch(/create-pull-request|gh pr create/);

    // Workflow YAML must parse
    expect(() => parseYaml(content), 'workflow YAML must parse').not.toThrow();
  });
});
