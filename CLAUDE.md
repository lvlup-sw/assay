# Axiom

Backend code quality skills. The other half of impeccable — same composable pattern, pointed at architecture instead of UI.

## Skills

| Skill | Purpose | Dimensions |
|-------|---------|-----------|
| `axiom:audit` | Comprehensive backend audit (orchestrator) | All |
| `axiom:critique` | Architecture review: SOLID, coupling, dependencies | Architecture, Topology |
| `axiom:harden` | Error handling, resilience, observability | Observability, Resilience |
| `axiom:distill` | Dead code, vestigial patterns, simplification | Hygiene, Topology |
| `axiom:verify` | Test quality, mock fidelity, contract drift | Test Fidelity, Contracts |
| `axiom:scan` | Deterministic pattern detection (grep/structural) | Pluggable (any) |

## Quality Dimensions

Seven canonical dimensions (DIM-1 through DIM-7) defined in `skills/backend-quality/references/dimensions.md`.

## Usage

Run individual skills for targeted assessment, or `axiom:audit` for comprehensive analysis. All skills accept a `scope` argument (file, directory, or codebase).

## Integration

This plugin is standalone — no workflow dependencies. Workflow tools can consume findings via the standard finding format documented in `skills/backend-quality/references/findings-format.md`.
