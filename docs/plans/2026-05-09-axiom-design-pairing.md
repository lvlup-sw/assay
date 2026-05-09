# Implementation Plan: Axiom Design-Mode + Project-Invariants Pairing

> **Feature ID:** `axiom-design-pairing`
> **Design:** [`docs/designs/2026-05-09-axiom-design-pairing.md`](../designs/2026-05-09-axiom-design-pairing.md)
> **Iron Law:** No production code without a failing test first.
> **Test framework:** vitest (existing axiom suite in `tests/`).
>
> **Implementation note (2026-05-09, post-review).** This plan originally targeted the vendored `skill-creator` at `axiom/skills/_vendor/skill-creator/` with a `name: _vendor:skill-creator` frontmatter rewrite. The shipped layout moved the vendor to repo-root `vendor/skill-creator/` (outside `skills/`, so the loader never enumerates it) and dropped the frontmatter rewrite — path placement is the structural guarantee instead. Task and verification text below has been updated to the shipped paths; the design doc's parallel post-review note has full context (commit `cd84bff`).

---

## Overview

This plan decomposes the design's three deliverables into TDD tasks. Each task follows RED → GREEN → REFACTOR.

**TDD adaptation for skills repo.** The existing axiom test suite (`tests/skill-frontmatter.test.ts`, `tests/dimension-coverage.test.ts`, `tests/cross-references.test.ts`, `tests/plugin-structure.test.ts`) verifies skill structure: file existence, frontmatter shape, dimension coverage, cross-reference resolution. New tests follow the same pattern — assert file/section/frontmatter shape, then write content to satisfy.

**Prerequisite (Task 0).** A non-TDD investigation gates Task 6 (vendoring): confirm `anthropics/skills` license terms allow redistribution.

---

## Spec Traceability

### Scope Declaration

**Target:** Full design — all three components (A: `axiom:design` + augmented dimensions; B: `axiom:scaffold-invariants` + vendored skill-creator; C: pairing contract) plus DR-9 failure-mode docs and DR-10 audit extension.

**Excluded:**
- Coordinated update to `exarchos:design-invariants` `pairs-with` field (cross-repo, tracked in Definition of Done).
- Eval-prompt suite for trigger accuracy (deferred per design Follow-ups; requires both new skills to exist before authoring).
- Bidirectional contract validation (deferred per design Follow-ups).

### Traceability Matrix

| Design Section | Key Requirements | Task ID(s) | Status |
|----------------|------------------|------------|--------|
| Problem Statement | Context only — no tasks | — | Covered (informs scope) |
| Goals and Non-Goals | Constraints only — no tasks | — | Covered (informs scope) |
| Considered Options | Rationale only — no tasks | — | Covered (informs scope) |
| Chosen Approach | Option 2 selected | All tasks | Covered |
| Technical Design > Architecture overview | Three components diagram | T1–T13 | Covered |
| Technical Design > Naming | `axiom:design`, `axiom:scaffold-invariants`, `vendor/skill-creator` (path-isolated, not a renamed skill) | T2, T6, T8 | Covered |
| Technical Design > Component A | DR-1: skill exists; DR-3: pairing slots | T2, T3 | Covered |
| Technical Design > Component A' | DR-2: dimensions.md augmented | T1 | Covered |
| Technical Design > Component B | DR-5: scaffolder skill | T8, T9 | Covered |
| Technical Design > Component B' | DR-6: vendor + CI sync | T0, T6, T7 | Covered |
| Technical Design > Component C | DR-3, DR-8: pairing contract | T4 | Covered |
| Requirements > DR-1 | axiom:design exists | T2, T3 | Covered |
| Requirements > DR-2 | dimensions.md augmented | T1 | Covered |
| Requirements > DR-3 | pairing slots discoverable | T4 | Covered |
| Requirements > DR-4 | interleaving behavior | T5 | Covered |
| Requirements > DR-5 | scaffold-invariants exists | T8, T9 | Covered |
| Requirements > DR-6 | vendored skill-creator + CI | T0, T6, T7 | Covered |
| Requirements > DR-7 | scaffolder emits well-formed skill | T10, T11 | Covered |
| Requirements > DR-8 | pairing contract documented | T4 | Covered |
| Requirements > DR-9 | graceful failure modes | T13 | Covered |
| Requirements > DR-10 | audit advisory pairing check | T12 | Covered |
| Integration Points | Migration sequencing | All tasks (sequenced in Wave plan) | Covered |
| Testing Strategy | Three layers: structural lint, behavioral fixtures, regression | All tasks (each emits tests) | Covered |
| Open Questions | Deferred per design | — | Deferred (per design §Open Questions) |
| Risks | Mitigations only — no tasks | — | Covered (informs scope) |
| Follow-ups | Out of scope for this plan | — | Deferred (eval suite, bidirectional validation) |

