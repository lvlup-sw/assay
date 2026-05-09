# Axiom Design-Mode + Project-Invariants Pairing

> **Status:** Design — `axiom-design-pairing` (feature workflow)
> **Source research:** [`docs/research/2026-05-09-axiom-invariants-composition.md`](../research/2026-05-09-axiom-invariants-composition.md)
> **Approach:** Skills sharing a foundation, with light validation
> **Audience:** anyone implementing the new axiom skills or the pairing contract

> **Implementation note (2026-05-09, post-review).** This design originally specified the vendored `skill-creator` path as `axiom/skills/_vendor/skill-creator/` with a `name: _vendor:skill-creator` frontmatter rewrite to prevent trigger collision. The chosen implementation moved the vendor to repo-root `vendor/skill-creator/` (outside `skills/`, so the loader never enumerates it) and dropped the frontmatter rewrite (path placement is the structural guarantee instead). This eliminated dangling internal references caused by selective subdir vendoring. The design body below still uses the original path for historical reference — see commit `cd84bff` for the relocation rationale and `vendor/skill-creator/UPSTREAM.md` for the live documentation. The pairing contract and DR-6 acceptance criteria were updated; everything else in this design is unchanged.

---

## Problem Statement

During design work — `/exarchos:ideate` or any pre-implementation conversation — the user reflexively pairs `axiom:backend-quality` (generic DIM-1..DIM-8 dimensions) with project-specific invariants skills (e.g., `exarchos:design-invariants`'s INV-1..INV-5d). The pairing today is a verbal protocol; both sides exist but nothing makes their composition first-class.

The research report identified two orthogonal problems:

- **Composition (Q1).** Axiom dimensions are written in review-mode (severity guides, detection signals). Pairing them with project invariants during *design* is a verbal recipe with no structural support.
- **Authoring (Q2).** Each project that wants its own invariants skill hand-rolls the artifact from scratch. There's no scaffolder.

This design addresses both, plus codifies the pairing contract that ties them.

## Goals and Non-Goals

**Goals.**
- Add a design-mode entry point on the generic side (`axiom:design`) that pairs cleanly with project-specific invariants skills.
- Add a meta-skill (`axiom:scaffold-invariants`) that produces project-local invariants skills modeled on Exarchos's archetype.
- Codify the pairing contract (frontmatter slots, ordering rule, cross-reference convention) as documented and lightly validated structure.
- Preserve `axiom:backend-quality` as the foundation reference — do not rename.

**Non-goals.**
- Renaming any existing axiom skills.
- Hard validation of the pairing contract (advisory findings only).
- Bidirectional cross-validation (axiom dimensions don't track which projects pair with them).
- Extending the dimension taxonomy itself — DIM-1..DIM-8 stay stable.
- A registry of invariants skills — discovery is via frontmatter only.

## Considered Options

Three architectures were explored before selecting the chosen approach.

### Option 1 — Three independent skills + contract doc

Each deliverable ships independently with minimal coupling. Pairing contract is a doc only; no runtime validation. Smallest scope, but doesn't materially improve over today's verbal protocol — `axiom:design` doesn't *know* about the project's invariants skill at runtime, just trusts the user to invoke both. **Rejected:** insufficient improvement over status quo.

### Option 2 — Skills sharing a foundation, with light validation **(Chosen)**

Three skills + a shared foundation: augmented `dimensions.md` (dual-mode), frontmatter-slot lookup at runtime, advisory contract validation in `axiom:audit`. Composition actually happens at runtime (interleaved generic + specific output). Failure mode is graceful (no paired skill → fall back to generic). Mirrors Azure WAF's dual-section-per-pillar pattern. **Selected:** strikes the right balance of structural rigor and implementation cost.

### Option 3 — Active composition engine with bidirectional validation

`axiom:design` dynamically synthesizes a unified design surface; `axiom:audit` validates the contract bidirectionally; eval harness mandatory. Strongest guarantees but heaviest scope. Strict enforcement is brittle — a project with five solid invariants but missing `axiom_overlap` declarations would fail the gate. **Rejected:** second-system territory; premature for a contract that's still new.

## Chosen Approach

Option 2 — three skills sharing a foundation, with light validation. Detailed in the Technical Design below.

## Technical Design

### Architecture overview

```
                       ┌──────────────────────────────────────────┐
                       │  axiom/skills/backend-quality/references │
                       │     dimensions.md (DUAL-MODE)            │
                       │   ┌────────────────────────────────┐     │
                       │   │ DIM-N                          │     │
                       │   │   Invariants                   │     │
                       │   │   Detectable Signals  (review) │     │
                       │   │   Severity Guide      (review) │     │
                       │   │   Design questions    (NEW)    │     │
                       │   │   Examples                     │     │
                       │   └────────────────────────────────┘     │
                       └──────┬─────────────────────┬─────────────┘
                              │                     │
              reads (review)  │                     │  reads (design)
                              │                     │
                       ┌──────▼─────┐         ┌─────▼──────┐
                       │ axiom:     │         │ axiom:     │
                       │ audit      │         │ design     │
                       │ critique   │         │            │
                       │ harden     │         └─────┬──────┘
                       │ distill    │               │ pairs-with: lookup
                       │ verify     │               │
                       │ scan       │         ┌─────▼─────────────┐
                       └────────────┘         │ <project>:design- │
                                              │ invariants        │
                                              │   INV-N           │
                                              │   axiom_overlap:  │
                                              │     DIM-N         │
                                              └───────────────────┘
                                                      ▲
                                                      │ emits
                       ┌──────────────────────────────┴────┐
                       │ axiom:scaffold-invariants         │
                       │   (thin facade)                   │
                       └──────────────┬────────────────────┘
                                      │ delegates
                       ┌──────────────▼────────────────────┐
                       │ axiom/skills/_vendor/skill-creator│
                       │   (vendored from anthropics/skills│
                       │    + CI tracker)                  │
                       └───────────────────────────────────┘
```

Three new things ship together:

- **A — `axiom:design`** + augmented `dimensions.md` (one foundation file, dual mode).
- **B — `axiom:scaffold-invariants`** + vendored `skill-creator` under `_vendor/`.
- **C — Pairing contract** at `skills/backend-quality/references/pairing-contract.md`.

### Naming

| Name | Decision | Rationale |
|---|---|---|
| Design-mode skill | **`axiom:design`** | Symmetric with `axiom:audit`; clearest mode signal. Rejected `axiom:invariants` (collides with project-specific INV-* terminology), `axiom:constrain` (unusual), `axiom:pillars` (terminology is the taxonomy, not the mode). |
| Meta-skill | **`axiom:scaffold-invariants`** | Verb-first; describes what it produces. `scaffold` is well-known scaffolder vocabulary. |
| Vendored skill-creator | **`axiom:_vendor:skill-creator`** | `_vendor` namespace is non-user-facing; underscore prefix prevents accidental triggering. Avoids collision if user has upstream `skill-creator` installed. |

### Component A — `axiom:design` skill

User-invokable design-mode entry point. Mirrors `axiom:audit`'s shape but inverts the mode.

**Skill file:** `axiom/skills/design/SKILL.md` (frontmatter: `user-invokable: true`, `pairs-with-pattern: <project>:*-invariants`).

**Behavior at invocation:**

1. Read augmented `dimensions.md`.
2. Enumerate loaded skills; find any with frontmatter `pairs-with: axiom:design`. The set may be empty, one, or many.
3. **If paired skill found:** for each DIM-N, render the dimension's `Design questions` block, followed by any project invariants whose `axiom_overlap: DIM-N` matches. The interleaving is dimension-driven; project invariants without matching overlap are surfaced in a final "Project-specific only" section.
4. **If no paired skill found:** render generic-only output with a one-line tail: `No paired invariants skill detected. Run /axiom:scaffold-invariants to create one.`
5. **If multiple paired skills found:** render each separately under named sub-sections; user can scope-narrow with an arg.

**Output ordering rule:** within a dimension, project-specific invariants render *after* the generic design questions. Project specificity comes second visually (it's the specialization layer) but takes precedence semantically when there's a conflict — see Component C below.

### Component A' — Augmented `dimensions.md`

Each of DIM-1..DIM-8 gains a `Design questions` block alongside existing sections. The block contains 3–5 design-time questions framed as constraints (not findings). Example for DIM-1 (Topology):

```markdown
## DIM-1: Topology

[existing: Definition, Invariants, Detectable Signals, Severity Guide, Examples]

### Design questions

- **Lifecycle ownership.** For every shared resource the design introduces, who creates it, who owns it, and where is the single source of truth?
- **Dependency injection.** Are all dependencies passed as parameters/constructor args? If any are module globals, what justifies the ambient state?
- **Fallback policy.** If a dependency isn't wired, does the system fail loud (startup error) or fall back silently? Loud is the default.
- **Graph shape.** Sketch the dependency graph for the new code. Are there cycles? If so, justify or break them.
```

The block uses imperative-question format — concrete, design-mode-shaped, asking *what choice are you making* rather than *what's wrong*. `axiom:audit` and other review skills don't read the `Design questions` block; `axiom:design` doesn't read the `Severity Guide`.

### Component B — `axiom:scaffold-invariants` skill

User-invokable meta-skill. Specializes the scaffolding pattern from upstream `skill-creator`, with axiom-specific interview script and template.

**Skill file:** `axiom/skills/scaffold-invariants/SKILL.md` (frontmatter: `user-invokable: true`).

**Behavior:**

1. **Interview** (QAW-style scenario elicitation). Prompts:
   - "What's the project's one-line characterization?" (mirrors Exarchos's "single-machine event-sourced process manager with cooperative agents")
   - "What architectural decisions have you committed to that feel non-obvious from the code?" → INV-* candidates
   - For each: "Which axiom dimension(s) does this specialize?" → seeds `axiom_overlap`
   - For each: "What's the failure mode if violated?" → seeds severity guide
   - For each: "Is there a mechanical check (grep, lint, type)?" → seeds deterministic-checks
2. **Template selection** — load template files from `axiom/skills/scaffold-invariants/templates/` (modeled exactly on `exarchos:design-invariants`'s structure).
3. **Emit** — write `SKILL.md` + `references/INV-N-<slug>.md` per invariant + `references/deterministic-checks.md` to a path the user specifies (default: `.claude/skills/<project>-design-invariants/`).
4. **Pairing wiring** — generated `SKILL.md` declares `pairs-with: axiom:design` and references the contract doc.
5. **Defer to vendored skill-creator** — invoke `axiom:_vendor:skill-creator` (or its prompt patterns) for description tuning if available; otherwise emit a minimal but well-formed description.

### Component B' — Vendored `skill-creator`

**Path:** `axiom/skills/_vendor/skill-creator/`

**Vendoring policy:**

- Source of truth: `https://github.com/anthropics/skills/tree/main/skills/skill-creator`
- License check (prerequisite to merging this design): confirm MIT or compatible permissive license. Preserve original LICENSE file alongside the vendored copy. Add `axiom/skills/_vendor/skill-creator/UPSTREAM.md` documenting source URL, commit SHA, sync date.
- **Frontmatter rewrite on import:** rename `name: skill-creator` → `name: _vendor:skill-creator`. The `_vendor:` prefix and underscore make it non-user-facing — Claude won't surface it in trigger lists.
- **CI sync workflow:** `.github/workflows/vendor-sync.yml` runs weekly. Fetches latest `skill-creator` content from upstream, computes diff against vendored copy, opens a PR if drift detected. Human-reviewed merge — never auto-merged.
- **Update procedure (PR template):** the auto-PR includes (a) upstream commit range, (b) full diff, (c) updated UPSTREAM.md fields, (d) checklist for manual review (does the rename still apply? did upstream change anything that breaks our specialization?).

`axiom:scaffold-invariants` references `_vendor:skill-creator` by path, not by trigger. It reads the vendored SKILL.md content as a *reference*, not as an active skill invocation.

### Component C — Pairing contract

**Path:** `axiom/skills/backend-quality/references/pairing-contract.md`

The contract codifies what `pairs-with` means and what compliant project skills look like.

**Slot definitions:**

| Slot | Where | Type | Required | Meaning |
|---|---|---|---|---|
| `pairs-with` | project skill frontmatter | string | yes | Names the axiom skill this pairs with (currently `axiom:design`) |
| `pairs-with-pattern` | axiom skill frontmatter | glob | optional | Pattern axiom skill recognizes (e.g., `<project>:*-invariants`) |
| `axiom_overlap` | per-finding/per-invariant in project skill body | `DIM-N` | optional | Names the axiom dimension this invariant specializes |

**Ordering rule:** when project-specific and generic guidance conflict, *project-specific takes precedence semantically*. Example: if DIM-1 says "module-global mutable state requires documented rationale" but a project's INV declares "module-global state is forbidden in this codebase", the project rule wins. Mirrors ESLint `extends` array-order override.

**Cross-reference convention:** project invariants point *up* via `axiom_overlap`. Axiom dimensions don't point *down* — generic doesn't know about specific. Mirrors ATAM utility tree (leaves → branches, never reverse).

**Compliance example:** the contract doc includes `exarchos:design-invariants` as a worked example showing well-formed slots and overlap declarations.

## Requirements

**DR-1.** `axiom:design` skill exists and is user-invokable.
**Acceptance criteria:**
- File `axiom/skills/design/SKILL.md` exists.
- Frontmatter: `user-invokable: true`, `category: design`, `pairs-with-pattern: <project>:*-invariants`, description includes triggers `design`, `constrain`, `apply dimensions during ideation`, `/axiom:design`.
- Skill body references `@skills/backend-quality/references/dimensions.md`.

**DR-2.** `dimensions.md` augmented with `Design questions` blocks for all 8 dimensions.
**Acceptance criteria:**
- Each of DIM-1 through DIM-8 has a `### Design questions` subsection containing 3–5 imperative-question-format prompts.
- All existing review-mode sections (Definition, Invariants, Detectable Signals, Severity Guide, Examples) are preserved unchanged.
- Format is uniform across all 8 dimensions (verified by lint check counting `### Design questions` occurrences).

**DR-3.** Frontmatter pairing slots are defined and discoverable.
**Acceptance criteria:**
- `axiom/skills/backend-quality/references/pairing-contract.md` exists and defines all three slots from Component C with type and example.
- `exarchos:design-invariants`'s existing `pairs-with: axiom:backend-quality` is updated to `pairs-with: axiom:design` as part of rollout migration (separate PR, coordinated).

**DR-4.** `axiom:design` interleaves generic + project-specific output when paired skill is loaded.
**Acceptance criteria:**
- Given a loaded skill with `pairs-with: axiom:design` and at least one invariant declaring `axiom_overlap: DIM-1`, `axiom:design` output for DIM-1 contains both generic design questions and the project-specific invariant.
- Project invariants render *after* generic questions within each dimension.
- Project invariants without `axiom_overlap` declarations render in a final "Project-specific only" section.

**DR-5.** `axiom:scaffold-invariants` skill exists and is user-invokable.
**Acceptance criteria:**
- File `axiom/skills/scaffold-invariants/SKILL.md` exists with `user-invokable: true`.
- Triggers include `scaffold invariants`, `create invariants skill`, `bootstrap design skill`, `/axiom:scaffold-invariants`.
- Body documents the interview script and emit behavior per Component B above.

**DR-6.** Vendored `skill-creator` is in place with CI sync.
**Acceptance criteria:**
- `axiom/skills/_vendor/skill-creator/` contains a copy of upstream `anthropics/skills/skills/skill-creator/`.
- LICENSE file from upstream is preserved alongside.
- `UPSTREAM.md` records source URL, commit SHA at import, and sync date.
- `name:` field in vendored frontmatter is rewritten to `_vendor:skill-creator`.
- `.github/workflows/vendor-sync.yml` runs weekly and opens a PR on drift.

**DR-7.** `axiom:scaffold-invariants` emits a well-formed skill.
**Acceptance criteria:**
- Generated skill has `pairs-with: axiom:design` in frontmatter.
- Each generated invariant has an `axiom_overlap: DIM-N` declaration if the user named one in the interview.
- Generated structure: `SKILL.md` + `references/INV-N-<slug>.md` per invariant + `references/deterministic-checks.md`.
- Generated `SKILL.md` references the pairing contract by path.

**DR-8.** Pairing contract is documented at the canonical location.
**Acceptance criteria:**
- `axiom/skills/backend-quality/references/pairing-contract.md` exists.
- Contains all three slot definitions, the ordering rule, the cross-reference convention, and a worked example using `exarchos:design-invariants`.
- Both `axiom:design`'s and `axiom:scaffold-invariants`'s SKILL.md reference it.

**DR-9.** Failure modes degrade gracefully (error handling / edge cases).
**Acceptance criteria:**
- `axiom:design` invoked with no paired skill loaded: outputs generic-only, ends with one-line note `No paired invariants skill detected. Run /axiom:scaffold-invariants to create one.` Does not error.
- `axiom:scaffold-invariants` invoked when vendored `skill-creator` is missing or out of sync (UPSTREAM.md older than 30 days): emits scaffold using the bundled templates only (no description tuning), with a one-line warning. Does not error.
- `axiom:design` invoked with multiple paired skills loaded: renders each under a named sub-section.
- `axiom:design` invoked with a paired skill that declares `pairs-with: axiom:design` but has no invariants: renders generic-only with a one-line note `Paired skill <name> declares pairing but has no invariants.` Does not error.
- Pairing-contract violations (a skill declares `pairs-with: axiom:design` but uses no `axiom_overlap` fields): surface as advisory LOW findings via DR-10, never block.

**DR-10.** `axiom:audit` emits advisory pairing-contract findings.
**Acceptance criteria:**
- When `axiom:audit` runs against a project containing a skill with `pairs-with: axiom:design`, audit emits a check: paired skill declares `axiom_overlap` for at least one dimension.
- Violations emit findings at LOW severity with dimension `pairing-contract` (a new pseudo-dimension or `meta`).
- Findings never escalate the audit verdict beyond `NEEDS_ATTENTION`; never produce HIGH/MEDIUM unless other findings independently warrant them.

## Integration Points

Sequenced to avoid breaking existing flows:

1. **Land Component C (pairing contract)** as documentation only. No skills behavior change. Safe.
2. **Land Component A (axiom:design + augmented dimensions.md).** New skill, no removal. `axiom:audit` continues to read `dimensions.md` review-mode sections only — verify with the existing test suite.
3. **Coordinate with Exarchos** to update `exarchos:design-invariants` `pairs-with` from `axiom:backend-quality` → `axiom:design`. This is a single-line frontmatter change; can be a one-PR coordination.
4. **Land Component B (axiom:scaffold-invariants + vendored skill-creator).** Independent of A and C; ships when ready.
5. **Land DR-10 audit extension** last — depends on A and C being live to be useful.

## Testing Strategy

Testing is dominated by acceptance criteria embedded in DR-1..DR-10 (see Requirements). Beyond per-requirement checks, the strategy has three layers:

- **Structural lint** — a CI check counts `### Design questions` occurrences in `dimensions.md` (must equal 8 for DR-2). Same check verifies `axiom/skills/_vendor/skill-creator/UPSTREAM.md` exists and is parseable for DR-6.
- **Behavioral fixtures** — given a fixture project containing a synthetic skill with `pairs-with: axiom:design` and known `axiom_overlap` declarations, `axiom:design` invocation must produce expected interleaved output (DR-4). Variants: zero / one / many paired skills, paired skill with no invariants (DR-9 edge cases).
- **Regression-test against `exarchos:design-invariants`** — `axiom:scaffold-invariants` should be able to reproduce that skill from a domain-expert interview without loss of fidelity. This is the pass/fail bar for DR-7. The existing skill is the regression suite for the meta-skill.

Eval-prompt suite for trigger accuracy is a follow-up (see Follow-ups), not a launch blocker — it requires both skills to exist before it can be authored.

## Open Questions

- **Pairing-contract finding dimension.** DR-10 emits findings under a `pairing-contract` pseudo-dimension. Should this be a 9th formal dimension (DIM-9), or remain a meta category? Argument for formalizing: the dimension model already has DIM-8 (Prose) which is itself meta-flavored. Argument against: violates the "DIM-1..DIM-8 stays stable" non-goal. Defer until usage data warrants.
- **Multiple paired skills in a single project.** The design supports it (DR-9) but the use case isn't validated. Should the contract specify ordering when multiple paired skills overlap on the same DIM-N? Defer until a real second-skill case appears.
- **Vendoring license confirmation.** Prerequisite to DR-6 — must verify `anthropics/skills` license terms before merging the import. If non-permissive, fall back to "thin facade with no vendoring" (revisit B-component scope).
- **Cross-platform skill enumeration.** Frontmatter-slot lookup assumes the host platform exposes loaded-skill metadata. Confirmed for Claude Code; unclear for Codex / OpenCode. The fallback (manual invocation) works regardless, but the auto-pairing UX may differ.

## Risks

| Risk | Mitigation |
|---|---|
| `dimensions.md` becomes too dense (8 × 2 modes) | Use clear `###` subsection headers. Both modes' content is short (3–5 questions / 5–8 signals). Total file growth ~30%. |
| Frontmatter-slot lookup depends on host-platform skill enumeration semantics | Document the requirement: skills must be loaded into the same context for lookup. Test with Claude Code, Codex, OpenCode if available. |
| Vendored skill-creator drifts despite CI | Auto-PR + human review prevents silent drift. Document policy: if upstream makes a breaking change, freeze and reassess. |
| Two concurrent paired skills in one project (rare) | Render each under named sub-section (DR-4). Document as an explicit feature. |
| Project skill declares `pairs-with: axiom:design` but pre-dates the contract | Backward-compatible — generic-only fallback is the same as no-pairing case. |
| `axiom:scaffold-invariants` produces low-quality skills (interview misses subtleties) | Iterate on the interview script. Use Exarchos's existing `design-invariants` as the regression test — the meta-skill should reproduce it from a domain expert's interview without loss. |

## Follow-ups

- **Eval suite for pairing.** Once both A and B ship, write trigger-accuracy evals (does `/axiom:design` invoke when expected? does it correctly find the paired skill?). Defer until skills exist to test.
- **Project skill examples.** Beyond Exarchos, identify 1–2 other internal projects that would benefit from a paired invariants skill. Use them to stress-test the scaffolder.
- **Bidirectional contract validation.** Consider a future enhancement where axiom dimensions optionally declare known consumer projects. Not in scope for this design.
- **Strictness escalation.** If pairing-contract violations become endemic, consider escalating from LOW advisory to MEDIUM. Not in scope until data warrants.

## References

- Source research: [`docs/research/2026-05-09-axiom-invariants-composition.md`](../research/2026-05-09-axiom-invariants-composition.md)
- Existing project archetype: `exarchos/.claude/skills/design-invariants/SKILL.md`
- Foundation: `axiom/skills/backend-quality/SKILL.md` and `references/dimensions.md`
- Upstream skill-creator: `https://github.com/anthropics/skills/tree/main/skills/skill-creator`
- Pattern precedent: Azure Well-Architected Framework `Workload design checklist` + `Configuration recommendations` dual-section structure.
- Composition precedent: ESLint flat-config `extends` array-order override.
- Authoring precedent: Anthropic `skill-creator` four-mode lifecycle (Create / Eval / Improve / Benchmark).
