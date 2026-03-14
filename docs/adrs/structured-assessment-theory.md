# Structured Assessment Theory

Why axiom uses a structured, dimension-based framework for AI-driven code quality assessment rather than open-ended prompting.

## The Problem

When you ask an AI model to "review this code for quality," the model faces an unbounded task. It might focus on naming conventions in one review and security vulnerabilities in the next. The coverage is inconsistent, the depth varies with context window pressure, and the output format changes between runs.

This inconsistency is not a bug in the model -- it reflects the fundamental challenge of open-ended quality assessment. Code quality has multiple independent concerns, and without structure, any single review will emphasize some while neglecting others.

## Why Structure Matters for AI Assessment

### Consistency Across Runs

A structured framework ensures the same dimensions are evaluated every time. When `axiom:audit` runs, it checks all seven dimensions regardless of what the code looks like or what the model finds most interesting. This prevents the failure mode where a flashy architectural issue absorbs all the model's attention while silent error handling problems go unexamined.

### Deterministic Baseline

Axiom separates mechanical checks (grep patterns, structural analysis) from qualitative assessment (design evaluation, pattern recognition). The `axiom:scan` skill runs deterministic checks first, establishing a baseline that does not depend on model judgment. Specialized skills then layer qualitative assessment on top.

This separation means the mechanical floor is reproducible. The same code produces the same scan results every time. Qualitative assessment adds value above that floor but cannot fall below it.

### Progressive Disclosure and Context Economy

AI models operate under context window constraints. Loading all quality guidance at once wastes tokens on dimensions that may not be relevant. Axiom's skill structure uses progressive disclosure:

1. **Frontmatter** (always loaded): Skill name, description, triggers -- enough to decide relevance
2. **SKILL.md body** (loaded when relevant): Process steps, references, error handling
3. **References** (loaded on demand): Detailed patterns, examples, heuristics for specific concerns

This means a focused review (`axiom:critique`) loads only architecture and topology guidance, while a comprehensive audit loads everything. The model's context budget is spent on the dimensions being assessed.

### Composable Skills

Each axiom skill is a self-contained assessment unit targeting specific dimensions. Skills compose through the audit orchestrator:

```
axiom:audit = axiom:scan + axiom:critique + axiom:harden + axiom:distill + axiom:verify
```

This composition model means:
- Individual skills can be run independently for focused assessment
- The audit skill orchestrates all skills and deduplicates findings
- New dimensions or checks can be added without modifying existing skills
- Each skill's reference documents are isolated, preventing cross-contamination of concerns

### Actionable Output

Structured assessment produces structured output. Every finding has a dimension, severity, evidence (file:line), and optional suggestion. This format is machine-parseable, sortable by severity, and groupable by dimension.

Compare this to a freeform review that produces paragraphs of prose. The structured finding format enables downstream automation: workflow tools can gate on HIGH findings, dashboards can track dimension health over time, and teams can prioritize remediation by severity.

## The Skill-as-Expert Model

Each axiom skill embeds domain expertise in its reference documents:

- `axiom:critique` carries SOLID principles, coupling metrics, and dependency direction patterns
- `axiom:harden` carries error handling taxonomies, resilience checklists, and fallback anti-patterns
- `axiom:verify` carries test fidelity heuristics, contract testing patterns, and mock overuse detection
- `axiom:distill` carries dead code taxonomies, simplification decision frameworks, and the "three uses" rule

This means the AI model does not need to recall these patterns from its training data. The relevant expertise is loaded into context when the skill activates, ensuring consistent application of domain knowledge regardless of model version or context history.

## Trade-offs

### What Structure Gains

- Reproducible coverage across all quality dimensions
- Consistent output format enabling automation
- Efficient context usage through progressive disclosure
- Domain expertise embedded in skill references rather than relying on model recall

### What Structure Costs

- Novel quality concerns not captured by the seven dimensions may be missed
- The framework imposes a taxonomy that may not perfectly fit every codebase
- Deterministic checks have false positives that require human triage

The trade-off is worthwhile for recurring assessment. A team running axiom regularly gets consistent, comparable results across time. One-off exploratory reviews may benefit from open-ended prompting, but systematic quality monitoring requires structure.

## Connection to Axiom's Design

Axiom's architecture directly implements these principles:

| Principle | Implementation |
|-----------|---------------|
| Consistent coverage | Seven canonical dimensions, all evaluated during audit |
| Deterministic baseline | `axiom:scan` runs grep patterns before qualitative skills |
| Progressive disclosure | Three-level skill loading (frontmatter / body / references) |
| Composable expertise | Independent skills with isolated reference documents |
| Structured output | Standard finding format with dimension, severity, evidence |
| Conjunctive convergence | All dimensions must independently pass (no weighted scores) |