---

### Task 0: Verify `anthropics/skills` license

**Phase:** Investigation only (no TDD — gates downstream work)
**Test Layer:** N/A
**Implements:** DR-6 (prerequisite)

**TDD Steps:**
1. Fetch `https://github.com/anthropics/skills/blob/main/LICENSE`
2. Confirm permissive license (MIT / Apache 2.0 / similar) allowing redistribution with attribution
3. Document outcome in `axiom/vendor/.license-decision.md` (commit even if vendoring proceeds)

**Outcome gate:**
- **Pass:** continue with T6.
- **Fail:** abandon vendoring; reduce DR-6 / DR-7 scope to "thin facade documenting interview pattern, no vendored content." Update design doc with deferral.

**Verification:**
- [ ] License file fetched and read
- [ ] Decision recorded in repo
- [ ] Either T6 unblocked or design amended

**Dependencies:** None.
**Parallelizable:** Yes (independent).

---

### Task 1: Augment `dimensions.md` with Design questions (Component A')

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (structural)
**Implements:** DR-2

**TDD Steps:**
1. **[RED]** Write test: `DimensionsMd_AllEightDimensions_HaveDesignQuestionsBlock`
   - File: `tests/dimension-coverage.test.ts` (extend existing)
   - Expected failure: `dimensions.md` currently has no `### Design questions` blocks
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Add 8 `### Design questions` blocks to `skills/backend-quality/references/dimensions.md`
   - File: `skills/backend-quality/references/dimensions.md`
   - One block per DIM-N, 3–5 imperative-question bullets, framed as design constraints
   - Preserve all existing review-mode sections unchanged
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Verify uniformity: all 8 blocks share heading depth and bullet count band
   - Run: `npm run test:run` — MUST STAY GREEN

**Verification:**
- [ ] Test fails before content added (witnessed)
- [ ] Test passes after content added
- [ ] No existing `dimension-coverage.test.ts` assertions broken

**Dependencies:** None.
**Parallelizable:** Yes.

---

### Task 2: Create `axiom:design` skill skeleton (naming + Architecture overview anchor)

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (structural)
**Implements:** DR-1

**TDD Steps:**
1. **[RED]** Write test: `AxiomDesign_Skill_ExistsWithRequiredFrontmatter`
   - File: `tests/skill-frontmatter.test.ts` (extend `INVOKABLE_SKILLS` array to include `'design'`)
   - Expected failure: `skills/design/SKILL.md` does not exist
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Create `skills/design/SKILL.md` with frontmatter-only skeleton
   - File: `skills/design/SKILL.md`
   - Frontmatter: `name: design`, `user-invokable: true`, `metadata.category: design`, `metadata.dimensions: ['all']`, `pairs-with-pattern: <project>:*-invariants`, description with triggers
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Cross-check `tests/plugin-structure.test.ts` `SkillsDirectory_ContainsExpectedSubdirs` — extend expected list to include `'design'`

**Verification:**
- [ ] Frontmatter test fails before file exists
- [ ] Frontmatter test passes after file created
- [ ] Plugin-structure test passes with extended list

**Dependencies:** None.
**Parallelizable:** Yes.

---

### Task 3: Write `axiom:design` skill body

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (structural + cross-reference)
**Implements:** DR-1, DR-3

**TDD Steps:**
1. **[RED]** Write test: `AxiomDesign_Body_ReferencesFoundationAndContract`
   - File: `tests/axiom-design.test.ts` (new)
   - Assertion: SKILL.md body contains `@skills/backend-quality/references/dimensions.md` reference and `@skills/backend-quality/references/pairing-contract.md` reference; documents the three operating modes (no paired skill / one / many)
   - Expected failure: skeleton body has none of these
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Write the SKILL.md body
   - File: `skills/design/SKILL.md`
   - Sections: Overview, Triggers, Process, Pairing Discovery, References
   - Reference both `dimensions.md` and `pairing-contract.md`
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Tighten prose; ensure description ≤ 1024 chars; verify cross-references test passes

