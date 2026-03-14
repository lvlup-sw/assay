# Readability Patterns Reference

Detection heuristics and severity guidance for code readability concerns beyond SOLID. These patterns address structural clarity at the function and expression level.

---

## DRY — Don't Repeat Yourself

### Definition

Every piece of knowledge should have a single, authoritative representation in the system. When the same logic appears in multiple places, a change to that logic requires finding and updating every copy — and missing one creates a bug.

### Violation Signals

1. Two or more functions with near-identical bodies differing only in variable names or literals
2. Copy-pasted conditional chains (same `if/else` structure with different field names)
3. Parallel data transformations that follow the same pattern but aren't abstracted
4. Test setup code duplicated across multiple test files without extraction into a shared fixture
5. Configuration or mapping objects repeated in multiple modules instead of imported from one source

### When Duplication Is Acceptable

Not all duplication violates DRY. Apply the **three uses rule** (see `@skills/distill/references/simplification-guide.md`):

- **First occurrence:** Write it inline. Do not extract.
- **Second occurrence:** Note the duplication but tolerate it. The pattern may be coincidental.
- **Third occurrence:** Extract. You now have enough examples to see the true shape of the abstraction.

**Also acceptable:**
- Test assertions that happen to look similar but test different behaviors — readability in tests often outweighs DRY
- Protocol handlers or route definitions that share structure but represent distinct endpoints — premature abstraction here creates "magic" dispatchers that are harder to understand
- Two-line utility patterns (e.g., null-check-and-return) — the abstraction would be longer than the duplication

### Severity Guide

| Severity | When to assign |
|----------|---------------|
| **HIGH** | Duplicated business logic where a bug fix applied to one copy but not the other would cause incorrect behavior. |
| **MEDIUM** | Duplicated structural patterns (>10 lines) across 3+ locations. The abstraction is clear but hasn't been extracted. |
| **LOW** | Minor duplication (<10 lines) in 2 locations. Extraction would add more complexity than it removes. |

### Detection Heuristics

- Look for functions with the same control flow structure but different variable names
- Search for identical error handling blocks across different catch clauses
- Check for repeated object construction patterns (same keys, different values)
- Compare test files for duplicated setup/teardown logic

---

## Early Returns and Guard Clauses

### Definition

Guard clauses handle edge cases and preconditions at the top of a function, returning or throwing early. This eliminates nesting and keeps the main logic path at the lowest indentation level.

### The Problem with Deep Nesting

```typescript
// Deep nesting — hard to follow
function processOrder(order: Order): Result {
  if (order) {
    if (order.items.length > 0) {
      if (order.customer) {
        if (order.customer.isActive) {
          // ... actual business logic buried at 4 levels deep
          const total = calculateTotal(order.items)
          return { success: true, total }
        } else {
          return { success: false, error: 'Inactive customer' }
        }
      } else {
        return { success: false, error: 'No customer' }
      }
    } else {
      return { success: false, error: 'Empty order' }
    }
  } else {
    return { success: false, error: 'No order' }
  }
}
```

```typescript
// Guard clauses — preconditions handled upfront, main path is flat
function processOrder(order: Order): Result {
  if (!order) return { success: false, error: 'No order' }
  if (order.items.length === 0) return { success: false, error: 'Empty order' }
  if (!order.customer) return { success: false, error: 'No customer' }
  if (!order.customer.isActive) return { success: false, error: 'Inactive customer' }

  const total = calculateTotal(order.items)
  return { success: true, total }
}
```

### Violation Signals

1. Functions with more than 3 levels of nesting
2. `else` branches that contain only a return or throw (invert the condition and return early)
3. Long `if` blocks followed by a short `else { return }` — the return should come first
4. Nested `if` chains where each level checks a single condition (collapse into sequential guards)
5. Functions where the main logic is indented 3+ levels deep

### When to Keep Nesting

- **Mutually exclusive branches with equal weight:** When both branches contain substantial logic (not just a return), `if/else` is clearer than early return
- **Loop bodies with `continue`:** Using `continue` as a guard clause inside loops is the same pattern and equally valid, but excessive `continue` statements can fragment loop logic
- **Transaction scoping:** When nesting represents a resource scope (e.g., `try` blocks wrapping database transactions), the nesting communicates the scope boundary

### Severity Guide

| Severity | When to assign |
|----------|---------------|
| **HIGH** | Function with 5+ levels of nesting. Main business logic is buried and hard to trace. |
| **MEDIUM** | Function with 3-4 levels of nesting that could be flattened with guard clauses. |
| **LOW** | Occasional unnecessary `else` after a return statement. Cosmetic but worth noting. |

### Detection Heuristics

- Measure maximum indentation depth per function — flag functions exceeding 3 levels
- Search for `else { return` or `else { throw` patterns — these can almost always be inverted
- Look for `if (condition) { ... long block ... } else { return }` — invert the condition
- Count the ratio of guard-eligible checks to actual guards in functions with preconditions

---

## Composition Over Inheritance

### Definition

Favor assembling behavior from small, focused components rather than building deep class hierarchies. Inheritance creates tight coupling between parent and child classes; composition allows flexible recombination.

### Why Inheritance Creates Problems

