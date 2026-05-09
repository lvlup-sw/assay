import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(import.meta.dirname, '..');
const VENDOR_DIR = resolve(ROOT, 'vendor/skill-creator');

function parseFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const parsed = parseYaml(match[1]);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  return parsed as Record<string, unknown>;
}

describe('Vendored skill-creator (vendor/skill-creator)', () => {
  it('Vendor_LivesOutsideSkillsDir', () => {
    // Path placement is what prevents trigger collision — vendor/ is not scanned by the skill loader.
    expect(existsSync(VENDOR_DIR), 'vendor/skill-creator missing').toBe(true);
    expect(existsSync(resolve(ROOT, 'skills/_vendor')), 'old skills/_vendor must be removed').toBe(false);
  });

  it('Vendor_FullDirectoryPresent_NotJustSkillMd', () => {
    // The whole point of full-directory vendoring is preserving upstream's internal references.
    // SKILL.md cites agents/, references/, eval-viewer/, scripts/ — all must be present.
    const expectedSubdirs = ['agents', 'assets', 'eval-viewer', 'references', 'scripts'];
    for (const sub of expectedSubdirs) {
      const p = resolve(VENDOR_DIR, sub);
      expect(existsSync(p), `subdir missing: ${sub}`).toBe(true);
      expect(statSync(p).isDirectory(), `${sub} must be a directory`).toBe(true);
    }
  });

  it('Vendor_SkillMdIsUpstreamUnchanged', () => {
    const skillPath = resolve(VENDOR_DIR, 'SKILL.md');
    expect(existsSync(skillPath)).toBe(true);
    const content = readFileSync(skillPath, 'utf-8');
    const fm = parseFrontmatter(content);
    expect(fm, 'SKILL.md must have frontmatter').not.toBeNull();
    // No frontmatter rewrite — name stays as upstream
    expect(fm!.name, 'frontmatter name must be unchanged from upstream').toBe('skill-creator');
  });

  it('Vendor_LicenseFile_PresentAndApache2', () => {
    const licensePath = resolve(VENDOR_DIR, 'LICENSE');
    expect(existsSync(licensePath), 'LICENSE missing').toBe(true);
    const content = readFileSync(licensePath, 'utf-8');
    expect(content, 'LICENSE must be Apache 2.0').toMatch(/Apache License/);
    expect(content, 'LICENSE must reference version 2.0').toMatch(/Version 2\.0/);
  });

  it('Vendor_UpstreamMd_HasRequiredProvenanceFields', () => {
    const upstreamPath = resolve(VENDOR_DIR, 'UPSTREAM.md');
    expect(existsSync(upstreamPath), 'UPSTREAM.md missing').toBe(true);
    const content = readFileSync(upstreamPath, 'utf-8');
    expect(content, 'must record source URL').toMatch(/source[_-]url|github\.com\/anthropics\/skills/i);
    expect(content, 'must record commit SHA').toMatch(/commit[_-]sha|sha:|commit:/i);
    expect(content, 'must record sync date').toMatch(/sync[_-]date|synced:|date:/i);
    expect(content, 'must declare full-directory vendoring policy').toMatch(/verbatim|full[\- ]directory|unmodified/i);
  });

  it('Vendor_RelativeReferences_AllResolveLocally', () => {
    // The SKILL.md references files like agents/grader.md, references/schemas.md, etc.
    // With full-directory vendoring, these must all resolve.
    const skillPath = resolve(VENDOR_DIR, 'SKILL.md');
    const content = readFileSync(skillPath, 'utf-8');
    const refs = [
      'agents/grader.md',
      'agents/comparator.md',
      'agents/analyzer.md',
      'references/schemas.md',
      'eval-viewer/generate_review.py',
      'assets/eval_review.html',
    ];
    for (const ref of refs) {
      if (!content.includes(ref)) continue; // only check refs the body actually cites
      const refPath = resolve(VENDOR_DIR, ref);
      expect(
        existsSync(refPath),
        `SKILL.md references ${ref} but file is not present in vendor/skill-creator/`
      ).toBe(true);
    }
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

    expect(content, 'must have schedule trigger').toMatch(/schedule:/);
    expect(content, 'must specify cron').toMatch(/cron:/);
    expect(content, 'must reference anthropics/skills upstream').toContain('anthropics/skills');
    expect(content, 'must run on ubuntu-latest').toMatch(/runs-on:\s*ubuntu-latest/);
    expect(content, 'must use create-pull-request action or gh pr').toMatch(/create-pull-request|gh pr create/);

    // Workflow YAML must parse
    expect(() => parseYaml(content), 'workflow YAML must parse').not.toThrow();

    // Must NOT use sed for UPSTREAM.md updates — earlier sed-based approach had
    // unescaped pipe characters that conflicted with markdown table cells.
    expect(content, 'sed updates to UPSTREAM.md are forbidden — use Python or yq instead').not.toMatch(/sed -i.*UPSTREAM\.md/);
  });
});