**Verification:**
- [ ] Body assertions fail before content
- [ ] Body assertions pass after content
- [ ] `tests/cross-references.test.ts` still passes for all skills

**Dependencies:** T2 (skeleton must exist), T4 (`pairing-contract.md` must be referenceable).
**Parallelizable:** No (sequential after T2 and T4).

---

### Task 4: Author pairing contract reference doc

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (structural)
**Implements:** DR-3, DR-8

**TDD Steps:**
1. **[RED]** Write test: `PairingContract_File_DefinesAllRequiredSlots`
   - File: `tests/pairing-contract.test.ts` (new)
   - Assertion: `skills/backend-quality/references/pairing-contract.md` exists; contains slot definitions for `pairs-with`, `pairs-with-pattern`, `axiom_overlap`; contains `## Ordering rule`, `## Cross-reference convention`, `## Worked example` sections
   - Expected failure: file does not exist
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Author `skills/backend-quality/references/pairing-contract.md`
   - File: `skills/backend-quality/references/pairing-contract.md`
   - Three slot definitions (table format), ordering rule (project-specific precedence), cross-reference convention (leaves → branches), worked example using `exarchos:design-invariants`
   - Add reference from `skills/backend-quality/SKILL.md`
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Verify cross-reference test still passes for `backend-quality` skill (the new file must be referenced)

**Verification:**
- [ ] File-existence test fails before authoring
- [ ] File-existence test passes after authoring
- [ ] Cross-reference test still passes for `backend-quality`

**Dependencies:** None.
**Parallelizable:** Yes.

---

### Task 5: Document `axiom:design` pairing-discovery + interleaving behavior

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (content assertions)
**Implements:** DR-4

**TDD Steps:**
1. **[RED]** Write test: `AxiomDesign_Body_DocumentsInterleaving`
   - File: `tests/axiom-design.test.ts` (extend)
   - Assertion: SKILL.md body documents (a) frontmatter-slot lookup mechanic, (b) per-dimension interleaving rule (generic first, project-specific after, `axiom_overlap`-matched), (c) ordering precedence (project-specific wins on conflict)
   - Expected failure: body lacks interleaving documentation
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Add `## Pairing Discovery` and `## Output Composition` sections to `skills/design/SKILL.md`
   - File: `skills/design/SKILL.md`
   - Document the lookup mechanic, dimension-by-dimension interleaving, ordering rule
   - Reference pairing-contract.md
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Verify worked example renders correctly when paired with `exarchos:design-invariants`

**Verification:**
- [ ] Interleaving assertions fail before content
- [ ] Interleaving assertions pass after content
- [ ] Reference to `pairing-contract.md` resolves

**Dependencies:** T3 (body must exist), T4 (contract must be referenceable).
**Parallelizable:** No.

---

### Task 6: Vendor `skill-creator` from upstream

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (structural + frontmatter)
**Implements:** DR-6

**TDD Steps:**
1. **[RED]** Write test: `VendorSkillCreator_Files_PresentAndRenamed`
   - File: `tests/vendor.test.ts` (new)
   - Assertion: `vendor/skill-creator/SKILL.md` exists (path-isolated outside `skills/` — frontmatter `name` is unchanged from upstream because the loader never enumerates `vendor/`); `vendor/skill-creator/UPSTREAM.md` exists with required fields (`source_url`, `commit_sha`, `sync_date`); `vendor/skill-creator/LICENSE` exists
   - Expected failure: directory does not exist
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Vendor the upstream content
   - Source: `https://github.com/anthropics/skills/tree/main/skills/skill-creator`
   - Destination: `vendor/skill-creator/` (repo-root, outside `skills/`)
   - Frontmatter `name:` left unchanged (path placement, not name rewrite, prevents loader collision)
   - Copy `LICENSE` from upstream root
   - Author `UPSTREAM.md` with source URL, commit SHA, sync date, rewrite-policy note
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Cross-check: ensure no existing axiom test enumerates `vendor/` as a skills root (the test scans `skills/`, so `vendor/` is naturally excluded — verify, no exclusion patch needed)

