# Quality Dimension Rationale

Why axiom uses seven independent, conjunctive quality dimensions rather than a single score or weighted aggregate.

## Background

Axiom's quality assessment framework draws on a formal principle from constrained optimization: multi-objective convergence with independent evaluation. This document explains the reasoning behind the design.

## The Problem with Weighted Scores

A common approach to code quality is a single weighted score:

```
quality = w1*topology + w2*observability + w3*contracts + ...
threshold = 0.7
pass = quality >= threshold
```

This seems intuitive but has a critical failure mode: **dimension compensation**. Excellent test fidelity (DIM-4) can mathematically compensate for terrible error handling (DIM-7). A codebase with perfect tests but silent catch blocks everywhere might score 0.75 and pass, despite having operational risks that tests cannot catch.

In practice, this is how real quality problems ship. Teams point to high test coverage as evidence of quality while ignoring architectural decay, contract drift, or resilience gaps.

## Conjunctive Convergence

Axiom uses a different model: every dimension must independently pass. Formally:

```
pass = DIM-1.pass AND DIM-2.pass AND ... AND DIM-7.pass
```

There is no weighted sum. No dimension can compensate for another. This is **conjunctive convergence** -- all conditions must be satisfied independently.

### Why Seven Dimensions

Each dimension captures a distinct quality concern that cannot be derived from the others:

| Dimension | What It Catches | Why It's Independent |
|-----------|----------------|---------------------|
| DIM-1: Topology | Wiring correctness, state ownership | You can have perfect tests for incorrectly wired code |
| DIM-2: Observability | Error visibility, failure signaling | Code can be architecturally clean but operationally blind |
| DIM-3: Contracts | Schema integrity, type boundary safety | Types can be correct internally but drift at boundaries |
| DIM-4: Test Fidelity | Tests exercising actual production behavior | Tests can pass while testing phantom wiring |
| DIM-5: Hygiene | Dead code, vestigial patterns | Working code can accumulate evolutionary debris |
| DIM-6: Architecture | SOLID compliance, coupling, cohesion | Code can work and be tested but structurally unmaintainable |
| DIM-7: Resilience | Operational robustness under stress | Code can be clean, tested, and well-architected but fragile at runtime |

The independence requirement means: finding zero issues in architecture (DIM-6) tells you nothing about whether error handling (DIM-2) or test fidelity (DIM-4) are adequate. Each dimension must be evaluated on its own terms.

### Why Not Fewer Dimensions

Collapsing dimensions loses signal. If you merge "Topology" and "Architecture" into a single "Structure" dimension, you lose the ability to distinguish between a codebase with clean dependency direction but broken wiring (DIM-1 fails, DIM-6 passes) versus clean wiring but god objects everywhere (DIM-1 passes, DIM-6 fails). These require different remediation strategies.

### Why Not More Dimensions

Each dimension added to a conjunctive system raises the bar. With too many dimensions, every codebase fails on at least one, making the verdict meaningless. Seven dimensions represent the natural fault lines in backend code quality -- the concerns where independent assessment provides actionable signal.

## The Adversarial Posture

A key design principle across all axiom skills:

> Do NOT trust passing checks as proof of quality. Passing checks prove what they check -- nothing about unchecked concerns.

This means the scan skill's deterministic checks are a floor, not a ceiling. When `axiom:scan` reports zero findings for a dimension, it means the mechanical patterns passed. The specialized skills (critique, harden, distill, verify) layer qualitative assessment on top, looking for issues that patterns cannot catch.

The adversarial posture exists because AI-driven assessment has a natural tendency toward false confidence. A model that runs grep patterns and finds nothing may conclude the code is clean. The adversarial framing forces the opposite assumption: absence of findings means the checks were insufficient, not that the code is flawless.

## Graduated Depth

Not every assessment needs all seven dimensions at full depth. Axiom supports focused assessment through individual skills:

- `axiom:critique` evaluates DIM-1 and DIM-6 (structure)
- `axiom:harden` evaluates DIM-2 and DIM-7 (operations)
- `axiom:verify` evaluates DIM-3 and DIM-4 (contracts and tests)
- `axiom:distill` evaluates DIM-1 and DIM-5 (topology and hygiene)
- `axiom:scan` evaluates any dimension mechanically
- `axiom:audit` evaluates all seven (full assessment)

This graduated approach means quick checks are cheap (run one skill, get two dimensions) while comprehensive assessment is available when needed (run audit, get all seven).

## Verdict Design

The two-level verdict (CLEAN / NEEDS_ATTENTION) is intentionally simple. Axiom does not produce letter grades, percentages, or ranked scores. The binary question is: "Does this code need attention, and if so, where?"

The findings themselves carry the nuance -- dimension, severity, evidence, and suggestion. The verdict is a gate; the findings are the diagnosis.

## References

- `skills/backend-quality/references/dimensions.md` -- Canonical dimension definitions
- `skills/backend-quality/references/scoring-model.md` -- Verdict computation and health thresholds
