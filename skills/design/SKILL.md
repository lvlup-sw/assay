---
name: design
description: "Apply backend quality dimensions as design constraints during ideation. The design-mode counterpart to axiom:audit — surfaces DIM-1..DIM-8 as questions to ask while shaping a system, not as findings to report after. Pairs with project-specific invariants skills via the pairs-with frontmatter slot. Use when running /exarchos:ideate or any pre-implementation conversation. Triggers: 'apply axiom dimensions to design', 'constrain design space', 'design with quality in mind', or /axiom:design. Do NOT use for review of existing code — use axiom:audit instead."
user-invokable: true
metadata:
  author: lvlup-sw
  version: 0.1.0
  category: design
  pairs-with-pattern: <project>:*-invariants
  dimensions:
    - all
---

# Design — Backend Quality as Design Constraint

The design-mode entry point to axiom's dimension taxonomy. Where `axiom:audit` evaluates code that exists, `axiom:design` constrains code that's being shaped.

## Triggers

**Use when:**
- Running `/exarchos:ideate` or any pre-implementation conversation
- Sketching a new module, service, or subsystem
- Reviewing a design proposal before commitment
- Pairing with a project-specific invariants skill (e.g., `exarchos:design-invariants`)

**Do NOT use when:**
- Auditing existing code — use `axiom:audit` for that.
- Targeting one specific dimension — use the specialized review skill (`axiom:critique`, `axiom:harden`, etc.).

## Process

1. **Read** the augmented dimension taxonomy: `@skills/backend-quality/references/dimensions.md`. Each dimension has a `### Design questions` block written for design-mode use.
2. **Discover** any paired project-specific invariants skill loaded in this context (see Pairing Discovery below).
3. **Render** the design conversation by walking the eight dimensions in order, surfacing the design questions and — if a paired skill is loaded — interleaving its project-specific invariants where they overlap.

## Pairing Discovery

`axiom:design` looks for any loaded skill whose frontmatter declares `pairs-with: axiom:design`. The lookup is by frontmatter slot, not by filename or convention path. The pairing contract is documented at: `@skills/backend-quality/references/pairing-contract.md`.

Three operating modes:

- **No paired skill loaded.** Run generic-only: present DIM-1..DIM-8 design questions. End with the line `No paired invariants skill detected. Run /axiom:scaffold-invariants to create one.` so the user knows the bootstrap path.
- **One paired skill loaded.** Interleave. For each dimension, render the generic design questions first, then any project-specific invariants whose `axiom_overlap: DIM-N` matches the current dimension. Project invariants without `axiom_overlap` declarations render in a final "Project-specific only" section.
- **Multiple paired skills loaded.** Render each under a named subsection (one per skill). The user can scope-narrow with an arg if needed.

## Output Composition

The dimension is the organizing axis. Within a dimension:

1. Generic axiom design questions render first.
2. Project-specific invariants (matched by `axiom_overlap`) render after.

This ordering is *visual* — generic comes first because it's the broader frame. *Semantically* the precedence is reversed: when project-specific guidance and generic guidance conflict, the project-specific rule wins. This mirrors ESLint's array-order override (later `extends` entry wins) and ATAM's utility-tree convention (leaves are authoritative for their scenarios).

The full ordering rule is documented in the pairing contract.

## Failure Modes

- **No paired skill loaded** → generic-only output, ends with: `No paired invariants skill detected. Run /axiom:scaffold-invariants to create one.`
- **Multiple paired skills loaded** → render each under a named subsection.
- **Paired skill declares `pairs-with: axiom:design` but has no invariants** → generic-only with: `Paired skill <name> declares pairing but has no invariants.`

## References

- Dimension taxonomy (dual-mode): `@skills/backend-quality/references/dimensions.md`
- Pairing contract: `@skills/backend-quality/references/pairing-contract.md`
- Foundation reference: `@skills/backend-quality/SKILL.md`
- Project-specific archetype: `exarchos/.claude/skills/design-invariants/SKILL.md`
