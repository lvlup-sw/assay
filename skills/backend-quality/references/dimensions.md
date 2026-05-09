# Backend Quality Dimensions

Eight canonical dimensions for assessing backend architectural health. Each dimension is independently assessable — no dimension requires another's output to produce findings.

## DIM-1: Topology

**Definition:** The structural health of dependency graphs, wiring correctness, and state ownership. Topology violations create invisible coupling where modules behave differently depending on initialization order or runtime context.

**Invariants:**
- Every shared resource has a single source of truth for its lifecycle
- Dependencies are explicit (parameter/constructor injection), not ambient (module globals)
- No module silently creates degraded instances of shared resources

**Detectable Signals:**
- Module-global mutable state (`let moduleStore = ...` at file scope)
- Lazy fallback constructors (`if (!store) { store = new Store() }`)
- Manual wiring functions (`configureXxx()`, `registerXxx()`) without validation
- Divergent instances of the same resource across modules
- Circular dependency chains

**Severity Guide:**
- **HIGH:** Lazy fallback creates degraded instance silently (masks broken wiring)
- **MEDIUM:** Module-global mutable state without documented rationale
- **LOW:** Manual wiring that works but could be simplified

**Examples:**
- Violation: `getStore()` silently creates an in-memory store when the real store wasn't wired, causing events to be invisible across modules
- Healthy: Constructor injection where the absence of a dependency is a startup error, not a silent fallback

### Design questions

- **Lifecycle ownership.** For every shared resource the design introduces, who creates it, who owns it, and where is the single source of truth?
- **Dependency injection.** Are all dependencies passed as parameters or constructor arguments? If any are module globals, what justifies the ambient state?
- **Fallback policy.** If a dependency isn't wired, does the system fail loud (startup error) or fall back silently? Loud is the default.
- **Graph shape.** Sketch the dependency graph for the new code. Are there cycles? If so, justify or break them.

---

## DIM-2: Observability

**Definition:** The visibility of errors, failures, and system behavior. Observability violations hide problems, making bugs harder to find and diagnose. A system with poor observability may appear healthy while silently losing data.

**Invariants:**
- Every catch block either re-throws, logs with context, or has documented rationale for swallowing
- Error messages include what failed, why, and what to do about it
- Fallback behavior is visible (logged, metriced, or signaled), never silent

**Detectable Signals:**
- Empty catch blocks (`catch {}`, `catch (e) {}`)
- Catch blocks that only log without context (`catch (e) { console.log(e) }`)
- Silent fallbacks that switch behavior modes without signaling
- Missing error context (generic "something went wrong" messages)
- Swallowed promise rejections (`.catch(() => {})`)

**Severity Guide:**
- **HIGH:** Silent catch that masks data loss or incorrect behavior
- **MEDIUM:** Catch that logs but lacks actionable context
- **LOW:** Verbose error that could be more specific

**Examples:**
- Violation: `catch { mutableState._events = [] }` — silently resets state on error, hiding the failure
- Healthy: `catch (e) { throw new Error('Failed to load events from store', { cause: e }) }`

### Design questions

- **Catch posture.** For every catch block the design will introduce, what action does it take: re-throw, log with context, or document why it swallows? "Swallow silently" is never the answer.
- **Error context.** When the new code raises an error, does the message include what failed, why, and what the caller should do? Generic messages are debt.
- **Fallback visibility.** If the design has a fallback path, how does it announce itself (log, metric, event)? An undetectable fallback is a silent failure waiting to happen.
- **Promise discipline.** For every `.catch()` or async error path, what's the recovery plan? Empty `.catch(() => {})` is forbidden.

---

## DIM-3: Contracts

**Definition:** The integrity of schemas, APIs, and type boundaries. Contract violations occur when the actual runtime behavior diverges from the declared interface — fields removed from schemas but still read, breaking API changes without versioning, or type assertions that bypass safety.

**Invariants:**
- Every field read at runtime is present in the declared schema/type
- API changes are versioned or backward-compatible
- Type assertions (`as`, `!`) have validated preconditions

**Detectable Signals:**
- Schema fields removed but still accessed at runtime
- Zod/JSON schemas that don't match TypeScript types
- Unversioned breaking API changes
- Type assertions without guards (`value as Type` without `typeof`/`instanceof` check)
- Interface implementations that silently ignore new required members

**Severity Guide:**
- **HIGH:** Schema-runtime divergence (field removed from schema but read at runtime)
- **MEDIUM:** Type assertion without validation guard
- **LOW:** Overly permissive schema (accepts more than necessary)

**Examples:**
- Violation: `_events` removed from Zod schema but guard code still reads `state._events`, silently getting `undefined`
- Healthy: Schema changes accompanied by grep for all field references, with type system enforcing the change

### Design questions

