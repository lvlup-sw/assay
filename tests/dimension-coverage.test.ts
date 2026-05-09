import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(import.meta.dirname, '..');

const ALL_DIMENSIONS = ['topology', 'observability', 'contracts', 'test-fidelity', 'hygiene', 'architecture', 'resilience', 'prose-quality'];
const INVOKABLE_SKILLS = ['audit', 'critique', 'harden', 'distill', 'verify', 'scan', 'humanize', 'design', 'scaffold-invariants'];

function parseFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const parsed = parseYaml(match[1]);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  return parsed as Record<string, unknown>;
}

describe('Dimension Coverage', () => {
  it('DimensionsTaxonomy_AllEight_DefinedInDimensionsMd', () => {
    const path = resolve(ROOT, 'skills/backend-quality/references/dimensions.md');
    expect(existsSync(path), 'dimensions.md missing').toBe(true);

    const content = readFileSync(path, 'utf-8');
    const expectedHeaders = ['DIM-1', 'DIM-2', 'DIM-3', 'DIM-4', 'DIM-5', 'DIM-6', 'DIM-7', 'DIM-8'];
    for (const dim of expectedHeaders) {
      expect(content, `Missing dimension: ${dim}`).toContain(dim);
    }
  });

  it('DimensionCoverage_EachDimension_CoveredByAtLeastOneSkill', () => {
    const coverageMap = new Map<string, string[]>();
    for (const dim of ALL_DIMENSIONS) {
      coverageMap.set(dim, []);
    }

    for (const skill of INVOKABLE_SKILLS) {
      const path = resolve(ROOT, 'skills', skill, 'SKILL.md');
      expect(existsSync(path), `Missing expected skill file: skills/${skill}/SKILL.md`).toBe(true);

      const content = readFileSync(path, 'utf-8');
      const fm = parseFrontmatter(content);
      if (!fm?.metadata) continue;

      const metadata = fm.metadata as Record<string, unknown>;
      const dimensions = metadata.dimensions;
      if (!Array.isArray(dimensions)) continue;

      for (const dim of dimensions as string[]) {
        const normalized = dim.toLowerCase();
        if (normalized === 'all' || normalized === 'pluggable') {
          // 'all' covers everything, 'pluggable' covers on-demand
          for (const d of ALL_DIMENSIONS) {
            coverageMap.get(d)?.push(skill);
          }
        } else if (coverageMap.has(normalized)) {
          coverageMap.get(normalized)?.push(skill);
        }
      }
    }

    for (const [dim, skills] of coverageMap) {
      expect(skills.length, `Dimension '${dim}' not covered by any skill`).toBeGreaterThan(0);
    }
  });

  it('DimensionsMd_AllEightDimensions_HaveDesignQuestionsBlock', () => {
    const path = resolve(ROOT, 'skills/backend-quality/references/dimensions.md');
    expect(existsSync(path), 'dimensions.md missing').toBe(true);
    const content = readFileSync(path, 'utf-8');

    // Split content into per-dimension sections, identified by `## DIM-N:` headers
    const dimSectionRe = /^## (DIM-[1-8]):/gm;
    const matches = [...content.matchAll(dimSectionRe)];
    expect(matches.length, 'expected 8 DIM-N sections').toBe(8);

    // For each DIM-N, isolate its section (until next ## DIM- or EOF) and assert it
    // contains a `### Design questions` subsection with at least 3 list items.
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index!;
      const end = i + 1 < matches.length ? matches[i + 1].index! : content.length;
      const section = content.slice(start, end);
      const dimId = matches[i][1];

      expect(
        section,
        `${dimId}: missing '### Design questions' subsection`
      ).toMatch(/^### Design questions\s*$/m);

      // Count bullet items under the Design questions block (until next ### or end of section)
      const dqStart = section.search(/^### Design questions\s*$/m);
      expect(dqStart, `${dimId}: could not locate Design questions block`).toBeGreaterThanOrEqual(0);
      const afterHeader = section.slice(dqStart).replace(/^### Design questions\s*$/m, '');
      const nextHeaderIdx = afterHeader.search(/^### /m);
      const dqBlock = nextHeaderIdx >= 0 ? afterHeader.slice(0, nextHeaderIdx) : afterHeader;
      const bulletCount = (dqBlock.match(/^- /gm) ?? []).length;
      expect(
        bulletCount,
        `${dimId}: Design questions block has ${bulletCount} bullets, expected at least 3`
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('DimensionCoverage_NoSkillDeclaresUndefinedDimension', () => {
    const validDimensions = new Set([...ALL_DIMENSIONS, 'all', 'pluggable']);

    for (const skill of INVOKABLE_SKILLS) {
      const path = resolve(ROOT, 'skills', skill, 'SKILL.md');
      expect(existsSync(path), `Missing expected skill file: skills/${skill}/SKILL.md`).toBe(true);

      const content = readFileSync(path, 'utf-8');
      const fm = parseFrontmatter(content);
      if (!fm?.metadata) continue;

      const metadata = fm.metadata as Record<string, unknown>;
      const dimensions = metadata.dimensions;
      if (!Array.isArray(dimensions)) continue;

      for (const dim of dimensions as string[]) {
        expect(
          validDimensions.has(dim.toLowerCase()),
          `Skill '${skill}' declares unknown dimension: ${dim}`
        ).toBe(true);
      }
    }
  });
});