**Verification:**
- [ ] Vendor-presence test fails before import
- [ ] Vendor-presence test passes after import
- [ ] No existing skill-discovery test treats `vendor/` as a skills root

**Dependencies:** T0 (license verified).
**Parallelizable:** Yes (after T0).

---

### Task 7: CI workflow for vendor sync

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (YAML structural)
**Implements:** DR-6

**TDD Steps:**
1. **[RED]** Write test: `VendorSync_Workflow_HasCorrectShape`
   - File: `tests/vendor.test.ts` (extend)
   - Assertion: `.github/workflows/vendor-sync.yml` exists; YAML parses; has `schedule:` with `cron:` (weekly cadence); references `anthropics/skills` upstream; has step that opens a PR on drift; runs on `ubuntu-latest`
   - Expected failure: file does not exist
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Author `.github/workflows/vendor-sync.yml`
   - File: `.github/workflows/vendor-sync.yml`
   - Steps: checkout, fetch upstream `anthropics/skills`, diff against `vendor/skill-creator/`, open PR if drift detected (using `peter-evans/create-pull-request`), include diff and updated `UPSTREAM.md` fields
   - Run on schedule: weekly Mondays 10:00 UTC
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Validate YAML syntax; confirm secrets/permissions block matches existing axiom workflows

**Verification:**
- [ ] Workflow-shape test fails before authoring
- [ ] Workflow-shape test passes after authoring
- [ ] YAML is valid (no parse errors)

**Dependencies:** T6 (vendor directory must exist for sync to target).
**Parallelizable:** No (after T6).

---

### Task 8: Create `axiom:scaffold-invariants` skill skeleton

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (structural)
**Implements:** DR-5

**TDD Steps:**
1. **[RED]** Write test: `ScaffoldInvariants_Skill_ExistsWithRequiredFrontmatter`
   - File: `tests/skill-frontmatter.test.ts` (extend `INVOKABLE_SKILLS` to include `'scaffold-invariants'`)
   - Assertion: `skills/scaffold-invariants/SKILL.md` exists; frontmatter has `name: scaffold-invariants`, `user-invokable: true`, `metadata.category: meta-authoring`; description includes triggers `scaffold invariants`, `bootstrap design skill`, `/axiom:scaffold-invariants`
   - Expected failure: file does not exist
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Create `skills/scaffold-invariants/SKILL.md` with frontmatter-only skeleton
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Extend `tests/plugin-structure.test.ts` expected directories list to include `'scaffold-invariants'`

**Verification:**
- [ ] Skeleton test fails before file
- [ ] Skeleton test passes after file
- [ ] Plugin-structure expected list updated

**Dependencies:** None.
**Parallelizable:** Yes.

---

### Task 9: Author `axiom:scaffold-invariants` interview script in body

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (content assertions)
**Implements:** DR-5

**TDD Steps:**
1. **[RED]** Write test: `ScaffoldInvariants_Body_DocumentsInterviewSection`
   - File: `tests/scaffold-invariants.test.ts` (new)
   - Assertion: body contains `## Interview` section listing 5 question categories (one-line characterization, non-obvious commitments, dimension overlap, failure mode, mechanical checks); each category has at least one example prompt
   - Expected failure: skeleton body has no Interview section
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Author the SKILL.md body
   - File: `skills/scaffold-invariants/SKILL.md`
   - Sections: Overview, Triggers, Interview (5 categories with prompt examples), Emit (template list and output paths), References
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Tighten descriptions; verify description ≤ 1024 chars

**Verification:**
- [ ] Interview-section test fails before content
- [ ] Interview-section test passes after content
- [ ] Description-length cap holds

**Dependencies:** T8 (skeleton).
**Parallelizable:** No (after T8).

---

### Task 10: Author scaffolder template files

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (structural + template-substitution)
**Implements:** DR-7

