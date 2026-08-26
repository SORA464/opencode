# M0.6 — Compatibility Harness

> Executable: `harness/m0/compatibility.test.ts` — "current vs future" comparator used by every migration PR.

## 1. Design

For each subsystem the harness exposes `compare(subsystem, currentFn, futureFn)`:

```
record current behavior → record future behavior (behind flag) → diff
```

Current vs future are two code paths in the same process (flag-gated): e.g. legacy file handler vs
new kernel-registered handler. The harness runs both and asserts equivalence on contracted outputs.

Example (file containment):

```ts
await compare("file.list", 
  () => legacyList({path: "../.."}),      // expects 400
  () => kernelRegisteredList({path: "../.."}) // must also 400 with same error shape
)
```

## 2. Subsystems instrumented

- API contracts (17 groups): request validation, auth, error shapes
- Tool contracts (10 critical tools): valid/invalid inputs, permission gates, output caps, large output
- Event contracts: durable event round-trip per type/version (pending C3 prerequisite)
- Provider assembly: request shape + retry budget observable via `status` event
- Persistence: session create → kill → list survivors (crash harness)

## 3. What it detects

| Change | Detection |
|---|---|
| changed output | golden diff |
| changed contract (new required field) | schema validation error |
| changed API (route removed) | 404 vs 200 in comparator |
| changed persistence (lost session) | survivor count < created |
| changed error semantics (500 vs 400) | status-code assertion (hardened file handler case) |

## 4. Usage in migration

Every phase M1–M7 opens with `harness/m0/compatibility.ts` in flag-off mode (baseline), flips flag for the migrated path, and gates merge on zero diffs except explicitly approved golden updates (see `15-migration-safety-gates.md`).