- **Schema boundaries.** Where do the new types/schemas live? Is each runtime read of a field guaranteed by the schema, or is there a gap?
- **Versioning posture.** Does this design make a breaking API change? If yes, what's the versioning or migration path? If no, what makes the change backward-compatible?
- **Type assertions.** Will the implementation use `as` or `!` to bypass the type system? Each instance needs a documented runtime guard (`typeof`, `instanceof`, schema parse).
- **Cross-boundary contracts.** For every interface across module/service boundaries, who validates the contract — caller, callee, or both?

---

## DIM-4: Test Fidelity

**Definition:** The degree to which tests exercise actual production behavior. Low test fidelity means tests can pass while the system is broken — the most dangerous kind of false confidence.

**Invariants:**
- Test setup matches production wiring (same instances, same initialization)
- Mocks are used only at true infrastructure boundaries (HTTP, DB, filesystem)
- Critical paths have integration tests, not just unit tests

**Detectable Signals:**
- Test setup creates different instances than production wiring
- More than 3 mocked dependencies in a single test (over-isolation)
- Unit tests for cross-cutting concerns that need integration tests
- Tests that assert on mock calls rather than observable behavior
- Test helpers that hide important setup details
- `describe.skip` or `it.skip` without tracked issue references

**Severity Guide:**
- **HIGH:** Test-production divergence on shared state (different instances)
- **MEDIUM:** Over-mocking hides real integration behavior
- **LOW:** Test naming doesn't follow conventions

**Examples:**
- Violation: All tests use the same EventStore instance for producer and consumer, but production has two separate instances that were never connected — 4192 tests pass, system is broken
- Healthy: Test creates the same wiring as production startup, catching initialization bugs

### Design questions

- **Wiring parity.** Will the tests construct the new code's collaborators the same way production does? Where the tests diverge from production wiring, what's the rationale?
- **Mock boundary.** What's the mocking boundary for this design — only true infrastructure (HTTP, DB, filesystem), or also internal collaborators? Internal mocking should be the exception, not the default.
- **Integration coverage.** For every cross-cutting behavior in the design, is there at least one integration test that exercises the seam, not just unit tests on each side?
- **Skip discipline.** Will any test be marked `.skip` during this work? If yes, what's the issue link and removal date?

---

## DIM-5: Hygiene

**Definition:** The absence of dead code, vestigial patterns, and evolutionary leftovers. Poor hygiene increases cognitive load, hides the actual architecture, and provides misleading signals about what the system does.

**Invariants:**
- Every exported symbol has at least one consumer
- No commented-out code blocks (use version control instead)
- No divergent implementations of the same behavior

**Detectable Signals:**
- Unreachable code paths (after unconditional return/throw)
- Unused exports (exported but never imported)
- Commented-out code blocks (more than 3 lines)
- Feature flags for features that shipped long ago
- Duplicate implementations (same behavior in multiple places)
- Functions that are declared but never called

**Severity Guide:**
- **HIGH:** Divergent implementations causing inconsistent behavior
- **MEDIUM:** Dead code actively misleading about system behavior
- **LOW:** Minor unused exports or stale comments

**Examples:**
- Violation: `registerEventTools()` exists but is never called in production — vestigial from an earlier design that was refactored
- Healthy: Unused code removed, version history preserves it if needed

### Design questions

- **Single implementation.** Does the design introduce a behavior that already exists elsewhere? If yes, is it consolidating or forking?
- **Reachability.** For every export the new code adds, who calls it? Unused exports should be removed before the design is done.
- **Comment policy.** Will any commented-out code be left behind? Use git history instead.
- **Feature-flag horizon.** If the design introduces a flag, what's the removal date or condition? A flag without a sunset is debt.

---

## DIM-6: Architecture

**Definition:** Compliance with fundamental design principles — SOLID, coupling/cohesion, dependency direction. Architecture violations make the system rigid, fragile, and resistant to change.