**TDD Steps:**
1. **[RED]** Write test: `ScaffoldInvariants_Templates_AllPresentAndWellFormed`
   - File: `tests/scaffold-invariants.test.ts` (extend)
   - Assertion: `skills/scaffold-invariants/templates/SKILL.template.md`, `INV.template.md`, `deterministic-checks.template.md` all exist; each contains expected placeholder tokens (`{{PROJECT_NAME}}`, `{{INV_ID}}`, `{{AXIOM_OVERLAP}}`, `{{ONE_LINE_CHARACTERIZATION}}`, etc.)
   - Expected failure: template directory does not exist
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Create the three template files
   - Files: `skills/scaffold-invariants/templates/{SKILL,INV,deterministic-checks}.template.md`
   - Modeled exactly on `exarchos/.claude/skills/design-invariants/SKILL.md`, `references/INV-1-event-sourcing.md`, and `references/deterministic-checks.md`
   - Use `{{TOKEN}}` placeholders consistent with axiom's existing skills-src convention (cross-check exarchos's `skills-src/` pattern)
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Run a synthetic-substitution test: substitute placeholder values and verify the result is well-formed Markdown with valid YAML frontmatter

**Verification:**
- [ ] Templates-presence test fails before files
- [ ] Templates-presence test passes after files
- [ ] Synthetic substitution produces valid Markdown + YAML

**Dependencies:** T8 (parent skill dir must exist).
**Parallelizable:** Yes (independent of T9).

---

### Task 11: Document scaffolder emit-correctness in body

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (content assertions)
**Implements:** DR-7

**TDD Steps:**
1. **[RED]** Write test: `ScaffoldInvariants_Body_DocumentsEmitCorrectness`
   - File: `tests/scaffold-invariants.test.ts` (extend)
   - Assertion: SKILL.md body's `## Emit` section documents (a) generated SKILL.md gets `pairs-with: axiom:design`, (b) each invariant entry includes `axiom_overlap: DIM-N` if user named one, (c) generated structure: `SKILL.md` + `references/INV-N-<slug>.md` + `references/deterministic-checks.md`
   - Expected failure: emit section does not document these
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Add or expand `## Emit` section in SKILL.md body
   - File: `skills/scaffold-invariants/SKILL.md`
   - Document the three correctness properties; reference templates from T10
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Verify cross-references resolve (templates exist per T10)

**Verification:**
- [ ] Emit-correctness assertions fail before content
- [ ] Emit-correctness assertions pass after content
- [ ] Templates referenced in body exist (per T10)

**Dependencies:** T9 (body), T10 (templates).
**Parallelizable:** No.

---

### Task 12: Extend `axiom:audit` with advisory pairing-contract check

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (content assertions + cross-reference)
**Implements:** DR-10

**TDD Steps:**
1. **[RED]** Write test: `AxiomAudit_Body_DocumentsPairingContractCheck`
   - File: `tests/skill-frontmatter.test.ts` or new
   - Assertion: `skills/audit/SKILL.md` body documents the pairing-contract check (LOW severity, advisory only, never blocks); references `pairing-contract.md` and the two specific checks (paired skill declares ≥1 `axiom_overlap`; declared overlaps reference real DIM-N IDs)
   - Expected failure: audit body has no pairing-contract section
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Add a `## Pairing Contract Check` subsection to `skills/audit/SKILL.md`
   - File: `skills/audit/SKILL.md`
   - Document the two checks, severity, advisory-only behavior; reference `pairing-contract.md`
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Confirm cross-reference test passes (audit must reference pairing-contract.md)

**Verification:**
- [ ] Audit-extension assertion fails before content
- [ ] Audit-extension assertion passes after content
- [ ] Cross-reference resolution holds

**Dependencies:** T4 (pairing-contract.md must exist).
**Parallelizable:** Yes (after T4).

---

### Task 13: Document failure modes across both new skills

**Phase:** RED → GREEN → REFACTOR
**Test Layer:** unit (content assertions)
**Implements:** DR-9

**TDD Steps:**
1. **[RED]** Write test: `NewSkills_DocumentFailureModes`
   - File: `tests/axiom-design.test.ts` and `tests/scaffold-invariants.test.ts` (extend)
   - Assertions:
     - `axiom:design` body documents: (a) no paired skill → generic-only + scaffolder hint, (b) multiple paired skills → named subsections, (c) paired skill with no invariants → generic-only + warning
     - `axiom:scaffold-invariants` body documents: vendored skill-creator missing/stale → fall back to bundled templates with one-line warning
   - Expected failure: bodies do not document these cases
   - Run: `npm run test:run` — MUST FAIL