- **Fragile base class:** Changes to the parent class ripple into all children, even when irrelevant to their specific behavior
- **Forced inheritance of unwanted behavior:** Subclasses inherit all parent methods, even ones that don't apply (ISP violation in class form)
- **Diamond problem:** Multiple inheritance paths create ambiguity about which parent's behavior to use
- **Deep hierarchies obscure behavior:** Understanding what a class does requires reading the entire chain from root to leaf

### Violation Signals

1. Class hierarchies deeper than 2 levels (grandchild classes)
2. Subclasses that override >50% of parent methods (the "is-a" relationship is wrong)
3. Abstract base classes with only one concrete implementation (premature abstraction)
4. Classes that extend a base class only to access a utility method (use composition or a standalone function)
5. `super` calls that require understanding the parent's implementation details (leaky inheritance)
6. "Template method" patterns where the base class controls flow and subclasses fill in hooks — often better expressed as a function accepting strategy callbacks

### Composition Alternatives

**Instead of inheritance for shared behavior:**
```typescript
// Inheritance approach — tight coupling
class BaseRepository {
  async findById(id: string) { /* shared query logic */ }
  async save(entity: unknown) { /* shared persistence logic */ }
}
class UserRepository extends BaseRepository {
  async findByEmail(email: string) { /* user-specific */ }
}
```

```typescript
// Composition approach — flexible, testable
function createRepository(tableName: string) {
  return {
    findById: (id: string) => query(tableName, { id }),
    save: (entity: unknown) => upsert(tableName, entity),
  }
}

function createUserRepository() {
  const base = createRepository('users')
  return {
    ...base,
    findByEmail: (email: string) => query('users', { email }),
  }
}
```

**Instead of inheritance for variation:**
```typescript
// Strategy pattern via composition
interface PricingStrategy {
  calculate(items: Item[]): number
}

const standardPricing: PricingStrategy = {
  calculate: (items) => items.reduce((sum, i) => sum + i.price, 0)
}

const discountPricing: PricingStrategy = {
  calculate: (items) => items.reduce((sum, i) => sum + i.price * 0.9, 0)
}

// No inheritance needed — strategies are interchangeable values
function checkout(items: Item[], pricing: PricingStrategy) {
  return pricing.calculate(items)
}
```

### When Inheritance Is Appropriate

- **Framework requirements:** When a framework requires extending a base class (e.g., React class components, some ORM patterns). Use inheritance because the framework demands it, not by choice.
- **True "is-a" relationships with shared state:** When the parent class manages state that all subclasses genuinely need, and subclasses extend rather than override behavior.
- **Sealed hierarchies:** When the set of subclasses is closed and known (e.g., AST node types, event types). Inheritance + exhaustive pattern matching is a valid design.

### Severity Guide

| Severity | When to assign |
|----------|---------------|
| **HIGH** | Class hierarchy 3+ levels deep where subclasses override most parent behavior. The hierarchy is fighting against itself. |
| **MEDIUM** | Abstract base class with one implementation, or base class used primarily as a bag of utility methods. Composition would be simpler. |
| **LOW** | Shallow inheritance (1 level) that works but could be expressed as composition. Not causing active problems. |

### Detection Heuristics

- Count `extends` depth — flag hierarchies deeper than 2 levels
- Look for abstract classes with exactly one concrete subclass
- Search for `super.` calls in methods that also override the parent method — sign of fragile coupling
- Check if subclasses use <50% of inherited methods — the inheritance may be for convenience, not design
- Look for classes that extend a base class and immediately override the constructor to do something unrelated

---

## Parameter Discipline

### Long Parameter Lists

Functions with many parameters are hard to call correctly. The caller must remember the order, and boolean flags in the middle of a parameter list are especially error-prone.

**Violation signals:**
- Functions with more than 4 parameters
- Boolean parameters that aren't self-documenting at the call site
- Parameters that are always passed together (should be grouped into an object)

**Refactoring approaches:**
```typescript
// Before: positional parameters, unclear at call site
function createUser(name: string, email: string, isAdmin: boolean,
  sendWelcome: boolean, teamId: string | null) { ... }

createUser('Alice', 'a@b.com', true, false, 'team-1') // What do true, false mean?
```

```typescript
// After: options object, self-documenting
interface CreateUserOptions {
  name: string
  email: string
  isAdmin?: boolean
  sendWelcome?: boolean
  teamId?: string
}

function createUser(options: CreateUserOptions) { ... }

createUser({ name: 'Alice', email: 'a@b.com', isAdmin: true, teamId: 'team-1' })
```

### Boolean Parameters

Boolean parameters are a special case of poor readability. At the call site, `true` and `false` carry no meaning without reading the function signature.

**Alternatives:**
- Use an options object (as above)
- Use separate functions: `enableFeature()` / `disableFeature()` instead of `setFeature(enabled: boolean)`
- Use string literals or enums: `format('compact')` instead of `format(true)`

### Severity Guide

| Severity | When to assign |
|----------|---------------|
| **HIGH** | Function with 6+ parameters, especially if multiple are booleans. Call sites are unreadable. |
| **MEDIUM** | Function with 4-5 parameters where grouping into an object would improve clarity. |
| **LOW** | Function with a boolean parameter that could be more expressive but is only called in 1-2 places. |
