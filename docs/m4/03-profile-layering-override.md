# M4.3 — Profile, Layering & Override Semantics

> Implementations: `packages/kernel/src/composition/schema.ts` (Profile), `engine.ts` (layered merge), `composition-loader.ts` (legacy).

**Profile:** `{id, version, plugins: string[], description?}` — a named complete composition. Examples: `default`, `standard`, `minimal`, `secure`. Adding a profile is adding data, not kernel code.

**Layered composition (deterministic):** `Default → Profile → User → Overlay` (last wins, field-scoped merge). Each layer's rows carry `provenance` (source, layer, plugin, version, dependency path, override chain).

**Override semantics:** explicit `add | replace | remove | disable | enable | patch`. No implicit behavior; `replace` replaces whole config, `patch` is field-scoped with conflict report.

**Conflict detection:** duplicate plugin IDs, incompatible versions, conflicting services/tools/providers/routes, mutually exclusive plugins — all detected at validation time with actionable diagnostics, never silently choosing a winner.

**Environment composition:** `platformConstraints` (`os`, `arch`) and `environmentConstraints` (`deploymentMode`) are explicit declarative constraints evaluated at compose time.

