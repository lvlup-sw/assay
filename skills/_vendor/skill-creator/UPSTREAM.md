# Upstream Provenance: skill-creator

This directory contains a vendored copy of `skill-creator` from `anthropics/skills`. It is **not** an active user-facing skill in this repo — it is a reference artifact that `axiom:scaffold-invariants` borrows patterns from (interview structure, progressive disclosure, description tuning).

## Source

| Field | Value |
|-------|-------|
| **source_url** | https://github.com/anthropics/skills/tree/main/skills/skill-creator |
| **commit_sha** | `f458cee31a7577a47ba0c9a101976fa599385174` |
| **sync_date** | 2026-05-09 |
| **upstream_license** | Apache License 2.0 (see LICENSE) |

## Vendored content

| File | Source | Local change |
|------|--------|--------------|
| `SKILL.md` | upstream `skills/skill-creator/SKILL.md` | Frontmatter `name: skill-creator` rewritten to `name: _vendor:skill-creator` |
| `LICENSE` | upstream `skills/skill-creator/LICENSE.txt` | None (preserved verbatim) |
| `UPSTREAM.md` | (this file) | Local provenance record |

Subdirectories from upstream (`agents/`, `assets/`, `eval-viewer/`, `references/`, `scripts/`) are **intentionally not vendored**. Axiom borrows skill-creator's authoring patterns conceptually; we don't execute its tooling, so the operational subdirs are out of scope. If a future axiom skill needs the eval harness or scripts, they can be added here under the same vendoring policy.

## Rename rationale

Upstream's `name: skill-creator` would collide with the same skill if a user has the upstream installed alongside axiom. Renaming to `_vendor:skill-creator` (a) namespaces the vendored copy to axiom's `_vendor:` prefix, (b) makes it non-user-facing per Claude's underscore-prefix convention, and (c) preserves the upstream content for reference without competing for triggers.

## Sync policy

The CI workflow at `.github/workflows/vendor-sync.yml` checks upstream weekly (Mondays 10:00 UTC), computes a diff against the vendored copy, and opens a PR if drift is detected. The PR is **never auto-merged** — a human reviews changes for:

- Whether the rename still applies (upstream may have changed frontmatter shape).
- Whether upstream changed in ways that affect axiom's borrowed patterns.
- Whether new subdirectories from upstream warrant vendoring.

When sync occurs, update `commit_sha` and `sync_date` above.

## Apache 2.0 attribution

Per the Apache License 2.0 terms, this directory:

- Includes the LICENSE in full (file: `LICENSE`).
- States the change made: frontmatter rename `skill-creator` → `_vendor:skill-creator` (this file).
- Preserves all copyright notices in the vendored content.
- No NOTICE file is required — upstream `skills/skill-creator/` does not include one as of the synced commit.

## Removal

If `axiom:scaffold-invariants` is reworked to no longer rely on skill-creator's patterns, this entire directory may be removed without affecting axiom's other skills. The pairing contract (`backend-quality/references/pairing-contract.md`) does not depend on this vendored content.