2. **[GREEN]** Add `## Failure Modes` section to both `skills/design/SKILL.md` and `skills/scaffold-invariants/SKILL.md`
   - Document each case with the exact message text the skill should emit
   - Run: `npm run test:run` — MUST PASS

3. **[REFACTOR]** Verify message strings are consistent with DR-9 acceptance criteria

**Verification:**
- [ ] Failure-mode assertions fail before content
- [ ] Failure-mode assertions pass after content
- [ ] Message strings match DR-9 acceptance criteria text

**Dependencies:** T3, T9 (bodies must exist).
**Parallelizable:** No (after T3 and T9).

---

## Sequencing and Parallelization

**Wave 1 (parallel — no dependencies):**
- T0 (license check)
- T1 (dimensions.md augmentation)
- T2 (axiom:design skeleton)
- T4 (pairing-contract doc)
- T8 (scaffold-invariants skeleton)

**Wave 2 (parallel after Wave 1):**
- T3 (axiom:design body) — needs T2, T4
- T6 (vendor skill-creator) — needs T0
- T9 (scaffold-invariants interview script) — needs T8
- T10 (scaffolder templates) — needs T8
- T12 (audit extension) — needs T4

**Wave 3 (parallel after Wave 2):**
- T5 (axiom:design pairing behavior) — needs T3, T4
- T7 (CI vendor-sync workflow) — needs T6
- T11 (scaffolder emit behavior) — needs T9, T10

**Wave 4 (final):**
- T13 (failure-modes documentation) — needs T3, T9

**Critical path:** T0/T8 → T6 → T7 OR T2/T4 → T3 → T5/T13 (longest chain).

**Total tasks:** 14 (T0..T13).
**Parallel-safe groups for delegation:** Wave 1 has 5 parallelizable tasks; Wave 2 has 5; Wave 3 has 3; Wave 4 has 1.

---

## Test Files Summary

New test files added:
- `tests/axiom-design.test.ts` — covers T2, T3, T5, T13
- `tests/scaffold-invariants.test.ts` — covers T8, T9, T10, T11, T13
- `tests/vendor.test.ts` — covers T6, T7
- `tests/pairing-contract.test.ts` — covers T4

Existing tests extended:
- `tests/skill-frontmatter.test.ts` — `INVOKABLE_SKILLS` extended with `'design'` and `'scaffold-invariants'`; new T12 audit assertion
- `tests/dimension-coverage.test.ts` — new T1 design-questions assertion
- `tests/plugin-structure.test.ts` — `expected` directories extended (no `vendor/` exclusion needed; the test scans `skills/`, which doesn't contain `vendor/`)
- `tests/cross-references.test.ts` — new pairing-contract.md cross-reference

---

## Definition of Done

- All 14 tasks (T0..T13) complete with test → implementation commit ordering visible in git history.
- `npm run test:run` passes with all new tests green.
- All 10 design DRs map to at least one task and are verifiable from acceptance criteria.
- Vendored `skill-creator` has `UPSTREAM.md` with current commit SHA.
- CI vendor-sync workflow has run at least once successfully (or been validated by manual trigger).
- A coordination PR against `exarchos` updates `exarchos:design-invariants` `pairs-with: axiom:backend-quality` → `pairs-with: axiom:design` (separate change set, but tracked here).

---

## Notes for Reviewer

- **Documentation-driven TDD.** Most tasks "test" content presence via structural assertions (content includes specific section, frontmatter has specific field, file exists with specific shape). This mirrors axiom's existing test pattern. The tests are real failures-before-content, not theatre.
- **No production code in the traditional sense.** Axiom is a skills repo; "implementation" is markdown + YAML + CI workflow. The Iron Law is honored by writing assertion-tests first, then content.
- **Vendoring blocked on license.** T0 is a hard gate. If license is incompatible, T6/T7/T10/T11 scope shrinks materially and design needs amendment.
- **Coordination dependency on exarchos.** DR-3 acceptance criteria mention updating `exarchos:design-invariants`'s `pairs-with` field. That's a separate-repo change tracked in the Definition of Done but not a task in this plan.