**Invariants:**
- Dependencies point inward (high-level modules don't depend on low-level details)
- No circular dependency chains between modules
- Each module has a single, well-defined responsibility
- Interfaces are at domain boundaries, not within a module

**Detectable Signals:**
- God objects (classes/modules with >10 public methods or >500 lines)
- Circular imports between modules
- Dependency inversion violations (core depends on infrastructure)
- Feature envy (method primarily uses another class's data)
- Shotgun surgery indicators (one change requires edits in >5 files)

**Severity Guide:**
- **HIGH:** Circular dependencies creating build or runtime issues
- **MEDIUM:** SOLID violations that resist planned changes
- **LOW:** Mild coupling that doesn't impede current work

**Examples:**
- Violation: Event store module imports from CLI module, creating a circular dependency that constrains refactoring
- Healthy: Event store depends on interfaces; CLI implements those interfaces

### Design questions

- **Dependency direction.** Do the new modules depend inward (toward the domain) or outward (toward infrastructure)? Outward dependencies in the core are a smell.
- **Module responsibility.** Each new module: state its single responsibility in one sentence. If you need "and" or a list, split it.
- **Interface placement.** Where do the interfaces live — at the domain boundary the consumer owns, or inside the producer's module? Domain-boundary placement is the default.
- **Change surface.** For a representative change to this design, how many files would need editing? More than five suggests shotgun surgery.

---

## DIM-7: Resilience

**Definition:** Operational robustness under stress, failure, and resource pressure. Resilience violations don't break normal operation but cause cascading failures under load, resource exhaustion, or partial outages.

**Invariants:**
- Every cache has a maximum size and eviction policy
- Every external call has a timeout
- Retry logic has bounded attempts and backoff
- Resource acquisition has corresponding release (open/close symmetry)

**Detectable Signals:**
- Unbounded caches (`Map` or `Set` that grows without limit)
- Missing timeouts on HTTP calls, database queries, or file operations
- Retry loops without maximum attempts
- Resource leaks (file handles, connections opened but not closed in error paths)
- Missing graceful degradation (all-or-nothing behavior)
- Synchronous blocking on I/O in async contexts

**Severity Guide:**
- **HIGH:** Unbounded resource growth that will eventually crash
- **MEDIUM:** Missing timeout that could hang indefinitely
- **LOW:** Suboptimal resource management that doesn't impact normal operation

**Examples:**
- Violation: In-memory cache grows without limit as events are processed, eventually exhausting heap
- Healthy: LRU cache with configurable max size, eviction logged for observability

### Design questions

- **Cache bounds.** Does the design introduce any cache, map, or buffer? What's its maximum size and eviction policy?
- **Timeout coverage.** For every external call (HTTP, DB, file I/O), what's the timeout? "None" means hung-forever-on-failure.
- **Retry shape.** If the design retries, what's the maximum attempt count and backoff strategy? Unbounded retry is a fork bomb.
- **Resource lifecycle.** For every resource the design opens (file handle, connection, lock), where is the matching close, and does it run on the error path too?

---

## DIM-8: Prose Quality

**Definition:** The absence of detectable AI-writing patterns in documentation, comments, user-facing strings, and prose content. Prose quality violations erode trust, signal unreviewed AI output, and make content feel generic rather than purposeful.

**Invariants:**
- Documentation reads as written by a domain expert, not generated by a language model
- No chatbot correspondence artifacts (sycophantic openers, "let me know" closers)
- Technical writing is direct and specific, not padded with filler phrases or hedging

**Detectable Signals:**
- AI vocabulary clustering (additionally, crucial, delve, landscape, tapestry, testament, underscore, vibrant)
- Collaborative communication artifacts ("I hope this helps", "Certainly!", "Would you like...")
- Knowledge-cutoff disclaimers ("as of [date]", "based on available information")
- Structural tells (em dash overuse, rule of three, inline-header vertical lists, title case headings)
- Content inflation (inflated significance, promotional language, superficial -ing analyses)
- Filler and hedging (generic positive conclusions, excessive hedging, wordy phrases)

**Severity Guide:**
- **HIGH:** Chatbot artifacts or knowledge-cutoff disclaimers left in shipped content
- **MEDIUM:** AI vocabulary clustering (3+ AI-typical words in a paragraph) or structural tells
- **LOW:** Isolated filler phrases or mild hedging

**Examples:**
- Violation: "This crucial module serves as a testament to the team's commitment to fostering robust architecture. It delves into the intricate tapestry of event-sourced workflows."
- Healthy: "This module handles event-sourced workflow state. It stores events in SQLite and rebuilds state on read."

### Design questions

- **Audience and tone.** Who reads the new docs/comments — domain experts, new hires, future maintainers? Calibrate language accordingly; avoid generic AI register.
- **Specificity check.** Will the writing name concrete things (file paths, function names, exact behaviors) or hedge with abstractions ("various", "many", "robust")? Concrete wins.
- **Voice ownership.** Does the prose sound like someone on this team wrote it, or like a chatbot summary? If a sentence could appear in any project's docs unchanged, rewrite it.
- **Removal threshold.** For every comment the design adds, would a future reader be confused without it? If no, delete; rely on identifiers and types instead.

---

## Dimension Independence

Each dimension can be assessed in isolation. However, some findings may span multiple dimensions:

- A lazy fallback constructor (DIM-1: Topology) may also be a silent error (DIM-2: Observability)
- Dead code (DIM-5: Hygiene) may also be a test fidelity issue if tests reference it (DIM-4)
- AI-generated prose (DIM-8: Prose Quality) may also be a hygiene issue if it contains dead documentation (DIM-5)

When a finding spans dimensions, it should be reported under the **primary** dimension (the one most directly violated) with a cross-reference note. The `audit` skill handles deduplication when the same evidence appears under multiple dimensions.
