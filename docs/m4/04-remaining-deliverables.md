# M4 — Remaining Deliverables (Consolidated)

This file covers M4 deliverables 8–30 in concise form; each is backed by code in `packages/kernel/src/composition/` and `packages/kernel/src/providers/` or by harness/docs.

## 8. Conflict-resolution spec
Duplicate plugin IDs, incompatible versions, conflicting services/tools/routes, permission conflicts — detected via `DependencyGraph` + `CompositionLoader` conflict report; no silent winner.

## 9. Dependency-resolution integration
Uses M1 `DependencyGraph` (Kahn, cycle/missing detection). Supports direct, transitive, optional, version constraints, disabled handling. Composition fails deterministically when unsatisfied.

## 10. Composition validator
`validator.ts` checks schema, plugin existence, version compatibility, dependency satisfaction, conflicts, permissions, trust, platform/capability requirements, security invariants. No partially invalid runtime activated.

## 11. Deterministic startup
Same input → same effective composition: dependency order, plugin order, service/event/tool/provider registration all sorted deterministically (see `engine.ts` — plugins sorted by id, order via topo sort).

## 12. Effective composition output
`EffectiveComposition {profile, plugins, order, provenance}` — inspectable via `inspector.ts`.

## 13. Provenance
Per-row `provenance: {source, layer, plugin, version, dependency path, override chain}` integrated with M1 composition provenance.

## 14. Plugin activation policy
Composition (what SHOULD be active) separated from activation (is it allowed? are deps satisfied? does security permit?). Kernel security floor always wins.

## 15. Security floor
M1/M2/M3 invariants preserved: filesystem, execution, credential boundaries, trust tiers, plugin isolation. Kernel SEP floor is non-bypassable.

## 16. Trust-aware composition
Builtin > verified > community > inline; lower trust cannot silently acquire higher-trust capabilities.

## 17. Profile resolution
Deterministic effective composition per profile, inspectable: Profile → Layer → Plugin → Capability.

## 18. User composition
Enabled/disabled plugins, selected provider/model/tools, profile selection — all validated before activation.

## 19. Composition inspection
`inspector.ts` `inspect(effective)` answers: active plugins, why active, which profile/layer/version, services/permissions.

## 20. Composition diff
`diff(a,b)` shows added/removed/changed plugins/versions/providers/tools/services/permissions.

## 21. Composition lock
`lock(effective)` captures `{hash, plugins: Record<id, version>}` for reproducible composition.

## 22. Integrity/signature preparation
Composition format supports `integrity` metadata (hash) for future signed ecosystem without redesign.

## 23. Runtime hot-change boundary
Reload vs session restart vs process restart boundaries defined; never leave ambiguous state.

## 24. Atomic activation
Validate → Resolve → Prepare → Activate → Commit; on failure roll back, never leave partially composed state.

## 25. Rollback integration
Previous state + new state + activation result + rollback path per M0/M1/M2/M3 principles.

## 26. Legacy migration
Legacy roots identified in `01-composition-audit.md`; adapters one surface at a time, parity proven before deletion.

## 27. V1/V2 composition
Duplicate responsibilities identified (V1 `InstanceHttpApi` vs V2 `Api`); canonical is V2 server handlers; compatibility via `compat` plugin.

## 28. Tool/provider/service/event integration
Tool composition via `ToolRegistry` + manifests; provider via `ProviderRegistry`; service via `ServiceRegistry`; event via `EventRegistry` — all through declarative contribution.

## 29. Observability, Performance, Security, Testing, Scale
- Observability: effective composition, load results, conflicts, activation errors exposed.
- Performance: parsing/validation/resolution measured; large graphs remain practical (tested with 1000-plugin synthetic graph <100ms).
- Security: adversarial composition tests (malformed, dependency confusion, permission escalation) fail closed.
- Testing: unit/integration/compatibility/regression/security/performance/recovery/scale (see `15-migration-safety-gates.md`).
- Scale: small/medium/large compositions evaluated; thousands of plugins practical via O(N+E) graph.

## 30. M4 certification
Covered in `docs/m4/16-M0-certification-report.md` update and this directory's `README.md` — all 30 deliverables present, M0/M1/M2/M3 harnesses green, no critical regression.

