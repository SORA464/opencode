# M2.3 — Tool Registry (Kernel Authoritative)

> Implementation: `packages/kernel/src/tools/tool-registry.ts`

Registry is kernel-owned, version-aware, dependency-checked.

- **Discovery:** `discovery(): string[]` enumerates all registered ids — authoritative source for UI, prompt assembly, and `ctx.tools` seam.
- **Registration:** `register({id,version,tool,dependencies})` validates id regex, semver presence, and dependency graph (via `DependencyGraph`). Latest same-id wins; closing reveals prior (future: `Scope` finalizer).
- **Validation:** `validate()` checks id shape, version, missing deps, cycles. Called at load time and at `register` time.
- **Lifecycle:** `PENDING` (deps unsatisfied) → `ACTIVE` → `FAILED`/`DISPOSED`. Stored per entry.
- **Version awareness:** `version` field stored; future `engines.opencode-kernel` range check will use it.

Existing registries remain: `ApplicationTools` (process-scoped) and `Tools.Service` (Location-scoped) continue to function via compatibility bridge (see `09-compatibility-layer.md`). New registry is additive in M2; M4 makes it the sole source.

Verification: unit tests in `packages/kernel/src/tools/tool-registry.test.ts` (to be added in M2 verification) assert discovery, validation, cycle detection, and version tracking.

