# Composing Generic Axiom Dimensions with Project-Specific Invariants

> **Status:** Discovery — `axiom-invariants-composition-2026-05-09`
> **Audience:** anyone making decisions about how axiom skills relate to project-specific design skills (e.g., `exarchos:design-invariants`)
> **Question:** When the user reflexively pairs `/design-invariants` with `/axiom:backend-quality` during ideation, what is the right way to encode that pairing as first-class structure rather than a verbal protocol?

---

## 1. Problem statement

During design work — typically inside `/exarchos:ideate` — the user instructs the model to apply both:

- **Project-specific invariants** — e.g., Exarchos's `design-invariants` skill (INV-1 event-sourcing integrity, INV-2 facade equivalence, INV-3 basileus-forward, INV-4 platform-agnosticity, INV-5a..d agent-interface design).
- **Generic backend-quality dimensions** — axiom's DIM-1..DIM-8 (Topology, Observability, Contracts, Test Fidelity, Hygiene, Architecture, Resilience, Prose).

This pairing is currently a *verbal protocol*. Two automations are on the table:

- **Proposal A.** Rename `axiom:backend-quality` (or add a sibling skill named "invariants") that encodes axiom dimensions for the *design-constraint* use case (currently the dimensions read as review findings, not design constraints).
- **Proposal B.** Add an axiom meta-skill that interviews the user about a project's domain, and scaffolds a project-local axiom-backed skill — analogous to `impeccable:shape` producing a brief, but here the output is a reusable skill.

These look similar but solve different problems: A is about *runtime composition*; B is about *bootstrap authoring*.

This report frames the problem against established patterns, evaluates each proposal, and recommends a path that adopts elements of both.

---

## 2. Two questions, not one

Splitting the framing collapses a lot of ambiguity:

| Question | What's being asked | Pattern family |
|---|---|---|
| Q1 — **Composition** | At use-time, how do generic dimensions and project-specific invariants combine? | ATAM utility tree; ESLint `extends`; Azure WAF service guides |
| Q2 — **Authoring** | At setup-time, how does a project produce its own invariant catalog? | Anthropic skill-creator; impeccable `/teach`; QAW (Quality Attribute Workshop) |
| Q3 — **Mode** | Are these dimensions used to *constrain design* or *evaluate code*? | WAF "design checklists" vs "configuration recommendations"; fitness-function design vs governance |

Proposal A conflates Q1 and Q3 — the renaming question is really "does the foundation skill have a design-mode entry point?" Proposal B is Q2 in isolation. Once these are split, the answer space gets cleaner.

---

## 3. Pattern foundation

### 3.1 Azure Well-Architected Framework — pillars + workloads + services

The WAF has the closest structural analogue. It defines five generic **pillars** — Reliability, Security, Cost Optimization, Operational Excellence, Performance Efficiency — and applies them in two extension layers:

- **Workload guides** (AI, SaaS, Mission-critical, HPC, Sustainability, Oracle on IaaS, Azure VMware Solution, Azure Virtual Desktop) — apply the same pillars to a *workload class*.
- **Service guides** (Service Bus, Blob Storage, Event Grid, App Service, Service Fabric, ...) — apply the same pillars to a *specific service*.

Two structural choices in the WAF matter for our problem:

1. **The pillar taxonomy doesn't change across layers.** Service-Bus reliability is still Reliability — not a new dimension, a specialization. The composition is *declension* (specialization), not *extension* (new dimensions).
2. **Each service guide has dual sections under each pillar:** `Workload design checklist` and `Configuration recommendations`. The same pillar drives both *design-mode* (checklist questions to ask before implementation) and *review-mode* (concrete settings to verify after implementation). The mode discrimination is built into the structure.

> Source: `https://learn.microsoft.com/en-us/azure/well-architected/`, `https://learn.microsoft.com/en-us/azure/well-architected/service-guides/`, the Service Bus and Blob Storage guides on Microsoft Learn.

This is the canonical "generic foundation + domain-specific instantiation, in two modes" model. Axiom and `exarchos:design-invariants` already approximate it; the recommendation below makes the pattern explicit.

### 3.2 ATAM and Quality Attribute Workshops — utility tree

The SEI's ATAM and its early-lifecycle companion QAW (third edition, 2003) operate on a structure called the **utility tree**:

