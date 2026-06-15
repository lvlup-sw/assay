# Upstream Provenance: skill-creator

This directory is a **verbatim full-directory vendor** of `anthropics/skills/skills/skill-creator/`. It lives outside `skills/` so the axiom plugin's skill loader does not enumerate it as a triggerable skill — it is a reference artifact only.

## Source

| Field | Value |
|-------|-------|
| **source_url** | https://github.com/anthropics/skills/tree/main/skills/skill-creator |
| **commit_sha** | `57546260929473d4e0d1c1bb75297be2fdfa1949` |
| **sync_date** | 2026-06-15 |
| **upstream_license** | Apache License 2.0 (see LICENSE) |

## What's vendored

Full directory contents from upstream, unmodified:

- `SKILL.md` — main skill definition
- `LICENSE` — Apache 2.0 (renamed from upstream `LICENSE.txt` for filesystem consistency; content unchanged)
- `agents/` — specialized subagent instructions (grader, comparator, analyzer)
- `assets/` — bundled assets (e.g., `eval_review.html` template)
- `eval-viewer/` — evaluation review tooling (`generate_review.py`, `viewer.html`)
- `references/` — additional documentation (`schemas.md`)
- `scripts/` — Python tooling for eval/benchmark/package workflows

Vendoring the full directory (rather than selective files) preserves all of skill-creator's internal references — the `SKILL.md` body cites `agents/grader.md`, `references/schemas.md`, `eval-viewer/generate_review.py`, and similar paths, all of which now resolve correctly inside this directory.

## Modifications

**None.** Content is preserved verbatim from upstream. The only deltas from upstream are:

1. `LICENSE.txt` renamed to `LICENSE` (filesystem convention; content identical).
2. This `UPSTREAM.md` file added (provenance record).

No frontmatter rewrite. The vendored `SKILL.md` retains `name: skill-creator` from upstream. Trigger collision is avoided by **path placement**: this directory is at `vendor/skill-creator/`, not `skills/skill-creator/`, so axiom's plugin loader never enumerates it.

## Apache 2.0 attribution

Per the Apache License 2.0 §4 obligations:

- **§4(a) LICENSE:** included in this directory.
- **§4(b) state changes:** the only changes are the LICENSE rename and addition of this UPSTREAM.md (no derivative work created).
- **§4(c) preserve copyright notices:** all upstream notices retained verbatim.
- **§4(d) NOTICE file:** upstream `skills/skill-creator/` has no NOTICE file; the repo-root `THIRD_PARTY_NOTICES.md` covers media-processing dependencies (imageio, FFmpeg) used by other skills (`docx`, `pdf`, `pptx`, `xlsx`), not skill-creator. No propagation required.

## Sync policy

`.github/workflows/vendor-sync.yml` runs weekly (Mondays 10:00 UTC). It performs a full-directory replacement: clones upstream, replaces `vendor/skill-creator/` content with upstream content, opens a PR if drift is detected. The PR is **never auto-merged** — human review verifies:

- Upstream changes don't break axiom's borrowed patterns in `axiom:scaffold-invariants`.
- LICENSE changes (if any) remain compatible.
- New top-level files in upstream are accounted for.

Update `commit_sha` and `sync_date` in this file when sync occurs (the workflow does this automatically using a deterministic Python script, not sed).

## Removal

If `axiom:scaffold-invariants` no longer borrows from skill-creator's patterns, this entire directory can be removed without affecting axiom's other skills. The pairing contract (`skills/backend-quality/references/pairing-contract.md`) does not depend on it.
