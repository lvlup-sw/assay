---
name: scaffold-invariants
description: "Bootstrap a project-specific invariants skill that pairs with axiom:design. Interviews the user about the project's domain (one-line characterization, non-obvious commitments, dimension overlap, failure modes, mechanical checks) and emits a SKILL.md plus references files modeled on the design-invariants archetype. Use when starting a new project or formalizing existing architectural invariants. Triggers: 'scaffold invariants skill', 'bootstrap design skill', 'create invariants for this project', or /axiom:scaffold-invariants. Do NOT use to apply invariants — use axiom:design after scaffolding."
user-invokable: true
metadata:
  author: lvlup-sw
  version: 0.1.0
  category: meta-authoring
  dimensions:
    - all
---

# Scaffold Invariants — Project-Specific Skill Bootstrap

Specialized skill scaffolder. Produces a project-specific invariants skill (`<project>:design-invariants` by convention) that pairs with `axiom:design` via the pairing contract.

## Triggers

**Use when:**
- Starting a new project that needs its own architectural invariants formalized
- Migrating from a verbal "we always do X" rule to a documented, testable invariant
- Establishing the project-specific half of an `axiom:design` pairing for the first time

**Do NOT use when:**
- Updating an existing invariants skill — edit it directly.
- Authoring a generic skill — use Anthropic's `skill-creator` (or its vendored copy if installed) for unconstrained skill creation.

## Interview

Five categories of questions, asked one at a time. The output of each shapes the generated skill.

### 1. One-line characterization

> "If you had to describe this project's runtime in one sentence, what would it be?"

The answer becomes the skill's framing line. Example from Exarchos: *"a single-machine event-sourced process manager with cooperative agents."* This sentence governs every downstream invariant — if a candidate INV doesn't follow from this characterization, it doesn't belong.

### 2. Non-obvious commitments

> "What architectural decisions has this project committed to that aren't obvious from reading the code?"

Each answer is an INV-N candidate. Examples: *"the event store is the source of truth, never state files"*, *"all phase transitions go through one HSM module"*, *"no MCP-second-class assumptions in any design"*. Aim for 3–7 invariants — fewer feels under-codified, more becomes hard to remember.

### 3. Dimension overlap

For each candidate INV, ask:

> "Which of axiom's dimensions (DIM-1 Topology / DIM-2 Observability / DIM-3 Contracts / DIM-4 Test Fidelity / DIM-5 Hygiene / DIM-6 Architecture / DIM-7 Resilience / DIM-8 Prose) does this specialize?"

The answer seeds the `axiom_overlap: DIM-N` field. An INV may overlap zero, one, or multiple dimensions. Zero means it's project-specific without a generic counterpart — valid but rarer.

### 4. Failure mode

For each candidate INV, ask:

> "What's the failure mode if this is violated? What does the system look like when this rule breaks?"

The answer seeds the severity guide. Map: *catastrophic / data-loss / silent corruption* → HIGH; *misleading / hard to debug* → MEDIUM; *cosmetic / mild* → LOW.

### 5. Mechanical checks

For each candidate INV, ask:

> "Is there a mechanical way to detect a violation — a grep pattern, lint rule, type check, or static analysis?"

The answer seeds `references/deterministic-checks.md`. If no mechanical check exists, that's fine — record "reasoning-driven; no automated check" so the human reviewer knows.

## Emit

After the interview completes, emit the project-specific skill structure. Default output path: `.claude/skills/<project>-design-invariants/`.

Files emitted:

- **`SKILL.md`** — frontmatter + body. Frontmatter includes `pairs-with: axiom:design`. Body lists the invariants with their severities, axiom-overlap declarations, and links to per-INV reference files.
- **`references/INV-N-<slug>.md`** per invariant — one file per INV. Each file contains: framing, acceptance questions, repo-grounded checks, severity guide, worked example (violation + fix). Modeled on `exarchos/.claude/skills/design-invariants/references/INV-1-event-sourcing.md`.
- **`references/deterministic-checks.md`** — the grep / structural / lint patterns, organized by INV-N. Modeled on `exarchos/.claude/skills/design-invariants/references/deterministic-checks.md`.

Templates live at `templates/` in this skill's directory:
- `templates/SKILL.template.md`
- `templates/INV.template.md`
- `templates/deterministic-checks.template.md`

Each template uses `{{TOKEN}}` placeholders that are filled from interview answers.

### Emit-correctness properties

The generated skill must be well-formed:

- Generated `SKILL.md` declares `pairs-with: axiom:design` in frontmatter (so `axiom:design` discovers it).
- Each invariant entry declares `axiom_overlap: DIM-N` if the user named one in the interview (Q3); omits the field otherwise.
- Generated structure mirrors `exarchos:design-invariants` exactly: `SKILL.md` + `references/INV-N-<slug>.md` per invariant + `references/deterministic-checks.md`.

## Failure Modes

- **Vendored skill-creator missing or stale** (`vendor/skill-creator/UPSTREAM.md` older than 30 days, or `vendor/skill-creator/` directory absent) → fall back to bundled templates only (no description tuning, no eval-prompt suggestions). Emit a one-line warning: `Vendored skill-creator not available; emitted scaffold uses bundled templates only. Sync vendor and re-run for description tuning.`
- **Output directory already exists with content** → prompt before overwriting; default action is abort.
- **Interview yields zero invariants** → emit a SKILL.md with empty INV section and a one-line note: `No invariants surfaced from interview. Re-run when project commitments are clearer.`

## References

- Pairing contract: `@skills/backend-quality/references/pairing-contract.md`
- Project archetype: `exarchos/.claude/skills/design-invariants/SKILL.md`
- Vendored upstream tooling: `vendor/skill-creator/SKILL.md` (full directory copy from `anthropics/skills`; reference only, not loaded as a triggerable skill)