- **Root** — system utility.
- **Branches** — generic quality attribute categories (modifiability, performance, security, availability, ...).
- **Leaves** — *project-specific scenarios* that operationalize the attribute for this system.

The utility tree is the architectural-quality literature's solution to exactly the composition problem: how to keep a stable cross-project taxonomy while allowing each project to write its own scenarios. The leaves are local; the branches are universal.

Mapping to our case:

- **Branches** ≈ axiom DIM-1..DIM-8.
- **Leaves** ≈ `exarchos:design-invariants` INV-1..INV-5d (each of which is essentially a project-specific scenario set tied to one or two generic dimensions, as the existing complementarity matrix already documents).

QAW is also the closest precedent for Proposal B — it is a *facilitated workshop* that produces refined, prioritized scenarios. The skill-authoring meta-skill we'd build is QAW automated.

> Sources: SEI Library QAW Third Edition (2003); ATAM Collection (2018); "SEI Architecture Analysis Techniques and When to Use Them" (Barbacci, 2002).

### 3.3 Architectural fitness functions — what the invariants *are*

Ford, Parsons, Kua and Sadalage (*Building Evolutionary Architectures*, 2nd ed., 2022) define an architectural fitness function as:

> "Any mechanism that provides an objective integrity assessment of some architectural characteristic(s)."

The NILUS taxonomy (2025) categorizes fitness functions four ways:

1. **Structural** — code dependencies, database access, API contracts, service boundaries.
2. **Behavioral** — latency, resilience, throughput, consistency, recovery.
3. **Operational** — deployment independence, observability coverage, runbook readiness, SLO compliance.
4. **Semantic** — bounded context integrity, event naming quality, policy ownership, domain model consistency.

Two observations:

- **Exarchos's INV-* are fitness functions.** INV-1 (event-sourcing integrity) is structural + semantic; INV-2 (facade equivalence) is structural; INV-5d (action discriminator) is structural; INV-5b (output contract) is behavioral. The deterministic-checks file already encodes some as executable checks (grep patterns, type-system constraints).
- **Axiom DIM-* are also fitness functions** — generic ones, written for any backend. DIM-1 Topology corresponds to NILUS's "structural"; DIM-2 Observability and DIM-7 Resilience to "operational"/"behavioral"; DIM-3 Contracts to "structural" with semantic overtones.

The "design invariants" skill description "audits a design proposal or diff against [...] invariants" maps directly to Thoughtworks's *fitness-function-driven development*: tests for the architecture, written alongside tests for the domain.

> Sources: O'Reilly *Building Evolutionary Architectures* 2nd ed. ch. 2 + ch. 4; NILUS "Architecture Fitness Functions in Evolutionary Architecture" (2025); Thoughtworks "Fitness function-driven development" (2019); AWS Architecture Blog "Cloud Fitness Functions" (2021).

### 3.4 ISO 25010 — domain-specific instantiation precedent

The 2023 revision of ISO/IEC 25010 defines nine product-quality characteristics with sub-characteristics. Crucially, the literature documents three established *domain-specific instantiations*:

- **Software process usability** (Fontdevila et al., 2017) — Usability sub-characteristics adapted for assessing dev-process adoption (e.g., Accessibility replaced with Visibility/Understandability).
- **Industrial automation** (Karnouskos et al., 2021) — Security extended with non-repudiation and accountability; Performance Efficiency emphasizing end-to-end timing and reliability.
- **Test artifact quality** (Tran et al., 2024) — Maintainability gains Independency, Traceability, Changeability sub-characteristics.

The pattern: keep the parent characteristic (axis), substitute or add sub-characteristics for the domain. This is the *declension* pattern again — same axis names, domain-specific leaf populations.

> Sources: ISO 25010:2023; ZetCode tutorial; emergentmind topic survey.

### 3.5 ESLint extends — composition contract for generic + local

ESLint's flat config (post-2025 reintroduction of `extends`) is the most mature "generic foundation + project-specific overrides" composition contract in software tooling:

```js
export default defineConfig([
  {
    files: ["**/*.js"],
    extends: [
      "js/recommended",            // generic, from plugin
      reactPlugin.configs.flat.recommended,  // generic, from plugin
      myProjectConfig,             // project-specific
    ],
    rules: {
      "no-unused-vars": "warn",    // local override
    },
  },
]);
```

Three load-bearing decisions:

