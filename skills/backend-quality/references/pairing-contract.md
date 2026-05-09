# Pairing Contract

The protocol that lets `axiom:design` (the generic design-mode skill) compose with project-specific invariants skills (e.g., `exarchos:design-invariants`).

This contract is the seam between the cross-domain dimension taxonomy and any one project's architectural specifics. It is documentation-and-frontmatter-only — there's no runtime registry. Skills self-describe via their frontmatter, and `axiom:design` discovers paired skills by enumerating loaded skills' frontmatter slots.

## Frontmatter slots

| Slot | Where (canonical position) | Type | Required | Meaning |
|------|---------------------------|------|----------|---------|
| `pairs-with` | project skill frontmatter, **nested under `metadata:`** | string | yes | Names the axiom skill this pairs with. Currently the only valid value is `axiom:design`. Future axiom skills may add their own pairing namespaces. Example: `metadata.pairs-with: axiom:design`. |
| `pairs-with-pattern` | axiom skill frontmatter, **nested under `metadata:`** | glob | optional | Pattern axiom recognizes for paired project skills. Example: `metadata.pairs-with-pattern: <project>:*-invariants`. Documentation hint, not enforced. |
| `axiom_overlap` | per-invariant in project skill body or per-finding in output | `DIM-N` (one of `DIM-1`..`DIM-8`) | optional | Names the axiom dimension this invariant specializes. Multiple overlaps are permitted (an INV may specialize both DIM-1 Topology and DIM-2 Observability). Omit when an invariant has no generic counterpart. |

**Canonical position note.** All `pairs-with` and `pairs-with-pattern` slots live nested under `metadata:` in the frontmatter, matching the existing `exarchos:design-invariants` archetype. Top-level placement (`pairs-with:` directly under `---`) is **not** the canonical form and discovery implementations may not honor it.

## Ordering rule

When project-specific guidance and generic guidance conflict, **project-specific takes precedence semantically**.

Example: DIM-1 Topology says "module-global mutable state requires documented rationale". A project's INV declares "module-global state is forbidden in this codebase". The project rule wins; the design surfaces the prohibition, not the conditional permission.

This mirrors ESLint's `extends` array-order override (later entries win) and ATAM's utility-tree convention (leaves are authoritative for their scenarios).

Visually, however, generic content renders first within each dimension. Generic is the broader frame; specific is the specialization. The visual order is generic → specific; the semantic order is the reverse.

## Cross-reference convention

Project invariants point *up* to axiom dimensions via `axiom_overlap: DIM-N`.

Axiom dimensions do **not** point *down* to project invariants. The generic layer doesn't know which projects pair with it — that knowledge would be unbounded and brittle.

This mirrors ATAM's utility tree: leaves reference the branch they specialize; branches don't enumerate their leaves.

## Worked example

`exarchos:design-invariants` is the canonical compliant project skill. Its frontmatter declares the pairing under `metadata`:

```yaml
---
name: design-invariants
description: "Audit a design proposal or diff against Exarchos's architectural invariants ..."
metadata:
  author: exarchos
  version: 0.1.0
  category: review
  pairs-with: axiom:design
---
```

> **Migration note (2026-05-09).** As of this contract's authoring, `exarchos:design-invariants` declares `metadata.pairs-with: axiom:backend-quality` (the foundation reference, pre-rename). The migration to `metadata.pairs-with: axiom:design` is tracked as a coordination PR against the exarchos repo (see this design's Definition of Done) and is **out of scope for axiom alone**. Until that PR lands, `axiom:design` discovery falls back to generic-only output for exarchos.

Its complementarity matrix declares per-invariant overlap with axiom dimensions:

| Finding | Axiom dimension | Design invariant |
|---------|-----------------|------------------|
| Lazy fallback that creates degraded EventStore | DIM-1 Topology | INV-1 (silent loss of event integrity) |
| `console.log`-only catch in projection apply | DIM-2 Observability | INV-1 |
| Adapter-local mutable cache for projection state | DIM-1 Topology | INV-1 + INV-2 |
| Schema field removed but still read | DIM-3 Contracts | INV-1 if it's an event field |

When `axiom:design` runs in a session with `exarchos:design-invariants` loaded, the discovered pairing causes the design conversation to interleave per-dimension generic questions with project-specific INV-N constraints — with project specifics taking precedence on conflict.

## Compliance

A project-specific invariants skill is **compliant** if:

1. Its frontmatter declares `metadata.pairs-with: axiom:design` (nested under `metadata:`, per the canonical position above — top-level `pairs-with:` does not satisfy this rule).
2. At least one of its invariants declares an `axiom_overlap: DIM-N` field referencing a real axiom dimension (DIM-1..DIM-8).
3. Its structure follows the archetype: `SKILL.md` + `references/INV-N-<slug>.md` per invariant + `references/deterministic-checks.md` (per `axiom:scaffold-invariants` emit shape).

`axiom:audit` may emit advisory LOW-severity findings against compliance violations. These never block the audit verdict — the contract is meant to detect drift, not enforce it.

## See also

- `axiom:design` skill: `@skills/design/SKILL.md`
- `axiom:scaffold-invariants` skill: `@skills/scaffold-invariants/SKILL.md`
- Exarchos's compliant archetype: `exarchos/.claude/skills/design-invariants/SKILL.md`