1. **Plugin vs config separation.** A *plugin* ships custom rule logic; a *config* selects which rules apply at which severity. They have different lifecycles — plugins are usually peer-deps so projects pin one copy; configs are deps so they ship their own assumptions. Axiom and `exarchos:design-invariants` mirror this: axiom skills are the plugin (the generic detection logic), the design-invariants skill is the config (the project's selection + project-specific INV-* additions).
2. **`extends` is array-ordered.** Later entries override earlier ones. This is what makes "generic baseline + project specialization" trivially composable — you don't need a merge protocol, just an ordering rule.
3. **Self-resolution of plugins.** Plugins are searched relative to the *consumer* project, configs relative to the *config file*. This separation prevents version skew; it's the discipline our composition contract should imitate.

> Sources: ESLint blog "Evolving flat config with extends" (2025-03); ESLint docs "Combine Configs", "Share Configurations"; Zaicevas, "How ESLint Resolves Plugins And Shareable Configs" (2021).

### 3.6 Anthropic skill-creator + impeccable `/teach` — meta-authoring precedent

Two existing precedents for Proposal B:

**Anthropic's `skill-creator`** is itself a Claude skill that interviews the user, scaffolds a `SKILL.md` with frontmatter, organizes bundled resources, and can run evals + benchmarks against the resulting skill. From the upstream `SKILL.md`:

> "Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy."

It already handles: progressive disclosure (metadata → SKILL.md body → bundled resources), description-tuning for triggering accuracy, and the four-mode workflow (Create / Eval / Improve / Benchmark). A Proposal B skill should *specialize* this rather than duplicate it.

**Impeccable's catalog** is structured by category (Create / Evaluate / Refine / Simplify / Harden / System) and has two relevant primitives:

- **`/shape`** — discovery interview that produces a `brief.md` (purpose, user, content, feeling, constraints). Output is a *one-shot artifact* used by downstream commands, not a reusable skill.
- **`/teach`** — "Teach Impeccable who your product is for, once per project." The closest analogue to Proposal B at the right scope: a one-time project-context registration that downstream commands read. Output is *project-local persistent state*, not a generated skill file.

Proposal B sits between these: produce a *skill file* (heavier than `/teach`'s persistent state, lighter than skill-creator's full lifecycle).

> Sources: anthropics/skills repo; claude.com plugin marketplace skill-creator; impeccable.style docs index and `/shape` page.

### 3.7 Generator scaffolding — Yeoman, plop, cookiecutter

Yeoman, plop, and cookiecutter all implement *interview-driven scaffolding*: prompts → variables → templated file output. plop's design note is instructive:

> "When a project-specific Yeoman generator may sound overkill, plop fits perfectly. Lightweight, close to source code, it will be easier to adopt, maintain and, at the end, it will be used."

The lesson for Proposal B: bias toward plop's lightweight, in-repo, single-purpose model rather than Yeoman's plugin ecosystem. The skill we'd generate is one file plus a small references directory — closer to plop's scope than Yeoman's.

> Sources: yeoman.io; npm `plop`; nicoespeon's plop walkthrough (2015); Gruntwork Boilerplate "vs other" comparison.

---

## 4. Diagnosis

The user's two proposals are not actually competing. They address orthogonal axes:

```text
                authoring (Q2)
                     ↓
                                     project-specific
                                     ┌──────────────┐
                                     │ exarchos:    │
        ┌────────────────────────────┤ design-      │
        │ Proposal B                 │ invariants   │
        │ (meta-skill, scaffolds     │ (INV-1..5d)  │
        │  per-project skill)        └──────┬───────┘
                                            │
        ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─  composition (Q1)
                                            │
        ┌────────────────────────────┐      │
        │ Proposal A                 │      │
        │ (axiom design-mode entry,  │      │
        │  pairs with project skill) │      │
                                     └──────┴───────┐
                                     │ axiom:       │
                                     │ DIM-1..DIM-8 │
                                     │ (review +    │
                                     │  design)     │
                                     └──────────────┘
                                          generic
```

- Proposal A solves Q1 + Q3: introduce a design-mode entry point on the generic side so that *paired use during ideation* is a first-class operation rather than an ad-hoc verbal recipe.
- Proposal B solves Q2: produce a per-project skill modeled on the design-invariants archetype, so the *project-specific side* of the pair doesn't have to be hand-authored.

Both are needed. Neither is sufficient alone:

- Without A, the pairing remains undocumented and the dimensions remain review-shaped (DIM-1's invariants and severity guides are written as code-evaluation rubrics, not design questions).
- Without B, every new project hand-rolls its design-invariants from scratch — a heavy, error-prone bootstrap.

---

## 5. Evaluation of proposals

### 5.1 Proposal A — rename or add a design-mode skill

| | |
|---|---|
| **Strong reading** | Axiom currently has no design-mode entry point. The dimensions are written as review rubrics. A new skill (or a renamed `backend-quality`) gives the user a clear surface to invoke during `/exarchos:ideate` that frames DIM-1..DIM-8 as *design constraints* rather than *findings about existing code*. |
| **Weak reading** | The pairing pattern works fine verbally; renaming is cosmetic. |
| **Naming choice — "invariants"?** | Risky. `exarchos:design-invariants` already uses INV-* for project-specific invariants. Naming axiom's foundation "invariants" creates a name collision and inverts the semantics — axiom dimensions are *not* invariants in Exarchos's sense (project-specific, load-bearing); they're cross-domain quality categories. The Azure WAF terminology *pillars* is better-aligned and unambiguous. |
| **Mode framing** | The Azure WAF service guides already have a precedent: each pillar gets a `Workload design checklist` (design mode) and `Configuration recommendations` (review mode) section. This is exactly the dual-mode treatment axiom's foundation reference is missing. |

**Verdict on A:** Adopt — but reframe. Don't rename `backend-quality`; keep it as the foundation reference. Add a design-mode skill (working name: `axiom:design`, alternatives below) that surfaces dimensions as constraints. Do not call it "invariants" — that overloads project-specific terminology.

### 5.2 Proposal B — meta-skill that scaffolds a project-local invariants skill

| | |
|---|---|
| **Strong reading** | Exarchos's `design-invariants` is a model for what a per-project invariants skill should look like (project-grounded checks, severity guides, deterministic checks, axiom-overlap mapping). Other projects need the same artifact. A meta-skill that interviews the user, asks QAW-style scenario-elicitation questions, and emits the skill file is a force multiplier. |
| **Weak reading** | Skill-creator already exists. A separate scaffolder is duplication. |
| **Composition with skill-creator** | Specialize, don't duplicate. Skill-creator handles *general* skill authoring (any skill); a Proposal B skill handles the *narrow* case of "create a project-specific axiom-paired invariants skill." The specialization is in the interview script (QAW-style), the output template (modeled on `exarchos:design-invariants`), and the cross-references it generates (axiom-overlap matrix pre-populated against DIM-1..DIM-8). |
| **Output shape** | Should match Exarchos's existing structure exactly: `SKILL.md` + `references/INV-N-*.md` + `references/deterministic-checks.md`. Reuse is the point — every project's invariants skill should look the same shape so the pairing protocol is uniform. |

**Verdict on B:** Adopt — as a thin specialization on top of skill-creator's authoring lifecycle. Bias toward plop-style minimalism, not Yeoman-style framework.

---

## 6. Recommendation

Adopt all three of: a design-mode entry on the generic side, a meta-authoring skill on the project-specific side, and an explicit composition contract between them.

### 6.1 Add `axiom:design` (working name)

A new user-invokable skill, peer to `axiom:audit`. Same dimension taxonomy, framed as design-mode constraint application:

- For each dimension, surface the *invariants* (already in `dimensions.md` §"Invariants") as a checklist of design questions.
- Drop the *severity guide* (review-mode) and replace it with a *trade-off note* (design-mode — what you give up if you violate, when violation is justified).
- Keep the *examples* sections — they're already mode-agnostic.
- Pair-explicit metadata: `pairs-with: <project-invariants-skill>` slot in frontmatter, mirroring how `exarchos:design-invariants` already declares `pairs-with: axiom:backend-quality`.

This mirrors Azure WAF's "Workload design checklist" — same pillars, design-mode framing.

**Naming alternatives (in decreasing preference):**

| Name | Pros | Cons |
|---|---|---|
| `axiom:design` | clear mode signal; symmetric with `audit` | slightly generic |
| `axiom:constrain` | most accurate (constraints, not findings) | unusual |
| `axiom:pillars` | mirrors WAF terminology | may confuse — pillars are the *taxonomy*, not the mode |
| `axiom:invariants` | matches user's draft | collides with INV-* in project-specific skills; rejected |

### 6.2 Add `axiom:scaffold-invariants` (working name)

A meta-skill that produces a project-local `<project>:design-invariants` skill (or whatever the project chooses to call it). Specialization of skill-creator:

1. **Interview** — QAW-style scenario elicitation. Prompt structure:
   - "What is this project's one-line characterization?" (mirrors Exarchos's "single-machine event-sourced process manager with cooperative agents")
   - "What architectural decisions have you committed to that feel non-obvious from the code?" → these become INV-* candidates
   - "For each, which axiom dimension(s) does it specialize?" → seeds `axiom_overlap` mapping
   - "What's the failure mode if this invariant is violated?" → seeds severity guide
   - "Is there a mechanical check for this?" → seeds deterministic-checks file
2. **Emit** — generate `SKILL.md` + `references/INV-N-*.md` per invariant + `references/deterministic-checks.md`. Use Exarchos's existing files as the structural template (they're well-shaped and battle-tested).
3. **Defer to skill-creator** for triggering/description optimization, evals, benchmarking — don't reimplement those.

The meta-skill should *not* be axiom-version-locked; it should output a skill that declares which axiom version it pairs with, the same way ESLint shareable configs declare peer-dep versions.

### 6.3 Codify the composition contract

The pairing protocol that the user currently invokes verbally should become a documented contract. Three concrete pieces:

1. **Frontmatter slots.** Add to axiom skills a `pairs-with-pattern: <project>:design-invariants` slot. Add to project-specific invariants skills a `pairs-with: axiom:design` slot. Both already partially exist (`design-invariants` declares `pairs-with: axiom:backend-quality`); formalize and document.
2. **Composition rule.** Document the ordering: *project-specific invariants first*, *generic dimensions second*. Project-specific is more load-bearing — INV-1 on Exarchos's event store is more authoritative than DIM-1 Topology in general. Mirrors ESLint's array-order semantics.
3. **Cross-reference convention.** Project invariants declare `axiom_overlap: DIM-N` (already in `design-invariants`'s findings format); axiom dimensions don't need to declare back-references — they're the universal layer. Mirrors ATAM's utility tree (leaves point to branches, never the reverse).

### 6.4 Things explicitly *not* recommended

- **Don't rename `backend-quality`.** It's a foundation reference — non-invokable, defines the taxonomy. Renaming muddies the taxonomy/skill distinction. ISO 25010 doesn't rename "quality model" when adding domain-specific instantiations; neither should we.
- **Don't make the meta-skill (Proposal B) a workflow.** A workflow implies multi-phase state machines. The output is a single skill scaffold — closer to `/exarchos:oneshot` shape than `/exarchos:ideate`. Plop, not Yeoman.
- **Don't bundle design-mode and review-mode into one skill.** Azure WAF separates the two modes explicitly *within* each guide; we should separate them across skills (`axiom:audit` for review, `axiom:design` for constraint application).

---

## 7. Risks and follow-ups

| Risk | Mitigation |
|---|---|
| Two design-mode skills (`axiom:design` + project invariants) compete for triggering | Ensure description fields are non-overlapping. axiom:design = "applies generic backend quality dimensions during design"; project invariants = "applies project-specific architectural invariants during design". Test triggering empirically with eval prompts (skill-creator's Eval mode handles this). |
| Meta-skill (B) generates skills that immediately drift from the template | Same mitigation as ESLint shareable configs: bake in a version stamp + a "regenerate from template" sub-action. Schedule a re-validation review when the axiom dimension catalog changes. |
| Naming creep — adding too many axiom skills dilutes the catalog | Keep axiom user-invokable surface ≤ 8 skills. Currently: audit, scan, critique, harden, distill, verify, humanize. Adding `design` + `scaffold-invariants` brings it to 9. Consider folding `humanize` under `audit` and `scan` if quotas tighten. |
| Different projects will want different invariant *categories*, not just different leaves | Consider whether projects need to extend the dimension taxonomy itself. For now: don't allow it — keep DIM-1..DIM-8 stable, let projects specialize via INV-* leaves. Revisit if a project genuinely needs a new dimension (e.g., a security-critical workload might want a dedicated DIM-9). |
| `axiom:design` may duplicate content from `dimensions.md` | Reuse via reference: `@skills/backend-quality/references/dimensions.md` + a thin design-mode wrapper. Don't fork the taxonomy. |

**Follow-up implementation issues** (suggested for axiom):

- **#new** — Define `axiom:design` skill: design-mode entry point for DIM-1..DIM-8.
- **#new** — Define `axiom:scaffold-invariants` skill: specialize skill-creator to scaffold project-local invariants skills modeled on Exarchos's `design-invariants` archetype.
- **#new** — Codify pairing contract: frontmatter slots, ordering rule, cross-reference convention. Update `axiom:audit` and `axiom:backend-quality` README/SKILL.md to reference the contract.

**Follow-up coordination with Exarchos:**

- Update `exarchos:design-invariants` `pairs-with` field from `axiom:backend-quality` to `axiom:design` once the latter ships.
- Consider whether Exarchos's design-invariants should regenerate its skill via `axiom:scaffold-invariants` once available — the test of the meta-skill is whether it can reproduce the existing artifact without loss of fidelity.

---

## 8. Sources

External grounding:

- **Azure Well-Architected Framework** — `https://learn.microsoft.com/en-us/azure/well-architected/`, `workloads`, `service-guides/`, Service Bus and Blob Storage guides. Pattern: pillars + workload guides + service guides; design checklist + configuration recommendations dual-mode within each guide.
- **SEI Software Engineering Institute** — Quality Attribute Workshops (QAWs) Third Edition (2003); Architecture Tradeoff Analysis Method Collection (2018); "SEI Architecture Analysis Techniques and When to Use Them" (Barbacci, 2002). Pattern: utility tree, scenario refinement, attribute-based architectural styles.
- **Building Evolutionary Architectures** — Ford, Parsons, Kua, Sadalage, 2nd ed. (O'Reilly, 2022), chapter 2 (fitness functions), chapter 4 (automating architectural governance). Pattern: fitness functions as objective integrity assessments.
- **NILUS** — "Architecture Fitness Functions in Evolutionary Architecture" (2025-06). Pattern: structural / behavioral / operational / semantic fitness function taxonomy.
- **Thoughtworks** — "Fitness function-driven development" (2019). Pattern: fitness functions as architectural tests written alongside domain tests.
- **AWS Architecture Blog** — "Cloud Fitness Functions to Drive Evolutionary Architecture" (2021). Pattern: cloud APIs as observable fitness data sources.
- **ISO/IEC 25010:2023** — *Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model*. Domain-specific instantiations: Fontdevila et al. 2017 (process usability); Karnouskos et al. 2021 (industrial automation); Tran et al. 2024 (test artifact quality).
- **ESLint** — "Evolving flat config with extends" blog (2025-03); "Combine Configs"; "Share Configurations"; Zaicevas "How ESLint Resolves Plugins And Shareable Configs" (2021). Pattern: `extends` with array-order override, plugin/config separation, peer-dep resolution.
- **Anthropic** — `skills/skill-creator/SKILL.md` (anthropics/skills GitHub); Skill Creator plugin page; "Introducing Agent Skills" announcement (2025-10). Pattern: meta-skill for skill authoring, four-mode lifecycle (Create / Eval / Improve / Benchmark), progressive disclosure (metadata → body → resources).
- **Impeccable** — `https://impeccable.style/docs/`, `/docs/shape/`. Pattern: `/shape` discovery brief, `/teach` project context, six-category catalog (Create / Evaluate / Refine / Simplify / Harden / System).
- **Yeoman / plop / cookiecutter** — yeoman.io; npm `plop`; nicoespeon's plop walkthrough (2015); Gruntwork Boilerplate vs-other comparison. Pattern: interview-driven template scaffolding; plop's lightweight in-repo model preferred over Yeoman's plugin-ecosystem model for narrow-scope generation.

Internal grounding:

- `axiom/skills/backend-quality/references/dimensions.md` — DIM-1..DIM-8 taxonomy.
- `axiom/skills/backend-quality/SKILL.md` — foundation reference structure.
- `axiom/skills/audit/SKILL.md` — orchestrator-skill model that other axiom skills extend.
- `exarchos/.claude/skills/design-invariants/SKILL.md` — project-specific archetype with INV-1..INV-5d, complementarity matrix, axiom-overlap declarations.
- `exarchos/.claude/skills/design-invariants/references/INV-1-event-sourcing.md` and `deterministic-checks.md` — structural template the scaffolder should reproduce.
- `exarchos/docs/architecture/runtime.md` — example of project-specific layering (L1 storage → L9 cooperative agents) that an invariants skill audits against.
